// import { Link } from "react-router-dom";
// import { Button, Typography, Layout, Card } from "antd";
// import "../css/Home.css";

// const { Title, Text } = Typography;
// const { Content } = Layout;

// function Home() {
//   return (
//     <Layout className="layout">
//       <Content className="content">
//         <Card className="card">
//           <Title level={2}>CS 2201 Office Hours</Title>
//           <Text type="secondary">
//             Welcome to this office hour that does not exist yet!
//           </Text>
//           <div className="button-container">
//             <Button type="primary" size="large">
//               <Link to="/login">Login</Link>
//             </Button>
//           </div>
//           <Text>Calendar here</Text>
//         </Card>
//       </Content>
//     </Layout>
//   );
// }

// export default Home;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';

const StudentPage: React.FC = () => {
  const navigate = useNavigate(); // React Router's useNavigate for navigation

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="student-container">
      <header className="student-header">
        <h1>Office Hours Viewer</h1>
        <button onClick={handleLoginClick} className="login-button">
          Login for TAs and Instructors
        </button>
      </header>

      <main className="student-calendar">
        <h2>Weekly Office Hours Schedule</h2>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=c_5402a26b28164d318527d4655119ac3ae212f331f32594e1634372420687502f%40group.calendar.google.com&ctz=America%2FChicago&mode=week" // Replace with actual Google Calendar embed link
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder="0"
          scrolling="no"
          title="Office Hours Calendar"
        ></iframe>
      </main>
    </div>
  );
};

export default StudentPage;
