# Decision Log - API de Registro de Automotores

## 1. TypeORM vs Prisma vs MikroORM

**Decisión**: TypeORM

### Por qué TypeORM:

- Integración nativa con `@nestjs/typeorm`
- Soporte completo para entidades con decoradores
- Manejo de relaciones OneToMany, ManyToOne, OneToOne fuera de la caja
- synchronize:true para desarrollo rápido sobre el matiz de las tablas con entidades
- Amplia comunidad y ejemplos

### Trade-offs aceptados:

- El código puede ser verboso comparado con Prisma
- Documentación a veces confusa para casos edge

---

## 2. synchronize:true vs Migraciones

**Decisión**: synchronize:true (para desarrollo)

### Por qué synchronize:true:

- **Simplicidad**: Las entidades se synce automáticamente al iniciar la app
- **Velocidad de desarrollo**: No requiere crear archivos de migración manualmente
- **Aceptado para el challenge**: El PRD lo permite explícitamente
- **Scaffold rápido**: Ideal para prototipado

### Trade-offs aceptados:

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

### Trade-offs:

-  Requiere cerrar vínculos manualmente antes de eliminar un sujeto
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

- Separación por dominio: SujetosModule, AutomotoresModule, VinculoModule
- DatabaseModule como Global para compartir DataSource
- TypeOrmModule.forFeature() en cada módulo para repositorios

### 6.2 Patrón de Servicios

- Lógica de negocio concentrada en servicios
- ControladoresLivianos (solo routing y validación básica)
- Repositorios inyectados en servicios

### 6.3 naming de columnas

- Prefijos de tabla en columnas (spo*, atr*, ovp*, vso*)
- Seguimiento del esquema SQL del PRD

### 6.4 Validadores Personalizados

- Implementados como decoradores de class-validator
- Funciones utilitarias separadas para testing
- Algoritmo módulo 11 para CUIT verificado con tests unitarios


