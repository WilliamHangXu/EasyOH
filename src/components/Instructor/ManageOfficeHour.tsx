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
import { expandRecurringEvents, fetchAllOHByID } from "../../helper/Database";
import "../../css/Instructor.css";
import ManageAddOH from "./ManageOH/ManageAddOH";
import { daysOfWeek } from "../../constants/daysOfWeek";
import ManageEditDeleteOH from "./ManageOH/ManageEditDeleteOH";

const db = getFirestore();

interface ManageOHProps {
  user: User | null | undefined;
}

const ManageOfficeHour: React.FC<ManageOHProps> = ({ user }) => {
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [flattenedOH, setFlattenedOH] = useState<OfficeHour[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const officehours = await fetchAllOHByID(db, user?.uid || "");
        setOfficeHours(officehours);
        setFlattenedOH(expandRecurringEvents(officehours));
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      <ManageEditDeleteOH
        user={user}
        officeHours={officeHours}
        setOfficeHours={setOfficeHours}
        flattenedOH={flattenedOH}
        setFlattenedOH={setFlattenedOH}
      />
      <ManageAddOH
        user={user}
        setOfficeHours={setOfficeHours}
        setFlattenedOH={setFlattenedOH}
      />
    </>
  );
};

export default ManageOfficeHour;
