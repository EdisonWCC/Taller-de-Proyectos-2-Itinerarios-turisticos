import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, message, Tabs, Tag } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import '../../styles/Turista/turista.css';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Meta } = Card;

const Perfil = () => {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  // Datos de ejemplo del usuario
  const [userData, setUserData] = useState({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: '+51 987 654 321',
    direccion: 'Av. Principal 123, Lima, Perú',
    fechaNacimiento: '15/05/1990',
    genero: 'Masculino',
    preferencias: ['Aventura', 'Cultura', 'Gastronomía']
  });

  const onFinish = (values) => {
    console.log('Valores del formulario:', values);
    setUserData({ ...userData, ...values });
    setEditing(false);
    message.success('Perfil actualizado correctamente');
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Error al enviar el formulario:', errorInfo);
  };

  const uploadProps = {
    name: 'avatar',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} subido correctamente`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} falló al subir.`);
      }
    },
  };

  return (
    <div className="turista-page">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Información Personal" key="1">
          <Card 
            title={
              <div className="profile-header">
                <span>Mi Perfil</span>
                {!editing ? (
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <div>
                    <Button 
                      type="text" 
                      icon={<CheckOutlined />} 
                      onClick={() => form.submit()}
                      style={{ color: '#52c41a' }}
                    >
                      Guardar
                    </Button>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      onClick={() => setEditing(false)}
                      style={{ color: '#ff4d4f' }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            }
            className="profile-card"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              initialValues={userData}
            >
              <div className="profile-content">
                <div className="profile-avatar-section">
                  <Upload {...uploadProps} disabled={!editing}>
                    <Avatar 
                      size={120} 
                      icon={<UserOutlined />} 
                      className="profile-avatar"
                    />
                  </Upload>
                  {editing && <div className="avatar-edit-hint">Haz clic para cambiar la foto</div>}
                </div>
                
                <div className="profile-form">
                  <div className="form-row">
                    <Form.Item
                      name="nombre"
                      label="Nombre"
                      rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
                      className="form-item"
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        disabled={!editing}
                        placeholder="Nombre"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="apellido"
                      label="Apellido"
                      rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
                      className="form-item"
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        disabled={!editing}
                        placeholder="Apellido"
                      />
                    </Form.Item>
                  </div>
                  
                  <Form.Item
                    name="email"
                    label="Correo electrónico"
                    rules={[
                      { required: true, message: 'Por favor ingresa tu correo electrónico' },
                      { type: 'email', message: 'Por favor ingresa un correo electrónico válido' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      disabled={!editing}
                      placeholder="Correo electrónico"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="telefono"
                    label="Teléfono"
                    rules={[{ required: true, message: 'Por favor ingresa tu teléfono' }]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      disabled={!editing}
                      placeholder="Teléfono"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="direccion"
                    label="Dirección"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined />} 
                      disabled={!editing}
                      placeholder="Dirección"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="fechaNacimiento"
                    label="Fecha de Nacimiento"
                  >
                    <Input 
                      prefix={<CalendarOutlined />} 
                      disabled={!editing}
                      placeholder="Fecha de Nacimiento"
                    />
                  </Form.Item>
                  
                  {!editing && (
                    <div className="preferencias-section">
                      <h4>Mis Preferencias:</h4>
                      <div className="preferencias-list">
                        {userData.preferencias.map((pref, index) => (
                          <Tag key={index} color="blue">{pref}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Seguridad" key="2">
          <Card title="Configuración de Seguridad">
            <Form layout="vertical">
              <Form.Item
                label="Contraseña Actual"
                name="currentPassword"
                rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
              >
                <Input.Password placeholder="Ingresa tu contraseña actual" />
              </Form.Item>
              
              <Form.Item
                label="Nueva Contraseña"
                name="newPassword"
                rules={[{ required: true, message: 'Por favor ingresa tu nueva contraseña' }]}
              >
                <Input.Password placeholder="Ingresa tu nueva contraseña" />
              </Form.Item>
              
              <Form.Item
                label="Confirmar Nueva Contraseña"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Por favor confirma tu nueva contraseña' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirma tu nueva contraseña" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cambiar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Perfil;
