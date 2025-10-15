import { useState } from 'react'

export default function useTuristForm() {
  const [values, setValues] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    pasaporte: '',
    nacionalidad: '',
    fecha_nacimiento: '',
    genero: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate(v) {
    const e = {}
    if (!v.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!v.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!v.dni.trim()) e.dni = 'El DNI es obligatorio'
    if (!v.pasaporte.trim()) e.pasaporte = 'El pasaporte es obligatorio'
    if (!v.nacionalidad.trim()) e.nacionalidad = 'La nacionalidad es obligatoria'
    if (!v.fecha_nacimiento) e.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    if (!v.genero) e.genero = 'Seleccione un género'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate(values)
    setErrors(e2)
    if (Object.keys(e2).length > 0) return

    setSubmitting(true)
    try {
      // TODO: Integrar con API real. De momento simula envío.
      await new Promise((res) => setTimeout(res, 600))
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return { values, errors, submitting, submitted, handleChange, handleSubmit }
}
