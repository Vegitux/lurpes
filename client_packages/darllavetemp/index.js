// Animaciones de dar/recibir (opcionales)
const GIVE = { dict: 'mp_common', name: 'givetake2_a' };
const RECEIVE = { dict: 'mp_common', name: 'givetake2_b' };
const FLAG = 49;   // upper-body only
const DUR  = 1400; // ms

function play(dict, name, dur=DUR){
  const me = mp.players.local;
  mp.game.streaming.requestAnimDict(dict);
  const t0 = Date.now();
  const h = setInterval(()=>{
    if (mp.game.streaming.hasAnimDictLoaded(dict)){
      clearInterval(h);
      me.taskPlayAnim(dict, name, 1.0, 1.0, dur, FLAG, 0.0, false, false, false);
      setTimeout(()=> mp.game.streaming.removeAnimDict(dict), dur+200);
    } else if (Date.now() - t0 > 3000){
      clearInterval(h);
    }
  }, 50);
}

mp.events.add('darllavetemp:animGive',    ()=> play(GIVE.dict, GIVE.name));
mp.events.add('darllavetemp:animReceive', ()=> play(RECEIVE.dict, RECEIVE.name));
