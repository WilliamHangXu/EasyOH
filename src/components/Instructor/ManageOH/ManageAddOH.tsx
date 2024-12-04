import {
  Button,
  Input,
  Form,
  message as antdMessage,
  TimePicker,
  Select,
  Row,
  Col,
  Alert,
  Radio,
  DatePicker,
} from "antd";
import { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dayjs from "dayjs";
import { User } from "firebase/auth";
import OfficeHour from "../../../models/OfficeHour";
import { daysOfWeek } from "../../../constants/daysOfWeek";

const { Option } = Select;
const db = getFirestore();

interface ManageAddOHProps {
  user: User | null | undefined;
  setOfficeHours: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
  setFlattenedOH: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
}

const ManageAddOH: React.FC<ManageAddOHProps> = ({ user, setOfficeHours }) => {
  const [form] = Form.useForm(); // Create a Form instance
  const [officeHourType, setOfficeHourType] = useState<
    "temporary" | "recurrence"
  >("temporary");
  const [showWarning, setShowWarning] = useState(false);

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
  const [newOfficeHour, setNewOfficeHour] = useState({
    dayOfWeek: -1,
    startTime: "",
    endTime: "",
    location: "FGH 201",
    isRecurring: false,
    tmpDate: "",
  });

  const handleAddOfficeHour = async () => {
    const data = await form.validateFields();
    console.log("hi", data);
    const start = dayjs(`2023-01-01 ${dayjs(data.startTime).format("HH:mm")}`);
    const end = dayjs(`2023-01-01 ${dayjs(data.endTime).format("HH:mm")}`);

    if (!start.isBefore(end)) {
      antdMessage.error("Start time must be earlier than end time.");
      return;
    }

    if (end.diff(start, "minute") < 60) {
      antdMessage.error("Office hours must be at least one hour long.");
      return;
    }

    let newEntry: OfficeHour = {
      userId: user?.uid || "",
      createdBy: user?.email || "",
      createdAt: new Date().toISOString(),
      dayOfWeek: officeHourType === "recurrence" ? data.dayOfWeek : -1,
      isRecurring: officeHourType === "recurrence",
      startTime: dayjs(data.startTime).format("HH:mm"),
      endTime: dayjs(data.endTime).format("HH:mm"),
      location: data.location || "FGH 201",
      exceptions: [],
    };

    if (officeHourType === "temporary") {
      const tmpDate = dayjs(data.tmpDate).toISOString();
      const startTime = dayjs(data.startTime).format("HH:mm");
      const endTime = dayjs(data.endTime).format("HH:mm");
      const tmpStartTime = `${tmpDate.split("T")[0]}T${startTime}:00Z`;
      const tmpEndTime = `${tmpDate.split("T")[0]}T${endTime}:00Z`;
      newEntry = {
        ...newEntry,
        tmpDate: tmpDate,
        tmpStartTime: tmpStartTime,
        tmpEndTime: tmpEndTime,
      };
    } else {
      newEntry = {
        ...newEntry,
        dtStart: `${dayjs().toISOString().split("T")[0]}T${dayjs(
          data.startTime
        ).format("HH:mm")}:00Z`,
      };
    }

    await addDoc(collection(db, "officeHours"), newEntry);
    setOfficeHours((prev) => [...prev, newEntry]);
    console.log(officeHourType);

    form.resetFields();

    setNewOfficeHour({
      dayOfWeek: -1,
      startTime: "",
      endTime: "",
      location: "FGH 201",
      isRecurring: false,
      tmpDate: "",
    });
    antdMessage.success("Office hour added successfully! Please refresh.");
  };
  return (
    <>
      <h2>Add an Office Hour</h2>
      <p>Not feeling well? Try Edit Recent Office Hours above!</p>
      <Form form={form} layout="vertical">
        <Form.Item
          name="ohType"
          label="Select a Type of Office Hour"
          rules={[{ required: true, message: "Please select the Type!" }]}
        >
          <Radio.Group onChange={handleTypeChange} value={officeHourType}>
            <Radio value="temporary">Temporary</Radio>
            <Radio value="recurrence">Recurrence</Radio>
          </Radio.Group>
        </Form.Item>

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
                <Select placeholder="Select Day" style={{ width: "100%" }}>
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
                  style={{ width: "100%" }}
                ></DatePicker>
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item label="Start Time" name="startTime" required>
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="End Time" name="endTime" required>
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Location" name="location">
              <Input placeholder="FGH 201" value={newOfficeHour.location} />
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

export default ManageAddOH;
