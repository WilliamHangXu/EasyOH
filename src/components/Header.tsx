import { Button, Col, Typography } from "antd";
import { signOut, User } from "firebase/auth";
const { Title } = Typography;

interface HeaderProps {
  user: User | null | undefined;
  auth: any;
}

const Header: React.FC<HeaderProps> = ({ user, auth }) => {
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      window.location.href = "/";
    }
  };

  return (
    <Col className="header-container">
      <Title level={2}>Welcome, {user?.email}</Title>
      <Button onClick={handleLogout} className="logout-button">
        Log Out
      </Button>
    </Col>
  );
};

export default Header;
