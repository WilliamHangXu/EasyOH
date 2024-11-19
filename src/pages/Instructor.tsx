import { useState } from "react";
import { Button } from "antd";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();
function Instructor() {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      <p>Maybe display a list of current TAs</p>
      <p>Display Calendar</p>
      <p>Display awaited messages</p>
    </div>
  );
}

export default Instructor;
