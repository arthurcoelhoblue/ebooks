import { getDb } from "./db";
import { schedules, ebooks } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { generateEbookContent, compileToHTML, generateCoverPrompt } from "./ebookGenerator";
import { generateEbookMetadata } from "./metadataGenerator";
import { getNextTrendingTopic } from "./trendingTopics";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

/**
 * Processes scheduled ebook generations
 * This should be called by a cron job or background worker
 */
export async function processSchedules() {
  const db = await getDb();
  if (!db) {
    console.log("[Scheduler] Database not available");
    return;
  }

  const now = new Date();
  
  // Find active schedules that are due
  const dueSchedules = await db
    .select()
    .from(schedules)
    .where(
      and(
        eq(schedules.active, 1),
        lte(schedules.nextRunAt, now)
      )
    );

  console.log(`[Scheduler] Found ${dueSchedules.length} due schedules`);

  for (const schedule of dueSchedules) {
    try {
      // Check if we've reached the total
      if (schedule.generatedCount >= schedule.totalEbooks) {
        console.log(`[Scheduler] Schedule ${schedule.id} completed, deactivating`);
        await db
          .update(schedules)
          .set({ active: 0 })
          .where(eq(schedules.id, schedule.id));
        continue;
      }

      // Determine the theme for this ebook
      let theme: string;
      
      if (schedule.themeMode === "single_theme") {
        theme = schedule.singleTheme || "Marketing Digital";
      } else if (schedule.themeMode === "custom_list") {
        const themesList = schedule.themes ? JSON.parse(schedule.themes) : [];
        const index = schedule.generatedCount % themesList.length;
        theme = themesList[index] || "Marketing Digital";
      } else {
        // trending mode
        theme = await getNextTrendingTopic();
      }

      console.log(`[Scheduler] Generating ebook for schedule ${schedule.id} with theme: ${theme}`);

      // Parse languages from schedule
      const languageCodes = schedule.languages ? schedule.languages.split(",").map(l => l.trim()).filter(Boolean) : ["pt"];
      if (languageCodes.length === 0) {
        languageCodes.push("pt");
      }

      // Create ebook record
      const ebookResult = await db.insert(ebooks).values({
        userId: schedule.userId,
        title: `eBook sobre ${theme}`,
        theme,
        author: schedule.author,
        status: "processing",
        languages: schedule.languages || "pt",
      });

      const ebookId = ebookResult[0].insertId;

      // Generate ebook asynchronously with multi-language support
      (async () => {
        try {
          const { generateMultiLanguageEbook } = await import("./multiLanguageGenerator");
          const { createEbookFile, createEbookMetadata } = await import("./db");

          // Generate files for all languages
          const languageFiles = await generateMultiLanguageEbook(
            theme,
            schedule.author,
            5,
            languageCodes,
            schedule.userId,
            ebookId
          );

          // Save each language file to database
          for (const file of languageFiles) {
            await createEbookFile({
              ebookId,
              languageCode: file.languageCode,
              epubUrl: file.epubUrl,
              pdfUrl: file.pdfUrl,
              coverUrl: file.coverUrl,
              status: "completed",
            });
          }

          // Use first language for main eBook record
          const primaryFile = languageFiles[0];
          if (primaryFile) {
            // Generate metadata
            const contentPreview = "";
            const metadata = await generateEbookMetadata(primaryFile.title, theme, contentPreview);
            
            await createEbookMetadata({
              ebookId,
              optimizedTitle: metadata.optimizedTitle,
              shortDescription: metadata.shortDescription,
              longDescription: metadata.longDescription,
              keywords: JSON.stringify(metadata.keywords),
              categories: JSON.stringify(metadata.categories),
              suggestedPrice: metadata.suggestedPrice,
              targetAudience: metadata.targetAudience,
              platformRecommendations: JSON.stringify(metadata.platformRecommendations || []),
            });

            // Update ebook status
            await db
              .update(ebooks)
              .set({
                status: "completed",
                title: primaryFile.title,
                epubUrl: primaryFile.epubUrl,
                pdfUrl: primaryFile.pdfUrl,
                coverUrl: primaryFile.coverUrl,
              })
              .where(eq(ebooks.id, ebookId));
          }

          console.log(`[Scheduler] Successfully generated ebook ${ebookId}`);
        } catch (error: any) {
          console.error(`[Scheduler] Error generating ebook ${ebookId}:`, error);
          await db
            .update(ebooks)
            .set({
              status: "failed",
              errorMessage: error.message,
            })
            .where(eq(ebooks.id, ebookId));
        }
      })();

      // Update schedule - calculate next run time
      const nextRunAt = new Date(now);
      
      if (schedule.scheduledTime) {
        // If there's a scheduled time, use it
        const [hours, minutes] = schedule.scheduledTime.split(":").map(Number);
        nextRunAt.setHours(hours, minutes, 0, 0);
      }
      
      // Add the frequency interval
      if (schedule.frequency === "daily") {
        nextRunAt.setDate(nextRunAt.getDate() + 1);
      } else if (schedule.frequency === "weekly") {
        nextRunAt.setDate(nextRunAt.getDate() + 7);
      } else {
        nextRunAt.setMonth(nextRunAt.getMonth() + 1);
      }

      await db
        .update(schedules)
        .set({
          generatedCount: schedule.generatedCount + 1,
          lastRunAt: now,
          nextRunAt,
        })
        .where(eq(schedules.id, schedule.id));

      console.log(`[Scheduler] Updated schedule ${schedule.id}, next run at ${nextRunAt}`);
    } catch (error) {
      console.error(`[Scheduler] Error processing schedule ${schedule.id}:`, error);
    }
  }
}

/**
 * Manual trigger for testing - processes a specific schedule immediately
 */
export async function triggerScheduleNow(scheduleId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Temporarily set nextRunAt to now
  await db
    .update(schedules)
    .set({ nextRunAt: new Date() })
    .where(eq(schedules.id, scheduleId));

  // Process schedules
  await processSchedules();
}



/**
 * Starts the scheduler worker that runs every minute
 */
export function startSchedulerWorker() {
  console.log("[Scheduler] Starting scheduler worker...");
  
  // Run immediately on startup
  processSchedules().catch(error => {
    console.error("[Scheduler] Error in initial run:", error);
  });
  
  // Then run every minute
  setInterval(() => {
    processSchedules().catch(error => {
      console.error("[Scheduler] Error in scheduled run:", error);
    });
  }, 60000); // 60 seconds = 1 minute
  
  console.log("[Scheduler] Worker started - checking schedules every minute");
}

