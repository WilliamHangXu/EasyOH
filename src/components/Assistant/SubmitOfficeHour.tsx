import React, { useState } from "react";
import {
  Input,
  Form,
  TimePicker,
  Select,
  Row,
  Col,
  Alert,
  Radio,
  DatePicker,
} from "antd";
import { daysOfWeek } from "../../constants/daysOfWeek";

const { Option } = Select;
const { TextArea } = Input;

interface SubmitOHProps {
  form: any;
}

const SubmitOfficeHour: React.FC<SubmitOHProps> = ({ form }) => {
  const [officeHourType, setOfficeHourType] = useState<
    "temporary" | "recurrence"
  >("temporary");
  const [showWarning, setShowWarning] = useState(false);

  const handleTypeChange = (e: any) => {
    const selectedType = e.target.value;
    setOfficeHourType(selectedType);
    if (selectedType === "recurrence") {
      setShowWarning(true); // Show the warning when recurrence is selected
    } else {
      setShowWarning(false); // Hide the warning for temporary
    }
  };

  return (
    <>
      <Form layout="vertical" form={form}>
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
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="End Time" name="endTime" required>
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Location" name="location">
              <Input placeholder="FGH 201" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Note to Instructor" name="note">
              <TextArea placeholder="Reason for the change" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default SubmitOfficeHour;
