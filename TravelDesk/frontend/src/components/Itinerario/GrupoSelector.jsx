import { useState, useRef, useEffect } from 'react';
import '../../styles/Admin/Itinerario/GrupoSelector.css';

const GrupoSelector = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    nombre_grupo: initialData.nombre_grupo || '',
    descripcion: initialData.descripcion || ''
  });

  const [showSelectModal, setShowSelectModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const gruposExistentes = [
    { id: 1, nombre_grupo: 'Grupo Familiar López', descripcion: 'Viaje familiar a Europa', turistas_count: 4 },
    { id: 2, nombre_grupo: 'Grupo Amigos Universidad', descripcion: 'Graduación y egresados', turistas_count: 12 },
    { id: 3, nombre_grupo: 'Grupo Corporativo TechCorp', descripcion: 'Incentivo empleados', turistas_count: 8 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre_grupo.trim()) {
      newErrors.nombre_grupo = 'Nombre requerido';
    } else if (formData.nombre_grupo.trim().length < 3) {
      newErrors.nombre_grupo = 'Mínimo 3 caracteres';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'Descripción requerida';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'Mínimo 10 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNew = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 800));

    onNext({ grupo: { ...formData, id: Date.now() } });
    setIsLoading(false);
  };

  const handleSelectGroup = (grupo) => {
    setIsLoading(true);
    setTimeout(() => {
      onNext({ grupo });
      setShowSelectModal(false);
      setIsLoading(false);
    }, 500);
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      nombre_grupo: '👥',
      descripcion: '📝'
    };
    return icons[fieldName] || '📋';
  };

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (formData[fieldName] && !errors[fieldName]) return 'success';
    return 'default';
  };

  return (
    <div className="grupo-selector">
      <div className="grupo-selector__wizard-container">
        <div className="grupo-selector__step-header grupo-selector__step-header--expanded grupo-selector__step-header--grupo">
          <div className="grupo-selector__step-info">
            <div className="grupo-selector__step-number">1</div>
            <div className="grupo-selector__step-title">
              <h3>👥 Gestión de Grupos</h3>
              <p>Organiza tu itinerario por grupos de turistas</p>
            </div>
          </div>
        </div>

        <div className="grupo-selector__step-content">
          <div className="grupo-selector__step-description">
            <div className="grupo-selector__description-icon">💡</div>
            <p>Define el grupo de turistas para este itinerario. Puedes crear uno nuevo o seleccionar uno existente para una mejor organización.</p>
          </div>

          <div className="grupo-selector__form-section">
            <div className="grupo-selector__form-group">
              <label htmlFor="nombre_grupo" className={`grupo-selector__field-label ${focusedField === 'nombre_grupo' ? 'grupo-selector__field-label--focused' : ''} ${getFieldStatus('nombre_grupo')}`}>
                <span className="grupo-selector__field-icon">{getFieldIcon('nombre_grupo')}</span>
                Nombre del Grupo *
              </label>
              <div className="grupo-selector__input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  id="nombre_grupo"
                  name="nombre_grupo"
                  value={formData.nombre_grupo}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('nombre_grupo')}
                  onBlur={handleBlur}
                  placeholder="Ej: Grupo Familiar López"
                  className={`grupo-selector__form-input ${getFieldStatus('nombre_grupo')} ${focusedField === 'nombre_grupo' ? 'grupo-selector__form-input--focused' : ''}`}
                  disabled={isLoading}
                />
                {formData.nombre_grupo && (
                  <div className={`grupo-selector__field-status ${getFieldStatus('nombre_grupo')}`}>
                    {getFieldStatus('nombre_grupo') === 'success' ? '✅' : getFieldStatus('nombre_grupo') === 'error' ? '⚠️' : ''}
                  </div>
                )}
              </div>
              {errors.nombre_grupo && (
                <div className="grupo-selector__error-message">
                  <span className="grupo-selector__error-icon">⚠️</span>
                  {errors.nombre_grupo}
                </div>
              )}
            </div>

            <div className="grupo-selector__form-group">
              <label htmlFor="descripcion" className={`grupo-selector__field-label ${focusedField === 'descripcion' ? 'grupo-selector__field-label--focused' : ''} ${getFieldStatus('descripcion')}`}>
                <span className="grupo-selector__field-icon">{getFieldIcon('descripcion')}</span>
                Descripción *
              </label>
              <div className="grupo-selector__input-wrapper">
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('descripcion')}
                  onBlur={handleBlur}
                  placeholder="Describe el propósito del viaje y características del grupo..."
                  rows="4"
                  className={`grupo-selector__form-textarea ${getFieldStatus('descripcion')} ${focusedField === 'descripcion' ? 'grupo-selector__form-textarea--focused' : ''}`}
                  disabled={isLoading}
                />
                {formData.descripcion && (
                  <div className={`grupo-selector__field-status ${getFieldStatus('descripcion')}`}>
                    {getFieldStatus('descripcion') === 'success' ? '✅' : getFieldStatus('descripcion') === 'error' ? '⚠️' : ''}
                  </div>
                )}
              </div>
              {errors.descripcion && (
                <div className="grupo-selector__error-message">
                  <span className="grupo-selector__error-icon">⚠️</span>
                  {errors.descripcion}
                </div>
              )}
            </div>
          </div>

          <div className="grupo-selector__action-buttons">
            <button
              className="grupo-selector__btn grupo-selector__btn--secondary"
              onClick={() => setShowSelectModal(true)}
              disabled={isLoading}
              type="button"
            >
              <span className="grupo-selector__btn-icon">📋</span>
              Ver Grupos Existentes
            </button>

            <button
              className="grupo-selector__btn grupo-selector__btn--primary"
              onClick={handleCreateNew}
              disabled={isLoading || !formData.nombre_grupo.trim() || !formData.descripcion.trim()}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className="grupo-selector__loading-spinner">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="grupo-selector__btn-icon">➕</span>
                  Crear Grupo
                </>
              )}
            </button>
          </div>

          {(formData.nombre_grupo || formData.descripcion) && (
            <div className="grupo-selector__data-preview">
              <div className="grupo-selector__preview-header">
                <span className="grupo-selector__preview-icon">📋</span>
                <h4>Vista Previa</h4>
                <div className="grupo-selector__preview-badge">En progreso</div>
              </div>
              <div className="grupo-selector__preview-card">
                <div className="grupo-selector__preview-item">
                  <div className="grupo-selector__preview-label">
                    <span className="grupo-selector__preview-icon-small">👥</span>
                    <strong>Grupo:</strong>
                  </div>
                  <span className="grupo-selector__preview-value">{formData.nombre_grupo || 'Sin nombre'}</span>
                </div>
                <div className="grupo-selector__preview-item">
                  <div className="grupo-selector__preview-label">
                    <span className="grupo-selector__preview-icon-small">📝</span>
                    <strong>Descripción:</strong>
                  </div>
                  <span className="grupo-selector__preview-value">{formData.descripcion || 'Sin descripción'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSelectModal && (
          <div className="grupo-selector__modal-overlay" onClick={() => setShowSelectModal(false)}>
            <div className="grupo-selector__modal-content" onClick={e => e.stopPropagation()}>
              <div className="grupo-selector__modal-header">
                <h3>📋 Seleccionar Grupo Existente</h3>
                <button
                  className="grupo-selector__modal-close"
                  onClick={() => setShowSelectModal(false)}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>

              <div className="grupo-selector__modal-body">
                {isLoading && (
                  <div className="grupo-selector__loading-overlay">
                    <div className="grupo-selector__loading-spinner">⏳</div>
                    <p>Cargando...</p>
                  </div>
                )}

                <div className="grupo-selector__grupos-list">
                  {gruposExistentes.map(grupo => (
                    <div
                      key={grupo.id}
                      className={`grupo-selector__grupo-item ${isLoading ? 'grupo-selector__grupo-item--disabled' : ''}`}
                      onClick={() => !isLoading && handleSelectGroup(grupo)}
                    >
                      <div className="grupo-selector__grupo-info">
                        <div className="grupo-selector__grupo-header">
                          <h4>{grupo.nombre_grupo}</h4>
                          <span className="grupo-selector__turistas-count">👥 {grupo.turistas_count}</span>
                        </div>
                        <p>{grupo.descripcion}</p>
                      </div>
                      <div className="grupo-selector__select-indicator">
                        {isLoading ? '⏳' : '▶️'}
                      </div>
                    </div>
                  ))}
                </div>

                {gruposExistentes.length === 0 && (
                  <div className="grupo-selector__empty-state">
                    <div className="grupo-selector__empty-icon">📭</div>
                    <p>No hay grupos disponibles</p>
                    <button
                      className="grupo-selector__btn grupo-selector__btn--secondary"
                      onClick={() => setShowSelectModal(false)}
                    >
                      Crear Nuevo Grupo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrupoSelector;
