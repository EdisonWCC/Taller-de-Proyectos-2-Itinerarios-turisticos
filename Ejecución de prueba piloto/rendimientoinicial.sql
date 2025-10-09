EXPLAIN SELECT i.id_itinerario, g.nombre, e.nombre_estado
FROM itinerarios i
JOIN grupos g ON i.id_grupo = g.id_grupo
JOIN estados_presupuesto e ON i.estado_presupuesto_id = e.id_estado;
