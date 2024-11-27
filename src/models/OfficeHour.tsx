import { Timestamp } from "firebase/firestore";

interface OfficeHour {
  userId: string;
  createdBy: string;
  createdAt: Timestamp;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

export default OfficeHour;
