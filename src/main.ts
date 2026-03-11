import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ══════════════════════════════════════════════════════════
//  LOCALISATION
// ══════════════════════════════════════════════════════════
type Lang = 'en' | 'uk';
let lang: Lang = 'en';

const i18n = {
  en: {
    logo:'Mol Viewer', sub:'3D Structure',
    search:'Search molecules…',
    legend:'Atom Legend',
    hintRotate:'Drag — Rotate', hintZoom:'Scroll — Zoom', hintHover:'Tap atom — Info',
    cats: {
      gases:    'Noble & Diatomic Gases',
      inorg:    'Inorganic Compounds',
      acids:    'Acids & Bases',
      salts:    'Salts & Minerals',
      alkanes:  'Alkanes',
      alkenes:  'Alkenes & Alkynes',
      aromatic: 'Aromatic Compounds',
      alcohols: 'Alcohols & Ethers',
      carbonyl: 'Aldehydes & Ketones',
      carboxyl: 'Carboxylic Acids & Esters',
      nitrogen: 'Nitrogen Compounds',
      halogens: 'Halogenated Compounds',
      bio:      'Biological Molecules',
    },
  },
  uk: {
    logo:'Мол Вьювер', sub:'3D Структура',
    search:'Пошук молекул…',
    legend:'Позначення',
    hintRotate:'Перетягнути — Обертати', hintZoom:'Прокрутка — Масштаб', hintHover:'Торкнутись — Деталі',
    cats: {
      gases:    'Благородні та двоатомні гази',
      inorg:    'Неорганічні сполуки',
      acids:    'Кислоти та основи',
      salts:    'Солі та мінерали',
      alkanes:  'Алкани',
      alkenes:  'Алкени та алкіни',
      aromatic: 'Ароматичні сполуки',
      alcohols: 'Спирти та ефіри',
      carbonyl: 'Альдегіди та кетони',
      carboxyl: 'Карбонові кислоти та естери',
      nitrogen: 'Азотні сполуки',
      halogens: 'Галогеновані сполуки',
      bio:      'Біологічні молекули',
    },
  },
};

const atomLabels: Record<string,{en:string;uk:string}> = {
  H: {en:'Hydrogen',   uk:'Водень'},    C: {en:'Carbon',      uk:'Вуглець'},
  O: {en:'Oxygen',     uk:'Кисень'},    N: {en:'Nitrogen',    uk:'Азот'},
  S: {en:'Sulfur',     uk:'Сірка'},     P: {en:'Phosphorus',  uk:'Фосфор'},
  Cl:{en:'Chlorine',   uk:'Хлор'},      F: {en:'Fluorine',    uk:'Фтор'},
  Br:{en:'Bromine',    uk:'Бром'},      I: {en:'Iodine',      uk:'Йод'},
  Na:{en:'Sodium',     uk:'Натрій'},    K: {en:'Potassium',   uk:'Калій'},
  Ca:{en:'Calcium',    uk:'Кальцій'},   Fe:{en:'Iron',        uk:'Залізо'},
  Mg:{en:'Magnesium',  uk:'Магній'},    Al:{en:'Aluminum',    uk:'Алюміній'},
  Si:{en:'Silicon',    uk:'Кремній'},   Cu:{en:'Copper',      uk:'Мідь'},
  Zn:{en:'Zinc',       uk:'Цинк'},      Ne:{en:'Neon',        uk:'Неон'},
  Ar:{en:'Argon',      uk:'Аргон'},     He:{en:'Helium',      uk:'Гелій'},
};

// ══════════════════════════════════════════════════════════
//  ATOM DEFS
// ══════════════════════════════════════════════════════════
interface AtomDef {color:number;emissive:number;emissiveI:number;rough:number;metal:number;radius:number;cssColor:string;}
const ATOMS: Record<string,AtomDef> = {
  H: {color:0xddeeff,emissive:0x2266aa,emissiveI:0.25,rough:0.18,metal:0.0,radius:0.20,cssColor:'#b8d4f0'},
  C: {color:0x8ecfb8,emissive:0x1a5540,emissiveI:0.30,rough:0.22,metal:0.0,radius:0.42,cssColor:'#7eb8a4'},
  O: {color:0xe07555,emissive:0x7a1a00,emissiveI:0.40,rough:0.15,metal:0.0,radius:0.38,cssColor:'#d97b5a'},
  N: {color:0x7aa8d8,emissive:0x0d2a55,emissiveI:0.30,rough:0.20,metal:0.0,radius:0.36,cssColor:'#7a9fc2'},
  S: {color:0xe8c84a,emissive:0x5a3d00,emissiveI:0.35,rough:0.18,metal:0.0,radius:0.44,cssColor:'#d4b84a'},
  P: {color:0xe08040,emissive:0x5a1a00,emissiveI:0.35,rough:0.20,metal:0.0,radius:0.42,cssColor:'#c87040'},
  Cl:{color:0x7acc7a,emissive:0x1a4a1a,emissiveI:0.28,rough:0.22,metal:0.0,radius:0.46,cssColor:'#6ab86a'},
  F: {color:0xc8f0d8,emissive:0x0a3020,emissiveI:0.28,rough:0.20,metal:0.0,radius:0.32,cssColor:'#a8ddb8'},
  Br:{color:0xc8602a,emissive:0x501800,emissiveI:0.38,rough:0.20,metal:0.0,radius:0.48,cssColor:'#b85828'},
  I: {color:0x9060c8,emissive:0x200840,emissiveI:0.35,rough:0.22,metal:0.0,radius:0.50,cssColor:'#8858b8'},
  Na:{color:0xd8b8f8,emissive:0x301850,emissiveI:0.28,rough:0.25,metal:0.1,radius:0.52,cssColor:'#c0a0e8'},
  K: {color:0xf0d0e8,emissive:0x401030,emissiveI:0.28,rough:0.25,metal:0.1,radius:0.58,cssColor:'#e0b8d8'},
  Ca:{color:0xf0e8c0,emissive:0x403000,emissiveI:0.25,rough:0.28,metal:0.1,radius:0.54,cssColor:'#e0d8a8'},
  Fe:{color:0xa87840,emissive:0x301000,emissiveI:0.30,rough:0.30,metal:0.4,radius:0.50,cssColor:'#986830'},
  Mg:{color:0xb8e8b8,emissive:0x184018,emissiveI:0.28,rough:0.22,metal:0.1,radius:0.46,cssColor:'#a0d8a0'},
  Al:{color:0xd0d8e8,emissive:0x102030,emissiveI:0.25,rough:0.20,metal:0.3,radius:0.48,cssColor:'#c0c8d8'},
  Si:{color:0xb8a888,emissive:0x302010,emissiveI:0.25,rough:0.35,metal:0.1,radius:0.46,cssColor:'#a89878'},
  Cu:{color:0xe09858,emissive:0x502000,emissiveI:0.30,rough:0.20,metal:0.5,radius:0.48,cssColor:'#d08848'},
  Zn:{color:0xc0c8b8,emissive:0x203020,emissiveI:0.22,rough:0.28,metal:0.3,radius:0.48,cssColor:'#b0b8a8'},
  Ne:{color:0xff9999,emissive:0x880000,emissiveI:0.60,rough:0.05,metal:0.0,radius:0.34,cssColor:'#ff8888'},
  Ar:{color:0x99ccff,emissive:0x003366,emissiveI:0.55,rough:0.05,metal:0.0,radius:0.38,cssColor:'#88bbff'},
  He:{color:0xffffaa,emissive:0x666600,emissiveI:0.55,rough:0.05,metal:0.0,radius:0.28,cssColor:'#ffff88'},
};

// ══════════════════════════════════════════════════════════
//  MOLECULE DATA  — 80+ molecules in 13 categories
// ══════════════════════════════════════════════════════════
type Atom = {el:string;x:number;y:number;z:number};
type Bond = {a:number;b:number;order?:number};
type Mol  = {name:string;full:{en:string;uk:string};atoms:Atom[];bonds:Bond[]};
type Category = {id:string;mols:Mol[]};

