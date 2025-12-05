import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { seedDatabase } from "./db/seed";
import {
  createComplaintSchema,
  updateStatusSchema,
  complaintCategorySchema,
  complaintStatusSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDatabase();

  app.get("/api/complaints", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;

      let parsedCategory: string | undefined;
      let parsedStatus: string | undefined;

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

      const complaints = await storage.getAllComplaints(parsedCategory, parsedStatus);

      const formatted = complaints.map((c) => ({
        id: c.complaintId,
        image: c.image,
        latitude: c.latitude,
        longitude: c.longitude,
        location: c.location,
        category: c.category,
        severity: c.severity,
        status: c.status,
        description: c.description,
        notes: c.notes,
        confidenceScore: c.confidenceScore,
        verificationCount: c.verificationCount,
        verificationStatus: c.verificationStatus,
        statusHistory: c.statusHistory,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const complaint = await storage.getComplaintById(id);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      const formatted = {
        id: complaint.complaintId,
        image: complaint.image,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        location: complaint.location,
        category: complaint.category,
        severity: complaint.severity,
        status: complaint.status,
        description: complaint.description,
        notes: complaint.notes,
        confidenceScore: complaint.confidenceScore,
        verificationCount: complaint.verificationCount,
        verificationStatus: complaint.verificationStatus,
        statusHistory: complaint.statusHistory,
        verifications: complaint.verifications,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
      };

      res.json(formatted);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ error: "Failed to fetch complaint" });
    }
  });

  app.post("/api/complaints", async (req: Request, res: Response) => {
    try {
      const result = createComplaintSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.errors,
        });
      }

      const complaint = await storage.createComplaint(result.data);
      console.log(`Created complaint: ${complaint.complaintId} - ${complaint.category}`);

      const formatted = {
        id: complaint.complaintId,
        image: complaint.image,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        location: complaint.location,
        category: complaint.category,
        severity: complaint.severity,
        status: complaint.status,
        description: complaint.description,
        notes: complaint.notes,
        confidenceScore: complaint.confidenceScore,
        statusHistory: complaint.statusHistory,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        pointsEarned: 10,
      };

      res.status(201).json(formatted);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

  app.put("/api/complaints/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = updateStatusSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.errors,
        });
      }

      const complaint = await storage.updateComplaintStatus(id, result.data.status, result.data.notes);

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

  app.post("/api/complaints/:id/verify", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, status, photo, comment } = req.body;

      if (!userId || !status) {
        return res.status(400).json({ error: "userId and status are required" });
      }

      const complaint = await storage.verifyComplaint(id, userId, status, photo, comment);

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      res.json({ success: true, complaint });
    } catch (error) {
      console.error("Error verifying complaint:", error);
      res.status(500).json({ error: "Failed to verify complaint" });
    }
  });

  app.get("/api/complaints/nearby-unverified", async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 0.5;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "lat and lng are required" });
      }

      const complaints = await storage.getNearbyUnverified(lat, lng, radius);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching nearby unverified:", error);
      res.status(500).json({ error: "Failed to fetch nearby complaints" });
    }
  });

  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { phone, name } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const user = await storage.createOrGetUser(phone, name);
      const fullUser = await storage.getUserById(user.id);

      res.json({
        success: true,
        user: fullUser,
        token: `mock-token-${user.id}`,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (isNaN(userId)) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/profile", async (req: Request, res: Response) => {
    try {
      const { userId, name, avatarUrl, language, fcmToken } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await storage.updateUserProfile(userId, { name, avatarUrl, language, fcmToken });
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  app.get("/api/user/complaints", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (isNaN(userId)) {
        return res.status(400).json({ error: "userId is required" });
      }

      const complaints = await storage.getAllComplaints(undefined, undefined, userId);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      res.status(500).json({ error: "Failed to fetch user complaints" });
    }
  });

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/badges", async (req: Request, res: Response) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/hotspots", async (req: Request, res: Response) => {
    try {
      const hotspots = await storage.getHotspots();
      res.json(hotspots);
    } catch (error) {
      console.error("Error fetching hotspots:", error);
      res.status(500).json({ error: "Failed to fetch hotspots" });
    }
  });

  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);

      if (isNaN(userId)) {
        return res.status(400).json({ error: "userId is required" });
      }

      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  app.get("/api/challenges", async (req: Request, res: Response) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.get("/api/analytics/trends", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await storage.getAnalyticsTrends(days);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching analytics trends:", error);
      res.status(500).json({ error: "Failed to fetch analytics trends" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
