import { db } from "./index";
import { badges, complaints, statusHistory, users, hotspots } from "./schema";
import { eq } from "drizzle-orm";

const BADGES_DATA = [
  { key: "first_reporter", name: "First Reporter", description: "Submitted first complaint", icon: "🏅", threshold: 1, category: "reports" },
  { key: "civic_hero", name: "Civic Hero", description: "50+ complaints reported", icon: "🦸", threshold: 50, category: "reports" },
  { key: "neighborhood_watch", name: "Neighborhood Watch", description: "10 complaints in same area", icon: "👁️", threshold: 10, category: "area" },
  { key: "verifier", name: "Verifier", description: "Verified 20 complaints", icon: "✅", threshold: 20, category: "verifications" },
  { key: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "🔥", threshold: 7, category: "streak" },
  { key: "early_bird", name: "Early Bird", description: "First complaint of the day 5 times", icon: "🌅", threshold: 5, category: "timing" },
  { key: "night_owl", name: "Night Owl", description: "Reported after 10 PM 3 times", icon: "🦉", threshold: 3, category: "timing" },
  { key: "pothole_patrol", name: "Pothole Patrol", description: "Reported 10 potholes", icon: "🕳️", threshold: 10, category: "category" },
  { key: "green_guardian", name: "Green Guardian", description: "Reported 10 garbage issues", icon: "♻️", threshold: 10, category: "category" },
  { key: "light_keeper", name: "Light Keeper", description: "Reported 10 streetlight issues", icon: "💡", threshold: 10, category: "category" },
];

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

const AI_DESCRIPTIONS: Record<string, string[]> = {
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

function getRandomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
  return date;
}

function getSeverity(): string {
  const rand = Math.random();
  if (rand < 0.3) return "high";
  if (rand < 0.7) return "medium";
  return "low";
}

function getStatus(): string {
  const rand = Math.random();
  if (rand < 0.55) return "Reported";
  if (rand < 0.8) return "Assigned";
  if (rand < 0.95) return "In Progress";
  return "Resolved";
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

export async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  const existingBadges = await db.select().from(badges);
  if (existingBadges.length === 0) {
    console.log("  📛 Seeding badges...");
    await db.insert(badges).values(BADGES_DATA);
  }

  const existingComplaints = await db.select().from(complaints);
  if (existingComplaints.length === 0) {
    console.log("  📝 Seeding sample complaints...");

    const categories = ["pothole", "garbage", "streetlight", "drainage", "other"];
    const categoryWeights = [0.4, 0.25, 0.2, 0.1, 0.05];

    for (let i = 0; i < 30; i++) {
      const rand = Math.random();
      let cumulative = 0;
      let category = "other";
      for (let j = 0; j < categoryWeights.length; j++) {
        cumulative += categoryWeights[j];
        if (rand < cumulative) {
          category = categories[j];
          break;
        }
      }

      const location = getRandomElement(BANGALORE_LOCATIONS);
      const description = getRandomElement(AI_DESCRIPTIONS[category] || AI_DESCRIPTIONS.other);
      const status = getStatus();
      const createdAt = getRandomDate(10);
      const severity = getSeverity();
      const complaintId = generateId();

      const [insertedComplaint] = await db.insert(complaints).values({
        complaintId,
        image: generatePlaceholderImage(category),
        latitude: location.lat + (Math.random() - 0.5) * 0.01,
        longitude: location.lng + (Math.random() - 0.5) * 0.01,
        location: `${location.name}, ${location.area}`,
        category,
        severity,
        status,
        description: `${description} Location: ${location.name}, ${location.area}.`,
        confidenceScore: 85 + Math.floor(Math.random() * 15),
        aiModelsUsed: ["florence", "blip", "clip"],
        createdAt,
        updatedAt: createdAt,
      }).returning();

      await db.insert(statusHistory).values({
        complaintId: insertedComplaint.id,
        status: "Reported",
        timestamp: createdAt,
      });

      if (status !== "Reported") {
        const assignedTime = new Date(createdAt);
        assignedTime.setHours(assignedTime.getHours() + Math.floor(Math.random() * 24) + 1);
        await db.insert(statusHistory).values({
          complaintId: insertedComplaint.id,
          status: "Assigned",
          notes: "Assigned to ward officer",
          timestamp: assignedTime,
        });

        if (status === "In Progress" || status === "Resolved") {
          const progressTime = new Date(assignedTime);
          progressTime.setHours(progressTime.getHours() + Math.floor(Math.random() * 48) + 2);
          await db.insert(statusHistory).values({
            complaintId: insertedComplaint.id,
            status: "In Progress",
            notes: "Work commenced",
            timestamp: progressTime,
          });

          if (status === "Resolved") {
            const resolvedTime = new Date(progressTime);
            resolvedTime.setHours(resolvedTime.getHours() + Math.floor(Math.random() * 72) + 4);
            await db.insert(statusHistory).values({
              complaintId: insertedComplaint.id,
              status: "Resolved",
              notes: "Issue resolved successfully",
              timestamp: resolvedTime,
            });

            await db.update(complaints)
              .set({ updatedAt: resolvedTime })
              .where(eq(complaints.id, insertedComplaint.id));
          }
        }
      }
    }
  }

  const existingHotspots = await db.select().from(hotspots);
  if (existingHotspots.length === 0) {
    console.log("  🔥 Seeding hotspots...");
    const hotspotData = BANGALORE_LOCATIONS.slice(0, 8).map((loc) => ({
      latitude: loc.lat,
      longitude: loc.lng,
      category: getRandomElement(["pothole", "garbage", "drainage"]),
      riskScore: 60 + Math.floor(Math.random() * 40),
      predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      factors: ["high_past_complaints", "rainfall_forecast", "traffic_density"],
      recommendedAction: "Schedule preventive maintenance inspection",
    }));
    await db.insert(hotspots).values(hotspotData);
  }

  console.log("✅ Database seed completed!");
}
