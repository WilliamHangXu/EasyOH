import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Form,
  Typography,
  Layout,
  Card,
  message as antdMessage,
  Collapse,
} from "antd";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import "../css/Instructor.css";
import Message from "../components/Instructor/Message";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;

const db = getFirestore();

function Instructor() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [taList, setTaList] = useState<{ email: string; role: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTAs = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "authorized_emails")
        );
        const tas: { email: string; role: string }[] = [];
        console.log(querySnapshot);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === "ta") {
            tas.push({ email: data.email, role: data.role });
          }
        });
        setTaList(tas);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching TA list:", error);
        antdMessage.error("Failed to fetch TA list. Please try again.");
      }
    };
    fetchTAs();
  }, []);

  const handleSubmit = async (values: { email: string }) => {
    try {
      const email = values.email;
      await setDoc(doc(db, "authorized_emails", email), { email, role: "ta" });
      setMessage(`Added TA with email: ${email}`);
      setEmail("");
      antdMessage.success(`Successfully added TA: ${email}`);
      // Refresh TA list after adding a new TA
      setTaList((prev) => [...prev, { email, role: "ta" }]);
    } catch (error) {
      console.error("Error adding TA:", error);
      antdMessage.error("Failed to add TA. Please try again.");
    }
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <Title level={2}>Instructor</Title>
          <Text type="secondary">Add a Teaching Assistant (TA) by email:</Text>
          <Form className="form" onFinish={handleSubmit}>
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
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form>
          {message && (
            <Text type="success" className="success-message">
              {message}
            </Text>
          )}
        </Card>
        <Card className="card secondary-card">
          <Title level={4}>Teaching Assistants</Title>
          {loading ? (
            <Text>Loading...</Text>
          ) : taList.length > 0 ? (
            <Collapse
              accordion
              items={taList.map((ta, index) => ({
                key: index.toString(),
                label: ta.email, // This becomes the header
                children: (
                  <Text>
                    <strong>Role:</strong> {ta.role}
                  </Text>
                ),
              }))}
            />
          ) : (
            <Text>No TAs added yet.</Text>
          )}
        </Card>

        <Card className="card secondary-card">
          <Title level={4}>Additional Information</Title>
          <Text>List of current TAs will be displayed here.</Text>
          <Text>Calendar overview for classes will go here.</Text>
          <Text>Awaited messages will be shown here.</Text>
        </Card>
        <Card className="card secondary-card">
          <Title level={4}>Messages</Title>
          <Message />
          <Message />
          <Message />
        </Card>
      </Content>
    </Layout>
  );
}

export default Instructor;
