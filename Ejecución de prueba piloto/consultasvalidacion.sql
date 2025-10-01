-- Itinerarios con sus grupos y estado
SELECT i.id_itinerario, g.nombre AS grupo, e.nombre_estado, i.fecha_inicio, i.fecha_fin
FROM itinerarios i
JOIN grupos g ON i.id_grupo = g.id_grupo
JOIN estados_presupuesto e ON i.estado_presupuesto_id = e.id_estado;

-- Programas por itinerario
SELECT ip.id_itinerario_programa, i.id_itinerario, p.nombre, ip.fecha, ip.hora_inicio, ip.hora_fin
FROM itinerario_programas ip
JOIN programas p ON ip.id_programa = p.id_programa
JOIN itinerarios i ON ip.id_itinerario = i.id_itinerario;

-- Turistas en cada itinerario
SELECT it.id_itinerario, t.nombre, t.apellido, t.nacionalidad
FROM itinerario_turistas it
JOIN turistas t ON it.id_turista = t.id_turista;

-- Transporte asignado
SELECT dti.id_detalle_transporte, ip.id_itinerario_programa, tr.empresa, tr.tipo, dti.horario_recojo, dti.lugar_recojo
FROM detalle_transporte_itinerario dti
JOIN transportes tr ON dti.id_transporte = tr.id_transporte
JOIN itinerario_programas ip ON dti.id_itinerario_programa = ip.id_itinerario_programa;

-- Detalle Machu Picchu
SELECT dmi.id_itinerario_programa, dmi.empresa_tren, dmi.horario_tren_ida, dmi.horario_tren_retor, dmi.nombre_guia
FROM detalle_machu_itinerario dmi;

