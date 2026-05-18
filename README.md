# API de Registro de Automotores

Challenge técnico Mindfactory - NestJS + TypeORM + PostgreSQL

---

## Requisitos previos

Antes de comenzar, asegurate de tener instalado:

- **Docker Desktop** (Windows/Mac/Linux)
- **Git** (para clonar el repositorio)
- **nest** para ejecutar correctamente el repo

Para verificar que Docker está instalado, ejecutá en tu terminal:

```bash
docker --version
docker-compose --version
```

---

## Cómo levantar el proyecto (PASO A PASO)

Este proyecto está diseñado para correrse **localmente** 

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/luciano-dlr/registro-de-automotores.git
```

### Paso 2: Entrar a la carpeta del proyecto

```bash
cd registro-de-automotores
```

### Paso 3: Instalar dependencias

```bash
npm install
```

### Paso 4: Levantar PostgreSQL con Docker

Este comando levanta solo la base de datos (no la API):

```bash
docker compose up -d
```

Este comando:

- Levanta PostgreSQL en el puerto 5432
- Crea la base de datos `automotores_db`
- Ejecuta el script `postgres-init.sql` que crea el índice único

### Paso 5: Crear el archivo .env

## Con las sguientes Credenciales configuradas

| Variable    | Valor por defecto           |
| ----------- | --------------------------- |
| DB_HOST     | localhost                   |
| DB_PORT     | 5432                        |
| DB_USER     | postgres                    |
| DB_PASSWORD | postgres                    |
| DB_NAME     | automotores_db              |
| PORT        | 3000                        |
| NODE_ENV.   | development                 |

**Alternativa , comando de copiar info en example Windows:**

```cmd
copy .env.example .env
```

**Mac/Linux:**

```bash
cp .env.example .env
```

### Paso 6: Correr la API en modo desarrollo

```bash
npm run start:dev
```

La API está corriendo en **http://localhost:3000**

### Paso 7: Acceder a Swagger (interfaz visual)

Abrí en tu navegador:

```
http://localhost:3000/api/docs
```

Desde ahí podés probar todos los endpoints haciendo click en "Try it out".

Desde Swagger podés probar todos los endpoints haciendo click en "Try it out".

---

## ¿Querés correr los tests?

````bash
# Todos los tests
npm run test


---

## Endpoints disponibles

### Crear un sujeto (dueño)

```bash
curl -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{
    "spo_cuit": "20401093495",
    "spo_denominacion": "Luciano Gómez"
  }'
````

### Crear un automotor

```bash
curl -X POST http://localhost:3000/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "dominio": "ABC311",
    "numeroChasis": "ABC123456789",
    "numeroMotor": "M123456789",
    "color": "Rojo",
    "fechaFabricacion": 202605,
    "cuitDueno": "20401093495"
  }'
```

### Listar todos los automotores

```bash
curl http://localhost:3000/api/automotores
```

### Ver detalle de un automotor por dominio

```bash
curl http://localhost:3000/api/automotores/ABC311
```

### Actualizar un automotor (ej: cambiar color)

```bash
curl -X PUT http://localhost:3000/api/automotores/ABC311 \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Verde Oscuro"
  }'
```

### Reasignar dueño de un automotor

```bash
curl -X PUT http://localhost:3000/api/automotores/ABC311 \
  -H "Content-Type: application/json" \
  -d '{
    "cuitDueno": "27123456780"
  }'
```

### Eliminar un automotor (cascada)

```bash
curl -X DELETE http://localhost:3000/api/automotores/ABC311
```

### Buscar sujeto por CUIT

```bash
curl "http://localhost:3000/api/sujetos/by-cuit?cuit=20401093495"
```

---

## Endpoints con validación (deben devolver 422 si fallan)

### Dominio inválido

```bash
curl -X POST http://localhost:3000/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "dominio": "INVALID",
    "fechaFabricacion": 202605,
    "cuitDueno": "20401093495"
  }'
```

### CUIT inválido

```bash
curl -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{
    "spo_cuit": "00000000000",
    "spo_denominacion": "Test"
  }'
```

### Fecha de fabricación futura (RECHAZADA)

```bash
curl -X POST http://localhost:3000/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "dominio": "FUT123",
    "fechaFabricacion": 202702,
    "cuitDueno": "20401093495"
  }'
```

## ¿Qué hace automáticamente el script de inicio?

Al levantar PostgreSQL, se ejecuta automáticamente el script `docker/postgres-init.sql` que crea:

- **Índice único** `uq_vso_owner_actual` para garantizar que un vehículo tenga un solo dueño activo

Este índice complementa la lógica de negocio en el código y protege la integridad de los datos a nivel de base de datos.

---

## Credenciales configuradas

| Variable    | Valor por defecto           |
| ----------- | --------------------------- |
| DB_HOST     | db (interno del contenedor) |
| DB_PORT     | 5432                        |
| DB_USER     | postgres                    |
| DB_PASSWORD | postgres                    |
| DB_NAME     | automotores_db              |
| PORT        | 3000                        |

---

## Validaciones implementadas

- **Dominio**: Formato `AAA999` (ej: ABC123) o `AA999AA` (ej: AB123CD)
- **CUIT**: 11 dígitos con dígito verificador (algoritmo módulo 11)
- **Fecha de fabricación**: Formato `YYYYMM`, mes 01-12, **NO puede ser futura**
- **Dueño único activo**: Al crear/reasignar, se cierra el vínculo anterior

Los errores de validación retornan `422 Unprocessable Entity` con mensaje descriptivo.

---

## Desarrollo local (SIN Docker) - Solo para desarrolladores

**IMPORTANTE:** Este modo es solo si querés modificar el código y ver los cambios en tiempo real. **No es necesario** para usar la API.

### Requisitos previos (Node.js instalado):

```bash
# 1. Instalar NestJS CLI globalmente
npm install -g @nestjs/cli

# 2. Instalar todas las dependencias del proyecto
npm install


**Nota:** Si ves errores de "nest not found", asegurate de haber instalado `@nestjs/cli` globalmente como se indica en el paso 1.

---

## Problemas comunes

### "Docker command not found"

→ Instalá Docker Desktop desde https://www.docker.com/products/docker-desktop

### "Port 3000 already in use"

```bash
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# O cambiar el puerto en docker-compose.yml
```

### "Database connection refused"

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps

# Ver logs de la base de datos
docker compose logs db
```

---

## Arquitectura del proyecto

```
src/
├── modules/
│   ├── subject/         → Entidad Sujeto (dueños)
│   ├── object-value/    → Entidad Objeto_De_Valor
│   ├── vehicles/        → Entidad Automotores
│   └── ownership/       → Entidad Vinculo_Sujeto_Objeto
├── common/
│   ├── validators/      → Validadores de dominio, CUIT, fecha
│   └── filters/         → Filtro de excepciones HTTP
├── database/            → Configuración de TypeORM
└── seeds/               → Datos de prueba
```

Para más detalles sobre decisiones técnicas, ver [docs/DECISION_LOG.md](docs/DECISION_LOG.md).
