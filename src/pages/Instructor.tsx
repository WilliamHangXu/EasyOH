import { Layout, Row, Col } from "antd";

import "../css/Instructor.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/Firebase";
import CalendarPage from "./CalendarPage";
import ManageTAList from "../components/Instructor/ManageTAList";
import ManageChangeRequest from "../components/Instructor/ManageChangeRequest";
import Header from "../components/Header";
import ManageOfficeHour from "../components/Instructor/ManageOfficeHour";

const { Content } = Layout;

function Instructor() {
  const [user] = useAuthState(auth);
  return (
    <Layout className="layout">
      <Content className="content">
        <Header user={user} auth={auth} />
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <ManageTAList />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <ManageChangeRequest />
          </Col>
        </Row>
        <CalendarPage />
        <ManageOfficeHour user={user} />
      </Content>
    </Layout>
  );
}

export default Instructor;
