import axios from 'axios';

const guardarPedido = async (usuarioId, totalAmount, productos) => {
  const pedidoData = {
    OrderDate: new Date().toISOString(), // Fecha actual en formato ISO
    TotalAmount: totalAmount,
    Status: 'Pendiente', // El estado inicial del pedido
    Usuarios_AccountID: usuarioId,
    Productos: productos // Añadir los productos al cuerpo del pedido
  };

  try {
    const response = await axios.post('http://localhost:5000/api/pedidos', pedidoData);
    if (response.status === 200) {
      console.log('Pedido y productos guardados con éxito');
    } else {
      console.error('Error al guardar el pedido:', response.statusText);
    }
  } catch (error) {
    console.error('Error al guardar el pedido:', error.message);
  }
};

export default guardarPedido;