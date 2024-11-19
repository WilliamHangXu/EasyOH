import { useState } from "react";
import {
  Button,
  Input,
  Form,
  Typography,
  Layout,
  Card,
  message as antdMessage,
} from "antd";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import "../css/Instructor.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const db = getFirestore();

function Instructor() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (values: { email: string }) => {
    try {
      const email = values.email;
      console.log("Adding TA with email:", email);
      await setDoc(doc(db, "authorized_emails", email), { email });
      setMessage(`Added TA with email: ${email}`);
      setEmail("");
      antdMessage.success(`Successfully added TA: ${email}`);
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
          <Title level={4}>Additional Information</Title>
          <Text>List of current TAs will be displayed here.</Text>
          <Text>Calendar overview for classes will go here.</Text>
          <Text>Awaited messages will be shown here.</Text>
        </Card>
      </Content>
    </Layout>
  );
}

export default Instructor;
