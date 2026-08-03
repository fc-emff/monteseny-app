-- Montseny — esquema de base de datos para Supabase
-- Ejecuta este archivo completo en Supabase: Project > SQL Editor > New query > pega y ejecuta.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- Puntos de muestreo (lista fija extraída del KML del proyecto)
-- ---------------------------------------------------------------
create table if not exists sampling_points (
  name   text primary key,
  lat    double precision not null,
  lon    double precision not null,
  estado text not null default 'pendiente',
  fecha  date,
  notas  text default ''
);

insert into sampling_points (name, lat, lon, estado, fecha, notas) values
  ('UM_1 roca centella', 41.719245, 2.322466, 'muestreado', '2026-06-29', ''),
  ('UM_2',               41.721605, 2.331489, 'muestreado', '2026-06-29', ''),
  ('UM_3',               41.718915, 2.327578, 'muestreado', '2026-06-29', ''),
  ('UM_4',               41.718230, 2.331686, 'muestreado', '2026-06-29', ''),
  ('UM_5',               41.719396, 2.334597, 'muestreado', '2026-06-29', ''),
  ('UM_6',               41.720001, 2.335315, 'muestreado', '2026-06-29', ''),
  ('UM_7 bosc masia',    41.721630, 2.337979, 'muestreado', '2026-06-29', ''),
  ('UM_8',               41.723855, 2.334436, 'muestreado', '2026-06-29', ''),
  ('UM_9',               41.726777, 2.336931, 'muestreado', '2026-06-29', ''),
  ('UM_10 Mat1',         41.722372, 2.335327, 'muestreado', '2026-06-29', ''),
  ('UM_11 Mat2',         41.721638, 2.334905, 'muestreado', '2026-06-29', ''),
  ('UM_12 Mat3',         41.721061, 2.334230, 'muestreado', '2026-06-29', ''),
  ('UM_13 Prat1',        41.721477, 2.333623, 'muestreado', '2026-06-29', ''),
  ('UM_14 Prat2',        41.722652, 2.334663, 'muestreado', '2026-06-29', ''),
  ('UM_15 Prat3',        41.721408, 2.335778, 'muestreado', '2026-06-29', '')
on conflict (name) do nothing;

-- ---------------------------------------------------------------
-- Otros puntos (equipo / infraestructura / otro)
-- ---------------------------------------------------------------
create table if not exists reference_points (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  tipo       text not null default 'otro',
  lat        double precision not null,
  lon        double precision not null,
  notas      text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Inventario de herramientas
-- ---------------------------------------------------------------
create table if not exists inventory (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  cantidad   integer not null default 1,
  estado     text not null default 'disponible',
  ubicacion  text default '',
  notas      text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descripcion text default '',
  fecha       date,
  done        boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Sensores y cámaras
-- ---------------------------------------------------------------
create table if not exists devices (
  id         uuid primary key default gen_random_uuid(),
  tipo       text not null default 'sensor',
  nombre     text not null,
  estado     text not null default 'pendiente',
  ubicacion  text default '',
  fecha      date,
  notas      text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Resultados de estudios
-- ---------------------------------------------------------------
create table if not exists study_results (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  fecha        date,
  responsable  text default '',
  punto        text default '',
  enlace       text default '',
  resumen      text default '',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Seguridad: Row Level Security activado y SIN políticas.
-- Esto bloquea cualquier acceso directo (por ejemplo si alguien obtuviera
-- la clave "anon" pública). Solo el backend, que usa la clave
-- "service_role" (y por lo tanto ignora RLS), puede leer o escribir.
-- El frontend nunca debe hablar directamente con Supabase.
-- ---------------------------------------------------------------
alter table sampling_points  enable row level security;
alter table reference_points enable row level security;
alter table inventory        enable row level security;
alter table tasks            enable row level security;
alter table devices          enable row level security;
alter table study_results    enable row level security;
