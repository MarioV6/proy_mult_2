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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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

  const fetchItems = async (page: number = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        nombre: filterText,
        color: filterColor,
        estado: filterStatus
      });

      const response = await fetch(`http://localhost:8000/api/inventario/?${queryParams}`);
      const data = await response.json();
      
      const sanitizedItems = Array.isArray(data.items) ? data.items.map((item: any) => ({
        ...item,
        cantidad: Number(item.cantidad)
      })) : [];

      setItems(sanitizedItems);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setTotalItems(data.total_items || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  // Recargar al cambiar filtros (vuelve a página 1)
  useEffect(() => {
    fetchItems(1);
  }, [filterText, filterColor, filterStatus]);

  useEffect(() => {
    return () => stopAdjusting();
  }, []);

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
        fetchItems(currentPage); // Recargamos la página actual
        setTimeout(() => setSavingId(null), 1000);
      } else {
        const errorData = await response.json();
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
        fetchItems(1); // Volver a pág 1 para ver el nuevo item
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
        fetchItems(currentPage);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <div>
          <h2>Gestión de Inventario</h2>
          <p className="inventory-stats">Mostrando {items.length} de {totalItems} insumos</p>
        </div>
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
          placeholder="Buscar..." 
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="filter-input"
        />
        <input 
          type="text" 
          placeholder="Color..." 
          value={filterColor}
          onChange={e => setFilterColor(e.target.value)}
          className="filter-input"
        />
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="Todos">Todos</option>
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

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Cargando insumos...</p>
        </div>
      ) : (
        <>
          <div className="inventory-grid">
            {items.map(item => (
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

                <div className="inventory-image-container">
                  <img 
                    src={`/telas/${item.nombre.toLowerCase().replace(/ /g, "_")}.jpg`} 
                    alt={item.nombre}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Sin+Imagen';
                    }}
                    className="inventory-item-image"
                  />
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

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => fetchItems(currentPage - 1)}
                className="page-btn"
              >
                Anterior
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => fetchItems(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages} 
                onClick={() => fetchItems(currentPage + 1)}
                className="page-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inventario;
