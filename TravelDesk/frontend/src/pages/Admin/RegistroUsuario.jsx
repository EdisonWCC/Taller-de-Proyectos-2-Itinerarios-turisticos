import UsuarioForm from "../../components/Admin/UsuarioForm.jsx";

function RegistroUsuario() {
  return (
    <div className="registro-container">
      <h2>Registrar Nuevo Usuario</h2>
      <UsuarioForm /> {/* ✅ Aquí llamas la lógica del componente */}
    </div>
  );
}

export default RegistroUsuario;
