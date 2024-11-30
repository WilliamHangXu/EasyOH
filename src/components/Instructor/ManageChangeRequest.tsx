import { Button, Card, Collapse } from "antd";

function ManageChangeRequest() {
  return (
    <>
      <Card className="card">
        <div className="message-section">
          <h3>Pending Change Requests:</h3>
          <Collapse>
            <Collapse.Panel header="Yuanhe Li" key="1">
              <div className="change-request-details">
                <p>
                  <strong>From:</strong> Saturday 10 am - 11 am
                </p>
                <p>
                  <strong>To:</strong> Sunday 10 am - 11 am
                </p>
                <p>
                  <strong>Note:</strong> I was sick Saturday!
                </p>
                <div className="action-buttons">
                  <Button type="primary" style={{ marginRight: "10px" }}>
                    Approve (doesn't work)
                  </Button>
                  <Button type="default" danger>
                    Reject
                  </Button>
                </div>
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
      </Card>
    </>
  );
}

export default ManageChangeRequest;
