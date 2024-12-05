import { Button, Card, Collapse, message as antdMessage, Row, Col } from "antd";

import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import ChangeRequest from "../../models/ChangeRequest";
import { fetchPendingChangeRequests } from "../../helper/Database";
import {
  getFirestore,
  updateDoc,
  doc,
  collection,
  addDoc,
} from "firebase/firestore";
import moment from "moment";

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
    // Add to the OH database
    const ohRef = collection(db, "officeHours");
    const changeRequest = changeRequests.find((cr) => cr.docId === id);
    if (!changeRequest) return;
    await addDoc(ohRef, changeRequest.primaryOH);

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
                    <strong>Time:</strong> {cr.primaryOH.startTime} -{" "}
                    {cr.primaryOH.endTime}
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
                    <p>
                      <strong>Submitted At:</strong>{" "}
                      {moment
                        .utc(cr.submittedAt)
                        .format("YYYY-MM-DD [at] HH:mm")}
                    </p>
                  </p>
                  <p>
                    <strong>TA Note:</strong> {cr.taNote || "No note provided"}
                  </p>
                  <div className="action-buttons">
                    <Row gutter={120}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          style={{
                            width: "240%",
                            margin: 0,
                            padding: 0,
                            height: "30px",
                            fontSize: "18px",
                          }}
                          onClick={() => handleApprove(cr?.docId)}
                        >
                          Approve
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          type="default"
                          danger
                          style={{
                            width: "240%",
                            margin: 0,
                            padding: 0,
                            height: "30px",
                            fontSize: "18px",
                          }}
                          onClick={() => handleReject(cr?.docId)}
                        >
                          Reject
                        </Button>
                      </Col>
                    </Row>
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
