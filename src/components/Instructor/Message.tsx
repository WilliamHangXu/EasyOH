import { getFirestore, doc, setDoc } from "firebase/firestore";
import "../../css/Message.css";

const db = getFirestore();
function Message() {
  return (
    <div>
      <h1>Message</h1>
      <div>message </div>
    </div>
  );
}

export default Message;
