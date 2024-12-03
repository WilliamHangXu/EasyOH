import { useState, useEffect } from "react";
import { getFirestore } from "firebase/firestore";
import OfficeHour from "../../models/OfficeHour";
import { User } from "firebase/auth";
import { expandRecurringEvents, fetchAllOHByID } from "../../helper/Database";
import "../../css/Instructor.css";
import ManageAddOH from "./ManageOH/ManageAddOH";
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
