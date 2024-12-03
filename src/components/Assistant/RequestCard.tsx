import ChangeRequest from "../../models/ChangeRequest";
interface RequestCardProps {
  request: ChangeRequest;
}
function RequestCard({ request }: RequestCardProps) {
  return (
    <div className="change-request-details">
      <p>
        You submitted a{" "}
        <strong>
          {request.primaryOH.isRecurring ? "Recurrance" : "Temporary"}{" "}
        </strong>
        change.
      </p>
      <p>
        <strong>Start Time: </strong> {request.primaryOH.startTime}
      </p>
      <p>
        <strong>End Time: </strong> {request.primaryOH.endTime}
      </p>
      <p>
        <strong>You Wrote:</strong> {request.taNote}
      </p>
      <p>
        <strong>Submitted Time:</strong> {request.submittedAt}
      </p>
    </div>
  );
}

export default RequestCard;
