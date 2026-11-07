"use strict";
// First Frets: the Reference pop-up (chord chart, barre chords, scales, strumming, notes on the neck, capo, chords
// in a key) and the Metronome. Loaded after index.html's main script and uses its helpers: h, store, Popup, Chord,
// CH, COWBOY, playNote, metroClick, audio, hush, AC, STOP_ALL, START_HASH.
// Each Reference tab has its own link: www.davyrockett.com/first-frets/#scales (also #metronome).
(()=>{

/* ---------- notes and spelling ---------- */
const OPEN_PC={6:4,5:9,4:2,3:7,2:11,1:4};
const pcOf=(s,f)=>(OPEN_PC[s]+f)%12;
const SHARP=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLAT=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
// How chords and keys are usually written: D♭ major but C♯ minor, and so on.
const MAJ=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const MIN=['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'];
const PICK=[['C'],['C♯','D♭'],['D'],['E♭','D♯'],['E'],['F'],['F♯','G♭'],['G'],['A♭','G♯'],['A'],['B♭','A♯'],['B']];
// C and the sharp keys (G, D, A, E, B, F♯) spell their notes with sharps; the rest use flats.
const SHARP_KEYS=[0,7,2,9,4,11,6];
const spell=(pc,majorKey)=>(SHARP_KEYS.includes(majorKey)?SHARP:FLAT)[pc];

/* ---------- small controls ---------- */
// A row of buttons where one is chosen (aria-pressed), like the ones in Settings.
function Seg(opts,get,set,label){
  const el=h(`<div class="seg" role="group" aria-label="${label}">${opts.map(([v,t])=>`<button type="button" class="btn" data-v="${v}">${t}</button>`).join('')}</div>`);
  const mark=()=>el.querySelectorAll('[data-v]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===String(get())));
  el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;set(b.dataset.v);mark();});
  mark();return el;
}
// Twelve note buttons. With allowNone, tapping the chosen note again clears it.
function NotePicker(get,set,{label='Note',allowNone=false}={}){
  const el=h(`<div class="ref-notes" role="group" aria-label="${label}">${PICK.map((n,pc)=>`<button type="button" class="btn" data-pc="${pc}"><b>${n[0]}</b><small>${n[1]||'&nbsp;'}</small></button>`).join('')}</div>`);
  const mark=()=>el.querySelectorAll('[data-pc]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.pc===get()));
  el.addEventListener('click',e=>{const b=e.target.closest('[data-pc]');if(!b)return;const pc=+b.dataset.pc;set(allowNone&&pc===get()?null:pc);mark();});
  mark();return el;
}

/* ---------- sound ---------- */
// Steady ticks scheduled slightly ahead on the audio clock, so the beat stays even.
// onTick(i, delay): tick number i sounds `delay` seconds from now.
function Ticker(interval,onTick){
  let id=null,next=0,i=0,run=0;
  const pump=()=>{if(!AC)return;while(next<AC.currentTime+.15){onTick(i,next-AC.currentTime);next+=interval();i++;}};
  return{
    start(){if(!audio())return;run++;next=AC.currentTime+.12;i=0;pump();id=setInterval(pump,25);},
    stop(){if(id!=null){clearInterval(id);id=null;}run++;},
    get running(){return id!=null;},
    // Run fn at the moment a tick sounds (skipped if stopped first), to light up what's playing.
    at(delay,fn){const r=run;setTimeout(()=>{if(r===run)fn();},Math.max(0,delay*1000));}
  };
}
const chordNotes=c=>Object.entries(c.frets).filter(([,f])=>f!=='x').map(([k,f])=>[+k,f]);
// A strum starting `when` seconds from now. Downstrokes go thick to thin; upstrokes catch the thinner strings only.
function strumAt(notes,when,{up=false,vol=.38,hold=null,gap=.028}={}){
  const list=[...notes].filter(([s])=>!up||s<=4).sort((a,b)=>up?a[0]-b[0]:b[0]-a[0]);
  list.forEach(([s,f],i)=>playNote(s,f,{delay:Math.max(0,when)+i*gap,vol,hold:hold==null?null:Math.max(.05,hold-i*gap)}));
}
const stopLessons=()=>{try{STOP_ALL.forEach(f=>f());}catch(e){}};

/* ---------- chords ---------- */
const MORE={
  A7:{name:'A7',frets:{6:'x',5:0,4:2,3:0,2:2,1:0},fingers:{4:2,2:3}},
  C7:{name:'C7',frets:{6:'x',5:3,4:2,3:3,2:1,1:0},fingers:{5:3,4:2,3:4,2:1}},
  D7:{name:'D7',frets:{6:'x',5:'x',4:0,3:2,2:1,1:2},fingers:{3:2,2:1,1:3}},
  E7:{name:'E7',frets:{6:0,5:2,4:0,3:1,2:0,1:0},fingers:{5:2,3:1}},
  G7:{name:'G7',frets:{6:3,5:2,4:0,3:0,2:0,1:1},fingers:{6:3,5:2,1:1}},
  Dm:{name:'Dm',frets:{6:'x',5:'x',4:0,3:2,2:3,1:1},fingers:{3:2,2:3,1:1}},
  Am7:{name:'Am7',frets:{6:'x',5:0,4:2,3:0,2:1,1:0},fingers:{4:2,2:1}},
  Em7:{name:'Em7',frets:{6:0,5:2,4:2,3:0,2:3,1:0},fingers:{5:2,4:3,2:4}},
  Dm7:{name:'Dm7',frets:{6:'x',5:'x',4:0,3:2,2:1,1:1},fingers:{3:2,2:1,1:1},barre:{fret:1,from:2,to:1}},
  Dsus2:{name:'Dsus2',frets:{6:'x',5:'x',4:0,3:2,2:3,1:0},fingers:{3:1,2:3}},
  Dsus4:{name:'Dsus4',frets:{6:'x',5:'x',4:0,3:2,2:3,1:3},fingers:{3:1,2:3,1:4}},
  Asus2:{name:'Asus2',frets:{6:'x',5:0,4:2,3:2,2:0,1:0},fingers:{4:2,3:3}},
  Asus4:{name:'Asus4',frets:{6:'x',5:0,4:2,3:2,2:3,1:0},fingers:{4:1,3:2,2:3}},
  Cadd9:{name:'Cadd9',frets:{6:'x',5:3,4:2,3:0,2:3,1:3},fingers:{5:2,4:1,2:3,1:4}},
  Fmaj7:{name:'Fmaj7',frets:{6:'x',5:'x',4:3,3:2,2:1,1:0},fingers:{4:3,3:2,2:1}}
};
const CHORD_GROUPS=[
  ['Open chords',COWBOY.map(k=>CH[k]),'The nine chords that most songs use.'],
  ['Seventh chords',['A7','C7','D7','E7','G7'].map(k=>MORE[k]),'A bluesy, "leaning" sound that wants to move on to the next chord. B7 is with the open chords above.'],
  ['More minor chords',['Dm','Am7','Em7','Dm7'].map(k=>MORE[k]),'Minor chords sound sad or serious. The m7 ones are softer and jazzier.'],
  ['Pretty extras',['Dsus2','Dsus4','Asus2','Asus4','Cadd9','Fmaj7'].map(k=>MORE[k]),'Swap one in for a plain D, A, C or F to make a song shimmer.']
];
function buildChords(){
  const el=h(`<div class="ref-sec"><h3>Chord chart</h3><p class="cap">Tap a chord to hear it. Numbers in the dots are left-hand fingers. ✕ means don't strum that string; ○ means play it open.</p></div>`);
  CHORD_GROUPS.forEach(([t,list,note])=>{
    el.append(h(`<h4 class="subhead">${t}</h4>`),h(`<p class="cap">${note}</p>`));
    const g=h(`<div class="chordchart"></div>`);list.forEach(c=>g.append(Chord(c)));el.append(g);
  });
  return el;
}

/* ---------- barre chords ---------- */
// The same two shapes as Raise the Barre. Frets and fingers are listed thickest string (6) to thinnest (1),
// counted from the barre; null = don't play that string.
const SHAPES={
  E:{open:4,root:6,q:{
    maj:{fr:[0,2,2,1,0,0],fi:[1,3,4,2,1,1]},min:{fr:[0,2,2,0,0,0],fi:[1,3,4,1,1,1]},
    7:{fr:[0,2,0,1,0,0],fi:[1,3,1,2,1,1]},m7:{fr:[0,2,0,0,0,0],fi:[1,3,1,1,1,1]},
    5:{fr:[0,2,2,null,null,null],fi:[1,3,4]}}},
  A:{open:9,root:5,q:{
    maj:{fr:[null,0,2,2,2,0],fi:[null,1,2,3,4,1]},min:{fr:[null,0,2,2,1,0],fi:[null,1,3,4,2,1]},
    7:{fr:[null,0,2,0,2,0],fi:[null,1,3,1,4,1]},m7:{fr:[null,0,2,0,1,0],fi:[null,1,3,1,2,1]},
    5:{fr:[null,0,2,2,null,null],fi:[null,1,3,4]}}}
};
const SUF={maj:'',min:'m',7:'7',m7:'m7',5:'5'};
const barreFret=(shape,pc)=>((pc-SHAPES[shape].open+12)%12)||12;
function barreChord(shape,pc,q){
  const v=SHAPES[shape].q[q],f=barreFret(shape,pc),frets={},fingers={},roots=[];
  [6,5,4,3,2,1].forEach((k,i)=>{const o=v.fr[i];if(o==null){frets[k]='x';return;}frets[k]=f+o;fingers[k]=v.fi[i];if(pcOf(k,f+o)===pc)roots.push(k);});
  const flat=[6,5,4,3,2,1].filter((k,i)=>v.fr[i]===0&&v.fi[i]===1);
  return{name:((q==='min'||q==='m7')?MIN:MAJ)[pc]+SUF[q],frets,fingers,roots,base:f,
    barre:flat.length>1?{fret:f,from:flat[0],to:flat[flat.length-1]}:null};
}
function buildBarre(){
  let pc=store.get('refBarreNote',5),q=store.get('refBarreQ','maj');
  const el=h(`<div class="ref-sec"><h3>Barre chords</h3>
    <p class="prose">A barre chord is an open chord shape slid up the neck. Your 1st finger lies flat across the strings like a capo, and your other fingers make the shape. Two shapes give you every chord.</p>
    <div data-w="notes"></div><div data-w="q"></div>
    <p class="cap ref-qnote"></p>
    <div class="ref-pair"></div>
    <p class="cap">The orange ring is the root: the note the chord is named after. Slide the shape until the root sits on the note you want.</p>
    <h4 class="subhead">Finding the fret</h4>
    <table class="ref-table"><thead><tr><th>Root note</th><th>E shape<br><span class="cap">string 6</span></th><th>A shape<br><span class="cap">string 5</span></th></tr></thead><tbody>
      ${[['C',8,3],['D',10,5],['E','12 (or open)',7],['F',1,8],['G',3,10],['A',5,'12 (or open)'],['B',7,2]].map(([n,a,b])=>`<tr><td><b>${n}</b></td><td>fret ${a}</td><td>fret ${b}</td></tr>`).join('')}</tbody></table>
    <p class="cap">For a sharp (♯), go one fret higher. For a flat (♭), one fret lower.</p></div>`);
  const pair=el.querySelector('.ref-pair'),qn=el.querySelector('.ref-qnote');
  const QNOTE={maj:'Major: bright and happy.',min:'Minor: sad or serious.',7:'Seven: bluesy, wants to move on.',m7:'Minor seven: soft and jazzy.',
    5:'Power chord: just two or three strings, neither happy nor sad. Mute the rest by letting your fingers touch them. Great with distortion.'};
  const draw=()=>{
    qn.textContent=QNOTE[q];
    pair.replaceChildren(...['E','A'].map(shape=>{
      const c=barreChord(shape,pc,q),f=c.base;
      const same=f===12?` Same as the open ${c.name} chord, 12 frets higher.`:'';
      const d=h(`<div class="ref-shape"><p class="cap"><b>${shape} shape</b> · root on string ${SHAPES[shape].root}, fret ${f}.${same}</p></div>`);
      d.prepend(Chord(c));return d;}));
  };
  mount(el,'notes',NotePicker(()=>pc,v=>{pc=v;store.set('refBarreNote',v);draw();},{label:'Chord root'}));
  mount(el,'q',Seg([['maj','Major'],['min','Minor'],['7','7'],['m7','m7'],['5','Power chord']],()=>q,v=>{q=v;store.set('refBarreQ',v);draw();},'Chord type'));
  draw();return el;
}

/* ---------- a neck window (player's view: thinnest string on top, headstock on the left) ---------- */
// Frets are drawn evenly spaced so any stretch of the neck fits. marks: {s,f,t,k} where k is
// 'note', 'root', 'sharp', 'hl' (highlighted) or 'dim'.
function Neck({from=0,to=12,minW=0,onTap=null,label='Guitar neck'}={}){
  const fw=56,xs=36,openW=from===0?46:0,xl=xs+openW,n0=from===0?1:from,cols=to-n0+1,W=xl+cols*fw+8;
  const sy=k=>22+(k-1)*30,top=8,bot=sy(6)+14,H=bot+26,mid=(sy(3)+sy(4))/2;
  const cx=f=>f===0?xs+openW/2-3:xl+(f-n0)*fw+fw/2;
  let s=`<svg class="nk" viewBox="0 0 ${W} ${H}" style="max-width:${Math.round(W*1.2)}px${minW?`;min-width:${Math.min(W,minW)}px`:''}" role="img" aria-label="${label}">`;
  if(openW)s+=`<rect class="nk-open" x="${xs}" y="${top}" width="${openW-6}" height="${bot-top}" rx="6"/>`;
  s+=`<rect class="nk-board" x="${xl}" y="${top}" width="${cols*fw}" height="${bot-top}"/>`;
  for(let f=n0;f<=to;f++){const m=f%12;
    if(m===0)s+=`<circle class="nk-inlay" cx="${cx(f)}" cy="${sy(2)+15}" r="6"/><circle class="nk-inlay" cx="${cx(f)}" cy="${sy(4)+15}" r="6"/>`;
    else if([3,5,7,9].includes(m))s+=`<circle class="nk-inlay" cx="${cx(f)}" cy="${mid}" r="6"/>`;}
  for(let i=1;i<=cols;i++)s+=`<line class="nk-wire" x1="${xl+i*fw}" x2="${xl+i*fw}" y1="${top}" y2="${bot}"/>`;
  s+=n0===1?`<rect class="nk-nut" x="${xl-6}" y="${top-2}" width="7" height="${bot-top+4}" rx="2"/>`:`<line class="nk-wire" x1="${xl}" x2="${xl}" y1="${top}" y2="${bot}"/>`;
  for(let k=1;k<=6;k++)s+=`<line class="nk-str" x1="${openW?xs:xl}" x2="${xl+cols*fw}" y1="${sy(k)}" y2="${sy(k)}" stroke-width="${(.9+(k-1)*.5).toFixed(2)}"/>`;
  for(let k=1;k<=6;k++)s+=`<circle cx="15" cy="${sy(k)}" r="11" fill="${STR[k].color}"/><text class="nk-sl" x="15" y="${sy(k)}">${k}</text>`;
  if(openW)s+=`<text class="nk-num" x="${cx(0)}" y="${H-8}">open</text>`;
  for(let f=n0;f<=to;f++)s+=`<text class="nk-num" x="${cx(f)}" y="${H-8}">${f}</text>`;
  s+=`<g class="nk-marks"></g>`;
  for(let k=1;k<=6;k++)for(let f=from;f<=to;f++){const a=f===0?xs:xl+(f-n0)*fw,w=f===0?openW-6:fw;
    s+=`<rect class="nk-hit" data-s="${k}" data-f="${f}" x="${a}" y="${sy(k)-15}" width="${w}" height="30"/>`;}
  s+=`</svg>`;
  const el=h(`<div class="nkbox scroll">${s}</div>`),g=el.querySelector('.nk-marks');
  const api={el,
    setMarks(list){g.innerHTML=list.map(m=>`<g class="nk-m k-${m.k||'note'}" data-m="${m.s}-${m.f}"><circle cx="${cx(m.f)}" cy="${sy(m.s)}" r="13.5"/><text x="${cx(m.f)}" y="${sy(m.s)}">${m.t??''}</text></g>`).join('');},
    light(s,f){g.querySelectorAll('.nk-m.on').forEach(x=>x.classList.remove('on'));if(s!=null)g.querySelector(`[data-m="${s}-${f}"]`)?.classList.add('on');}
  };
  el.querySelector('svg').addEventListener('click',e=>{const t=e.target.closest('.nk-hit');if(!t)return;const k=+t.dataset.s,f=+t.dataset.f;
    if(onTap&&onTap(k,f)===false)return;playNote(k,f);});
  return api;
}

/* ---------- pentatonic scales ---------- */
// The five minor pentatonic boxes in A (frets per string, 6 to 1). Other keys slide them along the neck.
const BOX=[
  [[5,8],[5,7],[5,7],[5,7],[5,8],[5,8]],
  [[8,10],[7,10],[7,10],[7,9],[8,10],[8,10]],
  [[10,12],[10,12],[10,12],[9,12],[10,13],[10,12]],
  [[12,15],[12,15],[12,14],[12,14],[13,15],[12,15]],
  [[15,17],[15,17],[14,17],[14,17],[15,17],[15,17]]];
// The notes of box b for a minor pentatonic on minorPc, lowest string first, kept within frets 0–17.
function boxNotes(minorPc,b){
  let d=((minorPc-4+12)%12)-5;const lo=Math.min(...BOX[b].flat())+d;
  if(lo<0)d+=12;else if(lo>=12)d-=12;
  return BOX[b].flatMap((fr,i)=>fr.map(f=>[6-i,f+d]));
}
function buildScales(){
  let key=store.get('refScaleKey',9),type=store.get('refScaleType','minor'),box=store.get('refScaleBox','1');
  let timers=[];
  const el=h(`<div class="ref-sec"><h3>Pentatonic scales</h3>
    <p class="prose">The pentatonic scale has five notes, and it's the one most rock, blues and pop solos use. Learn it as five "boxes" that link together up the neck.</p>
    <div data-w="key"></div><div data-w="type"></div><div data-w="box"></div>
    <h4 class="subhead sc-title"></h4>
    <div class="sc-neck"></div>
    <div class="row"><button type="button" class="btn primary sc-play">▶ Play the box</button><span class="cap sc-info"></span></div>
    <p class="cap sc-note"></p></div>`);
  const neckSlot=el.querySelector('.sc-neck'),play=el.querySelector('.sc-play'),info=el.querySelector('.sc-info');
  let neck=null,seq=[];
  const stop=()=>{timers.forEach(clearTimeout);timers=[];if(play.textContent.startsWith('■'))hush();play.textContent='▶ Play the box';neck&&neck.light(null);};
  const draw=()=>{
    stop();
    const minorPc=type==='minor'?key:(key+9)%12,majorKey=type==='minor'?(key+3)%12:key;
    const keyName=(type==='minor'?MIN:MAJ)[key];
    el.querySelector('.sc-title').innerHTML=`<span class="chn">${keyName}</span> ${type} pentatonic`;
    let notes,from,to;
    if(box==='all'){
      const set=[0,3,5,7,10].map(i=>(minorPc+i)%12);notes=[];
      for(let s=6;s>=1;s--)for(let f=0;f<=15;f++)if(set.includes(pcOf(s,f)))notes.push([s,f]);
      from=0;to=15;
    }else{
      notes=boxNotes(minorPc,+box-1);const fs=notes.map(n=>n[1]);
      from=Math.min(...fs);to=Math.max(...fs);if(to-from<4)to=from+4;
    }
    neck=Neck({from,to,minW:box==='all'?640:0,label:`${keyName} ${type} pentatonic`});
    neck.setMarks(notes.map(([s,f])=>({s,f,t:spell(pcOf(s,f),majorKey),k:pcOf(s,f)===key?'root':'note'})));
    neckSlot.replaceChildren(neck.el);
    seq=[...notes,...notes.slice(0,-1).reverse()];
    play.disabled=box==='all';
    info.textContent=box==='all'?'Pick a box to play it.':`Frets ${Math.min(...notes.map(n=>n[1]))}–${Math.max(...notes.map(n=>n[1]))}`;
    el.querySelector('.sc-note').textContent=type==='minor'
      ?`Orange dots are ${keyName}, the home note. Box 1 is where most solos start. Tap any dot to hear it.`
      :`The major pentatonic uses the same five shapes as the minor one. Only the home note (orange) moves. Tap any dot to hear it.`;
  };
  play.onclick=()=>{
    if(play.textContent.startsWith('■')){stop();return;}
    stopLessons();audio();const step=.3;play.textContent='■ Stop';
    seq.forEach(([s,f],i)=>{playNote(s,f,{delay:.1+i*step,hold:step,vol:.5});timers.push(setTimeout(()=>neck.light(s,f),(.1+i*step)*1000));});
    timers.push(setTimeout(()=>{play.textContent='▶ Play the box';neck.light(null);},(.1+seq.length*step+.6)*1000));
  };
  mount(el,'key',NotePicker(()=>key,v=>{key=v;store.set('refScaleKey',v);draw();},{label:'Key'}));
  mount(el,'type',Seg([['minor','Minor'],['major','Major']],()=>type,v=>{type=v;store.set('refScaleType',v);draw();},'Minor or major'));
  mount(el,'box',Seg([['1','Box 1'],['2','Box 2'],['3','Box 3'],['4','Box 4'],['5','Box 5'],['all','Whole neck']],()=>box,v=>{box=v;store.set('refScaleBox',v);draw();},'Which box'));
  draw();
  return {el,stop};
}

/* ---------- strumming ---------- */
// One symbol per eighth note: D down, U up, u short choppy up, B bass note, b the other bass note, - miss the strings.
const PATTERNS=[
  {n:'All downstrokes',beats:4,p:'D-D-D-D-',tip:'One strum on every beat. Start here with any new chord.'},
  {n:'Down-up',beats:4,p:'DUDUDUDU',tip:'Your hand swings down and up like a pendulum, the whole time.'},
  {n:'Old faithful',beats:4,p:'D-DU-UDU',tip:'Down, down-up, up-down-up. It fits more songs than any other pattern. On the empty "3", keep your hand moving and just miss the strings.'},
  {n:'Folk',beats:4,p:'D-DUD-DU',tip:'Down, down-up, down, down-up.'},
  {n:'Boom-chick',beats:4,p:'B-D-b-D-',tip:'Pick one bass note, strum the thinner strings, pick a different bass note, strum again. Country and folk.'},
  {n:'Waltz',beats:3,p:'B-D-D-',tip:'Three beats in a bar: bass note, strum, strum. For songs in 3, like "Happy Birthday".'},
  {n:'Off-beat',beats:4,p:'-u-u-u-u',tip:'Short, choppy upstrokes on every "and". Ease off your fretting hand right after each one to cut it short. Reggae and ska.'}
];
// Bass notes for Boom-chick and Waltz: the chord's root, then another chord note.
const BASS={Em:[[6,0],[4,2]],Am:[[5,0],[4,2]],G:[[6,3],[4,0]],C:[[5,3],[4,2]],D:[[4,0],[5,0]],A:[[5,0],[4,2]],E:[[6,0],[4,2]],Dm:[[4,0],[5,0]]};
const STRUM_CHORDS=['Em','Am','G','C','D','A','E','Dm'];
function buildStrum(){
  let chord=store.get('refStrumChord','Em'),bpm=store.get('refStrumBpm',70),click=store.get('refStrumClick',true),playing=null;
  if(!STRUM_CHORDS.includes(chord))chord='Em';
  const el=h(`<div class="ref-sec"><h3>Strumming patterns</h3>
    <p class="prose">Strum from your wrist, and keep your hand moving down and up in time even when you miss the strings. Downstrokes land on the numbers, upstrokes on the "and"s.</p>
    <div class="st-ctl">
      <label class="row" style="gap:6px">Chord <select class="st-chord" aria-label="Chord">${STRUM_CHORDS.map(c=>`<option>${c}</option>`).join('')}</select></label>
      <label class="row st-speed" style="gap:8px">Speed <input type="range" min="40" max="140" step="5" aria-label="Speed in beats per minute"><span class="cap st-bpm"></span></label>
      <label class="row" style="gap:6px"><input type="checkbox" class="st-click"> Click on the beat</label>
    </div>
    <p class="cap">↓ down · ↑ up · small ↑ short and choppy · B pick one bass note · blank: miss the strings</p>
    <div class="st-list"></div></div>`);
  const sel=el.querySelector('.st-chord'),rng=el.querySelector('input[type=range]'),bv=el.querySelector('.st-bpm'),ck=el.querySelector('.st-click');
  sel.value=chord;rng.value=bpm;bv.textContent=`${bpm} BPM`;ck.checked=click;
  sel.onchange=()=>{chord=sel.value;store.set('refStrumChord',chord);};
  rng.oninput=()=>{bpm=+rng.value;store.set('refStrumBpm',bpm);bv.textContent=`${bpm} BPM`;};
  ck.onchange=()=>{click=ck.checked;store.set('refStrumClick',click);};
  const eighth=()=>30/bpm;
  const list=el.querySelector('.st-list');
  const cards=PATTERNS.map(P=>{
    const counts=Array.from({length:P.p.length},(_,i)=>i%2?'&':String(i/2+1));
    const sym=c=>c==='D'?'<span class="st-a">↓</span>':c==='U'?'<span class="st-a">↑</span>':c==='u'?'<span class="st-a chop">↑</span>'
      :c==='B'||c==='b'?'<span class="st-a bass">B</span>':'<span class="st-a rest">·</span>';
    const card=h(`<div class="st-card"><div class="st-head"><b>${P.n}</b><span class="cap">${P.beats} beats</span><button type="button" class="btn st-go">▶ Play</button></div>
      <div class="st-grid" style="grid-template-columns:repeat(${P.p.length},minmax(0,1fr))">${[...P.p].map((c,i)=>`<div class="st-slot">${sym(c)}<span class="st-c">${counts[i]}</span></div>`).join('')}</div>
      <p class="cap">${P.tip}</p></div>`);
    const slots=card.querySelectorAll('.st-slot'),go=card.querySelector('.st-go'),bass=P.p.includes('B');
    const light=i=>slots.forEach((s,j)=>s.classList.toggle('on',j===i));
    // How long a strum rings: until the next thing played.
    const holdFor=i=>{let d=1;while(d<P.p.length&&P.p[(i+d)%P.p.length]==='-')d++;return d*eighth();};
    const tk=Ticker(eighth,(n,delay)=>{
      const i=n%P.p.length,c=P.p[i],ch=CH[chord]||MORE[chord],notes=chordNotes(ch),[b1,b2]=BASS[chord];
      if(click&&i%2===0)metroClick(delay,i===0);
      if(c==='D')strumAt(bass?notes.filter(([s])=>s<=4):notes,delay,{hold:holdFor(i),vol:i===0?.42:.36});
      else if(c==='U')strumAt(notes,delay,{up:true,hold:holdFor(i),vol:.26});
      else if(c==='u')strumAt(notes,delay,{up:true,hold:.1,vol:.32});
      else if(c==='B'||c==='b'){const [s,f]=c==='B'?b1:b2;playNote(s,f,{delay:Math.max(0,delay),vol:.55,hold:holdFor(i)});}
      tk.at(delay,()=>light(i));
    });
    const stop=()=>{if(!tk.running)return;tk.stop();hush();light(-1);go.textContent='▶ Play';if(playing===api)playing=null;};
    const api={stop};
    go.onclick=()=>{if(tk.running){stop();return;}if(playing)playing.stop();stopLessons();playing=api;go.textContent='■ Stop';tk.start();};
    list.append(card);return api;
  });
  return {el,stop:()=>cards.forEach(c=>c.stop())};
}

/* ---------- notes on the neck ---------- */
function buildNeck(){
  let show=store.get('refNeckShow','all'),find=null;
  const el=h(`<div class="ref-sec"><h3>Notes on the neck</h3>
    <p class="prose">Every fret is one step higher than the last. The notes go A B C D E F G and then start again. There's a "sharp" between every pair, except B–C and E–F.</p>
    <div data-w="show"></div>
    <div><p class="cap" style="margin-bottom:6px">Find a note (tap it again to clear):</p><div data-w="find"></div></div>
    <div class="nk-slot"></div>
    <p class="nk-read" aria-live="polite"></p>
    <ul class="points cap">
      <li>Fret 12 is the same as open, one octave higher. The double dot marks it.</li>
      <li>Every sharp (♯) has a second name, a flat (♭): C♯ is the same note as D♭.</li>
      <li>Strings 6 and 1 are both E, so they have the same notes.</li></ul></div>`);
  const read=el.querySelector('.nk-read');
  const neck=Neck({from:0,to:12,minW:640,label:'Guitar neck with every note named',onTap:(s,f)=>{read.textContent=`String ${s}, ${f?`fret ${f}`:'open'}: ${SHARP[pcOf(s,f)]}`;neck.light(s,f);}});
  el.querySelector('.nk-slot').replaceWith(neck.el);
  const draw=()=>{
    const m=[];
    for(let s=1;s<=6;s++)for(let f=0;f<=12;f++){const pc=pcOf(s,f),nat=SHARP[pc].length===1;
      if(show==='nat'&&!nat&&pc!==find)continue;
      m.push({s,f,t:SHARP[pc],k:find!=null?(pc===find?'hl':'dim'):nat?'note':'sharp'});}
    neck.setMarks(m);
    if(find==null){read.textContent='Tap any spot to hear it.';return;}
    const where=[6,5,4,3,2,1].map(s=>{const f=(find-OPEN_PC[s]+12)%12;return `string ${s} ${f?`fret ${f}`:'open'}`;});
    read.textContent=`${PICK[find].join(' / ')}: ${where.join(' · ')}`;
  };
  mount(el,'show',Seg([['all','All notes'],['nat','Natural notes only']],()=>show,v=>{show=v;store.set('refNeckShow',v);draw();},'Which notes'));
  mount(el,'find',NotePicker(()=>find,v=>{find=v;draw();},{label:'Find a note',allowNone:true}));
  draw();return el;
}

/* ---------- capo ---------- */
const CAPO_SHAPES=[['C',0,0],['A',9,0],['G',7,0],['E',4,0],['D',2,0],['Am',9,1],['Em',4,1],['Dm',2,1]];
const FAMILY={C:'C, F, G, Am',A:'A, D, E, F♯m',G:'G, C, D, Em',E:'E, A, B7, C♯m',D:'D, G, A, Bm',Am:'Am, Dm, E, C, F, G',Em:'Em, Am, B7, G, C, D',Dm:'Dm, A7, F, C, B♭'};
function buildCapo(){
  let capo=store.get('refCapo',2),key=store.get('refCapoKey',9),minor=store.get('refCapoMinor',false);
  const el=h(`<div class="ref-sec"><h3>Capo chart</h3>
    <p class="prose">A capo clamps across the strings like a barre, so the chord shapes you know sound higher. Singers use it to put a song in a key that suits their voice.</p>
    <h4 class="subhead">Where is your capo?</h4>
    <div data-w="capo"></div>
    <div class="capo-grid"></div>
    <p class="cap">Fret numbers in tab and chord charts count up from the capo, as if it were the nut.</p>
    <h4 class="subhead">Which capo for my song?</h4>
    <p class="cap">Pick the song's key (the chord it starts and ends on, usually).</p>
    <div data-w="key"></div><div data-w="mm"></div>
    <div class="capo-opts"></div></div>`);
  const grid=el.querySelector('.capo-grid'),opts=el.querySelector('.capo-opts');
  const drawGrid=()=>{grid.innerHTML=CAPO_SHAPES.map(([n,pc,m])=>`<div class="capo-card"><span><b class="chn">${n}</b> shape</span><span class="cap">sounds as</span><b class="to chn">${(m?MIN:MAJ)[(pc+capo)%12]+(m?'m':'')}</b></div>`).join('');};
  const drawOpts=()=>{
    const list=CAPO_SHAPES.filter(([,,m])=>!!m===minor).map(([n,pc])=>[n,(key-pc+12)%12]).filter(([,c])=>c<=7).sort((a,b)=>a[1]-b[1]);
    opts.innerHTML=list.map(([n,c])=>`<div class="capo-opt"><b>${c?`Capo ${c}`:'No capo'}</b><div>Play the <b class="chn">${n}</b> shapes<div class="cap">Chords like ${FAMILY[n]}</div></div></div>`).join('')
      ||'<p class="cap">No easy option with the capo below fret 8.</p>';
  };
  mount(el,'capo',Seg([0,1,2,3,4,5,6,7].map(n=>[n,n?`${n}`:'No capo']),()=>capo,v=>{capo=+v;store.set('refCapo',capo);drawGrid();},'Capo fret'));
  mount(el,'key',NotePicker(()=>key,v=>{key=v;store.set('refCapoKey',v);drawOpts();},{label:'Song key'}));
  mount(el,'mm',Seg([['false','Major key'],['true','Minor key']],()=>minor,v=>{minor=v==='true';store.set('refCapoMinor',minor);drawOpts();},'Major or minor key'));
  drawGrid();drawOpts();return el;
}

/* ---------- chords in a key ---------- */
const DEGREES=[[0,'I',''],[2,'ii','m'],[4,'iii','m'],[5,'IV',''],[7,'V',''],[9,'vi','m']];
const PROGS=[['I','IV','V','I','Three-chord rock, blues and folk.'],['I','V','vi','IV','The pop progression: hundreds of hit songs.'],
  ['I','vi','IV','V','The fifties progression.'],['vi','IV','I','V','The pop progression again, starting on the minor chord.']];
// An open chord when there is one, otherwise the barre chord lowest on the neck.
function chordFor(name,pc,minor){
  if(CH[name])return CH[name];if(MORE[name])return MORE[name];
  const q=minor?'min':'maj',shape=barreFret('E',pc)<=barreFret('A',pc)?'E':'A';return barreChord(shape,pc,q);
}
function buildKeys(){
  let key=store.get('refKey','G');
  const KEYS={G:7,C:0,D:2,A:9,E:4};if(!(key in KEYS))key='G';
  let playing=null;
  const el=h(`<div class="ref-sec"><h3>Chords that go together</h3>
    <p class="prose">Each key has six everyday chords. Musicians number them with Roman numerals, so a progression like I–IV–V works in any key. The big four are I, IV, V and vi.</p>
    <div data-w="key"></div>
    <div class="chordchart kc-grid"></div>
    <h4 class="subhead">Famous progressions</h4>
    <p class="cap">Tap ▶ to hear one, four strums per chord.</p>
    <div class="progs"></div></div>`);
  const grid=el.querySelector('.kc-grid'),progs=el.querySelector('.progs');
  let stops=[];
  const draw=()=>{
    stops.forEach(f=>f());stops=[];
    const k=KEYS[key],chords={};
    DEGREES.forEach(([d,rn,suf])=>{const pc=(k+d)%12,name=SHARP[pc]+suf;chords[rn]={name,c:chordFor(name,pc,!!suf)};});
    grid.replaceChildren(...DEGREES.map(([,rn])=>{const d=h(`<div class="kc"><span class="kn${['I','IV','V','vi'].includes(rn)?' main':''}">${rn}</span></div>`);d.append(Chord(chords[rn].c));return d;}));
    progs.replaceChildren(...PROGS.map(p=>{
      const seq=p.slice(0,4);
      const row=h(`<div class="prog"><button type="button" class="btn pg-go" aria-label="Play">▶</button><div><div class="pg-names">${seq.map((rn,i)=>`<span class="pc chn" data-i="${i}">${chords[rn].name}</span>`).join('<span class="dash">–</span>')}</div>
        <div class="cap">${seq.join(' – ')} · ${p[4]}</div></div></div>`);
      const go=row.querySelector('.pg-go'),names=row.querySelectorAll('.pc');
      const light=i=>names.forEach((n,j)=>n.classList.toggle('on',j===i));
      const beat=()=>60/88;
      const tk=Ticker(beat,(n,delay)=>{const i=Math.floor(n/4)%4;strumAt(chordNotes(chords[seq[i]].c),delay,{hold:beat(),vol:n%4===0?.42:.34});tk.at(delay,()=>light(i));});
      const stop=()=>{if(!tk.running)return;tk.stop();hush();light(-1);go.textContent='▶';if(playing===api)playing=null;};
      const api={stop};stops.push(stop);
      go.onclick=()=>{if(tk.running){stop();return;}if(playing)playing.stop();stopLessons();playing=api;go.textContent='■';tk.start();};
      return row;}));
  };
  mount(el,'key',Seg(Object.keys(KEYS).map(k=>[k,`Key of ${k}`]),()=>key,v=>{key=v;store.set('refKey',v);draw();},'Key'));
  draw();
  return {el,stop:()=>stops.forEach(f=>f())};
}

/* ---------- the Reference pop-up ---------- */
const TABS=[
  {id:'chords',t:'Chords',build:buildChords},
  {id:'barre',t:'Barre',build:buildBarre},
  {id:'scales',t:'Scales',build:buildScales},
  {id:'strumming',t:'Strumming',build:buildStrum},
  {id:'neck',t:'Neck',build:buildNeck},
  {id:'capo',t:'Capo',build:buildCapo},
  {id:'keys',t:'Keys',build:buildKeys}];
const built={};let refEl=null;
const stopRef=()=>Object.values(built).forEach(b=>b.stop&&b.stop());
const refPop=Popup('Reference',()=>{
  refEl=h(`<div class="ref"><div class="seg ref-tabs" role="group" aria-label="Reference pages">${TABS.map(t=>`<button type="button" class="btn" data-t="${t.id}">${t.t}</button>`).join('')}</div><div class="ref-panels"></div></div>`);
  refEl.querySelector('.ref-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)showTab(b.dataset.t);});
  return refEl;
},stopRef,true);
function showTab(id){
  const tab=TABS.find(t=>t.id===id)||TABS[0];stopRef();
  if(!built[tab.id]){const r=tab.build();built[tab.id]=r instanceof Element?{el:r}:r;refEl.querySelector('.ref-panels').append(built[tab.id].el);}
  Object.entries(built).forEach(([k,b])=>{b.el.hidden=k!==tab.id;});
  refEl.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===tab.id));
  store.set('refTab',tab.id);
  const m=refEl.closest('.tmodal');if(m)m.scrollTop=0;
}
const openRef=id=>{refPop.open();showTab(id||store.get('refTab','chords'));};
document.getElementById('ref-open').onclick=()=>openRef();

/* ---------- metronome ---------- */
const TEMPO_WORDS=[[60,'Very slow'],[76,'Slow'],[108,'Medium'],[140,'Fast'],[999,'Very fast']];
let metro=null;
const metroPop=Popup('Metronome',()=>{
  let bpm=store.get('metroBpm',80),beats=store.get('metroBeats',4),taps=[];
  const el=h(`<div class="mt">
    <div class="mt-bpm"><button type="button" class="btn mt-step" data-d="-1" aria-label="Slower">−</button>
      <div class="mt-read"><span class="mt-n" aria-live="polite"></span><span class="cap">beats per minute</span></div>
      <button type="button" class="btn mt-step" data-d="1" aria-label="Faster">+</button></div>
    <input type="range" class="mt-range" min="40" max="208" aria-label="Tempo">
    <p class="cap mt-word"></p>
    <div class="mt-lights" aria-hidden="true"></div>
    <div class="row mt-btns"><button type="button" class="btn primary mt-go">▶ Start</button><button type="button" class="btn mt-tap">Tap tempo</button></div>
    <div class="set-row"><div><b>Beats in a bar</b></div><div data-w="beats"></div></div>
    <p class="cap">The first beat of each bar is higher. To find a song's speed, tap "Tap tempo" along with it.</p></div>`);
  const n=el.querySelector('.mt-n'),rng=el.querySelector('.mt-range'),word=el.querySelector('.mt-word'),lights=el.querySelector('.mt-lights'),go=el.querySelector('.mt-go');
  const setBpm=v=>{bpm=Math.max(40,Math.min(208,Math.round(v)));store.set('metroBpm',bpm);n.textContent=bpm;rng.value=bpm;word.textContent=TEMPO_WORDS.find(([t])=>bpm<t)[1];};
  const drawLights=()=>{lights.innerHTML=Array.from({length:beats},(_,i)=>`<span class="${i?'':'first'}"></span>`).join('');};
  const light=i=>lights.querySelectorAll('span').forEach((s,j)=>s.classList.toggle('on',j===i));
  const tk=Ticker(()=>60/bpm,(i,delay)=>{const b=i%beats;metroClick(delay,b===0);tk.at(delay,()=>light(b));});
  metro={stop(){tk.stop();light(-1);go.textContent='▶ Start';}};
  go.onclick=()=>{if(tk.running){metro.stop();return;}stopLessons();tk.start();go.textContent='■ Stop';};
  rng.oninput=()=>setBpm(+rng.value);
  // − and + step by one; hold to keep going.
  el.querySelectorAll('.mt-step').forEach(b=>{let t1,t2;const d=+b.dataset.d;
    const end=()=>{clearTimeout(t1);clearInterval(t2);};
    b.addEventListener('pointerdown',e=>{e.preventDefault();setBpm(bpm+d);t1=setTimeout(()=>{t2=setInterval(()=>setBpm(bpm+d),70);},450);});
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,end));
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setBpm(bpm+d);}});});
  el.querySelector('.mt-tap').onclick=()=>{const t=performance.now();taps=taps.filter(x=>t-x<2500);taps.push(t);
    if(taps.length>1){const gaps=taps.slice(1).map((x,i)=>x-taps[i]).slice(-4);setBpm(60000/(gaps.reduce((a,b)=>a+b)/gaps.length));}};
  mount(el,'beats',Seg([2,3,4,6].map(b=>[b,String(b)]),()=>beats,v=>{beats=+v;store.set('metroBeats',beats);drawLights();},'Beats in a bar'));
  setBpm(bpm);drawLights();return el;
},()=>metro&&metro.stop());
document.getElementById('metro-open').onclick=()=>metroPop.open();
document.addEventListener('visibilitychange',()=>{if(document.hidden){metro&&metro.stop();stopRef();}});

/* ---------- links: #scales, #metronome … ---------- */
function fromHash(hash){
  const id=(hash||'').replace(/^#/,'');
  if(id==='metronome'){metroPop.open();return true;}
  if(TABS.some(t=>t.id===id)){openRef(id);return true;}
  return false;
}
if(typeof START_HASH==='string')fromHash(START_HASH);
window.addEventListener('hashchange',()=>{if(fromHash(location.hash)){try{history.replaceState(null,'','#s'+(cur+1));}catch(e){}}});
})();
