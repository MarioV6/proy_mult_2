
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Box, LayoutDashboard } from "lucide-react";
import Calendario from "./components/calendario/Calendario";
import "./Dashboard.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <motion.nav 
        className="sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="sidebar-logo">
          <span>LOGO</span>
        </div>

        <div className="sidebar-nav">
          <Link to="/" className="nav-link">
            <LayoutDashboard size={20} />
            <span>Inicio</span>
          </Link>
          <Link to="/calendario" className="nav-link">
            <CalendarIcon size={20} />
            <span>Calendario</span>
          </Link>
          <Link to="/inventario" className="nav-link">
            <Box size={20} />
            <span>Inventario</span>
          </Link>
        </div>
      </motion.nav>

      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>Antes de los Hilos</span>
          </div>
        </header>

        <main className="content-area">
          <Outlet /> {}
        </main>
      </div>
    </div>
  );
};

const Home = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h1>Bienvenido</h1>
    <p>Al visor de costos e inventario.</p>
  </motion.div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="inventario" element={<div>Inventario</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

