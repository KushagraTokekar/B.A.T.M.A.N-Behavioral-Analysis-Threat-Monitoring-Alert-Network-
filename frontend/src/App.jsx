import RiskMap from "./pages/RiskMap";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";

import AdminDashboard from "./pages/AdminDashboard";
import ThreatAnalytics from "./pages/ThreatAnalytics";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/risk-map" element={<RiskMap />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/analytics" element={<ThreatAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;