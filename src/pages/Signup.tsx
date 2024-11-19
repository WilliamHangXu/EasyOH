import { Button } from "antd";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../config/Firebase";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const navigate = useNavigate();

  const createUser = async (e: any) => {
    e.preventDefault();
    // Case 1: check if passwords match
    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }

    // Case 2: check if instructor has authorized the email
    const userDoc = await getDoc(doc(db, "authorized_emails", email));
    if (!userDoc.exists()) {
      alert("Sorry! Email not authorized");
      return;
    }

    // Case 3: Check if the user has already signed up
    const existingUserSnapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", email))
    );

    if (!existingUserSnapshot.empty) {
      alert("User already signed up! Please log in.");
      navigate("/login");
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "ta",
    });
    navigate("/ta-dashboard");
  };

  return (
    <div>
      <h1>Signup</h1>
      <p>If you are an instructor, you don't need to signup!</p>
      <form onSubmit={createUser}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">Retype Password:</label>
        <input
          type="password"
          id="password2"
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
          }}
        />
        <Button htmlType="submit">Signup</Button>
      </form>
    </div>
  );
}

export default Signup;
