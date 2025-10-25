import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ebooks: router({
    // List all ebooks for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getEbooksByUserId } = await import("./db");
      return getEbooksByUserId(ctx.user.id);
    }),

    // Get single ebook by ID
    getById: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return { id: val.id };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const { getEbookById } = await import("./db");
        const ebook = await getEbookById(input.id);
        if (!ebook || ebook.userId !== ctx.user.id) {
          throw new Error("Ebook not found");
        }
        return ebook;
      }),

    // Create new ebook (starts generation)
    create: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "theme" in val &&
          typeof val.theme === "string" &&
          "author" in val &&
          typeof val.author === "string"
        ) {
          return {
            theme: val.theme,
            author: val.author,
            numChapters: "numChapters" in val && typeof val.numChapters === "number" ? val.numChapters : 5,
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createEbook } = await import("./db");
        const { generateEbookContent, compileToHTML } = await import("./ebookGenerator");

        // Create initial ebook record
        const ebookId = await createEbook({
          userId: ctx.user.id,
          title: `eBook sobre ${input.theme}`,
          theme: input.theme,
          author: input.author,
          status: "processing",
        });

        // Start async generation (in production, this would be a queue job)
        // For now, we'll do it synchronously but in a real app use RQ/Celery
        (async () => {
          try {
            const { updateEbookStatus } = await import("./db");
            const { generateImage } = await import("./_core/imageGeneration");
            const { storagePut } = await import("./storage");

            // Generate content
            const generatedBook = await generateEbookContent(input.theme, input.numChapters);
            const htmlContent = compileToHTML(generatedBook.title, input.author, generatedBook.chapters);

            // Generate cover
            const { generateCoverPrompt } = await import("./ebookGenerator");
            const coverPrompt = generateCoverPrompt(generatedBook.title, input.theme);
            const { url: coverUrl } = await generateImage({ prompt: coverPrompt });

            // Upload HTML as "PDF" (in production, convert to actual PDF)
            const htmlBuffer = Buffer.from(htmlContent, "utf-8");
            const { url: pdfUrl } = await storagePut(
              `ebooks/${ctx.user.id}/${ebookId}/ebook.html`,
              htmlBuffer,
              "text/html"
            );

            // For EPUB, we'd use a library like ebooklib equivalent in Node.js
            // For now, we'll just store the HTML
            const { url: epubUrl } = await storagePut(
              `ebooks/${ctx.user.id}/${ebookId}/ebook-preview.html`,
              htmlBuffer,
              "text/html"
            );

            // Generate metadata
            const { generateEbookMetadata } = await import("./metadataGenerator");
            const { createEbookMetadata } = await import("./db");
            const contentPreview = generatedBook.chapters.map(c => c.content).join(" ").substring(0, 1000);
            const metadata = await generateEbookMetadata(generatedBook.title, input.theme, contentPreview);
            
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

            // Update ebook with results
            await updateEbookStatus(ebookId, "completed", {
              title: generatedBook.title,
              epubUrl,
              pdfUrl,
              coverUrl,
              content: JSON.stringify(generatedBook.chapters),
            });
          } catch (error: any) {
            const { updateEbookStatus } = await import("./db");
            await updateEbookStatus(ebookId, "failed", {
              errorMessage: error.message,
            });
          }
        })();

        return { id: ebookId, status: "processing" };
      }),
  }),

  publishingGuides: router({
    // Get guides for an ebook
    getByEbookId: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "ebookId" in val && typeof val.ebookId === "number") {
          return { ebookId: val.ebookId };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { getPublishingGuidesByEbookId } = await import("./db");
        return getPublishingGuidesByEbookId(input.ebookId);
      }),

    // Update guide checklist
    updateChecklist: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "id" in val &&
          typeof val.id === "number" &&
          "checklist" in val &&
          typeof val.checklist === "string"
        ) {
          return { id: val.id, checklist: val.checklist };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { updatePublishingGuide } = await import("./db");
        await updatePublishingGuide(input.id, { checklist: input.checklist });
        return { success: true };
      }),

    // Mark guide as completed
    markCompleted: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "id" in val &&
          typeof val.id === "number" &&
          "completed" in val &&
          typeof val.completed === "boolean"
        ) {
          return { id: val.id, completed: val.completed };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { updatePublishingGuide } = await import("./db");
        await updatePublishingGuide(input.id, { completed: input.completed ? 1 : 0 });
        return { success: true };
      }),
  }),

  schedules: router({
    // List all schedules for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getSchedulesByUserId } = await import("./db");
      return getSchedulesByUserId(ctx.user.id);
    }),

    // Create new schedule
    create: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "name" in val &&
          typeof val.name === "string" &&
          "frequency" in val &&
          typeof val.frequency === "string" &&
          "totalEbooks" in val &&
          typeof val.totalEbooks === "number" &&
          "themeMode" in val &&
          typeof val.themeMode === "string" &&
          "author" in val &&
          typeof val.author === "string"
        ) {
          return {
            name: val.name,
            frequency: val.frequency as "daily" | "weekly" | "monthly",
            totalEbooks: val.totalEbooks,
            themeMode: val.themeMode as "custom_list" | "single_theme" | "trending",
            themes: "themes" in val && typeof val.themes === "string" ? val.themes : undefined,
            singleTheme: "singleTheme" in val && typeof val.singleTheme === "string" ? val.singleTheme : undefined,
            author: val.author,
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createSchedule } = await import("./db");
        
        // Calculate next run time
        const now = new Date();
        const nextRunAt = new Date(now);
        if (input.frequency === "daily") {
          nextRunAt.setDate(nextRunAt.getDate() + 1);
        } else if (input.frequency === "weekly") {
          nextRunAt.setDate(nextRunAt.getDate() + 7);
        } else {
          nextRunAt.setMonth(nextRunAt.getMonth() + 1);
        }

        const scheduleId = await createSchedule({
          userId: ctx.user.id,
          name: input.name,
          frequency: input.frequency,
          totalEbooks: input.totalEbooks,
          themeMode: input.themeMode,
          themes: input.themes,
          singleTheme: input.singleTheme,
          author: input.author,
          active: 1,
          nextRunAt,
        });

        return { id: scheduleId };
      }),

    // Delete schedule
    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return { id: val.id };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { deleteSchedule } = await import("./db");
        await deleteSchedule(input.id);
        return { success: true };
      }),

    // Get trending topics
    getTrendingTopics: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null) {
          return {
            category: "category" in val && typeof val.category === "string" ? val.category : undefined,
            count: "count" in val && typeof val.count === "number" ? val.count : 5,
          };
        }
        return { category: undefined, count: 5 };
      })
      .query(async ({ input }) => {
        const { findTrendingTopics } = await import("./trendingTopics");
        return findTrendingTopics(input.category, input.count);
      }),

    // Trigger schedule manually (for testing)
    triggerNow: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "scheduleId" in val && typeof val.scheduleId === "number") {
          return { scheduleId: val.scheduleId };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { getScheduleById } = await import("./db");
        const schedule = await getScheduleById(input.scheduleId);
        
        if (!schedule || schedule.userId !== ctx.user.id) {
          throw new Error("Schedule not found");
        }

        const { triggerScheduleNow } = await import("./schedulerWorker");
        await triggerScheduleNow(input.scheduleId);
        
        return { success: true, message: "eBook sendo gerado! Aguarde alguns minutos." };
      }),
  }),

  metadata: router({
    // Get metadata for an ebook
    getByEbookId: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "ebookId" in val && typeof val.ebookId === "number") {
          return { ebookId: val.ebookId };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { getEbookMetadataByEbookId } = await import("./db");
        const metadata = await getEbookMetadataByEbookId(input.ebookId);
        if (!metadata) return null;
        
        // Parse JSON fields
        return {
          ...metadata,
          keywords: metadata.keywords ? JSON.parse(metadata.keywords) : [],
          categories: metadata.categories ? JSON.parse(metadata.categories) : [],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
