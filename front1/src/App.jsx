import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";             // ให้ตรงตัวพิมพ์
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Members from "./pages/Member/Members.jsx";
import AddMember from "./pages/Member/AddMember.jsx";   // หรือเปลี่ยนให้ตรงชื่อไฟล์จริง
import Bands from "./pages/Band/Bands.jsx";
import BandDetail from "./pages/Band/BandDetail.jsx";     // ✅ path ใหม่
import Schedules from "./pages/Schedule/Schedules.jsx";
import AddSchedule from "./pages/Schedule/AddSchedules.jsx"; // หรือเปลี่ยนให้ตรงชื่อไฟล์จริง
//import AddBand from "./pages/Band/AddBands.jsx";
import Finances from "./pages/Finance/Finances.jsx";
import Equipments from "./pages/Equipment/Equipments.jsx";
import Documents from "./pages/Documents.jsx"; // ✅ path ใหม่



export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/members" element={<Members />} />
          <Route path="/members/add" element={<AddMember />} /> 
          <Route path="/documents" element={<Documents />} /> 
          <Route path="/bands" element={<Bands />} />
          <Route path="/bands/:id" element={<BandDetail />} />   
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/schedules/add" element={<AddSchedule />} /> {/* ✅ หน้าเพิ่มตาราง */}
          <Route path="/finances" element={<Finances />} />
          <Route path="/equipments" element={<Equipments />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
