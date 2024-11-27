import { getDocs, query, where, collection, Firestore, doc, deleteDoc } from "firebase/firestore";
import { message as antdMessage } from "antd";
import User from "../models/User";
import { adminAuth } from "../config/admin";

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
 * 
 */
export const fetchAllOHByID = async (): Promise<void> => {

};