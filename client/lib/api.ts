import { apiRequest, getApiUrl, authenticatedFetch } from "./query-client";

export interface User {
  id: number;
  phone: string;
  name: string;
  avatarUrl?: string;
  points: number;
  totalReports: number;
  totalVerifications: number;
  streak: number;
  language: string;
  badges: Badge[];
  rank: number | null;
}

export interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  category: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  totalReports: number;
  totalVerifications: number;
  rank: number;
}

export interface Hotspot {
  id: number;
  latitude: number;
  longitude: number;
  category: string;
  riskScore: number;
  predictedDate: string;
  factors: string[];
  recommendedAction: string;
}

export interface Complaint {
  id: string;
  image: string;
  latitude: number;
  longitude: number;
  location: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  notes?: string;
  confidenceScore?: number;
  verificationCount: number;
  verificationStatus?: string;
  statusHistory: Array<{ status: string; timestamp: string; notes?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  open: number;
  resolved: number;
  today: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export async function login(phone: string, name?: string): Promise<{ success: boolean; user: User; token: string }> {
  const res = await apiRequest("POST", "/api/auth/login", { phone, name });
  return res.json();
}

export async function getUserProfile(userId: number): Promise<User> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/user/profile?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateUserProfile(userId: number, data: { name?: string; language?: string }): Promise<User> {
  const res = await apiRequest("PUT", "/api/user/profile", { userId, ...data });
  return res.json();
}

export async function getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function getAllBadges(): Promise<Badge[]> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/badges`);
  if (!res.ok) throw new Error("Failed to fetch badges");
  return res.json();
}

export async function getHotspots(): Promise<Hotspot[]> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/hotspots`);
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function verifyComplaint(complaintId: string, userId: number, status: "yes" | "no" | "cant_verify", comment?: string): Promise<Complaint> {
  const res = await apiRequest("POST", `/api/complaints/${complaintId}/verify`, { userId, status, comment });
  const data = await res.json();
  return data.complaint;
}

export async function getStats(): Promise<Stats> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function getComplaints(category?: string, status?: string): Promise<Complaint[]> {
  const baseUrl = getApiUrl();
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  const url = `${baseUrl}api/complaints${params.toString() ? `?${params}` : ""}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function getComplaintById(id: string): Promise<Complaint> {
  const baseUrl = getApiUrl();
  const res = await authenticatedFetch(`${baseUrl}api/complaints/${id}`);
  if (!res.ok) throw new Error("Failed to fetch complaint");
  return res.json();
}

export async function createComplaint(data: { image: string; latitude: number; longitude: number; notes?: string; userId?: number }): Promise<Complaint & { pointsEarned: number }> {
  const res = await apiRequest("POST", "/api/complaints", data);
  return res.json();
}
