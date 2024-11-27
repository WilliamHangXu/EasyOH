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
import { InputNumber, TimePicker, Select, Button, Form, Row, Col } from "antd";
import { signOut } from "firebase/auth";

const db = getFirestore();
const { Option } = Select;

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
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
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
    // fetchOfficeHours();
    setNoOh(true);
  }, []);

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

  return (
    <>
      <h1>Welcome, {user?.email}</h1>
      <header className="ta-header">
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </header>
      {noOh && (
        <>
          <p>
            You have no office hours scheduled. Please start by scheduling some!
          </p>
          <Form.Item label="Number of Time Slots">
            <InputNumber
              min={1}
              max={4}
              defaultValue={slotCount}
              onChange={handleSlotCountChange}
              style={{ width: "100%" }}
            />
          </Form.Item>
          {Array.from({ length: slotCount }).map((_, index) => (
            <Row key={index} gutter={16}>
              <Col span={8}>
                <Form.Item label={`Day for Slot ${index + 1}`} required>
                  <Select
                    placeholder="Select Day"
                    onChange={(value) => handleDayChange(index, value)}
                    style={{ width: "100%" }}
                  >
                    <Option value="Monday">Monday</Option>
                    <Option value="Tuesday">Tuesday</Option>
                    <Option value="Wednesday">Wednesday</Option>
                    <Option value="Thursday">Thursday</Option>
                    <Option value="Friday">Friday</Option>
                    <Option value="Saturday">Saturday</Option>
                    <Option value="Sunday">Sunday</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={`Start Time for Slot ${index + 1}`} required>
                  <TimePicker
                    format="HH:mm"
                    onChange={(value) =>
                      handleTimeChange(index, "start", value)
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={`End Time for Slot ${index + 1}`} required>
                  <TimePicker
                    format="HH:mm"
                    onChange={(value) => handleTimeChange(index, "end", value)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </>
      )}
    </>
  );
}

export default Assistant;
