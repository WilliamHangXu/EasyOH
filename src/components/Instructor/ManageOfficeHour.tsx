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
  DatePicker,
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
import OfficeHour from "../../models/OfficeHour";
import { User } from "firebase/auth";
import dayjs from "dayjs";

const db = getFirestore();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const { Option } = Select;

interface ManageOHProps {
  user: User | null | undefined;
}

const ManageOfficeHour: React.FC<ManageOHProps> = ({ user }) => {
  const [form] = Form.useForm(); // Create a Form instance
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [officeHourType, setOfficeHourType] = useState<
    "temporary" | "recurrence"
  >("temporary");
  const [showWarning, setShowWarning] = useState(false);
  const [newOfficeHour, setNewOfficeHour] = useState({
    dayOfWeek: -1,
    startTime: "",
    endTime: "",
    location: "FGH 201",
    isRecurring: false,
    tmpDate: "",
  });

  useEffect(() => {
    if (user) fetchOfficeHours();
  }, [user]);

  const handleTypeChange = (e: any) => {
    const selectedType = e.target.value;
    setOfficeHourType(selectedType);
    if (selectedType === "recurrence") {
      setShowWarning(true);
      setNewOfficeHour({
        ...newOfficeHour,
        isRecurring: true,
      });
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
      ...doc.data(),
    })) as OfficeHour[];
    console.log(fetchedOfficeHours);
    setOfficeHours(fetchedOfficeHours);
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

  const handleAddOfficeHour = async () => {
    const start = dayjs(`2023-01-01 ${newOfficeHour.startTime}`);
    const end = dayjs(`2023-01-01 ${newOfficeHour.endTime}`);

    if (!newOfficeHour.startTime || !newOfficeHour.endTime) {
      antdMessage.warning("Please fill in all fields.");
      return;
    }
    if (!start.isBefore(end)) {
      antdMessage.error("Start time must be earlier than end time.");
      return;
    }

    if (end.diff(start, "minute") < 60) {
      antdMessage.error("Office hours must be at least one hour long.");
      return;
    }

    const recurrenceRule = newOfficeHour.isRecurring
      ? `FREQ=WEEKLY;COUNT=17`
      : `FREQ=WEEKLY;COUNT=1`;

    const newEntry = {
      userId: user?.uid || "",
      createdBy: user?.email || "",
      createdAt: new Date().toISOString(),
      ...newOfficeHour,
      recurrenceRule, // Add the rule only if it's a recurring event
      exceptions: [], // Initialize with no exceptions
    };

    await addDoc(collection(db, "officeHours"), newEntry);
    await fetchOfficeHours();
    form.resetFields(); // Clear form fields using Form instance

    // clear the fields
    setNewOfficeHour({
      dayOfWeek: 0,
      startTime: "",
      endTime: "",
      location: "FGH 201",
      isRecurring: false,
      tmpDate: "",
    });
    antdMessage.success("Office hour added successfully!");
  };
  return (
    <>
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
              {oh.isRecurring ? (
                <span>
                  {oh.dayOfWeek !== undefined ? daysOfWeek[oh.dayOfWeek] : ""}
                </span>
              ) : (
                <span>{dayjs(oh.tmpDate).format("YYYY-MM-DD")}</span>
              )}
              <span>
                {oh.startTime} - {oh.endTime}
              </span>
              <span>{oh.location || ""}</span>
            </Space>
          </List.Item>
        )}
      />
      <h2>Your Recurrence Office Hours</h2>
      <div>
        Your permenant office hours. If you change them, all temporary Edits for
        recent office hours will disappear!
      </div>
      <List
        bordered
        dataSource={officeHours}
        renderItem={(oh) =>
          oh.isRecurring && (
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
                <span>
                  {oh.dayOfWeek !== undefined ? daysOfWeek[oh.dayOfWeek] : ""}
                </span>
                <span>
                  {oh.startTime} - {oh.endTime}
                </span>
                <span>{oh.location || ""}</span>
              </Space>
            </List.Item>
          )
        }
      ></List>

      <h2>Add an Office Hour</h2>
      <p>Not feeling well? Try Edit Recent Office Hours above!</p>
      <Form form={form} layout="vertical">
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
            {officeHourType === "recurrence" ? (
              <Form.Item
                label="Day of Week"
                name="dayOfWeek"
                rules={[{ required: true, message: "Please select a Day!" }]}
              >
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
            ) : (
              <Form.Item
                label="Date"
                name="tmpDate"
                rules={[{ required: true, message: "Please select a date!" }]}
              >
                <DatePicker
                  placeholder="Select Date to Add Office Hour"
                  onChange={(value) =>
                    setNewOfficeHour({
                      ...newOfficeHour,
                      tmpDate: value.toISOString(),
                    })
                  }
                  style={{ width: "100%" }}
                ></DatePicker>
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item label="Start Time" name="startTime" required>
              <TimePicker
                format="HH:mm"
                onChange={(value) =>
                  setNewOfficeHour({
                    ...newOfficeHour,
                    startTime: value ? dayjs(value).format("HH:mm") : "",
                  })
                }
                style={{ width: "100%" }}
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="End Time" name="endTime" required>
              <TimePicker
                format="HH:mm"
                onChange={(value) =>
                  setNewOfficeHour({
                    ...newOfficeHour,
                    endTime: value ? dayjs(value).format("HH:mm") : "",
                  })
                }
                style={{ width: "100%" }}
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Location">
              <Input
                placeholder="FGH 201"
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

export default ManageOfficeHour;
