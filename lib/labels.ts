import type {
  Difficulty,
  DownloadKind,
  Hardware,
  LabStatus,
  Topic,
} from "@/lib/types";

export const HARDWARE_LABELS: Record<Hardware, string> = {
  arduino: "Arduino",
  "raspberry-pi": "Raspberry Pi",
  linux: "Linux",
  "ender-3": "Ender-3 V3 SE",
};

export const TOPIC_LABELS: Record<Topic, string> = {
  electronics: "Electronics",
  linux: "Linux",
  "language-models": "Language models",
  "ai-agents": "AI agents",
  "3d-printing": "3D printing",
  robotics: "Robotics",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const STATUS_LABELS: Record<LabStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  planned: "Coming soon",
};

export const DOWNLOAD_KIND_LABELS: Record<DownloadKind, string> = {
  code: "Code",
  stl: "STL",
  diagram: "Diagram",
  doc: "Document",
};

/** "45 min", "1 h", "1 h 30 min". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** "3 B", "1.2 KB", "4.5 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/** "13 November 2026" from an ISO date, independent of the server's time zone. */
export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
