--
-- PostgreSQL database dump
--

\restrict QetBAXdUINvTgfq7S6SW5rjuMZqnjIp7HzRaXCnRkMbOqmhbiz6PxM4E2bx3ZQi

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

-- Started on 2026-07-12 22:37:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 243 (class 1259 OID 16577)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id_auditoria integer NOT NULL,
    id_usuario integer,
    accion character varying(100),
    entidad_afectada character varying(100),
    id_registro integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    detalle text
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16576)
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_auditoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 242
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNED BY public.auditoria.id_auditoria;


--
-- TOC entry 224 (class 1259 OID 16443)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id_categoria integer NOT NULL,
    nombre character varying(100),
    descripcion character varying(200)
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16442)
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 223
-- Name: categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_categoria_seq OWNED BY public.categoria.id_categoria;


--
-- TOC entry 222 (class 1259 OID 16424)
-- Name: empleado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleado (
    id_empleado integer NOT NULL,
    id_usuario integer,
    id_sucursal integer,
    cargo character varying(100),
    fecha_ingreso date,
    estado character varying(20)
);


ALTER TABLE public.empleado OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16423)
-- Name: empleado_id_empleado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleado_id_empleado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleado_id_empleado_seq OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 221
-- Name: empleado_id_empleado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleado_id_empleado_seq OWNED BY public.empleado.id_empleado;


--
-- TOC entry 235 (class 1259 OID 16528)
-- Name: factura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura (
    id_factura integer NOT NULL,
    id_pago integer,
    numero_factura character varying(50),
    fecha_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subtotal numeric(10,2),
    iva numeric(10,2),
    total numeric(10,2),
    estado character varying(20)
);


ALTER TABLE public.factura OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16527)
-- Name: factura_id_factura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_id_factura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_id_factura_seq OWNER TO postgres;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 234
-- Name: factura_id_factura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_id_factura_seq OWNED BY public.factura.id_factura;


--
-- TOC entry 241 (class 1259 OID 16562)
-- Name: notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacion (
    id_notificacion integer NOT NULL,
    id_usuario integer,
    tipo character varying(30),
    mensaje text,
    fecha_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20)
);


ALTER TABLE public.notificacion OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16561)
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacion_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNER TO postgres;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 240
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNED BY public.notificacion.id_notificacion;


--
-- TOC entry 233 (class 1259 OID 16515)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    id_reserva integer,
    monto numeric(10,2),
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metodo_pago character varying(30),
    referencia character varying(100),
    estado character varying(20)
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16514)
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- TOC entry 239 (class 1259 OID 16552)
-- Name: postulacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postulacion (
    id_postulacion integer NOT NULL,
    nombre character varying(100),
    apellido character varying(100),
    correo character varying(150),
    telefono character varying(20),
    hoja_vida character varying(255),
    puesto character varying(100),
    fecha_postulacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20),
    observaciones character varying(200)
);


ALTER TABLE public.postulacion OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16551)
-- Name: postulacion_id_postulacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.postulacion_id_postulacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.postulacion_id_postulacion_seq OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 238
-- Name: postulacion_id_postulacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.postulacion_id_postulacion_seq OWNED BY public.postulacion.id_postulacion;


--
-- TOC entry 237 (class 1259 OID 16545)
-- Name: promocion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promocion (
    id_promocion integer NOT NULL,
    nombre character varying(100),
    descripcion character varying(200),
    tipo_descuento character varying(20),
    valor_descuento numeric(10,2),
    fecha_inicio date,
    fecha_fin date,
    estado character varying(20)
);


ALTER TABLE public.promocion OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16544)
-- Name: promocion_id_promocion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promocion_id_promocion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promocion_id_promocion_seq OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 236
-- Name: promocion_id_promocion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promocion_id_promocion_seq OWNED BY public.promocion.id_promocion;


