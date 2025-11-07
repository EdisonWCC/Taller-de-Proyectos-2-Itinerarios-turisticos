import React, { useState } from 'react';
import { Card, Switch, Form, Button, Select, Divider, Typography, message } from 'antd';
import { 
  BellOutlined, 
  MailOutlined, 
  GlobalOutlined, 
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import '../../styles/Turista/turista.css';

const { Option } = Select;
const { Title, Text } = Typography;

const Ajustes = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // Simulando una llamada a la API
    setTimeout(() => {
      console.log('Valores guardados:', values);
      message.success('Configuración guardada correctamente');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="turista-page">
      <Title level={2}>Configuración</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          notificaciones: true,
          notificacionesEmail: true,
          notificacionesApp: true,
          tema: 'claro',
          idioma: 'es',
          privacidadPerfil: 'publico',
        }}
      >
        <Card 
          title={
            <span>
              <BellOutlined style={{ marginRight: '8px' }} />
              Notificaciones
            </span>
          }
          className="settings-card"
        >
          <Form.Item
            name="notificaciones"
            label="Activar notificaciones"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={<CheckOutlined />} 
              unCheckedChildren={<CloseOutlined />} 
            />
          </Form.Item>
          
          <Form.Item
            name="notificacionesEmail"
            label="Notificaciones por correo electrónico"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={<CheckOutlined />} 
              unCheckedChildren={<CloseOutlined />} 
            />
          </Form.Item>
          
          <Form.Item
            name="notificacionesApp"
            label="Notificaciones en la aplicación"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={<CheckOutlined />} 
              unCheckedChildren={<CloseOutlined />} 
            />
          </Form.Item>
        </Card>
        
        <Card 
          title={
            <span>
              <GlobalOutlined style={{ marginRight: '8px' }} />
              Preferencias
            </span>
          }
          className="settings-card"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="tema"
            label="Tema de la aplicación"
          >
            <Select>
              <Option value="claro">Claro</Option>
              <Option value="oscuro">Oscuro</Option>
              <Option value="sistema">Usar configuración del sistema</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="idioma"
            label="Idioma"
          >
            <Select>
              <Option value="es">Español</Option>
              <Option value="en">English</Option>
              <Option value="pt">Português</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="zonaHoraria"
            label="Zona horaria"
          >
            <Select showSearch placeholder="Selecciona tu zona horaria">
              <Option value="America/Lima">(GMT-5) Lima, Quito, Bogotá</Option>
              <Option value="America/Mexico_City">(GMT-6) Ciudad de México</Option>
              <Option value="America/Argentina/Buenos_Aires">(GMT-3) Buenos Aires</Option>
              <Option value="America/Sao_Paulo">(GMT-3) São Paulo</Option>
              <Option value="America/New_York">(GMT-5) Nueva York</Option>
            </Select>
          </Form.Item>
        </Card>
        
        <Card 
          title={
            <span>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Privacidad
            </span>
          }
          className="settings-card"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="privacidadPerfil"
            label="Visibilidad del perfil"
          >
            <Select>
              <Option value="publico">Público</Option>
              <Option value="soloAmigos">Solo amigos</Option>
              <Option value="privado">Privado</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="mostrarEmail"
            label="Mostrar correo electrónico en el perfil"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="mostrarTelefono"
            label="Mostrar teléfono en el perfil"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Divider />
          
          <div className="privacy-note">
            <Text type="secondary">
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Tu información personal está protegida según nuestra Política de Privacidad.
            </Text>
          </div>
        </Card>
        
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button type="default" style={{ marginRight: '16px' }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar cambios
          </Button>
        </div>
      </Form>
      
      <Divider />
      
      <Card 
        title="Cuenta"
        className="settings-card"
        style={{ marginTop: '16px' }}
      >
        <div className="account-actions">
          <div>
            <Text strong>Descargar mis datos</Text>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary">Solicita un archivo con toda la información que tenemos sobre ti.</Text>
            </div>
          </div>
          <Button>Solicitar datos</Button>
        </div>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div className="account-actions">
          <div>
            <Text strong type="danger">Eliminar mi cuenta</Text>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary">Eliminar tu cuenta y todos los datos asociados de forma permanente.</Text>
            </div>
          </div>
          <Button danger>Eliminar cuenta</Button>
        </div>
      </Card>
    </div>
  );
};

export default Ajustes;
