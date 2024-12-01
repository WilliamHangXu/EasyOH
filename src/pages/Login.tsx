import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../config/Firebase";
import { useNavigate, Link } from "react-router-dom";
import { Button, Typography, Layout, Card, Input, Form } from "antd";
import "../css/Login.css";

const db = getFirestore();
const { Title, Text } = Typography;
const { Content } = Layout;

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const { email, password } = values;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        setError("Role information not found. Are you an active TA?");
        return;
      }

      const { role } = userDoc.data() as { role: string };
      if (role === "instructor") {
        navigate("/instructor-dashboard");
      } else if (role === "ta") {
        navigate("/ta-dashboard");
      } else {
        setError("!Unknown role!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to login. Please check your credentials.");
    }
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <Title level={2}>Login</Title>
          <Text type="secondary">
            Login only supported for TA and Instructors.
          </Text>
          <Form className="form" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              labelCol={{ span: 24 }} // Ensure label takes a full row
              wrapperCol={{ span: 24 }} // Ensure input takes a full row
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input your email!",
                },
              ]}
            >
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form>
          {error && <Text type="danger">{error}</Text>}
          <div className="links">
            <Link to="/">Home Page</Link>
            <Link to="/signup">TA Sign Up</Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}

export default Login;