--
-- TOC entry 228 (class 1259 OID 16464)
-- Name: reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva (
    id_reserva integer NOT NULL,
    id_cliente integer,
    id_vehiculo integer,
    id_sucursal_entrega integer,
    id_sucursal_devolucion integer,
    fecha_reserva timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    estado character varying(30) DEFAULT 'Pendiente'::character varying,
    total_estimado numeric(10,2),
    observaciones character varying(200)
);


ALTER TABLE public.reserva OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16463)
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_id_reserva_seq OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 227
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_id_reserva_seq OWNED BY public.reserva.id_reserva;


--
-- TOC entry 231 (class 1259 OID 16499)
-- Name: reserva_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva_servicio (
    id_reserva integer NOT NULL,
    id_servicio integer NOT NULL,
    precio numeric(10,2)
);


ALTER TABLE public.reserva_servicio OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16493)
-- Name: servicio_adicional; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_adicional (
    id_servicio integer NOT NULL,
    nombre character varying(100),
    descripcion character varying(200),
    precio numeric(10,2),
    estado character varying(20)
);


ALTER TABLE public.servicio_adicional OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16492)
-- Name: servicio_adicional_id_servicio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicio_adicional_id_servicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicio_adicional_id_servicio_seq OWNER TO postgres;

--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 229
-- Name: servicio_adicional_id_servicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicio_adicional_id_servicio_seq OWNED BY public.servicio_adicional.id_servicio;


--
-- TOC entry 220 (class 1259 OID 16415)
-- Name: sucursal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sucursal (
    id_sucursal integer NOT NULL,
    nombre character varying(100),
    direccion character varying(200),
    ciudad character varying(100),
    telefono character varying(20),
    correo character varying(150)
);


ALTER TABLE public.sucursal OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16414)
-- Name: sucursal_id_sucursal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sucursal_id_sucursal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sucursal_id_sucursal_seq OWNER TO postgres;

--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 219
-- Name: sucursal_id_sucursal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sucursal_id_sucursal_seq OWNED BY public.sucursal.id_sucursal;


--
-- TOC entry 218 (class 1259 OID 16403)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre character varying(100),
    apellido character varying(100),
    correo character varying(150),
    contrasena character varying(255),
    rol character varying(30),
    estado character varying(20) DEFAULT 'Activo'::character varying
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16402)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 226 (class 1259 OID 16450)
-- Name: vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculo (
    id_vehiculo integer NOT NULL,
    id_categoria integer,
    marca character varying(50),
    modelo character varying(50),
    placa character varying(20),
    anio integer,
    kilometraje integer DEFAULT 0,
    precio_diario numeric(10,2),
    estado character varying(30) DEFAULT 'Disponible'::character varying
);


ALTER TABLE public.vehiculo OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16449)
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculo_id_vehiculo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculo_id_vehiculo_seq OWNER TO postgres;

--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 225
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculo_id_vehiculo_seq OWNED BY public.vehiculo.id_vehiculo;


