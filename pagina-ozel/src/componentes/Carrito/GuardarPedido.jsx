import axios from 'axios';

// Agregar dirección como parámetro para guardarPedido
const guardarPedido = async (usuario, totalAmount, productos) => {
  //console.log(usuario);
  const pedidoData = {
    OrderDate: new Date().toISOString(), // Fecha actual en formato ISO
    TotalAmount: totalAmount,
    Status: 'Pendiente', // El estado inicial del pedido
    Usuarios_AccountID: usuario.UserId,
    Productos: productos, // Añadir los productos al cuerpo del pedido
    // Agregar campos de dirección
    Address: usuario.Address,
    City: usuario.City,
    PostalCode: usuario.PostalCode,
    Provincia: usuario.Provincia || ''
  };

  try {
    // Enviar los datos del pedido, incluyendo la dirección
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