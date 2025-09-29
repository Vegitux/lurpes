# /darllavetemp (RAGE:MP)

Otorga **llaves temporales** de un vehículo a otro jugador durante X minutos.

## Uso
    /darllavetemp ID llave|MATRICULA TIEMPO
- `llave`: resuelve el vehículo desde **tu llave permanente** (integra tu lógica).
- `MATRICULA`: busca por `numberPlate` exacto (no sensible a may/min).
- Sin `/me`. No usa vehículo actual ni el más cercano.

## Instalación
Coloca los archivos en estas rutas:
    packages/darllavetemp/index.js        # servidor
    client_packages/darllavetemp/index.js # cliente (animaciones opcionales)

## Configuración
En `packages/darllavetemp/index.js`:
- `CONFIG.maxMinutes` → tope de minutos (por defecto **180**).
- `CONFIG.cooldownMs` → antispam del comando (por defecto **2500 ms**).

## Integración obligatoria (server)
Debes implementar estas funciones según tu inventario/BD:

    // 1) Obtener el vehículo desde la llave permanente del jugador.
    function resolveVehicleFromKey(player){
      // EJEMPLO simple (adáptalo): variable sync con la matrícula equipada
      const plate = (player.getVariable?.('equippedKeyPlate') || '').toString().trim();
      if (!plate) return null;
      return findVehicleByPlate(plate);
    }

    // 2) Validar que quien otorga tiene llaves PERMANENTES de ese vehículo.
    function hasPermanentAccess(player, vehicle){
      // EJEMPLO simple (adáptalo): dueño por placa o misma facción
      const plate = (vehicle.numberPlate || '').toUpperCase();
      const owned = (player.getVariable?.('ownedPlates') || []).map(p=>String(p).toUpperCase());
      if (owned.includes(plate)) return true;

      const myFaction  = player.getVariable?.('factionId');
      const vehFaction = vehicle.getVariable?.('factionId');
      if (myFaction && vehFaction && myFaction === vehFaction) return true;

      return false;
    }

### Cómo usar la llave temporal en tus checks
    // global expuesto por el recurso:
    global.DARLLAVETEMP.hasTempKey(vehicle, player) // → true/false

    // ejemplo de apertura/encendido:
    if (hasPermanentAccess(player, vehicle) || global.DARLLAVETEMP.hasTempKey(vehicle, player)) {
      // permitir acción
    }

## Características
- Comando único y simple.
- Mensajería clara en español + antispam.
- Expiración automática por jugador y limpieza al salir.
- Animaciones cliente (dar/recibir) opcionales.

## Requisitos
- Servidor **RAGE:MP** (JavaScript).

## Changelog
### v1.0.0
- Comando `/darllavetemp`.
- Llaves temporales con expiración y limpieza al salir.
- Mensajería en español y antispam.
- Animaciones cliente (dar/recibir) opcionales.

## Licencia
MIT — ver `LICENSE`.


--- 
Descripción (About): Comando /darllavetemp: llaves temporales por minutos. Server+Client. Español. MIT.

Topics: lurpes ragemp gta5 javascript vehicles keys spanish

Notas release v1.0.0:
Primer release.
✅ Comando /darllavetemp
• Llaves temporales por minutos.
• Antispam y mensajes en español.
• Limpieza al expirar y al desconectar.
• Animaciones cliente opcionales (dar/recibir).

Integración mínima a completar por el servidor:
- resolveVehicleFromKey(player)
- hasPermanentAccess(player, vehicle)

Licencia MIT.
