import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import './Inventario.css';

interface InventarioItem {
  id: number;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
  minimo_stock: number;
  categoria: string;
  color: string;
  estado: string;
  actualizado_at: string;
}

const Inventario: React.FC = () => {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Filtros
  const [filterText, setFilterText] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const [newItem, setNewItem] = useState({
    nombre: '',
    cantidad: 0,
    unidad_medida: 'metros',
    minimo_stock: 0,
    categoria: 'Telas',
    color: '',
    estado: 'Disponible'
  });

  const [savingId, setSavingId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventario/');
      const data = await response.json();
      const sanitizedData = Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        cantidad: Number(item.cantidad)
      })) : [];
      setItems(sanitizedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    return () => stopAdjusting();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesText = item.nombre.toLowerCase().includes(filterText.toLowerCase()) || 
                       item.categoria.toLowerCase().includes(filterText.toLowerCase());
    const matchesColor = filterColor === '' || item.color.toLowerCase().includes(filterColor.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Agotado' && item.estado === 'Agotado') ||
                         (filterStatus === 'Disponible' && item.estado === 'Disponible');
    return matchesText && matchesColor && matchesStatus;
  });

  const updateLocalQuantity = (id: number, delta: number) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const currentQty = Number(item.cantidad);
        const newVal = Math.max(0, currentQty + delta);
        return { ...item, cantidad: Number(newVal.toFixed(2)) };
      }
      return item;
    }));
  };

  const startAdjusting = (id: number, delta: number) => {
    updateLocalQuantity(id, delta);
    let speed = 200;
    
    timerRef.current = setInterval(() => {
      updateLocalQuantity(id, delta);
    }, speed);
  };

  const stopAdjusting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveQuantity = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setSavingId(id);
    try {
      const response = await fetch(`http://localhost:8000/api/inventario/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cantidad: item.cantidad
        }),
      });
      if (response.ok) {
        fetchItems(); // Recargamos para actualizar estado (Disponible/Agotado)
        setTimeout(() => setSavingId(null), 1000);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setSavingId(null);
        alert("Error al guardar: " + (errorData.error || "Ver consola"));
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setSavingId(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/inventario/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        setIsAdding(false);
        setNewItem({ 
          nombre: '', 
          cantidad: 0, 
          unidad_medida: 'metros', 
          minimo_stock: 0, 
          categoria: 'Telas',
          color: '',
          estado: 'Disponible'
        });
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de marcar este item como agotado (stock 0)?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/inventario/${id}/`, {
          method: 'DELETE',
        });
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) return <div className="loading">Cargando inventario...</div>;

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <h2>Gestión de Inventario</h2>
        <div className="header-actions">
          <button className="add-button" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? <X size={20} /> : <Plus size={20} />}
            <span>{isAdding ? 'Cancelar' : 'Nuevo Item'}</span>
          </button>
        </div>
      </div>

      <div className="filters-section">
        <input 
          type="text" 
          placeholder="Filtrar por nombre o tipo..." 
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="filter-input"
        />
        <input 
          type="text" 
          placeholder="Filtrar por color..." 
          value={filterColor}
          onChange={e => setFilterColor(e.target.value)}
          className="filter-input"
        />
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Disponible">Disponibles</option>
          <option value="Agotado">Agotados</option>
        </select>
      </div>

      {isAdding && (
        <form className="add-form-expanded" onSubmit={handleAddItem}>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input type="text" placeholder="Ej: Algodón Premium" value={newItem.nombre} onChange={e => setNewItem({...newItem, nombre: e.target.value})} required />
            </div>
            <div className="form-field">
              <label>Categoría</label>
              <input type="text" placeholder="Ej: Telas, Hilos" value={newItem.categoria} onChange={e => setNewItem({...newItem, categoria: e.target.value})} required />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input type="text" placeholder="Ej: Azul Marino" value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})} />
            </div>
            <div className="form-field">
              <label>Cantidad Inicial</label>
              <input type="number" step="0.01" value={newItem.cantidad} onChange={e => setNewItem({...newItem, cantidad: parseFloat(e.target.value)})} required />
            </div>
            <div className="form-field">
              <label>Unidad</label>
              <select value={newItem.unidad_medida} onChange={e => setNewItem({...newItem, unidad_medida: e.target.value})}>
                <option value="metros">Metros</option>
                <option value="unidades">Unidades</option>
                <option value="kg">Kilogramos</option>
                <option value="rollos">Rollos</option>
              </select>
            </div>
            <div className="form-field">
              <label>Stock Mínimo</label>
              <input type="number" step="0.01" value={newItem.minimo_stock} onChange={e => setNewItem({...newItem, minimo_stock: parseFloat(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="save-btn-full">Registrar Nuevo Item</button>
        </form>
      )}

      <div className="inventory-grid">
        {filteredItems.map(item => (
          <div key={item.id} className={`inventory-card ${item.estado === 'Agotado' ? 'out-of-stock' : ''}`}>
            <div className="card-header">
              <div className="tags">
                <span className="category-tag">{item.categoria}</span>
                {item.color && <span className="color-tag" style={{borderLeft: `4px solid ${item.color.toLowerCase()}`}}>{item.color}</span>}
              </div>
              <button onClick={() => handleDelete(item.id)} className="delete-btn" title="Marcar como agotado">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="card-body">
              <h3>{item.nombre}</h3>
              <span className={`status-badge ${item.estado.toLowerCase()}`}>{item.estado}</span>
            </div>
            
            <div className="stock-info">
              <div className="current-stock">
                <span className="label">Stock Actual:</span>
                <div className="quantity-controls">
                  <button 
                    type="button"
                    onMouseDown={() => startAdjusting(item.id, -1)}
                    onMouseUp={stopAdjusting}
                    onMouseLeave={stopAdjusting}
                    disabled={item.estado === 'Agotado' && item.cantidad <= 0}
                  >-</button>
                  <span className="value">{item.cantidad} {item.unidad_medida}</span>
                  <button 
                    type="button"
                    onMouseDown={() => startAdjusting(item.id, 1)}
                    onMouseUp={stopAdjusting}
                    onMouseLeave={stopAdjusting}
                  >+</button>
                </div>
              </div>
              
              <button 
                type="button"
                className={`save-stock-btn ${savingId === item.id ? 'saved' : ''}`}
                onClick={() => saveQuantity(item.id)}
                disabled={savingId === item.id}
              >
                {savingId === item.id ? '✓' : 'Guardar Cambios'}
              </button>

              {item.cantidad <= item.minimo_stock && item.estado !== 'Agotado' && (
                <div className="warning">
                  <AlertTriangle size={14} />
                  <span>Bajo Stock</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventario;
