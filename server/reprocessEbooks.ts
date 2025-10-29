import { getDb } from "./db";
import { ebooks } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateMultiLanguageEbook } from "./multiLanguageGenerator";
import { createEbookFile } from "./db";

/**
 * Reprocess all existing eBooks to generate multi-language files
 * This script should be run once to backfill translations for existing eBooks
 */
export async function reprocessAllEbooks() {
  const db = await getDb();
  if (!db) {
    console.log("[Reprocess] Database not available");
    return;
  }

  // Get all completed eBooks
  const allEbooks = await db
    .select()
    .from(ebooks)
    .where(eq(ebooks.status, "completed"));

  console.log(`[Reprocess] Found ${allEbooks.length} eBooks to reprocess`);

  let processed = 0;
  let failed = 0;

  for (const ebook of allEbooks) {
    try {
      console.log(`[Reprocess] Processing eBook ${ebook.id}: ${ebook.title}`);

      // Parse languages (default to pt if not set)
      const languageCodes = ebook.languages 
        ? ebook.languages.split(",").map(l => l.trim()).filter(Boolean)
        : ["pt"];

      if (languageCodes.length === 0) {
        languageCodes.push("pt");
      }

      // Check if files already exist for this ebook
      const { getEbookFilesByEbookId } = await import("./db");
      const existingFiles = await getEbookFilesByEbookId(ebook.id);
      
      if (existingFiles && existingFiles.length > 0) {
        console.log(`[Reprocess] eBook ${ebook.id} already has ${existingFiles.length} language files, skipping`);
        continue;
      }

      // Generate files for all languages
      const languageFiles = await generateMultiLanguageEbook(
        ebook.theme || "Marketing Digital",
        ebook.author || "Arthur Coelho",
        5,
        languageCodes,
        ebook.userId,
        ebook.id
      );

      // Save each language file to database
      for (const file of languageFiles) {
        await createEbookFile({
          ebookId: ebook.id,
          languageCode: file.languageCode,
          epubUrl: file.epubUrl,
          pdfUrl: file.pdfUrl,
          coverUrl: file.coverUrl,
          status: "completed",
        });
      }

      processed++;
      console.log(`[Reprocess] Successfully processed eBook ${ebook.id} (${processed}/${allEbooks.length})`);

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      failed++;
      console.error(`[Reprocess] Error processing eBook ${ebook.id}:`, error.message);
    }
  }

  console.log(`[Reprocess] Completed! Processed: ${processed}, Failed: ${failed}`);
  return { processed, failed, total: allEbooks.length };
}

