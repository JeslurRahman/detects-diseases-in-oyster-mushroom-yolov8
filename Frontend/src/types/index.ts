/**
 * types/index.ts — Zod schemas + inferred types.
 * These mirror the ACTUAL FastAPI responses (see backend schemas.py), not the
 * simplified shapes in the original spec.
 */
import { z } from 'zod';

export const diseaseKeySchema = z.enum(['healthy', 'green_mold', 'black_mold']);
export type DiseaseKey = z.infer<typeof diseaseKeySchema>;

// ---------------------------------------------------------------- Predict
export const detectionBoxSchema = z.object({
  class: z.string(),
  confidence: z.number(),
  bbox: z.array(z.number()),
});

export const predictResponseSchema = z.object({
  status: z.enum(['healthy', 'infected']),
  detections: z.array(detectionBoxSchema),
  annotated_image: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  prediction: diseaseKeySchema,
  confidence: z.number(),
  inference_time_ms: z.number().optional(),
  image_size: z.object({ width: z.number(), height: z.number() }).optional(),
  filename: z.string().nullable().optional(),
});
export type PredictResponse = z.infer<typeof predictResponseSchema>;

// ---------------------------------------------------------------- Racks
export const rackSchema = z.object({ id: z.number(), name: z.string() });
export type Rack = z.infer<typeof rackSchema>;
export const racksSchema = z.array(rackSchema);

// ---------------------------------------------------------------- Detection record
export const detectionSchema = z.object({
  id: z.number(),
  rack_id: z.number(),
  rack_name: z.string(),
  bag_id: z.string(),
  prediction: diseaseKeySchema,
  disease_display: z.string(),
  scientific_name: z.string().nullable(),
  confidence: z.number(),
  notes: z.string().nullable(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  bbox: z.array(z.number()).nullable(),
  image_width: z.number(),
  image_height: z.number(),
  inference_time_ms: z.number().nullable(),
  recommendation: z.string(),
  captured_at: z.string(),
  created_at: z.string(),
});
export type Detection = z.infer<typeof detectionSchema>;

// ---------------------------------------------------------------- Rack detail
export const bagStatusSchema = z.object({
  bag_id: z.string(),
  status: diseaseKeySchema,
  detection_id: z.number(),
  confidence: z.number(),
  captured_at: z.string(),
});
export type BagStatus = z.infer<typeof bagStatusSchema>;

export const rackDetailSchema = z.object({
  rack_id: z.number(),
  rack_name: z.string(),
  total_bags: z.number(),
  healthy: z.number(),
  green_mold: z.number(),
  black_mold: z.number(),
  infected: z.number(),
  last_updated: z.string().nullable(),
  bags: z.array(bagStatusSchema),
});
export type RackDetail = z.infer<typeof rackDetailSchema>;

// ---------------------------------------------------------------- History
export const historyPageSchema = z.object({
  items: z.array(detectionSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  has_more: z.boolean(),
});
export type HistoryPage = z.infer<typeof historyPageSchema>;

// ---------------------------------------------------------------- Reports
export const reportSummarySchema = z.object({
  total: z.number(),
  healthy: z.number(),
  green_mold: z.number(),
  black_mold: z.number(),
  contaminated: z.number(),
  today: z.number(),
  week: z.number(),
  month: z.number(),
});
export type ReportSummary = z.infer<typeof reportSummarySchema>;

// ---------------------------------------------------------------- Requests
export interface BagCreate {
  rack_id: string;
  bag_id: string;
  prediction: DiseaseKey;
  confidence: number;
  notes?: string | null;
  image?: string | null;
  bbox?: number[] | null;
  image_width?: number;
  image_height?: number;
  inference_time_ms?: number | null;
  captured_at?: string | null;
}

export interface HistoryQuery {
  q?: string;
  disease?: DiseaseKey;
  rack_id?: number;
  date_from?: string;
  date_to?: string;
}
