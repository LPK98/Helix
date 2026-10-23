import * as THREE from './assets/three.module.js';
import { GLTFLoader } from './assets/GLTFLoader.js';

const canvas=document.getElementById('scene');
const track=document.getElementById('track');
const bar=document.getElementById('bar');
const codexTitle=document.querySelector('.line1');
const threeTitle=document.querySelector('.line2');
const transitionShade=document.getElementById('transitionShade');
const transitionTitle=document.getElementById('transitionTitle');
const introTrack=document.getElementById('introTrack');
const introStage=document.getElementById('introStage');
const heroCanvas=document.getElementById('heroSculpture');
const heroSculpture=document.querySelector('.hero-sculpture');
const outro=document.getElementById('outro');
const outroBlock=document.getElementById('outroBlock');
const statueViewer=document.getElementById('statueViewer');
const statueViewerCanvas=document.getElementById('statueViewerCanvas');
const statueViewerClose=document.getElementById('statueViewerClose');
const statueViewerKicker=document.getElementById('statueViewerKicker');
const statueViewerTitle=document.getElementById('statueViewerTitle');
const statueViewerSource=document.getElementById('statueViewerSource');
const statueViewerLicense=document.getElementById('statueViewerLicense');
const prefersReducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const HERO_LOOKS=[
  {glow:.20,photo:.34,stars:0,   night:0,   key:2.9,rim:2.0,fill:.22,keyPos:[-3.8,4.2,4.8],exposure:1.00},
  {glow:.30,photo:.30,stars:0,   night:0,   key:3.3,rim:1.9,fill:.20,keyPos:[-1.6,4.8,5.4],exposure:1.04},
  {glow:.16,photo:.24,stars:.18, night:.1,  key:2.5,rim:2.9,fill:.18,keyPos:[ 2.2,4.0,4.4],exposure:.96},
  {glow:.26,photo:.20,stars:.36, night:.3,  key:3.0,rim:2.5,fill:.16,keyPos:[ 4.4,3.4,2.8],exposure:1.00},
  {glow:.12,photo:.14,stars:.62, night:.55, key:2.0,rim:3.4,fill:.12,keyPos:[ 3.2,2.8,-2.6],exposure:.92},
  {glow:.12,photo:.14,stars:.62, night:.55, key:2.0,rim:3.4,fill:.12,keyPos:[ 3.2,2.8,-2.6],exposure:.92}
];

let renderer;
let heroRenderer=null;
let heroScene=null;
let heroCamera=null;
let heroGroup=null;
let heroStoneMaterial=null;
let heroPool=null;
let heroShadowLight=null;
let heroFallbackStatue=null;
let heroKeyLight=null;
let heroFillLight=null;
let heroRimLight=null;
let heroEnvironment=null;
let heroVisible=false;
let pointerTargetX=0;
let pointerTargetY=0;
let pointerEaseX=0;
let pointerEaseY=0;
try{
  renderer=new THREE.WebGLRenderer({
    canvas,alpha:true,antialias:true,powerPreference:'high-performance'
  });
  renderer.outputColorSpace=THREE.SRGBColorSpace;
}catch{
  canvas.hidden=true;
  document.body.classList.add('webgl-unavailable');
}

const scene=new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xf0f2f5,0x171719,2.1));
const cardKeyLight=new THREE.DirectionalLight(0xffffff,2.7);
cardKeyLight.position.set(-2.5,3.5,5);
scene.add(cardKeyLight);
const rig=new THREE.Group();
scene.add(rig);

const outlineGroup=new THREE.Group();
rig.add(outlineGroup);

const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,9.25);

const loader=new THREE.TextureLoader();
const cards=[];
const gridCards=[];
const modelAssetCache=new Map();
const modelAssetRequests=new Map();
const COUNT=9;
const W_SEGS=32;
const GRID_H_SEGS=12;
const OUTLINE_SAMPLES=240;
const HELIX_CARD_H=1.34;
const HELIX_CARD_W=2.8;
const GRID_CARD_H=1.77;
const GRID_CARD_W=2.54;
const CARD_ASSETS=[
  new URL('./assets/work-01.svg',import.meta.url).href,
  new URL('./assets/work-02.svg',import.meta.url).href,
  new URL('./assets/work-03.svg',import.meta.url).href,
  new URL('./assets/work-04.svg',import.meta.url).href,
  new URL('./assets/work-05.svg',import.meta.url).href,
  new URL('./assets/work-06.svg',import.meta.url).href,
  new URL('./assets/work-07.svg',import.meta.url).href,
  new URL('./assets/work-08.svg',import.meta.url).href,
  new URL('./assets/work-09.svg',import.meta.url).href
];
const SCROLL_CARD_ASSETS=[
  new URL('./assets/antique-card-01.png',import.meta.url).href,
  new URL('./assets/antique-card-02.png',import.meta.url).href,
  new URL('./assets/antique-card-03.png',import.meta.url).href,
  new URL('./assets/antique-card-04.png',import.meta.url).href,
  new URL('./assets/antique-card-05.png',import.meta.url).href,
  new URL('./assets/antique-card-06.png',import.meta.url).href,
  CARD_ASSETS[6],CARD_ASSETS[7],CARD_ASSETS[8]
];
// Add one entry per card when more 3D models are ready. The card number maps
// to the corresponding artwork and grid card.
const CARD_MODELS=[
  {
    card:1,
    src:new URL('./assets/snake_statue.glb',import.meta.url).href,
    title:'Snake Statue',
    creator:'Ville Seppänen',
    finish:'black',
    source:'https://skfb.ly/MnRU',
    license:'CC BY 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by/4.0/',
    attribution:'"Snake Statue" by Ville Seppänen, licensed under CC BY 4.0.'
  },
  {
    card:2,
    src:new URL('./assets/statue_of_edward_snowden.glb',import.meta.url).href,
    title:'Statue Of Edward Snowden',
    creator:'Zafio',
    source:'https://skfb.ly/Es6I',
    license:'CC BY-NC-SA 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by-nc-sa/4.0/',
    attribution:'"Statue Of Edward Snowden" by Zafio, licensed under CC BY-NC-SA 4.0.'
  },
  {
    card:3,
    src:new URL('./assets/ibex_statue_scan_-_berlin_-_tierpark.glb',import.meta.url).href,
    title:'Ibex Statue Scan - Berlin - Tierpark',
    creator:'Christian Rambow',
    source:'https://skfb.ly/IPuP',
    license:'CC BY-NC 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by-nc/4.0/',
    attribution:'"Ibex Statue Scan - Berlin - Tierpark" by Christian Rambow, licensed under CC BY-NC 4.0.'
  },
  {
    card:4,
    src:new URL('./assets/100.db.11_venus_apple_thorvaldsen.glb',import.meta.url).href,
    title:'100.DB.11 Venus Apple Thorvaldsen',
    creator:'Ancient World 3D',
    finish:'gray',
    source:'https://skfb.ly/o7sBE',
    license:'CC BY-NC-SA 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by-nc-sa/4.0/',
    attribution:'"100.DB.11 Venus Apple Thorvaldsen" by Ancient World 3D, licensed under CC BY-NC-SA 4.0.'
  },
  {
    card:5,
    src:new URL('./assets/vhagar__ancient_dragon_statue.glb',import.meta.url).href,
    title:'Vhagar Ancient Dragon Statue',
    creator:'PixForge',
    source:'https://skfb.ly/pLZKK',
    license:'CC BY 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by/4.0/',
    attribution:'"Vhagar Ancient Dragon Statue" by PixForge, licensed under CC BY 4.0.'
  },
  {
    card:6,
    src:new URL('./assets/photogrammetry_statue_-_deer_for_games_engine.glb',import.meta.url).href,
    title:'Photogrammetry Statue - Deer for Games Engine',
    creator:'Shawhir',
    source:'https://skfb.ly/6zYKZ',
    license:'CC BY 4.0',
    licenseUrl:'http://creativecommons.org/licenses/by/4.0/',
    attribution:'"Photogrammetry Statue - Deer for Games Engine" by Shawhir, licensed under CC BY 4.0.'
  }
];

