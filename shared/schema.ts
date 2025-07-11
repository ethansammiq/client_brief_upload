import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  targetingDetails: text("targeting_details").notNull(),
  placementName: text("placement_name").notNull(),
  adSizes: text("ad_sizes").notNull(),
  pricingModel: text("pricing_model").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rfpResponses = pgTable("rfp_responses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaPlanVersions = pgTable("media_plan_versions", {
  id: serial("id").primaryKey(),
  rfpResponseId: integer("rfp_response_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  title: text("title").notNull(),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }).notNull().default("0"),
  totalImpressions: integer("total_impressions").notNull().default(0),
  avgCpm: decimal("avg_cpm", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaPlanLineItems = pgTable("media_plan_line_items", {
  id: serial("id").primaryKey(),
  mediaPlanVersionId: integer("media_plan_version_id").notNull(),
  productId: integer("product_id").notNull(),
  lineItemName: text("line_item_name").notNull(),
  site: text("site").notNull().default(""),
  placementName: text("placement_name").notNull().default(""),
  targetingDetails: text("targeting_details").notNull().default(""),
  adSizes: text("ad_sizes").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  rateModel: text("rate_model").notNull().default("CPM"),
  cpmRate: decimal("cpm_rate", { precision: 10, scale: 2 }).notNull(),
  flatRate: decimal("flat_rate", { precision: 12, scale: 2 }).notNull().default("0"),
  impressions: integer("impressions").notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertRfpResponseSchema = createInsertSchema(rfpResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaPlanVersionSchema = createInsertSchema(mediaPlanVersions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaPlanLineItemSchema = createInsertSchema(mediaPlanLineItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMediaPlanLineItemSchema = createInsertSchema(mediaPlanLineItems).omit({
  id: true,
  mediaPlanVersionId: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type RfpResponse = typeof rfpResponses.$inferSelect;
export type InsertRfpResponse = z.infer<typeof insertRfpResponseSchema>;
export type MediaPlanVersion = typeof mediaPlanVersions.$inferSelect;
export type InsertMediaPlanVersion = z.infer<typeof insertMediaPlanVersionSchema>;
export type MediaPlanLineItem = typeof mediaPlanLineItems.$inferSelect;
export type InsertMediaPlanLineItem = z.infer<typeof insertMediaPlanLineItemSchema>;
export type UpdateMediaPlanLineItem = z.infer<typeof updateMediaPlanLineItemSchema>;
