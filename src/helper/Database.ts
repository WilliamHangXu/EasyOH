import { getDocs, query, where, collection, Firestore, doc, deleteDoc } from "firebase/firestore";
import { message as antdMessage } from "antd";
import User from "../models/User";
import OfficeHour from "../models/OfficeHour";
import dayjs from "dayjs";

/**
 * Fetches a list of Teaching Assistants (TAs) from the Firestore database.
 * @param db - Firestore database instance.
 * @returns A promise that resolves to an array of TA objects.
 */
export const fetchTAs = async (db: Firestore): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const tas: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as User;
      if (data.role === "ta") {
        tas.push({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          email: data.email,
          joinTime: data.joinTime,
        });
      }
    });
    return tas;
  } catch (error) {
    console.error("Error fetching TA list:", error);
    antdMessage.error("Failed to fetch TA list. Please try again.");
    throw error;
  }
};

/**
 * Deletes a TA from the "users" and "authorizedEmails" collections.
 * @param db - The Firestore database instance.
 * @param email - The email of the TA to delete.
 */
export const deleteTAByEmail = async (db: Firestore, email: string): Promise<void> => {
  try {
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      for (const docSnapshot of userSnapshot.docs) {
        await deleteDoc(doc(db, "users", docSnapshot.id));
      }
    await deleteDoc(doc(db, "authorizedEmails", email));
    // NOTE: LATER, need to delete its office hour and messages too.
    }
  } catch (error) {
    console.error("Error deleting TA:", error);
    throw error; 
  }
};

/**
 * Fetching OH by user ID
 * @param db - The Firestore database instance.
 * @param userId - The email of the TA to delete.
 * @returns All OfficeHours
 */
export const fetchAllOHByID = async (db: Firestore, userId: string): Promise<OfficeHour[]> => {
  const officeHoursQuery = query(
    collection(db, "officeHours"),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(officeHoursQuery);

  const fetchedOfficeHours = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  })) as OfficeHour[];


  return fetchedOfficeHours;
};

/**
 * Expands recurring events into individual events.
 * @param officeHours - The list of officeHour to expand.
 * @returns The expanded list of officeHour.
 */
export const expandRecurringEvents = (officeHours: OfficeHour[]): OfficeHour[]  => {
  const today = dayjs();
  const result: OfficeHour[] = [];

  for(const officeHour of officeHours) {
    // means it is a recurring event
    if (officeHour.dayOfWeek !== -1) {
      let currentDate = today.startOf("day");
      const maxDate = today.add(2, "months");

      while (currentDate.isBefore(maxDate)) {
        if (currentDate.day() === officeHour.dayOfWeek) {
          result.push({
            ...officeHour,
            tmpDate: currentDate.toISOString(),
          });
        }
        currentDate = currentDate.add(1, "day");
      }
    } else {
      result.push({ ...officeHour });
    }
  }
  // sort result by tmpDate
  result.sort((a, b) => dayjs(a.tmpDate).diff(dayjs(b.tmpDate)));
  return result;
}