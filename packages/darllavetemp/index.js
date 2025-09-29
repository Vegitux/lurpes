// /darllavetemp ID llave|MATRICULA TIEMPO
// Da llaves temporales del vehículo indicado al jugador destino durante TIEMPO (minutos).
// - "llave": resuelve el vehículo a partir de una llave permanente del jugador (INTEGRA TU LÓGICA).
// - "MATRICULA": busca vehículo por numberPlate exacto (no sensible a may/min).
// Sin vehículo actual ni cercano. Sin /me.

const CONFIG = {
    maxMinutes: 180,
    chat: { sys:'#C0C0C0', ok:'#8BC34A', err:'#FF5252', warn:'#FFC107' },
    cooldownMs: 2500
};

// ===== Utilidades mínimas =====
const now = () => Date.now();
const say = (p, msg, color=CONFIG.chat.sys) => p.outputChatBox(`!{${color}}${msg}`);
function canUse(p){
    const t = now();
    if (!p._dlt_last) p._dlt_last = 0;
    if (t - p._dlt_last < CONFIG.cooldownMs){
        say(p, 'Espera un momento antes de volver a usarlo.', CONFIG.chat.warn);
        return false;
    }
    p._dlt_last = t; return true;
}
function findVehicleByPlate(plate){
    const wanted = String(plate).trim().toUpperCase();
    let found = null;
    mp.vehicles.forEach(v => {
        const p = (v.numberPlate || '').toUpperCase();
        if (p === wanted) found = v;
    });
    return found;
}

// ===== Estado de llaves temporales =====
// vehId -> { holders: Map(charId -> expireMs), timers: Map(charId -> Timeout) }
const tempKeys = new Map();
function ensureVehState(veh){
    if (!veh || veh.remoteId == null) return null;
    if (!tempKeys.has(veh.remoteId)) tempKeys.set(veh.remoteId, { holders:new Map(), timers:new Map() });
    return tempKeys.get(veh.remoteId);
}
function hasTempKey(veh, player){
    const st = ensureVehState(veh); if (!st) return false;
    const charId = player.getVariable?.('charId') ?? player.id;
    const exp = st.holders.get(charId);
    return !!exp && exp > now();
}
function grantTempKey(veh, granter, target, minutes){
    const st = ensureVehState(veh); if (!st) return false;
    const charId = target.getVariable?.('charId') ?? target.id;

    // limpiar previo si existía
    if (st.timers.has(charId)) { clearTimeout(st.timers.get(charId)); st.timers.delete(charId); }

    const expireMs = now() + minutes * 60000;
    st.holders.set(charId, expireMs);

    const to = setTimeout(() => {
        const s2 = ensureVehState(veh); if (!s2) return;
        s2.holders.delete(charId);
        s2.timers.delete(charId);
        if (target && target.exists) say(target, `⌛ Han expirado tus llaves temporales de ${veh.numberPlate || 'veh#'+veh.remoteId}.`);
    }, expireMs - now());
    st.timers.set(charId, to);

    console.log(`[DARLLAVETEMP] ${granter?.name} → ${target?.name} en ${veh.numberPlate || 'veh#'+veh.remoteId} por ${minutes} min`);
    return true;
}

// Exponer para tu check de acceso (abrir/encender):
global.DARLLAVETEMP = { hasTempKey };

// ===== INTEGRACIÓN (REEMPLAZA ESTAS FUNCIONES) =====
// 1) Resolver vehículo a partir de una LLAVE permanente del jugador (tu inventario/BD).
function resolveVehicleFromKey(player){
    // TODO: Devuelve el vehículo asociado a la llave permanente del jugador.
    // Si aún no tienes integración, deja null y usa matricula en el comando.
    return null;
}

// 2) Verificar que el que otorga tiene acceso permanente a ese vehículo.
function hasPermanentAccess(player, vehicle){
    // TODO: Sustituir por tu verificación real (propietario, facción, registro de llaves, etc.).
    return false;
}

// ===== COMANDO ÚNICO =====
mp.events.addCommand('darllavetemp', (player, full) => {
    if (!canUse(player)) return;

    const args = (full||'').trim().split(/\s+/).filter(Boolean);
    if (args.length !== 3){
        say(player, 'Uso del /darllavetemp [ID] [matrícula o llave] [tiempo]', CONFIG.chat.warn);
        return;
    }

    // ID destino
    const targetId = parseInt(args[0], 10);
    if (isNaN(targetId)){ say(player, 'ID inválido.', CONFIG.chat.err); return; }
    const target = mp.players.at(targetId);
    if (!target || !target.exists){ say(player, 'Jugador no encontrado.', CONFIG.chat.err); return; }
    if (target.id === player.id){ say(player, 'No tiene sentido dártelas a ti mismo.', CONFIG.chat.warn); return; }

    // Selector: "llave" o matrícula
    const selector = args[1];
    let vehicle = null;

    if (selector.toLowerCase() === 'llave'){
        vehicle = resolveVehicleFromKey(player);
        if (!vehicle || !vehicle.exists){
            say(player, 'No se encontró un vehículo asociado a tu llave. Verifica tu llave.', CONFIG.chat.err);
            return;
        }
    } else {
        vehicle = findVehicleByPlate(selector);
        if (!vehicle || !vehicle.exists){
            say(player, `No se encontró vehículo con matrícula "${selector}".`, CONFIG.chat.err);
            return;
        }
    }

    // Verificación de permiso permanente
    if (!hasPermanentAccess(player, vehicle)){
        say(player, 'No tienes llaves permanentes de ese vehículo.', CONFIG.chat.err);
        return;
    }

    // Tiempo (minutos)
    const minutes = parseInt(args[2], 10);
    if (i
