// src/pages/RegistroGeneral.jsx
import RegistroForm from "../../components/RegistroForm.jsx";
import UsuarioForm from "../../components/UsuarioForm.jsx";
import "../../styles/Admin/RegistroGeneral.css"; // nuevo archivo solo para layout general

export default function RegistroGeneral() {
  return (
    <main className="registro-general">
      <section className="registro-seccion">
        <RegistroForm />
      </section>

      <section className="registro-seccion">
        <UsuarioForm />
      </section>
    </main>
  );
}
