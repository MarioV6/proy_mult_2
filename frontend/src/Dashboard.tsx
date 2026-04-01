
import { motion } from "framer-motion";
import { Calendar, LayoutDashboard, Box } from "lucide-react";
import { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="dashboard-layout">
      {/* Sidebar Izquierda */}
      <motion.nav 
        className="sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="sidebar-logo">
          {/* logo */}
          <span style={{ fontSize: "0.9rem" }}>ESPACIO PARA LOGO</span>
        </div>

        <div className="sidebar-nav">
          <motion.button 
            className={`nav-button ${activeTab === "calendar" ? "active" : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("calendar")}
          >
            <Calendar size={20} />
            <span>Calendario</span>
          </motion.button>

          <motion.button 
            className={`nav-button ${activeTab === "inventory" ? "active" : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("inventory")}
          >
            <Box size={20} />
            <span>Inventario</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <motion.header 
          className="topbar"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <LayoutDashboard size={24} color="#9d4edd" />
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>Dashboard de Precios</span>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            miercoles, 25 de marzo de 2026
          </div>
        </motion.header>

        <main className="content-area">
          <motion.section 
            className="welcome-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1>Bienvenido al Sistema</h1>
            <p>Bienvenido a antes de los hilos.</p>
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

