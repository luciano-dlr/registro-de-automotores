# Decision Log - API de Registro de Automotores

## 1. TypeORM vs Prisma 

**Decisión**: TypeORM

### Por qué TypeORM:

- Integración nativa con `@nestjs/typeorm`
- Soporte completo para entidades con decoradores
- Manejo de relaciones OneToMany, ManyToOne, OneToOne fuera de la caja
- synchronize:true para desarrollo rápido sobre el matiz de las tablas con entidades
- Amplia comunidad y ejemplos

### Experiencia:

- El código puede ser verboso comparado con Prisma
- Documentación a veces confusa para casos donde se necesitan declaraciones con negocio y separar infraestructura

---

En un principio trabaje con una declaracion de los modulos con la logica de negocio planteada , al visualizar espaniol e ingles en el challenge

│ ├── modules/
│ │ ├── sujetos/
│ │ │ ├── sujetos.module.ts
│ │ │ ├── sujetos.controller.ts
│ │ │ ├── sujetos.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-sujeto.dto.ts
│ │ │ │ └── query-cuit.dto.ts
│ │ │ └── entities/
│ │ │ └── sujeto.entity.ts
│ │ ├── objeto-valor/
│ │ │ ├── objeto-valor.module.ts
│ │ │ └── entities/
│ │ │ └── objeto-valor.entity.ts
│ │ ├── automotores/
│ │ │ ├── automotores.module.ts
│ │ │ ├── automotores.controller.ts
│ │ │ ├── automotores.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── create-automotor.dto.ts
│ │ │ │ └── update-automotor.dto.ts
│ │ │ └── entities/
│ │ │ └── automotor.entity.ts
│ │ └── vinculo/
│ │ ├── vinculo.module.ts
│ │ └── entities/
│ │ └── vinculo.entity.ts

Pero busqué estandarizar en todo el código y declaraciones al inglés SIN modificar contratos en los DTOs ni endpoints entregados. La estrategia fue:

1. **Mantener tablas/columnas en español** (SQL del PRD): `Sujeto`, `Objeto_De_Valor`, `Automotores`, `Vinculo_Sujeto_Objeto`
2. **Renombrar código a inglés**: folders, classes, archivos
3. **Separar responsabilidades**: DB naming vs Code naming mediante `@Entity('nombre_sql')`

### Estructura final (inglés para código, español para DB):

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

### Mapeo de nombres:

| Tabla SQL (español)   | Folder (inglés) | Class (inglés) | Props DB                                      |
| --------------------- | --------------- | -------------- | --------------------------------------------- |
| Sujeto                | subject/        | Subject        | spo_id, spo_cuit, spo_denominacion            |
| Objeto_De_Valor       | object-value/   | ObjectValue    | ovp_id, ovp_tipo, ovp_codigo, ovp_descripcion |
| Automotores           | vehicles/       | Vehicle        | atr_id, atr_dominio, atr_numero_chasis, etc.  |
| Vinculo_Sujeto_Objeto | ownership/      | Ownership      | vso_id, vso_ovp_id, vso_spo_id, etc.          |

### Por qué esta separación funciona:

- `@Entity('nombre_sql')` solo afecta el nombre de la tabla en la DB
- Los imports en código usan los nombres English de las clases
- TypeORM conecta automáticamente: `class Subject` → tabla `Sujeto`
- Los endpoints y DTOs mantienen sus nombres en español (contrato unchanged)

Porque hice todo esto? porque en un principio trabajando con la guia de declaraciones sql tenia muchas declaraciones en espaniol y otras en ingles
Con esto plantie en un comienzo una estructura que los modulos respeten la logica de negocio teniendo tablas en espaniol pero algunas keys dichas en ingles , adjunto es esquema sql planteado por el challenge entregado 

Esto fue lo planteado en el challenge 
`https://wood-blanket-7b8.notion.site/Challenge-T-cnico-API-de-Registro-de-Automotores-361ca5b25e51803ca7baf11f47b087ca`

