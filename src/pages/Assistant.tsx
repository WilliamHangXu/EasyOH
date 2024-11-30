import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { auth } from "../config/Firebase"; // Adjust the import based on your Firebase configuration
import { useAuthState } from "react-firebase-hooks/auth";
import OfficeHour from "../models/OfficeHour";
import ChangeRequest from "../models/ChangeRequest";
import dayjs from "dayjs";
import {
  InputNumber,
  TimePicker,
  Select,
  Button,
  Form,
  Row,
  Col,
  Layout,
  Typography,
  Card,
  Collapse,
} from "antd";
import { signOut } from "firebase/auth";
import Header from "../components/Header";

const db = getFirestore();
const { Option } = Select;
const { Title, Text } = Typography;
const { Content } = Layout;

const daysOfWeek = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Assistant() {
  const [user] = useAuthState(auth);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [slotCount, setSlotCount] = useState<number>(1);
  const [slots, setSlots] = useState<
    { day: string; start: string; end: string }[]
  >([]);
  const [noOh, setNoOh] = useState<boolean>(false);
  console.log(user);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the current user
      window.location.href = "/"; // Redirect to the home or login page
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    // if (!user) return;

    fetchOfficeHours();
  }, []);

  const fetchOfficeHours = async () => {
    const officeHoursQuery = query(
      collection(db, "officeHours"),
      where("userId", "==", user?.uid)
    );
    const querySnapshot = await getDocs(officeHoursQuery);
    const officeHoursData = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as OfficeHour[];
    setOfficeHours(officeHoursData);
    if (officeHoursData.length === 0) {
      setNoOh(true);
    }
  };

  const handleTimeChange = (
    index: number,
    field: "start" | "end",
    value: any
  ) => {
    const newSlots = [...slots];
    newSlots[index] = {
      ...newSlots[index],
      [field]: value ? dayjs(value).format("HH:mm") : "",
    };
    setSlots(newSlots);
  };

  const handleSlotCountChange = (value: number | null) => {
    if (value === null) return;
    setSlotCount(value);
    const updatedSlots = Array.from(
      { length: value },
      (_, index) => slots[index] || { start: "", end: "" }
    );
    setSlots(updatedSlots);
  };

  const handleDayChange = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = {
      ...newSlots[index],
      day: value,
    };
    setSlots(newSlots);
  };

  return (
    <>
      <Layout>
        <Content>
          <Header user={user} auth={auth} />
          <Row gutter={16}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card className="card">
                <h3>Currently Registered Teaching Assistants:</h3>
              </Card>
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
                            <Button
                              type="primary"
                              style={{ marginRight: "10px" }}
                            >
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
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
}

export default Assistant;
