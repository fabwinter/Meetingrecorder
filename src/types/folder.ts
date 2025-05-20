
export interface Folder {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface FolderWithMeetingCount extends Folder {
  meetingCount: number;
}

export const FOLDER_COLORS = [
  { name: "Blue", value: "#0ea5e9" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#eab308" },
];