const R=4.45;
const Y_START=-1.09;
const pitchPerRad=0.82;

const MID=0.0;
const DIP_A=0.52;
const DIP_S=1.20;

const dsPerRad=Math.sqrt(R*R+pitchPerRad*pitchPerRad);

const CARD_ARC_WIDTH=2.18;
const GAP_ARC=0.24;
const STEP_ARC=CARD_ARC_WIDTH+GAP_ARC;

const TRAVEL_TURNS=3.18;
const TRAVEL_ARC=Math.PI*2*TRAVEL_TURNS*dsPerRad;
const BASE_ARC=-43.10;

const HELIX_START=.095;
const HELIX_END=.91;
const HELIX_MID=(HELIX_START+HELIX_END)*0.5;

/*
  Closing transition: build into a 3x2 stacked grid before
  the final helix card fully exits the top of the viewport.
*/
const STACK_START=.655;
const STACK_END=.985;
const GRID_ORDER=[1,2,3,4,5,6];
const GRID_TARGETS=[
  new THREE.Vector3(-2.72, 0.98, .12),
  new THREE.Vector3( 0.00, 0.98, .10),
  new THREE.Vector3( 2.72, 0.98, .08),
  new THREE.Vector3(-2.72,-0.98, .08),
  new THREE.Vector3( 0.00,-0.98, .06),
  new THREE.Vector3( 2.72,-0.98, .10)
];
const DESKTOP_GRID_TARGETS=GRID_TARGETS.map(target=>target.clone());
const GRID_ENTRANCES=[
  new THREE.Vector3(-8.2, 5.6,.55),
  new THREE.Vector3( 0.0, 5.95,.40),
  new THREE.Vector3( 8.2, 5.6,.55),
  new THREE.Vector3(-8.0,-5.75,.45),
  new THREE.Vector3( 0.0,-6.05,.36),
  new THREE.Vector3( 8.0,-5.75,.45)
];
const GRID_START_ROT=[
  new THREE.Euler(.06,-.16,-.18),
  new THREE.Euler(.11, .00,-.04),
  new THREE.Euler(.06, .16, .18),
  new THREE.Euler(-.05,-.15,-.17),
  new THREE.Euler(-.10, .00, .05),
  new THREE.Euler(-.05, .15, .17)
];
const STACK_STAGGER=.07;
const GRID_MOVE_DURATION=.34;
const STACK_ENTRY_FRACTION=.8;
const GRID_DESKTOP_BREAKPOINT=1200;
const GRID_MOBILE_BREAKPOINT=600;

let gridLayoutScale=1;

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const smoother=t=>t*t*t*(t*(t*6-15)+10);

const _keyPos=new THREE.Vector3();
function updateHeroLighting(progress){
  const position=clamp(progress)*(HERO_LOOKS.length-1);
  const index=Math.min(Math.floor(position),HERO_LOOKS.length-2);
  const mix=smooth(position-index);
  const from=HERO_LOOKS[index];
  const to=HERO_LOOKS[index+1];
  const v=key=>lerp(from[key],to[key],mix);

  introStage.style.setProperty('--glow-opacity',String(v('glow')));
  introStage.style.setProperty('--photo-opacity',String(v('photo')));
  introStage.style.setProperty('--stars-opacity',String(v('stars')));
  introStage.style.setProperty('--night-opacity',String(v('night')));

  if(heroKeyLight){
    heroKeyLight.intensity=v('key');
    heroRimLight.intensity=v('rim');
    heroFillLight.intensity=v('fill');
    _keyPos.set(...from.keyPos).lerp(new THREE.Vector3(...to.keyPos),mix);
    heroKeyLight.position.copy(_keyPos);
    if(heroRenderer)heroRenderer.toneMappingExposure=v('exposure');
  }
}

/* A dark photo-studio: black room with a few soft-boxes. On polished black
   stone this produces the long, clean highlights real sculpture photography has. */
function createHeroEnvironment(renderer){
  const envCanvas=document.createElement('canvas');
  envCanvas.width=1024;
  envCanvas.height=512;
  const c=envCanvas.getContext('2d');
  if(!c)throw new Error('Canvas environment could not be created');

  const room=c.createLinearGradient(0,0,0,512);
  room.addColorStop(0,'#0c0d0f');
  room.addColorStop(.5,'#070708');
  room.addColorStop(1,'#020202');
  c.fillStyle=room;
  c.fillRect(0,0,1024,512);

  const box=(x,y,w,h,alpha)=>{
    const g=c.createLinearGradient(x,0,x+w,0);
    g.addColorStop(0,'rgba(255,255,255,0)');
    g.addColorStop(.18,`rgba(255,255,255,${alpha})`);
    g.addColorStop(.82,`rgba(255,255,255,${alpha})`);
    g.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=g;
    c.fillRect(x,y,w,h);
  };
  box(120,70,70,330,.95);   // tall strip, camera-left
  box(330,40,150,90,.80);   // overhead panel
  box(560,90,44,310,.70);   // slim strip
  box(800,60,110,340,.85);  // right rim box
  box(920,150,50,200,.55);
  c.fillStyle='rgba(255,255,255,.22)';
  c.fillRect(0,252,1024,3);   // horizon line

  const texture=new THREE.CanvasTexture(envCanvas);
  texture.mapping=THREE.EquirectangularReflectionMapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const target=pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return target.texture;
}

/* Polished black marble: dielectric base + clear-coat, with procedural veining,
   mineral flecks and micro-roughness patched into the PBR shader. Noise is anchored
   to the model's own coordinates so the stone grain turns with the statue. */
