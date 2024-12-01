import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  message as antdMessage,
  TimePicker,
  Select,
  Row,
  Col,
  Space,
  List,
  Alert,
  Radio,
  Typography,
  Layout,
} from "antd";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import OfficeHour from "../models/OfficeHour";
import { User } from "firebase/auth";
import dayjs from "dayjs";
import { signOut } from "firebase/auth";
import Header from "../components/Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/Firebase";
import SubmitChangeRequest from "../components/Assistant/SubmitChangeRequest";
import CalendarPage from "./CalendarPage";
import SubmitOfficeHour from "../components/Assistant/SubmitOfficeHour";

const db = getFirestore();
const { Option } = Select;
// const { Title, Text } = Typography;
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

  return (
    <>
      <Layout className="layout">
        <Content className="content">
          <Header user={user} auth={auth} />
          <SubmitChangeRequest />
          <CalendarPage />
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

          <h2>Your Recurrence Office Hours (UI)</h2>
          <div>Your recurrence hours</div>
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

          <SubmitOfficeHour user={user} />
        </Content>
      </Layout>
    </>
  );
}

export default Assistant;
