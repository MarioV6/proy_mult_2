
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Box, LayoutDashboard, Database } from "lucide-react";
import Calendario from "./components/calendario/Calendario";
import "./Dashboard.css";

const DashboardLayout = () => {
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
          
          {/* Botón de prueba de DB */}
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

