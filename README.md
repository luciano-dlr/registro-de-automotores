# API de Registro de Automotores

Challenge técnico Mindfactory - NestJS + TypeORM + PostgreSQL

##  Cómo levantar el proyecto

### Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd registro-de-automotores

# 2. Levantar servicios (db + api)
docker compose up -d --build

# 3. Verificar que esté funcionando
curl http://localhost:3000/api/automotores
```

### Sin Docker (desarrollo local)

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL con Docker (solo la db)
docker run -d --name automotores_db \
  -e POSTGRES_DB=automotores_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16

# 3. Crear archivo .env (copiar de .env.example)
cp .env.example .env

# 4. Ejecutar la API
npm run start:dev

# La API estará disponible en http://localhost:3000
```

##  Cómo correr los tests

```bash
# Todos los tests
npm run test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch
```

##  Endpoints principales

| Método   | Ruta                                    | Descripción                              |
| -------- | --------------------------------------- | ---------------------------------------- |
| `POST`   | `/api/sujetos`                          | Crear un sujeto (dueño)                  |
| `GET`    | `/api/sujetos`                          | Listar todos los sujetos                 |
| `GET`    | `/api/sujetos/by-cuit?cuit=20XXXXXXXX0` | Buscar sujeto por CUIT                   |
| `GET`    | `/api/automotores`                      | Listar automotores con dueño actual      |
| `GET`    | `/api/automotores/:dominio`             | Ver detalle de un automotor              |
| `POST`   | `/api/automotores`                      | Crear automotor + asignar dueño          |
| `PUT`    | `/api/automotores/:dominio`             | Actualizar automotor y/o reasignar dueño |
| `DELETE` | `/api/automotores/:dominio`             | Eliminar automotor en cascada            |

### Ejemplos de uso

#### Crear un sujeto (dueño):

```bash
curl -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{
    "spo_cuit": "27123456780",
    "spo_denominacion": "Juan Pérez"
  }'
```

#### Crear un automotor:

```bash
curl -X POST http://localhost:3000/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "dominio": "ABC123",
    "numeroChasis": "ABC123456789",
    "numeroMotor": "M123456789",
    "color": "Rojo",
    "fechaFabricacion": 202301,
    "cuitDueno": "27123456780"
  }'
```

#### Listar automotores:

```bash
curl http://localhost:3000/api/automotores
```

##  Credenciales

| Variable    | Valor por defecto |
| ----------- | ----------------- |
| DB_HOST     | localhost         |
| DB_PORT     | 5432              |
| DB_USER     | postgres          |
| DB_PASSWORD | postgres          |
| DB_NAME     | automotores_db    |
| PORT        | 3000              |

##  Validaciones implementadas

- **Dominio**: Formato `AAA999` (ej: ABC123) o `AA999AA` (ej: AB123CD)
- **CUIT**: 11 dígitos con dígito verificador (algoritmo módulo 11)
- **Fecha de fabricación**: Formato `YYYYMM`, mes 01-12, no futura

Errores de validación retornan `422 Unprocessable Entity`.

##  Arquitectura

```
│ ├── modules/
│ │ ├── subject/
│ │ │ ├── subjects.module.ts
│ │ │ ├── subjects.controller.ts
│ │ │ │ ├── subjects.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-subject.dto.ts
│ │ │ │ └── query-cuit.dto.ts
│ │ │ └── entities/
│ │ │ └── subject.entity.ts @Entity('Sujeto')
│ │ ├── object-value/
│ │ │ └── entities/
│ │ │ └── object-value.entity.ts @Entity('Objeto_De_Valor')
│ │ ├── vehicles/
│ │ │ ├── vehicles.module.ts
│ │ │ ├── vehicles.controller.ts
│ │ │ ├── vehicles.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-vehicle.dto.ts
│ │ │ │ └── update-vehicle.dto.ts
│ │ │ └── entities/
│ │ │ └── vehicle.entity.ts @Entity('Automotores')
│ │ └── ownership/
│ │ ├── ownership.module.ts
│ │ ├── ownership.service.ts
│ │ └── entities/
│ │ └── ownership.entity.ts @Entity('Vinculo_Sujeto_Objeto')
```

##  Decisiones de diseño

Ver [docs/DECISION_LOG.md](docs/DECISION_LOG.md) para más detalles sobre las decisiones técnicas.

## Docker

```bash
# Ver logs de la API
docker compose logs -f api

# Ver logs de la base de datos
docker compose logs -f db

# Detener servicios
docker compose down

# Eliminar volúmenes (resetear DB)
docker compose down -v
```