const categories: Category[] = [
  // ── 1. Noble & Diatomic Gases
  { id:'gases', mols:[
    {name:'He',full:{en:'Helium',uk:'Гелій'},atoms:[{el:'He',x:0,y:0,z:0}],bonds:[]},
    {name:'Ne',full:{en:'Neon',uk:'Неон'},atoms:[{el:'Ne',x:0,y:0,z:0}],bonds:[]},
    {name:'Ar',full:{en:'Argon',uk:'Аргон'},atoms:[{el:'Ar',x:0,y:0,z:0}],bonds:[]},
    {name:'H₂',full:{en:'Hydrogen Gas',uk:'Молекулярний водень'},atoms:[{el:'H',x:-0.5,y:0,z:0},{el:'H',x:0.5,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'N₂',full:{en:'Nitrogen Gas',uk:'Молекулярний азот'},atoms:[{el:'N',x:-0.55,y:0,z:0},{el:'N',x:0.55,y:0,z:0}],bonds:[{a:0,b:1,order:2}]},
    {name:'O₂',full:{en:'Oxygen Gas',uk:'Молекулярний кисень'},atoms:[{el:'O',x:-0.6,y:0,z:0},{el:'O',x:0.6,y:0,z:0}],bonds:[{a:0,b:1,order:2}]},
    {name:'F₂',full:{en:'Fluorine Gas',uk:'Молекулярний фтор'},atoms:[{el:'F',x:-0.7,y:0,z:0},{el:'F',x:0.7,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'Cl₂',full:{en:'Chlorine Gas',uk:'Молекулярний хлор'},atoms:[{el:'Cl',x:-1.0,y:0,z:0},{el:'Cl',x:1.0,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'Br₂',full:{en:'Bromine',uk:'Бром'},atoms:[{el:'Br',x:-1.1,y:0,z:0},{el:'Br',x:1.1,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'I₂',full:{en:'Iodine',uk:'Йод'},atoms:[{el:'I',x:-1.3,y:0,z:0},{el:'I',x:1.3,y:0,z:0}],bonds:[{a:0,b:1}]},
  ]},

  // ── 2. Inorganic Compounds
  { id:'inorg', mols:[
    {name:'H₂O',full:{en:'Water',uk:'Вода'},atoms:[{el:'O',x:0,y:0,z:0},{el:'H',x:1,y:0.8,z:0},{el:'H',x:-1,y:0.8,z:0}],bonds:[{a:0,b:1},{a:0,b:2}]},
    {name:'H₂O₂',full:{en:'Hydrogen Peroxide',uk:'Пероксид водню'},atoms:[{el:'O',x:-0.7,y:0,z:0},{el:'O',x:0.7,y:0,z:0},{el:'H',x:-1.4,y:0.6,z:0},{el:'H',x:1.4,y:0.6,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:1,b:3}]},
    {name:'CO',full:{en:'Carbon Monoxide',uk:'Чадний газ'},atoms:[{el:'C',x:-0.6,y:0,z:0},{el:'O',x:0.6,y:0,z:0}],bonds:[{a:0,b:1,order:2}]},
    {name:'CO₂',full:{en:'Carbon Dioxide',uk:'Вуглекислий газ'},atoms:[{el:'C',x:0,y:0,z:0},{el:'O',x:1.5,y:0,z:0},{el:'O',x:-1.5,y:0,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2,order:2}]},
    {name:'NH₃',full:{en:'Ammonia',uk:'Аміак'},atoms:[{el:'N',x:0,y:0,z:0},{el:'H',x:1,y:0.5,z:0},{el:'H',x:-0.5,y:0.5,z:0.9},{el:'H',x:-0.5,y:0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3}]},
    {name:'NO',full:{en:'Nitric Oxide',uk:'Оксид азоту(II)'},atoms:[{el:'N',x:-0.55,y:0,z:0},{el:'O',x:0.55,y:0,z:0}],bonds:[{a:0,b:1,order:2}]},
    {name:'NO₂',full:{en:'Nitrogen Dioxide',uk:'Діоксид азоту'},atoms:[{el:'N',x:0,y:0,z:0},{el:'O',x:1.2,y:0.5,z:0},{el:'O',x:-1.2,y:0.5,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2}]},
    {name:'SO₂',full:{en:'Sulfur Dioxide',uk:'Сірчистий газ'},atoms:[{el:'S',x:0,y:0,z:0},{el:'O',x:1.3,y:0.6,z:0},{el:'O',x:-1.3,y:0.6,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2,order:2}]},
    {name:'SO₃',full:{en:'Sulfur Trioxide',uk:'Сірчаний ангідрид'},atoms:[{el:'S',x:0,y:0,z:0},{el:'O',x:1.4,y:0,z:0},{el:'O',x:-0.7,y:1.2,z:0},{el:'O',x:-0.7,y:-1.2,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2,order:2},{a:0,b:3,order:2}]},
    {name:'PH₃',full:{en:'Phosphine',uk:'Фосфін'},atoms:[{el:'P',x:0,y:0,z:0},{el:'H',x:1.1,y:0.4,z:0},{el:'H',x:-0.6,y:0.4,z:1.0},{el:'H',x:-0.6,y:0.4,z:-1.0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3}]},
    {name:'H₂S',full:{en:'Hydrogen Sulfide',uk:'Сірководень'},atoms:[{el:'S',x:0,y:0,z:0},{el:'H',x:1.1,y:0.8,z:0},{el:'H',x:-1.1,y:0.8,z:0}],bonds:[{a:0,b:1},{a:0,b:2}]},
    {name:'HF',full:{en:'Hydrogen Fluoride',uk:'Фтороводень'},atoms:[{el:'H',x:-0.8,y:0,z:0},{el:'F',x:0.6,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'HCl',full:{en:'Hydrochloric Acid',uk:'Хлороводень'},atoms:[{el:'H',x:-0.9,y:0,z:0},{el:'Cl',x:0.7,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'HBr',full:{en:'Hydrogen Bromide',uk:'Бромоводень'},atoms:[{el:'H',x:-0.9,y:0,z:0},{el:'Br',x:0.7,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'SiH₄',full:{en:'Silane',uk:'Силан'},atoms:[{el:'Si',x:0,y:0,z:0},{el:'H',x:1,y:1,z:1},{el:'H',x:-1,y:-1,z:1},{el:'H',x:1,y:-1,z:-1},{el:'H',x:-1,y:1,z:-1}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'MgO',full:{en:'Magnesium Oxide',uk:'Оксид магнію'},atoms:[{el:'Mg',x:-1.0,y:0,z:0},{el:'O',x:1.0,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'Al₂O₃',full:{en:'Alumina',uk:'Оксид алюмінію'},atoms:[{el:'Al',x:-1.8,y:0,z:0},{el:'Al',x:1.8,y:0,z:0},{el:'O',x:0,y:1.2,z:0},{el:'O',x:0,y:-1.2,z:0},{el:'O',x:0,y:0,z:0}],bonds:[{a:0,b:2},{a:0,b:3},{a:0,b:4},{a:1,b:2},{a:1,b:3},{a:1,b:4}]},
    {name:'SiO₂',full:{en:'Silicon Dioxide',uk:'Діоксид кремнію'},atoms:[{el:'Si',x:0,y:0,z:0},{el:'O',x:1.6,y:0,z:0},{el:'O',x:-1.6,y:0,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2,order:2}]},
  ]},

  // ── 3. Acids & Bases
  { id:'acids', mols:[
    {name:'HNO₃',full:{en:'Nitric Acid',uk:'Азотна кислота'},atoms:[{el:'N',x:0,y:0,z:0},{el:'O',x:1.2,y:0.5,z:0},{el:'O',x:1.2,y:-0.5,z:0},{el:'O',x:-1.2,y:0,z:0},{el:'H',x:-1.9,y:0.5,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:0,b:3},{a:3,b:4}]},
    {name:'H₂SO₄',full:{en:'Sulfuric Acid',uk:'Сірчана кислота'},atoms:[{el:'S',x:0,y:0,z:0},{el:'O',x:1.4,y:0,z:0},{el:'O',x:-1.4,y:0,z:0},{el:'O',x:0,y:1.4,z:0},{el:'O',x:0,y:-1.4,z:0},{el:'H',x:2.2,y:0.5,z:0},{el:'H',x:-2.2,y:0.5,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3,order:2},{a:0,b:4,order:2},{a:1,b:5},{a:2,b:6}]},
    {name:'H₃PO₄',full:{en:'Phosphoric Acid',uk:'Фосфорна кислота'},atoms:[{el:'P',x:0,y:0,z:0},{el:'O',x:1.4,y:0.5,z:0},{el:'O',x:-1.4,y:0.5,z:0},{el:'O',x:0,y:-1.4,z:0},{el:'O',x:0,y:1.4,z:0},{el:'H',x:2.1,y:0.2,z:0},{el:'H',x:-2.1,y:0.2,z:0},{el:'H',x:0,y:-2.1,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4,order:2},{a:1,b:5},{a:2,b:6},{a:3,b:7}]},
    {name:'HClO₄',full:{en:'Perchloric Acid',uk:'Хлорна кислота'},atoms:[{el:'Cl',x:0,y:0,z:0},{el:'O',x:1.4,y:0.5,z:0},{el:'O',x:-1.4,y:0.5,z:0},{el:'O',x:0,y:-1.4,z:0},{el:'O',x:0,y:1.4,z:0},{el:'H',x:2.1,y:0.2,z:0}],bonds:[{a:0,b:1},{a:0,b:2,order:2},{a:0,b:3,order:2},{a:0,b:4,order:2},{a:1,b:5}]},
    {name:'NaOH',full:{en:'Sodium Hydroxide',uk:'Гідроксид натрію'},atoms:[{el:'Na',x:-1.4,y:0,z:0},{el:'O',x:0.4,y:0,z:0},{el:'H',x:1.3,y:0,z:0}],bonds:[{a:0,b:1},{a:1,b:2}]},
    {name:'KOH',full:{en:'Potassium Hydroxide',uk:'Гідроксид калію'},atoms:[{el:'K',x:-1.4,y:0,z:0},{el:'O',x:0.4,y:0,z:0},{el:'H',x:1.3,y:0,z:0}],bonds:[{a:0,b:1},{a:1,b:2}]},
    {name:'Ca(OH)₂',full:{en:'Calcium Hydroxide',uk:'Гідроксид кальцію'},atoms:[{el:'Ca',x:0,y:0,z:0},{el:'O',x:1.8,y:0.5,z:0},{el:'O',x:-1.8,y:0.5,z:0},{el:'H',x:2.5,y:0.2,z:0},{el:'H',x:-2.5,y:0.2,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:1,b:3},{a:2,b:4}]},
    {name:'Al(OH)₃',full:{en:'Aluminum Hydroxide',uk:'Гідроксид алюмінію'},atoms:[{el:'Al',x:0,y:0,z:0},{el:'O',x:1.6,y:0.5,z:0},{el:'O',x:-1.6,y:0.5,z:0},{el:'O',x:0,y:-1.6,z:0},{el:'H',x:2.3,y:0.2,z:0},{el:'H',x:-2.3,y:0.2,z:0},{el:'H',x:0,y:-2.3,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:1,b:4},{a:2,b:5},{a:3,b:6}]},
  ]},

  // ── 4. Salts & Minerals
  { id:'salts', mols:[
    {name:'NaCl',full:{en:'Table Salt',uk:'Кухонна сіль'},atoms:[{el:'Na',x:-1.1,y:0,z:0},{el:'Cl',x:1.1,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'KCl',full:{en:'Potassium Chloride',uk:'Хлорид калію'},atoms:[{el:'K',x:-1.2,y:0,z:0},{el:'Cl',x:1.2,y:0,z:0}],bonds:[{a:0,b:1}]},
    {name:'CaCl₂',full:{en:'Calcium Chloride',uk:'Хлорид кальцію'},atoms:[{el:'Ca',x:0,y:0,z:0},{el:'Cl',x:2.0,y:0,z:0},{el:'Cl',x:-2.0,y:0,z:0}],bonds:[{a:0,b:1},{a:0,b:2}]},
    {name:'MgCl₂',full:{en:'Magnesium Chloride',uk:'Хлорид магнію'},atoms:[{el:'Mg',x:0,y:0,z:0},{el:'Cl',x:2.0,y:0,z:0},{el:'Cl',x:-2.0,y:0,z:0}],bonds:[{a:0,b:1},{a:0,b:2}]},
    {name:'FeCl₃',full:{en:'Iron(III) Chloride',uk:'Хлорид заліза(III)'},atoms:[{el:'Fe',x:0,y:0,z:0},{el:'Cl',x:1.8,y:0,z:0},{el:'Cl',x:-0.9,y:1.6,z:0},{el:'Cl',x:-0.9,y:-1.6,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3}]},
    {name:'CuSO₄',full:{en:'Copper Sulfate',uk:'Сульфат міді'},atoms:[{el:'Cu',x:-2.0,y:0,z:0},{el:'S',x:0.5,y:0,z:0},{el:'O',x:1.8,y:0,z:0},{el:'O',x:-0.2,y:1.4,z:0},{el:'O',x:-0.2,y:-1.4,z:0},{el:'O',x:0.5,y:0,z:1.4}],bonds:[{a:0,b:2},{a:1,b:2},{a:1,b:3,order:2},{a:1,b:4,order:2},{a:1,b:5}]},
    {name:'ZnSO₄',full:{en:'Zinc Sulfate',uk:'Сульфат цинку'},atoms:[{el:'Zn',x:-2.0,y:0,z:0},{el:'S',x:0.5,y:0,z:0},{el:'O',x:1.8,y:0,z:0},{el:'O',x:-0.2,y:1.4,z:0},{el:'O',x:-0.2,y:-1.4,z:0},{el:'O',x:0.5,y:0,z:1.4}],bonds:[{a:0,b:2},{a:1,b:2},{a:1,b:3,order:2},{a:1,b:4,order:2},{a:1,b:5}]},
    {name:'CaCO₃',full:{en:'Calcium Carbonate',uk:'Карбонат кальцію'},atoms:[{el:'Ca',x:-2.0,y:0,z:0},{el:'C',x:0.6,y:0,z:0},{el:'O',x:1.8,y:0,z:0},{el:'O',x:0.0,y:1.2,z:0},{el:'O',x:0.0,y:-1.2,z:0}],bonds:[{a:0,b:2},{a:1,b:2},{a:1,b:3,order:2},{a:1,b:4}]},
    {name:'Na₂CO₃',full:{en:'Sodium Carbonate',uk:'Карбонат натрію'},atoms:[{el:'Na',x:-2.4,y:0.6,z:0},{el:'Na',x:-2.4,y:-0.6,z:0},{el:'C',x:0,y:0,z:0},{el:'O',x:1.3,y:0,z:0},{el:'O',x:-0.6,y:1.1,z:0},{el:'O',x:-0.6,y:-1.1,z:0}],bonds:[{a:0,b:4},{a:1,b:5},{a:2,b:3,order:2},{a:2,b:4},{a:2,b:5}]},
    {name:'NH₄Cl',full:{en:'Ammonium Chloride',uk:'Хлорид амонію'},atoms:[{el:'N',x:0,y:0,z:0},{el:'H',x:1,y:0.7,z:0},{el:'H',x:-1,y:0.7,z:0},{el:'H',x:0,y:0.7,z:1},{el:'H',x:0,y:0.7,z:-1},{el:'Cl',x:0,y:-2.2,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'Na₂SO₄',full:{en:'Sodium Sulfate',uk:'Сульфат натрію'},atoms:[{el:'Na',x:-2.8,y:0.5,z:0},{el:'Na',x:-2.8,y:-0.5,z:0},{el:'S',x:0,y:0,z:0},{el:'O',x:1.4,y:0,z:0},{el:'O',x:-0.4,y:1.3,z:0},{el:'O',x:-0.4,y:-1.3,z:0},{el:'O',x:-0.6,y:0,z:1.3}],bonds:[{a:0,b:4},{a:1,b:5},{a:2,b:3,order:2},{a:2,b:4},{a:2,b:5},{a:2,b:6,order:2}]},
  ]},

  // ── 5. Alkanes
  { id:'alkanes', mols:[
    {name:'CH₄',full:{en:'Methane',uk:'Метан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'H',x:1,y:1,z:1},{el:'H',x:-1,y:-1,z:1},{el:'H',x:1,y:-1,z:-1},{el:'H',x:-1,y:1,z:-1}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'C₂H₆',full:{en:'Ethane',uk:'Етан'},atoms:[{el:'C',x:-0.75,y:0,z:0},{el:'C',x:0.75,y:0,z:0},{el:'H',x:-1.15,y:1.0,z:0},{el:'H',x:-1.15,y:-0.5,z:0.9},{el:'H',x:-1.15,y:-0.5,z:-0.9},{el:'H',x:1.15,y:1.0,z:0},{el:'H',x:1.15,y:-0.5,z:0.9},{el:'H',x:1.15,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4},{a:1,b:5},{a:1,b:6},{a:1,b:7}]},
    {name:'C₃H₈',full:{en:'Propane',uk:'Пропан'},atoms:[{el:'C',x:-1.3,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'C',x:1.3,y:0,z:0},{el:'H',x:-1.7,y:1.0,z:0},{el:'H',x:-1.7,y:-0.5,z:0.9},{el:'H',x:-1.7,y:-0.5,z:-0.9},{el:'H',x:0,y:0.6,z:0.9},{el:'H',x:0,y:0.6,z:-0.9},{el:'H',x:1.7,y:1.0,z:0},{el:'H',x:1.7,y:-0.5,z:0.9},{el:'H',x:1.7,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:0,b:3},{a:0,b:4},{a:0,b:5},{a:1,b:6},{a:1,b:7},{a:2,b:8},{a:2,b:9},{a:2,b:10}]},
    {name:'C₄H₁₀',full:{en:'Butane',uk:'Бутан'},atoms:[{el:'C',x:-1.9,y:0,z:0},{el:'C',x:-0.6,y:0,z:0},{el:'C',x:0.6,y:0,z:0},{el:'C',x:1.9,y:0,z:0},{el:'H',x:-2.3,y:1.0,z:0},{el:'H',x:-2.3,y:-0.5,z:0.9},{el:'H',x:-2.3,y:-0.5,z:-0.9},{el:'H',x:-0.6,y:0.6,z:0.9},{el:'H',x:-0.6,y:0.6,z:-0.9},{el:'H',x:0.6,y:0.6,z:0.9},{el:'H',x:0.6,y:0.6,z:-0.9},{el:'H',x:2.3,y:1.0,z:0},{el:'H',x:2.3,y:-0.5,z:0.9},{el:'H',x:2.3,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6},{a:1,b:7},{a:1,b:8},{a:2,b:9},{a:2,b:10},{a:3,b:11},{a:3,b:12},{a:3,b:13}]},
    {name:'C₅H₁₂',full:{en:'Pentane',uk:'Пентан'},atoms:[{el:'C',x:-2.6,y:0,z:0},{el:'C',x:-1.3,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'C',x:1.3,y:0,z:0},{el:'C',x:2.6,y:0,z:0},{el:'H',x:-3.0,y:1.0,z:0},{el:'H',x:-3.0,y:-0.5,z:0.9},{el:'H',x:-3.0,y:-0.5,z:-0.9},{el:'H',x:-1.3,y:0.6,z:0.9},{el:'H',x:-1.3,y:0.6,z:-0.9},{el:'H',x:0,y:0.6,z:0.9},{el:'H',x:0,y:0.6,z:-0.9},{el:'H',x:1.3,y:0.6,z:0.9},{el:'H',x:1.3,y:0.6,z:-0.9},{el:'H',x:3.0,y:1.0,z:0},{el:'H',x:3.0,y:-0.5,z:0.9},{el:'H',x:3.0,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:3,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7},{a:1,b:8},{a:1,b:9},{a:2,b:10},{a:2,b:11},{a:3,b:12},{a:3,b:13},{a:4,b:14},{a:4,b:15},{a:4,b:16}]},
    {name:'C(CH₃)₄',full:{en:'Neopentane',uk:'Неопентан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'C',x:1.5,y:0,z:0},{el:'C',x:-1.5,y:0,z:0},{el:'C',x:0,y:1.5,z:0},{el:'C',x:0,y:-1.5,z:0},{el:'H',x:2.0,y:1.0,z:0},{el:'H',x:2.0,y:-0.5,z:0.9},{el:'H',x:2.0,y:-0.5,z:-0.9},{el:'H',x:-2.0,y:1.0,z:0},{el:'H',x:-2.0,y:-0.5,z:0.9},{el:'H',x:-2.0,y:-0.5,z:-0.9},{el:'H',x:0.6,y:2.0,z:0.7},{el:'H',x:-0.6,y:2.0,z:0.7},{el:'H',x:0,y:2.0,z:-0.9},{el:'H',x:0.6,y:-2.0,z:0.7},{el:'H',x:-0.6,y:-2.0,z:0.7},{el:'H',x:0,y:-2.0,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4},{a:1,b:5},{a:1,b:6},{a:1,b:7},{a:2,b:8},{a:2,b:9},{a:2,b:10},{a:3,b:11},{a:3,b:12},{a:3,b:13},{a:4,b:14},{a:4,b:15},{a:4,b:16}]},
  ]},

  // ── 6. Alkenes & Alkynes
  { id:'alkenes', mols:[
    {name:'C₂H₄',full:{en:'Ethylene',uk:'Етилен'},atoms:[{el:'C',x:-0.7,y:0,z:0},{el:'C',x:0.7,y:0,z:0},{el:'H',x:-1.2,y:0.9,z:0},{el:'H',x:-1.2,y:-0.9,z:0},{el:'H',x:1.2,y:0.9,z:0},{el:'H',x:1.2,y:-0.9,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:0,b:3},{a:1,b:4},{a:1,b:5}]},
    {name:'C₂H₂',full:{en:'Acetylene',uk:'Ацетилен'},atoms:[{el:'C',x:-0.6,y:0,z:0},{el:'C',x:0.6,y:0,z:0},{el:'H',x:-1.7,y:0,z:0},{el:'H',x:1.7,y:0,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:1,b:3}]},
    {name:'C₃H₆',full:{en:'Propene',uk:'Пропен'},atoms:[{el:'C',x:-1.8,y:0,z:0},{el:'C',x:-0.5,y:0,z:0},{el:'C',x:0.8,y:0,z:0},{el:'H',x:-2.2,y:1.0,z:0},{el:'H',x:-2.2,y:-0.5,z:0.9},{el:'H',x:-2.2,y:-0.5,z:-0.9},{el:'H',x:-0.5,y:0.7,z:0.9},{el:'H',x:1.3,y:0.9,z:0},{el:'H',x:1.3,y:-0.9,z:0}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:0,b:3},{a:0,b:4},{a:0,b:5},{a:1,b:6},{a:2,b:7},{a:2,b:8}]},
    {name:'C₄H₈',full:{en:'1-Butene',uk:'Бутен-1'},atoms:[{el:'C',x:-2.0,y:0,z:0},{el:'C',x:-0.7,y:0,z:0},{el:'C',x:0.6,y:0,z:0},{el:'C',x:1.9,y:0,z:0},{el:'H',x:-2.4,y:1.0,z:0},{el:'H',x:-2.4,y:-0.5,z:0.9},{el:'H',x:-2.4,y:-0.5,z:-0.9},{el:'H',x:-0.7,y:0.7,z:0.9},{el:'H',x:1.1,y:0.9,z:0},{el:'H',x:1.1,y:-0.9,z:0},{el:'H',x:2.3,y:1.0,z:0},{el:'H',x:2.3,y:-0.5,z:0.9},{el:'H',x:2.3,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:2,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6},{a:1,b:7},{a:2,b:8},{a:2,b:9},{a:3,b:10},{a:3,b:11},{a:3,b:12}]},
    {name:'C₃H₄',full:{en:'Propyne',uk:'Пропін'},atoms:[{el:'C',x:-1.8,y:0,z:0},{el:'C',x:-0.5,y:0,z:0},{el:'C',x:0.8,y:0,z:0},{el:'H',x:-2.9,y:0,z:0},{el:'H',x:-1.8,y:1.0,z:0},{el:'H',x:-1.8,y:-0.5,z:0.9},{el:'H',x:-1.8,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:0,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6}]},
  ]},

  // ── 7. Aromatic Compounds
  { id:'aromatic', mols:[
    {name:'C₆H₆',full:{en:'Benzene',uk:'Бензол'},atoms:[{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'H',x:2.5,y:0,z:0},{el:'H',x:1.25,y:2.16,z:0},{el:'H',x:-1.25,y:2.16,z:0},{el:'H',x:-2.5,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:0,b:6},{a:1,b:7},{a:2,b:8},{a:3,b:9},{a:4,b:10},{a:5,b:11}]},
    {name:'C₇H₈',full:{en:'Toluene',uk:'Толуол'},atoms:[{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'C',x:0,y:2.6,z:0},{el:'H',x:2.5,y:0,z:0},{el:'H',x:-2.5,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0},{el:'H',x:0.6,y:3.1,z:0.9},{el:'H',x:0.6,y:3.1,z:-0.9},{el:'H',x:-1.1,y:3.0,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:2,b:6},{a:0,b:7},{a:3,b:8},{a:4,b:9},{a:5,b:10},{a:6,b:11},{a:6,b:12},{a:6,b:13}]},
    {name:'C₆H₅OH',full:{en:'Phenol',uk:'Фенол'},atoms:[{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'O',x:0,y:2.6,z:0},{el:'H',x:0.6,y:3.2,z:0},{el:'H',x:2.5,y:0,z:0},{el:'H',x:-2.5,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:2,b:6},{a:6,b:7},{a:0,b:8},{a:3,b:9},{a:4,b:10},{a:5,b:11}]},
    {name:'C₆H₅NH₂',full:{en:'Aniline',uk:'Анілін'},atoms:[{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'N',x:0,y:2.6,z:0},{el:'H',x:0.8,y:3.2,z:0},{el:'H',x:-0.8,y:3.2,z:0},{el:'H',x:2.5,y:0,z:0},{el:'H',x:-2.5,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:2,b:6},{a:6,b:7},{a:6,b:8},{a:0,b:9},{a:3,b:10},{a:4,b:11},{a:5,b:12}]},
    {name:'C₁₀H₈',full:{en:'Naphthalene',uk:'Нафталін'},atoms:[{el:'C',x:2.45,y:0.7,z:0},{el:'C',x:2.45,y:-0.7,z:0},{el:'C',x:1.22,y:1.4,z:0},{el:'C',x:1.22,y:-1.4,z:0},{el:'C',x:0,y:0.7,z:0},{el:'C',x:0,y:-0.7,z:0},{el:'C',x:-1.22,y:1.4,z:0},{el:'C',x:-1.22,y:-1.4,z:0},{el:'C',x:-2.45,y:0.7,z:0},{el:'C',x:-2.45,y:-0.7,z:0},{el:'H',x:3.38,y:1.22,z:0},{el:'H',x:3.38,y:-1.22,z:0},{el:'H',x:1.22,y:2.5,z:0},{el:'H',x:1.22,y:-2.5,z:0},{el:'H',x:-1.22,y:2.5,z:0},{el:'H',x:-1.22,y:-2.5,z:0},{el:'H',x:-3.38,y:1.22,z:0},{el:'H',x:-3.38,y:-1.22,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:1,b:3},{a:2,b:4,order:2},{a:3,b:5,order:2},{a:4,b:5},{a:4,b:6},{a:5,b:7},{a:6,b:8,order:2},{a:7,b:9,order:2},{a:8,b:9},{a:0,b:10},{a:1,b:11},{a:2,b:12},{a:3,b:13},{a:6,b:14},{a:7,b:15},{a:8,b:16},{a:9,b:17}]},
  ]},

  // ── 8. Alcohols & Ethers
  { id:'alcohols', mols:[
    {name:'CH₃OH',full:{en:'Methanol',uk:'Метанол'},atoms:[{el:'C',x:-0.7,y:0,z:0},{el:'O',x:0.7,y:0,z:0},{el:'H',x:1.4,y:0.5,z:0},{el:'H',x:-1.1,y:1.0,z:0},{el:'H',x:-1.1,y:-0.5,z:0.9},{el:'H',x:-1.1,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:0,b:3},{a:0,b:4},{a:0,b:5}]},
    {name:'C₂H₅OH',full:{en:'Ethanol',uk:'Етанол'},atoms:[{el:'C',x:-1.2,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'O',x:1.1,y:0.8,z:0},{el:'H',x:1.9,y:0.3,z:0},{el:'H',x:-1.6,y:1.0,z:0},{el:'H',x:-1.6,y:-0.5,z:0.9},{el:'H',x:-1.6,y:-0.5,z:-0.9},{el:'H',x:0.1,y:-0.6,z:0.9},{el:'H',x:0.1,y:-0.6,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6},{a:1,b:7},{a:1,b:8}]},
    {name:'C₃H₇OH',full:{en:'Propanol',uk:'Пропанол'},atoms:[{el:'C',x:-1.9,y:0,z:0},{el:'C',x:-0.6,y:0,z:0},{el:'C',x:0.7,y:0,z:0},{el:'O',x:1.8,y:0.8,z:0},{el:'H',x:2.5,y:0.3,z:0},{el:'H',x:-2.3,y:1.0,z:0},{el:'H',x:-2.3,y:-0.5,z:0.9},{el:'H',x:-2.3,y:-0.5,z:-0.9},{el:'H',x:-0.6,y:0.6,z:0.9},{el:'H',x:-0.6,y:0.6,z:-0.9},{el:'H',x:0.7,y:-0.6,z:0.9},{el:'H',x:0.7,y:-0.6,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:3,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7},{a:1,b:8},{a:1,b:9},{a:2,b:10},{a:2,b:11}]},
    {name:'(C₂H₅)₂O',full:{en:'Diethyl Ether',uk:'Діетиловий ефір'},atoms:[{el:'C',x:-2.5,y:0,z:0},{el:'C',x:-1.2,y:0,z:0},{el:'O',x:0,y:0,z:0},{el:'C',x:1.2,y:0,z:0},{el:'C',x:2.5,y:0,z:0},{el:'H',x:-2.9,y:1.0,z:0},{el:'H',x:-2.9,y:-0.5,z:0.9},{el:'H',x:-2.9,y:-0.5,z:-0.9},{el:'H',x:-1.2,y:0.6,z:0.9},{el:'H',x:-1.2,y:0.6,z:-0.9},{el:'H',x:1.2,y:0.6,z:0.9},{el:'H',x:1.2,y:0.6,z:-0.9},{el:'H',x:2.9,y:1.0,z:0},{el:'H',x:2.9,y:-0.5,z:0.9},{el:'H',x:2.9,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:3,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7},{a:1,b:8},{a:1,b:9},{a:3,b:10},{a:3,b:11},{a:4,b:12},{a:4,b:13},{a:4,b:14}]},
    {name:'C₂H₄(OH)₂',full:{en:'Ethylene Glycol',uk:'Етиленгліколь'},atoms:[{el:'C',x:-0.7,y:0,z:0},{el:'C',x:0.7,y:0,z:0},{el:'O',x:-1.6,y:1.0,z:0},{el:'O',x:1.6,y:1.0,z:0},{el:'H',x:-2.4,y:0.7,z:0},{el:'H',x:2.4,y:0.7,z:0},{el:'H',x:-0.7,y:-0.6,z:0.9},{el:'H',x:-0.7,y:-0.6,z:-0.9},{el:'H',x:0.7,y:-0.6,z:0.9},{el:'H',x:0.7,y:-0.6,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:1,b:3},{a:2,b:4},{a:3,b:5},{a:0,b:6},{a:0,b:7},{a:1,b:8},{a:1,b:9}]},
    {name:'C₃H₈O₃',full:{en:'Glycerol',uk:'Гліцерин'},atoms:[{el:'C',x:-1.3,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'C',x:1.3,y:0,z:0},{el:'O',x:-1.3,y:1.4,z:0},{el:'O',x:0,y:1.4,z:0},{el:'O',x:1.3,y:1.4,z:0},{el:'H',x:-2.0,y:1.8,z:0},{el:'H',x:0,y:2.1,z:0},{el:'H',x:2.0,y:1.8,z:0},{el:'H',x:-1.7,y:-0.6,z:0.8},{el:'H',x:-1.7,y:-0.6,z:-0.8},{el:'H',x:0,y:-0.7,z:0.8},{el:'H',x:1.7,y:-0.6,z:0.8},{el:'H',x:1.7,y:-0.6,z:-0.8}],bonds:[{a:0,b:1},{a:1,b:2},{a:0,b:3},{a:1,b:4},{a:2,b:5},{a:3,b:6},{a:4,b:7},{a:5,b:8},{a:0,b:9},{a:0,b:10},{a:1,b:11},{a:2,b:12},{a:2,b:13}]},
  ]},

  // ── 9. Aldehydes & Ketones
  { id:'carbonyl', mols:[
    {name:'HCHO',full:{en:'Formaldehyde',uk:'Формальдегід'},atoms:[{el:'C',x:0,y:0,z:0},{el:'O',x:0,y:1.2,z:0},{el:'H',x:0.9,y:-0.6,z:0},{el:'H',x:-0.9,y:-0.6,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:0,b:3}]},
    {name:'CH₃CHO',full:{en:'Acetaldehyde',uk:'Ацетальдегід'},atoms:[{el:'C',x:-0.7,y:0,z:0},{el:'C',x:0.7,y:0,z:0},{el:'O',x:1.4,y:1.0,z:0},{el:'H',x:1.3,y:-0.8,z:0},{el:'H',x:-1.1,y:1.0,z:0},{el:'H',x:-1.1,y:-0.5,z:0.9},{el:'H',x:-1.1,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:1,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6}]},
    {name:'(CH₃)₂CO',full:{en:'Acetone',uk:'Ацетон'},atoms:[{el:'C',x:0,y:0,z:0},{el:'O',x:0,y:1.2,z:0},{el:'C',x:1.3,y:-0.5,z:0},{el:'C',x:-1.3,y:-0.5,z:0},{el:'H',x:1.7,y:-0.5,z:1.0},{el:'H',x:1.7,y:0.4,z:-0.7},{el:'H',x:2.0,y:-1.2,z:-0.4},{el:'H',x:-1.7,y:-0.5,z:1.0},{el:'H',x:-1.7,y:0.4,z:-0.7},{el:'H',x:-2.0,y:-1.2,z:-0.4}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:0,b:3},{a:2,b:4},{a:2,b:5},{a:2,b:6},{a:3,b:7},{a:3,b:8},{a:3,b:9}]},
    {name:'C₄H₈O',full:{en:'Methyl Ethyl Ketone',uk:'Метилетилкетон'},atoms:[{el:'C',x:-1.3,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'O',x:0,y:1.2,z:0},{el:'C',x:1.3,y:-0.5,z:0},{el:'C',x:2.6,y:0,z:0},{el:'H',x:-1.7,y:1.0,z:0},{el:'H',x:-1.7,y:-0.5,z:0.9},{el:'H',x:-1.7,y:-0.5,z:-0.9},{el:'H',x:1.3,y:-1.1,z:0.9},{el:'H',x:1.3,y:-1.1,z:-0.9},{el:'H',x:3.0,y:1.0,z:0},{el:'H',x:3.0,y:-0.5,z:0.9},{el:'H',x:3.0,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:1,b:3},{a:3,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7},{a:3,b:8},{a:3,b:9},{a:4,b:10},{a:4,b:11},{a:4,b:12}]},
  ]},

  // ── 10. Carboxylic Acids & Esters
  { id:'carboxyl', mols:[
    {name:'HCOOH',full:{en:'Formic Acid',uk:'Мурашина кислота'},atoms:[{el:'C',x:0,y:0,z:0},{el:'O',x:1.2,y:0.5,z:0},{el:'O',x:1.2,y:-0.5,z:0},{el:'H',x:-1.1,y:0,z:0},{el:'H',x:2.0,y:-0.2,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:2,b:4},{a:0,b:3}]},
    {name:'CH₃COOH',full:{en:'Acetic Acid',uk:'Оцтова кислота'},atoms:[{el:'C',x:-1.1,y:0,z:0},{el:'C',x:0.3,y:0,z:0},{el:'O',x:1.0,y:1.1,z:0},{el:'O',x:1.0,y:-1.0,z:0},{el:'H',x:1.9,y:-0.6,z:0},{el:'H',x:-1.5,y:1.0,z:0},{el:'H',x:-1.5,y:-0.5,z:0.9},{el:'H',x:-1.5,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:1,b:3},{a:3,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7}]},
    {name:'C₃H₆O₂',full:{en:'Propionic Acid',uk:'Пропіонова кислота'},atoms:[{el:'C',x:-1.9,y:0,z:0},{el:'C',x:-0.6,y:0,z:0},{el:'C',x:0.7,y:0,z:0},{el:'O',x:1.5,y:1.1,z:0},{el:'O',x:1.5,y:-1.0,z:0},{el:'H',x:2.4,y:-0.6,z:0},{el:'H',x:-2.3,y:1.0,z:0},{el:'H',x:-2.3,y:-0.5,z:0.9},{el:'H',x:-2.3,y:-0.5,z:-0.9},{el:'H',x:-0.6,y:0.6,z:0.9},{el:'H',x:-0.6,y:0.6,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3,order:2},{a:2,b:4},{a:4,b:5},{a:0,b:6},{a:0,b:7},{a:0,b:8},{a:1,b:9},{a:1,b:10}]},
    {name:'CH₃COOC₂H₅',full:{en:'Ethyl Acetate',uk:'Етилацетат'},atoms:[{el:'C',x:-2.5,y:0,z:0},{el:'C',x:-1.2,y:0,z:0},{el:'O',x:-0.4,y:1.1,z:0},{el:'O',x:-1.2,y:-1.1,z:0},{el:'C',x:0.9,y:1.1,z:0},{el:'C',x:1.7,y:2.3,z:0},{el:'H',x:-2.9,y:1.0,z:0},{el:'H',x:-2.9,y:-0.5,z:0.9},{el:'H',x:-2.9,y:-0.5,z:-0.9},{el:'H',x:1.4,y:0.1,z:0},{el:'H',x:0.8,y:1.7,z:0.9},{el:'H',x:2.1,y:3.0,z:0.0},{el:'H',x:2.6,y:2.1,z:0.6},{el:'H',x:1.2,y:2.9,z:-0.7}],bonds:[{a:0,b:1},{a:1,b:2},{a:1,b:3,order:2},{a:2,b:4},{a:4,b:5},{a:0,b:6},{a:0,b:7},{a:0,b:8},{a:4,b:9},{a:4,b:10},{a:5,b:11},{a:5,b:12},{a:5,b:13}]},
    {name:'C₆H₅COOH',full:{en:'Benzoic Acid',uk:'Бензойна кислота'},atoms:[{el:'C',x:1.4,y:0,z:0},{el:'C',x:0.7,y:1.21,z:0},{el:'C',x:-0.7,y:1.21,z:0},{el:'C',x:-1.4,y:0,z:0},{el:'C',x:-0.7,y:-1.21,z:0},{el:'C',x:0.7,y:-1.21,z:0},{el:'C',x:0,y:2.6,z:0},{el:'O',x:1.0,y:3.5,z:0},{el:'O',x:-1.1,y:2.9,z:0},{el:'H',x:-1.7,y:2.3,z:0},{el:'H',x:2.5,y:0,z:0},{el:'H',x:-2.5,y:0,z:0},{el:'H',x:-1.25,y:-2.16,z:0},{el:'H',x:1.25,y:-2.16,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:2,b:6},{a:6,b:7,order:2},{a:6,b:8},{a:8,b:9},{a:0,b:10},{a:3,b:11},{a:4,b:12},{a:5,b:13}]},
  ]},

  // ── 11. Nitrogen Compounds
  { id:'nitrogen', mols:[
    {name:'CH₃NH₂',full:{en:'Methylamine',uk:'Метиламін'},atoms:[{el:'C',x:-0.8,y:0,z:0},{el:'N',x:0.7,y:0,z:0},{el:'H',x:1.2,y:0.9,z:0},{el:'H',x:1.2,y:-0.9,z:0},{el:'H',x:-1.2,y:1.0,z:0},{el:'H',x:-1.2,y:-0.5,z:0.9},{el:'H',x:-1.2,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:1,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6}]},
    {name:'(CH₃)₃N',full:{en:'Trimethylamine',uk:'Триметиламін'},atoms:[{el:'N',x:0,y:0,z:0},{el:'C',x:1.4,y:0.5,z:0},{el:'C',x:-1.4,y:0.5,z:0},{el:'C',x:0,y:-1.5,z:0},{el:'H',x:1.8,y:1.4,z:0},{el:'H',x:1.8,y:-0.1,z:0.9},{el:'H',x:1.8,y:-0.1,z:-0.9},{el:'H',x:-1.8,y:1.4,z:0},{el:'H',x:-1.8,y:-0.1,z:0.9},{el:'H',x:-1.8,y:-0.1,z:-0.9},{el:'H',x:0.6,y:-2.1,z:0.7},{el:'H',x:-0.6,y:-2.1,z:0.7},{el:'H',x:0,y:-2.1,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:1,b:4},{a:1,b:5},{a:1,b:6},{a:2,b:7},{a:2,b:8},{a:2,b:9},{a:3,b:10},{a:3,b:11},{a:3,b:12}]},
    {name:'CH₃NO₂',full:{en:'Nitromethane',uk:'Нітрометан'},atoms:[{el:'C',x:-1.2,y:0,z:0},{el:'N',x:0.2,y:0,z:0},{el:'O',x:0.9,y:1.1,z:0},{el:'O',x:0.9,y:-1.1,z:0},{el:'H',x:-1.6,y:1.0,z:0},{el:'H',x:-1.6,y:-0.5,z:0.9},{el:'H',x:-1.6,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:1,b:3},{a:0,b:4},{a:0,b:5},{a:0,b:6}]},
    {name:'H₂NCONH₂',full:{en:'Urea',uk:'Сечовина'},atoms:[{el:'C',x:0,y:0,z:0},{el:'O',x:0,y:1.3,z:0},{el:'N',x:1.2,y:-0.7,z:0},{el:'N',x:-1.2,y:-0.7,z:0},{el:'H',x:1.2,y:-1.7,z:0},{el:'H',x:2.1,y:-0.2,z:0},{el:'H',x:-1.2,y:-1.7,z:0},{el:'H',x:-2.1,y:-0.2,z:0}],bonds:[{a:0,b:1,order:2},{a:0,b:2},{a:0,b:3},{a:2,b:4},{a:2,b:5},{a:3,b:6},{a:3,b:7}]},
    {name:'C₂H₅NH₂',full:{en:'Ethylamine',uk:'Етиламін'},atoms:[{el:'C',x:-1.4,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'N',x:1.1,y:0.8,z:0},{el:'H',x:1.9,y:0.2,z:0},{el:'H',x:1.2,y:1.7,z:0},{el:'H',x:-1.8,y:1.0,z:0},{el:'H',x:-1.8,y:-0.5,z:0.9},{el:'H',x:-1.8,y:-0.5,z:-0.9},{el:'H',x:0,y:-0.6,z:0.9},{el:'H',x:0,y:-0.6,z:-0.9}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:2,b:4},{a:0,b:5},{a:0,b:6},{a:0,b:7},{a:1,b:8},{a:1,b:9}]},
  ]},

  // ── 12. Halogenated Compounds
  { id:'halogens', mols:[
    {name:'CH₃Cl',full:{en:'Chloromethane',uk:'Хлорметан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'Cl',x:1.7,y:0,z:0},{el:'H',x:-0.5,y:1.0,z:0},{el:'H',x:-0.5,y:-0.5,z:0.9},{el:'H',x:-0.5,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CH₂Cl₂',full:{en:'Dichloromethane',uk:'Дихлорметан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'Cl',x:1.5,y:1.0,z:0},{el:'Cl',x:-1.5,y:1.0,z:0},{el:'H',x:0,y:-0.6,z:1.0},{el:'H',x:0,y:-0.6,z:-1.0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CHCl₃',full:{en:'Chloroform',uk:'Хлороформ'},atoms:[{el:'C',x:0,y:0,z:0},{el:'Cl',x:1.5,y:0.9,z:0},{el:'Cl',x:-1.5,y:0.9,z:0},{el:'Cl',x:0,y:0.9,z:-1.5},{el:'H',x:0,y:-1.2,z:0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CCl₄',full:{en:'Carbon Tetrachloride',uk:'Тетрахлоровуглець'},atoms:[{el:'C',x:0,y:0,z:0},{el:'Cl',x:1.5,y:1.0,z:1.0},{el:'Cl',x:-1.5,y:-1.0,z:1.0},{el:'Cl',x:1.5,y:-1.0,z:-1.0},{el:'Cl',x:-1.5,y:1.0,z:-1.0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CH₃F',full:{en:'Fluoromethane',uk:'Фторметан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'F',x:1.4,y:0,z:0},{el:'H',x:-0.5,y:1.0,z:0},{el:'H',x:-0.5,y:-0.5,z:0.9},{el:'H',x:-0.5,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CF₄',full:{en:'Carbon Tetrafluoride',uk:'Тетрафторвуглець'},atoms:[{el:'C',x:0,y:0,z:0},{el:'F',x:1.2,y:1.0,z:1.0},{el:'F',x:-1.2,y:-1.0,z:1.0},{el:'F',x:1.2,y:-1.0,z:-1.0},{el:'F',x:-1.2,y:1.0,z:-1.0}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CH₃Br',full:{en:'Bromomethane',uk:'Бромметан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'Br',x:1.8,y:0,z:0},{el:'H',x:-0.5,y:1.0,z:0},{el:'H',x:-0.5,y:-0.5,z:0.9},{el:'H',x:-0.5,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
    {name:'CH₃I',full:{en:'Iodomethane',uk:'Йодометан'},atoms:[{el:'C',x:0,y:0,z:0},{el:'I',x:2.0,y:0,z:0},{el:'H',x:-0.5,y:1.0,z:0},{el:'H',x:-0.5,y:-0.5,z:0.9},{el:'H',x:-0.5,y:-0.5,z:-0.9}],bonds:[{a:0,b:1},{a:0,b:2},{a:0,b:3},{a:0,b:4}]},
  ]},

  // ── 13. Biological Molecules
  { id:'bio', mols:[
    {name:'C₆H₁₂O₆',full:{en:'Glucose',uk:'Глюкоза'},atoms:[{el:'C',x:-1.8,y:0.5,z:0},{el:'C',x:-0.6,y:0.5,z:0},{el:'C',x:0.6,y:0.5,z:0},{el:'C',x:1.8,y:0.5,z:0},{el:'C',x:1.8,y:-0.9,z:0},{el:'C',x:0.6,y:-0.9,z:0},{el:'O',x:-1.8,y:1.8,z:0},{el:'O',x:-0.6,y:1.8,z:0},{el:'O',x:0.6,y:1.8,z:0},{el:'O',x:1.8,y:1.8,z:0},{el:'O',x:3.0,y:-0.9,z:0},{el:'O',x:0.6,y:-2.2,z:0},{el:'H',x:-2.6,y:1.8,z:0},{el:'H',x:-0.6,y:2.5,z:0},{el:'H',x:0.6,y:2.5,z:0},{el:'H',x:1.8,y:2.5,z:0},{el:'H',x:3.7,y:-0.9,z:0},{el:'H',x:0.6,y:-2.9,z:0}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:3,b:4},{a:4,b:5},{a:5,b:0},{a:0,b:6},{a:1,b:7},{a:2,b:8},{a:3,b:9},{a:4,b:10},{a:5,b:11},{a:6,b:12},{a:7,b:13},{a:8,b:14},{a:9,b:15},{a:10,b:16},{a:11,b:17}]},
    {name:'CH₃COCOOH',full:{en:'Pyruvic Acid',uk:'Піровиноградна кислота'},atoms:[{el:'C',x:-1.4,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'O',x:0,y:1.3,z:0},{el:'C',x:1.3,y:-0.5,z:0},{el:'O',x:2.3,y:0.3,z:0},{el:'O',x:1.5,y:-1.6,z:0},{el:'H',x:-1.8,y:1.0,z:0},{el:'H',x:-1.8,y:-0.5,z:0.9},{el:'H',x:-1.8,y:-0.5,z:-0.9},{el:'H',x:3.2,y:-0.1,z:0}],bonds:[{a:0,b:1},{a:1,b:2,order:2},{a:1,b:3},{a:3,b:4},{a:3,b:5,order:2},{a:4,b:9},{a:0,b:6},{a:0,b:7},{a:0,b:8}]},
    {name:'H₂NCH₂COOH',full:{en:'Glycine (amino acid)',uk:'Гліцин (амінокислота)'},atoms:[{el:'N',x:-1.5,y:0,z:0},{el:'C',x:0,y:0,z:0},{el:'C',x:1.2,y:0.5,z:0},{el:'O',x:2.2,y:-0.3,z:0},{el:'O',x:1.3,y:1.7,z:0},{el:'H',x:-1.9,y:0.9,z:0},{el:'H',x:-1.9,y:-0.9,z:0},{el:'H',x:0,y:-0.6,z:0.9},{el:'H',x:0,y:-0.6,z:-0.9},{el:'H',x:3.0,y:0.2,z:0}],bonds:[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:2,b:4,order:2},{a:0,b:5},{a:0,b:6},{a:1,b:7},{a:1,b:8},{a:3,b:9}]},
    {name:'C₂H₄O₂',full:{en:'Lactic Acid',uk:'Молочна кислота'},atoms:[{el:'C',x:-1.1,y:0,z:0},{el:'C',x:0.3,y:0,z:0},{el:'O',x:0.9,y:1.2,z:0},{el:'C',x:1.3,y:-0.9,z:0},{el:'O',x:2.4,y:-0.3,z:0},{el:'O',x:1.3,y:-2.1,z:0},{el:'H',x:-1.5,y:1.0,z:0},{el:'H',x:-1.5,y:-0.5,z:0.9},{el:'H',x:-1.5,y:-0.5,z:-0.9},{el:'H',x:0.4,y:1.9,z:0},{el:'H',x:3.2,y:-0.9,z:0}],bonds:[{a:0,b:1},{a:1,b:2},{a:1,b:3},{a:3,b:4},{a:3,b:5,order:2},{a:2,b:9},{a:4,b:10},{a:0,b:6},{a:0,b:7},{a:0,b:8}]},
    {name:'C₅H₅N',full:{en:'Pyridine',uk:'Піридин'},atoms:[{el:'N',x:0,y:1.4,z:0},{el:'C',x:1.21,y:0.7,z:0},{el:'C',x:1.21,y:-0.7,z:0},{el:'C',x:0,y:-1.4,z:0},{el:'C',x:-1.21,y:-0.7,z:0},{el:'C',x:-1.21,y:0.7,z:0},{el:'H',x:2.16,y:1.25,z:0},{el:'H',x:2.16,y:-1.25,z:0},{el:'H',x:0,y:-2.5,z:0},{el:'H',x:-2.16,y:-1.25,z:0},{el:'H',x:-2.16,y:1.25,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:1,b:6},{a:2,b:7},{a:3,b:8},{a:4,b:9},{a:5,b:10}]},
    {name:'C₄H₅N₃O',full:{en:'Cytosine (DNA base)',uk:'Цитозин (основа ДНК)'},atoms:[{el:'N',x:0,y:1.4,z:0},{el:'C',x:1.2,y:0.7,z:0},{el:'N',x:1.2,y:-0.7,z:0},{el:'C',x:0,y:-1.3,z:0},{el:'C',x:-1.2,y:-0.7,z:0},{el:'C',x:-1.2,y:0.7,z:0},{el:'O',x:-2.3,y:1.3,z:0},{el:'N',x:2.4,y:-1.3,z:0},{el:'H',x:0,y:2.5,z:0},{el:'H',x:0,y:-2.4,z:0},{el:'H',x:2.4,y:-2.3,z:0},{el:'H',x:3.2,y:-0.7,z:0}],bonds:[{a:0,b:1,order:2},{a:1,b:2},{a:2,b:3,order:2},{a:3,b:4},{a:4,b:5,order:2},{a:5,b:0},{a:5,b:6,order:2},{a:2,b:7},{a:0,b:8},{a:3,b:9},{a:7,b:10},{a:7,b:11}]},
  ]},
];

// Flat list for search & lookup
const allMolecules: Mol[] = categories.flatMap(c => c.mols);

// ══════════════════════════════════════════════════════════
//  THREE.JS SCENE
// ══════════════════════════════════════════════════════════
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x131110);
const camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.autoClear = false;
document.getElementById('app')?.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.touches = {ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN};
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0xfff5e0, 0.6));
const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.8);
keyLight.position.set(6,9,7); scene.add(keyLight);
const fillA = new THREE.PointLight(0x7eb8a4, 2.0, 50);
const fillB = new THREE.PointLight(0xc9a96e, 1.2, 40);
const rimL  = new THREE.PointLight(0xffffff, 0.5, 30);
rimL.position.set(0,-6,-5); scene.add(fillA, fillB, rimL);

// ══════════════════════════════════════════════════════════
//  LIVE ATOMS
// ══════════════════════════════════════════════════════════
interface LiveAtom { core:THREE.Mesh;glow:THREE.Mesh;glowMat:THREE.MeshStandardMaterial;coreMat:THREE.MeshStandardMaterial;info:string;targetScale:number;phase:number;baseEmI:number; }
let currentObjects: THREE.Object3D[] = [];
let liveAtoms: LiveAtom[] = [];

function clearScene() { currentObjects.forEach(o=>scene.remove(o)); currentObjects=[]; liveAtoms=[]; }

function makeAtomMesh(def:AtomDef) {
  const coreMat = new THREE.MeshStandardMaterial({color:def.color,emissive:def.emissive,emissiveIntensity:def.emissiveI,roughness:def.rough,metalness:def.metal});
  const core    = new THREE.Mesh(new THREE.SphereGeometry(def.radius,40,40), coreMat);
  const glowMat = new THREE.MeshStandardMaterial({color:def.emissive,emissive:def.emissive,emissiveIntensity:0.6,roughness:1.0,metalness:0.0,transparent:true,opacity:0.13,side:THREE.BackSide,depthWrite:false});
  const glow    = new THREE.Mesh(new THREE.SphereGeometry(def.radius*1.32,32,32), glowMat);
  core.add(glow);
  return {core,glow,coreMat,glowMat};
}

function createBond(p1:THREE.Vector3, p2:THREE.Vector3, order=1) {
  const dist=p1.distanceTo(p2), mid=new THREE.Vector3().addVectors(p1,p2).multiplyScalar(0.5);
  const dir=new THREE.Vector3().subVectors(p2,p1).normalize();
  const quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  const mat=new THREE.MeshStandardMaterial({color:0x3d3830,roughness:0.6,metalness:0.05});
  const perp=new THREE.Vector3(dir.y+0.01,-dir.x,0).normalize();
  return (order===2?[-1,1]:[0]).map(o=>{
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(0.052,0.052,dist,10),mat);
    mesh.position.copy(mid).addScaledVector(perp,o*0.09);
    mesh.setRotationFromQuaternion(quat);
    return mesh;
  });
}

function atomInfo(el:string) { const l=atomLabels[el]; return l ? `${l[lang]} · ${el}` : el; }

function loadMolecule(molName:string) {
  clearScene();
  const mol=allMolecules.find(m=>m.name===molName);
  if(!mol) return;
  currentMol=molName;

  mol.atoms.forEach(atom=>{
    const def=ATOMS[atom.el]??ATOMS['C'];
    const {core,glow,coreMat,glowMat}=makeAtomMesh(def);
    core.position.set(atom.x,atom.y,atom.z);
    core.scale.setScalar(0);
    scene.add(core); currentObjects.push(core);
    liveAtoms.push({core,glow,coreMat,glowMat,info:atomInfo(atom.el),targetScale:1,phase:Math.random()*Math.PI*2,baseEmI:def.emissiveI});
  });

  mol.bonds.forEach(b=>{
    const pa=new THREE.Vector3(mol.atoms[b.a].x,mol.atoms[b.a].y,mol.atoms[b.a].z);
    const pb=new THREE.Vector3(mol.atoms[b.b].x,mol.atoms[b.b].y,mol.atoms[b.b].z);
    createBond(pa,pb,b.order??1).forEach(m=>{scene.add(m);currentObjects.push(m);});
  });

  (document.querySelector('.info-mol-name') as HTMLElement).textContent=mol.name;
  (document.querySelector('.info-mol-full') as HTMLElement).textContent=mol.full[lang];
  const counts:Record<string,number>={};
  mol.atoms.forEach(a=>{counts[a.el]=(counts[a.el]||0)+1;});
  (document.querySelector('.info-atoms') as HTMLElement).innerHTML=
    Object.entries(counts).map(([el,n])=>`<b>${n}</b>&nbsp;${el}`).join(' · ');

  document.querySelectorAll('.mol-btn').forEach(btn=>
    (btn as HTMLElement).classList.toggle('active',(btn as HTMLElement).dataset.mol===molName));

  liveAtoms.forEach((a,i)=>setTimeout(()=>{a.targetScale=1;},i*40+10));
  closeMobileDrawer();
}

// ══════════════════════════════════════════════════════════
//  MOBILE DRAWER
// ══════════════════════════════════════════════════════════
let drawerOpen=false;
function openMobileDrawer() { drawerOpen=true; document.querySelector('.sidebar')!.classList.add('open'); document.querySelector('.drawer-overlay')!.classList.add('visible'); document.querySelector('.menu-toggle')!.classList.add('open'); }
function closeMobileDrawer() { if(window.innerWidth>640) return; drawerOpen=false; document.querySelector('.sidebar')!.classList.remove('open'); document.querySelector('.drawer-overlay')!.classList.remove('visible'); document.querySelector('.menu-toggle')!.classList.remove('open'); }

// ══════════════════════════════════════════════════════════
//  BUILD UI
// ══════════════════════════════════════════════════════════
let currentMol = 'H₂O';

function updateLangTexts() {
  const t=i18n[lang];
  (document.querySelector('.sidebar-logo') as HTMLElement).textContent=t.logo;
  (document.querySelector('.sidebar-sub')  as HTMLElement).textContent=t.sub;
  (document.querySelector('.mol-search') as HTMLInputElement).placeholder=t.search;
  (document.querySelector('.sidebar-label') as HTMLElement).textContent=t.legend;
  const hints=document.querySelectorAll('.hint-line');
  hints[0].textContent=t.hintRotate; hints[1].textContent=t.hintZoom; hints[2].textContent=t.hintHover;
  // category headers
  document.querySelectorAll('.cat-header').forEach(el=>{
    const id=(el as HTMLElement).dataset.cat!;
    (el.querySelector('.cat-title') as HTMLElement).textContent=(t.cats as any)[id];
  });
  // mol btn subtitles
  document.querySelectorAll('.mol-btn').forEach(btn=>{
    const mn=(btn as HTMLElement).dataset.mol!;
    const mol=allMolecules.find(m=>m.name===mn);
    if(mol)(btn.querySelector('.sub') as HTMLElement).textContent=mol.full[lang];
  });
  // legend
  document.querySelectorAll('.legend-row').forEach(row=>{
    const el=(row as HTMLElement).dataset.el!;
    const lbl=atomLabels[el];
    if(lbl)(row.querySelector('span') as HTMLElement).textContent=`${el} — ${lbl[lang]}`;
  });
  const mol=allMolecules.find(m=>m.name===currentMol);
  if(mol) {
    (document.querySelector('.info-mol-full') as HTMLElement).textContent=mol.full[lang];
    liveAtoms.forEach((a,i)=>{if(mol.atoms[i]) a.info=atomInfo(mol.atoms[i].el);});
  }
}

function buildUI() {
  const legendHTML=Object.entries(ATOMS).map(([el,def])=>
    `<div class="legend-row" data-el="${el}">
      <div class="legend-dot" style="background:${def.cssColor};box-shadow:0 0 6px ${def.cssColor}55"></div>
      <span>${el} — ${(atomLabels[el]??{en:el,uk:el})[lang]}</span>
    </div>`).join('');

  const sidebar=document.createElement('div');
  sidebar.className='sidebar';
  sidebar.innerHTML=`
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="uk">УК</button>
    </div>
    <div class="sidebar-logo">${i18n[lang].logo}</div>
    <div class="sidebar-sub">${i18n[lang].sub}</div>
    <input class="mol-search" type="text" placeholder="${i18n[lang].search}">
    <div class="mol-list"></div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-label">${i18n[lang].legend}</div>
    <div class="legend">${legendHTML}</div>
    <div class="sidebar-hint">
      <span class="hint-line">${i18n[lang].hintRotate}</span><br>
      <span class="hint-line">${i18n[lang].hintZoom}</span><br>
      <span class="hint-line">${i18n[lang].hintHover}</span>
    </div>`;

  const list=sidebar.querySelector('.mol-list')!;

  // Build category groups
  categories.forEach(cat=>{
    const t=i18n[lang];

    // Category header (collapsible)
    const header=document.createElement('div');
    header.className='cat-header';
    header.dataset.cat=cat.id;
    header.innerHTML=`<span class="cat-title">${(t.cats as any)[cat.id]}</span><span class="cat-arrow">›</span>`;
    list.appendChild(header);

    // Molecule buttons group
    const group=document.createElement('div');
    group.className='cat-group';
    group.dataset.cat=cat.id;

    cat.mols.forEach(mol=>{
      const btn=document.createElement('button');
      btn.className='mol-btn'; btn.dataset.mol=mol.name;
      btn.innerHTML=`<span class="sym">${mol.name}</span><span class="sub">${mol.full[lang]}</span>`;
      btn.addEventListener('click',()=>loadMolecule(mol.name));
      group.appendChild(btn);
    });
    list.appendChild(group);

    // Toggle collapse
    let collapsed=false;
    header.addEventListener('click',()=>{
      collapsed=!collapsed;
      group.classList.toggle('collapsed',collapsed);
      header.classList.toggle('collapsed',collapsed);
    });
  });

  document.body.appendChild(sidebar);

  // Lang switch
  sidebar.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>{
    lang=(btn as HTMLElement).dataset.lang as Lang;
    sidebar.querySelectorAll('.lang-btn').forEach(b=>(b as HTMLElement).classList.toggle('active',(b as HTMLElement).dataset.lang===lang));
    updateLangTexts();
  }));

  // Search — shows/hides individual buttons, hides category headers when no results
  (sidebar.querySelector('.mol-search') as HTMLInputElement).addEventListener('input',e=>{
    const q=(e.target as HTMLInputElement).value.toLowerCase().trim();
    if(!q) {
      // restore
      sidebar.querySelectorAll('.mol-btn').forEach(b=>(b as HTMLElement).classList.remove('hidden'));
      sidebar.querySelectorAll('.cat-header').forEach(b=>(b as HTMLElement).classList.remove('hidden'));
      sidebar.querySelectorAll('.cat-group').forEach(b=>{(b as HTMLElement).classList.remove('search-visible'); (b as HTMLElement).classList.remove('collapsed');});
      return;
    }
    categories.forEach(cat=>{
      const group=sidebar.querySelector(`.cat-group[data-cat="${cat.id}"]`) as HTMLElement;
      const header=sidebar.querySelector(`.cat-header[data-cat="${cat.id}"]`) as HTMLElement;
      let anyVisible=false;
      group.querySelectorAll('.mol-btn').forEach(btn=>{
        const mn=(btn as HTMLElement).dataset.mol!.toLowerCase();
        const fn=allMolecules.find(m=>m.name===(btn as HTMLElement).dataset.mol)?.full[lang].toLowerCase()??'';
        const match=mn.includes(q)||fn.includes(q);
        (btn as HTMLElement).classList.toggle('hidden',!match);
        if(match) anyVisible=true;
      });
      header.classList.toggle('hidden',!anyVisible);
      group.classList.toggle('search-visible',anyVisible);
    });
  });

  // Hamburger
  const toggle=document.createElement('button');
  toggle.className='menu-toggle'; toggle.setAttribute('aria-label','Menu');
  toggle.innerHTML='<span></span><span></span><span></span>';
  toggle.addEventListener('click',()=>drawerOpen?closeMobileDrawer():openMobileDrawer());
  document.body.appendChild(toggle);

  // Overlay
  const overlay=document.createElement('div');
  overlay.className='drawer-overlay';
  overlay.addEventListener('click',closeMobileDrawer);
  document.body.appendChild(overlay);

  // Info bar
  const bar=document.createElement('div');
  bar.className='info-bar';
  bar.innerHTML=`
    <span class="info-mol-name">H₂O</span>
    <div class="info-bar-sep"></div>
    <span class="info-mol-full">Water</span>
    <div class="info-bar-sep"></div>
    <span class="info-atoms"></span>`;
  document.body.appendChild(bar);
}

// ══════════════════════════════════════════════════════════
//  HOVER / TOUCH
// ══════════════════════════════════════════════════════════
const tooltip   = document.createElement('div'); tooltip.className='tooltip'; document.body.appendChild(tooltip);
const atomBadge = document.createElement('div'); atomBadge.className='atom-badge'; document.body.appendChild(atomBadge);
let badgeTimer: ReturnType<typeof setTimeout>;

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

window.addEventListener('mousemove', e=>{
  mouse.x=(e.clientX/window.innerWidth)*2-1;
  mouse.y=-(e.clientY/window.innerHeight)*2+1;
  tooltip.style.left=(e.clientX+14)+'px';
  tooltip.style.top=(e.clientY-8)+'px';
});

let touchStartX=0, touchStartY=0;
renderer.domElement.addEventListener('touchstart', e=>{ if(e.touches.length===1){ touchStartX=e.touches[0].clientX; touchStartY=e.touches[0].clientY; } },{passive:true});
renderer.domElement.addEventListener('touchend', e=>{
  if(e.changedTouches.length!==1) return;
  const touch=e.changedTouches[0];
  if(Math.sqrt((touch.clientX-touchStartX)**2+(touch.clientY-touchStartY)**2)>10) return;
  mouse.x=(touch.clientX/window.innerWidth)*2-1;
  mouse.y=-(touch.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(liveAtoms.map(a=>a.core));
  if(hits.length>0){
    const idx=liveAtoms.findIndex(a=>a.core===hits[0].object);
    if(idx!==-1){
      atomBadge.textContent=liveAtoms[idx].info;
      atomBadge.classList.add('visible');
      clearTimeout(badgeTimer);
      badgeTimer=setTimeout(()=>atomBadge.classList.remove('visible'),2400);
    }
  }
},{passive:true});

function checkHover(){
  if(window.innerWidth<=640) return;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(liveAtoms.map(a=>a.core));
  liveAtoms.forEach(a=>a.targetScale=1);
  if(hits.length>0){
    const idx=liveAtoms.findIndex(a=>a.core===hits[0].object);
    if(idx!==-1){liveAtoms[idx].targetScale=1.38;tooltip.style.display='block';tooltip.textContent=liveAtoms[idx].info;}
  } else tooltip.style.display='none';
}

// ══════════════════════════════════════════════════════════
//  ANIMATE
// ══════════════════════════════════════════════════════════
let t=0;
function animate(){
  requestAnimationFrame(animate); t+=0.012;
  fillA.position.set(Math.sin(t*0.6)*7,4,Math.cos(t*0.6)*7);
  fillB.position.set(Math.cos(t*0.4)*6,-3,Math.sin(t*0.4)*5);
  liveAtoms.forEach(a=>{
    const pulse=Math.sin(t*1.4+a.phase)*0.5+0.5, s=a.targetScale;
    a.coreMat.emissiveIntensity=a.baseEmI*(0.75+pulse*0.5);
    a.glowMat.opacity=0.08+pulse*0.10;
    a.core.scale.lerp(new THREE.Vector3(s,s,s),0.1);
  });
  controls.update(); checkHover();
  renderer.setClearColor(0x131110,1); renderer.clear();
  renderer.render(scene,camera);
}

// BOOT
buildUI();
loadMolecule('H₂O');
animate();
