import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintSeverity,
  StatusHistoryEntry,
  ComplaintStats,
  CreateComplaintInput,
  UpdateStatusInput,
} from "@shared/schema";

const BANGALORE_LOCATIONS = [
  { name: "MG Road", lat: 12.9716, lng: 77.604, area: "near Trinity Metro Station" },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408, area: "100 Feet Road junction" },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245, area: "5th Block main road" },
  { name: "Whitefield", lat: 12.9698, lng: 77.7499, area: "ITPL Main Road" },
  { name: "HSR Layout", lat: 12.9121, lng: 77.6446, area: "Sector 1 junction" },
  { name: "Jayanagar", lat: 12.925, lng: 77.5838, area: "4th Block" },
  { name: "Electronic City", lat: 12.8456, lng: 77.6603, area: "Phase 1 entrance" },
  { name: "Marathahalli", lat: 12.9591, lng: 77.7011, area: "Outer Ring Road" },
  { name: "Banashankari", lat: 12.925, lng: 77.5486, area: "2nd Stage" },
  { name: "Yelahanka", lat: 13.1007, lng: 77.5963, area: "New Town main road" },
  { name: "BTM Layout", lat: 12.9166, lng: 77.6101, area: "2nd Stage" },
  { name: "JP Nagar", lat: 12.9063, lng: 77.5857, area: "6th Phase" },
  { name: "Malleshwaram", lat: 13.0035, lng: 77.5647, area: "8th Cross" },
  { name: "Rajajinagar", lat: 12.9914, lng: 77.5538, area: "Industrial Town" },
  { name: "Hebbal", lat: 13.0358, lng: 77.5971, area: "Outer Ring Road junction" },
];

const AI_DESCRIPTIONS: Record<ComplaintCategory, string[]> = {
  pothole: [
    "Large pothole detected on the main road, approximately 2.5 feet in diameter, causing significant traffic disruption and potential vehicle damage.",
    "Deep crater-like pothole identified near the junction, filled with water creating visibility issues for drivers.",
    "Multiple interconnected potholes spanning across the lane, creating a hazardous stretch for two-wheelers and pedestrians.",
    "Severe road damage with exposed subsurface material, likely caused by recent rainfall and heavy vehicle traffic.",
    "Crumbling asphalt with sharp edges detected, posing immediate risk to motorcycle tires and cyclists.",
  ],
  garbage: [
    "Overflowing garbage bin with waste spilling onto the sidewalk, attracting stray animals and creating unsanitary conditions.",
    "Accumulated municipal waste not collected for several days, emitting foul odor affecting nearby residents and businesses.",
    "Construction debris mixed with household waste blocking pedestrian pathway, requiring immediate clearance.",
    "Plastic waste and packaging materials scattered across the area, indicating need for additional waste collection frequency.",
    "Open dumping of mixed waste including organic and electronic materials, requiring proper segregation and disposal.",
  ],
  streetlight: [
    "Non-functional streetlight creating safety hazard for pedestrians and vehicles after sunset, particularly concerning for women and elderly.",
    "Flickering streetlight with intermittent functionality, causing visual discomfort and inadequate illumination.",
    "Damaged streetlight pole leaning dangerously, requiring immediate structural assessment and repair.",
    "Complete power outage affecting entire stretch of streetlights, creating dark zone vulnerable to criminal activity.",
    "Broken light fixture with exposed wiring, posing electrocution risk during rainy season.",
  ],
  drainage: [
    "Clogged storm drain causing water accumulation on the road, creating breeding ground for mosquitoes and health hazard.",
    "Overflowing drainage channel during light rain indicating severe blockage, requiring immediate cleaning.",
    "Missing drain cover exposing open manhole, extremely dangerous for pedestrians especially at night.",
    "Sewage backup visible on street surface, causing foul smell and contamination risk for nearby food establishments.",
    "Damaged drainage pipe causing continuous water seepage, undermining road foundation and creating sinkholes.",
  ],
  other: [
    "Damaged road signage creating confusion for drivers, particularly at critical junction points.",
    "Overgrown vegetation obstructing visibility at intersection, requiring immediate trimming for traffic safety.",
    "Broken footpath tiles creating tripping hazard for pedestrians, especially elderly and differently-abled citizens.",
    "Abandoned vehicle blocking public parking space, occupying area for extended period without authorization.",
    "Damaged public bench with broken seating and sharp metal edges, unsafe for public use.",
  ],
};

