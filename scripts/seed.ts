import { hashSync } from "bcrypt-ts";
import { runSqliteMigrations } from "./migrate-sqlite";
import { getSqliteDb } from "../src/shared/db/sqlite.driver";
import { env } from "../src/shared/config/env";
import { TourConfig } from "../src/modules/locales/domain/local.entity";

export async function runSeed() {
  console.log("🌱 Iniciando siembra de datos de prueba...");
  runSqliteMigrations();

  const db = getSqliteDb();

  const transaction = db.transaction(() => {
    db.exec(`
      DELETE FROM audit_log;
      DELETE FROM leads;
      DELETE FROM media;
      DELETE FROM locales;
      DELETE FROM users;
    `);

  const passwordHashDefault = hashSync("Password123!", 10);
  const adminPasswordHash = hashSync(env.ADMIN_PASSWORD, 10);
  const now = new Date().toISOString();

  // 1. Crear Administrador Único
  const adminId = "usr-admin-001";
  db.prepare(`
    INSERT INTO users (id, role, nombre, email, password_hash, telefono_whatsapp, nombre_negocio, estado, created_at, updated_at)
    VALUES (?, 'admin', ?, ?, ?, ?, ?, 'activo', ?, ?)
  `).run(
    adminId,
    "Administrador General LocalVista",
    env.ADMIN_EMAIL.toLowerCase(),
    adminPasswordHash,
    "+51999999999",
    "LocalVista Administración",
    now,
    now
  );
  console.log(`👤 Admin creado: ${env.ADMIN_EMAIL}`);

  // 2. Crear 4 Propietarios
  const owners = [
    {
      id: "usr-owner-001",
      nombre: "Carlos Mendoza Ramos",
      email: "carlos.mendoza@inmobiliariacentro.pe",
      telefono: "+51981234567",
      negocio: "Inmobiliaria Centro Lima",
      estado: "activo",
    },
    {
      id: "usr-owner-002",
      nombre: "Lucía Salazar Delgado",
      email: "lucia.salazar@retailspaces.pe",
      telefono: "+51972345678",
      negocio: "Retail Spaces Perú",
      estado: "activo",
    },
    {
      id: "usr-owner-003",
      nombre: "Renzo Alva Castro",
      email: "renzo.alva@urbanlocales.pe",
      telefono: "+51963456789",
      negocio: "Urban Locales Surco",
      estado: "activo",
    },
    {
      id: "usr-owner-004",
      nombre: "Gabriela Prado Solís",
      email: "gabriela.prado@invercapital.pe",
      telefono: "+51954567890",
      negocio: "InverCapital Perú",
      estado: "pendiente", // Usuario pendiente para probar moderación de admin
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, nombre, email, password_hash, telefono_whatsapp, nombre_negocio, estado, created_at, updated_at)
    VALUES (?, 'owner', ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const owner of owners) {
    insertUser.run(
      owner.id,
      owner.nombre,
      owner.email.toLowerCase(),
      passwordHashDefault,
      owner.telefono,
      owner.negocio,
      owner.estado,
      now,
      now
    );
  }
  console.log("👥 4 Propietarios creados.");

  // 3. Crear 10 Locales de ejemplo con configuraciones 3D variadas
  const locales = [
    {
      id: "loc-001",
      owner_id: "usr-owner-001",
      slug: "local-puerta-a-calle-av-larco-miraflores",
      titulo: "Local Comercial Puerta a Calle en Av. Larco",
      operacion: "alquiler",
      precio: 6500,
      moneda: "PEN",
      area_m2: 110,
      direccion: "Av. José Larco 680",
      distrito: "Miraflores",
      ciudad: "Lima",
      lat: -12.1265,
      lng: -77.0298,
      descripcion:
        "Excelente local con altísimo flujo peatonal y vehicular en pleno corazón comercial de Miraflores. Frente de 7 metros lineales con mampara de vidrio templado, piso de porcelanato de alto tránsito y punto de agua directo.",
      caracteristicas: {
        banos: 2,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: [
        "Boutique Retail",
        "Farmacia / Botica",
        "Calzado",
        "Tecnología",
      ],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 7.0, depth: 15.0, height: 3.4 },
        architecture: {
          wallColor: "#F1F5F9",
          wallTexture: "smooth",
          floorMaterial: "porcelain",
          floorColor: "#E2E8F0",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 2.2, height: 2.8 },
          windows: [
            { wall: "front", offset: -2.0, width: 2.5, height: 2.8 },
            { wall: "front", offset: 2.0, width: 2.5, height: 2.8 },
          ],
        },
        lighting: {
          ambientIntensity: 0.85,
          mode: "day",
          spotlights: [{ x: 0, y: 3.2, z: 0, intensity: 1.2 }],
        },
        preset: "retail_store",
        hotspots: [
          {
            id: "hs-1",
            position: [2.2, 1.2, -4],
            title: "Zona de Caja y Punto de Venta",
            description: "Equipada con canaletas de red CAT6 y tomas eléctricas reguladas.",
          },
          {
            id: "hs-2",
            position: [-2.4, 1.5, -2],
            title: "Línea de Estantería Principal",
            description: "Muro reforzado apto para percheros y displays suspendidos.",
          },
          {
            id: "hs-3",
            position: [0, 1.0, -6.5],
            title: "Almacén Posterior y Baño",
            description: "Espacio cerrado de 18 m² con puerta de seguridad y SSHH completo.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 6],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-002",
      owner_id: "usr-owner-002",
      slug: "salon-comercial-calle-los-libertadores-san-isidro",
      titulo: "Salón Comercial Corporativo en Calle Los Libertadores",
      operacion: "alquiler",
      precio: 2200,
      moneda: "USD",
      area_m2: 95,
      direccion: "Calle Los Libertadores 340",
      distrito: "San Isidro",
      ciudad: "Lima",
      lat: -12.1012,
      lng: -77.0375,
      descripcion:
        "Espacio de gran categoría ideal para estudio de diseño, showroom privado o consultoría financiera en zona exclusiva de San Isidro financiero y residencial.",
      caracteristicas: {
        banos: 1,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Showroom", "Oficina de Atención", "Estudio de Arquitectura"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 6.5, depth: 14.0, height: 3.2 },
        architecture: {
          wallColor: "#E2E8F0",
          wallTexture: "smooth",
          floorMaterial: "wood_laminate",
          floorColor: "#78350F",
          ceilingColor: "#F8FAFC",
          doorPosition: { wall: "front", offset: 0, width: 1.5, height: 2.6 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.9,
          mode: "day",
          spotlights: [],
        },
        preset: "office",
        hotspots: [
          {
            id: "hs-1",
            position: [0, 1.4, -3],
            title: "Área de Recepción",
            description: "Iluminación cálida con panel acústico decorativo.",
          },
          {
            id: "hs-2",
            position: [-1.8, 1.4, -5.5],
            title: "Sala de Reuniones",
            description: "Espacio para mesa de 8 personas con conexión multimedia.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 5],
          initialTarget: [0, 1.5, -1],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-003",
      owner_id: "usr-owner-001",
      slug: "espacio-gastronomico-cafeteria-av-benavides",
      titulo: "Espacio Gastronómico para Cafetería en Av. Benavides",
      operacion: "alquiler",
      precio: 4800,
      moneda: "PEN",
      area_m2: 80,
      direccion: "Av. Alfredo Benavides 1420",
      distrito: "Miraflores",
      ciudad: "Lima",
      lat: -12.128,
      lng: -77.0185,
      descripcion:
        "Local acondicionado con trampa de grasa, campana extractora y pozo a tierra. Perfecto para franquicia de café, panadería artesanal o barra de brunch.",
      caracteristicas: {
        banos: 2,
        estacionamiento: false,
        vitrina: true,
        aire_acondicionado: false,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Cafetería", "Pastelería", "Barra de Sushi", "Gelatería"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 5.5, depth: 14.5, height: 3.5 },
        architecture: {
          wallColor: "#FDE68A",
          wallTexture: "brick",
          floorMaterial: "ceramic",
          floorColor: "#7C2D12",
          ceilingColor: "#1E293B",
          doorPosition: { wall: "front", offset: 0, width: 1.8, height: 2.6 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.75,
          mode: "day",
          spotlights: [],
        },
        preset: "restaurant_cafe",
        hotspots: [
          {
            id: "hs-cafe-1",
            position: [1.5, 1.1, -2.5],
            title: "Barra de Café y Caja",
            description: "Encimera de granito con tomas para máquina espresso bifásica.",
          },
          {
            id: "hs-cafe-2",
            position: [-1.2, 1.2, -4],
            title: "Salón de Comensales",
            description: "Capacidad calculada para 28 sillas y mesas modulares.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 5],
          initialTarget: [0, 1.4, 0],
          fov: 65,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-004",
      owner_id: "usr-owner-003",
      slug: "local-comercial-esquina-av-primavera-surco",
      titulo: "Local Comercial en Esquina Estratégica Av. Primavera",
      operacion: "alquiler",
      precio: 8500,
      moneda: "PEN",
      area_m2: 160,
      direccion: "Av. Primavera 780 (Esquina con Calle Las Begonias)",
      distrito: "Santiago de Surco",
      ciudad: "Lima",
      lat: -12.112,
      lng: -76.995,
      descripcion:
        "Inmejorable visibilidad con 18 metros lineales de fachada en esquina comercial. Zonificación CZ (Comercio Zonal), apto para bancos, clínicas o retail.",
      caracteristicas: {
        banos: 3,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Entidad Financiera", "Cadena de Ropa", "Consultorio Médico"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 10.0, depth: 16.0, height: 3.8 },
        architecture: {
          wallColor: "#FFFFFF",
          wallTexture: "smooth",
          floorMaterial: "porcelain",
          floorColor: "#F8FAFC",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 2.8, height: 3.0 },
          windows: [
            { wall: "left", offset: 0, width: 8.0, height: 2.5 },
            { wall: "front", offset: 2.0, width: 4.0, height: 2.5 },
          ],
        },
        lighting: {
          ambientIntensity: 0.95,
          mode: "day",
          spotlights: [],
        },
        preset: "retail_store",
        hotspots: [
          {
            id: "hs-surco-1",
            position: [0, 1.5, 0],
            title: "Amplio Salón Principal Despejado",
            description: "Planta libre con columnas perimétricas para máxima versatilidad.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 7],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-005",
      owner_id: "usr-owner-002",
      slug: "boutique-comercial-av-conquistadores-san-isidro",
      titulo: "Boutique Comercial en Av. Conquistadores",
      operacion: "venta",
      precio: 320000,
      moneda: "USD",
      area_m2: 130,
      direccion: "Av. Conquistadores 890",
      distrito: "San Isidro",
      ciudad: "Lima",
      lat: -12.103,
      lng: -77.036,
      descripcion:
        "Inmueble comercial en venta en la principal avenida de modas y alta costura de San Isidro. Incluye 2 estacionamientos en frontis y mezzanine para depósito.",
      caracteristicas: {
        banos: 2,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Alta Costura", "Joyería", "Galería de Arte", "Óptica Premium"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 6.8, depth: 18.0, height: 4.0 },
        architecture: {
          wallColor: "#F8FAFC",
          wallTexture: "smooth",
          floorMaterial: "polished_concrete",
          floorColor: "#CBD5E1",
          ceilingColor: "#0F172A",
          doorPosition: { wall: "front", offset: 0, width: 2.0, height: 2.8 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.8,
          mode: "night",
          spotlights: [],
        },
        preset: "retail_store",
        hotspots: [
          {
            id: "hs-conq-1",
            position: [1.8, 1.4, -3],
            title: "Probadores y Sala VIP",
            description: "2 cabinas de vestir con espejos retroiluminados.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 6],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-006",
      owner_id: "usr-owner-003",
      slug: "showroom-comercial-av-javier-prado-este-san-borja",
      titulo: "Showroom y Local Comercial en Av. Javier Prado Este",
      operacion: "alquiler",
      precio: 7200,
      moneda: "PEN",
      area_m2: 140,
      direccion: "Av. Javier Prado Este 2650",
      distrito: "San Borja",
      ciudad: "Lima",
      lat: -12.088,
      lng: -77.001,
      descripcion:
        "Ubicación privilegiada con acceso inmediato a estación La Cultura del Metro. Gran exposición de marca con frente acristalado de doble altura.",
      caracteristicas: {
        banos: 2,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Electrónica", "Mobiliario", "Decoración", "Librería"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 8.0, depth: 17.5, height: 4.2 },
        architecture: {
          wallColor: "#E2E8F0",
          wallTexture: "smooth",
          floorMaterial: "porcelain",
          floorColor: "#F1F5F9",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 2.4, height: 3.0 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.9,
          mode: "day",
          spotlights: [],
        },
        preset: "retail_store",
        hotspots: [],
        camera: {
          initialPosition: [0, 1.6, 7],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-007",
      owner_id: "usr-owner-003",
      slug: "local-franquicia-restaurante-av-el-polo-surco",
      titulo: "Local para Franquicia o Restaurante en Av. El Polo",
      operacion: "alquiler",
      precio: 3100,
      moneda: "USD",
      area_m2: 175,
      direccion: "Av. El Polo 430",
      distrito: "Santiago de Surco",
      ciudad: "Lima",
      lat: -12.118,
      lng: -76.974,
      descripcion:
        "Local habilitado para gastronomía en el polo comercial de Surco. Zona de terraza delantera autorizada, ducto de evacuación de humos hasta azotea.",
      caracteristicas: {
        banos: 3,
        estacionamiento: true,
        vitrina: true,
        aire_acondicionado: true,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Restaurante", "Pizzería Gourmet", "Pollería Tradicional"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 9.0, depth: 19.0, height: 3.6 },
        architecture: {
          wallColor: "#FEF3C7",
          wallTexture: "brick",
          floorMaterial: "ceramic",
          floorColor: "#92400E",
          ceilingColor: "#1E293B",
          doorPosition: { wall: "front", offset: 0, width: 2.2, height: 2.8 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.85,
          mode: "day",
          spotlights: [],
        },
        preset: "restaurant_cafe",
        hotspots: [
          {
            id: "hs-polo-1",
            position: [2.5, 1.2, -4],
            title: "Área de Cocina y Pase",
            description: "Puntos de gas GLP / Cálidda y campana industrial instalada.",
          },
        ],
        camera: {
          initialPosition: [0, 1.6, 7],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-008",
      owner_id: "usr-owner-001",
      slug: "local-comercial-cerca-parque-kennedy-miraflores",
      titulo: "Local Comercial Tradicional cerca al Parque Kennedy",
      operacion: "traspaso",
      precio: 35000,
      moneda: "PEN",
      area_m2: 70,
      direccion: "Calle Schell 250",
      distrito: "Miraflores",
      ciudad: "Lima",
      lat: -12.122,
      lng: -77.031,
      descripcion:
        "Traspaso de local comercial funcionando con cartera de clientes cautiva a 50 metros del Parque Kennedy. Alquiler mensual pactado muy por debajo del precio de mercado.",
      caracteristicas: {
        banos: 1,
        estacionamiento: false,
        vitrina: true,
        aire_acondicionado: false,
        nivel: 1,
        pozo_tierra: true,
        trifasica: false,
      },
      rubros_sugeridos: ["Tienda de Souvenirs", "Llavería y Servicios", "Minimarket"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 5.0, depth: 14.0, height: 3.0 },
        architecture: {
          wallColor: "#F3F4F6",
          wallTexture: "smooth",
          floorMaterial: "ceramic",
          floorColor: "#E5E7EB",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 1.4, height: 2.4 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.8,
          mode: "day",
          spotlights: [],
        },
        preset: "empty",
        hotspots: [],
        camera: {
          initialPosition: [0, 1.6, 5],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-009",
      owner_id: "usr-owner-001",
      slug: "salon-comercial-jiron-de-la-union-cercado",
      titulo: "Salón Comercial en Jirón de la Unión",
      operacion: "alquiler",
      precio: 5500,
      moneda: "PEN",
      area_m2: 105,
      direccion: "Jr. de la Unión 740",
      distrito: "Cercado de Lima",
      ciudad: "Lima",
      lat: -12.049,
      lng: -77.033,
      descripcion:
        "Punto comercial estratégico de máxima concentración peatonal en el Centro Histórico de Lima. Portón metálico enrollable y falso techo desmontable.",
      caracteristicas: {
        banos: 1,
        estacionamiento: false,
        vitrina: true,
        aire_acondicionado: false,
        nivel: 1,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Calzado", "Prendas de Vestir", "Bazar", "Telefonía"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 6.0, depth: 17.0, height: 3.4 },
        architecture: {
          wallColor: "#E5E7EB",
          wallTexture: "smooth",
          floorMaterial: "porcelain",
          floorColor: "#D1D5DB",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 2.0, height: 2.8 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.85,
          mode: "day",
          spotlights: [],
        },
        preset: "retail_store",
        hotspots: [],
        camera: {
          initialPosition: [0, 1.6, 6],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    {
      id: "loc-010",
      owner_id: "usr-owner-002",
      slug: "deposito-comercial-despacho-gamarra-la-victoria",
      titulo: "Depósito Comercial y Despacho en Av. Gamarra",
      operacion: "alquiler",
      precio: 3800,
      moneda: "PEN",
      area_m2: 120,
      direccion: "Jr. Gamarra 1020, 2do Piso",
      distrito: "La Victoria",
      ciudad: "Lima",
      lat: -12.065,
      lng: -77.014,
      descripcion:
        "Ideal para almacén de confecciones, taller textil o despacho mayorista en el emporio comercial de Gamarra. Montacargas de 1 tonelada de carga.",
      caracteristicas: {
        banos: 2,
        estacionamiento: false,
        vitrina: false,
        aire_acondicionado: false,
        nivel: 2,
        pozo_tierra: true,
        trifasica: true,
      },
      rubros_sugeridos: ["Almacén Textil", "Showroom Mayorista", "Taller de Confección"],
      estado: "publicado",
      portada_url:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 8.0, depth: 15.0, height: 3.5 },
        architecture: {
          wallColor: "#E2E8F0",
          wallTexture: "concrete",
          floorMaterial: "polished_concrete",
          floorColor: "#94A3B8",
          ceilingColor: "#64748B",
          doorPosition: { wall: "front", offset: 0, width: 2.2, height: 2.6 },
          windows: [],
        },
        lighting: {
          ambientIntensity: 0.7,
          mode: "day",
          spotlights: [],
        },
        preset: "warehouse",
        hotspots: [],
        camera: {
          initialPosition: [0, 1.6, 6],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
    // Local extra en estado "en_revision" para pruebas de moderación
    {
      id: "loc-011",
      owner_id: "usr-owner-004",
      slug: "local-comercial-en-revision-surquillo",
      titulo: "Local Comercial para Tienda en Surquillo Tradicional",
      operacion: "alquiler",
      precio: 2900,
      moneda: "PEN",
      area_m2: 55,
      direccion: "Calle Dante 320",
      distrito: "Surquillo",
      ciudad: "Lima",
      lat: -12.115,
      lng: -77.025,
      descripcion:
        "Local nuevo en proceso de revisión por administración. Zona de alto tránsito cerca al mercado de Surquillo.",
      caracteristicas: {
        banos: 1,
        estacionamiento: false,
        vitrina: true,
        aire_acondicionado: false,
        nivel: 1,
      },
      rubros_sugeridos: ["Bodega", "Ferretería", "Librería"],
      estado: "en_revision",
      portada_url:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      tour_config: {
        version: 1,
        dimensions: { width: 5.0, depth: 11.0, height: 3.0 },
        architecture: {
          wallColor: "#F1F5F9",
          wallTexture: "smooth",
          floorMaterial: "ceramic",
          floorColor: "#CBD5E1",
          ceilingColor: "#FFFFFF",
          doorPosition: { wall: "front", offset: 0, width: 1.5, height: 2.4 },
          windows: [],
        },
        lighting: { ambientIntensity: 0.8, mode: "day", spotlights: [] },
        preset: "empty",
        hotspots: [],
        camera: {
          initialPosition: [0, 1.6, 4],
          initialTarget: [0, 1.5, 0],
          fov: 60,
        },
      } as TourConfig,
      tour_glb_url: null,
    },
  ];

  const insertLocal = db.prepare(`
    INSERT INTO locales (
      id, owner_id, slug, titulo, operacion, precio, moneda, area_m2,
      direccion, distrito, ciudad, lat, lng, descripcion, caracteristicas,
      rubros_sugeridos, estado, portada_url, tour_config, tour_glb_url,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMedia = db.prepare(`
    INSERT INTO media (id, local_id, tipo, url, orden, created_at)
    VALUES (?, ?, 'foto', ?, ?, ?)
  `);

  for (const loc of locales) {
    insertLocal.run(
      loc.id,
      loc.owner_id,
      loc.slug,
      loc.titulo,
      loc.operacion,
      loc.precio,
      loc.moneda,
      loc.area_m2,
      loc.direccion,
      loc.distrito,
      loc.ciudad,
      loc.lat,
      loc.lng,
      loc.descripcion,
      JSON.stringify(loc.caracteristicas),
      JSON.stringify(loc.rubros_sugeridos),
      loc.estado,
      loc.portada_url,
      JSON.stringify(loc.tour_config),
      loc.tour_glb_url,
      now,
      now
    );

    // Agregar foto a tabla media
    insertMedia.run(`med-${loc.id}-1`, loc.id, loc.portada_url, 0, now);
  }
  console.log(`🏢 ${locales.length} Locales comerciales insertados.`);

  // 4. Sembrar algunos leads iniciales
  const insertLead = db.prepare(`
    INSERT INTO leads (id, local_id, origen, user_agent_hash, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLead.run(
    "lead-001",
    "loc-001",
    "tour3d",
    "ua-hash-dummy-01",
    "ip-hash-dummy-01",
    now
  );
  insertLead.run(
    "lead-002",
    "loc-001",
    "detalle",
    "ua-hash-dummy-02",
    "ip-hash-dummy-02",
    now
  );
  insertLead.run(
    "lead-003",
    "loc-002",
    "tour3d",
    "ua-hash-dummy-03",
    "ip-hash-dummy-03",
    now
  );
  console.log("📈 Leads de ejemplo generados.");
  });

  transaction();

  console.log("✅ Siembra (seed) completada con éxito.");
}

if (process.argv[1]?.includes("seed")) {
  runSeed().catch((err) => {
    console.error("❌ Error ejecutando seed:", err);
    process.exit(1);
  });
}
