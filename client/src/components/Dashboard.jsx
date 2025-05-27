import Navbar from "./Navbar";
import Footer from "./Footer";
import Message from "./Message";

// Dashboard Component
const Dashboard = ({ userData, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* <Navbar /> */}
      <div className="p-6 min-h-screen">
        <Message userData={userData} />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;
