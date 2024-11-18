import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "antd";

const db = getFirestore();

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid)); // Assuming `users` collection holds roles
      if (!userDoc.exists()) {
        setError("Role information not found for this user.");
        return;
      }

      const { role } = userDoc.data() as { role: string };
      if (role === "instructor") {
        // Redirect to instructor dashboard
        navigate("/instructor-dashboard");
      } else if (role === "TA") {
        // Redirect to TA dashboard
        navigate("/ta-dashboard");
      } else {
        setError("Unknown role.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to login. Please check your credentials.");
    }
  };

  return (
    <>
      <h1>Login</h1>
      <p>Welcome to the login page!</p>
      <form onSubmit={handleLogin}>
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
        <Button htmlType="submit">Login</Button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/">Home Page</Link>
    </>
  );
}

export default Login;