function generateId(): string {
  return `NN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function categorizeFromDescription(description: string): ComplaintCategory {
  const lower = description.toLowerCase();
  if (lower.includes("pothole") || lower.includes("hole") || lower.includes("crack") || lower.includes("road damage")) {
    return "pothole";
  }
  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("litter")) {
    return "garbage";
  }
  if (lower.includes("streetlight") || lower.includes("light") || lower.includes("lamp") || lower.includes("dark")) {
    return "streetlight";
  }
  if (lower.includes("drain") || lower.includes("sewer") || lower.includes("water") || lower.includes("flood")) {
    return "drainage";
  }
  return "other";
}

function getSeverity(): ComplaintSeverity {
  const rand = Math.random();
  if (rand < 0.3) return "high";
  if (rand < 0.7) return "medium";
  return "low";
}

function getStatus(): ComplaintStatus {
  const rand = Math.random();
  if (rand < 0.55) return "Reported";
  if (rand < 0.8) return "Assigned";
  if (rand < 0.95) return "In Progress";
  return "Resolved";
}

class ComplaintStorage {
  private complaints: Map<string, Complaint> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const categories: ComplaintCategory[] = ["pothole", "garbage", "streetlight", "drainage", "other"];
    const categoryWeights = [0.4, 0.25, 0.2, 0.1, 0.05];

    for (let i = 0; i < 30; i++) {
      const rand = Math.random();
      let cumulative = 0;
      let category: ComplaintCategory = "other";
      for (let j = 0; j < categoryWeights.length; j++) {
        cumulative += categoryWeights[j];
        if (rand < cumulative) {
          category = categories[j];
          break;
        }
      }

      const location = getRandomElement(BANGALORE_LOCATIONS);
      const description = getRandomElement(AI_DESCRIPTIONS[category]);
      const status = getStatus();
      const createdAt = getRandomDate(10);
      const severity = getSeverity();

      const statusHistory: StatusHistoryEntry[] = [
        { status: "Reported", timestamp: createdAt },
      ];

      if (status !== "Reported") {
        const assignedTime = new Date(createdAt);
        assignedTime.setHours(assignedTime.getHours() + Math.floor(Math.random() * 24) + 1);
        statusHistory.push({ status: "Assigned", timestamp: assignedTime.toISOString(), notes: "Assigned to ward officer" });

        if (status === "In Progress" || status === "Resolved") {
          const progressTime = new Date(assignedTime);
          progressTime.setHours(progressTime.getHours() + Math.floor(Math.random() * 48) + 2);
          statusHistory.push({ status: "In Progress", timestamp: progressTime.toISOString(), notes: "Work commenced" });

          if (status === "Resolved") {
            const resolvedTime = new Date(progressTime);
            resolvedTime.setHours(resolvedTime.getHours() + Math.floor(Math.random() * 72) + 4);
            statusHistory.push({ status: "Resolved", timestamp: resolvedTime.toISOString(), notes: "Issue resolved successfully" });
          }
        }
      }

      const id = generateId();
      const complaint: Complaint = {
        id,
        image: this.generatePlaceholderImage(category),
        latitude: location.lat + (Math.random() - 0.5) * 0.01,
        longitude: location.lng + (Math.random() - 0.5) * 0.01,
        location: `${location.name}, ${location.area}`,
        category,
        severity,
        status,
        description,
        statusHistory,
        createdAt,
        updatedAt: statusHistory[statusHistory.length - 1].timestamp,
      };

      this.complaints.set(id, complaint);
    }
  }

  private generatePlaceholderImage(category: ComplaintCategory): string {
    const colors: Record<ComplaintCategory, { bg: string; fg: string }> = {
      pothole: { bg: "3b3b3b", fg: "ef4444" },
      garbage: { bg: "1a4731", fg: "10b981" },
      streetlight: { bg: "422006", fg: "fbbf24" },
      drainage: { bg: "1e3a5f", fg: "3b82f6" },
      other: { bg: "374151", fg: "9ca3af" },
    };

    const icons: Record<ComplaintCategory, string> = {
      pothole: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
      garbage: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
      streetlight: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
      drainage: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z",
      other: "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z",
    };

    const color = colors[category];
    const icon = icons[category];

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
      <text x="200" y="245" font-family="Arial, sans-serif" font-size="12" fill="#888888" text-anchor="middle">Sample Complaint Image</text>
    </svg>`;

    return Buffer.from(svg).toString("base64");
  }

  getAll(category?: ComplaintCategory, status?: ComplaintStatus): Complaint[] {
    let result = Array.from(this.complaints.values());

    if (category) {
      result = result.filter((c) => c.category === category);
    }
    if (status) {
      result = result.filter((c) => c.status === status);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getById(id: string): Complaint | undefined {
    return this.complaints.get(id);
  }

  create(input: CreateComplaintInput): Complaint {
    const id = generateId();
    const now = new Date().toISOString();

    const category = this.detectCategory(input.notes);
    const location = this.reverseGeocode(input.latitude, input.longitude);

    const complaint: Complaint = {
      id,
      image: input.image,
      latitude: input.latitude,
      longitude: input.longitude,
      location,
      category,
      severity: this.assessSeverity(),
      status: "Reported",
      description: this.generateAIDescription(category, location),
      notes: input.notes,
      statusHistory: [{ status: "Reported", timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };

    this.complaints.set(id, complaint);
    return complaint;
  }

  private detectCategory(notes?: string): ComplaintCategory {
    if (!notes) {
      const categories: ComplaintCategory[] = ["pothole", "garbage", "streetlight", "drainage", "other"];
      return getRandomElement(categories);
    }
    return categorizeFromDescription(notes);
  }

  private assessSeverity(): ComplaintSeverity {
    return getSeverity();
  }

  private reverseGeocode(lat: number, lng: number): string {
    let closest = BANGALORE_LOCATIONS[0];
    let minDist = Number.MAX_VALUE;

    for (const loc of BANGALORE_LOCATIONS) {
      const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = loc;
      }
    }

    return `${closest.name}, ${closest.area}`;
  }

  private generateAIDescription(category: ComplaintCategory, location: string): string {
    const descriptions = AI_DESCRIPTIONS[category];
    const base = getRandomElement(descriptions);
    return `${base} Location: ${location}.`;
  }

  updateStatus(id: string, input: UpdateStatusInput): Complaint | undefined {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    const now = new Date().toISOString();
    complaint.status = input.status;
    complaint.updatedAt = now;
    complaint.statusHistory.push({
      status: input.status,
      timestamp: now,
      notes: input.notes,
    });

    this.complaints.set(id, complaint);
    return complaint;
  }

  getStats(): ComplaintStats {
    const all = Array.from(this.complaints.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const byCategory: Record<ComplaintCategory, number> = {
      pothole: 0,
      garbage: 0,
      streetlight: 0,
      drainage: 0,
      other: 0,
    };

    const byStatus: Record<ComplaintStatus, number> = {
      Reported: 0,
      Assigned: 0,
      "In Progress": 0,
      Resolved: 0,
    };

    let todayCount = 0;

    for (const complaint of all) {
      byCategory[complaint.category]++;
      byStatus[complaint.status]++;

      if (new Date(complaint.createdAt) >= today) {
        todayCount++;
      }
    }

    const open = byStatus.Reported + byStatus.Assigned + byStatus["In Progress"];

    return {
      total: all.length,
      open,
      resolved: byStatus.Resolved,
      today: todayCount,
      byCategory,
      byStatus,
    };
  }
}

export const storage = new ComplaintStorage();
