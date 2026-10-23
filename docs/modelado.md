# Modelado del dominio CampusEats

## Hito 1: dominio y alcance

**Dominio elegido:** pedidos de comida de la cafetería universitaria.

**Usuarios:** clientes que consultan el menú y hacen pedidos; administradores de la cafetería que mantienen el catálogo, gestionan el inventario y actualizan pedidos.

**Recursos principales:** usuarios, productos, pedidos e ítems de pedido.

**Transacción principal:** un cliente crea un pedido con uno o más productos. El sistema verifica disponibilidad e inventario, calcula el total y descuenta las existencias en una transacción atómica. Si no alcanza el inventario, responde `409 Conflict` y revierte todos los cambios.

**Integrante:** Juan Manuel Correa Quiceno. El estudiante confirma que consultó con el profesor y tiene autorización para desarrollar el proyecto individualmente.

## Arquitectura

El proyecto es un monolito modular organizado por capas:

```mermaid
flowchart TB
    cliente["Cliente HTTP"]
    rutas["Rutas Express y validación"]
    controladores["Controladores HTTP"]
    servicios["Servicios y reglas del dominio"]
    prisma["Prisma ORM"]
    postgres[("PostgreSQL")]
    cliente --> rutas --> controladores --> servicios --> prisma --> postgres
```

Las rutas validan forma y permisos; los controladores adaptan HTTP al dominio; los servicios contienen reglas de negocio y transacciones; Prisma accede a PostgreSQL.

## Diagrama de casos de uso

```mermaid
flowchart LR
    cliente["Actor: Cliente"]
    admin["Actor: Administrador"]
    sistema(["CampusEats API"])
    registro(["Registrarse"])
    login(["Iniciar sesión"])
    menu(["Consultar y buscar productos"])
    pedido(["Crear pedido"])
    propios(["Consultar pedidos propios"])
    catalogo(["Administrar productos e inventario"])
    estado(["Actualizar estado del pedido"])
    reporte(["Consultar ventas del día"])
    cliente --- registro
    cliente --- login
    cliente --- menu
    cliente --- pedido
    cliente --- propios
    admin --- login
    admin --- catalogo
    admin --- estado
    admin --- reporte
    sistema --- registro
    sistema --- login
    sistema --- menu
    sistema --- pedido
    sistema --- propios
    sistema --- catalogo
    sistema --- estado
    sistema --- reporte
```

## Diagrama de clases del dominio

```mermaid
classDiagram
    class Usuario {
      +Int id
      +String nombre
      +String email
      +String passwordHash
      +Rol rol
      +DateTime creadoEn
    }
    class Producto {
      +Int id
      +String nombre
      +Int precio
      +Int stock
      +Boolean disponible
      +String categoria
      +String descripcion
    }
    class Pedido {
      +Int id
      +EstadoPedido estado
      +Int total
      +DateTime creadoEn
    }
    class PedidoItem {
      +Int id
      +Int cantidad
      +Int precioUnitario
    }
    class Rol {
      <<enumeration>>
      CLIENTE
      ADMIN
    }
    class EstadoPedido {
      <<enumeration>>
      RECIBIDO
      PREPARANDO
      LISTO
      ENTREGADO
      CANCELADO
    }
    Usuario "1" --> "0..*" Pedido : realiza
    Pedido "1" *-- "1..*" PedidoItem : contiene
    Producto "1" --> "0..*" PedidoItem : se vende como
    Usuario --> Rol
    Pedido --> EstadoPedido
```

## Diagrama de secuencia de la transacción principal

```mermaid
sequenceDiagram
    actor Cliente
    participant API as Express API
    participant Auth as Middleware JWT
    participant Servicio as Servicio de pedidos
    participant DB as PostgreSQL mediante Prisma
    Cliente->>API: POST /api/pedidos + items
    API->>Auth: Verificar Bearer JWT
    Auth-->>API: identidad CLIENTE
    API->>Servicio: crearPedido(usuarioId, items)
    Servicio->>DB: BEGIN
    loop Cada ítem del pedido
        Servicio->>DB: Leer producto y precio
        Servicio->>DB: UPDATE stock WHERE stock >= cantidad
        alt Producto ausente o sin stock suficiente
            DB-->>Servicio: cero filas o producto inexistente
            Servicio->>DB: ROLLBACK
            Servicio-->>API: 404 o 409
            API-->>Cliente: Error; inventario intacto
        else Stock reservado de forma atómica
            DB-->>Servicio: fila actualizada
        end
    end
    Servicio->>DB: Crear Pedido y PedidoItems
    Servicio->>DB: COMMIT
    DB-->>Servicio: Pedido persistido
    Servicio-->>API: Pedido sin datos sensibles
    API-->>Cliente: 201 Created
```

## Diagrama BPMN del proceso principal

El archivo [pedido.bpmn](./diagramas/pedido.bpmn) contiene el proceso BPMN 2.0 con carriles para Cliente, API y base de datos. El flujo resumido es:

```mermaid
flowchart LR
    start((Inicio))
    submit["Cliente envía pedido"]
    auth["API valida token y datos"]
    valid{"¿Solicitud válida?"}
    reject["Responder 400/401"]
    reserve["Leer productos y reservar stock atómicamente"]
    available{"¿Todos los productos disponibles?"}
    rollback["Rollback y responder 404/409"]
    create["Crear pedido y detalle"]
    commit["Confirmar transacción"]
    response["Responder 201 con pedido"]
    finish((Fin))
    start --> submit --> auth --> valid
    valid -- No --> reject --> finish
    valid -- Sí --> reserve --> available
    available -- No --> rollback --> finish
    available -- Sí --> create --> commit --> response --> finish
```

El diagrama de casos de uso también está disponible como fuente PlantUML en [casos-de-uso.puml](./diagramas/casos-de-uso.puml).
