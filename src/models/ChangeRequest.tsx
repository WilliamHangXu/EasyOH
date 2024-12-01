interface ChangeRequest {
  taId: string;
  instructorId: string;
  sendTime: string;
  action: "create" | "change" | "cancel";
  oldStartTime?: string;
  oldEndTime?: string;
  newStartTime?: string;
  newEndTime?: string;
  submittedAt: string;
  noteToInstructor?: string;
}

export default ChangeRequest;
