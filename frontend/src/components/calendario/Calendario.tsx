import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Save, Calculator, Search, Eye } from "lucide-react";
import "./Calendario.css";
import Vista3D from "../visualizacion3D/Vista3D";

const API_BASE = "http://localhost:8000/api";

interface Tela {
  id: number;
  nombre: string;
  precio_real: number;
  precio_predicho: number;
}

// Movido fuera para evitar que se re-cree al escribir en el textarea de notas
const AnimatedNumber = ({ value }: { value: number }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      Bs. {value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
};

const Calendario = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState("");
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para Calculadora
  const [telas, setTelas] = useState<Tela[]>([]);
  const [searchTela, setSearchTela] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
  const [metros, setMetros] = useState<number | string>("");
  const [extras, setExtras] = useState<number | string>("");
  const [manoObra, setManoObra] = useState<number | string>("");
  const [total, setTotal] = useState(0);

  // Estado para Visor 3D
  const [viewing3D, setViewing3D] = useState<Tela | null>(null);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayRaw = new Date(year, month, 1).getDay();
  const firstDayOfMonth = (firstDayRaw + 6) % 7; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getNoteKey = (day: number) => {
    const d = day.toString().padStart(2, '0');
    const m = (month + 1).toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE}/notas/mes/?mes=${month + 1}&anio=${year}`);
        if (response.ok) {
          const data = await response.json();
          const notesMap: Record<string, string> = {};
          data.forEach((n: { fecha: string; contenido: string }) => {
            notesMap[n.fecha] = n.contenido;
          });
          setNotes(notesMap);
        }
      } catch (error) {
        console.error("Error al cargar notas:", error);
      }
    };
    fetchNotes();
  }, [month, year]);

  // Cargar telas cuando se abre el modal
  useEffect(() => {
    if (selectedDay !== null) {
      const fecha = getNoteKey(selectedDay);
      fetchTelas(fecha);
    }
  }, [selectedDay, searchTela, sortOrder]);

  const fetchTelas = async (fecha: string) => {
    try {
      const response = await fetch(`${API_BASE}/calculadora/?fecha=${fecha}&nombre=${searchTela}&orden_precio=${sortOrder}`);
      if (response.ok) {
        const data = await response.json();
        setTelas(data);
        
        // Sincronizar tela seleccionada si ya había una
        if (selectedTela) {
          const updatedTela = data.find((t: Tela) => t.id === selectedTela.id);
          if (updatedTela) {
            setSelectedTela(updatedTela);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar telas:", error);
    }
  };

  // Recalcular total automáticamente
  useEffect(() => {
    if (selectedTela) {
      // Usamos el precio predicho para que varíe según el día
      const precioAUsar = selectedTela.precio_predicho || selectedTela.precio_real;
      const subtotal = metros * precioAUsar;
      setTotal(subtotal + Number(extras) + Number(manoObra));
    } else {
      setTotal(Number(extras) + Number(manoObra));
    }
  }, [selectedTela, metros, extras, manoObra]);

  const changeMonth = (offset: number) => {
    setDirection(offset);
    setViewDate(new Date(year, month + offset, 1));
  };

  const saveNote = async () => {
    if (selectedDay !== null) {
      setLoading(true);
      const fecha = getNoteKey(selectedDay);
      try {
        const response = await fetch(`${API_BASE}/notas/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fecha, contenido: currentText })
        });

        if (response.ok) {
          setNotes(prev => ({ ...prev, [fecha]: currentText }));
          // No cerramos el modal, solo damos feedback visual si fuera necesario
          alert("Nota guardada correctamente");
        }
      } catch (error) {
        alert("Error al guardar la nota");
      } finally {
        setLoading(false);
      }
    }
  };

  const gridVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 })
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="title-nav">
          <motion.button onClick={() => changeMonth(-1)} className="nav-btn-circle" whileHover={{ scale: 1.1 }}>
            <ChevronLeft size={24} />
          </motion.button>
          
          <div className="title-container">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={`${month}-${year}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                {monthNames[month]} {year}
              </motion.h2>
            </AnimatePresence>
          </div>

          <motion.button onClick={() => changeMonth(1)} className="nav-btn-circle" whileHover={{ scale: 1.1 }}>
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>

      <div className="calendar-main-container">
        <div className="day-names-row">
          {dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
        </div>

        <div className="grid-overflow-handler">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={`${month}-${year}`}
              custom={direction}
              variants={gridVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="calendar-grid"
            >
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = getNoteKey(day);
                const hasNote = !!notes[key] && notes[key].trim() !== "";

                return (
                  <motion.div
                    key={day}
                    className={`calendar-day ${hasNote ? "has-note" : ""}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedDay(day);
                      setCurrentText(notes[key] || "");
                      setSelectedTela(null);
                      setMetros("");
                      setExtras("");
                      setManoObra("");
                    }}
                  >
                    <span className="day-number">{day}</span>
                    {hasNote && <div className="note-indicator"></div>}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedDay !== null && (
          <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
            <motion.div 
              className="note-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <button className="close-btn" onClick={() => setSelectedDay(null)}><X size={24} /></button>
              
              {/* SECCIÓN NOTAS */}
              <div className="modal-section notes-section">
                <div className="modal-header">
                  <div className="header-with-icon">
                    <div className="icon-box"><Save size={20} /></div>
                    <div>
                      <h3>Notas del Día</h3>
                      <p>{selectedDay} de {monthNames[month]}</p>
                    </div>
                  </div>
                </div>
                
                <div className="textarea-container">
                  <textarea 
                    placeholder="Nota" 
                    value={currentText} 
                    onChange={(e) => setCurrentText(e.target.value)} 
                    autoFocus 
                  />
                  <div className="textarea-decoration"></div>
                </div>

                <motion.button 
                  className="save-btn" 
                  onClick={saveNote} 
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={18} style={{marginRight: '8px'}} />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </motion.button>
              </div>

              <div className="modal-divider"></div>

              {/* SECCIÓN CALCULADORA */}
              <div className="modal-section calc-section">
                <div className="modal-header">
                  <div className="header-with-icon">
                    <div className="icon-box"><Calculator size={20} /></div>
                    <div>
                      <h3>Presupuesto estimado</h3>
                     
                    </div>
                  </div>
                </div>
                
                <div className="calc-filters">
                  <div style={{position: 'relative', flex: 1}}>
                    <Search size={16} style={{position: 'absolute', left: '10px', top: '10px', color: '#888'}} />
                    <input 
                      className="calc-input-search" 
                      style={{paddingLeft: '35px'}}
                      placeholder="Buscar tela" 
                      value={searchTela}
                      onChange={(e) => setSearchTela(e.target.value)}
                    />
                  </div>
                  <select className="calc-select" onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="">Ordenar</option>
                    <option value="asc">↑ Precio</option>
                    <option value="desc">↓ Precio</option>
                  </select>
                </div>

                <div className="telas-grid custom-scrollbar">
                  {telas.map(t => (
                    <motion.div 
                      key={t.id} 
                      className={`tela-card ${selectedTela?.id === t.id ? 'selected' : ''}`}
                      whileHover={{ y: -5 }}
                    >
                      <div 
                        className="card-background" 
                        style={{ 
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('/telas/${t.nombre.toLowerCase().replace(/ /g, "_")}.jpg')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      
                      <div className="card-content">
                        <div className="card-header">
                          <span className="tela-name">{t.nombre}</span>
                          {t.precio_real > 0 && (
                            <div className={`trend-badge ${t.precio_predicho > t.precio_real ? 'up' : 'down'}`}>
                              {t.precio_predicho > t.precio_real ? '↑' : '↓'} 
                              {Math.abs(((t.precio_predicho - t.precio_real) / t.precio_real) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        
                        <div className="card-prices">
                          <div className="price-tag">
                            <span className="label">Real</span>
                            <span className="value">Bs. {t.precio_real.toFixed(2)}</span>
                          </div>
                          <div className="price-tag predicho">
                            <span className="label">Predicho</span>
                            <span className="value">Bs. {t.precio_predicho.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button 
                            className={`action-btn select-btn ${selectedTela?.id === t.id ? 'active' : ''}`}
                            onClick={() => setSelectedTela(t)}
                          >
                            {selectedTela?.id === t.id ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                          <button 
                            className="action-btn view-btn"
                            onClick={() => {
                              const path = `/models/${t.nombre.trim().toLowerCase().replace(/ /g, "_")}.glb`;
                              console.log("Iniciando carga robusta de:", path);
                              
                              // CICLO DE DOBLE CARGA FORZADA
                              setViewing3D(null); // Limpieza instantánea
                              setTimeout(() => {
                                setViewing3D(t); // Carga real
                              }, 10);
                            }}
                          >
                            <Eye size={16} />
                            Ver 3D
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="calc-form">
                  <div className="input-group">
                    <label>Metros</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="0.0"
                      value={metros} 
                      onChange={(e) => setMetros(e.target.value)} 
                    />
                  </div>
                  <div className="input-group">
                    <label>Extras</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={extras} 
                      onChange={(e) => setExtras(e.target.value)} 
                    />
                  </div>
                  <div className="input-group" style={{gridColumn: 'span 2'}}>
                    <label>Mano de Obra</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={manoObra} 
                      onChange={(e) => setManoObra(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="total-display">
                  <span className="total-label">PRECIO ESTIMADO</span>
                  <div className="total-value">
                    <AnimatedNumber value={total} />
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {viewing3D && (
        <Vista3D 
          modelPath={`/models/${viewing3D.nombre.trim().toLowerCase().replace(/ /g, "_")}.glb`}
          title={viewing3D.nombre}
          onClose={() => setViewing3D(null)}
        />
      )}
    </div>
  );
};

export default Calendario;
