import { Timestamp } from "firebase/firestore";
interface ChangeRequest {
  change_request_id: string;
  ohId: string;
  action: "create" | "change" | "cancel";
  date: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  status: "pending" | "approved" | "rejected";
  submitTime: Timestamp;
  processed_at?: Timestamp;
  response_note?: string;
  note?: string;
}

export default ChangeRequest;