function createStoneMaterial(){
  const noiseScale={value:1};
  const material=new THREE.MeshPhysicalMaterial({
    color:0x141416,
    metalness:.04,
    roughness:.34,
    clearcoat:.9,
    clearcoatRoughness:.14,
    envMapIntensity:1.6,
    side:THREE.DoubleSide
  });
  material.userData.noiseScale=noiseScale;
  material.onBeforeCompile=shader=>{
    shader.uniforms.uNoiseScale=noiseScale;
    shader.vertexShader=shader.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec3 vStonePos;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvStonePos=position;');
    shader.fragmentShader=shader.fragmentShader
      .replace('#include <common>',`#include <common>
varying vec3 vStonePos;
uniform float uNoiseScale;
float sHash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float sNoise(vec3 x){
  vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(sHash(i),sHash(i+vec3(1,0,0)),f.x),mix(sHash(i+vec3(0,1,0)),sHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(sHash(i+vec3(0,0,1)),sHash(i+vec3(1,0,1)),f.x),mix(sHash(i+vec3(0,1,1)),sHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float sFbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*sNoise(p);p=p*2.03+17.1;a*=.5;}return s;}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
vec3 sp=vStonePos*uNoiseScale;
float stWarp=sFbm(sp*1.3);
float stVein=1.-abs(sFbm(sp*2.1+stWarp*2.8)*2.-1.);
stVein=pow(smoothstep(.66,1.,stVein),3.);
float stSpeck=smoothstep(.74,.92,sNoise(sp*70.));
diffuseColor.rgb+=vec3(.060,.060,.066)*stVein+vec3(.035)*stSpeck;
diffuseColor.rgb*=.82+.36*sFbm(sp*4.5);`)
      .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(roughnessFactor+(sFbm(sp*8.)-.5)*.24-stVein*.14,.08,.9);`);
  };
  return material;
}

function createLightPool(){
  const size=256;
  const canvasEl=document.createElement('canvas');
  canvasEl.width=canvasEl.height=size;
  const c=canvasEl.getContext('2d');
  const g=c.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(255,255,255,.55)');
  g.addColorStop(.35,'rgba(255,255,255,.16)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;
  c.fillRect(0,0,size,size);
  const texture=new THREE.CanvasTexture(canvasEl);
  texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(6.4,6.4),
    new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  mesh.rotation.x=-Math.PI/2;
  mesh.position.y=-1.7;
  return mesh;
}

function createStatueHeadGeometry(){
  const phiSegments=64;
  const thetaSegments=96;
  const columns=thetaSegments+1;
  const positions=[];
  const uvs=[];
  const indices=[];
  const rx=.45;
  const ry=.62;
  const rz=.37;
  const gaussian=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));

  for(let row=0;row<=phiSegments;row++){
    const phi=Math.PI*row/phiSegments;
    for(let column=0;column<=thetaSegments;column++){
      const u=column/thetaSegments;
      const theta=(u-.5)*Math.PI*2;
      const sinPhi=Math.sin(phi);
      const x=rx*sinPhi*Math.sin(theta);
      const y=ry*Math.cos(phi);
      const front=Math.pow(Math.max(0,Math.cos(theta)),8);
      let z=rz*sinPhi*Math.cos(theta);

      // Shallow modeled planes give the face readable sculpture detail.
      const noseBridge=.09*gaussian(x,y,0,-.08,.065,.19);
      const noseTip=.14*gaussian(x,y,0,-.22,.095,.09);
      const cheeks=.035*(gaussian(x,y,-.22,-.12,.11,.09)+gaussian(x,y,.22,-.12,.11,.09));
      const brows=.035*(gaussian(x,y,-.15,.10,.10,.045)+gaussian(x,y,.15,.10,.10,.045));
      const eyeSockets=.035*(gaussian(x,y,-.15,.035,.075,.038)+gaussian(x,y,.15,.035,.075,.038));
      const philtrum=.025*gaussian(x,y,0,-.29,.045,.06);
      const mouthGroove=.028*gaussian(x,y,0,-.35,.105,.025);
      const chin=.025*gaussian(x,y,0,-.45,.12,.07);
      z+=front*(noseBridge+noseTip+cheeks+brows-eyeSockets+philtrum-mouthGroove+chin);

      positions.push(x,y,z);
      uvs.push(u,1-row/phiSegments);
    }
  }

  for(let row=0;row<phiSegments;row++){
    for(let column=0;column<thetaSegments;column++){
      const a=row*columns+column;
      const b=a+columns;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createHeroStatue(){
  const statue=new THREE.Group();
  const extraMaterials=[];
  statue.userData.extraMaterials=extraMaterials;

  const addMesh=(geometry,position,scale,material=heroStoneMaterial)=>{
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set(...position);
    if(scale)mesh.scale.set(...scale);
    mesh.castShadow=false;
    mesh.receiveShadow=false;
    statue.add(mesh);
    return mesh;
  };
  const addSphere=(position,scale,material=heroStoneMaterial)=>
    addMesh(new THREE.SphereGeometry(1,48,32),position,scale,material);
  const addTube=(points,radius,material=heroStoneMaterial)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));
    return addMesh(new THREE.TubeGeometry(curve,48,radius,8,false),[0,0,0],null,material);
  };
  const addLimb=(start,end,radiusStart,radiusEnd=radiusStart)=>{
    const from=new THREE.Vector3(...start);
    const to=new THREE.Vector3(...end);
    const direction=to.clone().sub(from);
    const mesh=addMesh(
      new THREE.CylinderGeometry(radiusEnd,radiusStart,direction.length(),16,1),
      from.clone().add(to).multiplyScalar(.5).toArray(),null
    );
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    return mesh;
  };

  // Tiered plinth and draped robe form a compact Statue of Liberty silhouette.
  addMesh(new THREE.CylinderGeometry(.55,.62,.18,8,1),[0,-1.62,0]);
  addMesh(new THREE.CylinderGeometry(.43,.50,.12,8,1),[0,-1.47,0]);
  const robeProfile=[
    new THREE.Vector2(.38,-1.40),new THREE.Vector2(.46,-1.31),new THREE.Vector2(.48,-1.00),
    new THREE.Vector2(.39,-.65),new THREE.Vector2(.31,-.28),new THREE.Vector2(.34,.08),
    new THREE.Vector2(.43,.36),new THREE.Vector2(.39,.52),new THREE.Vector2(.22,.64)
  ];
  addMesh(new THREE.LatheGeometry(robeProfile,72),[0,0,0],[1,1,.78]);

  // Fold lines on the front keep the fallback readable while the scan loads.
  for(const side of [-1,1]){
    for(let fold=0;fold<3;fold++){
      const x=side*(.10+fold*.10);
      addTube([
        [x*.54,.48,.25],[x*.72,.16,.31],[x*.9,-.22,.32],
        [x,-.73,.36],[x*1.12,-1.29,.37]
      ],.012);
    }
  }
  addMesh(new THREE.CylinderGeometry(.16,.20,.25,32,1),[0,.67,0]);
  addSphere([0,1.05,.015],[.28,.37,.245]);
  addSphere([0,1.32,-.035],[.31,.15,.27]);
  addSphere([-.24,1.02,-.015],[.105,.31,.20]);
  addSphere([.24,1.02,-.015],[.105,.31,.20]);
  addSphere([0,1.08,.25],[.045,.075,.05]);

  // Seven crown rays and a raised torch establish the familiar silhouette.
  for(let ray=0;ray<7;ray++){
    const spread=(ray-3)/3;
    const spike=addMesh(new THREE.CylinderGeometry(.006,.032,.32,8,1),[spread*.22,1.47,.01]);
    spike.rotation.z=-spread*.62;
  }
  addLimb([-.34,.48,0],[-.56,.77,.01],.14,.11);
  addLimb([-.56,.77,.01],[-.68,1.11,.025],.105,.075);
  addLimb([-.68,1.11,.025],[-.69,1.30,.035],.075,.052);
  addMesh(new THREE.CylinderGeometry(.055,.07,.40,20,1),[-.69,1.48,.035]);
  addSphere([-.69,1.71,.035],[.12,.18,.10]);
  addMesh(new THREE.ConeGeometry(.105,.28,16),[-.69,1.89,.035]);

  // The other arm rests against a tablet held at the side of the robe.
  addLimb([.32,.38,0],[.50,.11,.22],.13,.09);
  addLimb([.50,.11,.22],[.46,-.10,.30],.09,.065);
  const tablet=addMesh(new THREE.BoxGeometry(.32,.48,.075),[.48,-.20,.31]);
  tablet.rotation.z=-.12;
  tablet.rotation.x=-.12;

  return statue;
}

function applyBlackStoneFinish(root){
  root.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry.deleteAttribute('normal');
    object.geometry.computeVertexNormals();
    const old=object.material;
    object.material=heroStoneMaterial;
    (Array.isArray(old)?old:[old]).forEach(m=>m?.dispose());
    object.castShadow=true;
    object.receiveShadow=true;
  });
}

function reportLoad(fraction){
  const pct=Math.round(clamp(fraction)*100);
  const label=document.getElementById('loaderPct');
  const barEl=document.getElementById('loaderBar');
  if(label)label.textContent=String(pct).padStart(2,'0');
  if(barEl)barEl.style.transform=`scaleX(${clamp(fraction)})`;
}

let loaderFinished=false;
function finishLoading(){
  if(loaderFinished)return;
  loaderFinished=true;
  reportLoad(1);
  setTimeout(()=>{
    document.getElementById('loader')?.classList.add('is-done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  },450);
}

function loadRealHeroStatue(){
  const statueLoader=new GLTFLoader();
  statueLoader.load(new URL('./assets/statue-of-liberty.glb',import.meta.url).href,gltf=>{
    const model=gltf.scene;
    applyBlackStoneFinish(model);
    model.updateMatrixWorld(true);

    const bounds=new THREE.Box3().setFromObject(model);
    const size=bounds.getSize(new THREE.Vector3());
    const center=bounds.getCenter(new THREE.Vector3());
    if(size.y<=0){finishLoading();return;}

    heroStoneMaterial.userData.noiseScale.value=2.3/size.y;
    const fitScale=3.35/size.y;
    const fitted=new THREE.Group();
    fitted.add(model);
    model.scale.setScalar(fitScale);
    model.position.set(
      -center.x*fitScale,
      -1.68-bounds.min.y*fitScale,
      -center.z*fitScale
    );
    heroGroup.add(fitted);
    if(heroFallbackStatue){
      heroGroup.remove(heroFallbackStatue);
      heroFallbackStatue.traverse(object=>object.geometry?.dispose());
      heroFallbackStatue=null;
    }
    finishLoading();
  },event=>{
    const total=event.total||5.2e6;
    reportLoad(Math.min(.98,event.loaded/total));
  },error=>{
    console.warn('Statue model could not be loaded; keeping the built-in silhouette.',error);
    finishLoading();
  });
}

function setupHeroSculpture(){
  if(!heroCanvas||!heroSculpture){finishLoading();return;}
  try{
    heroRenderer=new THREE.WebGLRenderer({
      canvas:heroCanvas,
      alpha:true,
      antialias:true,
      powerPreference:'high-performance',
      stencil:false,
      depth:true
    });
    heroRenderer.outputColorSpace=THREE.SRGBColorSpace;
    heroRenderer.toneMapping=THREE.ACESFilmicToneMapping;
    heroRenderer.toneMappingExposure=1;
    heroRenderer.shadowMap.enabled=true;
    heroRenderer.shadowMap.type=THREE.PCFSoftShadowMap;
    heroRenderer.setClearColor(0x000000,0);

    heroScene=new THREE.Scene();
    heroEnvironment=createHeroEnvironment(heroRenderer);
    heroScene.environment=heroEnvironment;
    heroCamera=new THREE.PerspectiveCamera(34,1,.1,40);
    heroCamera.position.set(0,.05,7.45);
    heroCamera.lookAt(0,0,0);
    heroGroup=new THREE.Group();
    heroScene.add(heroGroup);

    heroScene.add(new THREE.HemisphereLight(0xdfe6ee,0x050506,.35));
    heroKeyLight=new THREE.DirectionalLight(0xfff4e6,3);
    heroKeyLight.position.set(-3.8,4.2,4.8);
    heroKeyLight.castShadow=true;
    heroKeyLight.shadow.mapSize.set(2048,2048);
    Object.assign(heroKeyLight.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:1,far:16});
    heroKeyLight.shadow.bias=-.0004;
    heroKeyLight.shadow.normalBias=.03;
    heroKeyLight.shadow.radius=3;
    heroFillLight=new THREE.DirectionalLight(0x9fb4cc,.2);
    heroFillLight.position.set(4,-1,-3.5);
    heroRimLight=new THREE.DirectionalLight(0xe9f1ff,2.2);
    heroRimLight.position.set(1.4,2.3,-4.5);
    heroScene.add(heroKeyLight,heroFillLight,heroRimLight);


    heroStoneMaterial=createStoneMaterial();
    heroFallbackStatue=createHeroStatue();
    heroGroup.add(heroFallbackStatue);
    loadRealHeroStatue();
    updateHeroLighting(0);
  }catch(error){
    console.warn('Hero WebGL unavailable',error);
    heroRenderer?.dispose();
    heroRenderer=null;
    heroSculpture.hidden=true;
    document.body.classList.add('hero-webgl-unavailable');
    finishLoading();
  }
}

document.body.classList.add('is-loading');
setTimeout(finishLoading,15000);
setupHeroSculpture();

function dip(a){
  const d=(a-MID)/DIP_S;
  return DIP_A*Math.exp(-d*d);
}

function hPos(a,out=new THREE.Vector3()){
  out.set(
    R*Math.cos(a),
    Y_START+a*pitchPerRad-dip(a),
    R*Math.sin(a)
  );
  return out;
}

const _a=new THREE.Vector3(),_b=new THREE.Vector3();
function tangent(a,out=new THREE.Vector3()){
  const e=.0015;
  hPos(a-e,_a);
  hPos(a+e,_b);
  out.copy(_b).sub(_a).normalize();
  return out;
}

function upVector(a,tan,out=new THREE.Vector3()){
  const radial=new THREE.Vector3(Math.cos(a),0,Math.sin(a)).normalize();
  out.set(0,1,0);
  out.lerp(radial,.07);
  out.addScaledVector(tan,-out.dot(tan)).normalize();
  return out;
}

function getTextureDimensions(tex){
  const image=tex.image;
  return {
    width:image?.naturalWidth || image?.videoWidth || image?.width || 1,
    height:image?.naturalHeight || image?.videoHeight || image?.height || 1
  };
}

function updateCoverCrop(material,tex,targetAspect,contain=false){
  const {width,height}=getTextureDimensions(tex);
  const imageAspect=width/height;
  const coverScale=material.uniforms.coverScale.value;

  if(contain){
    if(imageAspect>targetAspect)coverScale.set(1,imageAspect/targetAspect);
    else coverScale.set(targetAspect/imageAspect,1);
    return;
  }

  if(imageAspect>targetAspect){
    coverScale.set(targetAspect/imageAspect,1);
  }else{
    coverScale.set(1,imageAspect/targetAspect);
  }
}

function buildCardMaterial(tex){
  return new THREE.ShaderMaterial({
    uniforms:{
      map:{value:tex},
      opacity:{value:1.0},
      coverScale:{value:new THREE.Vector2(1,1)}
    },
    transparent:true,
    side:THREE.DoubleSide,
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader:`
      uniform sampler2D map;
      uniform float opacity;
      uniform vec2 coverScale;
      varying vec2 vUv;
      void main(){
        vec2 uv=(vUv-0.5)*coverScale+0.5;
        if(!gl_FrontFacing){
          uv.x=1.0-uv.x;
        }
        if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){
          gl_FragColor=vec4(0.0);
          return;
        }
        vec4 c=texture2D(map,uv);
        gl_FragColor=vec4(c.rgb,c.a*opacity);
      }
    `
  });
}

function loadCardTexture(url,targetAspect,onMaterialReady,contain=false){
  const tex=loader.load(url,loadedTexture=>{
    updateCoverCrop(onMaterialReady(),loadedTexture,targetAspect,contain);
  });
  tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

function fetchCardModel(modelInfo){
  if(modelAssetCache.has(modelInfo.card))return Promise.resolve(modelAssetCache.get(modelInfo.card));
  if(modelAssetRequests.has(modelInfo.card))return modelAssetRequests.get(modelInfo.card);
  const request=new Promise((resolve,reject)=>{
    new GLTFLoader().load(modelInfo.src,gltf=>{
      modelAssetCache.set(modelInfo.card,gltf);
      resolve(gltf);
    },undefined,reject);
  }).catch(error=>{
    modelAssetRequests.delete(modelInfo.card);
    throw error;
  });
  modelAssetRequests.set(modelInfo.card,request);
  return request;
}

function attachCardModel(cardMesh,modelInfo,gltf){
  if(cardMesh.userData.modelContainer)return;
  const model=gltf.scene.clone(true);
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  if(!size.x||!size.y||!size.z)return;

  const fit=Math.min(1.58/size.x,1.30/size.y);
  const container=new THREE.Group();
  container.position.set(0,0,.24);
  container.userData.attribution=modelInfo.attribution;
  model.scale.setScalar(fit);
  model.position.set(-center.x*fit,-center.y*fit,-center.z*fit);
  model.traverse(object=>{
    if(!object.isMesh)return;
    object.castShadow=false;
    object.receiveShadow=false;
    object.renderOrder=7;
    object.material=Array.isArray(object.material)
      ? object.material.map(material=>{
          const instance=material.clone();
          instance.transparent=true;
          instance.depthWrite=false;
          return instance;
        })
      : object.material.clone();
    if(!Array.isArray(object.material)){
      object.material.transparent=true;
      object.material.depthWrite=false;
    }
  });
  applyModelFinish(model,modelInfo.finish);
  container.add(model);
  container.userData.materials=[];
  model.traverse(object=>{
    if(object.isMesh){
      const materials=Array.isArray(object.material)?object.material:[object.material];
      container.userData.materials.push(...materials);
    }
  });
  container.visible=false;
  cardMesh.add(container);
  cardMesh.userData.modelContainer=container;
}

function loadCardModel(cardNumber){
  const cardMesh=gridCards.find(mesh=>mesh.userData.cardNumber===cardNumber);
  const modelInfo=CARD_MODELS.find(model=>model.card===cardNumber);
  if(!cardMesh||!modelInfo||cardMesh.userData.modelContainer||cardMesh.userData.modelLoading)return;
  cardMesh.userData.modelLoading=true;
  fetchCardModel(modelInfo).then(gltf=>attachCardModel(cardMesh,modelInfo,gltf))
    .catch(error=>console.warn(`Card ${cardNumber} model could not be loaded.`,error))
    .finally(()=>{cardMesh.userData.modelLoading=false;});
}

const outlineUpperMaterial=new THREE.LineBasicMaterial({
  color:0xe8e8e6,
  transparent:true,
  opacity:0.6,
  depthWrite:false,
  depthTest:true
});

const outlineLowerMaterial=new THREE.LineBasicMaterial({
  color:0xe8e8e6,
  transparent:true,
  opacity:0.6,
  depthWrite:false,
  depthTest:false
});

function applyModelFinish(model,finish){
  if(finish!=='black'&&finish!=='gray')return;
  model.traverse(object=>{
    if(!object.isMesh)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      material.color?.set(finish==='gray'?0x858585:0x383838);
      if('metalness' in material)material.metalness=finish==='gray'?.08:.16;
      if('roughness' in material)material.roughness=finish==='gray'?.52:.34;
      material.needsUpdate=true;
    });
  });
}

const outlineUpper=new THREE.Line(new THREE.BufferGeometry(),outlineUpperMaterial);
const outlineLower=new THREE.Line(new THREE.BufferGeometry(),outlineLowerMaterial);
outlineUpper.frustumCulled=false;
outlineLower.frustumCulled=false;
outlineUpper.renderOrder=1;
outlineLower.renderOrder=10;
outlineGroup.add(outlineUpper,outlineLower);

for(let i=0;i<COUNT;i++){
  const cardNumber=COUNT-i;
  let material;
  const tex=loadCardTexture(
    SCROLL_CARD_ASSETS[cardNumber-1],
    HELIX_CARD_W/HELIX_CARD_H,
    ()=>material,
    cardNumber<=6
  );
  material=buildCardMaterial(tex);

  const mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(HELIX_CARD_W,HELIX_CARD_H,W_SEGS,1),
    material
  );
  mesh.frustumCulled=false;
  mesh.renderOrder=2;
  cards.push(mesh);
  rig.add(mesh);
}

for(let i=0;i<GRID_ORDER.length;i++){
  const asset=GRID_ORDER[i];
  let material;
  const tex=loadCardTexture(
    CARD_ASSETS[asset-1],
    GRID_CARD_W/GRID_CARD_H,
    ()=>material
  );
  material=buildCardMaterial(tex);

  const geo=new THREE.PlaneGeometry(GRID_CARD_W,GRID_CARD_H,W_SEGS,GRID_H_SEGS);
  const mesh=new THREE.Mesh(geo,material);
  mesh.frustumCulled=false;
  mesh.renderOrder=6;
  mesh.userData.base=Float32Array.from(geo.attributes.position.array);
  mesh.userData.slot=i;
  mesh.userData.cardNumber=asset;
  gridCards.push(mesh);
  scene.add(mesh);
}

let viewerRenderer=null;
let viewerScene=null;
let viewerCamera=null;
let viewerModel=null;
let viewerFrame=0;
let viewerSession=0;
let viewerPointer=null;
function resizeStatueViewer(){
  if(!viewerRenderer||!viewerCamera)return;
  viewerCamera.aspect=innerWidth/innerHeight;
  viewerCamera.updateProjectionMatrix();
  viewerRenderer.setSize(innerWidth,innerHeight,false);
}
function closeStatueViewer(){
  if(!statueViewer?.classList.contains('is-open'))return;
  viewerSession++;
  viewerPointer=null;
  cancelAnimationFrame(viewerFrame);
  statueViewer.classList.remove('is-open');
  statueViewer.setAttribute('aria-hidden','true');
  document.body.classList.remove('is-viewer-open');
  window.removeEventListener('resize',resizeStatueViewer);
  if(viewerRenderer){
    viewerRenderer.dispose();
    viewerRenderer=null;
  }
  if(viewerModel){
    viewerModel.traverse(object=>{
      if(!object.isMesh)return;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      materials.forEach(material=>material.dispose());
    });
    viewerModel=null;
  }
  viewerScene=null;
}
function openStatueViewer(cardNumber){
  if(!statueViewer||!statueViewerCanvas||statueViewer.classList.contains('is-open'))return;
  const modelInfo=CARD_MODELS.find(item=>item.card===cardNumber);
  if(!modelInfo)return;
  const session=++viewerSession;
  statueViewer.classList.add('is-open');
  statueViewer.setAttribute('aria-hidden','false');
  statueViewerKicker.textContent=`SELECTED WORK · ${String(cardNumber).padStart(2,'0')}`;
  statueViewerTitle.textContent=modelInfo.title;
  statueViewer.setAttribute('aria-label',`${modelInfo.title} 3D viewer`);
  statueViewerCanvas.setAttribute('aria-label',`Interactive 3D view of ${modelInfo.title}`);
  statueViewerSource.href=modelInfo.source;
  statueViewerSource.textContent=`“${modelInfo.title}” by ${modelInfo.creator}`;
  statueViewerLicense.href=modelInfo.licenseUrl;
  statueViewerLicense.textContent=modelInfo.license;
  document.body.classList.add('is-viewer-open');
  try{
    viewerRenderer=new THREE.WebGLRenderer({canvas:statueViewerCanvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    viewerRenderer.outputColorSpace=THREE.SRGBColorSpace;
    viewerRenderer.toneMapping=THREE.ACESFilmicToneMapping;
    viewerRenderer.toneMappingExposure=1.15;
    viewerRenderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    viewerRenderer.setSize(innerWidth,innerHeight,false);
    viewerScene=new THREE.Scene();
    viewerScene.add(new THREE.HemisphereLight(0xf4f4f4,0x29262a,2.2));
    const key=new THREE.DirectionalLight(0xfff4e6,3.6);
    key.position.set(-3,4,5);
    viewerScene.add(key);
    const rim=new THREE.DirectionalLight(0xd7e4ff,2.5);
    rim.position.set(3,1,-4);
    viewerScene.add(rim);
    viewerCamera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
    viewerCamera.position.set(0,0,7.3);
    viewerCamera.lookAt(0,0,0);
    window.addEventListener('resize',resizeStatueViewer);
    statueViewerClose?.focus({preventScroll:true});
    const viewerSpinSpeed=.12;
    let lastViewerFrame=0;
    const renderViewer=(timestamp=0)=>{
      if(!viewerRenderer||!viewerScene)return;
      const delta=lastViewerFrame?Math.min(.05,(timestamp-lastViewerFrame)/1000):0;
      lastViewerFrame=timestamp;
      if(viewerModel&&!viewerPointer)viewerModel.rotation.y+=viewerSpinSpeed*delta;
      viewerRenderer.render(viewerScene,viewerCamera);
      viewerFrame=requestAnimationFrame(renderViewer);
    };
    fetchCardModel(modelInfo).then(gltf=>{
      if(session!==viewerSession)return;
      const modelScene=gltf.scene.clone(true);
      modelScene.traverse(object=>{
        if(!object.isMesh)return;
        object.material=Array.isArray(object.material)
          ? object.material.map(material=>material.clone())
          : object.material.clone();
      });
      applyModelFinish(modelScene,modelInfo.finish);
      modelScene.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(modelScene);
      const size=bounds.getSize(new THREE.Vector3());
      const center=bounds.getCenter(new THREE.Vector3());
      const fit=3.15/size.y;
      const centeredModel=new THREE.Group();
      centeredModel.scale.setScalar(fit);
      centeredModel.position.set(-center.x*fit,-center.y*fit,-center.z*fit);
      centeredModel.add(modelScene);
      viewerModel=new THREE.Group();
      viewerModel.add(centeredModel);
      viewerScene.add(viewerModel);
      renderViewer();
    }).catch(error=>console.warn(`${modelInfo.title} viewer could not load the model.`,error));
  }catch(error){
    console.warn('Snake Statue viewer could not start.',error);
  }
}
statueViewerClose?.addEventListener('click',closeStatueViewer);
statueViewer?.addEventListener('click',event=>{
  if(event.target===statueViewer)closeStatueViewer();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeStatueViewer();
});
statueViewerCanvas?.addEventListener('pointerdown',event=>{
  viewerPointer={x:event.clientX,y:event.clientY,id:event.pointerId};
  statueViewerCanvas.setPointerCapture(event.pointerId);
});
statueViewerCanvas?.addEventListener('pointermove',event=>{
  if(!viewerPointer||!viewerModel||viewerPointer.id!==event.pointerId)return;
  const dx=event.clientX-viewerPointer.x;
  const dy=event.clientY-viewerPointer.y;
  viewerModel.rotation.y+=dx*.009;
  viewerModel.rotation.x=Math.max(-1.25,Math.min(1.25,viewerModel.rotation.x+dy*.009));
  viewerPointer.x=event.clientX;
  viewerPointer.y=event.clientY;
});
const endViewerDrag=()=>{viewerPointer=null;};
statueViewerCanvas?.addEventListener('pointerup',endViewerDrag);
statueViewerCanvas?.addEventListener('pointercancel',endViewerDrag);
statueViewerCanvas?.addEventListener('wheel',event=>{
  if(!viewerCamera)return;
  event.preventDefault();
  viewerCamera.position.z=Math.max(4.2,Math.min(12,viewerCamera.position.z+event.deltaY*.006));
},{passive:false});
let cardPress=null;
canvas.addEventListener('pointerdown',event=>{cardPress={x:event.clientX,y:event.clientY};});
canvas.addEventListener('pointerup',event=>{
  if(!cardPress||Math.hypot(event.clientX-cardPress.x,event.clientY-cardPress.y)>6){cardPress=null;return;}
  cardPress=null;
  if(current<.72)return;
  const rect=canvas.getBoundingClientRect();
  const pointer=new THREE.Vector2(
    ((event.clientX-rect.left)/rect.width)*2-1,
    -((event.clientY-rect.top)/rect.height)*2+1
  );
  const raycaster=new THREE.Raycaster();
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(gridCards,false).find(({object})=>
    CARD_MODELS.some(model=>model.card===object.userData.cardNumber)&&object.material.uniforms.opacity.value>.8
  );
  if(hit)openStatueViewer(hit.object.userData.cardNumber);
});

function updateGridLayout(){
  if(innerWidth>=GRID_DESKTOP_BREAKPOINT){
    gridLayoutScale=1;
    GRID_TARGETS.forEach((target,index)=>target.copy(DESKTOP_GRID_TARGETS[index]));
    return;
  }

  const columns=innerWidth<=GRID_MOBILE_BREAKPOINT?1:2;
  const rows=Math.ceil(GRID_TARGETS.length/columns);
  const gapX=columns===1?0:.18;
  const gapY=columns===1?.12:.18;
  const baseWidth=columns*GRID_CARD_W+(columns-1)*gapX;
  const baseHeight=rows*GRID_CARD_H+(rows-1)*gapY;
  const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*camera.position.z;
  const worldWidth=worldHeight*camera.aspect;
  const maxWidth=worldWidth*.9;
  const maxHeight=worldHeight*.88;

  gridLayoutScale=Math.min(1,maxWidth/baseWidth,maxHeight/baseHeight);

  GRID_TARGETS.forEach((target,index)=>{
    const column=index%columns;
    const row=Math.floor(index/columns);
    const x=(column-(columns-1)*.5)*(GRID_CARD_W+gapX)*gridLayoutScale;
    const y=((rows-1)*.5-row)*(GRID_CARD_H+gapY)*gridLayoutScale;
    target.set(x,y,DESKTOP_GRID_TARGETS[index].z);
  });
}

let target=0,current=0;
let introProgress=0;
let outroProgress=0;
function readScroll(){
  const r=track.getBoundingClientRect();
  target=clamp(-r.top/(track.offsetHeight-innerHeight));
  // Card 06 has a larger model; begin fetching it well before its staggered
  // grid entrance so it is ready to travel with the card.
  if(target>.46)loadCardModel(6);

  const ir=introTrack.getBoundingClientRect();
  const heroRect=introStage.getBoundingClientRect();

  introProgress=prefersReducedMotion
    ? 0
    : clamp(-ir.top/(introTrack.offsetHeight-innerHeight));
  heroVisible=heroRect.bottom>0&&heroRect.top<innerHeight;
  updateHeroLighting(introProgress);

  const or=outro.getBoundingClientRect();
  /*
    Footer reverse-blend:
    begin once the footer starts entering the viewport and complete
    through most of its first viewport of travel.
  */
  outroProgress=clamp((innerHeight-or.top)/(innerHeight*0.92));
}

function wrapCardOnHelix(mesh,sArcStart){
  const pos=mesh.geometry.attributes.position;
  const cols=W_SEGS+1;

  for(let row=0;row<2;row++){
    const hOff=(row===0?-0.5:0.5)*HELIX_CARD_H;

    for(let col=0;col<cols;col++){
      const u=col/W_SEGS;
      const arc=sArcStart+u*CARD_ARC_WIDTH;
      const a=arc/dsPerRad;

      const cp=hPos(a,new THREE.Vector3());
      const tan=tangent(a,new THREE.Vector3());
      const up=upVector(a,tan,new THREE.Vector3());
      const p=cp.clone().addScaledVector(up,hOff);

      const actualRow=row===0?1:0;
      const idx=actualRow*cols+col;
      pos.setXYZ(idx,p.x,p.y,p.z);
    }
  }

  pos.needsUpdate=true;
  mesh.geometry.computeBoundingSphere();
}

function updateOutline(line,centerArc,arcLength,heightOffset,opacity){
  const points=[];
  const arcStart=centerArc-arcLength*0.5;
  const arcEnd=centerArc+arcLength*0.5;

  for(let i=0;i<OUTLINE_SAMPLES;i++){
    const u=i/(OUTLINE_SAMPLES-1);
    const arc=arcStart+(arcEnd-arcStart)*u;
    const a=arc/dsPerRad;

    const cp=hPos(a,new THREE.Vector3());
    const tan=tangent(a,new THREE.Vector3());
    const up=upVector(a,tan,new THREE.Vector3());
    const p=cp.clone().addScaledVector(up,heightOffset);
    points.push(p);
  }

  line.geometry.setFromPoints(points);
  line.material.opacity=opacity;
}

function updateGridCard(mesh,moveT,settleT,time){
  const posAttr=mesh.geometry.attributes.position;
  const base=mesh.userData.base;
  const windBase=1-settleT;
  const waveAmp=prefersReducedMotion?0:(0.05 + 0.25*(1-moveT))*Math.pow(windBase,0.88);

  for(let i=0;i<posAttr.count;i++){
    const ix=i*3;
    const x=base[ix];
    const y=base[ix+1];

    const rip1=Math.sin(x*2.25 + time*2.5 + mesh.userData.slot*.55);
    const rip2=Math.sin(y*6.4 + time*3.35 + mesh.userData.slot*.31);
    const rip3=Math.cos((x+y)*1.95 + time*2.05 + mesh.userData.slot*.77);

    const dx=(rip2*0.05 + rip3*0.02)*waveAmp;
    const dz=(rip1*0.82 + rip2*0.42 + rip3*0.52)*waveAmp;

    posAttr.setXYZ(i,x+dx,y,dz);
  }
  posAttr.needsUpdate=true;
  mesh.geometry.computeBoundingSphere();

  const slot=mesh.userData.slot;
  const p0=GRID_ENTRANCES[slot];
  const p1=GRID_TARGETS[slot];
  mesh.position.lerpVectors(p0,p1,moveT);

  const drift=prefersReducedMotion?0:(0.025 + 0.095*(1-moveT))*windBase;
  mesh.position.x += Math.sin(time*3.0+slot*.85)*drift;
  mesh.position.y += Math.cos(time*3.35+slot*.55)*drift*1.22;
  mesh.position.z += Math.sin(time*2.45+slot)*drift*0.75;

  const r0=GRID_START_ROT[slot];
  const idleMotion=prefersReducedMotion?0:1;
  mesh.rotation.x=lerp(r0.x,0,moveT) + Math.sin(time*3.55+slot)*0.04*windBase*idleMotion;
  mesh.rotation.y=lerp(r0.y,0,moveT) + Math.cos(time*2.95+slot*.7)*0.05*windBase*idleMotion;
  mesh.rotation.z=lerp(r0.z,0,moveT) + Math.sin(time*3.8+slot*.9)*0.035*windBase*idleMotion;

  const sc=lerp(.95,1,moveT)*gridLayoutScale;
  mesh.scale.set(sc,sc,sc);
  mesh.material.uniforms.opacity.value=clamp(moveT*1.7);
  if(mesh.userData.modelContainer){
    const modelOpacity=clamp(moveT*1.7);
    const modelContainer=mesh.userData.modelContainer;
    modelContainer.visible=modelOpacity>.01;
    modelContainer.userData.materials.forEach(material=>{
      material.opacity=modelOpacity;
    });
  }
  if(moveT>.35&&CARD_MODELS.some(model=>model.card===mesh.userData.cardNumber)){
    loadCardModel(mesh.userData.cardNumber);
  }
}

/* ---------- interface: nav, rail, captions, cursor ---------- */
const navIdx=document.getElementById('navIdx');
const navLabel=document.getElementById('navLabel');
const navPct=document.getElementById('navPct');
const hudLeft=document.getElementById('hudLeft');
const hudCount=document.getElementById('hudCount');
const railDots=[...document.querySelectorAll('.rail-dot')];
const introBlock=document.getElementById('introBlock');
const captionEls=[...document.querySelectorAll('#heroCaptions p')];
const CAPTION_RANGES=[[.2,.4],[.46,.68],[.76,.96]];
const SECTIONS=['Introduction','Selected work','Index','Contact'];
let activeSection=-1;

function scrollToSection(i){
  const trackScrollable=track.offsetHeight-innerHeight;
  const y=[
    0,
    track.offsetTop,
    track.offsetTop+trackScrollable*.82,
    outro.offsetTop
  ][i]??0;
  scrollTo({top:y,behavior:prefersReducedMotion?'auto':'smooth'});
}
document.querySelectorAll('[data-go]').forEach(el=>{
  el.addEventListener('click',event=>{
    event.preventDefault();
    scrollToSection(Number(el.dataset.go));
  });
});

function updateInterface(trackProgress,helixProgress){
  const docMax=document.documentElement.scrollHeight-innerHeight;
  const overall=docMax>0?clamp(scrollY/docMax):0;
  navPct.textContent=String(Math.round(overall*100)).padStart(3,'0');

  let section=0;
  if(outroProgress>.35)section=3;
  else if(track.getBoundingClientRect().top<=innerHeight*.5)section=trackProgress>.7?2:1;
  if(section!==activeSection){
    activeSection=section;
    navIdx.textContent=String(section+1).padStart(2,'0');
    navLabel.textContent=SECTIONS[section];
    railDots.forEach((dot,i)=>dot.classList.toggle('is-active',i===section));
  }
  hudLeft.textContent=trackProgress>.7?'03 \u2014 Index':'02 \u2014 Selected work';
  hudCount.textContent=`${String(Math.min(COUNT,1+Math.floor(helixProgress*COUNT*.999))).padStart(2,'0')} / ${String(COUNT).padStart(2,'0')}`;

  // hero copy fades out as the scroll story begins; captions take over
  const fade=clamp(introProgress/.14);
  introBlock.style.opacity=String(1-fade);
  introBlock.style.transform=`translateY(calc(-50% - ${fade*6}vh))`;
  introBlock.style.pointerEvents=fade>.6?'none':'auto';
  captionEls.forEach((el,i)=>{
    const [from,to]=CAPTION_RANGES[i];
    const inT=smoother(clamp((introProgress-from)/.06));
    const outT=smoother(clamp((introProgress-(to-.06))/.06));
    el.style.opacity=String(inT*(1-outT));
    el.style.transform=`translateY(${(1-inT)*22-outT*18}px)`;
  });
}

const cursorEl=document.getElementById('cursor');
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&cursorEl){
  const ring=cursorEl.querySelector('.cursor-ring');
  const dot=cursorEl.querySelector('.cursor-dot');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('pointermove',e=>{
    mx=e.clientX;my=e.clientY;
    cursorEl.classList.add('is-on');
    document.documentElement.classList.add('has-cursor');
    dot.style.transform=`translate3d(${mx}px,${my}px,0)`;
    cursorEl.classList.toggle('is-hover',!!e.target.closest?.('a,button'));
  },{passive:true});
  document.addEventListener('pointerleave',()=>cursorEl.classList.remove('is-on'));
  const follow=()=>{
    rx+=(mx-rx)*.16;ry+=(my-ry)*.16;
    ring.style.transform=`translate3d(${rx}px,${ry}px,0)${cursorEl.classList.contains('is-hover')?' scale(1.7)':''}`;
    requestAnimationFrame(follow);
  };
  follow();
}

function resize(){
  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.7));
    renderer.setSize(innerWidth,innerHeight,false);
  }
  if(heroRenderer&&heroSculpture){
    const width=Math.max(1,heroSculpture.clientWidth);
    const height=Math.max(1,heroSculpture.clientHeight);
    heroRenderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.15:1.5));
    heroRenderer.setSize(width,height,false);
    heroCamera.aspect=width/height;
    heroCamera.updateProjectionMatrix();
  }
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z=innerWidth<800?11.8:9.25;
  updateGridLayout();
}

function animate(tms=0){
  const time=tms*0.001;
  current=prefersReducedMotion?target:current+(target-current)*.105;

  const hp=clamp((current-HELIX_START)/(HELIX_END-HELIX_START));
  const scrollArc=hp*TRAVEL_ARC;

  rig.position.set(0,0,0);

  const stackRaw=clamp((current-STACK_START)/(STACK_END-STACK_START));
  const stackT=smoother(stackRaw);
  const helixFade=1-smooth(clamp((current-(STACK_START+.12))/((STACK_END-.04)-(STACK_START+.12))));

  cards.forEach((mesh,i)=>{
    const sArcStart=BASE_ARC+i*STEP_ARC+scrollArc;
    wrapCardOnHelix(mesh,sArcStart);

    const centerA=(sArcStart+CARD_ARC_WIDTH*.5)/dsPerRad;
    const c=hPos(centerA,new THREE.Vector3());
    const worldY=c.y+rig.position.y;

    const fadeTop=8.15;
    const fadeBottom=-7.9;
    const edge=Math.min(worldY-fadeBottom,fadeTop-worldY);
    const baseOpacity=clamp(edge/.85);
    mesh.material.uniforms.opacity.value=baseOpacity*helixFade;
  });

  const bandMidOffset=((COUNT-1)*STEP_ARC + CARD_ARC_WIDTH)*0.5;
  const bandStartCenter=BASE_ARC + bandMidOffset;

  let lineProgress;
  if(current<=HELIX_MID){
    lineProgress=0.5*clamp(current/HELIX_MID);
  }else{
    lineProgress=0.5+0.5*clamp((current-HELIX_MID)/(HELIX_END-HELIX_MID));
  }

  const OUTLINE_PHASE_ARC=Math.PI*dsPerRad;
  const outlineCenterArc=
    bandStartCenter +
    (1.0-lineProgress)*TRAVEL_ARC -
    OUTLINE_PHASE_ARC;

  const outlineArcLength=STEP_ARC*2.5;
  const outlineOffset=HELIX_CARD_H*0.72;
  const outlineShowIn=clamp(lineProgress/0.035);
  const outlineShowOut=clamp((1-lineProgress)/0.08);
  const outlineFade=1-smooth(clamp((current-(STACK_START+.1))/((STACK_END-.03)-(STACK_START+.1))));
  const outlineOpacity=0.58*Math.min(outlineShowIn,outlineShowOut)*outlineFade;

  updateOutline(outlineUpper,outlineCenterArc,outlineArcLength, outlineOffset, outlineOpacity);
  updateOutline(outlineLower,outlineCenterArc,outlineArcLength,-outlineOffset, outlineOpacity);

  const openT=clamp(hp/0.28);
  const openSmooth=openT*openT*(3-2*openT);
  const radialScale=0.72 + openSmooth*0.28;
  rig.scale.set(radialScale,1,radialScale);

  rig.rotation.z=THREE.MathUtils.degToRad(-1.0);
  rig.rotation.x=THREE.MathUtils.degToRad(1.5);
  rig.rotation.y=THREE.MathUtils.degToRad(-1.0);

  gridCards.forEach((mesh,idx)=>{
    const start=idx*STACK_STAGGER;
    const nextStart=idx<gridCards.length-1
      ? (idx+1)*STACK_STAGGER
      : 1.0;

    /*
      Maintain visible overlap during arrival and settling so earlier
      cards continue floating while later cards are approaching.
    */
    const entryEnd=Math.min(start+GRID_MOVE_DURATION,1.0);
    const moveT=smoother(clamp((stackRaw-start)/(entryEnd-start || 1)));

    const settleStart=idx<gridCards.length-1
      ? Math.min(nextStart+.02,.90)
      : Math.min(start+.10,.84);

    const settleEnd=idx<gridCards.length-1
      ? Math.min(settleStart+.40,.985)
      : 1.0;

    const settleT=smoother(
      clamp((stackRaw-settleStart)/(settleEnd-settleStart || 1))
    );

    updateGridCard(mesh,moveT,settleT,time);
  });

  camera.position.x=0;
  camera.position.y=0;
  camera.lookAt(0,.05,0);

  /*
    Editorial title timeline:
      1) enter and settle
      2) hold centered
      3) exit outward completely
      4) clear before the closing grid resolves

    This is intentionally independent of the stack timing.
  */
  const TITLE_ENTER_START=.055;
  const TITLE_ENTER_END=.17;
  const TITLE_HOLD_END=.565;
  const TITLE_EXIT_END=.735;

  const enterRaw=clamp((current-TITLE_ENTER_START)/(TITLE_ENTER_END-TITLE_ENTER_START));
  const enterT=smoother(enterRaw);

  const exitRaw=clamp((current-TITLE_HOLD_END)/(TITLE_EXIT_END-TITLE_HOLD_END));
  const exitT=smoother(exitRaw);

  const leftEnter=(1-enterT)*-72;
  const rightEnter=(1-enterT)*72;

  // Once the hold is over, send each title farther outward than its original entrance.
  const exitDistance=86*exitT;

  codexTitle.style.transform=`translate3d(${leftEnter-exitDistance}vw,0,0)`;
  threeTitle.style.transform=`translate3d(${rightEnter+exitDistance}vw,0,0)`;

  const titleOpacity=clamp(enterT*(1-exitT*0.35)*1.2);
  codexTitle.style.opacity=String(titleOpacity);
  threeTitle.style.opacity=String(titleOpacity);

  const shadeT=smoother(clamp(current/.035));
  transitionShade.style.opacity=String((1-shadeT)*0.18);

  // Large transition title: appear immediately, hold briefly, then fade away.
  const ttIn=smoother(clamp(current/.018));
  const ttOut=smoother(clamp((current-.04)/.07));
  const ttOpacity=clamp(ttIn*(1-ttOut));
  transitionTitle.style.opacity=String(ttOpacity);
  const ttScale=lerp(.965,1,ttIn)-ttOut*.018;
  transitionTitle.style.transform=`translate(-50%,-50%) scale(${ttScale})`;

  /* Closing section eases up into place. */
  const outroLift=prefersReducedMotion?1:smoother(clamp((outroProgress-.02)/.92));
  outroBlock.style.opacity=String(.15+.85*outroLift);
  outroBlock.style.transform=`translateY(${(1-outroLift)*6}vh)`;

  updateInterface(current,hp);

  bar.style.transform=`scaleX(${current})`;
  if(renderer)renderer.render(scene,camera);
  if(heroRenderer&&heroVisible){
    if(!prefersReducedMotion){
      pointerEaseX+=(pointerTargetX-pointerEaseX)*.055;
      pointerEaseY+=(pointerTargetY-pointerEaseY)*.055;
      heroGroup.rotation.x=-.03+pointerEaseY*.06;
      heroGroup.rotation.y=time*.11+introProgress*1.1+pointerEaseX*.35;
      heroGroup.rotation.z=0;
      heroGroup.position.y=0;
      heroGroup.scale.setScalar(1-introProgress*.04);
    }
    heroRenderer.render(heroScene,heroCamera);
  }
  requestAnimationFrame(animate);
}

addEventListener('scroll',readScroll,{passive:true});
addEventListener('resize',()=>{resize();readScroll();});
introStage.addEventListener('pointermove',event=>{
  if(prefersReducedMotion||event.pointerType==='touch')return;
  const rect=introStage.getBoundingClientRect();
  pointerTargetX=clamp(((event.clientX-rect.left)/rect.width)*2-1,-1,1);
  pointerTargetY=clamp(((event.clientY-rect.top)/rect.height)*2-1,-1,1);
});
introStage.addEventListener('pointerleave',()=>{
  pointerTargetX=0;
  pointerTargetY=0;
});
addEventListener('beforeunload',()=>{
  const geometries=new Set();
  const materials=new Set();
  const textures=new Set();
  heroGroup?.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    const objectMaterials=Array.isArray(object.material)?object.material:[object.material];
    objectMaterials.forEach(material=>{
      if(!material)return;
      materials.add(material);
      Object.values(material).forEach(value=>{
        if(value?.isTexture)textures.add(value);
      });
    });
  });
  geometries.forEach(geometry=>geometry.dispose());
  materials.forEach(material=>material.dispose());
  textures.forEach(texture=>texture.dispose());
  heroStoneMaterial?.dispose();
  heroEnvironment?.dispose();
  heroRenderer?.dispose();
});

resize();
readScroll();
animate();

