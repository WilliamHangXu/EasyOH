import { Link } from "react-router-dom";
import { Button } from "antd";

function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>Welcome to the home page!</p>
      <Button>
        <Link to="/login">Login</Link>
      </Button>
      <p>Calendar here</p>
    </>
  );
}

export default Home;
