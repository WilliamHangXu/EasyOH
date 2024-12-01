interface OfficeHour {
  userId: string;
  createdBy: string;
  createdAt: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

export default OfficeHour;
