import {
  Button,
  Input,
  Form,
  Typography,
  Card,
  message as antdMessage,
  List,
  Modal,
} from "antd";
import { useState, useEffect } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { fetchTAs, deleteTAByEmail } from "../../helper/Database";
import User from "../../models/User";

const { Text } = Typography;
const db = getFirestore();

function ManageTAList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [taList, setTaList] = useState<User[]>([]);

  useEffect(() => {
    loadTAs();
  }, []);

  const loadTAs = async () => {
    setIsLoading(true);
    setTaList(await fetchTAs(db));
    setIsLoading(false);
  };

  const handleAddTA = async () => {
    try {
      if (!email) {
        antdMessage.warning("Please enter a valid email!");
        return;
      }

      // Add TA to Firestore
      await setDoc(doc(db, "authorizedEmails", email), { email, role: "ta" });

      antdMessage.success(`Successfully added TA: ${email}`);
      setEmail("");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding TA:", error);
      antdMessage.error("Failed to add TA. Please try again.");
    }
  };

  const handleDeleteTA = async (email: string) => {
    try {
      await deleteTAByEmail(db, email);

      // Update the local state to reflect the deletion
      setTaList((prev) => prev.filter((ta) => ta.email !== email));

      antdMessage.success(`Successfully deleted TA: ${email}`);
    } catch (error) {
      antdMessage.error("Failed to delete TA. Please try again.");
    }
  };

  return (
    <>
      <Card className="card">
        <h3>Currently Registered Teaching Assistants:</h3>

        {isLoading ? (
          <Text>Loading TA list...</Text>
        ) : (
          <List
            dataSource={taList}
            renderItem={(ta) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteTA(ta.email)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <Text>
                  {ta.firstName} {ta.lastName} - {ta.email}
                </Text>
              </List.Item>
            )}
          />
        )}

        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
          style={{ marginTop: "20px" }}
          block
        >
          Add a TA
        </Button>
      </Card>
      <Modal
        title="Add a Teaching Assistant"
        open={isModalVisible}
        onOk={handleAddTA}
        onCancel={() => setIsModalVisible(false)}
        okText="Add"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input a valid email!",
              },
            ]}
          >
            <Input
              type="email"
              placeholder="Enter TA email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ManageTAList;
