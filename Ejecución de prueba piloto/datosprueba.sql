-- Usuarios
INSERT INTO usuarios (nombre_usuario, email, password, rol) 
VALUES ('admin', 'admin@gmail.com', '123456', 'admin'),
       ('agente', 'agente@gmail.com', '123456', 'agente'),
       ('cliente', 'cliente@gmail.com', '123456', 'cliente');

-- Grupos
INSERT INTO grupos (nombre, descripcion) 
VALUES ('Grupo Cusco Setiembre', 'Turistas que visitan Cusco en setiembre'),
       ('Grupo Machu Octubre', 'Grupo exclusivo para Machu Picchu en octubre');

-- Estados presupuesto
INSERT INTO estados_presupuesto (nombre_estado)
VALUES ('Pendiente'), ('Aprobado'), ('Rechazado');

-- Itinerarios
INSERT INTO itinerarios (id_grupo, fecha_inicio, fecha_fin, estado_presupuesto_id)
VALUES (1, '2025-09-25', '2025-09-28', 1),
       (2, '2025-10-05', '2025-10-07', 2);

-- Programas
INSERT INTO programas (nombre, descripcion, tipo, duracion, costo)
VALUES ('City Tour Cusco', 'Recorrido por la ciudad de Cusco', 'tour', 1, 150.00),
       ('Visita Machu Picchu', 'Tour completo al santuario', 'machupicchu', 1, 300.00),
       ('Trekking Montaña de 7 Colores', 'Caminata guiada', 'actividad', 1, 200.00);

-- Itinerario Programas
INSERT INTO itinerario_programas (id_itinerario, id_programa, fecha, hora_inicio, hora_fin)
VALUES (1, 1, '2025-09-25', '09:00:00', '13:00:00'),
       (1, 3, '2025-09-26', '06:00:00', '15:00:00'),
       (2, 2, '2025-10-06', '05:30:00', '17:00:00');

-- Turistas
INSERT INTO turistas (id_usuario, nombre, apellido, dni, nacionalidad, fecha_nacimiento, genero)
VALUES (3, 'Juan', 'Perez', '12345678', 'Peruano', '1990-01-01', 'M'),
       (3, 'Maria', 'Lopez', '87654321', 'Argentina', '1992-03-15', 'F');

-- Itinerario - Turistas
INSERT INTO itinerario_turistas (id_itinerario, id_turista)
VALUES (1, 1), (1, 2), (2, 2);

-- Transportes
INSERT INTO transportes (empresa, tipo, capacidad, contacto)
VALUES ('Peru Rail', 'tren', 100, '999-888-777'),
       ('InkaBus', 'bus', 50, '988-777-666');

-- Detalle Transporte Itinerario
INSERT INTO detalle_transporte_itinerario (id_itinerario_programa, id_transporte, horario_recojo, lugar_recojo)
VALUES (1, 2, '08:00:00', 'Plaza de Armas'),
       (3, 1, '04:30:00', 'Estación de tren');

-- Detalle Machu Picchu Itinerario
INSERT INTO detalle_machu_itinerario (id_itinerario_programa, empresa_tren, horario_tren_ida, horario_tren_retor, nombre_guia, ruta, tiempo_visita)
VALUES (3, 'Peru Rail', '06:00:00', '18:00:00', 'Carlos Huamán', 'Aguas', '4 horas');