--
-- TOC entry 4827 (class 2604 OID 16580)
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_id_auditoria_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 16446)
-- Name: categoria id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id_categoria SET DEFAULT nextval('public.categoria_id_categoria_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 16427)
-- Name: empleado id_empleado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado ALTER COLUMN id_empleado SET DEFAULT nextval('public.empleado_id_empleado_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 16531)
-- Name: factura id_factura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura ALTER COLUMN id_factura SET DEFAULT nextval('public.factura_id_factura_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 16565)
-- Name: notificacion id_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificacion_id_notificacion_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 16518)
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 16555)
-- Name: postulacion id_postulacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postulacion ALTER COLUMN id_postulacion SET DEFAULT nextval('public.postulacion_id_postulacion_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 16548)
-- Name: promocion id_promocion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocion ALTER COLUMN id_promocion SET DEFAULT nextval('public.promocion_id_promocion_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 16467)
-- Name: reserva id_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('public.reserva_id_reserva_seq'::regclass);


--
-- TOC entry 4817 (class 2604 OID 16496)
-- Name: servicio_adicional id_servicio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_adicional ALTER COLUMN id_servicio SET DEFAULT nextval('public.servicio_adicional_id_servicio_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 16418)
-- Name: sucursal id_sucursal; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursal ALTER COLUMN id_sucursal SET DEFAULT nextval('public.sucursal_id_sucursal_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16406)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 16453)
-- Name: vehiculo id_vehiculo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo ALTER COLUMN id_vehiculo SET DEFAULT nextval('public.vehiculo_id_vehiculo_seq'::regclass);


--
-- TOC entry 5049 (class 0 OID 16577)
-- Dependencies: 243
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (id_auditoria, id_usuario, accion, entidad_afectada, id_registro, fecha, detalle) FROM stdin;
\.


--
-- TOC entry 5030 (class 0 OID 16443)
-- Dependencies: 224
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id_categoria, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5028 (class 0 OID 16424)
-- Dependencies: 222
-- Data for Name: empleado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleado (id_empleado, id_usuario, id_sucursal, cargo, fecha_ingreso, estado) FROM stdin;
\.


--
-- TOC entry 5041 (class 0 OID 16528)
-- Dependencies: 235
-- Data for Name: factura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factura (id_factura, id_pago, numero_factura, fecha_emision, subtotal, iva, total, estado) FROM stdin;
\.


--
-- TOC entry 5047 (class 0 OID 16562)
-- Dependencies: 241
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacion (id_notificacion, id_usuario, tipo, mensaje, fecha_envio, estado) FROM stdin;
\.


--
-- TOC entry 5039 (class 0 OID 16515)
-- Dependencies: 233
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, id_reserva, monto, fecha_pago, metodo_pago, referencia, estado) FROM stdin;
\.


--
-- TOC entry 5045 (class 0 OID 16552)
-- Dependencies: 239
-- Data for Name: postulacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postulacion (id_postulacion, nombre, apellido, correo, telefono, hoja_vida, puesto, fecha_postulacion, estado, observaciones) FROM stdin;
\.


--
-- TOC entry 5043 (class 0 OID 16545)
-- Dependencies: 237
-- Data for Name: promocion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promocion (id_promocion, nombre, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, estado) FROM stdin;
\.


--
-- TOC entry 5034 (class 0 OID 16464)
-- Dependencies: 228
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva (id_reserva, id_cliente, id_vehiculo, id_sucursal_entrega, id_sucursal_devolucion, fecha_reserva, fecha_inicio, fecha_fin, estado, total_estimado, observaciones) FROM stdin;
\.


--
-- TOC entry 5037 (class 0 OID 16499)
-- Dependencies: 231
-- Data for Name: reserva_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva_servicio (id_reserva, id_servicio, precio) FROM stdin;
\.


--
-- TOC entry 5036 (class 0 OID 16493)
-- Dependencies: 230
-- Data for Name: servicio_adicional; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio_adicional (id_servicio, nombre, descripcion, precio, estado) FROM stdin;
\.


--
-- TOC entry 5026 (class 0 OID 16415)
-- Dependencies: 220
-- Data for Name: sucursal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sucursal (id_sucursal, nombre, direccion, ciudad, telefono, correo) FROM stdin;
\.


--
-- TOC entry 5024 (class 0 OID 16403)
-- Dependencies: 218
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, nombre, apellido, correo, contrasena, rol, estado) FROM stdin;
\.


--
-- TOC entry 5032 (class 0 OID 16450)
-- Dependencies: 226
-- Data for Name: vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculo (id_vehiculo, id_categoria, marca, modelo, placa, anio, kilometraje, precio_diario, estado) FROM stdin;
\.


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 242
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 1, false);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 223
-- Name: categoria_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_categoria_seq', 1, false);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 221
-- Name: empleado_id_empleado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleado_id_empleado_seq', 1, false);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 234
-- Name: factura_id_factura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_id_factura_seq', 1, false);


--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 240
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacion_id_notificacion_seq', 1, false);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 1, false);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 238
-- Name: postulacion_id_postulacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postulacion_id_postulacion_seq', 1, false);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 236
-- Name: promocion_id_promocion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promocion_id_promocion_seq', 1, false);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 227
-- Name: reserva_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_id_reserva_seq', 1, false);


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 229
-- Name: servicio_adicional_id_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_adicional_id_servicio_seq', 1, false);


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 219
-- Name: sucursal_id_sucursal_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sucursal_id_sucursal_seq', 1, false);


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 1, false);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 225
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculo_id_vehiculo_seq', 1, false);


--
-- TOC entry 4864 (class 2606 OID 16585)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- TOC entry 4840 (class 2606 OID 16448)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4836 (class 2606 OID 16431)
-- Name: empleado empleado_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT empleado_id_usuario_key UNIQUE (id_usuario);


--
-- TOC entry 4838 (class 2606 OID 16429)
-- Name: empleado empleado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT empleado_pkey PRIMARY KEY (id_empleado);


--
-- TOC entry 4852 (class 2606 OID 16536)
-- Name: factura factura_id_pago_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_id_pago_key UNIQUE (id_pago);


--
-- TOC entry 4854 (class 2606 OID 16538)
-- Name: factura factura_numero_factura_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_numero_factura_key UNIQUE (numero_factura);


--
-- TOC entry 4856 (class 2606 OID 16534)
-- Name: factura factura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_pkey PRIMARY KEY (id_factura);


--
-- TOC entry 4862 (class 2606 OID 16570)
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion);


