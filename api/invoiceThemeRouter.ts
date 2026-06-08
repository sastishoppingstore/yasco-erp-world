import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery, userAdminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

const DEFAULT_THEMES = [
  {
    name: "Classic Box",
    nameAr: "صندوق كلاسيكي",
    themeKey: "classic-box",
    config: {
      borderStyle: "boxed",
      colorScheme: "professional-blue",
      headerBg: "#1e40af",
      headerText: "#ffffff",
      accentColor: "#2563eb",
      fontFamily: "Inter",
      showBorders: true,
      borderRadius: "8px",
      tableStyle: "striped",
    },
  },
  {
    name: "Modern Clean",
    nameAr: "نظيف حديث",
    themeKey: "modern-clean",
    config: {
      borderStyle: "minimal",
      colorScheme: "slate",
      headerBg: "#0f172a",
      headerText: "#ffffff",
      accentColor: "#64748b",
      fontFamily: "Inter",
      showBorders: false,
      borderRadius: "0px",
      tableStyle: "clean",
    },
  },
  {
    name: "3D Color",
    nameAr: "ثلاثي الأبعاد",
    themeKey: "3d-color",
    config: {
      borderStyle: "gradient",
      colorScheme: "gradient-vibrant",
      headerBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      headerText: "#ffffff",
      accentColor: "#667eea",
      fontFamily: "Inter",
      showBorders: true,
      borderRadius: "12px",
      tableStyle: "colorful",
      shadowEnabled: true,
    },
  },
  {
    name: "Elegant Gold",
    nameAr: "ذهبي أنيق",
    themeKey: "elegant-gold",
    config: {
      borderStyle: "elegant",
      colorScheme: "gold-black",
      headerBg: "#1a1a2e",
      headerText: "#d4a843",
      accentColor: "#d4a843",
      fontFamily: "Playfair Display",
      showBorders: true,
      borderRadius: "4px",
      tableStyle: "elegant",
    },
  },
  {
    name: "Minimal Light",
    nameAr: "خفيف بسيط",
    themeKey: "minimal-light",
    config: {
      borderStyle: "borderless",
      colorScheme: "light-gray",
      headerBg: "#f8fafc",
      headerText: "#1e293b",
      accentColor: "#3b82f6",
      fontFamily: "Inter",
      showBorders: false,
      borderRadius: "0px",
      tableStyle: "minimal",
    },
  },
];

