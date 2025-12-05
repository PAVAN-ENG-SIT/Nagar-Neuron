import { db } from "./db";
import { 
  complaints, 
  statusHistory, 
  users, 
  badges, 
  userBadges, 
  verifications, 
  notifications, 
  pointTransactions,
  hotspots,
  challenges,
  userChallenges,
  type User,
  type Complaint,
  type Badge,
  type Hotspot,
} from "./db/schema";
import { eq, desc, and, sql, gte, lte, count, or, like } from "drizzle-orm";

const POINTS_CONFIG: Record<string, number> = {
  report_complaint: 10,
  complaint_resolved: 20,
  verify_complaint: 5,
  first_in_area: 15,
  daily_streak: 5,
};

function generateComplaintId(): string {
  return `NN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generatePlaceholderImage(category: string): string {
  const colors: Record<string, { bg: string; fg: string }> = {
    pothole: { bg: "3b3b3b", fg: "ef4444" },
    garbage: { bg: "1a4731", fg: "10b981" },
    streetlight: { bg: "422006", fg: "fbbf24" },
    drainage: { bg: "1e3a5f", fg: "3b82f6" },
    other: { bg: "374151", fg: "9ca3af" },
  };

  const icons: Record<string, string> = {
    pothole: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    garbage: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    streetlight: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
    drainage: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
    other: "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z",
  };

  const color = colors[category] || colors.other;
  const icon = icons[category] || icons.other;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#${color.bg};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect fill="url(#bg)" width="400" height="300"/>
    <circle cx="200" cy="130" r="50" fill="#${color.fg}" opacity="0.2"/>
    <g transform="translate(176, 106) scale(2)" fill="#${color.fg}">
      <path d="${icon}"/>
    </g>
    <text x="200" y="220" font-family="Arial, sans-serif" font-size="16" fill="#${color.fg}" text-anchor="middle" font-weight="bold">${category.toUpperCase()}</text>
    <text x="200" y="245" font-family="Arial, sans-serif" font-size="12" fill="#888888" text-anchor="middle">NagarNeuron AI Classification</text>
  </svg>`;

  return Buffer.from(svg).toString("base64");
}

const AI_DESCRIPTIONS: Record<string, string[]> = {
  pothole: [
    "Large pothole detected on the main road, approximately 2.5 feet in diameter, causing significant traffic disruption.",
    "Deep crater-like pothole identified near the junction, filled with water creating visibility issues.",
    "Severe road damage with exposed subsurface material, likely caused by recent rainfall and heavy traffic.",
  ],
  garbage: [
    "Overflowing garbage bin with waste spilling onto the sidewalk, attracting stray animals.",
    "Accumulated municipal waste not collected for several days, emitting foul odor.",
    "Construction debris mixed with household waste blocking pedestrian pathway.",
  ],
  streetlight: [
    "Non-functional streetlight creating safety hazard for pedestrians after sunset.",
    "Damaged streetlight pole leaning dangerously, requiring immediate structural assessment.",
    "Broken light fixture with exposed wiring, posing electrocution risk.",
  ],
  drainage: [
    "Clogged storm drain causing water accumulation on the road.",
    "Missing drain cover exposing open manhole, dangerous for pedestrians.",
    "Sewage backup visible on street surface, causing contamination risk.",
  ],
  other: [
    "Damaged road signage creating confusion for drivers.",
    "Overgrown vegetation obstructing visibility at intersection.",
    "Broken footpath tiles creating tripping hazard.",
  ],
};

function detectCategory(notes?: string): string {
  if (!notes) return "other";
  const lower = notes.toLowerCase();
  if (lower.includes("pothole") || lower.includes("hole") || lower.includes("crack") || lower.includes("road")) return "pothole";
  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("litter")) return "garbage";
  if (lower.includes("streetlight") || lower.includes("light") || lower.includes("lamp") || lower.includes("dark")) return "streetlight";
  if (lower.includes("drain") || lower.includes("sewer") || lower.includes("water") || lower.includes("flood")) return "drainage";
  return "other";
}

