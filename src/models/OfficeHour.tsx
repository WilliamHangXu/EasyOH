interface OfficeHour {
  ohId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

export default OfficeHour;
