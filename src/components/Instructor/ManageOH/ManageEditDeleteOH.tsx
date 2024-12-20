import React, { useEffect, useState } from "react";
import { Button, message as antdMessage, Space, List, Modal, Form } from "antd";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import OfficeHour from "../../../models/OfficeHour";
import { User } from "firebase/auth";
import dayjs from "dayjs";
import {
  fetchAllOHByID,
  expandRecurringEvents,
} from "../../../helper/Database";
import { daysOfWeek } from "../../../constants/daysOfWeek";
import SubmitOfficeHour from "../../Assistant/SubmitOfficeHour";
import {
  insertTemporaryOfficeHour,
  addExceptionToOfficeHour,
} from "../../../helper/Database";

interface ManageEditDeleteOHProps {
  user: User | null | undefined;
  officeHours: OfficeHour[];
  setOfficeHours: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
  flattenedOH: OfficeHour[];
  setFlattenedOH: React.Dispatch<React.SetStateAction<OfficeHour[]>>;
}

const db = getFirestore();

const ManageEditDeleteOH: React.FC<ManageEditDeleteOHProps> = ({
  user,
  officeHours,
  setOfficeHours,
  flattenedOH,
  setFlattenedOH,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOH, setSelectedOH] = useState<OfficeHour | null>(null);

  useEffect(() => {
    setFlattenedOH(expandRecurringEvents(officeHours));
  }, [officeHours]);

  const handleDeleteOfficeHour = async (createdAt: string) => {
    const querySnapshot = await getDocs(
      query(collection(db, "officeHours"), where("createdAt", "==", createdAt))
    );
    const docId = querySnapshot.docs[0].id;
    await deleteDoc(doc(db, "officeHours", docId));
    antdMessage.success("Office hour deleted successfully!");
    const oh = await fetchAllOHByID(db, user?.uid || "");
    setOfficeHours(oh);
    setFlattenedOH(expandRecurringEvents(oh));
  };

  const handleDeleteTmp = async (createdAt: string) => {
    await addExceptionToOfficeHour(db, createdAt, dayjs().toISOString());
    const oh = await fetchAllOHByID(db, user?.uid || "");
    setOfficeHours(oh);
    setFlattenedOH(expandRecurringEvents(oh));
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

    await insertTemporaryOfficeHour(db, updatedData);

    if (selectedOH?.createdAt && selectedOH?.tmpStartTime) {
      await addExceptionToOfficeHour(
        db,
        selectedOH.createdAt,
        selectedOH.tmpStartTime
      );
    }

    const oh = await fetchAllOHByID(db, user?.uid || "");
    setOfficeHours(oh);
    setFlattenedOH(expandRecurringEvents(oh));

    setIsModalVisible(false); // Close the modal
    setSelectedOH(null); // Reset selected office hour
  };

  return (
    <>
      <h2>Your Upcoming Office Hours</h2>
      <div>Your office hour, up to 2 months from now.</div>
      <List
        bordered
        dataSource={flattenedOH}
        className="scrollable-list"
        renderItem={(oh) =>
          (oh.tmpDate === "" || dayjs() < dayjs(oh.tmpDate)) && (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedOH(oh);
                    setIsModalVisible(true);
                    form.setFieldValue;
                  }}
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteTmp(oh.createdAt)}
                >
                  Delete
                </Button>,
              ]}
            >
              <Space>
                <span>{dayjs(oh.tmpDate).format("YYYY-MM-DD")}</span>
                <span>
                  {oh.startTime} - {oh.endTime} -{" "}
                  {oh.isRecurring && "Recurring"}
                </span>
                <span>{oh.location || ""}</span>
              </Space>
            </List.Item>
          )
        }
      />

      <Modal
        title="Edit Office Hour"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
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
        <SubmitOfficeHour form={form} isInsturctor={true} isEditing={true} />
      </Modal>

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
                  onClick={() => {
                    setSelectedOH(oh);
                    setIsModalVisible(true);
                    form.setFieldsValue({
                      // NOTE: THIS IS WRONG!!! FIX ME!!!
                      ...oh,
                      dayOfWeek: oh.dayOfWeek,
                      tmpDate: oh.tmpDate ? dayjs(oh.tmpDate) : undefined,
                      startTime: dayjs(oh.startTime, "HH:mm"),
                      endTime: dayjs(oh.endTime, "HH:mm"),
                    });
                  }}
                >
                  Edit
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
    </>
  );
};

export default ManageEditDeleteOH;
