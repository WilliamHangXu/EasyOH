import React from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Button } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import "../css/Home.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const Home: React.FC = () => {
  return (
    <div className="layout">
      <div className="content">
        <div className="welcome-section">
          <Title level={2}>Welcome to CS 2201 Office Hours!</Title>
          <Text type="secondary">TA schedules for Fall 2025</Text>
        </div>
        <div className="calendar-container">
          <iframe
            src={import.meta.env.VITE_CALENDAR_EMBED_URL}
            className="calendar-iframe"
            title="CS 2201 Office Hours Calendar"
          ></iframe>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Button type="primary" icon={<LoginOutlined />} size="large">
            <Link to="/login">Admin Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
