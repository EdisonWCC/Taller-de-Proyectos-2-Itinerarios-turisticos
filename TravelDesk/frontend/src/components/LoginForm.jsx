import { useState } from 'react';
import '../styles/registro.css';

export default function LoginForm() {
  const [values, setValues] = useState({
    email: '',
    contrasena: '',
    recordar: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!values.email || !values.contrasena) {
      setError('Ingresa tu correo/usuario y contraseña');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Credenciales inválidas');
        return;
      }
      // Éxito: aquí podrías guardar token, redirigir, etc.
      alert('✅ Inicio de sesión exitoso');
    } catch (err) {
      console.error('Login error', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="container-reg" onSubmit={handleSubmit} noValidate>
      <h1>Iniciar Sesión</h1>

      <div className="form-group full">
        <label htmlFor="email">Correo o usuario</label>
        <input
          id="email"
          name="email"
          type="text"
          value={values.email}
          onChange={onChange}
          placeholder="tu@correo.com o usuario"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          value={values.contrasena}
          onChange={onChange}
          placeholder="Tu contraseña"
        />
      </div>

      <div className="form-group inline">
        <input
          id="recordar"
          name="recordar"
          type="checkbox"
          checked={values.recordar}
          onChange={onChange}
        />
        <label htmlFor="recordar">Recordarme</label>
      </div>

      {error && <small className="error" style={{ display: 'block' }}>{error}</small>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
