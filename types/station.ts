export type StationStatus = "Active" | "Inactive";

export type Station = {
  id: string;
  name: string;
  location?: string;
  status: StationStatus;
  avgWaitMins: number;
};
