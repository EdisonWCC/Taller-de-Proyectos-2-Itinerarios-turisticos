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
      // Intentar primero usar el endpoint del backend para generar PDF real (deshabilitado para mantener diseño actual)
      const idIt = viaje?.id_itinerario || viaje?.id;
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      const tk = parsed?.token || '';
      const useServerPDF = false; // Mantener diseño jsPDF del cliente
      if (useServerPDF && idIt && tk) {
        try {
          const url = `http://localhost:3000/api/pdf/itinerario?itinerario_id=${encodeURIComponent(idIt)}`;
          const resp = await fetch(url, { headers: { Authorization: `Bearer ${tk}` } });
          if (resp.ok) {
            const blob = await resp.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            // Abrir en nueva pestaña y también disparar descarga
            window.open(blobUrl, '_blank');
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `itinerario-${idIt}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
            message.success('PDF generado desde el servidor');
            return; // Evitar generación en cliente
          }
        } catch {}
      }

      // 1) Enriquecer datos: si faltan campos esenciales, intentar cargar el itinerario completo del backend
      let baseViaje = viaje || {};
      const needsEnrich = !baseViaje?.programas || !baseViaje?.fecha_inicio || !baseViaje?.fecha_fin || !baseViaje?.grupo;
      if (needsEnrich && tk) {
        try {
          const listRes = await fetch('http://localhost:3000/api/turista/itinerarios', { headers: { Authorization: `Bearer ${tk}` } });
          const list = await listRes.json();
          if (listRes.ok && Array.isArray(list)) {
            const match = (list || []).find(it => String(it.id) === String(idIt));
            if (match) baseViaje = match;
          }
        } catch {}
      }

      // 2) Normalizar datos de 'viaje' provenientes del backend de itinerarios
      const toDateISO = (d) => {
        if (!d) return null;
        // Si ya viene en formato YYYY-MM-DD, retornarlo tal cual
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(d))) return String(d);
        const dd = new Date(d);
        return isNaN(dd.getTime()) ? null : dd.toISOString().slice(0,10);
      };
      const safe = (v, fb = '') => (v === undefined || v === null ? fb : v);
      const fechaIni = toDateISO(baseViaje?.fecha_inicio) || null;
      const fechaFin = toDateISO(baseViaje?.fecha_fin) || null;
      const grupoNombre = safe(baseViaje?.grupo?.nombre_grupo, 'No especificado');
      const estado = safe(baseViaje?.estado_presupuesto, 'No especificado');
      const turistas = Array.isArray(baseViaje?.turistas) ? baseViaje.turistas : [];
      const programas = Array.isArray(baseViaje?.programas) ? baseViaje.programas : [];
      // Construir 'itinerario' agrupando programas por fecha
      const byFecha = new Map();
      for (const p of programas) {
        const f = toDateISO(p?.fecha) || 'Sin fecha';
        if (!byFecha.has(f)) byFecha.set(f, []);
        const info = p?.programa_info || {};
        byFecha.get(f).push({
          hora: p?.hora_inicio || '--:--',
          tipo_actividad: info?.tipo || 'Actividad',
          titulo: info?.nombre || 'Sin título',
          lugar: '',
          duracion: info?.duracion ? String(info.duracion) : '--:--'
        });
      }
      const dias = Array.from(byFecha.entries())
        .sort((a,b)=> (a[0]||'').localeCompare(b[0]||''))
        .map(([fecha, actividades]) => ({ fecha, actividades }));
      // Calcular duración si falta
      const calcDuracion = () => {
        if (!fechaIni || !fechaFin) return 'No especificada';
        const di = new Date(fechaIni);
        const df = new Date(fechaFin);
        if (isNaN(di) || isNaN(df)) return 'No especificada';
        const diff = Math.round((df - di) / (1000*60*60*24)) + 1;
        return diff > 0 ? `${diff} días` : 'No especificada';
      };
      const pdfData = {
        titulo: baseViaje?.titulo || `Itinerario ${grupoNombre}`,
        fecha_inicio: fechaIni,
        fecha_fin: fechaFin,
        destino: baseViaje?.destino || grupoNombre,
        duracion: baseViaje?.duracion || calcDuracion(),
        grupo: { nombre_grupo: grupoNombre },
        estado: estado,
        hoteles: Array.isArray(baseViaje?.hoteles) ? baseViaje.hoteles : [],
        vuelos: Array.isArray(baseViaje?.vuelos) ? baseViaje.vuelos : [],
        pasajeros: turistas,
        descripcion: baseViaje?.descripcion || 'Sin descripción',
        itinerario: dias
      };

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
      doc.text(pdfData.titulo, margin, 45);
      
      // Información del viaje
      let yPosition = 55;
      yPosition = addSectionHeader('INFORMACIÓN DEL VIAJE', yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Información en dos columnas (sin emojis para evitar problemas de codificación)
      const info1 = [
        `Fechas: ${formatDate(pdfData.fecha_inicio)} - ${formatDate(pdfData.fecha_fin)}`,
        `Destino: Cusco`,
        `Duración: ${pdfData.duracion || 'No especificada'}`,
        `Grupo: ${pdfData.grupo?.nombre_grupo || 'No especificado'}`
      ];
      
      const info2 = [
        `Estado: ${pdfData.estado || 'No especificado'}`,
        `Pasajeros: ${pdfData.pasajeros?.length || 0} viajeros`
      ];
      
      // Mostrar información en dos columnas con límites de ancho para evitar choques
      const leftColX = margin;
      const rightColX = margin + (maxWidth * 0.53); // ~53% para separar adecuadamente
      const leftWidth = maxWidth * 0.48;
      const rightWidth = maxWidth * 0.45;
      const leftLines = doc.splitTextToSize(info1.join('\n'), leftWidth);
      const rightLines = doc.splitTextToSize(info2.join('\n'), rightWidth);
      doc.text(leftLines, leftColX, yPosition + 5);
      doc.text(rightLines, rightColX, yPosition + 5);

      // Avanzar Y en función de la columna más alta
      const lineHeight = 5;
      const usedLines = Math.max(leftLines.length, rightLines.length);
      yPosition += (usedLines * lineHeight) + 12;

      // Descripción
      yPosition = addSectionHeader('DESCRIPCIÓN DEL VIAJE', yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const descripcion = pdfData.descripcion || 'No hay descripción disponible';
      const descripcionLines = doc.splitTextToSize(descripcion, maxWidth);
      doc.text(descripcionLines, margin, yPosition);
      
      // Calcular nueva posición Y después de la descripción
      yPosition += (descripcionLines.length * 5) + 10;
      
      // Sección de itinerario detallado
      yPosition = addSectionHeader('ITINERARIO DETALLADO', yPosition - 5);
      
      // Preparar datos para la tabla de itinerario
      const tableData = [];
      
      (pdfData.itinerario || []).forEach((dia, index) => {
        // Agregar encabezado de día
        tableData.push([
          { 
            content: `DÍA ${index + 1}: ${dia.fecha ? formatDate(dia.fecha) : 'Fecha no especificada'}`,
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
      
      // Generar tabla de itinerario (ajustado para evitar overflow de ancho)
      const availableWidth = maxWidth;
      const colWidths = {
        0: availableWidth * 0.12, // Hora
        1: availableWidth * 0.16, // Tipo
        2: availableWidth * 0.42, // Actividad
        3: availableWidth * 0.22, // Ubicación
        4: availableWidth * 0.08  // Duración
      };

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
          cellPadding: 3,
          overflow: 'linebreak'
        },
        alternateRowStyles: {
          fillColor: [245, 249, 255]
        },
        columnStyles: {
          0: { cellWidth: colWidths[0], halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: colWidths[1], fontStyle: 'bold', textColor: [24, 144, 255] },
          2: { cellWidth: colWidths[2] },
          3: { cellWidth: colWidths[3] },
          4: { cellWidth: colWidths[4], halign: 'center', fontStyle: 'bold', textColor: [100, 100, 100] }
        },
        margin: { 
          left: margin, 
          right: margin,
          top: 5
        },
        tableWidth: availableWidth,
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

      // Sección de transportes (si hay datos)
      const transportes = Array.isArray(baseViaje?.transportes) ? baseViaje.transportes : [];
      if (transportes.length > 0) {
        const startYTrans = (doc.lastAutoTable && doc.lastAutoTable.finalY)
          ? doc.lastAutoTable.finalY + 12
          : (yPosition + 12);
        // Encabezado de sección
        const yTransHeader = addSectionHeader('TRANSPORTES', startYTrans);
        const transAvailableWidth = maxWidth;
        const transCol = {
          0: transAvailableWidth * 0.18, // Hora
          1: transAvailableWidth * 0.42, // Empresa (tipo)
          2: transAvailableWidth * 0.40  // Lugar
        };
        // Mapear fecha del programa para cada transporte
        const fechaByIp = new Map();
        (Array.isArray(baseViaje?.programas) ? baseViaje.programas : []).forEach(p => {
          if (p && p.id) fechaByIp.set(p.id, p.fecha);
        });
        const transBody = transportes.map((t) => {
          const fecha = fechaByIp.get(t.id_itinerario_programa);
          const horaLabel = t.horario_recojo || '--:--';
          const fechaHora = fecha ? `${formatDate(fecha)} ${horaLabel}` : horaLabel;
          return [
            fechaHora,
            `${t.transporte_info?.empresa || '—'} (${t.transporte_info?.tipo || '—'})`,
            t.lugar_recojo || '—'
          ];
        });

        autoTable(doc, {
          startY: yTransHeader,
          head: [[ 'HORA', 'EMPRESA / TIPO', 'LUGAR' ]],
          body: transBody,
          headStyles: {
            fillColor: [13, 71, 161], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 9
          },
          bodyStyles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
          alternateRowStyles: { fillColor: [245, 249, 255] },
          columnStyles: {
            0: { cellWidth: transCol[0], halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: transCol[1] },
            2: { cellWidth: transCol[2] }
          },
          margin: { left: margin, right: margin, top: 5 },
          tableWidth: transAvailableWidth,
          didDrawPage: function(data) {
            const pageCount = doc.internal.getNumberOfPages();
            const currentPage = data.pageNumber;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${currentPage} de ${pageCount}`,
                     data.settings.margin.left,
                     doc.internal.pageSize.getHeight() - 10);
            doc.setTextColor(24, 144, 255);
            doc.setFontSize(10);
            doc.text('TravelDesk - Sistema de Gestión de Itinerarios',
              pageWidth / 2,
              doc.internal.pageSize.getHeight() - 10,
              { align: 'center' }
            );
          }
        });
      }
      
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
