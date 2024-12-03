import { useState, useEffect } from "react";
import {
  Button,
  message as antdMessage,
  Space,
  List,
  Layout,
  Typography,
  Modal,
  Form,
  Card,
  Collapse,
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
} from "firebase/firestore";
import OfficeHour from "../models/OfficeHour";
import Header from "../components/Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/Firebase";
import CalendarPage from "./CalendarPage";
import SubmitOfficeHour from "../components/Assistant/SubmitOfficeHour";
import { daysOfWeek } from "../constants/daysOfWeek";
import { formToCreateRequest } from "../helper/Database";
import ChangeRequest from "../models/ChangeRequest";
import RequestCard from "../components/Assistant/RequestCard";

const db = getFirestore();
const { Content } = Layout;
const { Text } = Typography;

function Assistant() {
  const [user] = useAuthState(auth);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOfficeHours();
    fetchChangeRequests();
  }, [user]);

  const fetchChangeRequests = async () => {
    const changeRequestQuery = query(
      collection(db, "changeRequests"),
      where("userId", "==", user?.uid)
    );
    const querySnapshot = await getDocs(changeRequestQuery);
    const changeRequestsData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    })) as ChangeRequest[];
    console.log("Change Requests:", changeRequestsData);
    setChangeRequests(changeRequestsData);
  };

  const handleCreateForm = async () => {
    try {
      const values = await form.validateFields(); // Validate and get form values
      console.log("Form Data:", values);
      setIsModalVisible(false);
      form.resetFields();
      const cr = await formToCreateRequest(values, user, db);
      setChangeRequests([...changeRequests, cr]);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

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
          <Text>
            As a TA, your changes to Office Hours needs to be approved by an
            Instructor.
          </Text>
          <Card className="card">
            <div className="message-section">
              <h3>Submitted Change Requests:</h3>
              <Collapse>
                {changeRequests.map((request, index) => (
                  <Collapse.Panel
                    header={`Operation: ${request.operation} | Status: ${request.status}`}
                    key={index}
                  >
                    <RequestCard request={request} />
                  </Collapse.Panel>
                ))}
              </Collapse>
            </div>
          </Card>
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
                  <span>
                    {oh.dayOfWeek !== undefined && daysOfWeek[oh.dayOfWeek]}
                  </span>
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
                  <span>
                    {oh.dayOfWeek !== undefined && daysOfWeek[oh.dayOfWeek]}
                  </span>
                  <span>
                    {oh.startTime} - {oh.endTime}
                  </span>
                  <span>{oh.location || "No location specified"}</span>
                </Space>
              </List.Item>
            )}
          />
          <Button
            type="primary"
            onClick={() => setIsModalVisible(!isModalVisible)}
          >
            Add an Office Hour☠️
          </Button>
          <Modal
            title="Add a Teaching Assistant"
            open={isModalVisible}
            onOk={handleCreateForm}
            onCancel={() => setIsModalVisible(false)}
            okText="Add"
            cancelText="Cancel"
          >
            <SubmitOfficeHour form={form} />
          </Modal>
        </Content>
      </Layout>
    </>
  );
}

export default Assistant;
