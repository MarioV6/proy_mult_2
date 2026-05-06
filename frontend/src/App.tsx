
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Box, LayoutDashboard, Database, User } from "lucide-react";
import { useState, useEffect } from "react";
import Calendario from "./components/calendario/Calendario";
import Inventario from "./components/inventario/Inventario";
import "./Dashboard.css";

const DashboardLayout = () => {
  // CONFIGURACIÓN: Cambia este ID por el del usuario que quieras mostrar (ej: 8 para Marco)
  const USER_ID_TO_SHOW = 8; 
  const [externalUser, setExternalUser] = useState({ id: 0, name: "Cargando..." });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Llamamos a la nueva ruta en web.php que sí lee la sesión
        const response = await fetch("http://localhost:8001/user-info-sesion", {
            credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setExternalUser({
            id: data.id || 0,
            name: data.name || "Usuario Desconocido"
          });
        } else {
          setExternalUser({ id: 0, name: "Sesión no iniciada" });
        }
      } catch (error) {
        console.error("Error conectando con Laravel:", error);
        setExternalUser({ id: 0, name: "Sin Conexión (8001)" });
      }
    };
    fetchUser();
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
      alert("No se pudo conectar con el servidor backend (Puerto 8000)");
    }
  };

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
          
          <motion.button 
            className="nav-button"
            whileHover={{ scale: 1.05, backgroundColor: "#3a0ca3" }}
            whileTap={{ scale: 0.95 }}
            onClick={testDBConnection}
            style={{ 
              marginTop: "1rem", 
              backgroundColor: "#4361ee", 
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontWeight: "500"
            }}
          >
            <Database size={20} />
            <span>Probar DB</span>
          </motion.button>
        </div>
      </motion.nav>

      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>Antes de los Hilos</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(67, 97, 238, 0.1)", padding: "0.5rem 1.2rem", borderRadius: "12px", border: "1px solid rgba(67, 97, 238, 0.2)" }}>
              <div style={{ background: "#4361ee", padding: "6px", borderRadius: "50%", display: "flex" }}>
                <User size={16} color="white" />
              </div>
              <div style={{ textAlign: "left", lineHeight: "1.1" }}>
                <div style={{ fontWeight: "700", color: "#4361ee", fontSize: "0.95rem" }}>{externalUser.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#666" }}>ID: {externalUser.id}</div>
              </div>
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
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
          <Route path="inventario" element={<Inventario />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