CREATE TABLE IF NOT EXISTS "Sujeto" (
  spo_id           BIGSERIAL PRIMARY KEY,
  spo_cuit         VARCHAR(11)  NOT NULL UNIQUE,
  spo_denominacion VARCHAR(160) NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Objeto_De_Valor" (
  ovp_id          BIGSERIAL PRIMARY KEY,
  ovp_tipo        VARCHAR(30)  NOT NULL DEFAULT 'AUTOMOTOR',
  ovp_codigo      VARCHAR(64)  NOT NULL UNIQUE,
  ovp_descripcion VARCHAR(240),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Automotores" (
  atr_id                  BIGSERIAL   PRIMARY KEY,
  atr_ovp_id              BIGINT      NOT NULL REFERENCES "Objeto_De_Valor"(ovp_id) ON DELETE CASCADE,
  atr_dominio             VARCHAR(8)  NOT NULL UNIQUE,
  atr_numero_chasis       VARCHAR(25),
  atr_numero_motor        VARCHAR(25),
  atr_color               VARCHAR(40),
  atr_fecha_fabricacion   INTEGER     NOT NULL,  -- YYYYMM
  atr_fecha_alta_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_atr_fecha_fabricacion CHECK (atr_fecha_fabricacion BETWEEN 190001 AND 299912)
);