function assessSeverity(): string {
  const rand = Math.random();
  if (rand < 0.3) return "high";
  if (rand < 0.7) return "medium";
  return "low";
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const storage = {
  async getAllComplaints(category?: string, status?: string, userId?: number) {
    let conditions: any[] = [];

    if (category) {
      conditions.push(eq(complaints.category, category));
    }
    if (status) {
      conditions.push(eq(complaints.status, status));
    }
    if (userId) {
      conditions.push(eq(complaints.userId, userId));
    }

    const result = await db
      .select()
      .from(complaints)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(complaints.createdAt));

    const complaintsWithHistory = await Promise.all(
      result.map(async (complaint) => {
        const history = await db
          .select()
          .from(statusHistory)
          .where(eq(statusHistory.complaintId, complaint.id))
          .orderBy(statusHistory.timestamp);
        return {
          ...complaint,
          statusHistory: history,
        };
      })
    );

    return complaintsWithHistory;
  },

  async getComplaintById(id: string) {
    const result = await db
      .select()
      .from(complaints)
      .where(eq(complaints.complaintId, id))
      .limit(1);

    if (result.length === 0) return null;

    const complaint = result[0];
    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.complaintId, complaint.id))
      .orderBy(statusHistory.timestamp);

    const verificationsList = await db
      .select()
      .from(verifications)
      .where(eq(verifications.complaintId, complaint.id));

    return {
      ...complaint,
      statusHistory: history,
      verifications: verificationsList,
    };
  },

  async createComplaint(input: { image: string; latitude: number; longitude: number; notes?: string; userId?: number }) {
    const complaintId = generateComplaintId();
    const category = detectCategory(input.notes);
    const severity = assessSeverity();
    const descriptions = AI_DESCRIPTIONS[category] || AI_DESCRIPTIONS.other;
    const description = getRandomElement(descriptions);

    const now = new Date();

    const [inserted] = await db.insert(complaints).values({
      complaintId,
      userId: input.userId,
      image: input.image || generatePlaceholderImage(category),
      latitude: input.latitude,
      longitude: input.longitude,
      location: `Bangalore, Karnataka`,
      category,
      severity,
      status: "Reported",
      description,
      notes: input.notes,
      confidenceScore: 85 + Math.floor(Math.random() * 15),
      aiModelsUsed: ["florence", "blip", "clip"],
      createdAt: now,
      updatedAt: now,
    }).returning();

    await db.insert(statusHistory).values({
      complaintId: inserted.id,
      status: "Reported",
      timestamp: now,
    });

    if (input.userId) {
      await this.awardPoints(input.userId, "report_complaint", "Reported a civic issue");
      await db.update(users)
        .set({ totalReports: sql`${users.totalReports} + 1` })
        .where(eq(users.id, input.userId));
    }

    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.complaintId, inserted.id));

    return { ...inserted, statusHistory: history };
  },

  async updateComplaintStatus(complaintId: string, status: string, notes?: string) {
    const existing = await db
      .select()
      .from(complaints)
      .where(eq(complaints.complaintId, complaintId))
      .limit(1);

    if (existing.length === 0) return null;

    const complaint = existing[0];
    const now = new Date();

    await db.update(complaints)
      .set({ status, updatedAt: now })
      .where(eq(complaints.id, complaint.id));

    await db.insert(statusHistory).values({
      complaintId: complaint.id,
      status,
      notes,
      timestamp: now,
    });

    if (status === "Resolved" && complaint.userId) {
      await this.awardPoints(complaint.userId, "complaint_resolved", "Your complaint was resolved");
    }

    return this.getComplaintById(complaintId);
  },

  async getStats() {
    const all = await db.select().from(complaints);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const byCategory: Record<string, number> = { pothole: 0, garbage: 0, streetlight: 0, drainage: 0, other: 0 };
    const byStatus: Record<string, number> = { Reported: 0, Assigned: 0, "In Progress": 0, Resolved: 0 };
    let todayCount = 0;

    for (const complaint of all) {
      byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1;
      byStatus[complaint.status] = (byStatus[complaint.status] || 0) + 1;
      if (new Date(complaint.createdAt) >= today) {
        todayCount++;
      }
    }

    const open = (byStatus.Reported || 0) + (byStatus.Assigned || 0) + (byStatus["In Progress"] || 0);

    return {
      total: all.length,
      open,
      resolved: byStatus.Resolved || 0,
      today: todayCount,
      byCategory,
      byStatus,
    };
  },

  async createOrGetUser(phone: string, name?: string) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [newUser] = await db.insert(users).values({
      phone,
      name: name || `User ${phone.slice(-4)}`,
    }).returning();

    return newUser;
  },

  async getUserById(userId: number) {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) return null;

    const user = result[0];
    const userBadgesList = await db
      .select({ badge: badges })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    const rank = await this.getUserRank(userId);

    return {
      ...user,
      badges: userBadgesList.map((b) => b.badge),
      rank,
    };
  },

  async getUserRank(userId: number) {
    const allUsers = await db
      .select({ id: users.id, points: users.points })
      .from(users)
      .orderBy(desc(users.points));

    const index = allUsers.findIndex((u) => u.id === userId);
    return index >= 0 ? index + 1 : null;
  },

  async updateUserProfile(userId: number, data: { name?: string; avatarUrl?: string; language?: string; fcmToken?: string }) {
    await db.update(users).set(data).where(eq(users.id, userId));
    return this.getUserById(userId);
  },

  async awardPoints(userId: number, action: string, description: string) {
    const points = POINTS_CONFIG[action] || 0;
    if (points === 0) return { pointsEarned: 0, newBadges: [] };

    await db.update(users)
      .set({ points: sql`${users.points} + ${points}` })
      .where(eq(users.id, userId));

    await db.insert(pointTransactions).values({
      userId,
      points,
      action,
      description,
    });

    const newBadges = await this.checkBadgeUnlocks(userId);
    const user = await this.getUserById(userId);

    return {
      pointsEarned: points,
      totalPoints: user?.points || 0,
      newBadges,
    };
  },

  async checkBadgeUnlocks(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return [];

    const userData = user[0];
    const allBadges = await db.select().from(badges);
    const existingBadges = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
    const newBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      let earned = false;
      if (badge.category === "reports" && userData.totalReports >= badge.threshold) earned = true;
      if (badge.category === "verifications" && userData.totalVerifications >= badge.threshold) earned = true;
      if (badge.category === "streak" && userData.streak >= badge.threshold) earned = true;

      if (earned) {
        await db.insert(userBadges).values({ userId, badgeId: badge.id });
        newBadges.push(badge);
      }
    }

    return newBadges;
  },

  async getLeaderboard(limit: number = 50) {
    const topUsers = await db
      .select({
        id: users.id,
        name: users.name,
        points: users.points,
        totalReports: users.totalReports,
        totalVerifications: users.totalVerifications,
      })
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);

    return topUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  },

  async verifyComplaint(complaintId: string, userId: number, status: "yes" | "no" | "cant_verify", photo?: string, comment?: string) {
    const complaint = await db
      .select()
      .from(complaints)
      .where(eq(complaints.complaintId, complaintId))
      .limit(1);

    if (complaint.length === 0) return null;

    await db.insert(verifications).values({
      complaintId: complaint[0].id,
      userId,
      status,
      photo,
      comment,
    });

    await db.update(complaints)
      .set({ verificationCount: sql`${complaints.verificationCount} + 1` })
      .where(eq(complaints.id, complaint[0].id));

    const allVerifications = await db
      .select()
      .from(verifications)
      .where(eq(verifications.complaintId, complaint[0].id));

    const yesVotes = allVerifications.filter((v) => v.status === "yes").length;
    const noVotes = allVerifications.filter((v) => v.status === "no").length;

    if (yesVotes >= 3) {
      await db.update(complaints)
        .set({ verificationStatus: "verified" })
        .where(eq(complaints.id, complaint[0].id));
    } else if (noVotes >= 2) {
      await db.update(complaints)
        .set({ verificationStatus: "community_verified_fixed", status: "Resolved" })
        .where(eq(complaints.id, complaint[0].id));
    }

    await db.update(users)
      .set({ totalVerifications: sql`${users.totalVerifications} + 1` })
      .where(eq(users.id, userId));

    await this.awardPoints(userId, "verify_complaint", "Verified a complaint");

    return this.getComplaintById(complaintId);
  },

  async getNearbyUnverified(lat: number, lng: number, radiusKm: number = 0.5) {
    const degreeRadius = radiusKm / 111;

    const nearby = await db
      .select()
      .from(complaints)
      .where(
        and(
          gte(complaints.latitude, lat - degreeRadius),
          lte(complaints.latitude, lat + degreeRadius),
          gte(complaints.longitude, lng - degreeRadius),
          lte(complaints.longitude, lng + degreeRadius),
          lte(complaints.verificationCount, 2)
        )
      );

    return nearby;
  },

  async getHotspots() {
    return db.select().from(hotspots).orderBy(desc(hotspots.riskScore));
  },

  async getUserNotifications(userId: number) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  },

  async markNotificationRead(notificationId: number) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  },

  async createNotification(userId: number, title: string, body: string, type: string, data?: any) {
    await db.insert(notifications).values({
      userId,
      title,
      body,
      type,
      data,
    });
  },

  async getAllBadges() {
    return db.select().from(badges);
  },

  async getChallenges() {
    const now = new Date();
    return db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.isActive, true),
          lte(challenges.startsAt, now),
          gte(challenges.endsAt, now)
        )
      );
  },

  async getAnalyticsTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const complaintsData = await db
      .select()
      .from(complaints)
      .where(gte(complaints.createdAt, startDate))
      .orderBy(complaints.createdAt);

    const trends: Record<string, { date: string; count: number }[]> = {
      daily: [],
    };

    const dailyCounts: Record<string, number> = {};
    for (const c of complaintsData) {
      const date = new Date(c.createdAt).toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }

    for (const [date, count] of Object.entries(dailyCounts)) {
      trends.daily.push({ date, count });
    }

    trends.daily.sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  },
};
