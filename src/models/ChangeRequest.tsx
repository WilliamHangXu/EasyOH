import OfficeHour from "./OfficeHour";
interface ChangeRequest {
  docId?: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  operation: "create" | "edit" | "delete";
  primaryOH: OfficeHour;
  secondaryOH?: OfficeHour;
  instructorNote?: string;
  taNote?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export default ChangeRequest;
