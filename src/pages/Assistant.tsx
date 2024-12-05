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
  Input,
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
import {
  expandRecurringEvents,
  formToCreateRequest,
  formToEditRequest,
} from "../helper/Database";
import ChangeRequest from "../models/ChangeRequest";
import RequestCard from "../components/Assistant/RequestCard";
import dayjs from "dayjs";

const db = getFirestore();
const { Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

function Assistant() {
  const [user] = useAuthState(auth);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [flattenedOH, setFlattenedOH] = useState<OfficeHour[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [selectedOH, setSelectedOH] = useState<OfficeHour | null>(null);
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
      ...doc.data(),
    })) as OfficeHour[];
    setOfficeHours(officeHoursData);
    setFlattenedOH(expandRecurringEvents(officeHoursData));
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    const tDate = dayjs(values.tmpDate).toISOString();
    const st = dayjs(values.startTime).format("HH:mm");
    const et = dayjs(values.endTime).format("HH:mm");
    const tmpStartTime = `${tDate.split("T")[0]}T${st}:00Z`;
    const tmpEndTime = `${tDate.split("T")[0]}T${et}:00Z`;

    const updatedData = {
      ...selectedOH,
      ...values,
      isRecurring: false,
      startTime: values.startTime.format("HH:mm"),
      endTime: values.endTime.format("HH:mm"),
      tmpDate: values.tmpDate ? values.tmpDate.toISOString() : "",
      tmpStartTime: tmpStartTime,
      tmpEndTime: tmpEndTime,
    };
    if (!selectedOH) return;
    await formToEditRequest(form, user, db, selectedOH, updatedData);

    // if (selectedOH?.createdAt && selectedOH?.tmpStartTime) {
    //   await addExceptionToOfficeHour(
    //     db,
    //     selectedOH.createdAt,
    //     selectedOH.tmpStartTime
    //   );
    // }

    // const oh = await fetchAllOHByID(db, user?.uid || "");
    // setOfficeHours(oh);
    // setFlattenedOH(expandRecurringEvents(oh));

    setIsModalVisible(false); // Close the modal
    setSelectedOH(null); // Reset selected office hour
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
          <h2>Your Upcoming Office Hours</h2>
          <div>Your office hour, up to 2 months from now.</div>
          <List
            bordered
            dataSource={flattenedOH}
            className="scrollable-list"
            renderItem={(oh) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => {
                      setIsEditModalVisible(true);
                      setSelectedOH(oh);
                    }}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => {
                      setIsDeleteModalVisible(true);
                      setSelectedOH(oh);
                    }}
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

          <h2>Your Recurrence Office Hours</h2>
          <div>
            Your permenant office hours. If you change them, all temporary Edits
            for recent office hours will disappear!
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
                      onClick={() => {
                        setIsEditModalVisible(true);
                        setSelectedOH(oh);
                      }}
                    >
                      Edit
                    </Button>,
                    <Button
                      type="link"
                      danger
                      onClick={() => {
                        setIsDeleteModalVisible(true);
                        setSelectedOH(oh);
                      }}
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
              )
            }
          />
          <Modal
            title="Edit Office Hour"
            open={isEditModalVisible}
            onOk={handleModalOk}
            onCancel={() => {
              setIsEditModalVisible(false);
              setSelectedOH(null);
            }}
            okText="Save"
            cancelText="Cancel"
          >
            {selectedOH && (
              <div>
                <p>
                  You are modifying a
                  {selectedOH.isRecurring
                    ? "n instance of a Recurring "
                    : " Temporary "}
                  event.
                </p>
                <p>
                  <strong>Old time: </strong>
                  {selectedOH.dayOfWeek !== undefined &&
                    daysOfWeek[selectedOH.dayOfWeek]}{" "}
                  {selectedOH.startTime} - {selectedOH.endTime}
                </p>
              </div>
            )}
            <SubmitOfficeHour
              form={form}
              isInsturctor={false}
              isEditing={true}
            />
          </Modal>

          <Modal
            title="Delete Office Hour"
            open={isDeleteModalVisible}
            onOk={handleModalOk}
            onCancel={() => {
              setIsEditModalVisible(false);
              setSelectedOH(null);
            }}
            okText="Save"
            cancelText="Cancel"
          >
            {selectedOH && (
              <div>
                <p>
                  You are deleting a
                  {selectedOH.isRecurring
                    ? "n instance of a Recurring "
                    : " Temporary "}
                  event.
                </p>
                <p>
                  <strong>Old time: </strong>
                  {selectedOH.dayOfWeek !== undefined &&
                    daysOfWeek[selectedOH.dayOfWeek]}{" "}
                  {selectedOH.startTime} - {selectedOH.endTime}
                </p>
              </div>
            )}
            <Text>Please make sure you want to delete this office hour!</Text>
            <TextArea placeholder="Reason for the change" />
          </Modal>
          <Button
            type="primary"
            style={{ marginTop: "20px" }}
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
