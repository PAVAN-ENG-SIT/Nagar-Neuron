import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import {
  createComplaintSchema,
  updateStatusSchema,
  complaintCategorySchema,
  complaintStatusSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/complaints", (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;

      let parsedCategory;
      let parsedStatus;

      if (category) {
        const result = complaintCategorySchema.safeParse(category);
        if (result.success) {
          parsedCategory = result.data;
        }
      }

      if (status) {
        const result = complaintStatusSchema.safeParse(status);
        if (result.success) {
          parsedStatus = result.data;
        }
      }

      const complaints = storage.getAll(parsedCategory, parsedStatus);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/:id", (req, res) => {
    try {
      const { id } = req.params;
      const complaint = storage.getById(id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ error: "Failed to fetch complaint" });
    }
  });

  app.post("/api/complaints", (req, res) => {
    try {
      const result = createComplaintSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.errors,
        });
      }

      const complaint = storage.create(result.data);
      console.log(`Created complaint: ${complaint.id} - ${complaint.category}`);
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

  app.put("/api/complaints/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const result = updateStatusSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.errors,
        });
      }

      const complaint = storage.updateStatus(id, result.data);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      console.log(`Updated complaint ${id} status to: ${result.data.status}`);
      res.json(complaint);
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ error: "Failed to update complaint status" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const stats = storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
