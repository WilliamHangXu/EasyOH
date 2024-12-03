interface OfficeHour {
  userId: string;
  createdBy: string;
  createdAt: string;
  dayOfWeek?: number;
  tmpDate?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  exceptions?: string[];
}

export default OfficeHour;
