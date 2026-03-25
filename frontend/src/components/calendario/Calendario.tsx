
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./Calendario.css";

const Calendario = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState("");
  const [direction, setDirection] = useState(0);

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

  const changeMonth = (offset: number) => {
    setDirection(offset);
    setViewDate(new Date(year, month + offset, 1));
  };

  const getNoteKey = (day: number) => `${year}-${month + 1}-${day}`;

  const saveNote = () => {
    if (selectedDay !== null) {
      const key = getNoteKey(selectedDay);
      setNotes({ ...notes, [key]: currentText });
      setSelectedDay(null);
      setCurrentText("");
    }
  };

  const gridVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0
    })
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
                const hasNote = !!notes[key];

                return (
                  <motion.div
                    key={day}
                    className={`calendar-day ${hasNote ? "has-note" : ""}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedDay(day);
                      setCurrentText(notes[key] || "");
                    }}
                  >
                    <span className="day-number">{day}</span>
                    {hasNote && <div className="note-indicator"></div>}
                    
                    <AnimatePresence>
                      {hasNote && (
                        <motion.div className="note-preview" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                          <p>{notes[key]}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {}
      <AnimatePresence>
        {selectedDay !== null && (
          <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
            <motion.div 
              className="note-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button className="close-btn" onClick={() => setSelectedDay(null)}><X size={24} /></button>
              <div className="modal-header"><h3>Nota para el {selectedDay} de {monthNames[month]}</h3></div>
              <textarea placeholder="Nota" value={currentText} onChange={(e) => setCurrentText(e.target.value)} autoFocus />
              <button className="save-btn" onClick={saveNote}>Guardar Nota</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendario;

