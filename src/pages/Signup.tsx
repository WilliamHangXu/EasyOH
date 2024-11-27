import {
  Button,
  Input,
  Form,
  Typography,
  Layout,
  Card,
  message as antdMessage,
} from "antd";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { auth } from "../config/Firebase";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../css/Signup.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const db = getFirestore();

function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const navigate = useNavigate();

  const createUser = async (values: {
    email: string;
    password: string;
    password2: string;
    firstName: string;
    lastName: string;
  }) => {
    const { email, password, password2, firstName, lastName } = values;

    // Case 1: check if passwords match
    if (password !== password2) {
      antdMessage.error("Passwords do not match");
      return;
    }

    try {
      // Case 2: check if instructor has authorized the email
      const userDoc = await getDoc(doc(db, "authorizedEmails", email));
      if (!userDoc.exists()) {
        antdMessage.error(
          "Email not authorized! If you are a TA, please contact your instructor."
        );
        return;
      }

      // Case 3: Check if the user has already signed up
      const existingUserSnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );

      if (!existingUserSnapshot.empty) {
        await signInWithEmailAndPassword(auth, email, password);
        antdMessage.success(
          "User Already signed up! Redirecting to your dashboard..."
        );
        navigate("/ta-dashboard");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role: "ta",
        firstName: firstName,
        lastName: lastName,
        joinTime: new Date().toISOString(),
      });

      antdMessage.success(
        "Signup successful! Redirecting to your dashboard..."
      );
      navigate("/ta-dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      antdMessage.error("Failed to sign up. Please try again.");
    }
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <Title level={2}>TA Signup</Title>
          <Text type="secondary">
            If you are an instructor, you don't need to sign up!
          </Text>
          <Form className="form" onFinish={createUser}>
            <Form.Item
              label="Email"
              name="email"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Retype Password"
              name="password2"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please retype your password!" },
              ]}
            >
              <Input.Password
                placeholder="Retype your password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label={
                <div className="form-flex">
                  <span className="form-label">Preferred First Name</span>
                </div>
              }
              name="firstName"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: "Enter your name, please!" }]}
              help={"This is the name that will be displayed to students!"}
            >
              <Input
                placeholder="Enter your preferred name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please enter your last name" },
              ]}
            >
              <Input
                placeholder="Enter your last name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Signup
            </Button>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}

export default Signup;
