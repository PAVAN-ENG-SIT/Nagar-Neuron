import { pgTable, text, integer, boolean, timestamp, doublePrecision, jsonb, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  points: integer("points").default(0).notNull(),
  totalReports: integer("total_reports").default(0).notNull(),
  totalVerifications: integer("total_verifications").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date"),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  fcmToken: text("fcm_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  threshold: integer("threshold").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complaintId: varchar("complaint_id", { length: 50 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  image: text("image").notNull(),
  perceptualHash: varchar("perceptual_hash", { length: 64 }),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  location: text("location").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).default("Reported").notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  confidenceScore: integer("confidence_score"),
  aiModelsUsed: jsonb("ai_models_used"),
  modelResponses: jsonb("model_responses"),
  isDuplicate: boolean("is_duplicate").default(false).notNull(),
  duplicateOfId: integer("duplicate_of_id"),
  verificationCount: integer("verification_count").default(0).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const statusHistory = pgTable("status_history", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").references(() => complaints.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").references(() => complaints.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  photo: text("photo"),
  comment: text("comment"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hotspots = pgTable("hotspots", {
  id: serial("id").primaryKey(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  riskScore: integer("risk_score").notNull(),
  predictedDate: timestamp("predicted_date").notNull(),
  factors: jsonb("factors"),
  recommendedAction: text("recommended_action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  targetAction: varchar("target_action", { length: 50 }).notNull(),
  targetCount: integer("target_count").notNull(),
  rewardPoints: integer("reward_points").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
  verifications: many(verifications),
  badges: many(userBadges),
  notifications: many(notifications),
  pointTransactions: many(pointTransactions),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  user: one(users, { fields: [complaints.userId], references: [users.id] }),
  statusHistory: many(statusHistory),
  verifications: many(verifications),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  complaint: one(complaints, { fields: [statusHistory.complaintId], references: [complaints.id] }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  complaint: one(complaints, { fields: [verifications.complaintId], references: [complaints.id] }),
  user: one(users, { fields: [verifications.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type Hotspot = typeof hotspots.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
