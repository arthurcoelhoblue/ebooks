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
});

export type AppRouter = typeof appRouter;
