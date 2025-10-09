import { useMemo, useState } from 'react';
import '../styles/registro.css';
import { passwordLevel, validateFields } from '../utils/validators';

export default function RegistroForm() {
  const [values, setValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    contrasena: '',
    confirmar: '',
    fecha_nac: '',
    genero: '',
    terminos: false,
  });

  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  const level = useMemo(() => passwordLevel(values.contrasena || ''), [values.contrasena]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  }

  function validateField(name) {
    const fieldErrors = validateFields(values);
    // Solo mantener el error del campo tocado
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validateFields(values);
    setErrors(fieldErrors);
    const hasErrors = Object.values(fieldErrors).some(Boolean);
    setOk(!hasErrors);
  }

  return (
    <form className="container-reg" onSubmit={handleSubmit} noValidate>
      <h1>Registro de Usuario</h1>

      <div className="form-group">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" value={values.nombre} onChange={onChange}
          onBlur={() => validateField('nombre')} placeholder="Ej: Juan" />
        <small className="error">{errors.nombre}</small>
      </div>

      <div className="form-group">
        <label htmlFor="apellido">Apellido</label>
        <input id="apellido" name="apellido" type="text" value={values.apellido} onChange={onChange}
          onBlur={() => validateField('apellido')} placeholder="Ej: Pérez" />
        <small className="error">{errors.apellido}</small>
      </div>

      <div className="form-group full">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" value={values.email} onChange={onChange}
          onBlur={() => validateField('email')} placeholder="ejemplo@correo.com" />
        <small className="error">{errors.email}</small>
      </div>

      <div className="form-group">
        <label htmlFor="usuario">Nombre de usuario</label>
        <input id="usuario" name="usuario" type="text" value={values.usuario} onChange={onChange}
          onBlur={() => validateField('usuario')} placeholder="Solo letras, números y _" />
        <small className="hint">4-20 caracteres, sin espacios. Permitido: letras, números y guion bajo.</small>
        <small className="error">{errors.usuario}</small>
      </div>

      <div className="form-group">
        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" value={values.contrasena} onChange={onChange}
          onBlur={() => validateField('contrasena')} placeholder="Mín. 8 caracteres" />
        <div className="password-strength" data-level={level || undefined} aria-hidden="true" />
        <small className="hint">Debe incluir mayúscula, minúscula, número y símbolo.</small>
        <small className="error">{errors.contrasena}</small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmar">Confirmar contraseña</label>
        <input id="confirmar" name="confirmar" type="password" value={values.confirmar} onChange={onChange}
          onBlur={() => validateField('confirmar')} placeholder="Repite la contraseña" />
        <small className="error">{errors.confirmar}</small>
      </div>

      <div className="form-group">
        <label htmlFor="fecha_nac">Fecha de nacimiento</label>
        <input id="fecha_nac" name="fecha_nac" type="date" value={values.fecha_nac} onChange={onChange}
          onBlur={() => validateField('fecha')} />
        <small className="hint">Debes tener al menos 13 años.</small>
        <small className="error">{errors.fecha}</small>
      </div>

      <div className="form-group">
        <label htmlFor="genero">Género</label>
        <select id="genero" name="genero" value={values.genero} onChange={onChange} onBlur={() => validateField('genero')}>
          <option value="">Selecciona...</option>
          <option>Masculino</option>
          <option>Femenino</option>
          <option>Otro</option>
          <option>Prefiero no decirlo</option>
        </select>
        <small className="error">{errors.genero}</small>
      </div>

      <div className="form-group inline">
        <input id="terminos" name="terminos" type="checkbox" checked={values.terminos} onChange={onChange}
          onBlur={() => validateField('terminos')} />
        <label htmlFor="terminos">Acepto los Términos y Condiciones</label>
      </div>
      <small className="error">{errors.terminos}</small>

      <button type="submit" className="btn">Registrarse</button>
      {ok && <p className="success">Formulario válido. Listo para enviar.</p>}
    </form>
  );
}
