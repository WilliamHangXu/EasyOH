import { Card, Collapse } from "antd";

function SubmitChangeRequest() {
  const requests = [
    {
      created: "2024-11-30 10:00 AM",
      status: "Pending",
      message: "I am sick!",
      submittedDate: "2024-11-29 09:00 PM",
    },
    {
      created: "2024-11-28 02:00 PM",
      status: "Pending",
      message: "Need a schedule adjustment for personal reasons.",
      submittedDate: "2024-11-27 03:00 PM",
    },
  ];

  return (
    <Card className="card">
      <div className="message-section">
        <h3>Submitted Change Requests:</h3>
        <Collapse>
          {requests.map((request, index) => (
            <Collapse.Panel
              header={`Created: ${request.created} | Status: ${request.status}`}
              key={index}
            >
              <div className="change-request-details">
                <p>
                  <strong>Message:</strong> {request.message}
                </p>
                <p>
                  <strong>Submitted Date:</strong> {request.submittedDate}
                </p>
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </Card>
  );
}

export default SubmitChangeRequest;
