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

interface ManageOHProps {
  user: User | null | undefined;
}

const ManageOfficeHour: React.FC<ManageOHProps> = ({ user }) => {
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

  useEffect(() => {
    if (user) fetchOfficeHours();
  }, [user]);

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
      <div>
        Your permenant office hours. If you change them, all temporary Edits for
        recent office hours will disappear!
      </div>
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
      ></List>

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

export default ManageOfficeHour;
