// src/components/Turistas/EditarTuristaForm.jsx
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Admin/EditarTuristaForm.css"; // Importa el estilo


const turistasIniciales = [
  { id: 1, nombre: "Carlos", apellido: "Pérez", documento: "12345678", telefono: "987654321", correo: "carlosperez@email.com", pais: "Perú" },
  { id: 2, nombre: "Ana", apellido: "Gómez", documento: "87654321", telefono: "912345678", correo: "anagomez@email.com", pais: "Chile" },
  { id: 3, nombre: "Luis", apellido: "Ramírez", documento: "11223344", telefono: "998877665", correo: "luisramirez@email.com", pais: "Argentina" }
];

const EditarTuristaForm = () => {
  const [turistas] = useState(turistasIniciales);
  const [turistaSeleccionado, setTuristaSeleccionado] = useState(null);
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    correo: "",
    pais: "",
  });

  const handleSeleccionar = (turista) => {
    setTuristaSeleccionado(turista);
    setDatos(turista);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos actualizados:", datos);
    alert("Cambios guardados (solo frontend)");
  };

  return (
    <div className="editar-turista-container">
      {/* Lista de turistas */}
      <div className="lista-turistas">
        <h3>Lista de Turistas</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {turistas.map(t => (
              <tr key={t.id}>
                <td>{t.nombre} {t.apellido}</td>
                <td>
                  <button onClick={() => handleSeleccionar(t)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de edición */}
      <div className="form-edicion">
        {turistaSeleccionado ? (
          <>
            <h3>Editar Turista: {turistaSeleccionado.nombre}</h3>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input type="text" name="nombre" value={datos.nombre} onChange={handleChange} />

              <label>Apellido</label>
              <input type="text" name="apellido" value={datos.apellido} onChange={handleChange} />

              <label>Documento</label>
              <input type="text" name="documento" value={datos.documento} onChange={handleChange} />

              <label>Teléfono</label>
              <input type="text" name="telefono" value={datos.telefono} onChange={handleChange} />

              <label>Correo</label>
              <input type="email" name="correo" value={datos.correo} onChange={handleChange} />

              <label>País</label>
              <input type="text" name="pais" value={datos.pais} onChange={handleChange} />

              <div className="botones">
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick={() => setTuristaSeleccionado(null)}>Cancelar</button>
              </div>
            </form>
          </>
        ) : (
          <p>Selecciona un turista de la lista para editar</p>
        )}
      </div>
    </div>
  );
};

export default EditarTuristaForm;


