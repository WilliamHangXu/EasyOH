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
  Collapse,
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
import CalendarPage from "./CalendarPage";

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
        <Title level={2}>Welcome, {user?.email}</Title>
        <Button onClick={handleLogout} className="logout-button">
          Log Out
        </Button>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
          </Col>
          {/* Message Section */}
          {/* Message Section */}
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
          </Col>
        </Row>

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
        <h2>Your Recent Office Hours</h2>
        <div>Your office hour, up to 2 months from now.</div>
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
        <h2>Add a Recurrence Office Hour</h2>
        <p>Not feeling well? Try Edit Recent Office Hours above!</p>
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
        </Form>
      </Content>
      <CalendarPage />
    </Layout>
  );
}

export default Instructor;
