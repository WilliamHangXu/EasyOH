import React, { useState } from "react";
import {
  Button,
  Input,
  Form,
  TimePicker,
  message as antdMessage,
  Select,
  Row,
  Col,
  Alert,
  Radio,
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
import { User } from "firebase/auth";
import dayjs from "dayjs";
import OfficeHour from "../../models/OfficeHour";

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
const { Option } = Select;
const db = getFirestore();

interface SubmitOHProps {
  user: User | null | undefined;
}

const SubmitOfficeHour: React.FC<SubmitOHProps> = ({ user }) => {
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [officeHourType, setOfficeHourType] = useState<
    "temporary" | "recurrence"
  >("temporary");
  const [showWarning, setShowWarning] = useState(false);
  const [newOfficeHour, setNewOfficeHour] = useState({
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
    location: "",
  });

  const handleTypeChange = (e: any) => {
    const selectedType = e.target.value;
    setOfficeHourType(selectedType);
    if (selectedType === "recurrence") {
      setShowWarning(true); // Show the warning when recurrence is selected
    } else {
      setShowWarning(false); // Hide the warning for temporary
    }
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

  return (
    <>
      <h2>Add an Office Hour</h2>
      <p>Not feeling well? Try Edit Recent Office Hours above!</p>
      <Form layout="vertical">
        {/* Radio Group for Office Hour Type */}
        <Form.Item label="Type of Office Hour">
          <Radio.Group onChange={handleTypeChange} value={officeHourType}>
            <Radio value="temporary">Temporary</Radio>
            <Radio value="recurrence">Recurrence</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Show warning when Recurrence is selected */}
        {showWarning && (
          <Alert
            message="Warning"
            description="Changing to a Recurrence Office Hour will erase all temporary edits. Please make sure you want to do this."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

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
    </>
  );
};

export default SubmitOfficeHour;
