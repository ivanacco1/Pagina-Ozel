import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CatalogoProductos = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await axios.get('/api/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  return (
    <div className="catalogo-productos">
      <h2>Catálogo de Productos</h2>
      <div className="productos-lista">
        {productos.map((producto) => (
          <div key={producto.ProductID} className="producto-item">
            <img src={producto.ImageURL} alt={producto.ProductName} />
            <div className="producto-info">
              <h3>{producto.ProductName}</h3>
              <p>{producto.Description}</p>
              <p>Precio: ${producto.Price}</p>
              <p>Stock: {producto.Stock}</p>
              <p>Tamaño: {producto.Size}</p>
              <p>Color: {producto.Color}</p>
              <p>Categoría: {producto.Category}</p>
              <p>Subcategoría: {producto.Subcategory}</p>
              <p>Fecha de Agregado: {producto.DateAdded}</p>
              {producto.Discount && (
                <p>Descuento: ${producto.Discount}</p>
              )}
              {producto.SaleStart && (
                <p>Inicio de Venta: {producto.SaleStart}</p>
              )}
              {producto.SaleEnd && (
                <p>Fin de Venta: {producto.SaleEnd}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogoProductos;