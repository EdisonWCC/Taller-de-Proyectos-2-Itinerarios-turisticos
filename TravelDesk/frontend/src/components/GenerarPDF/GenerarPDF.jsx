import React, { useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC' 
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const GenerarPDF = ({ viaje }) => {
  const [loading, setLoading] = useState(false);
  
  const generarPDF = async () => {
    setLoading(true);
    
    try {
      // Crear una nueva instancia de jsPDF
      const doc = new jsPDF();
      
      // Verificar si autoTable está disponible
      if (typeof autoTable !== 'function') {
        throw new Error('La funcionalidad de tablas no está disponible');
      }
      
      // Configuración del documento
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const maxWidth = pageWidth - (margin * 2);
      
      // Función para agregar un encabezado de sección
      const addSectionHeader = (text, y) => {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin + 5, y + 7);
        return y + 15;
      };
      // Configuración inicial del documento
      // Usar una fuente que soporte caracteres especiales
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      
      // Logo y Título
      doc.setTextColor(24, 144, 255);
      doc.text('TravelDesk', margin, 25);
      
      // Configurar fuente para caracteres especiales
      doc.setFont('helvetica', 'normal');
      
      // Línea decorativa
      doc.setDrawColor(24, 144, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 30, pageWidth - margin, 30);
      
      // Título del viaje
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(viaje.titulo, margin, 45);
      
      // Información del viaje
      let yPosition = 55;
      yPosition = addSectionHeader('INFORMACIÓN DEL VIAJE', yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Información en dos columnas (sin emojis para evitar problemas de codificación)
      const info1 = [
        `Fechas: ${formatDate(viaje.fecha_inicio)} - ${formatDate(viaje.fecha_fin)}`,
        `Destino: ${viaje.destino || 'No especificado'}`,
        `Duración: ${viaje.duracion || 'No especificada'}`,
        `Grupo: ${viaje.grupo?.nombre_grupo || 'No especificado'}`
      ];
      
      const info2 = [
        `Estado: ${viaje.estado || 'No especificado'}`,
        `Hoteles: ${viaje.hoteles?.length || 0} incluidos`,
        `Vuelos: ${viaje.vuelos?.length || 0} incluidos`,
        `Pasajeros: ${viaje.pasajeros?.length || 0} viajeros`
      ];
      
      // Mostrar información en dos columnas
      doc.text(info1, margin, yPosition + 5);
      doc.text(info2, pageWidth / 2, yPosition + 5);
      
      // Descripción
      yPosition += 30;
      yPosition = addSectionHeader('DESCRIPCIÓN DEL VIAJE', yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const descripcion = viaje.descripcion || 'No hay descripción disponible';
      const descripcionLines = doc.splitTextToSize(descripcion, maxWidth);
      doc.text(descripcionLines, margin, yPosition);
      
      // Calcular nueva posición Y después de la descripción
      yPosition += (descripcionLines.length * 5) + 10;
      
      // Sección de itinerario detallado
      yPosition = addSectionHeader('ITINERARIO DETALLADO', yPosition - 5);
      
      // Preparar datos para la tabla de itinerario
      const tableData = [];
      
      viaje.itinerario.forEach((dia, index) => {
        // Agregar encabezado de día
        tableData.push([
          { 
            content: `DÍA ${index + 1}: ${formatDate(dia.fecha) || 'Fecha no especificada'}`,
            colSpan: 5,
            styles: { 
              fillColor: [24, 144, 255],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
            }
          }
        ]);
        
        // Agregar actividades del día
        if (dia.actividades && dia.actividades.length > 0) {
          dia.actividades.forEach(act => {
            tableData.push([
              act.hora || '--:--',
              act.tipo_actividad || 'Actividad',
              act.titulo || 'Sin título',
              act.lugar || 'No especificado',
              act.duracion || '--:--'
            ]);
          });
        } else {
          tableData.push([
            { 
              content: 'No hay actividades programadas para este día',
              colSpan: 5,
              styles: { 
                fontStyle: 'italic',
                textColor: [150, 150, 150],
                halign: 'center'
              }
            }
          ]);
        }
        
        // Espacio entre días
        tableData.push([
          { content: '', colSpan: 5, styles: { lineWidth: 0 } }
        ]);
      });
      
      // Generar tabla de itinerario
      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            'HORA', 
            'TIPO',
            'ACTIVIDAD', 
            'UBICACIÓN', 
            'DURACIÓN'
          ]
        ],
        body: tableData,
        headStyles: {
          fillColor: [13, 71, 161],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 249, 255]
        },
        columnStyles: {
          0: { 
            cellWidth: 15, 
            halign: 'center',
            fontStyle: 'bold'
          },
          1: { 
            cellWidth: 20,
            fontStyle: 'bold',
            textColor: [24, 144, 255]
          },
          2: { cellWidth: 60 },
          3: { cellWidth: 40 },
          4: { 
            cellWidth: 15, 
            halign: 'center',
            fontStyle: 'bold',
            textColor: [100, 100, 100]
          }
        },
        margin: { 
          left: margin, 
          right: margin,
          top: 5
        },
        didDrawPage: function(data) {
          // Agregar pie de página con número de página
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Página ${currentPage} de ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.getHeight() - 10
          );
          
          // Agregar logo pequeño en el pie de página
          doc.setTextColor(24, 144, 255);
          doc.setFontSize(10);
          doc.text(
            'TravelDesk - Sistema de Gestión de Itinerarios',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      });
      
      // Agregar sección de información adicional si está disponible
      if (viaje.notas_adicionales || viaje.incluye) {
        const finalY = doc.lastAutoTable.finalY || yPosition + 50;
        yPosition = finalY + 10;
        
        yPosition = addSectionHeader('INFORMACIÓN ADICIONAL', yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Información de lo que incluye
        if (viaje.incluye) {
          doc.setFont('helvetica', 'bold');
          doc.text('Incluye:', margin, yPosition + 5);
          
          doc.setFont('helvetica', 'normal');
          const incluyeText = String(viaje.incluye || '');
          const incluyeLines = doc.splitTextToSize(incluyeText, maxWidth - 10);
          doc.text(incluyeLines, margin + 5, yPosition + 15);
          yPosition += (incluyeLines.length * 5) + 20;
        }
        
        // Notas adicionales
        if (viaje.notas_adicionales) {
          doc.setFont('helvetica', 'bold');
          doc.text('Notas importantes:', margin, yPosition + 5);
          
          doc.setFont('helvetica', 'normal');
          const notasText = String(viaje.notas_adicionales || '');
          const notasLines = doc.splitTextToSize(notasText, maxWidth - 10);
          doc.text(notasLines, margin + 5, yPosition + 15);
        }
      }
    
      // Generar nombre de archivo seguro
      const safeTitle = String(viaje.titulo || 'itinerario')
        .normalize('NFD') // Normalizar caracteres acentuados
        .replace(/[^\w\s]/gi, '') // Eliminar caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .toLowerCase();
      
      const fileName = `itinerario-${safeTitle}.pdf`;
      
      // Guardar el PDF
      doc.save(fileName);
      message.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      message.error('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="primary" 
      icon={<DownloadOutlined />}
      onClick={generarPDF}
      loading={loading}
      style={{ margin: '10px 0' }}
    >
      Descargar Itinerario (PDF)
    </Button>
  );
};

export default GenerarPDF;
