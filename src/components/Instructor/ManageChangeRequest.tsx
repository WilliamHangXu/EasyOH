import { Button, Card, Collapse, message as antdMessage } from "antd";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import ChangeRequest from "../../models/ChangeRequest";
import { fetchPendingChangeRequests } from "../../helper/Database";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

function ManageChangeRequest({ user }: { user: User | null | undefined }) {
  const db = getFirestore();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const fetchingChanges = async () => {
    const cr = await fetchPendingChangeRequests(db);
    setChangeRequests(cr);
  };
  useEffect(() => {
    if (!user) return;
    fetchingChanges();
  }, [user]);

  const handleApprove = async (id: string | undefined) => {
    if (!id) return;
    const changeRequestRef = doc(db, "changeRequests", id);

    await updateDoc(changeRequestRef, {
      status: "approved",
    });
    fetchingChanges();
    antdMessage.success("Change request approved successfully.");
  };

  const handleReject = async (id: string | undefined) => {
    if (!id) return;
    const changeRequestRef = doc(db, "changeRequests", id);

    await updateDoc(changeRequestRef, {
      status: "rejected",
    });
    fetchingChanges();
    antdMessage.success("Change request rejected successfully.");
  };

  return (
    <>
      <Card className="card">
        <div className="message-section">
          <h3>Pending Change Requests:</h3>
          <Collapse>
            {changeRequests.map((cr, index) => (
              <Collapse.Panel
                header={cr.userFirstName + " " + cr.userLastName}
                key={index}
              >
                <div className="change-request-details">
                  <p>
                    <strong>Operation:</strong> {cr.operation}
                  </p>
                  <p>
                    <strong>Email:</strong> {cr.primaryOH.createdBy}
                  </p>
                  <p>
                    <strong>Recurring:</strong>{" "}
                    {cr.primaryOH.isRecurring ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Start Time:</strong> {cr.primaryOH.startTime}
                  </p>
                  <p>
                    <strong>End Time:</strong> {cr.primaryOH.endTime}
                  </p>
                  <p>
                    <strong>Location:</strong> {cr.primaryOH.location}
                  </p>
                  {cr.primaryOH.isRecurring && (
                    <p>
                      <strong>Day of Week:</strong> {cr.primaryOH.dayOfWeek}
                    </p>
                  )}
                  <p>
                    <strong>Submitted At:</strong> {cr.submittedAt}
                  </p>
                  <p>
                    <strong>TA Note:</strong> {cr.taNote || "No note provided"}
                  </p>
                  <div className="action-buttons">
                    <Button
                      type="primary"
                      style={{ marginRight: "10px" }}
                      onClick={() => handleApprove(cr?.docId)}
                    >
                      Approve
                    </Button>
                    <Button
                      type="default"
                      danger
                      onClick={() => handleReject(cr?.docId)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
      </Card>
    </>
  );
}

export default ManageChangeRequest;