--
-- TOC entry 4850 (class 2606 OID 16521)
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- TOC entry 4860 (class 2606 OID 16560)
-- Name: postulacion postulacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postulacion
    ADD CONSTRAINT postulacion_pkey PRIMARY KEY (id_postulacion);


--
-- TOC entry 4858 (class 2606 OID 16550)
-- Name: promocion promocion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocion
    ADD CONSTRAINT promocion_pkey PRIMARY KEY (id_promocion);


--
-- TOC entry 4844 (class 2606 OID 16471)
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- TOC entry 4848 (class 2606 OID 16503)
-- Name: reserva_servicio reserva_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicio
    ADD CONSTRAINT reserva_servicio_pkey PRIMARY KEY (id_reserva, id_servicio);


--
-- TOC entry 4846 (class 2606 OID 16498)
-- Name: servicio_adicional servicio_adicional_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_adicional
    ADD CONSTRAINT servicio_adicional_pkey PRIMARY KEY (id_servicio);


--
-- TOC entry 4834 (class 2606 OID 16422)
-- Name: sucursal sucursal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursal
    ADD CONSTRAINT sucursal_pkey PRIMARY KEY (id_sucursal);


--
-- TOC entry 4830 (class 2606 OID 16413)
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- TOC entry 4832 (class 2606 OID 16411)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4842 (class 2606 OID 16457)
-- Name: vehiculo vehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT vehiculo_pkey PRIMARY KEY (id_vehiculo);


--
-- TOC entry 4877 (class 2606 OID 16586)
-- Name: auditoria fk_auditoria_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4865 (class 2606 OID 16437)
-- Name: empleado fk_empleado_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT fk_empleado_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursal(id_sucursal);


--
-- TOC entry 4866 (class 2606 OID 16432)
-- Name: empleado fk_empleado_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4875 (class 2606 OID 16539)
-- Name: factura fk_factura_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT fk_factura_pago FOREIGN KEY (id_pago) REFERENCES public.pago(id_pago);


--
-- TOC entry 4876 (class 2606 OID 16571)
-- Name: notificacion fk_notificacion_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4874 (class 2606 OID 16522)
-- Name: pago fk_pago_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva);


--
-- TOC entry 4868 (class 2606 OID 16472)
-- Name: reserva fk_reserva_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4869 (class 2606 OID 16487)
-- Name: reserva fk_reserva_sucursal_devolucion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_sucursal_devolucion FOREIGN KEY (id_sucursal_devolucion) REFERENCES public.sucursal(id_sucursal);


--
-- TOC entry 4870 (class 2606 OID 16482)
-- Name: reserva fk_reserva_sucursal_entrega; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_sucursal_entrega FOREIGN KEY (id_sucursal_entrega) REFERENCES public.sucursal(id_sucursal);


