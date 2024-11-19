import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Assistant from "./pages/Assistant";
import Instructor from "./pages/Instructor";
import Signup from "./pages/Signup";
// This code is for private routing, a feature that can be added later
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "./config/Firebase";

// const PrivateRoutes = () => {
//   const [user, loading] = useAuthState(auth);

//   if (loading) {
//     return <div>Loading...</div>; // Show a loading indicator while checking authentication
//   }

//   return user ? <Outlet /> : <Navigate to="/login" />;
// };

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/instructor-dashboard" element={<Instructor />} />
        <Route path="/ta-dashboard" element={<Assistant />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
