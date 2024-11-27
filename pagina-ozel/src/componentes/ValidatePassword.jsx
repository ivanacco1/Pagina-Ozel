export const ValidatePassword = (contrasena) => { //encriptacion de contraseña
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(contrasena);
  };
  