CREATE TABLE IF NOT EXISTS "Vinculo_Sujeto_Objeto" (
  vso_id           BIGSERIAL    PRIMARY KEY,
  vso_ovp_id       BIGINT       NOT NULL REFERENCES "Objeto_De_Valor"(ovp_id) ON DELETE CASCADE,
  vso_spo_id       BIGINT       NOT NULL REFERENCES "Sujeto"(spo_id) ON DELETE RESTRICT,
  vso_tipo_vinculo VARCHAR(30)  NOT NULL DEFAULT 'DUENO',
  vso_porcentaje   NUMERIC(5,2) NOT NULL DEFAULT 100,
  vso_responsable  CHAR(1)      NOT NULL DEFAULT 'S',
  vso_fecha_inicio DATE         NOT NULL DEFAULT CURRENT_DATE,
  vso_fecha_fin    DATE         NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- índice único: solo un dueño activo por automotor
CREATE UNIQUE INDEX uq_vso_owner_actual
  ON "Vinculo_Sujeto_Objeto"(vso_ovp_id)
  WHERE vso_responsable = 'S' AND vso_fecha_fin IS NULL AND vso_tipo_vinculo = 'DUENO';




## 2. synchronize:true vs Migraciones

**Decisión**: synchronize:true (para desarrollo)

### Por qué synchronize:true:

- **Simplicidad**: Las entidades se synce automáticamente al iniciar la app
- **Velocidad de desarrollo**: No requiere crear archivos de migración manualmente
- **Aceptado para el challenge**: El PRD lo permite explícitamente
- **Scaffold rápido**: Ideal para prototipado

### Experiencia:

- **NO recomendado para producción**: Puede causar pérdida de datos en entornos de producción
- No permite deshacer cambios de forma controlada
- Puede generar conflictos en equipos grandes

### En producción debería usarse:

```bash
# Crear migración manualmente
typeorm migration:generate -n SchemaSync

# Aplicar migraciones
typeorm migration:run
```

---

## 3. Índice Único Parcial de Dueño Activo

**Decisión**: Índice manual + lógica de negocio

### El problema:

El modelo requiere que un automotor tenga un solo "dueño activo" (vso_responsable='S' con vso_fecha_fin=NULL). Esto no puede expresarse como un UNIQUE simple en la entidad.

### Solución implementada:

#### a) Índice SQL (manual):

```sql
CREATE UNIQUE INDEX uq_vso_owner_actual
  ON "Vinculo_Sujeto_Objeto"(vso_ovp_id)
  WHERE vso_responsable = 'S' AND vso_fecha_fin IS NULL AND vso_tipo_vinculo = 'DUENO';
```

#### b) Lógica de negocio en servicio:

- Antes de crear un nuevo vínculo, se cierran los vínculos activos previos
- Se actualiza vso_fecha_fin = today() para el vínculo anterior
- El nuevo vínculo se crea con vso_fecha_fin = NULL

### Por qué esta solución:

- El índice garantiza integridad a nivel de DB
- La lógica en servicio controla el flujo de negocio
- El filtro de base de datos retornará error si hay duplicado

---

## 4. onDelete: RESTRICT en Vínculo con Sujeto

**Decisión**: RESTRICT (protegido)

### Relación:

```typescript
@ManyToOne(() => Sujeto, (sujeto) => sujeto.vinculos, { onDelete: 'RESTRICT' })
@JoinColumn({ name: 'vso_spo_id' })
sujeto: Sujeto;
```

### Por qué RESTRICT:

- **Protección de datos**: No permite eliminar un Sujeto si tiene vínculos activos
- **Integridad referencial**: Fuerza a cerrar vínculos primero antes de borrar sujeto
- **Comportamiento esperado**: Un sujeto no debería poder eliminarse si es dueño de automotores

### Experiencia:

- Requiere cerrar vínculos manualmente antes de eliminar un sujeto
- En delete cascade de ObjetoDeValor → Vinculo, esto podría generar conflictos si el sujeto ya no existe (pero nuestro modelo usa CASCADE en Ov, no en Sujeto)

### Alternativas consideradas:

- CASCADE: Peligroso, eliminaría vínculos al borrar sujeto
- SET NULL: Perdería trazabilidad de quién fue dueño

---

## 5. Manejo de Errores: Filtros Globales vs Excepciones Locales

**Decisión**: Filtro global + Pipe de validación

### Arquitectura implementada:

#### a) ValidationPipe (global en main.ts):

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

- Valida DTOs automáticamente
  -whitelist: true elimina propiedades no definidas en DTOs
- forbidNonWhitelisted: true retorna 400 si hay propiedades extra

#### b) HttpExceptionFilter (global en app.module):

```typescript
{
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
}
```

- Maneja errores de class-validator → 422 Unprocessable Entity
- Maneja NotFoundException → 404 Not Found
- Maneja errores no esperados → 500 Internal Server Error

#### c) Excepciones específicas en servicios:

- `NotFoundException` para recursos no encontrados
- `UnprocessableEntityException` para reglas de negocio (CUIT no registrado, dominio duplicado)

### Por qué esta aproximación:

- **Consistencia**: Todos los errores siguen el mismo formato
- **Centralización**: Un solo lugar para manejar errores HTTP
- ** DX**: Los decoradores @IsString, @IsCuit, etc. funcionan automáticamente

### Formato de respuesta de error:

```json
{
  "statusCode": 422,
  "message": ["El dominio debe tener formato AAA999 o AA999AA"],
  "error": "Unprocessable Entity"
}
```

---

## 6. Decisiones Adicionales

### 6.1 Estructura de Módulos

- Separación por dominio: SubjectsModule, VehiclesModule, OwnershipModule
- DatabaseModule como Global para compartir DataSource
- TypeOrmModule.forFeature() en cada módulo para repositorios

### 6.2 Patrón de Servicios

- Lógica de negocio concentrada en servicios
- ControladoresLivianos (solo routing y validación básica)
- Repositorios inyectados en servicios

### 6.3 Naming de columnas

- Prefijos de tabla en columnas (spo*, atr*, ovp*, vso*) - se mantienen del SQL
- Las properties en las entities usan los códigos DB (no English)
- Ejemplo: `subject.spo_id`, `vehicle.atr_dominio`, `ownership.vso_responsable`
- Esto mantiene trazabilidad directa con el esquema SQL del PRD

### 6.4 Validadores Personalizados

- Implementados como decoradores de class-validator
- Funciones utilitarias separadas para testing
- Algoritmo módulo 11 para CUIT verificado con tests unitarios
