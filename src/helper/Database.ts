import { getDocs, query, where, collection, Firestore, doc, deleteDoc, addDoc,getDoc} from "firebase/firestore";
import { message as antdMessage } from "antd";
import { User as FirebaseUser } from "firebase/auth";
import User from "../models/User";
import OfficeHour from "../models/OfficeHour";
import dayjs from "dayjs";
import ChangeRequest from "../models/ChangeRequest";

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
    if (officeHour.isRecurring) {
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

export const formToCreateRequest = async (form: any, user: FirebaseUser | null | undefined, db: Firestore): Promise<ChangeRequest>  => {
  if (!user?.uid || !user?.email) {
    throw new Error("User ID and email is required to create a ChangeRequest");
  }
    // Extract form values
    const {
      tmpDate,
      startTime,
      endTime,
      location,
      note,
      ohType,
    } = form;

    // Create the OfficeHour object
    let primaryOH: OfficeHour = {
      userId: user.uid,
      createdBy: user.email,
      createdAt: dayjs().toISOString(),
      dayOfWeek: ohType === "recurrence" ? form.dayOfWeek : -1,
      startTime: dayjs(startTime).format("HH:mm"),
      endTime: dayjs(endTime).format("HH:mm"),
      location: location || "FGH 201",
      isRecurring: ohType === "recurrence",
      exceptions: [],
      tmpDate: dayjs(tmpDate).toISOString(),
    };

    console.log("Form Data:", primaryOH);

    if (ohType === "temporary") {
      const tDate = dayjs(tmpDate).toISOString();
      const st = dayjs(startTime).format("HH:mm");
      const et = dayjs(endTime).format("HH:mm");
      const tmpStartTime = `${tDate.split("T")[0]}T${st}:00Z`;
      const tmpEndTime = `${tDate.split("T")[0]}T${et}:00Z`;
      primaryOH = {
        ...primaryOH,
        tmpDate: tDate,
        tmpStartTime: tmpStartTime,
        tmpEndTime: tmpEndTime,
      };
      console.log("Form Data here!", primaryOH);
    } else {
      primaryOH = {
        ...primaryOH,
        dtStart: `${dayjs().toISOString().split("T")[0]}T${dayjs(
          startTime
        ).format("HH:mm")}:00Z`,
      };
    }

    const userDoc = (await getDoc(doc(db, "users", user.uid))).data();
  
    // Create the ChangeRequest object
    const changeRequest: ChangeRequest = {
      userId: user.uid,
      userFirstName: userDoc?.firstName,
      userLastName: userDoc?.lastName,
      operation: "create",
      primaryOH: primaryOH,
      taNote: note,
      status: "pending",
      submittedAt: dayjs().toISOString(),
    };

  
    // Insert the ChangeRequest object into the Firebase database
    const collectionRef = collection(db, "changeRequests");
    await addDoc(collectionRef, changeRequest);
    return changeRequest;
}

/**
 * Fetches all pending ChangeRequests from the Firestore database.
 * @returns A promise that resolves to an array of pending ChangeRequest objects.
 */
export const fetchPendingChangeRequests = async (db: Firestore): Promise<ChangeRequest[]> => {
  try {
    // Reference to the 'changeRequests' collection
    const changeRequestsCollection = collection(db, "changeRequests");

    // Create a query to filter for 'pending' change requests
    const pendingQuery = query(
      changeRequestsCollection,
      where("status", "==", "pending")
    );

    // Retrieve the filtered documents
    const snapshot = await getDocs(pendingQuery);

    // Map through the documents to get their data
    const pendingChangeRequests = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    })) as ChangeRequest[];

    return pendingChangeRequests;
  } catch (error) {
    console.error("Error fetching pending change requests:", error);
    throw error;
  }
};