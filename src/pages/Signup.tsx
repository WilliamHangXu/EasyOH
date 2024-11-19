import { Button } from "antd";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../config/Firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const createUser = async (e: any) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      role: "ta",
    });
  };
  return (
    <div>
      <h1>Signup</h1>
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