--
-- TOC entry 4871 (class 2606 OID 16477)
-- Name: reserva fk_reserva_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculo(id_vehiculo);


--
-- TOC entry 4872 (class 2606 OID 16504)
-- Name: reserva_servicio fk_rs_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicio
    ADD CONSTRAINT fk_rs_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva);


--
-- TOC entry 4873 (class 2606 OID 16509)
-- Name: reserva_servicio fk_rs_servicio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_servicio
    ADD CONSTRAINT fk_rs_servicio FOREIGN KEY (id_servicio) REFERENCES public.servicio_adicional(id_servicio);


--
-- TOC entry 4867 (class 2606 OID 16458)
-- Name: vehiculo fk_vehiculo_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT fk_vehiculo_categoria FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria);


--
-- Procedimientos utilizados por la API
--

CREATE OR REPLACE PROCEDURE public.registrar_reserva(
    IN p_id_cliente integer,
    IN p_id_vehiculo integer,
    IN p_id_sucursal_entrega integer,
    IN p_id_sucursal_devolucion integer,
    IN p_fecha_inicio timestamp without time zone,
    IN p_fecha_fin timestamp without time zone,
    IN p_total numeric,
    IN p_observaciones character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
        RAISE EXCEPTION 'Las fechas de inicio y fin son obligatorias';
    END IF;

    IF p_fecha_fin <= p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
    END IF;

    IF p_total IS NULL OR p_total < 0 THEN
        RAISE EXCEPTION 'El total de la reserva no puede ser negativo';
    END IF;

    INSERT INTO public.reserva (
        id_cliente,
        id_vehiculo,
        id_sucursal_entrega,
        id_sucursal_devolucion,
        fecha_inicio,
        fecha_fin,
        estado,
        total_estimado,
        observaciones
    ) VALUES (
        p_id_cliente,
        p_id_vehiculo,
        p_id_sucursal_entrega,
        p_id_sucursal_devolucion,
        p_fecha_inicio,
        p_fecha_fin,
        'Pendiente',
        ROUND(p_total, 2),
        LEFT(p_observaciones, 200)
    );
END;
$$;


CREATE OR REPLACE PROCEDURE public.cancelar_reserva(
    IN p_id_reserva integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.reserva
        WHERE id_reserva = p_id_reserva
    ) THEN
        RAISE EXCEPTION 'La reserva % no existe', p_id_reserva;
    END IF;

    UPDATE public.reserva
    SET estado = 'Cancelada'
    WHERE id_reserva = p_id_reserva
      AND estado <> 'Cancelada';
END;
$$;


CREATE OR REPLACE PROCEDURE public.registrar_pago(
    IN p_id_reserva integer,
    IN p_monto numeric,
    IN p_metodo_pago character varying,
    IN p_referencia character varying,
    IN p_estado character varying
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.reserva
        WHERE id_reserva = p_id_reserva
    ) THEN
        RAISE EXCEPTION 'La reserva % no existe', p_id_reserva;
    END IF;

    IF p_monto IS NULL OR p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto del pago debe ser mayor que cero';
    END IF;

    INSERT INTO public.pago (
        id_reserva,
        monto,
        metodo_pago,
        referencia,
        estado
    ) VALUES (
        p_id_reserva,
        ROUND(p_monto, 2),
        LEFT(p_metodo_pago, 30),
        LEFT(p_referencia, 100),
        LEFT(p_estado, 20)
    );

    IF LOWER(COALESCE(p_estado, '')) IN ('completado', 'completada', 'pagado') THEN
        UPDATE public.reserva
        SET estado = 'Confirmada'
        WHERE id_reserva = p_id_reserva
          AND estado <> 'Cancelada';
    END IF;
END;
$$;


-- Completed on 2026-07-12 22:37:07

--
-- PostgreSQL database dump complete
--

\unrestrict QetBAXdUINvTgfq7S6SW5rjuMZqnjIp7HzRaXCnRkMbOqmhbiz6PxM4E2bx3ZQi
