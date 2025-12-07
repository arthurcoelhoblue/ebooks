import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
    reprocessAll: protectedProcedure.mutation(async () => {
      const { reprocessAllEbooks } = await import("./reprocessEbooks");
      const result = await reprocessAllEbooks();
      return result;
    }),
    // List all ebooks for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getEbooksByUserId } = await import("./db");
      return getEbooksByUserId(ctx.user.id);
    }),

    // Get single ebook by ID
    getFiles: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return { id: val.id };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const { assertEbookOwner, getEbookFilesByEbookId } = await import("./db");
        await assertEbookOwner(input.id, ctx.user.id);
        return await getEbookFilesByEbookId(input.id);
      }),

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
          typeof val.author === "string" &&
          "numChapters" in val &&
          typeof val.numChapters === "number"
        ) {
          const languages = "languages" in val && typeof val.languages === "string" ? val.languages : "pt";
          return { theme: val.theme, author: val.author, numChapters: val.numChapters, languages };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createEbook } = await import("./db");
        const { generateEbookContent, compileToHTML } = await import("./ebookGenerator");

        // Parse languages
        const languageCodes = input.languages.split(",").map(l => l.trim()).filter(Boolean);
        if (languageCodes.length === 0) {
          languageCodes.push("pt"); // Default to Portuguese
        }

        // Create initial ebook record
        const ebookId = await createEbook({
          userId: ctx.user.id,
          title: `eBook sobre ${input.theme}`,
          theme: input.theme,
          author: input.author,
          status: "processing",
          languages: input.languages,
        });

        // Start async generation for all languages
        (async () => {
          try {
            const { updateEbookStatus, createEbookFile } = await import("./db");
            const { generateMultiLanguageWinnerEbook } = await import("./multiLanguageGeneratorWinner");

            // Generate files for all languages using WINNER structure
            const languageFiles = await generateMultiLanguageWinnerEbook(
              input.theme,
              input.author,
              languageCodes,
              ctx.user.id,
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
              // Generate metadata using primary language
              const { generateEbookMetadata } = await import("./metadataGenerator");
              const { createEbookMetadata, getEbookById } = await import("./db");
              
              const ebook = await getEbookById(ebookId);
              const contentPreview = ebook?.content ? JSON.parse(ebook.content).map((c: any) => c.content).join(" ").substring(0, 1000) : "";
              const metadata = await generateEbookMetadata(primaryFile.title, input.theme, contentPreview);
              
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

              // Update main ebook record
              await updateEbookStatus(ebookId, "completed", {
                title: primaryFile.title,
                epubUrl: primaryFile.epubUrl,
                pdfUrl: primaryFile.pdfUrl,
                coverUrl: primaryFile.coverUrl,
              });
            }
          } catch (error: any) {
            console.error("Error generating multi-language ebook:", error);
            const { updateEbookStatus } = await import("./db");
            await updateEbookStatus(ebookId, "failed", {
              errorMessage: error.message,
            });
          }
        })();

        return { id: ebookId, status: "processing" };
      }),

    // Delete ebook and all related data
    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return { id: val.id };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { getEbookById, deleteEbook } = await import("./db");
        
        // Verify ownership
        const ebook = await getEbookById(input.id);
        if (!ebook || ebook.userId !== ctx.user.id) {
          throw new Error("Ebook not found or unauthorized");
        }
        
        // Delete ebook and all related data (cascade)
        await deleteEbook(input.id);
        return { success: true };
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
            scheduledTime: "scheduledTime" in val && typeof val.scheduledTime === "string" ? val.scheduledTime : undefined,
            languages: "languages" in val && typeof val.languages === "string" ? val.languages : "pt",
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createSchedule } = await import("./db");
        
        // Calculate next run time
        const now = new Date();
        const nextRunAt = new Date(now);
        
        // If scheduledTime is provided, set the time
        if (input.scheduledTime) {
          const [hours, minutes] = input.scheduledTime.split(":").map(Number);
          nextRunAt.setHours(hours, minutes, 0, 0);
          
          // If the time has already passed today, move to next occurrence
          if (nextRunAt <= now) {
            if (input.frequency === "daily") {
              nextRunAt.setDate(nextRunAt.getDate() + 1);
            } else if (input.frequency === "weekly") {
              nextRunAt.setDate(nextRunAt.getDate() + 7);
            } else {
              nextRunAt.setMonth(nextRunAt.getMonth() + 1);
            }
          }
        } else {
          // No specific time, just add the interval
          if (input.frequency === "daily") {
            nextRunAt.setDate(nextRunAt.getDate() + 1);
          } else if (input.frequency === "weekly") {
            nextRunAt.setDate(nextRunAt.getDate() + 7);
          } else {
            nextRunAt.setMonth(nextRunAt.getMonth() + 1);
          }
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
          scheduledTime: input.scheduledTime,
          languages: input.languages,
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

  publications: router({
    // List all publications
    listAll: protectedProcedure.query(async ({ ctx }) => {
      // Return empty array for now - will be populated when publications exist
      return [];
    }),
    // Get publications for an ebook
    getByEbookId: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "ebookId" in val && typeof val.ebookId === "number") {
          return { ebookId: val.ebookId };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const { assertEbookOwner, getPublicationsByEbookId } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        return getPublicationsByEbookId(input.ebookId);
      }),

    // Mark ebook as published on a platform
    publish: protectedProcedure
      .input(z.object({
        ebookId: z.number(),
        platform: z.enum(["amazon_kdp", "hotmart", "eduzz", "monetizze"]),
        publicationUrl: z.string().optional(),
        trafficCost: z.string().optional(),
        otherCosts: z.string().optional(),
        revenue: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { assertEbookOwner, createPublication } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        await createPublication({
          ebookId: input.ebookId,
          platform: input.platform,
          publicationUrl: input.publicationUrl,
          trafficCost: input.trafficCost,
          otherCosts: input.otherCosts,
          revenue: input.revenue,
        });
        return { success: true };
      }),

    // Remove publication
    delete: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "ebookId" in val &&
          typeof val.ebookId === "number" &&
          "platform" in val &&
          typeof val.platform === "string"
        ) {
          return { ebookId: val.ebookId, platform: val.platform };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { assertEbookOwner, deletePublication } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        await deletePublication(input.ebookId, input.platform);
        return { success: true };
      }),
  }),

  financial: router({
    // Get financial metrics for an ebook
    getByEbookId: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "ebookId" in val && typeof val.ebookId === "number") {
          return { ebookId: val.ebookId };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input, ctx }) => {
        const { assertEbookOwner, getFinancialMetricsByEbookId } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        return getFinancialMetricsByEbookId(input.ebookId);
      }),

    // Update financial metrics
    update: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "ebookId" in val &&
          typeof val.ebookId === "number"
        ) {
          return {
            ebookId: val.ebookId,
            trafficCost: "trafficCost" in val && typeof val.trafficCost === "string" ? val.trafficCost : undefined,
            otherCosts: "otherCosts" in val && typeof val.otherCosts === "string" ? val.otherCosts : undefined,
            revenue: "revenue" in val && typeof val.revenue === "string" ? val.revenue : undefined,
            notes: "notes" in val && typeof val.notes === "string" ? val.notes : undefined,
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { assertEbookOwner, updateFinancialMetrics } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        const { ebookId, ...data } = input;
        await updateFinancialMetrics(ebookId, data);
        return { success: true };
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
      .query(async ({ input, ctx }) => {
        const { assertEbookOwner, getEbookMetadataByEbookId } = await import("./db");
        await assertEbookOwner(input.ebookId, ctx.user.id);
        const metadata = await getEbookMetadataByEbookId(input.ebookId);
        if (!metadata) return null;
        
        // Parse JSON fields
        return {
          ...metadata,
          keywords: metadata.keywords ? JSON.parse(metadata.keywords) : [],
          categories: metadata.categories ? JSON.parse(metadata.categories) : [],
        };
      }),

    // Get platform recommendations for an ebook
    getPlatformRecommendations: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "theme" in val &&
          typeof val.theme === "string" &&
          "title" in val &&
          typeof val.title === "string"
        ) {
          return {
            theme: val.theme,
            title: val.title,
            description: "description" in val && typeof val.description === "string" ? val.description : undefined,
          };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { analyzePlatformRecommendations } = await import("./platformRecommender");
        return await analyzePlatformRecommendations(input.theme, input.title, input.description);
      }),
  }),
});

export type AppRouter = typeof appRouter;
