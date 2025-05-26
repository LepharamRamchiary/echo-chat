
import Navbar from "./Navbar";
import Footer from "./Footer";

// Dashboard Component
const Dashboard = ({ userData, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      <Footer />
    </div>
  );
};

export default Dashboard;
