import { Link } from "react-router-dom";
import { Button, Typography, Layout, Card } from "antd";
import "../css/Home.css";

const { Title, Text } = Typography;
const { Content } = Layout;

function Home() {
  return (
    <Layout className="layout">
      <Content className="content">
        <Card className="card">
          <Title level={2}>CS 2201 Office Hours</Title>
          <Text type="secondary">
            Welcome to this office hour that does not exist yet!
          </Text>
          <div className="button-container">
            <Button type="primary" size="large">
              <Link to="/login">Login</Link>
            </Button>
          </div>
          <Text>Calendar here</Text>
        </Card>
      </Content>
    </Layout>
  );
}

export default Home;
