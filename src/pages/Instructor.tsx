import { useState } from "react";
import { Button } from "antd";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();
function Instructor() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding TA with email:", email);
    await setDoc(doc(db, "authorized_emails", email), {
      email: email,
    });
    setMessage("Added TA with email: " + email);
    setEmail("");
  };
  return (
    <div>
      <h1>Instructor</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email To Add as TA: </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button htmlType="submit">Submit</Button>
      </form>
      {message !== "" && <p>{message}</p>}

      <p>Maybe display a list of current TAs</p>
      <p>Display Calendar</p>
      <p>Display awaited messages</p>
    </div>
  );
}

export default Instructor;
