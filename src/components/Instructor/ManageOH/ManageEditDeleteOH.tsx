import React from "react";
import { Button, message as antdMessage, Space, List } from "antd";
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
import OfficeHour from "../../../models/OfficeHour";
import { User } from "firebase/auth";
import dayjs from "dayjs";
import {
  fetchAllOHByID,
  expandRecurringEvents,
} from "../../../helper/Database";
import { daysOfWeek } from "../../../constants/daysOfWeek";

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

  const handleEditOfficeHour = async (
    id: string,
    updatedData: Partial<OfficeHour>
  ) => {
    await updateDoc(doc(db, "officeHours", id), updatedData);
    const oh = await fetchAllOHByID(db, user?.uid || "");
    setOfficeHours(oh);
    setFlattenedOH(expandRecurringEvents(oh));
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
                <span>{dayjs(oh.tmpDate).format("YYYY-MM-DD")}</span>
                <span>
                  {oh.startTime} - {oh.endTime}
                </span>
                <span>{oh.location || ""}</span>
              </Space>
            </List.Item>
          )
        }
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
    </>
  );
};

export default ManageEditDeleteOH;
