// ─── UTILS.JS — Shared globals, helpers, constants ────────────────────────
// Loaded FIRST. All other modules depend on these.

// ── Firebase config ──
var FB={apiKey:"AIzaSyA-JVr7hgGJZvlRWIA3RHWZ6SdzIkB5ngw",authDomain:"family-kitchen-628cb.firebaseapp.com",databaseURL:"https://family-kitchen-628cb-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"family-kitchen-628cb",storageBucket:"family-kitchen-628cb.firebasestorage.app",messagingSenderId:"1033585168692",appId:"1:1033585168692:web:d0482fdfe9996c8c6c1561"};
firebase.initializeApp(FB);
var db=firebase.database();

// ── App constants ──
var ADMIN='Mum';
var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var PRESET_TAGS=['Slow Cooker','Sweet Treats','Cakes','Asian Inspired','Lebanese','Middle Eastern','Mexican','Salads','Drinks','Desserts','Bars','High Protein','Low Carb','GF','DF','Quick','Whole Food','Kid Friendly','Meal Prep'];
var PRESET_CATS=['Breakfast','Mains','Chicken','Beef','Lamb','Pork','Seafood','Vegetarian','Vegan','Salads','Soups','Sides','Snacks','Desserts','Sweet Treats','Cakes','Breads','Drinks','Other'];
var EVENT_COLORS=['#B8967E','#A67868','#8A7A6E','#9A8FB0','#7A9BAA','#C49A9A','#8AADA8','#5C5048'];
var BILL_CATS={utilities:{icon:'⚡',bg:'#fff8e1',col:'#f9a825'},insurance:{icon:'🛡',bg:'#e8f5e9',col:'#2e7d32'},subscriptions:{icon:'📺',bg:'#f3e5f5',col:'#7b1fa2'},rent:{icon:'🏠',bg:'#e3f2fd',col:'#1565c0'},phone:{icon:'📱',bg:'#e0f2f1',col:'#00695c'},medical:{icon:'♥',bg:'#fce4ec',col:'#c62828'},transport:{icon:'🚗',bg:'#fff3e0',col:'#e65100'},other:{icon:'📋',bg:'#f5f5f5',col:'#616161'}};
var MEMBER_COLORS=[{hex:'#B8967E',name:'Caramel'},{hex:'#A67868',name:'Warm Rust'},{hex:'#8A7A6E',name:'Driftwood'},{hex:'#6E6560',name:'Pebble'},{hex:'#C4A882',name:'Sand'},{hex:'#B8A090',name:'Blush Taupe'},{hex:'#C49A9A',name:'Dusty Rose'},{hex:'#D4A5A5',name:'Soft Rose'},{hex:'#B89AB0',name:'Mauve'},{hex:'#9A8FB0',name:'Soft Lavender'},{hex:'#8FA0B8',name:'Steel Blue'},{hex:'#7A9BAA',name:'Dusty Blue'},{hex:'#8AADA8',name:'Sage Teal'},{hex:'#2A2218',name:'Espresso'},{hex:'#5C5048',name:'Dark Mocha'}];
var QUOTES=[{q:"Let food be thy medicine.",a:"Hippocrates"},{q:"Your body is a reflection of your lifestyle.",a:"Don Tolman"},{q:"Whole foods nourish the whole person.",a:"Don Tolman"},{q:"The cleaner you eat, the clearer you think.",a:"Don Tolman"},{q:"Hydration is the foundation of health.",a:"Don Tolman"},{q:"Processed foods cause inflammation.",a:"Barbara O'Neill"},{q:"Your immune system is your best doctor.",a:"Barbara O'Neill"},{q:"If you want a new outcome, break the habit of being yourself.",a:"Joe Dispenza"},{q:"Where you place your attention is where you place your energy.",a:"Joe Dispenza"},{q:"You are the creator of your own reality.",a:"Joe Dispenza"},{q:"Eating well is a form of self-respect.",a:"Unknown"},{q:"Progress, not perfection.",a:"Unknown"},{q:"Family is not an important thing. It's everything.",a:"Michael J. Fox"},{q:"Cooking is love made visible.",a:"Unknown"},{q:"The hearth is the heart of the home.",a:"Unknown"},{q:"Eat food. Not too much. Mostly plants.",a:"Michael Pollan"}];
var CAL_TYPES={event:{icon:'📅',bg:'#fff0eb',border:'#f0c4b0',color:'#96705a',label:'Event'},meal:{icon:'🍽',bg:'#eaf3ea',border:'#a0d0a0',color:'#2a6a2a',label:'Meal'},personal:{icon:'📋',bg:'#e8f0fe',border:'#b0c4f0',color:'#1a3a8a',label:'Schedule'},birthday:{icon:'🎂',bg:'#fff8e1',border:'#ffe082',color:'#e65100',label:'Birthday'},bill:{icon:'💳',bg:'#fce4ec',border:'#f48fb1',color:'#c62828',label:'Bill'},work:{icon:'💼',bg:'#e8f0fe',border:'#b0c4f0',color:'#1a3a8a',label:'Work'},uni:{icon:'🎓',bg:'#f3e8ff',border:'#c4a0f0',color:'#5a1a9a',label:'Uni'},appt:{icon:'🏥',bg:'#e8fff8',border:'#a0f0d0',color:'#1a6a5a',label:'Appt'},workout:{icon:'💪',bg:'#fff0e8',border:'#f0c0a0',color:'#7a3010',label:'Workout'}};

// ── Shared state ──
var userName='', userColor='#B8967E';
var members={}, personalData={};
var recipes=[], testRecipes=[], events=[], shopItems=[], bills=[], calEvents=[];
var selectedPresetTags=[];
var activeTag='', activeCat='';
var billFilter='all';
var calView='month', calOffset=0;
var plannerView='week', planOffset=0, planMonthOffset=0;
var planWeekOffset=0, planDayOffset=0; // separate offsets per view — never share between week and day
var plannerRef=null, plannerCalCache={};
var weekOffset=0, monthOffset=0;
var myPageView='week';
var currentConvoId='family', currentConvoName='Hearth Chat';
var chatListeners={};
var groupSelectedMembers=[], addMembersGid='', addMembersCurrent={}, addMembersSelected=[];
var evInviteId='', editBillId='', editCalId='';
var ckSteps=[], ckIdx=0, ckAll=false;
var currentPrintRec=null;
var dayCtx={}, mealCtx={};
var pinEntry='', newPinEntry='', authMember=null;

// ── Helper functions ──
function el(id){return document.getElementById(id);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});}catch(e){return d;}}
function dKey(d){var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+dd;}
function todayKey(){return dKey(new Date());}
function daysUntil(ds){var d=new Date(ds+'T00:00:00'),t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/(86400000));}
function parseIng(s){var m=s.match(/^([\d\u00BC\u00BD\u00BE\/\.\s\-]+\s*(?:g|kg|ml|tsp|tbsp|cups?|oz|lbs?|pinch|bunch|handful|slices?|cans?|cloves?)\.?)\s+(.+)$/i);if(m&&m[2]&&m[2].length>1)return{q:m[1].trim(),n:m[2].trim()};var m2=s.match(/^([\d\/\.\s\-]+)\s+(.+)$/);if(m2&&m2[2]&&m2[2].length>1)return{q:m2[1].trim(),n:m2[2].trim()};return{q:'',n:s};}
function avt(name,color,size){size=size||32;var fs=Math.round(size*0.42);return'<div class="mavatar" style="background:'+(color||'#8A7A6E')+';width:'+size+'px;height:'+size+'px;font-size:'+fs+'px">'+esc((name||'?').charAt(0).toUpperCase())+'</div>';}
function getWeekDates(off){var s=new Date();var d=s.getDay()||7;s.setDate(s.getDate()-d+1+(off*7));s.setHours(0,0,0,0);var arr=[];for(var i=0;i<7;i++){var dt=new Date(s);dt.setDate(s.getDate()+i);arr.push(dt);}return arr;}
function getMonthDates(off){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+off);var yr=d.getFullYear(),mo=d.getMonth(),days=[],tot=new Date(yr,mo+1,0).getDate();for(var i=1;i<=tot;i++)days.push(new Date(yr,mo,i));return{days:days,label:d.toLocaleDateString('en-AU',{month:'long',year:'numeric'})};}
function getMonthDatesForCal(offset){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);var yr=d.getFullYear(),mo=d.getMonth(),days=[],tot=new Date(yr,mo+1,0).getDate();for(var i=1;i<=tot;i++)days.push(new Date(yr,mo,i));return{days:days,label:d.toLocaleDateString('en-AU',{month:'long',year:'numeric'}),year:yr,month:mo};}