export const invoiceThemeRouter = createRouter({
  // ================================================
  // Get available themes
  // ================================================
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantThemes = await db.select().from(schema.invoiceThemes)
      .where(eq(schema.invoiceThemes.tenantId, ctx.user.tenantId!))
      .orderBy(desc(schema.invoiceThemes.createdAt));
    return tenantThemes.length > 0 ? tenantThemes : DEFAULT_THEMES;
  }),

  getDefaults: authedQuery.query(() => DEFAULT_THEMES),

  // ================================================
  // Save a theme for a tenant
  // ================================================
  save: userAdminQuery
    .input(z.object({
      name: z.string().min(1),
      nameAr: z.string().optional(),
      themeKey: z.string().min(1),
      config: z.any(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      if (input.isDefault) {
        await db.update(schema.invoiceThemes)
          .set({ isDefault: false })
          .where(eq(schema.invoiceThemes.tenantId, tenantId));
      }
      const existing = await db.query.invoiceThemes.findFirst({
        where: and(
          eq(schema.invoiceThemes.tenantId, tenantId),
          eq(schema.invoiceThemes.themeKey, input.themeKey),
        ),
      });
      if (existing) {
        await db.update(schema.invoiceThemes)
          .set({ ...input, config: input.config })
          .where(eq(schema.invoiceThemes.id, existing.id));
        return { id: existing.id, success: true };
      }
      const [{ id }] = await db.insert(schema.invoiceThemes).values({
        tenantId,
        ...input,
        config: input.config,
      }).$returningId();
      return { id, success: true };
    }),

  setDefault: userAdminQuery
    .input(z.object({ themeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      await db.update(schema.invoiceThemes)
        .set({ isDefault: false })
        .where(eq(schema.invoiceThemes.tenantId, tenantId));
      await db.update(schema.invoiceThemes)
        .set({ isDefault: true })
        .where(eq(schema.invoiceThemes.id, input.themeId));
      return { success: true };
    }),

  // ================================================
  // Company Stamps / Logo
  // ================================================
  stamps: {
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.companyStamps)
        .where(eq(schema.companyStamps.tenantId, ctx.user.tenantId!));
    }),

    upload: userAdminQuery
      .input(z.object({
        type: z.enum(["logo", "stamp"]),
        imageData: z.string().min(1),
        mimeType: z.string().default("image/png"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenantId = ctx.user.tenantId!;
        await db.update(schema.companyStamps)
          .set({ isActive: false })
          .where(and(eq(schema.companyStamps.tenantId, tenantId), eq(schema.companyStamps.type, input.type)));
        const [{ id }] = await db.insert(schema.companyStamps).values({
          tenantId,
          ...input,
          isActive: true,
        }).$returningId();
        return { id, success: true };
      }),

    getActive: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const [logo, stamp] = await Promise.all([
        db.query.companyStamps.findFirst({
          where: and(eq(schema.companyStamps.tenantId, ctx.user.tenantId!), eq(schema.companyStamps.type, "logo"), eq(schema.companyStamps.isActive, true)),
        }),
        db.query.companyStamps.findFirst({
          where: and(eq(schema.companyStamps.tenantId, ctx.user.tenantId!), eq(schema.companyStamps.type, "stamp"), eq(schema.companyStamps.isActive, true)),
        }),
      ]);
      return { logo, stamp };
    }),
  },

  // ================================================
  // Invoice Tax Settings
  // ================================================
  taxSettings: {
    get: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const existing = await db.query.invoiceTaxSettings.findFirst({
        where: eq(schema.invoiceTaxSettings.tenantId, ctx.user.tenantId!),
      });
      return existing || {
        showTax: true,
        taxLabel: "VAT",
        taxLabelAr: "ضريبة القيمة المضافة",
        taxPercent: "15",
        taxInclusive: false,
        showTaxNumber: true,
        showStamp: true,
        showLogo: true,
        showFooter: true,
        footerText: "",
        footerTextAr: "",
      };
    }),

    save: userAdminQuery
      .input(z.object({
        showTax: z.boolean().default(true),
        taxLabel: z.string().default("VAT"),
        taxLabelAr: z.string().default("ضريبة القيمة المضافة"),
        taxPercent: z.string().default("15"),
        taxInclusive: z.boolean().default(false),
        showTaxNumber: z.boolean().default(true),
        showStamp: z.boolean().default(true),
        showLogo: z.boolean().default(true),
        showFooter: z.boolean().default(true),
        footerText: z.string().optional(),
        footerTextAr: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenantId = ctx.user.tenantId!;
        const existing = await db.query.invoiceTaxSettings.findFirst({
          where: eq(schema.invoiceTaxSettings.tenantId, tenantId),
        });
        if (existing) {
          await db.update(schema.invoiceTaxSettings)
            .set(input)
            .where(eq(schema.invoiceTaxSettings.id, existing.id));
        } else {
          await db.insert(schema.invoiceTaxSettings).values({ tenantId, ...input });
        }
        return { success: true };
      }),
  },

  // ================================================
  // Country Tax Configs
  // ================================================
  countryTaxConfigs: {
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.countryTaxConfigs)
        .where(eq(schema.countryTaxConfigs.tenantId, ctx.user.tenantId!));
    }),

    save: userAdminQuery
      .input(z.object({
        countryCode: z.string().length(2),
        taxName: z.string().min(1),
        taxNameAr: z.string().optional(),
        taxRate: z.string().default("15"),
        taxNumberLabel: z.string().optional(),
        taxNumberLabelAr: z.string().optional(),
        taxAuthority: z.string().optional(),
        taxAuthorityAr: z.string().optional(),
        requiresZatca: z.boolean().default(false),
        requiresFbr: z.boolean().default(false),
        invoiceNote: z.string().optional(),
        invoiceNoteAr: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenantId = ctx.user.tenantId!;
        if (input.isDefault) {
          await db.update(schema.countryTaxConfigs)
            .set({ isDefault: false })
            .where(eq(schema.countryTaxConfigs.tenantId, tenantId));
        }
        const existing = await db.query.countryTaxConfigs.findFirst({
          where: and(eq(schema.countryTaxConfigs.tenantId, tenantId), eq(schema.countryTaxConfigs.countryCode, input.countryCode)),
        });
        if (existing) {
          await db.update(schema.countryTaxConfigs).set(input).where(eq(schema.countryTaxConfigs.id, existing.id));
        } else {
          await db.insert(schema.countryTaxConfigs).values({ tenantId, ...input });
        }
        return { success: true };
      }),
  },
});
