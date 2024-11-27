import { Timestamp } from "firebase/firestore";

interface Message {
  userId: string;
  message: string;
  sendTime: Timestamp;
  status?: "sent" | "approved" | "rejected";
}

export default Message;
