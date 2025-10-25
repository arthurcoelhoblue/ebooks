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

      // Create ebook record
      const ebookResult = await db.insert(ebooks).values({
        userId: schedule.userId,
        title: `eBook sobre ${theme}`,
        theme,
        author: schedule.author,
        status: "processing",
      });

      const ebookId = ebookResult[0].insertId;

      // Generate ebook asynchronously
      (async () => {
        try {
          // Generate content
          const generatedBook = await generateEbookContent(theme, 5);
          const htmlContent = compileToHTML(generatedBook.title, schedule.author, generatedBook.chapters);

          // Generate cover
          const coverPrompt = generateCoverPrompt(generatedBook.title, theme);
          const { url: coverUrl } = await generateImage({ prompt: coverPrompt });

          // Upload files
          const htmlBuffer = Buffer.from(htmlContent, "utf-8");
          const { url: pdfUrl } = await storagePut(
            `ebooks/${schedule.userId}/${ebookId}/ebook.html`,
            htmlBuffer,
            "text/html"
          );

          const { url: epubUrl } = await storagePut(
            `ebooks/${schedule.userId}/${ebookId}/ebook-preview.html`,
            htmlBuffer,
            "text/html"
          );

          // Generate metadata
          const contentPreview = generatedBook.chapters.map(c => c.content).join(" ").substring(0, 1000);
          const metadata = await generateEbookMetadata(generatedBook.title, theme, contentPreview);

          // Save metadata
          const { createEbookMetadata } = await import("./db");
          await createEbookMetadata({
            ebookId,
            optimizedTitle: metadata.optimizedTitle,
            shortDescription: metadata.shortDescription,
            longDescription: metadata.longDescription,
            keywords: JSON.stringify(metadata.keywords),
            categories: JSON.stringify(metadata.categories),
            suggestedPrice: metadata.suggestedPrice,
            targetAudience: metadata.targetAudience,
          });

          // Update ebook status
          await db
            .update(ebooks)
            .set({
              status: "completed",
              title: generatedBook.title,
              epubUrl,
              pdfUrl,
              coverUrl,
              content: JSON.stringify(generatedBook.chapters),
            })
            .where(eq(ebooks.id, ebookId));

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

