import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  Typography,
  Layout,
  Card,
  message as antdMessage,
  List,
  Modal,
  InputNumber,
  TimePicker,
  Select,
  Row,
  Col,
  Space,
} from "antd";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { fetchTAs, deleteTAByEmail } from "../helper/Database"; // Import the fetchTAs function
import User from "../models/User";
import "../css/Instructor.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/Firebase";
import OfficeHour from "../models/OfficeHour";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const db = getFirestore();
const daysOfWeek = [
  " ",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Instructor() {
  const [user] = useAuthState(auth);
  const [taList, setTaList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [newOfficeHour, setNewOfficeHour] = useState({
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
    location: "",
  });

  // Fetch current list of TAs on component mount
  useEffect(() => {
    loadTAs();
  }, []);

  useEffect(() => {
    if (user) fetchOfficeHours();
  }, [user]);

  const handleAddOfficeHour = async () => {
    if (!newOfficeHour.startTime || !newOfficeHour.endTime) {
      alert("Please fill in all fields.");
      return;
    }
    const newEntry = {
      userId: user?.uid || "",
      createdBy: user?.email || "",
      createdAt: new Date().toISOString(),
      ...newOfficeHour,
    };
    await addDoc(collection(db, "officeHours"), newEntry);
    await fetchOfficeHours();
    // clear the fields
    setTimeout(() => {
      setNewOfficeHour({
        dayOfWeek: 0,
        startTime: "",
        endTime: "",
        location: "",
      });
    }, 10);
    antdMessage.success("Office hour added successfully!");
  };

  const handleDeleteOfficeHour = async (createdAt: string) => {
    const querySnapshot = await getDocs(
      query(collection(db, "officeHours"), where("createdAt", "==", createdAt))
    );
    const docId = querySnapshot.docs[0].id;
    await deleteDoc(doc(db, "officeHours", docId));
    antdMessage.success("Office hour deleted successfully!");
    await fetchOfficeHours();
  };

  const handleEditOfficeHour = async (
    id: string,
    updatedData: Partial<OfficeHour>
  ) => {
    await updateDoc(doc(db, "officeHours", id), updatedData);
    await fetchOfficeHours();
  };

  const fetchOfficeHours = async () => {
    const officeHoursQuery = query(
      collection(db, "officeHours"),
      where("userId", "==", user?.uid)
    );
    const querySnapshot = await getDocs(officeHoursQuery);
    const fetchedOfficeHours = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as OfficeHour[];
    setOfficeHours(fetchedOfficeHours);
  };

  const loadTAs = async () => {
    setIsLoading(true);
    const tas = await fetchTAs(db);
    setTaList(tas);
    setIsLoading(false);
  };
  // Handle adding a new TA
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

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <Title level={2}>Welcome, {user?.email}</Title>
          <Button onClick={handleLogout} className="logout-button">
            Log Out
          </Button>
          <Text type="secondary">
            Currently Registered Teaching Assistants:
          </Text>

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

        <Card className="card secondary-card">
          <Title level={4}>Additional Information</Title>
          <Text>Calendar overview for classes will go here.</Text>
          <Text>Awaited messages will be shown here.</Text>
        </Card>

        {/* Modal for adding a new TA */}
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
        <h2>Your OH for the Week</h2>
        <List
          bordered
          dataSource={officeHours}
          renderItem={(oh) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() =>
                    handleEditOfficeHour(oh.userId, {
                      ...oh,
                      location: "Updated Location",
                    })
                  }
                >
                  Edit (not working)
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteOfficeHour(oh.createdAt)}
                >
                  Delete
                </Button>,
              ]}
            >
              <Space>
                <span>{daysOfWeek[oh.dayOfWeek]}</span>
                <span>
                  {oh.startTime} - {oh.endTime}
                </span>
                <span>{oh.location || "No location specified"}</span>
              </Space>
            </List.Item>
          )}
        />
        <h2>Add a New Office Hour</h2>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Day of Week" required>
                <Select
                  placeholder="Select Day"
                  onChange={(value) =>
                    setNewOfficeHour({ ...newOfficeHour, dayOfWeek: value })
                  }
                  style={{ width: "100%" }}
                >
                  {daysOfWeek.map((day, index) => (
                    <Option key={index} value={index}>
                      {day}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Start Time" required>
                <TimePicker
                  format="HH:mm"
                  onChange={(value) =>
                    setNewOfficeHour({
                      ...newOfficeHour,
                      startTime: value ? dayjs(value).format("HH:mm") : "",
                    })
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="End Time" required>
                <TimePicker
                  format="HH:mm"
                  onChange={(value) =>
                    setNewOfficeHour({
                      ...newOfficeHour,
                      endTime: value ? dayjs(value).format("HH:mm") : "",
                    })
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Location (Optional)">
                <Input
                  placeholder="Location"
                  value={newOfficeHour.location}
                  onChange={(e) =>
                    setNewOfficeHour({
                      ...newOfficeHour,
                      location: e.target.value,
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" onClick={handleAddOfficeHour}>
            Add Office Hour
          </Button>
          <iframe
            src={import.meta.env.VITE_CALENDAR_EMBED_URL}
            style={{ border: 0 }}
            width="800"
            height="600"
          ></iframe>
        </Form>
      </Content>
    </Layout>
  );
}

export default Instructor;
