import { z } from "zod";

export type ComplaintCategory = "pothole" | "garbage" | "streetlight" | "drainage" | "other";
export type ComplaintStatus = "Reported" | "Assigned" | "In Progress" | "Resolved";
export type ComplaintSeverity = "low" | "medium" | "high";

export const complaintCategorySchema = z.enum(["pothole", "garbage", "streetlight", "drainage", "other"]);
export const complaintStatusSchema = z.enum(["Reported", "Assigned", "In Progress", "Resolved"]);
export const complaintSeveritySchema = z.enum(["low", "medium", "high"]);

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  timestamp: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  image: string;
  latitude: number;
  longitude: number;
  location: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  description: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  resolved: number;
  today: number;
  byCategory: Record<ComplaintCategory, number>;
  byStatus: Record<ComplaintStatus, number>;
}

export const createComplaintSchema = z.object({
  image: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: complaintStatusSchema,
  notes: z.string().optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
