import axios from 'axios';

export const cargarFiltros = async (setCategorias, setColores, setTallas, setFiltros) => {
  try {
    const [categoriasRes, coloresRes, tallasRes] = await Promise.all([ //carga todos los filtros existentes de la bbdd
      axios.get('http://localhost:3000/api/categorias'),
      axios.get('http://localhost:3000/api/colores'),
      axios.get('http://localhost:3000/api/tallas'),
    ]);

    setCategorias(categoriasRes.data);
    setColores(coloresRes.data);
    setTallas(tallasRes.data);

    const categoriasFiltros = categoriasRes.data.reduce((acc, cat) => { //arma los filtros de forma dinámica
      if (!acc[cat.categoria]) {
        acc[cat.categoria] = {
          isChecked: false,
          subcategorias: {},
        };
      }
      acc[cat.categoria].subcategorias[cat.subcategoria] = { isChecked: false };
      return acc;
    }, {});

    const tallasFiltros = tallasRes.data.reduce((acc, talla) => {
      acc[talla.talla] = { isChecked: false };
      return acc;
    }, {});

    const coloresFiltros = coloresRes.data.reduce((acc, color) => {
      acc[color.color] = { isChecked: false };
      return acc;
    }, {});

    setFiltros({
      categoria: categoriasFiltros,
      talla: tallasFiltros,
      color: coloresFiltros,
    });
  } catch (error) {
    console.error('Error al cargar filtros:', error.message);
  }
};

export const filtrarProductos = (productos, filtros, precioRango) => { //función de la lógica de los filtros
  return productos.filter((producto) => {
    const { Category, Subcategory, Size, Color, Price, Discount } = producto;



    // Filtro de precio
    const precioConDescuento = Price - (Price * Discount) / 100; //calcula precio con descuento
    const precioFiltro =
    precioConDescuento >= precioRango[0] && precioConDescuento <= precioRango[1];

     // Verifica filtros de categoría y subcategoría 
    const categoriaFiltro = Object.keys(filtros.categoria).some((categoria) => {
      const categoriaData = filtros.categoria[categoria];

       // Verifica si la categoría o alguna subcategoría está seleccionada
      const subcategoriasSeleccionadas = Object.values(categoriaData.subcategorias).some((sub) => sub.isChecked);

       // Si la categoría está seleccionada, verifica si coincide la categoría o alguna subcategoría
      return (
        (categoriaData.isChecked && Category === categoria) ||
        (subcategoriasSeleccionadas && categoriaData.subcategorias[Subcategory]?.isChecked)
      );
    });

    // Verifica filtros de talla 
    const tallaFiltro = Object.keys(filtros.talla).some((talla) => {
      return filtros.talla[talla].isChecked && Size === talla;
    });

       // Verifica filtros de color
    const colorFiltro = Object.keys(filtros.color).some((color) => {
      return filtros.color[color].isChecked && Color === color;
    });

     // Si no hay filtros activos, devuelve todos los productos
    return (
      precioFiltro &&
      (!Object.values(filtros.categoria).some((cat) => cat.isChecked) || categoriaFiltro) &&
      (!Object.values(filtros.talla).some((talla) => talla.isChecked) || tallaFiltro) &&
      (!Object.values(filtros.color).some((color) => color.isChecked) || colorFiltro)
    );
  });
};