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
import { useState, useEffect } from "react";
import { getFirestore, doc, collection, addDoc } from "firebase/firestore";
import dayjs from "dayjs";
import {
  fetchAllOHByID,
  expandRecurringEvents,
} from "../../../helper/Database";
import { User } from "firebase/auth";
import OfficeHour from "../../../models/OfficeHour";

const { Option } = Select;
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

interface ManageAddOHProps {
  user: User | null | undefined;
  setOfficeHours: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
  setFlattenedOH: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
}

const ManageAddOH: React.FC<ManageAddOHProps> = ({
  user,
  setOfficeHours,
  setFlattenedOH,
}) => {
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
      : "";

    const newEntry = {
      userId: user?.uid || "",
      createdBy: user?.email || "",
      createdAt: new Date().toISOString(),
      ...newOfficeHour,
      recurrenceRule,
      exceptions: [],
    };

    await addDoc(collection(db, "officeHours"), newEntry);
    setOfficeHours((prev) => [...prev, newEntry]);
    setFlattenedOH((prev) => [...prev, ...expandRecurringEvents([newEntry])]);

    form.resetFields();

    setNewOfficeHour({
      dayOfWeek: 0,
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
        <Form.Item label="Type of Office Hour">
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

export default ManageAddOH;
