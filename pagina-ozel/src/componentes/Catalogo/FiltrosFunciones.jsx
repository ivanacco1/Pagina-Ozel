import axios from 'axios';

export const cargarFiltros = async (setCategorias, setColores, setTallas, setFiltros) => {
  try {
    const [categoriasRes, coloresRes, tallasRes] = await Promise.all([
      axios.get('http://localhost:3000/api/categorias'),
      axios.get('http://localhost:3000/api/colores'),
      axios.get('http://localhost:3000/api/tallas'),
    ]);

    setCategorias(categoriasRes.data);
    setColores(coloresRes.data);
    setTallas(tallasRes.data);

    const categoriasFiltros = categoriasRes.data.reduce((acc, cat) => {
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

export const filtrarProductos = (productos, filtros) => {
  return productos.filter((producto) => {
    const { Category, Subcategory, Size, Color } = producto;
    
    const categoriaFiltro = Object.keys(filtros.categoria).some((categoria) => {
      const categoriaData = filtros.categoria[categoria];
      const subcategoriasSeleccionadas = Object.values(categoriaData.subcategorias).some((sub) => sub.isChecked);
      return (
        (categoriaData.isChecked && Category === categoria) ||
        (subcategoriasSeleccionadas && categoriaData.subcategorias[Subcategory]?.isChecked)
      );
    });

    const tallaFiltro = Object.keys(filtros.talla).some((talla) => {
      return filtros.talla[talla].isChecked && Size === talla;
    });

    const colorFiltro = Object.keys(filtros.color).some((color) => {
      return filtros.color[color].isChecked && Color === color;
    });

    return (
      (!Object.values(filtros.categoria).some((cat) => cat.isChecked) || categoriaFiltro) &&
      (!Object.values(filtros.talla).some((talla) => talla.isChecked) || tallaFiltro) &&
      (!Object.values(filtros.color).some((color) => color.isChecked) || colorFiltro)
    );
  });
};