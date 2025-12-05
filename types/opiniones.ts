export interface Opinion {
  id: number;
  producto_id: number;
  usuario_id: number;
  venta_id: number;
  calificacion: 1 | 2 | 3 | 4 | 5; // Solo valores del 1 al 5
  comentario?: string | null;
  fecha_creacion: string; // ISO string del timestamp

  // Datos opcionales relacionados con el usuario y producto
  usuario_nombre?: string;
  usuario_email?: string;
  producto_nombre?: string;
}

export interface OpinionEstadisticas {
  promedio: number | null;
  total_opiniones: number;
  cinco_estrellas: number;
  cuatro_estrellas: number;
  tres_estrellas: number;
  dos_estrellas: number;
  una_estrella: number;
}

export interface OpinionesProductoResponse {
  producto_id: number;
  estadisticas: OpinionEstadisticas;
  opiniones: Opinion[];
  total: number;
}
