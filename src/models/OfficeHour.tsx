interface OfficeHour {
  userId: string;
  createdBy: string;
  createdAt: string;
  dayOfWeek?: number;
  tmpDate?: string;
  tmpStartTime?: string;
  tmpEndTime?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  dtStart?: string;
  exceptions?: string[];
}

export default OfficeHour;
