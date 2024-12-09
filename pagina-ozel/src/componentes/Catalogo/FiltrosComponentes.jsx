import React, { useState, useEffect } from 'react';
import { Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Box, Slider } from '@mui/material';







const FiltrosComponentes = ({ filtros, handleFiltroChange, precioRango, handlePrecioChange  }) => {
  if (!filtros) return null; // Verifica que 'filtros' esté definido
  
  return(
  <FormControl component="fieldset">
    <Typography variant="subtitle1">Categoría</Typography>
    <FormGroup>
      {Object.keys(filtros.categoria).map((categoria) => (
        <Box key={categoria} ml={1}>
          <FormControlLabel
            control={<Checkbox checked={filtros.categoria[categoria].isChecked} onChange={handleFiltroChange} name={`categoria.${categoria}`} />}
            label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          />
          <Box ml={4}>
            {Object.keys(filtros.categoria[categoria].subcategorias).map((subcategoria) => (
              <FormControlLabel
                key={subcategoria}
                control={<Checkbox checked={filtros.categoria[categoria].subcategorias[subcategoria].isChecked} onChange={handleFiltroChange} name={`categoria.${categoria}.${subcategoria}`} />}
                label={subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </FormGroup>

    <Typography variant="subtitle1">Talla</Typography>
    <FormGroup>
      {Object.keys(filtros.talla).map((talla) => (
        <FormControlLabel
          key={talla}
          control={<Checkbox checked={filtros.talla[talla].isChecked} onChange={handleFiltroChange} name={`talla.${talla}`} />}
          label={talla.charAt(0).toUpperCase() + talla.slice(1)}
        />
      ))}
    </FormGroup>

    <Typography variant="subtitle1">Color</Typography>
    <FormGroup>
      {Object.keys(filtros.color).map((color) => (
        <FormControlLabel
          key={color}
          control={<Checkbox checked={filtros.color[color].isChecked} onChange={handleFiltroChange} name={`color.${color}`} />}
          label={color.charAt(0).toUpperCase() + color.slice(1)}
        />
      ))}
    </FormGroup>
    <Box sx={{ mt: 2 }}>
  <Typography variant="subtitle1">Filtrar por Precio</Typography>
  <Slider
    value={precioRango}
    onChange={handlePrecioChange}
    valueLabelDisplay="auto"
    min={0} // precio mínimo 
    max={100000} // precio máximo 
    sx={{ width: '100%', mt: 2 }}
  />
  <Typography variant="body2">
    Precio: ${precioRango[0]} - ${precioRango[1]}
  </Typography>
</Box>
  </FormControl>
);
};

export default FiltrosComponentes;