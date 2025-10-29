import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, ebooks, InsertEbook, publishingGuides, InsertPublishingGuide, schedules, InsertSchedule, ebookMetadata, InsertEbookMetadata, publications, InsertPublication, financialMetrics, InsertFinancialMetric } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// ===== EbookFiles Helpers =====

export async function createEbookFile(file: {
  ebookId: number;
  languageCode: string;
  epubUrl?: string;
  pdfUrl?: string;
  coverUrl?: string;
  status?: "processing" | "completed" | "failed";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { ebookFiles } = await import("../drizzle/schema");
  const result = await db.insert(ebookFiles).values(file);
  return Number(result[0].insertId);
}

export async function getEbookFilesByEbookId(ebookId: number) {
  const db = await getDb();
  if (!db) return [];

  const { ebookFiles } = await import("../drizzle/schema");
  return await db.select().from(ebookFiles).where(eq(ebookFiles.ebookId, ebookId));
}

export async function getEbookFile(ebookId: number, languageCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const { ebookFiles } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(ebookFiles)
    .where(and(eq(ebookFiles.ebookId, ebookId), eq(ebookFiles.languageCode, languageCode)))
    .limit(1);
  return result[0];
}

export async function updateEbookFileStatus(
  id: number,
  status: "processing" | "completed" | "failed",
  updates?: { epubUrl?: string; pdfUrl?: string; coverUrl?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { ebookFiles } = await import("../drizzle/schema");
  await db
    .update(ebookFiles)
    .set({ status, ...updates })
    .where(eq(ebookFiles.id, id));
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// eBook queries
export async function createEbook(ebook: InsertEbook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ebooks).values(ebook);
  return result[0].insertId;
}

export async function getEbookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ebooks).where(eq(ebooks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEbooksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ebooks).where(eq(ebooks.userId, userId)).orderBy(ebooks.createdAt);
}

export async function updateEbookStatus(id: number, status: "processing" | "completed" | "failed", data?: Partial<InsertEbook>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ebooks).set({ status, ...data, updatedAt: new Date() }).where(eq(ebooks.id, id));
}

// Publishing guides queries
export async function createPublishingGuide(guide: InsertPublishingGuide) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(publishingGuides).values(guide);
  return result[0].insertId;
}

export async function getPublishingGuidesByEbookId(ebookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishingGuides).where(eq(publishingGuides.ebookId, ebookId));
}

export async function updatePublishingGuide(id: number, data: Partial<InsertPublishingGuide>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(publishingGuides).set({ ...data, updatedAt: new Date() }).where(eq(publishingGuides.id, id));
}

// Schedule queries
export async function createSchedule(schedule: InsertSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schedules).values(schedule);
  return result[0].insertId;
}

export async function getSchedulesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schedules).where(eq(schedules.userId, userId)).orderBy(schedules.createdAt);
}

export async function getScheduleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSchedule(id: number, data: Partial<InsertSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(schedules).set({ ...data, updatedAt: new Date() }).where(eq(schedules.id, id));
}

export async function deleteSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(schedules).where(eq(schedules.id, id));
}

// Ebook metadata queries
export async function createEbookMetadata(metadata: InsertEbookMetadata) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ebookMetadata).values(metadata);
  return result[0].insertId;
}

export async function getEbookMetadataByEbookId(ebookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ebookMetadata).where(eq(ebookMetadata.ebookId, ebookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEbookMetadata(id: number, data: Partial<InsertEbookMetadata>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ebookMetadata).set({ ...data, updatedAt: new Date() }).where(eq(ebookMetadata.id, id));
}

// Publications
export async function getPublicationsByEbookId(ebookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publications).where(eq(publications.ebookId, ebookId));
}

export async function createPublication(data: InsertPublication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(publications).values(data) as any;
  return Number(result.insertId);
}

export async function deletePublication(ebookId: number, platform: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(publications).where(
    and(
      eq(publications.ebookId, ebookId),
      eq(publications.platform, platform as any)
    )
  );
}

export async function updatePublication(ebookId: number, platform: string, data: Partial<InsertPublication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(publications)
    .set(data)
    .where(
      and(
        eq(publications.ebookId, ebookId),
        eq(publications.platform, platform as any)
      )
    );
}

// Financial Metrics
export async function getFinancialMetricsByEbookId(ebookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(financialMetrics).where(eq(financialMetrics.ebookId, ebookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFinancialMetrics(data: InsertFinancialMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(financialMetrics).values(data) as any;
  return Number(result.insertId);
}

export async function updateFinancialMetrics(ebookId: number, data: Partial<InsertFinancialMetric>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if exists
  const existing = await getFinancialMetricsByEbookId(ebookId);
  
  if (existing) {
    await db.update(financialMetrics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(financialMetrics.ebookId, ebookId));
  } else {
    await createFinancialMetrics({ ebookId, ...data });
  }
}
