// Utilidades de validación para el formulario de registro

export const isOnlyLetters = (s) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,}$/.test(s.trim());
export const isUsername = (s) => /^[A-Za-z0-9_]{4,20}$/.test(s.trim());
export const hasUpper = (s) => /[A-ZÁÉÍÓÚÜÑ]/.test(s);
export const hasLower = (s) => /[a-záéíóúüñ]/.test(s);
export const hasNumber = (s) => /\d/.test(s);
export const hasSymbol = (s) => /[^A-Za-z0-9]/.test(s);

export function passwordLevel(s) {
  let level = 0;
  if (s.length >= 8) level++;
  if (hasUpper(s) && hasLower(s)) level++;
  if (hasNumber(s)) level++;
  if (hasSymbol(s)) level++;
  return Math.min(level, 4);
}

export function validateFields(values) {
  const errors = {};

  // Nombre
  if (!values.nombre?.trim()) errors.nombre = 'Este campo es obligatorio.';
  else if (values.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres.';
  else if (!isOnlyLetters(values.nombre)) errors.nombre = 'Solo letras y espacios.';

  // Apellido
  if (!values.apellido?.trim()) errors.apellido = 'Este campo es obligatorio.';
  else if (values.apellido.trim().length < 2) errors.apellido = 'Mínimo 2 caracteres.';
  else if (!isOnlyLetters(values.apellido)) errors.apellido = 'Solo letras y espacios.';

  // Email
  if (!values.email?.trim()) errors.email = 'El email es obligatorio.';
  else {
    // Usamos la validación del browser normalmente; aquí un check básico
    const emailOk = /.+@.+\..+/.test(values.email);
    if (!emailOk) errors.email = 'Formato de correo inválido.';
  }

  // Usuario
  if (!values.usuario?.trim()) errors.usuario = 'El usuario es obligatorio.';
  else if (!isUsername(values.usuario)) errors.usuario = '4-20 caracteres. Usa letras, números o _';

  // Contraseña
  const v = values.contrasena || '';
  if (!v) errors.contrasena = 'La contraseña es obligatoria.';
  else if (v.length < 8) errors.contrasena = 'Mínimo 8 caracteres.';
  else if (!(hasUpper(v) && hasLower(v))) errors.contrasena = 'Incluye mayúscula y minúscula.';
  else if (!hasNumber(v)) errors.contrasena = 'Incluye al menos un número.';
  else if (!hasSymbol(v)) errors.contrasena = 'Incluye al menos un símbolo.';

  // Confirmación
  if (!values.confirmar) errors.confirmar = 'Confirma la contraseña.';
  else if (values.confirmar !== v) errors.confirmar = 'Las contraseñas no coinciden.';

  // Fecha de nacimiento
  if (!values.fecha_nac) errors.fecha = 'La fecha es obligatoria.';
  else {
    const hoy = new Date();
    const f = new Date(values.fecha_nac + 'T00:00:00');
    const anos = hoy.getFullYear() - f.getFullYear() - ((hoy.getMonth() < f.getMonth() || (hoy.getMonth() === f.getMonth() && hoy.getDate() < f.getDate())) ? 1 : 0);
    if (isNaN(f.getTime())) errors.fecha = 'Fecha inválida.';
    else if (anos < 13) errors.fecha = 'Debes tener al menos 13 años.';
  }

  // Términos
  if (!values.terminos) errors.terminos = 'Debes aceptar los términos.';

  // Género (opcional); si quieres obligatorio, descomenta:
  // if (!values.genero) errors.genero = 'Selecciona una opción.';

  return errors;
}
