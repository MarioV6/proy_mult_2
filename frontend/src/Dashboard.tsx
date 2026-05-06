import { motion } from "framer-motion";
import { Calendar, LayoutDashboard, Box, Database, User } from "lucide-react";
import { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [externalUser, setExternalUser] = useState({ id: 0, name: "Cargando..." });

  useEffect(() => {
    const fetchExternalUser = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/external-user/");
        const data = await response.json();
        setExternalUser(data);
      } catch (error) {
        console.error("Error fetching external user:", error);
        setExternalUser({ id: 0, name: "Laravel no conectado" });
      }
    };
    fetchExternalUser();
  }, []);

  const testDBConnection = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/db-check/");
      const data = await response.json();
      if (data.status === "ok") {
        alert("¡Conexión exitosa!: " + data.message);
      } else {
        alert("Error en la conexión: " + data.message);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("No se pudo conectar con el servidor backend (asegúrate de que esté corriendo en el puerto 8000)");
    }
  };

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

          {/* Botón de prueba de DB debajo de Inventario */}
          <motion.button 
            className="nav-button"
            whileHover={{ scale: 1.05, backgroundColor: "#3a0ca3" }}
            whileTap={{ scale: 0.95 }}
            onClick={testDBConnection}
            style={{ marginTop: "1rem", backgroundColor: "#4361ee", color: "white" }}
          >
            <Database size={20} />
            <span>Probar DB</span>
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
          
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(67, 97, 238, 0.1)", padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid rgba(67, 97, 238, 0.2)" }}>
              <div style={{ background: "#4361ee", padding: "5px", borderRadius: "50%", display: "flex" }}>
                <User size={16} color="white" />
              </div>
              <div style={{ textAlign: "left", lineHeight: "1.1" }}>
                <div style={{ fontWeight: "700", color: "#4361ee", fontSize: "0.9rem" }}>{externalUser.name}</div>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>ID: {externalUser.id}</div>
              </div>
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
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
