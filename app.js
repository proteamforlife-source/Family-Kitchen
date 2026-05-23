var FB={apiKey:"AIzaSyA-JVr7hgGJZvlRWIA3RHWZ6SdzIkB5ngw",authDomain:"family-kitchen-628cb.firebaseapp.com",databaseURL:"https://family-kitchen-628cb-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"family-kitchen-628cb",storageBucket:"family-kitchen-628cb.firebasestorage.app",messagingSenderId:"1033585168692",appId:"1:1033585168692:web:d0482fdfe9996c8c6c1561"};
firebase.initializeApp(FB);
var db=firebase.database();
var ADMIN='Mum';
var PRESET_TAGS=['Slow Cooker','Sweet Treats','Cakes','Asian Inspired','Lebanese','Middle Eastern','Mexican','Salads','Drinks','Desserts','Bars','High Protein','Low Carb','GF','DF','Quick','Whole Food','Kid Friendly','Meal Prep'];
var PRESET_CATS=['Breakfast','Mains','Chicken','Beef','Lamb','Pork','Seafood','Vegetarian','Vegan','Salads','Soups','Sides','Snacks','Desserts','Sweet Treats','Cakes','Breads','Drinks','Other'];
var EVENT_COLORS=['#B8967E','#A67868','#8A7A6E','#9A8FB0','#7A9BAA','#C49A9A','#8AADA8','#5C5048'];
var BILL_CATS={utilities:{icon:'⚡',bg:'#fff8e1',col:'#f9a825'},insurance:{icon:'🛡',bg:'#e8f5e9',col:'#2e7d32'},subscriptions:{icon:'📺',bg:'#f3e5f5',col:'#7b1fa2'},rent:{icon:'🏠',bg:'#e3f2fd',col:'#1565c0'},phone:{icon:'📱',bg:'#e0f2f1',col:'#00695c'},medical:{icon:'♥',bg:'#fce4ec',col:'#c62828'},transport:{icon:'🚗',bg:'#fff3e0',col:'#e65100'},other:{icon:'📋',bg:'#f5f5f5',col:'#616161'}};
var MEMBER_COLORS=[{hex:'#B8967E',name:'Caramel'},{hex:'#A67868',name:'Warm Rust'},{hex:'#8A7A6E',name:'Driftwood'},{hex:'#6E6560',name:'Pebble'},{hex:'#C4A882',name:'Sand'},{hex:'#B8A090',name:'Blush Taupe'},{hex:'#C49A9A',name:'Dusty Rose'},{hex:'#D4A5A5',name:'Soft Rose'},{hex:'#B89AB0',name:'Mauve'},{hex:'#9A8FB0',name:'Soft Lavender'},{hex:'#8FA0B8',name:'Steel Blue'},{hex:'#7A9BAA',name:'Dusty Blue'},{hex:'#8AADA8',name:'Sage Teal'},{hex:'#2A2218',name:'Espresso'},{hex:'#5C5048',name:'Dark Mocha'}];
var QUOTES=[{q:"Let food be thy medicine.",a:"Hippocrates"},{q:"Your body is a reflection of your lifestyle.",a:"Don Tolman"},{q:"Whole foods nourish the whole person.",a:"Don Tolman"},{q:"The cleaner you eat, the clearer you think.",a:"Don Tolman"},{q:"Hydration is the foundation of health.",a:"Don Tolman"},{q:"Processed foods cause inflammation.",a:"Barbara O'Neill"},{q:"Your immune system is your best doctor.",a:"Barbara O'Neill"},{q:"If you want a new outcome, break the habit of being yourself.",a:"Joe Dispenza"},{q:"Where you place your attention is where you place your energy.",a:"Joe Dispenza"},{q:"You are the creator of your own reality.",a:"Joe Dispenza"},{q:"Eating well is a form of self-respect.",a:"Unknown"},{q:"Progress, not perfection.",a:"Unknown"},{q:"Family is not an important thing. It's everything.",a:"Michael J. Fox"},{q:"Cooking is love made visible.",a:"Unknown"},{q:"The hearth is the heart of the home.",a:"Unknown"},{q:"Eat food. Not too much. Mostly plants.",a:"Michael Pollan"}];
var userName='',userColor='#B8967E',recipes=[],events=[],shopItems=[],testRecipes=[],members={},personalData={},bills=[];
var weekOffset=0,planOffset=0,ckSteps=[],ckIdx=0,ckAll=false,dayCtx={},activeTag='',activeCat='';
var plannerView='week',planMonthOffset=0;
var selectedPresetTags=[],pinEntry='',newPinEntry='',authMember=null;
var currentConvoId='family',currentConvoName='Hearth Chat',chatListeners={};
var groupSelectedMembers=[],addMembersGid='',addMembersCurrent={},addMembersSelected=[];
var plannerRef=null,currentPrintRec=null,myPageView='week',monthOffset=0,evInviteId='';
var billFilter='all';

function el(id){return document.getElementById(id);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});}catch(e){return d;}}
var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function getWeekDates(off){var s=new Date();var d=s.getDay()||7;s.setDate(s.getDate()-d+1+(off*7));s.setHours(0,0,0,0);var arr=[];for(var i=0;i<7;i++){var dt=new Date(s);dt.setDate(s.getDate()+i);arr.push(dt);}return arr;}
function getMonthDates(off){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+off);var yr=d.getFullYear(),mo=d.getMonth(),days=[],tot=new Date(yr,mo+1,0).getDate();for(var i=1;i<=tot;i++)days.push(new Date(yr,mo,i));return{days:days,label:d.toLocaleDateString('en-AU',{month:'long',year:'numeric'})};}
function dKey(d){return d.toISOString().split('T')[0];}
function todayKey(){return dKey(new Date());}
function daysUntil(ds){var d=new Date(ds+'T00:00:00'),t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/(86400000));}
function parseIng(s){var m=s.match(/^([\d\u00BC\u00BD\u00BE\/\.\s\-]+\s*(?:g|kg|ml|tsp|tbsp|cups?|oz|lbs?|pinch|bunch|handful|slices?|cans?|cloves?)\.?)\s+(.+)$/i);if(m&&m[2]&&m[2].length>1)return{q:m[1].trim(),n:m[2].trim()};var m2=s.match(/^([\d\/\.\s\-]+)\s+(.+)$/);if(m2&&m2[2]&&m2[2].length>1)return{q:m2[1].trim(),n:m2[2].trim()};return{q:'',n:s};}
function avt(name,color,size){size=size||32;var fs=Math.round(size*0.42);return'<div class="mavatar" style="background:'+(color||'#8A7A6E')+';width:'+size+'px;height:'+size+'px;font-size:'+fs+'px">'+esc((name||'?').charAt(0).toUpperCase())+'</div>';}

// ── AUTH ──
function loadMembers(){db.ref('members').on('value',function(snap){members={};snap.forEach(function(c){members[c.key]=c.val();});renderMemberList();buildGroupMemSelect();if(userName)buildChatTabs();});}
function renderMemberList(){var ns=Object.keys(members);if(!ns.length){el('memberList').innerHTML='<p style="color:var(--muted);font-size:.83rem;text-align:center;padding:8px">No members yet.</p>';return;}el('memberList').innerHTML=ns.map(function(n){var m=members[n];return'<button class="member-btn" data-mname="'+esc(n)+'">'+avt(n,m.color,34)+'<span>'+esc(n)+'</span>'+(n===ADMIN?'<span style="font-size:.7rem;color:var(--terra);margin-left:auto">Admin</span>':'')+'</button>';}).join('');}
function showPin(name){authMember=name;pinEntry='';el('as1').style.display='none';el('as2').style.display='block';el('asName').textContent=(members[name]&&members[name].pin)?'Hello '+name+'! Enter PIN':'Hi '+name+'! Set your PIN';updDots('pinDots',0);el('pinErr').textContent='';}
function updDots(id,len){el(id).querySelectorAll('.pin-dot').forEach(function(d,i){d.classList.toggle('filled',i<len);});}
function checkPin(){var m=members[authMember];if(!m){el('pinErr').textContent='Not found.';return;}if(!m.pin){db.ref('members/'+authMember+'/pin').set(pinEntry);doLogin(authMember,m.color||'#B8967E');return;}if(String(m.pin)===pinEntry){doLogin(authMember,m.color||'#B8967E');}else{el('pinErr').textContent='Wrong PIN.';pinEntry='';updDots('pinDots',0);}}
function doLogin(name,color){userName=name;userColor=color;localStorage.setItem('fk_name',name);localStorage.setItem('fk_color',color);el('authScreen').classList.add('h');el('userPill').innerHTML=avt(name,color,20)+'<span>'+esc(name)+'</span>';db.ref('members/'+name+'/lastSeen').set(Date.now());loadPersonal();buildPresetTags();buildChatTabs();listenToConvo('family');setTimeout(renderDashboard,300);}

document.addEventListener('click',function(e){
  var pk=e.target.closest('[data-k]');if(pk){var k=pk.dataset.k;if(k==='cancel'){el('as2').style.display='none';el('as1').style.display='block';pinEntry='';return;}if(k==='back'){pinEntry=pinEntry.slice(0,-1);updDots('pinDots',pinEntry.length);return;}if(pinEntry.length<4){pinEntry+=k;updDots('pinDots',pinEntry.length);}if(pinEntry.length===4)setTimeout(checkPin,100);return;}
  var pk2=e.target.closest('[data-nk]');if(pk2){var k2=pk2.dataset.nk;if(k2==='cancel'){el('as3').style.display='none';el('as1').style.display='block';newPinEntry='';return;}if(k2==='back'){newPinEntry=newPinEntry.slice(0,-1);updDots('newPinDots',newPinEntry.length);return;}if(newPinEntry.length<4){newPinEntry+=k2;updDots('newPinDots',newPinEntry.length);}return;}
  var mb=e.target.closest('[data-mname]');if(mb&&mb.closest('#memberList')){showPin(mb.dataset.mname);return;}
});
el('newMemBtn').addEventListener('click',function(){el('as1').style.display='none';el('as3').style.display='block';newPinEntry='';updDots('newPinDots',0);});
el('createMemBtn').addEventListener('click',function(){var name=el('newName').value.trim();if(!name){el('newPinErr').textContent='Enter your name.';return;}if(newPinEntry.length<4){el('newPinErr').textContent='Enter a 4-digit PIN.';return;}if(members[name]){el('newPinErr').textContent='Name already taken.';return;}var color=el('newColor').value;db.ref('members/'+name).set({name:name,color:color,pin:newPinEntry,lastSeen:Date.now()});doLogin(name,color);});
el('userPill').addEventListener('click',function(){el('authScreen').classList.remove('h');el('as1').style.display='block';el('as2').style.display='none';el('as3').style.display='none';});

el('settingsBtn').addEventListener('click',function(){
  if(!userName){alert('Sign in first!');return;}
  var memberColor=members[userName]?members[userName].color:'#B8967E';
  var inviteUrl='https://proteamforlife-source.github.io/Family-Kitchen/';
  el('settingsBody').innerHTML=
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><div style="width:48px;height:48px;border-radius:50%;background:'+memberColor+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;font-weight:700">'+esc(userName.charAt(0).toUpperCase())+'</div><div><div style="font-weight:700;font-size:1rem">'+esc(userName)+'</div><div style="font-size:.78rem;color:var(--muted)">Hearth Member</div></div></div>'+
    '<div style="margin-bottom:14px"><div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">My Colour</div><div style="display:flex;flex-wrap:wrap;gap:8px">'+MEMBER_COLORS.map(function(c){var sel=c.hex===memberColor;return'<div data-pickcolor="'+c.hex+'" title="'+c.name+'" style="width:36px;height:36px;border-radius:50%;background:'+c.hex+';cursor:pointer;border:3px solid '+(sel?'#2A2218':'transparent')+'"></div>';}).join('')+'</div></div>'+
    '<div style="margin-bottom:14px"><div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Change PIN</div><div style="display:flex;gap:8px"><input type="password" id="newPinA" placeholder="New PIN (4 digits)" maxlength="4" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:.88rem;outline:none;font-family:inherit"><input type="password" id="newPinB" placeholder="Confirm PIN" maxlength="4" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:.88rem;outline:none;font-family:inherit"></div><button class="btn" id="savePinBtn" style="margin-top:8px;width:100%;font-size:.85rem;padding:8px">Save New PIN</button><div id="pinMsg" style="font-size:.8rem;margin-top:6px;text-align:center"></div></div>'+
    '<div style="margin-bottom:14px"><div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Invite a Family Member</div><div class="invite-box"><p style="font-size:.84rem;margin-bottom:8px;opacity:.9">Share this link:</p><div class="invite-url">'+esc(inviteUrl)+'</div><button class="invite-copy" id="copyInviteBtn">Copy Link</button></div></div>'+
    '<button class="sm sx" id="signOutBtn" style="width:100%;padding:9px;font-size:.85rem">Sign Out</button>';
  el('settingsMod').classList.remove('h');
  // Add birthday field dynamically
  var bdVal=members[userName]&&members[userName].birthday?members[userName].birthday:'';
  var bdHtml='<div style="margin-bottom:14px"><div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">My Birthday</div><div style="display:flex;gap:8px"><input type="date" id="myBirthdayInput" value="'+bdVal+'" style="flex:1;padding:8px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:.88rem;outline:none;font-family:inherit"><button class="sm st" id="saveBirthdayBtn" style="padding:8px 14px">Save</button></div></div>';
  el('settingsBody').insertAdjacentHTML('beforeend', bdHtml);
  el('saveBirthdayBtn').addEventListener('click',function(){var bd=el('myBirthdayInput').value;if(!bd)return;db.ref('members/'+userName+'/birthday').set(bd);alert('Birthday saved!');});
  el('savePinBtn').addEventListener('click',function(){var a=el('newPinA').value.trim(),b=el('newPinB').value.trim(),msg=el('pinMsg');if(a.length!==4||isNaN(a)){msg.style.color='var(--re)';msg.textContent='PIN must be 4 digits.';return;}if(a!==b){msg.style.color='var(--re)';msg.textContent='PINs do not match.';return;}db.ref('members/'+userName+'/pin').set(a);msg.style.color='var(--sage)';msg.textContent='PIN updated!';el('newPinA').value='';el('newPinB').value='';});
  el('copyInviteBtn').addEventListener('click',function(){navigator.clipboard.writeText(inviteUrl).then(function(){el('copyInviteBtn').textContent='Copied!';setTimeout(function(){el('copyInviteBtn').textContent='Copy Link';},2000);});});
  el('signOutBtn').addEventListener('click',function(){localStorage.removeItem('fk_name');localStorage.removeItem('fk_color');userName='';userColor='#B8967E';el('settingsMod').classList.add('h');el('authScreen').classList.remove('h');el('as1').style.display='block';el('as2').style.display='none';el('as3').style.display='none';});
  var saveBd=el('saveBirthdayBtn');if(saveBd)saveBd.addEventListener('click',function(){var bd=el('myBirthdayInput').value;if(!bd)return;db.ref('members/'+userName+'/birthday').set(bd);alert('Birthday saved!');});
});
el('settingsClose').addEventListener('click',function(){el('settingsMod').classList.add('h');});

// ── INIT ──
function init(){
  db.ref('members').once('value',function(snap){
    members={};snap.forEach(function(c){members[c.key]=c.val();});renderMemberList();
    var sn=localStorage.getItem('fk_name'),sc=localStorage.getItem('fk_color')||'#B8967E';
    if(sn&&members[sn]){userName=sn;userColor=sc;el('authScreen').classList.add('h');el('userPill').innerHTML=avt(sn,sc,20)+'<span>'+esc(sn)+'</span>';loadPersonal();buildPresetTags();buildChatTabs();listenToConvo('family');db.ref('members/'+sn+'/lastSeen').set(Date.now());setTimeout(renderDashboard,400);}
    loadMembers();
  });
  db.ref('recipes').on('value',function(snap){recipes=[];testRecipes=[];snap.forEach(function(c){var v=c.val();if(v.testing)testRecipes.push(v);else recipes.push(v);});recipes.reverse();testRecipes.reverse();renderRecipes();buildCatFilter();buildTagFilter();renderTestRecipes();if(el('pg-d').classList.contains('on')&&userName)renderDashboard();});
  db.ref('events').on('value',function(snap){events=[];snap.forEach(function(c){events.push(c.val());});renderEvents();if(el('pg-d').classList.contains('on')&&userName)renderDashboard();});
  db.ref('shopping').on('value',function(snap){shopItems=[];snap.forEach(function(c){shopItems.push(c.val());});renderShopping();});
  db.ref('bills').on('value',function(snap){bills=[];snap.forEach(function(c){bills.push(c.val());});renderBills();if(el('pg-d').classList.contains('on')&&userName)renderDashboard();});
}

var tabs=['d','r','p','e','c','b','t','s','m'];
tabs.forEach(function(id){el('tb-'+id).addEventListener('click',function(){tabs.forEach(function(t){el('pg-'+t).classList.remove('on');el('tb-'+t).classList.remove('on');});el('pg-'+id).classList.add('on');el('tb-'+id).classList.add('on');if(id==='m')renderMyPage();if(id==='p'){renderPlanner();setupPlannerListener();}if(id==='d')renderDashboard();if(id==='b')renderBills();if(id==='c')renderCalendar();});});
function switchTab(id){tabs.forEach(function(t){el('pg-'+t).classList.remove('on');el('tb-'+t).classList.remove('on');});el('pg-'+id).classList.add('on');el('tb-'+id).classList.add('on');if(id==='p'){renderPlanner();setupPlannerListener();}if(id==='d')renderDashboard();if(id==='c')renderCalendar();}
function buildPresetTags(){var w=el('presetTags');if(!w)return;w.innerHTML=PRESET_TAGS.map(function(t){var on=selectedPresetTags.indexOf(t)>-1;return'<span class="tag'+(on?' on':'')+'" data-preset="'+esc(t)+'">'+esc(t)+'</span>';}).join('');}

// ── DASHBOARD ──
function renderDashboard(){
  if(!el('pg-d')||!userName)return;
  el('dashContent').innerHTML='<div style="text-align:center;padding:30px;color:var(--muted)">Loading...</div>';
  var today=todayKey(),todayDates=getWeekDates(0),todayIdx=new Date().getDay()-1;if(todayIdx<0)todayIdx=6;
  db.ref('planner/'+dKey(todayDates[0])+'/'+todayIdx+'/D').once('value',function(snap){
    var dinners=[];snap.forEach(function(c){dinners.push(c.val());});
    var winner=null,maxV=0;dinners.forEach(function(m){var vc=m.votes?Object.keys(m.votes).length:0;if(vc>=maxV){maxV=vc;winner=m;}});
    db.ref('dinnerQ/'+today).once('value',function(dqSnap){
      var dqData=dqSnap.val()||{},myAnswer=dqData[userName]||null;
      var nextEv=null;var sorted=events.slice().sort(function(a,b){return(a.date||'9999')<(b.date||'9999')?-1:1;});for(var i=0;i<sorted.length;i++){if(sorted[i].date>=today){nextEv=sorted[i];break;}}
      var todayItems=[];if(personalData&&personalData.days&&personalData.days[today]&&personalData.days[today].items)todayItems=Object.values(personalData.days[today].items);
      var answersList=Object.entries(dqData).map(function(e){var col=members[e[0]]?members[e[0]].color:'#8A7A6E';return'<span class="dq-answer">'+avt(e[0],col,16)+'<span style="margin-left:3px;font-size:.75rem">'+esc(e[0])+': '+(e[1]==='yes'?'Yes':'No')+'</span></span>';}).join('');
      var lastRead=personalData.lastRead||{};
      var dueSoon=bills.filter(function(b){if(b.paid)return false;var d=daysUntil(b.due);return d>=0&&d<=7;}).sort(function(a,b){return a.due<b.due?-1:1;});
      db.ref('chatGroups').once('value',function(grpSnap){
        var myGroups=['family'];grpSnap.forEach(function(c){var g=c.val();if(g.members&&g.members[userName])myGroups.push(g.id);});Object.keys(members).forEach(function(n){if(n!==userName)myGroups.push([userName,n].sort().join('_'));});
        var allMsgs=[],pending=myGroups.length;
        if(!pending){buildDash([],answersList,todayItems,winner,dinners,nextEv,dqData,{},{},myAnswer,dueSoon);return;}
        myGroups.forEach(function(cid){db.ref('chats/'+cid).limitToLast(10).once('value',function(msgSnap){msgSnap.forEach(function(c){var m=c.val();m._cid=cid;allMsgs.push(m);});pending--;if(pending===0){allMsgs.sort(function(a,b){return b.ts-a.ts;});buildDash(allMsgs,answersList,todayItems,winner,dinners,nextEv,dqData,lastRead,myGroups,myAnswer,dueSoon);}});});
      });
    });
  });
}

function buildDash(allMsgs,answersList,todayItems,winner,dinners,nextEv,dqData,lastRead,myGroups,myAnswer,dueSoon){
  var todayFmt=new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var billsBanner=dueSoon.length?'<div class="bill-upcoming-banner" data-switchtab="b" style="cursor:pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect x="2" y="6" width="20" height="14" rx="2" fill="#e65100" opacity=".8"/><path d="M2 10h20" stroke="white" stroke-width="1.5"/><circle cx="7" cy="15" r="1.5" fill="white"/></svg><div><div style="font-weight:700;font-size:.84rem;color:#e65100">Bills due this week</div><div style="font-size:.76rem;color:#bf360c;margin-top:2px">'+dueSoon.map(function(b){return esc(b.name)+(b.amount?' $'+b.amount.toFixed(2):'')+'  &middot; '+fmtDate(b.due);}).join('<br>')+'</div></div></div>':'';
  el('dashContent').innerHTML=
    '<div style="font-size:.82rem;color:var(--muted);font-weight:600;margin-bottom:12px;text-align:center">'+todayFmt+'</div>'+
    billsBanner+
    '<div class="dinner-q"><h3>Are you home for dinner tonight?</h3>'+
      (myAnswer?'<p style="font-size:.88rem;opacity:.9">You said: '+(myAnswer==='yes'?'Yes, I\'ll be home':'No, I\'m out')+'</p>':'<p>Let the family know!</p><div class="dq-btns"><button class="dq-btn yes" data-dqa="yes">Yes</button><button class="dq-btn" data-dqa="no">No</button></div>')+
      (answersList?'<div class="dq-answers">'+answersList+'</div>':'')+
    '</div>'+
    '<div class="dash-grid">'+
      '<div class="dash-card" data-switchtab="p"><h3>Tonight</h3>'+
        (winner?'<div class="dash-dinner">'+esc(winner.name)+'</div>'+dinners.map(function(m){return'<div class="dash-sub">'+(m.cooker?esc(m.cooker)+' cooking':'nobody claimed yet')+'</div>';}).join(''):'<div style="color:var(--muted);font-size:.84rem">Nothing planned yet</div>')+
        '<button class="sm st" style="margin-top:8px;font-size:.75rem;padding:4px 10px" data-quickdinner="1">+ Suggest</button>'+
      '</div>'+
      '<div class="dash-card" data-switchtab="e"><h3>Next Event</h3>'+(nextEv?'<div style="font-weight:700;color:var(--terra);font-size:.9rem">'+esc(nextEv.name)+'</div><div style="font-size:.78rem;color:var(--muted);margin-top:3px">'+fmtDate(nextEv.date)+'</div>':'<div style="color:var(--muted);font-size:.84rem">No upcoming events</div>')+'</div>'+
      '<div class="dash-card" data-switchtab="m"><h3>My Schedule</h3>'+(todayItems.length?todayItems.map(function(item){return'<div class="dash-sched-item mp-'+item.type+'">'+esc(item.text)+'</div>';}).join(''):'<div style="color:var(--muted);font-size:.84rem">Nothing today</div>')+'</div>'+
      '<div class="dash-card" data-switchchat="1"><h3>Messages'+(function(){var u=(allMsgs||[]).filter(function(m){return m.by!==userName&&m.ts>((lastRead&&lastRead[m._cid])||0);}).length;return u?' <span style="background:var(--re);color:#fff;border-radius:10px;padding:1px 7px;font-size:.7rem">'+u+'</span>':'';})()+'</h3>'+((allMsgs&&allMsgs.length)?allMsgs.slice(0,4).map(function(m){var col=members[m.by]?members[m.by].color:'#8A7A6E';return'<div class="dash-msg">'+avt(m.by,col,20)+'<span class="dash-msg-txt">'+esc(m.by)+': '+(m.photo?'Photo':esc(m.text))+'</span><span class="dash-msg-time">'+new Date(m.ts).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})+'</span></div>';}).join(''):'<div style="color:var(--muted);font-size:.84rem">No messages yet</div>')+'</div>'+
    '</div>'+
    (function(){var todos=personalData.todos?Object.values(personalData.todos).filter(function(t){return!t.done;}):[];return todos.length?'<div class="card" style="margin-bottom:12px"><div style="font-size:.78rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:9px">To-Do</div>'+todos.slice(0,5).map(function(t){return'<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)"><input type="checkbox" class="shopchk" data-todoid="'+t.id+'" style="flex-shrink:0"><span style="font-size:.85rem;flex:1">'+esc(t.text)+'</span></div>';}).join('')+(todos.length>5?'<div style="font-size:.76rem;color:var(--muted);margin-top:6px">+'+( todos.length-5)+' more</div>':'')+'</div>':'';})();
}
function openChat(){el('chatPanel').classList.add('open');}

// ── BILLS ──
el('addBillBtn').addEventListener('click',function(){
  var n=el('billName').value.trim();if(!n){alert('Enter a bill name.');return;}
  var due=el('billDue').value;if(!due){alert('Select a due date.');return;}
  var bill={id:'bi'+Date.now(),name:n,amount:parseFloat(el('billAmt').value)||0,freq:el('billFreq').value,due:due,cat:el('billCat').value.replace(/.*value="?([^"]*)"?.*/,'$1')||'other',notes:el('billNotes').value.trim(),paid:false,paidDate:'',paidBy:'',addedBy:userName};
  // fix cat extraction
  bill.cat=el('billCat').value;
  db.ref('bills/'+bill.id).set(bill);
  ['billName','billAmt','billDue','billNotes'].forEach(function(i){el(i).value='';});
});

// bill filter bar
el('billFilterBar').addEventListener('click',function(e){
  var btn=e.target.closest('[data-bf]');if(!btn)return;
  billFilter=btn.dataset.bf;
  el('billFilterBar').querySelectorAll('button').forEach(function(b){b.className=b.dataset.bf===billFilter?'st':'sx';});
  renderBills();
});

function renderBills(){
  var today=todayKey();
  // upcoming banner
  var upcoming=bills.filter(function(b){if(b.paid)return false;var d=daysUntil(b.due);return d>=0&&d<=14;}).sort(function(a,b){return a.due<b.due?-1:1;});
  var bannerEl=el('billUpcomingBanner');
  if(bannerEl){
    bannerEl.innerHTML=upcoming.length?'<div style="margin-bottom:13px"><div class="ptitle" style="margin-bottom:7px;font-size:.9rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" fill="#e65100" opacity=".8"/><path d="M2 10h20" stroke="white" stroke-width="1.4"/></svg>Due in 14 days</div>'+upcoming.map(function(b){var bc=BILL_CATS[b.cat]||BILL_CATS.other,d=daysUntil(b.due);return'<div class="bill-row'+(d<0?' overdue':'')+'" style="border-left:4px solid '+bc.col+'"><div class="bill-icon" style="background:'+bc.bg+';color:'+bc.col+'">'+bc.icon+'</div><div class="bill-info"><div class="bill-name">'+esc(b.name)+'</div><div class="bill-meta">'+fmtDate(b.due)+(b.freq&&b.freq!=='once'?' · '+b.freq:'')+(b.notes?' · '+esc(b.notes):'')+'</div></div>'+(b.amount?'<div class="bill-amt">$'+b.amount.toFixed(2)+'</div>':'')+'<div class="bill-actions"><span class="bill-status '+(d===0?'bs-due':d<0?'bs-overdue':'bs-upcoming')+'">'+(d<0?'Overdue '+Math.abs(d)+'d':d===0?'Today':'In '+d+'d')+'</span><button class="sm st" style="font-size:.7rem;padding:3px 9px" data-paybill="'+b.id+'">Mark Paid</button></div></div>';}).join('')+'</div>':'';
  }
  // filter
  var filtered=bills.slice();
  if(billFilter==='paid')filtered=filtered.filter(function(b){return b.paid;});
  else if(billFilter==='due')filtered=filtered.filter(function(b){if(b.paid)return false;var d=daysUntil(b.due);return d>=0&&d<=14;});
  filtered.sort(function(a,b){if(a.paid&&!b.paid)return 1;if(!a.paid&&b.paid)return-1;return a.due<b.due?-1:1;});
  var listEl=el('billList');if(!listEl)return;
  if(!bills.length){listEl.innerHTML='<div class="emp"><span>💳</span>No bills yet — add one above!</div>';return;}
  if(!filtered.length){listEl.innerHTML='<div class="emp" style="padding:18px">No bills match this filter</div>';return;}
  var isAdmin=userName===ADMIN;
  listEl.innerHTML=filtered.map(function(b){
    var bc=BILL_CATS[b.cat]||BILL_CATS.other,d=daysUntil(b.due);
    var statusHtml=b.paid?'<span class="bill-status bs-paid">✓ Paid'+(b.paidDate?' '+fmtDate(b.paidDate):'')+(b.paidBy?' by '+esc(b.paidBy):'')+'</span>':d<0?'<span class="bill-status bs-overdue">Overdue '+Math.abs(d)+'d</span>':d===0?'<span class="bill-status bs-due">Due today</span>':'<span class="bill-status bs-upcoming">Due '+fmtDate(b.due)+'</span>';
    return'<div class="bill-row'+(b.paid?' paid-row':'')+(d<0&&!b.paid?' overdue':'')+'" style="border-left:4px solid '+bc.col+'">'+
      '<div class="bill-icon" style="background:'+bc.bg+';color:'+bc.col+'">'+bc.icon+'</div>'+
      '<div class="bill-info"><div class="bill-name">'+esc(b.name)+'</div><div class="bill-meta">'+(b.freq&&b.freq!=='once'?b.freq.charAt(0).toUpperCase()+b.freq.slice(1)+' · ':'')+(b.notes?esc(b.notes):'&nbsp;')+'</div></div>'+
      (b.amount?'<div class="bill-amt">$'+b.amount.toFixed(2)+'</div>':'')+
      '<div class="bill-actions">'+statusHtml+
        (!b.paid?'<button class="sm st" style="font-size:.7rem;padding:3px 9px" data-paybill="'+b.id+'">Mark Paid</button>':'<button class="sm sx" style="font-size:.7rem;padding:3px 9px" data-unpaybill="'+b.id+'">Undo</button>')+
        (userName?'<button class="sm sx" style="font-size:.7rem;padding:3px 9px" data-editbill="'+b.id+'">Edit</button>':'')+(isAdmin?'<button class="xbtn" data-delbill="'+b.id+'">🗑</button>':'')+
      '</div></div>';
  }).join('');
}

// ── RECIPES ──
el('addRecBtn').addEventListener('click',function(){var n=el('rName').value.trim();if(!n){alert('Enter a recipe name.');return;}var allTags=selectedPresetTags.slice();el('rTags').value.split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean).forEach(function(t){if(allTags.indexOf(t)<0)allTags.push(t);});var rec={id:'r'+Date.now(),name:n,cat:el('rCat').value||'Other',servings:el('rServings').value||'',diff:el('rDiff').value||'',tags:allTags,ings:el('rIngs').value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('rSteps').value.trim(),by:userName||'Family',notes:{},ratings:{},photo:'',testing:false};db.ref('recipes/'+rec.id).set(rec);['rName','rTags','rIngs','rSteps','rServings'].forEach(function(i){el(i).value='';});el('rCat').value='';el('rDiff').value='';selectedPresetTags=[];buildPresetTags();});
el('rSearch').addEventListener('input',renderRecipes);
function buildCatFilter(){var cats={};recipes.forEach(function(r){if(r.cat)cats[r.cat]=true;});var html='<span class="tag'+(activeCat===''?' on':'')+'" data-cat="">All</span>';PRESET_CATS.forEach(function(c){if(cats[c])html+='<span class="tag'+(activeCat===c?' on':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</span>';});el('catFilter').innerHTML=html;}
function buildTagFilter(){var tags={};recipes.forEach(function(r){(r.tags||[]).forEach(function(t){tags[t]=true;});});var html='<span class="tag'+(activeTag===''?' on':'')+'" data-tag="">All Tags</span>';Object.keys(tags).forEach(function(t){html+='<span class="tag'+(activeTag===t?' on':'')+'" data-tag="'+esc(t)+'">'+esc(t)+'</span>';});el('tagFilter').innerHTML=html;}
function getAvgRating(r){var rats=r.ratings?Object.values(r.ratings):[];if(!rats.length)return{avg:0,count:0};return{avg:rats.reduce(function(a,b){return a+b.stars;},0)/rats.length,count:rats.length};}
function starsHtml(rid,myR,ed){var h='<div class="stars">';for(var i=1;i<=5;i++)h+='<span class="star'+(i<=myR?' on':'')+'" data-star="'+i+'" data-rid="'+rid+'"'+(ed?'':' style="cursor:default"')+'>&#x2605;</span>';return h+'</div>';}
function avgStarsHtml(avg,rid){var pfx=rid?'id="avgr-'+rid+'"':'';var h='<div class="avg-stars" '+pfx+'>';for(var i=1;i<=5;i++)h+='<span class="avg-star'+(avg>=i?' on':'')+'">&#x2605;</span>';return h+'</div>';}
function renderRecipes(){
  var container=el('recList');var q=el('rSearch').value.toLowerCase();
  var list=recipes.filter(function(r){var ms=!q||r.name.toLowerCase().indexOf(q)>-1||(r.tags||[]).some(function(t){return t.indexOf(q)>-1;})||(r.cat||'').toLowerCase().indexOf(q)>-1;var mt=!activeTag||(r.tags||[]).indexOf(activeTag)>-1;var mc=!activeCat||(r.cat||'')===activeCat;return ms&&mt&&mc;});
  if(!list.length){container.innerHTML='<div class="emp"><span>📖</span>No recipes found!</div>';return;}
  var isAdmin=userName===ADMIN;var diffC={easy:'#eaf3ea',medium:'#fff8e1',hard:'#ffeaea'};var diffL={easy:'Easy',medium:'Medium',hard:'Hard'};
  container.innerHTML=list.map(function(r){
    var notes=r.notes?Object.values(r.notes):[];var rd=getAvgRating(r);var myR=r.ratings&&r.ratings[userName]?r.ratings[userName].stars:0;
    return'<div class="rc">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1">'+
        (r.photo?'<img src="'+esc(r.photo)+'" style="width:100%;max-height:160px;object-fit:cover;border-radius:9px;margin-bottom:9px;cursor:pointer" data-viewimg="'+esc(r.photo)+'" alt="">':'')+
        '<b style="font-size:.96rem">'+esc(r.name)+'</b>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px">'+
          '<span style="background:#f0e8ff;color:#6a3a9a;border:1px solid #c4a0f0;padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">'+esc(r.cat||'')+'</span>'+
          (r.servings?'<span style="font-size:.74rem;color:var(--muted)">Serves '+esc(r.servings)+'</span>':'')+
          (r.diff?'<span style="background:'+diffC[r.diff]+';padding:2px 8px;border-radius:20px;font-size:.74rem;font-weight:600">'+diffL[r.diff]+'</span>':'')+
          '<span style="font-size:.74rem;color:var(--muted)">by '+esc(r.by)+'</span>'+
        '</div>'+
        '<div style="margin-top:4px">'+(r.tags||[]).map(function(t){return'<span class="tag" style="cursor:default">'+esc(t)+'</span>';}).join('')+'</div>'+
        '<div style="display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap">'+avgStarsHtml(rd.avg,r.id)+'<span class="rating-count" id="avgc-'+r.id+'">'+(rd.count?rd.avg.toFixed(1)+' ('+rd.count+')':'No ratings')+'</span></div>'+
        (userName?'<div style="margin-top:3px;display:flex;align-items:center;gap:5px"><span style="font-size:.73rem;color:var(--muted)">Your rating:</span>'+starsHtml(r.id,myR,true)+'</div>':'')+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;margin-left:7px">'+
        (userName?'<button class="obn obt" data-editr="'+r.id+'" style="font-size:.7rem;padding:3px 7px">Edit</button>':'')+
        (isAdmin?'<button class="xbtn" data-delr="'+r.id+'">🗑</button>':'')+
      '</div></div>'+
      '<div class="rbtns"><button class="obn" data-togr="'+r.id+'">View</button><button class="obn obt" data-cookr="'+r.id+'">Cook</button><button class="obn" data-printr="'+r.id+'" style="border-color:#888;color:#888">Print</button>'+(userName?'<label class="obn obs" style="cursor:pointer">Photo<input type="file" accept="image/*" data-photor="'+r.id+'" style="display:none"></label>':'')+'</div>'+
      '<div class="eform" id="ef-'+r.id+'"><input type="text" id="en-'+r.id+'" value="'+esc(r.name)+'"><select id="ec-'+r.id+'">'+PRESET_CATS.map(function(c){return'<option'+(r.cat===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select><input type="text" id="et-'+r.id+'" value="'+esc((r.tags||[]).join(', '))+'" placeholder="Tags"><input type="number" id="esv-'+r.id+'" value="'+esc(r.servings||'')+'" placeholder="Servings"><select id="edf-'+r.id+'"><option value="">Difficulty</option><option value="easy"'+(r.diff==='easy'?' selected':'')+'>Easy</option><option value="medium"'+(r.diff==='medium'?' selected':'')+'>Medium</option><option value="hard"'+(r.diff==='hard'?' selected':'')+'>Hard</option></select><input type="text" id="ei-'+r.id+'" value="'+esc((r.ings||[]).join(', '))+'" placeholder="Ingredients"><textarea id="es-'+r.id+'">'+esc(r.steps||'')+'</textarea><div style="display:flex;gap:6px"><button class="sm st" data-saver="'+r.id+'">Save</button><button class="sm sx" data-canceledit="'+r.id+'">Cancel</button></div></div>'+
      '<div class="rbody" id="rb-'+r.id+'">'+
        (r.ings&&r.ings.length?'<h4>Ingredients</h4><ul>'+r.ings.map(function(i){return'<li>'+esc(i)+'</li>';}).join('')+'</ul>':'')+
        (r.steps?'<h4>Method</h4><p>'+esc(r.steps)+'</p>':'')+
        '<h4 style="margin-top:9px">Family Notes</h4>'+notes.map(function(n){var bg=n.color||'#8A7A6E';return'<div class="note"><span>'+esc(n.text)+'</span><div style="flex-shrink:0"><span class="nwho" style="background:'+bg+'">'+esc(n.by)+'</span>'+(isAdmin?'<button class="xbtn" data-delnote="'+n.id+'" data-recid="'+r.id+'">x</button>':'')+'</div></div>';}).join('')+
        '<div class="nadd"><input type="text" placeholder="Add a note..." id="ni-'+r.id+'"><button class="sm ss" data-addnote="'+r.id+'">Add</button></div>'+
      '</div></div>';
  }).join('');
}
function printRecipe(rec){var win=window.open('','_blank');var ings=rec.ings&&rec.ings.length?'<h3>Ingredients</h3><ul>'+rec.ings.map(function(i){return'<li>'+i+'</li>';}).join('')+'</ul>':'';var steps=rec.steps?'<h3>Method</h3>'+rec.steps.split('\n').filter(Boolean).map(function(s,i){return'<div style="margin-bottom:10px"><strong>Step '+(i+1)+':</strong> '+s+'</div>';}).join(''):'';win.document.write('<!DOCTYPE html><html><head><title>'+rec.name+'</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;color:#2A2218}h1{color:#B8967E;border-bottom:2px solid #B8967E;padding-bottom:10px}h3{color:#8A7A6E;margin-top:20px}ul{padding-left:18px}li{margin-bottom:6px;line-height:1.6}@media print{button{display:none}}</style></head><body><h1>'+rec.name+'</h1>'+(rec.by?'<p style="color:#8a7d70;font-size:.88rem">by '+rec.by+'</p>':'')+ings+steps+'<button onclick="window.print()" style="margin-top:20px;padding:8px 20px;background:#B8967E;color:#fff;border:none;border-radius:8px;cursor:pointer">Print</button></body></html>');win.document.close();setTimeout(function(){win.print();},300);}
function startCook(rec){el('ckTitle').textContent=rec.name;currentPrintRec=rec;var parsed=(rec.ings||[]).map(parseIng);ckSteps=(rec.steps||'').split('\n').map(function(s){return s.trim();}).filter(Boolean);ckIdx=0;ckAll=false;el('ckAllBtn').textContent='All Steps';var ingHtml='<div id="ck-ingpage"><div class="cksect">Gather Your Ingredients</div><ul class="ckingl">'+parsed.map(function(p){return'<li><span class="ckqty">'+(p.q?esc(p.q):'&mdash;')+'</span><span class="cknam">'+esc(p.n)+'</span></li>';}).join('')+'</ul><button class="cknav" onclick="showCookSteps()" style="width:100%;margin-top:7px">Ready to Cook!</button></div><div id="ck-steps" style="display:none"><div class="cksect">Method</div><div id="ck-swrap">'+ckSteps.map(function(step,i){return'<div class="ckstep'+(i===0?' on':'')+'" id="cks-'+i+'"><div class="cklbl">Step '+(i+1)+' of '+ckSteps.length+'</div><div class="cktxt">'+esc(step)+'</div></div>';}).join('')+'</div></div>';el('ckBody').innerHTML=ingHtml;el('ckPrev').style.visibility='hidden';el('ckNext').style.visibility='hidden';el('ckProg').textContent='Ingredients';el('cookMode').classList.add('on');}
function showCookSteps(){el('ck-ingpage').style.display='none';el('ck-steps').style.display='block';el('ckPrev').style.visibility='visible';el('ckNext').style.visibility='visible';updateCkNav();}
function updateCkNav(){el('ckPrev').disabled=ckIdx===0;el('ckNext').disabled=ckIdx>=ckSteps.length-1;el('ckProg').textContent='Step '+(ckIdx+1)+' of '+ckSteps.length;}
el('ckPrev').addEventListener('click',function(){var o=el('cks-'+ckIdx);if(o&&!ckAll)o.classList.remove('on');ckIdx=Math.max(0,ckIdx-1);var c=el('cks-'+ckIdx);if(c){if(!ckAll)c.classList.add('on');c.scrollIntoView({behavior:'smooth',block:'nearest'});}updateCkNav();});
el('ckNext').addEventListener('click',function(){var o=el('cks-'+ckIdx);if(o&&!ckAll)o.classList.remove('on');ckIdx=Math.min(ckSteps.length-1,ckIdx+1);var c=el('cks-'+ckIdx);if(c){if(!ckAll)c.classList.add('on');c.scrollIntoView({behavior:'smooth',block:'nearest'});}updateCkNav();});
el('ckAllBtn').addEventListener('click',function(){ckAll=!ckAll;var w=el('ck-swrap');if(!w)return;w.querySelectorAll('.ckstep').forEach(function(s){s.classList.toggle('ons',ckAll);});el('ckAllBtn').textContent=ckAll?'Step Mode':'All Steps';});
el('ckExitBtn').addEventListener('click',function(){el('cookMode').classList.remove('on');});
el('ckPrintBtn').addEventListener('click',function(){if(currentPrintRec)printRecipe(currentPrintRec);});

// ── PLANNER ──
var mealCtx={};
el('planPrev').addEventListener('click',function(){if(plannerView==='month'){planMonthOffset--;}else{planOffset--;}renderPlanner();setupPlannerListener();});
el('planNext').addEventListener('click',function(){if(plannerView==='month'){planMonthOffset++;}else{planOffset++;}renderPlanner();setupPlannerListener();});
el('mealModCancel').addEventListener('click',function(){el('mealMod').classList.add('h');});
el('mealModSave').addEventListener('click',saveMealSug);
el('mealModInp').addEventListener('keydown',function(e){if(e.key==='Enter')saveMealSug();});
el('mealModInp').addEventListener('input',function(){var q=el('mealModInp').value.toLowerCase(),list=el('mealSugList');list.innerHTML='';if(!q){list.style.display='none';return;}var m=recipes.filter(function(r){return r.name.toLowerCase().indexOf(q)>-1;}).slice(0,5);if(!m.length){list.style.display='none';return;}list.style.display='block';list.innerHTML=m.map(function(r){return'<div style="padding:5px 8px;cursor:pointer;font-size:.84rem;border-radius:6px;background:var(--cream);margin-bottom:2px" data-mealrec="'+esc(r.name)+'">'+esc(r.name)+'</div>';}).join('');});
function saveMealSug(){if(!userName){alert('Sign in first!');return;}var v=el('mealModInp').value.trim();if(!v)return;var url=el('mealModUrl').value.trim(),id='m'+Date.now(),meal={id:id,name:v,votes:{},cooker:'',by:userName};if(url)meal.url=url;db.ref('planner/'+mealCtx.wk+'/'+mealCtx.di+'/'+mealCtx.slot+'/'+id).set(meal);el('mealMod').classList.add('h');el('mealModInp').value='';el('mealModUrl').value='';el('mealSugList').innerHTML='';}
function setupPlannerListener(){if(plannerView==='month'){if(plannerRef)plannerRef.off();return;}var dates=getWeekDates(planOffset),wk=dKey(dates[0]);if(plannerRef)plannerRef.off();plannerRef=db.ref('planner/'+wk);plannerRef.on('value',function(){renderPlanner();});}
function updatePlannerViewBtns(){['day','week','month'].forEach(function(v){var btn=el('pv-'+v);if(!btn)return;btn.className='sm '+(plannerView===v?'st':'sx');btn.style.flex='1';btn.style.borderRadius='7px';});}

function renderPlanner(){
  updatePlannerViewBtns();
  if(plannerView==='month'){renderPlannerMonth();return;}
  if(plannerView==='day'){renderPlannerDay();return;}
  var dates=getWeekDates(planOffset),ws=dates[0],we=dates[6];
  el('planLabel').textContent=ws.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' - '+we.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
  var wk=dKey(ws),today=todayKey();
  db.ref('planner/'+wk).once('value',function(snap){
    var data=snap.val()||{};
    el('planGrid').style.gridTemplateColumns='repeat(7,1fr)';
    el('planGrid').innerHTML=dates.map(function(d,i){
      var dk=dKey(d),isT=dk===today,dayData=data[i]||{};
      var persItems=(personalData&&personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];
      var persHtml=persItems.length?'<div style="margin-bottom:2px">'+persItems.slice(0,3).map(function(x){return'<div class="pers-pill">'+esc(x.text.length>9?x.text.slice(0,9)+'…':x.text)+'</div>';}).join('')+'</div>':'';
      function slotHtml(sk,lbl){var meals=dayData[sk]?Object.values(dayData[sk]):[];var winner=null,maxV=0;meals.forEach(function(m){var vc=m.votes?Object.keys(m.votes).length:0;if(vc>maxV){maxV=vc;winner=m.id;}});return'<div><div class="plan-slot-lbl">'+lbl+'</div>'+meals.map(function(m){var vc=m.votes?Object.keys(m.votes).length:0;var myV=m.votes&&m.votes[userName];var isW=m.id===winner&&maxV>0;return'<div class="msug'+(isW?' winner':'')+'"><div class="msug-name">'+esc(m.name)+(m.url?'<a href="'+esc(m.url)+'" target="_blank" style="margin-left:3px;font-size:.55rem;color:var(--bl)">link</a>':'')+'</div><div class="mvotes"><button class="vbtn'+(myV?' voted':'')+'" data-vote="'+m.id+'" data-wk="'+wk+'" data-di="'+i+'" data-slot="'+sk+'">+'+vc+'</button><button class="cclaim'+(m.cooker?' claimed':'')+'" data-cook="'+m.id+'" data-wk="'+wk+'" data-di="'+i+'" data-slot="'+sk+'">'+(m.cooker?esc(m.cooker.charAt(0)):'Cook?')+'</button><button class="xbtn" style="font-size:.58rem" data-delmeal="'+m.id+'" data-wk="'+wk+'" data-di="'+i+'" data-slot="'+sk+'">x</button></div></div>';}).join('')+'<button class="add-meal-btn" data-addmeal="1" data-wk="'+wk+'" data-di="'+i+'" data-slot="'+sk+'">+ suggest</button></div>';}
      return'<div class="plan-day'+(isT?' tod':'')+'" data-di="'+i+'" data-wk="'+wk+'" data-dk="'+dk+'"><h4>'+DAYS[i]+'</h4><div class="plan-date">'+d.getDate()+'/'+(d.getMonth()+1)+'</div>'+persHtml+slotHtml('B','B')+slotHtml('L','L')+slotHtml('D','D')+'</div>';
    }).join('');
  });
}
el('dayDetailClose').addEventListener('click',function(){el('dayDetailMod').classList.add('h');});

function renderPlannerDay(){
  var dayDate=new Date();dayDate.setDate(dayDate.getDate()+planOffset);
  var dk=dKey(dayDate),dayIdx=dayDate.getDay()-1;if(dayIdx<0)dayIdx=6;
  el('planLabel').textContent=dayDate.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
  el('planGrid').style.gridTemplateColumns='1fr';
  var wkKey=dKey(getWeekDates(Math.floor(planOffset/7))[0]);
  db.ref('planner/'+wkKey+'/'+dayIdx).once('value',function(snap){
    var dayData=snap.val()||{},today=todayKey(),isT=dk===today;
    var persItems=(personalData&&personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];
    var persSection='';
    if(persItems.length){
      var typeLabels={B:'Breakfast',L:'Lunch',S:'Snack',work:'Work',uni:'Uni',appt:'Appointment',workout:'Workout'};
      persSection='<div style="margin-bottom:13px"><div class="dd-slot-hdr" style="color:var(--terra)">My Schedule — synced from My Page</div>'+persItems.map(function(x){return'<div class="mpill mp-'+x.type+'" style="padding:6px 9px;border-radius:8px;margin-bottom:4px;font-size:.82rem">'+esc(x.text)+'<span style="font-size:.7rem;color:var(--muted);margin-left:6px">'+(typeLabels[x.type]||x.type)+'</span></div>';}).join('')+'</div>';
    }
    function slotHtml(sk,lbl){var meals=dayData[sk]?Object.values(dayData[sk]):[];var winner=null,maxV=0;meals.forEach(function(m){var vc=m.votes?Object.keys(m.votes).length:0;if(vc>maxV){maxV=vc;winner=m.id;}});
      return'<div style="margin-bottom:14px"><div class="dd-slot-hdr">'+lbl+'</div>'+meals.map(function(m){var vc=m.votes?Object.keys(m.votes).length:0,myV=m.votes&&m.votes[userName],isW=m.id===winner&&maxV>0;
        return'<div class="msug'+(isW?' winner':'')+'" style="padding:8px 10px;margin-bottom:6px"><div class="msug-name" style="font-size:.88rem">'+esc(m.name)+(m.url?'<a href="'+esc(m.url)+'" target="_blank" style="margin-left:5px;font-size:.75rem;color:var(--bl)">link</a>':'')+'</div>'+
        '<div class="mvotes" style="margin-top:5px"><button class="vbtn'+(myV?' voted':'')+'" data-vote="'+m.id+'" data-wk="'+wkKey+'" data-di="'+dayIdx+'" data-slot="'+sk+'">+'+vc+'</button>'+
        '<button class="cclaim'+(m.cooker?' claimed':'')+'" data-cook="'+m.id+'" data-wk="'+wkKey+'" data-di="'+dayIdx+'" data-slot="'+sk+'">'+(m.cooker?esc(m.cooker):'Who is cooking?')+'</button>'+
        '<button class="sm sx" style="font-size:.72rem;padding:3px 8px" data-pushtotesting="'+m.id+'" data-mname="'+esc(m.name)+'">Test</button>'+
        '<button class="xbtn" data-delmeal="'+m.id+'" data-wk="'+wkKey+'" data-di="'+dayIdx+'" data-slot="'+sk+'">x</button></div></div>';
      }).join('')+
      '<button class="add-meal-btn" style="padding:6px;font-size:.78rem" data-addmeal="1" data-wk="'+wkKey+'" data-di="'+dayIdx+'" data-slot="'+sk+'">+ suggest</button></div>';}
    el('planGrid').innerHTML='<div class="plan-day'+(isT?' tod':'')+'" style="padding:12px;cursor:default">'+
      '<div style="font-weight:700;font-size:.95rem;margin-bottom:12px;color:var(--charcoal)">'+dayDate.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</div>'+
      persSection+slotHtml('B','Breakfast')+slotHtml('L','Lunch')+slotHtml('D','Dinner')+
    '</div>';
  });
}

function renderPlannerMonth(){
  var mdata=getMonthDates(planMonthOffset);el('planLabel').textContent=mdata.label;
  el('planGrid').style.gridTemplateColumns='repeat(7,1fr)';
  var firstDay=mdata.days[0].getDay();if(firstDay===0)firstDay=7;
  var today=todayKey(),uniqueWks=[],allData={},wkDone=0;
  mdata.days.forEach(function(d){var monday=new Date(d),dow=monday.getDay()||7;monday.setDate(monday.getDate()-dow+1);var wkKey=dKey(monday);if(uniqueWks.indexOf(wkKey)<0)uniqueWks.push(wkKey);});
  var pending=uniqueWks.length;
  function render(){
    var html='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;grid-column:1/-1">'+['M','T','W','T','F','S','S'].map(function(d){return'<div style="text-align:center;font-size:.65rem;font-weight:700;color:var(--muted);padding:3px">'+d+'</div>';}).join('')+'</div>';
    for(var ei=1;ei<firstDay;ei++)html+='<div></div>';
    mdata.days.forEach(function(d){
      var dk=dKey(d),isT=dk===today,monday=new Date(d),dow=monday.getDay()||7;monday.setDate(monday.getDate()-dow+1);
      var wkKey=dKey(monday),dayIdx=d.getDay()-1;if(dayIdx<0)dayIdx=6;
      var dayData=(allData[wkKey]&&allData[wkKey][dayIdx])||{};
      var dinners=dayData['D']?Object.values(dayData['D']):[];var winner=null,maxV=0;dinners.forEach(function(m){var vc=m.votes?Object.keys(m.votes).length:0;if(vc>=maxV){maxV=vc;winner=m;}});
      var persItems=(personalData&&personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];
      html+='<div style="background:#fff;border-radius:7px;padding:4px;border:1.5px solid '+(isT?'var(--terra)':'var(--border)')+';min-height:52px;cursor:pointer" data-di="'+dayIdx+'" data-wk="'+wkKey+'" data-dk="'+dk+'">'+
        '<div style="font-size:.65rem;font-weight:700;color:'+(isT?'var(--terra)':'var(--muted)')+'">'+d.getDate()+'</div>'+
        (winner?'<div style="font-size:.58rem;background:#eaf3ea;border-radius:3px;padding:1px 3px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#2a6a2a">'+esc(winner.name)+'</div>':'')+
        (persItems.length?'<div style="font-size:.54rem;color:var(--terrad);margin-top:1px;font-weight:600">'+persItems.length+' item'+(persItems.length>1?'s':'')+'</div>':'')+
        (dinners.length===0&&!persItems.length?'<div style="font-size:.55rem;color:var(--border);margin-top:3px;text-align:center">+</div>':'')+
      '</div>';
    });
    el('planGrid').innerHTML=html;el('planGrid').style.gridTemplateColumns='repeat(7,1fr)';
  }
  if(!pending){render();return;}
  uniqueWks.forEach(function(wkKey){db.ref('planner/'+wkKey).once('value',function(snap){allData[wkKey]=snap.val()||{};wkDone++;if(wkDone===pending)render();});});
}

function openDayDetail(di,wk,dk,dayData){var d=getWeekDates(planOffset)[di];el('dayDetailTitle').textContent=DAYS[di]+' '+d.getDate()+'/'+(d.getMonth()+1);function slotDetailHtml(sk,lbl){var meals=dayData[sk]?Object.values(dayData[sk]):[];var memberOpts=Object.keys(members).map(function(n){return'<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');return'<div class="dd-slot"><div class="dd-slot-hdr">'+lbl+'</div>'+meals.map(function(m){var vc=m.votes?Object.keys(m.votes).length:0,myV=m.votes&&m.votes[userName];return'<div class="dd-meal"><div class="dd-meal-name">'+esc(m.name)+(m.url?' <a href="'+esc(m.url)+'" target="_blank" style="font-size:.75rem;color:var(--bl)">link</a>':'')+'</div><div class="dd-meal-actions"><button class="vbtn'+(myV?' voted':'')+' sm" data-vote="'+m.id+'" data-wk="'+wk+'" data-di="'+di+'" data-slot="'+sk+'" style="font-size:.8rem;padding:5px 10px">+'+vc+'</button><select class="dd-cook-sel" data-setcook="'+m.id+'" data-wk="'+wk+'" data-di="'+di+'" data-slot="'+sk+'"><option value="">Who is cooking?</option>'+memberOpts+'</select>'+(m.cooker?'<span style="font-size:.78rem;color:var(--sage);font-weight:700">'+esc(m.cooker)+'</span>':'')+'<button class="xbtn" data-delmeal="'+m.id+'" data-wk="'+wk+'" data-di="'+di+'" data-slot="'+sk+'">x</button></div></div>';}).join('')+'<div class="dd-add"><input type="text" placeholder="+ Add meal..." id="ddadd-'+sk+'-'+di+'"><button class="sm st" data-ddaddmeal="'+sk+'" data-wk="'+wk+'" data-di="'+di+'">Add</button></div></div>';}el('dayDetailBody').innerHTML=slotDetailHtml('B','Breakfast')+slotDetailHtml('L','Lunch')+slotDetailHtml('D','Dinner');el('dayDetailBody').querySelectorAll('[data-setcook]').forEach(function(sel){sel.addEventListener('change',function(){var cook=sel.value;if(!cook)return;db.ref('planner/'+sel.dataset.wk+'/'+sel.dataset.di+'/'+sel.dataset.slot+'/'+sel.dataset.setcook+'/cooker').set(cook);setTimeout(function(){refreshDayDetail(parseInt(sel.dataset.di),sel.dataset.wk,'');},400);});});el('dayDetailMod').classList.remove('h');}
function refreshDayDetail(di,wk,dk){db.ref('planner/'+wk+'/'+di).once('value',function(snap){openDayDetail(di,wk,dk,snap.val()||{});});}

el('fmtBtn').addEventListener('click',function(){var raw=el('fmtInput').value.trim();if(!raw){alert('Paste a recipe first!');return;}var res=el('fmtResult');res.classList.add('on');res.innerHTML='<div class="ai-loading">Formatting your recipe...</div>';fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:'Format this recipe into clean sections. Return ONLY JSON with keys: name, category (one of: Breakfast/Mains/Chicken/Beef/Lamb/Pork/Seafood/Vegetarian/Vegan/Salads/Soups/Sides/Snacks/Desserts/Sweet Treats/Cakes/Breads/Drinks/Other), servings (number only), ingredients (array of strings), steps (array of strings). No markdown, no preamble, just JSON.\n\nRecipe:\n'+raw}]})}).then(function(r){return r.json();}).then(function(data){try{var txt=data.content.map(function(i){return i.text||'';}).join('');var clean=txt.replace(/```json|```/g,'').trim();var parsed=JSON.parse(clean);res.innerHTML='<div style="font-weight:700;font-size:1rem;margin-bottom:8px;color:var(--terra)">'+esc(parsed.name||'Recipe')+'</div>'+(parsed.ingredients&&parsed.ingredients.length?'<div style="font-weight:700;font-size:.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:5px">Ingredients</div><ul style="padding-left:16px;margin-bottom:12px">'+parsed.ingredients.map(function(i){return'<li style="font-size:.87rem;margin-bottom:3px">'+esc(i)+'</li>';}).join('')+'</ul>':'')+(parsed.steps&&parsed.steps.length?'<div style="font-weight:700;font-size:.8rem;color:var(--muted);text-transform:uppercase;margin-bottom:5px">Method</div>'+parsed.steps.map(function(s,i){return'<div style="font-size:.87rem;margin-bottom:8px;padding:6px 9px;background:#fff;border-radius:7px;border:1px solid var(--border)"><strong>Step '+(i+1)+':</strong> '+esc(s)+'</div>';}).join(''):'')+'<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="font-size:.82rem;padding:7px 14px" data-usefmt=\''+JSON.stringify(parsed).replace(/'/g,"&#39;")+'\'>Use This Recipe</button><button class="sm sx" id="fmtClear2">Clear</button></div>';el('fmtClear2').addEventListener('click',function(){res.innerHTML='';res.classList.remove('on');el('fmtInput').value='';});}catch(err){res.innerHTML='<p style="color:var(--re);font-size:.85rem">Could not parse. Please try again.</p>';}}).catch(function(){res.innerHTML='<p style="color:var(--re);font-size:.85rem">AI formatting failed.</p>';});});
el('fmtClear').addEventListener('click',function(){el('fmtInput').value='';el('fmtResult').innerHTML='';el('fmtResult').classList.remove('on');});

// ── CHAT ──
function buildGroupMemSelect(){var w=el('groupMemSelect');if(!w)return;w.innerHTML=Object.keys(members).filter(function(n){return n!==userName;}).map(function(n){var m=members[n];var on=groupSelectedMembers.indexOf(n)>-1;return'<div class="mem-chip'+(on?' on':'')+'" data-gmem="'+esc(n)+'">'+avt(n,m.color,18)+'<span>'+esc(n)+'</span></div>';}).join('');}
function buildChatTabs(){var tabs2=el('chatTabs');if(!tabs2||!userName)return;db.ref('chatGroups').once('value',function(snap){var groups=[];snap.forEach(function(c){var g=c.val();if(g.members&&g.members[userName])groups.push(g);});var html='<button class="chat-tab'+(currentConvoId==='family'?' on':'')+'" data-conv="family" data-cname="Hearth Chat">Hearth</button>';Object.keys(members).forEach(function(n){if(n===userName)return;var cid=[userName,n].sort().join('_');html+='<button class="chat-tab'+(currentConvoId===cid?' on':'')+'" data-conv="'+esc(cid)+'" data-cname="'+esc(n)+'">'+avt(n,members[n]?members[n].color:'#8A7A6E',16)+'<span>'+esc(n)+'</span></button>';});groups.forEach(function(g){html+='<button class="chat-tab'+(currentConvoId===g.id?' on':'')+'" data-conv="'+esc(g.id)+'" data-cname="'+esc(g.name)+'" data-gid="'+esc(g.id)+'">'+esc(g.name)+'</button>';});html+='<button class="chat-tab" id="newGroupBtn">+ Group</button>';tabs2.innerHTML=html;el('newGroupBtn').addEventListener('click',function(){el('groupMod').classList.remove('h');buildGroupMemSelect();});});}
function listenToConvo(convId){if(chatListeners[convId])return;var ref=db.ref('chats/'+convId).limitToLast(60);ref.on('value',function(snap){if(currentConvoId!==convId)return;var msgs=[];snap.forEach(function(c){msgs.push(c.val());});renderMsgs(msgs);});chatListeners[convId]=ref;}
function switchConvo(convId,convName,gid){currentConvoId=convId;currentConvoName=convName;el('chatTitle').innerHTML=(gid?'<button data-addmembers="'+esc(gid)+'" style="background:rgba(255,255,255,.25);border:none;color:#fff;font-size:.72rem;padding:3px 8px;border-radius:8px;cursor:pointer;margin-right:6px">+ Members</button>':'')+esc(convName);el('chatMessages').innerHTML='<div style="text-align:center;color:var(--muted);font-size:.8rem;padding:20px">Loading...</div>';el('chatTabs').querySelectorAll('.chat-tab').forEach(function(t){t.classList.toggle('on',t.dataset.conv===convId);});listenToConvo(convId);if(userName)db.ref('personal/'+userName+'/lastRead/'+convId).set(Date.now());}
function renderMsgs(msgs){var c=el('chatMessages');if(!msgs.length){c.innerHTML='<div style="text-align:center;color:var(--muted);font-size:.8rem;padding:20px">No messages yet. Say hi!</div>';return;}c.innerHTML=msgs.map(function(m){var mine=m.by===userName;var content=m.photo?'<img class="msg-img" src="'+esc(m.photo)+'" data-viewimg="'+esc(m.photo)+'" alt="photo">':'<div class="msg-text">'+esc(m.text)+'</div>';return'<div class="msg-bubble'+(mine?' mine':' theirs')+'">'+content+'<div class="msg-meta">'+(mine?'':('<span style="color:'+(m.color||'#8A7A6E')+';font-weight:600">'+esc(m.by)+'</span> - '))+new Date(m.ts).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})+'</div></div>';}).join('');c.scrollTop=c.scrollHeight;}
el('chatToggle').addEventListener('click',function(){el('chatPanel').classList.toggle('open');});
el('chatClose').addEventListener('click',function(){el('chatPanel').classList.remove('open');});
el('chatSend').addEventListener('click',sendMsg);
el('chatInp').addEventListener('keydown',function(e){if(e.key==='Enter')sendMsg();});
function sendMsg(){var v=el('chatInp').value.trim();if(!v||!userName)return;db.ref('chats/'+currentConvoId).push({text:v,by:userName,color:userColor,ts:Date.now()});el('chatInp').value='';}
el('chatPhotoInp').addEventListener('change',function(){var file=this.files[0];if(!file||!userName)return;var reader=new FileReader();reader.onload=function(ev){db.ref('chats/'+currentConvoId).push({photo:ev.target.result,by:userName,color:userColor,ts:Date.now(),text:'photo'});};reader.readAsDataURL(file);this.value='';});
el('groupCancel').addEventListener('click',function(){el('groupMod').classList.add('h');groupSelectedMembers=[];});
el('groupCreate').addEventListener('click',function(){var name=el('groupName').value.trim();if(!name){alert('Enter a group name.');return;}if(groupSelectedMembers.length===0){alert('Select at least one member.');return;}var gid='g'+Date.now(),mems={};mems[userName]=true;groupSelectedMembers.forEach(function(m){mems[m]=true;});db.ref('chatGroups/'+gid).set({id:gid,name:name,members:mems,by:userName});el('groupMod').classList.add('h');el('groupName').value='';groupSelectedMembers=[];buildChatTabs();switchConvo(gid,name,gid);el('chatPanel').classList.add('open');});
el('addMembersCancel').addEventListener('click',function(){el('addMembersMod').classList.add('h');addMembersSelected=[];});
el('addMembersSave').addEventListener('click',function(){if(!addMembersGid||!addMembersSelected.length){alert('Select at least one member.');return;}var updates={};addMembersSelected.forEach(function(n){updates[n]=true;});db.ref('chatGroups/'+addMembersGid+'/members').update(updates);el('addMembersMod').classList.add('h');addMembersSelected=[];buildChatTabs();alert('Members added!');});
function buildAddMembersSelect(){var w=el('addMembersSelect');if(!w)return;var available=Object.keys(members).filter(function(n){return n!==userName&&!addMembersCurrent[n];});if(!available.length){w.innerHTML='<p style="color:var(--muted);font-size:.84rem">All members already in this group!</p>';return;}w.innerHTML=available.map(function(n){var m=members[n];var on=addMembersSelected.indexOf(n)>-1;return'<div class="mem-chip'+(on?' on':'')+'" data-addmem="'+esc(n)+'">'+avt(n,m.color,18)+'<span>'+esc(n)+'</span></div>';}).join('');}
function openAddMembers(gid){db.ref('chatGroups/'+gid).once('value',function(snap){var g=snap.val();if(!g)return;addMembersGid=gid;addMembersCurrent=g.members||{};el('addMembersTitle').textContent='Add to '+g.name;buildAddMembersSelect();el('addMembersMod').classList.remove('h');});}

// ── EVENTS ──
el('addEvBtn').addEventListener('click',function(){var n=el('evName').value.trim();if(!n){alert('Enter an event name.');return;}var ci=events.length%EVENT_COLORS.length,ev={id:'e'+Date.now(),name:n,date:el('evDate').value,desc:el('evDesc').value.trim(),dishes:{},invitees:{},color:EVENT_COLORS[ci]};db.ref('events/'+ev.id).set(ev);['evName','evDate','evDesc'].forEach(function(i){el(i).value='';});});
function renderEvents(){var container=el('evList');if(!events.length){container.innerHTML='<div class="emp"><span>📅</span>No events yet!</div>';return;}var sorted=events.slice().sort(function(a,b){return(a.date||'9999')<(b.date||'9999')?-1:1;});var isAdmin=userName===ADMIN;container.innerHTML=sorted.map(function(ev){var dishes=ev.dishes?Object.values(ev.dishes):[],ec=ev.color||EVENT_COLORS[0],invitees=ev.invitees?Object.keys(ev.invitees):[];return'<div class="card" style="border-left:5px solid '+ec+'"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><b style="font-size:.97rem;color:'+ec+'">'+esc(ev.name)+'</b>'+(ev.date?'<br><span class="evbadge" style="background:'+ec+'">'+fmtDate(ev.date)+'</span>':'')+(ev.desc?'<p style="font-size:.84rem;color:var(--muted);margin-top:4px">'+esc(ev.desc)+'</p>':'')+'</div><div style="display:flex;gap:5px;flex-direction:column">'+(isAdmin?'<button class="xbtn" data-delev="'+ev.id+'">🗑</button>':'')+'<button class="sm ss" style="font-size:.72rem;padding:3px 8px" data-evinvite="'+ev.id+'">Invite</button></div></div>'+(invitees.length?'<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">'+invitees.map(function(n){var col=members[n]?members[n].color:'#8A7A6E';return avt(n,col,24);}).join('')+'</div>':'')+'<div style="margin-top:11px"><div style="font-size:.74rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:7px">Bringing What</div>'+dishes.map(function(d){return'<div class="drow'+(d.by?' claimed':'')+'"><input type="checkbox" class="dchk"'+(d.by?' checked':'')+' data-dci="'+d.id+'" data-dev="'+ev.id+'"><span class="dnam">'+esc(d.name)+'</span>'+(d.by?'<span class="dwho">'+esc(d.by)+'</span>':'')+(!d.by&&isAdmin?'<button class="xbtn" data-deld="'+d.id+'" data-dev="'+ev.id+'">x</button>':'')+'</div>';}).join('')+'<div class="dacwrap" id="dac-'+ev.id+'"><input class="dacinp" id="dacinp-'+ev.id+'" type="text" placeholder="Type dish..." autocomplete="off"><div class="daclist" id="daclist-'+ev.id+'"></div></div><button class="dadb" data-dadd="'+ev.id+'">+ Add Dish</button></div></div>';}).join('');events.forEach(function(ev){var inp=el('dacinp-'+ev.id),list=el('daclist-'+ev.id);if(!inp||!list)return;inp.addEventListener('input',function(){var q=inp.value.toLowerCase();list.innerHTML='';if(!q){list.style.display='none';return;}var m=recipes.filter(function(r){return r.name.toLowerCase().indexOf(q)>-1;}).slice(0,6);if(!m.length){list.style.display='none';return;}list.style.display='block';list.innerHTML=m.map(function(r){return'<div class="dacitem" data-recname="'+esc(r.name)+'" data-evid="'+ev.id+'">'+esc(r.name)+'</div>';}).join('');});inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();addDish(ev.id);}});});}
function addDish(evid){var inp=el('dacinp-'+evid);if(!inp||!inp.value.trim())return;var list=el('daclist-'+evid);if(list)list.style.display='none';var did='d'+Date.now();db.ref('events/'+evid+'/dishes/'+did).set({id:did,name:inp.value.trim(),by:''});inp.value='';inp.focus();}
el('evInviteCancel').addEventListener('click',function(){el('evInviteMod').classList.add('h');});
el('evInviteSave').addEventListener('click',function(){if(!evInviteId)return;el('evInviteSelect').querySelectorAll('.mem-chip.on').forEach(function(chip){db.ref('events/'+evInviteId+'/invitees/'+chip.dataset.invitemem).set(true);});el('evInviteMod').classList.add('h');alert('Invites sent!');});

// ── TESTING ──
el('addTestBtn').addEventListener('click',function(){var n=el('tName').value.trim();if(!n){alert('Enter a recipe name.');return;}var rec={id:'r'+Date.now(),name:n,cat:el('tCat').value||'Other',ings:el('tIngs').value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('tSteps').value.trim(),by:userName||'Family',notes:{},ratings:{},photo:'',testing:true,tags:[]};db.ref('recipes/'+rec.id).set(rec);['tName','tIngs','tSteps'].forEach(function(i){el(i).value='';});el('tCat').value='';});
function renderTestRecipes(){var container=el('testList');if(!testRecipes.length){container.innerHTML='<div class="emp"><span>🧪</span>No recipes being tested!</div>';return;}var isAdmin=userName===ADMIN;container.innerHTML=testRecipes.map(function(r){var notes=r.notes?Object.values(r.notes):[],rd=getAvgRating(r),myR=r.ratings&&r.ratings[userName]?r.ratings[userName].stars:0;return'<div class="rc" style="border-left:4px solid #f5a623"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1">'+(r.photo?'<img src="'+esc(r.photo)+'" style="width:100%;max-height:140px;object-fit:cover;border-radius:9px;margin-bottom:8px;cursor:pointer" data-viewimg="'+esc(r.photo)+'" alt="">':'')+'<b>'+esc(r.name)+'</b> <span class="test-badge">TESTING</span><div style="font-size:.74rem;color:var(--muted);margin-top:2px">'+esc(r.cat)+' - by '+esc(r.by)+'</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px">'+avgStarsHtml(rd.avg,r.id)+'<span class="rating-count" id="avgc-'+r.id+'">'+(rd.count?rd.avg.toFixed(1)+' ('+rd.count+')':'No ratings')+'</span></div>'+(userName?'<div style="margin-top:3px;display:flex;align-items:center;gap:5px"><span style="font-size:.72rem;color:var(--muted)">Your rating:</span>'+starsHtml(r.id,myR,true)+'</div>':'')+'</div><div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;margin-left:6px">'+(userName?'<button class="obn obt" data-editt="'+r.id+'" style="font-size:.7rem;padding:3px 7px">Edit</button>':'')+(isAdmin?'<button class="approve-btn" data-approve="'+r.id+'">Approve</button>':'')+(isAdmin?'<button class="xbtn" data-delr="'+r.id+'">🗑</button>':'')+'</div></div><div class="rbtns"><button class="obn" data-togtr="'+r.id+'">View</button><button class="obn obt" data-cookr="'+r.id+'">Cook</button>'+(userName?'<label class="obn obs" style="cursor:pointer">Photo<input type="file" accept="image/*" data-photor="'+r.id+'" style="display:none"></label>':'')+'</div><div class="eform" id="tef-'+r.id+'"><input type="text" id="ten-'+r.id+'" value="'+esc(r.name)+'"><select id="tec-'+r.id+'">'+PRESET_CATS.map(function(c){return'<option'+(r.cat===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select><input type="text" id="tei-'+r.id+'" value="'+esc((r.ings||[]).join(', '))+'" placeholder="Ingredients"><textarea id="tes-'+r.id+'">'+esc(r.steps||'')+'</textarea><div style="display:flex;gap:6px"><button class="sm st" data-savet="'+r.id+'">Save</button><button class="sm sx" data-cancelt="'+r.id+'">Cancel</button></div></div><div class="rbody" id="trb-'+r.id+'">'+(r.ings&&r.ings.length?'<h4>Ingredients</h4><ul>'+r.ings.map(function(i){return'<li>'+esc(i)+'</li>';}).join('')+'</ul>':'')+(r.steps?'<h4>Method</h4><p>'+esc(r.steps)+'</p>':'')+'<h4 style="margin-top:7px">Feedback</h4>'+notes.map(function(n){var bg=n.color||'#8A7A6E';return'<div class="note"><span>'+esc(n.text)+'</span><span class="nwho" style="background:'+bg+'">'+esc(n.by)+'</span></div>';}).join('')+'<div class="nadd"><input type="text" placeholder="Leave feedback..." id="tni-'+r.id+'"><button class="sm ss" data-addtnote="'+r.id+'">Add</button></div></div></div>';}).join('');}

// ── SHOPPING ──
el('shopAddBtn').addEventListener('click',addShopItem);
el('shopInp').addEventListener('keydown',function(e){if(e.key==='Enter')addShopItem();});
function addShopItem(){var v=el('shopInp').value.trim();if(!v)return;var id='sh'+Date.now();db.ref('shopping/'+id).set({id:id,name:v,done:false,by:'',addedBy:userName||''});el('shopInp').value='';}
el('shopClearBtn').addEventListener('click',function(){shopItems.filter(function(s){return s.done;}).forEach(function(s){db.ref('shopping/'+s.id).remove();});});
function renderShopping(){var c=el('shopList');if(!shopItems.length){c.innerHTML='<div class="emp"><span>🛒</span>List is empty!</div>';return;}var isAdmin=userName===ADMIN;c.innerHTML=shopItems.map(function(s){return'<div class="shoprow"><input type="checkbox" class="shopchk"'+(s.done?' checked':'')+' data-shid="'+s.id+'"><span class="shopnam'+(s.done?' done':'')+'">'+esc(s.name)+'</span>'+(s.addedBy?'<span style="margin-left:5px">'+avt(s.addedBy,members[s.addedBy]?members[s.addedBy].color:'#8A7A6E',16)+'</span>':'')+(s.done?'<span class="shopby">'+esc(s.by)+'</span>':'')+(isAdmin?'<button class="xbtn" data-dsh="'+s.id+'">🗑</button>':'')+'</div>';}).join('');}

// ── PERSONAL / MY PAGE ──
// KEY CHANGE: loadPersonal now triggers planner re-render when planner tab is active
function loadPersonal(){if(!userName)return;db.ref('personal/'+userName).on('value',function(snap){personalData=snap.val()||{};if(el('pg-m').classList.contains('on'))renderMyPage();if(el('pg-d').classList.contains('on'))renderDashboard();if(el('pg-p').classList.contains('on'))renderPlanner();if(el('pg-c').classList.contains('on'))renderCalendar();});}
function savePers(path,val){if(!userName)return;db.ref('personal/'+userName+'/'+path).set(val);}

function renderMyPage(){
  if(!userName){el('myPage').innerHTML='<div class="emp"><span>👤</span>Sign in first!</div>';return;}
  var today=todayKey(),quote=personalData.quote||QUOTES[Math.floor(Math.random()*QUOTES.length)];
  var viewToggle='<div style="display:flex;gap:6px;margin-bottom:12px;background:#fff;border-radius:10px;padding:5px;border:1px solid var(--border)">'+['day','week','month'].map(function(v){return'<button class="sm'+(myPageView===v?' st':' sx')+'" style="flex:1;border-radius:7px" data-mypageview="'+v+'">'+{day:'Day',week:'Week',month:'Month'}[v]+'</button>';}).join('')+'</div>';
  var syncNotice='<div class="cal-sync-notice"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1-7h2v2h-2zm0-8h2v6h-2z" fill="currentColor"/></svg>Add here once — appears automatically in Planner &amp; Dashboard</div>';
  var todos=personalData.todos?Object.values(personalData.todos):[];
  var todoHtml='<div class="sbox"><h3>To-Do List</h3><div style="display:flex;gap:7px;margin-bottom:10px"><input type="text" id="todoInp" placeholder="Add a task..." style="flex:1;padding:8px 11px;border:1.5px solid var(--border);border-radius:9px;font-size:.88rem;outline:none;font-family:inherit"><button class="sm st" id="todoAddBtn">Add</button></div>'+(todos.length?todos.map(function(t){return'<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)"><input type="checkbox" class="shopchk" '+(t.done?'checked':'')+' data-todoid="'+t.id+'"><span style="flex:1;font-size:.88rem;'+(t.done?'text-decoration:line-through;color:var(--muted)':'')+'">'+esc(t.text)+'</span><button class="xbtn" data-deltodo="'+t.id+'">x</button></div>';}).join(''):'<div style="color:var(--muted);font-size:.84rem;padding:8px 0">No tasks yet!</div>')+'</div>';
  var grid='',navHtml='';
  if(myPageView==='day'){
    var dayDate=new Date();dayDate.setDate(dayDate.getDate()+weekOffset);var dk=dKey(dayDate);
    navHtml='<div class="wnav"><button id="prevWk">Prev</button><span>'+dayDate.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</span><button id="nextWk">Next</button></div>';
    var dayItems=(personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];
    var typeLabels={B:'Breakfast',L:'Lunch',S:'Snack',work:'Work',uni:'Uni',appt:'Appointment',workout:'Workout'};
    grid=syncNotice+'<div class="card" style="'+(dk===today?'border-color:var(--terra)':'')+'">'+(!dayItems.length?'<div style="color:var(--muted);font-size:.84rem;padding:8px">Nothing planned.</div>':['work','uni','appt','workout','B','L','S'].map(function(type){var items=dayItems.filter(function(x){return x.type===type;});if(!items.length)return'';return'<div style="margin-bottom:10px"><div style="font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:5px">'+(typeLabels[type]||type)+'</div>'+items.map(function(item){return'<div class="mpill mp-'+type+'" style="display:flex;justify-content:space-between;padding:6px 9px;margin-bottom:4px;border-radius:8px"><span>'+esc(item.text)+'</span><button class="xbtn" data-dday="'+item.id+'" data-dk="'+dk+'">x</button></div>';}).join('')+'</div>';}).join(''))+'<button class="sbtn" style="width:100%;font-size:.83rem;padding:7px" data-addd="'+dk+'">+ Add to this day</button></div>';
  } else if(myPageView==='week'){
    var dates=getWeekDates(weekOffset),ws=dates[0],we=dates[6];
    navHtml='<div class="wnav"><button id="prevWk">Prev</button><span>'+ws.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' - '+we.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})+'</span><button id="nextWk">Next</button></div>';
    function pill(type,text,id,dk){var short=text.length>10?text.slice(0,10)+'...':text;return'<div class="mpill mp-'+type+'">'+esc(short)+'<button class="xbtn" style="font-size:.52rem;padding:0 2px" data-dday="'+id+'" data-dk="'+dk+'">x</button></div>';}
    grid=syncNotice+'<div class="wgrid">'+dates.map(function(d,i){var dk=dKey(d),isT=dk===today,dayItems=(personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];var bI=dayItems.filter(function(x){return x.type==='B';}),lI=dayItems.filter(function(x){return x.type==='L';}),sI=dayItems.filter(function(x){return x.type==='S';}),cI=dayItems.filter(function(x){return['work','uni','appt','workout'].indexOf(x.type)>-1;});function rp(arr){return arr.map(function(x){return pill(x.type,x.text,x.id,dk);}).join('');}return'<div class="dcard'+(isT?' tod':'')+'"><h4>'+DAYS[i]+'</h4><div class="ddate">'+d.getDate()+'/'+(d.getMonth()+1)+'</div>'+rp(cI)+'<div class="slothdr">B</div>'+rp(bI)+'<div class="slothdr">L</div>'+rp(lI)+'<div class="slothdr">S</div>'+rp(sI)+'<button class="addpill" data-addd="'+dk+'">+</button></div>';}).join('')+'</div>';
  } else {
    var mdata=getMonthDates(monthOffset);
    navHtml='<div class="wnav"><button id="prevWk">Prev</button><span>'+mdata.label+'</span><button id="nextWk">Next</button></div>';
    var firstDay=mdata.days[0].getDay();if(firstDay===0)firstDay=7;
    grid=syncNotice+'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:13px">'+['M','T','W','T','F','S','S'].map(function(d){return'<div style="text-align:center;font-size:.65rem;font-weight:700;color:var(--muted);padding:3px">'+d+'</div>';}).join('');
    for(var ei=1;ei<firstDay;ei++)grid+='<div></div>';
    mdata.days.forEach(function(d){var dk=dKey(d),isT=dk===today,dayItems=(personalData.days&&personalData.days[dk]&&personalData.days[dk].items)?Object.values(personalData.days[dk].items):[];grid+='<div style="background:#fff;border-radius:7px;padding:4px;border:1.5px solid '+(isT?'var(--terra)':'var(--border)')+';min-height:44px;cursor:pointer" data-addd="'+dk+'"><div style="font-size:.65rem;font-weight:700;color:'+(isT?'var(--terra)':'var(--muted)')+'">'+d.getDate()+'</div>'+dayItems.slice(0,2).map(function(item){return'<div style="font-size:.55rem;background:var(--cream);border-radius:3px;padding:1px 3px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(item.text)+'</div>';}).join('')+(dayItems.length>2?'<div style="font-size:.52rem;color:var(--muted)">+'+(dayItems.length-2)+' more</div>':'')+'</div>';});
    grid+='</div>';
  }
  var wgk='goals_'+(myPageView==='week'?dKey(getWeekDates(weekOffset)[0]):today),wwk='workout_'+(myPageView==='week'?dKey(getWeekDates(weekOffset)[0]):today);
  var goals=(personalData.goals||{})[wgk]||'',workout=(personalData.workout||{})[wwk]||'';
  var myr=personalData.myRecipes?Object.values(personalData.myRecipes):[];
  var prHtml='<div class="ptitle" style="margin-top:7px">My Private Recipes</div><div class="aform"><h3>Add Private Recipe</h3><div class="frow"><input id="prName" type="text" placeholder="Recipe name"><select id="prCat">'+PRESET_CATS.map(function(c){return'<option>'+c+'</option>';}).join('')+'</select><input id="prTags" type="text" placeholder="Tags"><input id="prIngs" type="text" placeholder="Ingredients"><textarea id="prSteps" placeholder="Method"></textarea><button class="btn" data-addpr="1">Save My Recipe</button></div></div>'+(myr.length?myr.map(function(r){return'<div class="rc"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1"><b>'+esc(r.name)+'</b><div style="font-size:.74rem;color:var(--muted);margin-top:2px">'+esc(r.cat)+'</div></div><div style="display:flex;gap:3px"><button class="sm ss" data-shrpr="'+r.id+'" style="font-size:.7rem">Share</button><button class="xbtn" data-delpr="'+r.id+'">x</button></div></div><div class="rbtns"><button class="obn" data-togpr="'+r.id+'">View</button><button class="obn obt" data-cookpr="'+r.id+'">Cook</button><button class="obn obs" data-editpr="'+r.id+'">Edit</button></div><div class="eform" id="pef-'+r.id+'"><input type="text" id="pen-'+r.id+'" value="'+esc(r.name)+'"><select id="pec-'+r.id+'">'+PRESET_CATS.map(function(c){return'<option'+(r.cat===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select><input type="text" id="pet-'+r.id+'" value="'+esc((r.tags||[]).join(', '))+'" placeholder="Tags"><input type="text" id="pei-'+r.id+'" value="'+esc((r.ings||[]).join(', '))+'"><textarea id="pes-'+r.id+'">'+esc(r.steps||'')+'</textarea><div style="display:flex;gap:6px"><button class="sm st" data-savepr="'+r.id+'">Save</button><button class="sm sx" data-cancelpr="'+r.id+'">Cancel</button></div></div><div class="rbody" id="prb-'+r.id+'">'+(r.ings&&r.ings.length?'<h4>Ingredients</h4><ul>'+r.ings.map(function(i){return'<li>'+esc(i)+'</li>';}).join('')+'</ul>':'')+(r.steps?'<h4>Method</h4><p>'+esc(r.steps)+'</p>':'')+'</div></div>';}).join(''):'<div class="emp"><span>📒</span>No private recipes yet!</div>');
  el('myPage').innerHTML='<div class="qbox"><div class="qtxt">"'+esc(quote.q)+'"</div><div class="qauth">-- '+esc(quote.a)+'</div><div class="qbtns"><button class="qbtn" id="newQBtn">New Quote</button><button class="qbtn" id="myQBtn">My Own</button></div></div>'+viewToggle+navHtml+grid+todoHtml+'<div class="sbox"><h3>Goals</h3><textarea id="goalsTA" placeholder="This week I want to...">'+esc(goals)+'</textarea><button class="sbtn" id="saveGoals" style="margin-top:7px;padding:7px 13px;font-size:.83rem">Save Goals</button></div><div class="sbox"><h3>Workout Plan</h3><textarea id="workoutTA" placeholder="Plan your workouts...">'+esc(workout)+'</textarea><button class="sbtn" id="saveWorkout" style="margin-top:7px;padding:7px 13px;font-size:.83rem">Save Plan</button></div>'+prHtml;
  el('prevWk').addEventListener('click',function(){if(myPageView==='month'){monthOffset--;}else{weekOffset--;}renderMyPage();});
  el('nextWk').addEventListener('click',function(){if(myPageView==='month'){monthOffset++;}else{weekOffset++;}renderMyPage();});
  el('newQBtn').addEventListener('click',function(){savePers('quote',QUOTES[Math.floor(Math.random()*QUOTES.length)]);});
  el('myQBtn').addEventListener('click',function(){var q=prompt('Your quote:'),a=prompt('Author:');if(q)savePers('quote',{q:q,a:a||'Me'});});
  el('saveGoals').addEventListener('click',function(){var gs=personalData.goals||{};gs[wgk]=el('goalsTA').value;savePers('goals',gs);alert('Goals saved!');});
  el('saveWorkout').addEventListener('click',function(){var wk2=personalData.workout||{};wk2[wwk]=el('workoutTA').value;savePers('workout',wk2);alert('Saved!');});
  el('todoAddBtn').addEventListener('click',function(){var v=el('todoInp').value.trim();if(!v)return;var tid='t'+Date.now();db.ref('personal/'+userName+'/todos/'+tid).set({id:tid,text:v,done:false});el('todoInp').value='';});
  el('todoInp').addEventListener('keydown',function(e){if(e.key==='Enter')el('todoAddBtn').click();});
}

el('dayModCancel').addEventListener('click',function(){el('dayMod').classList.add('h');});
el('dayModSave').addEventListener('click',saveDayItem);
el('dayModInp').addEventListener('keydown',function(e){if(e.key==='Enter')saveDayItem();});
function saveDayItem(){var type=el('dayModType').value,text=el('dayModInp').value.trim();if(!text)return;var dk=dayCtx.dk,id='i'+Date.now();db.ref('personal/'+userName+'/days/'+dk+'/items/'+id).set({id:id,text:text,type:type});el('dayMod').classList.add('h');el('dayModInp').value='';}

// ── GLOBAL EVENT DELEGATION ──
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.dataset.dci){if(!userName){t.checked=!t.checked;return;}var eid=t.dataset.dev,did=t.dataset.dci,ev=events.find(function(x){return x.id===eid;});if(!ev)return;var dishes=ev.dishes?Object.values(ev.dishes):[],dish=dishes.find(function(d){return d.id===did;});if(!dish)return;if(dish.by&&dish.by!==userName){alert(dish.by+' is already bringing this!');t.checked=false;return;}dish.by=dish.by===userName?'':userName;db.ref('events/'+eid+'/dishes/'+did+'/by').set(dish.by);return;}
  if(t.dataset.shid){if(!userName)return;var item=shopItems.find(function(s){return s.id===t.dataset.shid;});if(!item)return;item.done=!item.done;item.by=item.done?userName:'';db.ref('shopping/'+t.dataset.shid).update({done:item.done,by:item.by});return;}
  if(t.dataset.todoid){if(!userName)return;db.ref('personal/'+userName+'/todos/'+t.dataset.todoid+'/done').set(t.checked);setTimeout(renderMyPage,300);return;}
  if(t.dataset.photor){var file=t.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev2){db.ref('recipes/'+t.dataset.photor+'/photo').set(ev2.target.result);};reader.readAsDataURL(file);return;}
});

document.addEventListener('click',function(e){
  var t=e.target;
  var vi=t.closest('[data-viewimg]');if(vi){el('imgModalImg').src=vi.dataset.viewimg;el('imgModal').classList.add('on');return;}
  var dqa=t.closest('[data-dqa]');if(dqa){if(!userName)return;db.ref('dinnerQ/'+todayKey()+'/'+userName).set(dqa.dataset.dqa);setTimeout(renderDashboard,400);return;}
  var st2=t.closest('[data-switchtab]');if(st2&&!t.closest('[data-addmeal]')&&!t.closest('[data-quickdinner]')){switchTab(st2.dataset.switchtab);return;}
  var sc2=t.closest('[data-switchchat]');if(sc2){openChat();return;}
  var qd=t.closest('[data-quickdinner]');if(qd){var todayIdx2=new Date().getDay()-1;if(todayIdx2<0)todayIdx2=6;mealCtx={wk:dKey(getWeekDates(0)[0]),di:String(todayIdx2),slot:'D'};el('mealModTitle').textContent='Suggest for Tonight';el('mealModInp').value='';el('mealModUrl').value='';el('mealMod').classList.remove('h');return;}
  var uf=t.closest('[data-usefmt]');if(uf){try{var parsed=JSON.parse(uf.dataset.usefmt.replace(/&#39;/g,"'"));el('rName').value=parsed.name||'';el('rCat').value=parsed.category||'';el('rServings').value=parsed.servings||'';el('rIngs').value=(parsed.ingredients||[]).join(', ');el('rSteps').value=(parsed.steps||[]).join('\n');el('fmtResult').innerHTML='';el('fmtResult').classList.remove('on');el('fmtInput').value='';switchTab('r');window.scrollTo(0,0);alert('Recipe loaded!');}catch(err){}return;}
  var preset=t.closest('[data-preset]');if(preset&&preset.closest('#presetTags')){var pt=preset.dataset.preset,pi2=selectedPresetTags.indexOf(pt);if(pi2>-1)selectedPresetTags.splice(pi2,1);else selectedPresetTags.push(pt);buildPresetTags();return;}
  var catBtn=t.closest('[data-cat]');if(catBtn&&catBtn.closest('#catFilter')){activeCat=catBtn.dataset.cat;buildCatFilter();renderRecipes();return;}
  var tagBtn=t.closest('[data-tag]');if(tagBtn&&tagBtn.closest('#tagFilter')){activeTag=tagBtn.dataset.tag;buildTagFilter();renderRecipes();return;}
  var star=t.closest('.star[data-rid]');if(star){if(!userName)return;var srid=star.dataset.rid,sval=parseInt(star.dataset.star);db.ref('recipes/'+srid+'/ratings/'+userName).set({stars:sval,by:userName});star.closest('.stars').querySelectorAll('.star').forEach(function(s){s.classList.toggle('on',parseInt(s.dataset.star)<=sval);});var allRecs=recipes.concat(testRecipes),rec=allRecs.find(function(r){return r.id===srid;});if(rec){var rats=Object.assign({},rec.ratings||{});rats[userName]={stars:sval,by:userName};var vals=Object.values(rats).map(function(x){return x.stars;}),avg=vals.reduce(function(a,b){return a+b;},0)/vals.length,cnt=vals.length,avgEl=el('avgr-'+srid),cntEl=el('avgc-'+srid);if(avgEl)avgEl.querySelectorAll('.avg-star').forEach(function(s,i){s.classList.toggle('on',avg>=i+1);});if(cntEl)cntEl.textContent=avg.toFixed(1)+' ('+cnt+')';}return;}
  var togr=t.closest('[data-togr]');if(togr){var rb=el('rb-'+togr.dataset.togr);rb.classList.toggle('on');togr.textContent=rb.classList.contains('on')?'Hide':'View';return;}
  var togtr=t.closest('[data-togtr]');if(togtr){var trb=el('trb-'+togtr.dataset.togtr);trb.classList.toggle('on');togtr.textContent=trb.classList.contains('on')?'Hide':'View';return;}
  var togpr=t.closest('[data-togpr]');if(togpr){var prb=el('prb-'+togpr.dataset.togpr);prb.classList.toggle('on');togpr.textContent=prb.classList.contains('on')?'Hide':'View';return;}
  var editr=t.closest('[data-editr]');if(editr){el('ef-'+editr.dataset.editr).classList.toggle('on');return;}
  var cel=t.closest('[data-canceledit]');if(cel){el('ef-'+cel.dataset.canceledit).classList.remove('on');return;}
  var saver=t.closest('[data-saver]');if(saver){var rid2=saver.dataset.saver;db.ref('recipes/'+rid2).update({name:el('en-'+rid2).value.trim(),cat:el('ec-'+rid2).value,tags:el('et-'+rid2).value.split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean),servings:el('esv-'+rid2).value,diff:el('edf-'+rid2).value,ings:el('ei-'+rid2).value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('es-'+rid2).value.trim()});el('ef-'+rid2).classList.remove('on');return;}
  var editt=t.closest('[data-editt]');if(editt){el('tef-'+editt.dataset.editt).classList.toggle('on');return;}
  var cancelt=t.closest('[data-cancelt]');if(cancelt){el('tef-'+cancelt.dataset.cancelt).classList.remove('on');return;}
  var savet=t.closest('[data-savet]');if(savet){var tid=savet.dataset.savet;db.ref('recipes/'+tid).update({name:el('ten-'+tid).value.trim(),cat:el('tec-'+tid).value,ings:el('tei-'+tid).value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('tes-'+tid).value.trim()});el('tef-'+tid).classList.remove('on');return;}
  var printr=t.closest('[data-printr]');if(printr){var pr2=recipes.find(function(r){return r.id===printr.dataset.printr;})||testRecipes.find(function(r){return r.id===printr.dataset.printr;});if(pr2)printRecipe(pr2);return;}
  var delr=t.closest('[data-delr]');if(delr){if(userName!==ADMIN){alert('Only Mum can delete.');return;}if(!confirm('Remove?'))return;db.ref('recipes/'+delr.dataset.delr).remove();return;}
  var cookr=t.closest('[data-cookr]');if(cookr){var cr=recipes.find(function(r){return r.id===cookr.dataset.cookr;})||testRecipes.find(function(r){return r.id===cookr.dataset.cookr;});if(cr)startCook(cr);return;}
  var cookpr=t.closest('[data-cookpr]');if(cookpr){var myr2=personalData.myRecipes||{},pr3=myr2[cookpr.dataset.cookpr];if(pr3)startCook(pr3);return;}
  var addnote=t.closest('[data-addnote]');if(addnote){var nrid=addnote.dataset.addnote,ninp=el('ni-'+nrid);if(!ninp||!ninp.value.trim())return;var nid='n'+Date.now();db.ref('recipes/'+nrid+'/notes/'+nid).set({id:nid,text:ninp.value.trim(),by:userName||'Family',color:userColor});ninp.value='';return;}
  var addtnote=t.closest('[data-addtnote]');if(addtnote){var tnrid=addtnote.dataset.addtnote,tninp=el('tni-'+tnrid);if(!tninp||!tninp.value.trim())return;var tnid='n'+Date.now();db.ref('recipes/'+tnrid+'/notes/'+tnid).set({id:tnid,text:tninp.value.trim(),by:userName||'Family',color:userColor});tninp.value='';return;}
  var delnote=t.closest('[data-delnote]');if(delnote){db.ref('recipes/'+delnote.dataset.recid+'/notes/'+delnote.dataset.delnote).remove();return;}
  var approve=t.closest('[data-approve]');if(approve){if(userName!==ADMIN){alert('Only Mum can approve.');return;}db.ref('recipes/'+approve.dataset.approve+'/testing').set(false);alert('Recipe approved!');return;}
  var delev=t.closest('[data-delev]');if(delev){if(userName!==ADMIN){alert('Only Mum can delete.');return;}if(!confirm('Remove?'))return;db.ref('events/'+delev.dataset.delev).remove();return;}
  var deld=t.closest('[data-deld]');if(deld){db.ref('events/'+deld.dataset.dev+'/dishes/'+deld.dataset.deld).remove();return;}
  var dadd=t.closest('[data-dadd]');if(dadd){addDish(dadd.dataset.dadd);return;}
  var daci=t.closest('[data-recname]');if(daci){var evid2=daci.dataset.evid,inp2=el('dacinp-'+evid2);if(inp2)inp2.value=daci.dataset.recname;var dal=el('daclist-'+evid2);if(dal)dal.style.display='none';return;}
  var evinvite=t.closest('[data-evinvite]');if(evinvite){evInviteId=evinvite.dataset.evinvite;var ev2=events.find(function(x){return x.id===evInviteId;});el('evInviteTitle').textContent='Invite to '+(ev2?ev2.name:'Event');el('evInviteSelect').innerHTML=Object.keys(members).filter(function(n){return n!==userName;}).map(function(n){var m=members[n];return'<div class="mem-chip" data-invitemem="'+esc(n)+'">'+avt(n,m.color,18)+'<span>'+esc(n)+'</span></div>';}).join('');el('evInviteMod').classList.remove('h');return;}
  var invitemem=t.closest('[data-invitemem]');if(invitemem&&invitemem.closest('#evInviteSelect')){invitemem.classList.toggle('on');return;}
  var addmeal=t.closest('[data-addmeal]');if(addmeal){if(!userName){alert('Sign in first!');return;}mealCtx={wk:addmeal.dataset.wk,di:addmeal.dataset.di,slot:addmeal.dataset.slot};el('mealModTitle').textContent='Suggest for '+DAYS[parseInt(addmeal.dataset.di)];el('mealModInp').value='';el('mealModUrl').value='';el('mealMod').classList.remove('h');setTimeout(function(){el('mealModInp').focus();},80);return;}
  var mealrec=t.closest('[data-mealrec]');if(mealrec){el('mealModInp').value=mealrec.dataset.mealrec;el('mealSugList').innerHTML='';el('mealSugList').style.display='none';return;}
  var vote=t.closest('[data-vote]');if(vote){if(!userName)return;var vref=db.ref('planner/'+vote.dataset.wk+'/'+vote.dataset.di+'/'+vote.dataset.slot+'/'+vote.dataset.vote+'/votes/'+userName);vref.once('value',function(s){if(s.val())vref.remove();else vref.set(true);});return;}
  var cook=t.closest('[data-cook]');if(cook){if(!userName)return;var cref=db.ref('planner/'+cook.dataset.wk+'/'+cook.dataset.di+'/'+cook.dataset.slot+'/'+cook.dataset.cook+'/cooker');cref.once('value',function(s){cref.set(s.val()===userName?'':userName);});return;}
  var delmeal=t.closest('[data-delmeal]');if(delmeal){db.ref('planner/'+delmeal.dataset.wk+'/'+delmeal.dataset.di+'/'+delmeal.dataset.slot+'/'+delmeal.dataset.delmeal).remove();return;}
  var ddadd=t.closest('[data-ddaddmeal]');if(ddadd){var slot=ddadd.dataset.ddaddmeal,ddi=ddadd.dataset.di,dwk=ddadd.dataset.wk,inp=el('ddadd-'+slot+'-'+ddi);if(!inp||!inp.value.trim())return;var mid='m'+Date.now();db.ref('planner/'+dwk+'/'+ddi+'/'+slot+'/'+mid).set({id:mid,name:inp.value.trim(),votes:{},cooker:'',by:userName});inp.value='';setTimeout(function(){refreshDayDetail(parseInt(ddi),dwk,'');},400);return;}
  var clickday=t.closest('[data-dk]');if(clickday&&clickday.dataset.di!==undefined&&!t.closest('[data-addmeal]')&&!t.closest('[data-vote]')&&!t.closest('[data-cook]')&&!t.closest('[data-delmeal]')&&!t.closest('a')&&!t.closest('[data-plannerview]')){var cdi=parseInt(clickday.dataset.di),cwk=clickday.dataset.wk,cdk=clickday.dataset.dk;if(cwk)db.ref('planner/'+cwk+'/'+cdi).once('value',function(snap){openDayDetail(cdi,cwk,cdk,snap.val()||{});});return;}
  var convBtn=t.closest('[data-conv]');if(convBtn&&convBtn.closest('#chatTabs')){switchConvo(convBtn.dataset.conv,convBtn.dataset.cname,convBtn.dataset.gid||'');return;}
  var addmembers=t.closest('[data-addmembers]');if(addmembers){openAddMembers(addmembers.dataset.addmembers);return;}
  var gmem=t.closest('[data-gmem]');if(gmem&&gmem.closest('#groupMemSelect')){var gn=gmem.dataset.gmem,gi=groupSelectedMembers.indexOf(gn);if(gi>-1)groupSelectedMembers.splice(gi,1);else groupSelectedMembers.push(gn);buildGroupMemSelect();return;}
  var addmem=t.closest('[data-addmem]');if(addmem&&addmem.closest('#addMembersSelect')){var an=addmem.dataset.addmem,ai=addMembersSelected.indexOf(an);if(ai>-1)addMembersSelected.splice(ai,1);else addMembersSelected.push(an);buildAddMembersSelect();return;}
  var pickcolor=t.closest('[data-pickcolor]');if(pickcolor){var nc=pickcolor.dataset.pickcolor;userColor=nc;localStorage.setItem('fk_color',nc);db.ref('members/'+userName+'/color').set(nc);el('userPill').innerHTML=avt(userName,nc,20)+'<span>'+esc(userName)+'</span>';el('settingsMod').classList.add('h');el('settingsBtn').click();return;}
  var mypv=t.closest('[data-mypageview]');if(mypv){myPageView=mypv.dataset.mypageview;weekOffset=0;monthOffset=0;renderMyPage();return;}
  var deltodo=t.closest('[data-deltodo]');if(deltodo){db.ref('personal/'+userName+'/todos/'+deltodo.dataset.deltodo).remove();setTimeout(renderMyPage,300);return;}
  var dsh=t.closest('[data-dsh]');if(dsh){if(userName!==ADMIN)return;db.ref('shopping/'+dsh.dataset.dsh).remove();return;}
  var addd=t.closest('[data-addd]');if(addd){dayCtx={dk:addd.dataset.addd};el('dayModTitle').textContent='Add to '+addd.dataset.addd;el('dayModInp').value='';el('dayModType').value='B';el('dayMod').classList.remove('h');setTimeout(function(){el('dayModInp').focus();},80);return;}
  var dday=t.closest('[data-dday]');if(dday){db.ref('personal/'+userName+'/days/'+dday.dataset.dk+'/items/'+dday.dataset.dday).remove();return;}
  var addpr=t.closest('[data-addpr]');if(addpr){var pn=el('prName').value.trim();if(!pn){alert('Enter a name.');return;}var prec={id:'pr'+Date.now(),name:pn,cat:el('prCat').value||'General',tags:el('prTags').value.split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean),by:userName||'Me',ings:el('prIngs').value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('prSteps').value.trim()};db.ref('personal/'+userName+'/myRecipes/'+prec.id).set(prec);['prName','prTags','prIngs','prSteps'].forEach(function(i){el(i).value='';});return;}
  var editpr=t.closest('[data-editpr]');if(editpr){el('pef-'+editpr.dataset.editpr).classList.toggle('on');return;}
  var cancelpr=t.closest('[data-cancelpr]');if(cancelpr){el('pef-'+cancelpr.dataset.cancelpr).classList.remove('on');return;}
  var savepr=t.closest('[data-savepr]');if(savepr){var pid=savepr.dataset.savepr;db.ref('personal/'+userName+'/myRecipes/'+pid).update({name:el('pen-'+pid).value.trim(),cat:el('pec-'+pid).value||'General',tags:el('pet-'+pid).value.split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean),ings:el('pei-'+pid).value.split(',').map(function(s){return s.trim();}).filter(Boolean),steps:el('pes-'+pid).value.trim()});el('pef-'+pid).classList.remove('on');return;}
  var shrpr=t.closest('[data-shrpr]');if(shrpr){var myr3=personalData.myRecipes||{},sr=myr3[shrpr.dataset.shrpr];if(!sr)return;db.ref('recipes/'+sr.id).set(Object.assign({},sr,{by:userName,notes:{},ratings:{},testing:false}));alert('"'+sr.name+'" shared!');return;}
  var delpr=t.closest('[data-delpr]');if(delpr){if(!confirm('Remove?'))return;db.ref('personal/'+userName+'/myRecipes/'+delpr.dataset.delpr).remove();return;}
  var ptt=t.closest('[data-pushtotesting]');if(ptt){var mname=ptt.dataset.mname;if(!mname)return;var rec={id:'r'+Date.now(),name:mname,cat:'Other',ings:[],steps:'',by:userName||'Family',notes:{},ratings:{},photo:'',testing:true,tags:[]};db.ref('recipes/'+rec.id).set(rec);alert('"'+mname+'" added to Testing!');return;}
  var planview=t.closest('[data-plannerview]');if(planview){plannerView=planview.dataset.plannerview;if(plannerView==='month'){planMonthOffset=0;}else{planOffset=0;}setupPlannerListener();renderPlanner();return;}
  // Bills actions
  var editbill=t.closest('[data-editbill]');if(editbill){openEditBill(editbill.dataset.editbill);return;}
  var paybill=t.closest('[data-paybill]');if(paybill){if(!userName)return;
    var bid=paybill.dataset.paybill,b=bills.find(function(x){return x.id===bid;});
    if(!b)return;
    var nextDue='';
    if(b.freq&&b.freq!=='once'){
      var d=new Date(b.due+'T00:00:00');
      if(b.freq==='weekly')d.setDate(d.getDate()+7);
      else if(b.freq==='fortnightly')d.setDate(d.getDate()+14);
      else if(b.freq==='monthly')d.setMonth(d.getMonth()+1);
      else if(b.freq==='quarterly')d.setMonth(d.getMonth()+3);
      else if(b.freq==='annual')d.setFullYear(d.getFullYear()+1);
      nextDue=d.toISOString().split('T')[0];
    }
    db.ref('bills/'+bid).update({paid:true,paidDate:todayKey(),paidBy:userName});
    if(nextDue){
      var newId='bi'+Date.now();
      db.ref('bills/'+newId).set(Object.assign({},b,{id:newId,paid:false,paidDate:'',paidBy:'',due:nextDue}));
    }
    return;}
  var unpaybill=t.closest('[data-unpaybill]');if(unpaybill){db.ref('bills/'+unpaybill.dataset.unpaybill).update({paid:false,paidDate:'',paidBy:''});return;}
  var delbill=t.closest('[data-delbill]');if(delbill){if(userName!==ADMIN)return;if(!confirm('Remove this bill?'))return;db.ref('bills/'+delbill.dataset.delbill).remove();return;}
});


var editBillId='';
el('editBillCancel').addEventListener('click',function(){el('editBillMod').classList.add('h');editBillId='';});
el('editBillSave').addEventListener('click',function(){
  if(!editBillId)return;
  db.ref('bills/'+editBillId).update({
    name:el('ebName').value.trim(),
    amount:parseFloat(el('ebAmt').value)||0,
    freq:el('ebFreq').value,
    due:el('ebDue').value,
    cat:el('ebCat').value,
    notes:el('ebNotes').value.trim()
  });
  el('editBillMod').classList.add('h');
  editBillId='';
});
function openEditBill(bid){
  var b=bills.find(function(x){return x.id===bid;});if(!b)return;
  editBillId=bid;
  el('ebName').value=b.name||'';
  el('ebAmt').value=b.amount||'';
  el('ebFreq').value=b.freq||'monthly';
  el('ebDue').value=b.due||'';
  el('ebCat').value=b.cat||'other';
  el('ebNotes').value=b.notes||'';
  el('editBillMod').classList.remove('h');
}

init();

// ═══════════════════════════════════════════════════════
// UNIFIED CALENDAR
// ═══════════════════════════════════════════════════════
var calView='month', calOffset=0, calEvents=[], calBirthdays=[];

// Event type config
var CAL_TYPES={
  event:   {icon:'📅', bg:'#fff0eb', border:'#f0c4b0', color:'#96705a', label:'Event'},
  meal:    {icon:'🍽', bg:'#eaf3ea', border:'#a0d0a0', color:'#2a6a2a', label:'Meal'},
  personal:{icon:'📋', bg:'#e8f0fe', border:'#b0c4f0', color:'#1a3a8a', label:'Schedule'},
  birthday:{icon:'🎂', bg:'#fff8e1', border:'#ffe082', color:'#e65100', label:'Birthday'},
  bill:    {icon:'💳', bg:'#fce4ec', border:'#f48fb1', color:'#c62828', label:'Bill'},
  work:    {icon:'💼', bg:'#e8f0fe', border:'#b0c4f0', color:'#1a3a8a', label:'Work'},
  uni:     {icon:'🎓', bg:'#f3e8ff', border:'#c4a0f0', color:'#5a1a9a', label:'Uni'},
  appt:    {icon:'🏥', bg:'#e8fff8', border:'#a0f0d0', color:'#1a6a5a', label:'Appt'},
  workout: {icon:'💪', bg:'#fff0e8', border:'#f0c0a0', color:'#7a3010', label:'Workout'}
};

// Collect all calendar items for a given date key
function getCalItemsForDate(dk){
  var items=[];
  var today=new Date();var thisYear=today.getFullYear();

  // Events
  events.forEach(function(ev){if(ev.date===dk)items.push({type:'event',text:ev.name,color:ev.color,source:'Events'});});

  // Planner meals — need to check planner data (loaded separately)
  // We'll inject plannerDataCache below

  // Personal schedule
  if(personalData&&personalData.days&&personalData.days[dk]&&personalData.days[dk].items){
    Object.values(personalData.days[dk].items).forEach(function(item){
      var t=CAL_TYPES[item.type]||CAL_TYPES.personal;
      items.push({type:item.type||'personal',text:item.text,source:'My Schedule'});
    });
  }

  // Birthdays from members
  Object.values(members).forEach(function(m){
    if(!m.birthday)return;
    var bd=new Date(m.birthday+'T00:00:00');
    var bdKey=dk.slice(0,5)+('0'+(bd.getMonth()+1)).slice(-2)+'-'+('0'+bd.getDate()).slice(-2);
    // Match month-day across any year
    if(m.birthday.slice(5)===dk.slice(5)){
      var age=null;if(bd.getFullYear()>1900){age=parseInt(dk.slice(0,4))-bd.getFullYear();}
      items.push({type:'birthday',text:m.name+(age!==null?' turns '+age:'\'s birthday'),source:'Birthdays'});
    }
  });

  // Calendar events (from db.ref('calendarEvents'))
  calEvents.forEach(function(ev){
    if(ev.type==='birthday'){
      // recurring — match month-day
      if(ev.date&&ev.date.slice(5)===dk.slice(5)){
        var age=null;if(ev.birthYear){age=parseInt(dk.slice(0,4))-ev.birthYear;}
        items.push({type:'birthday',text:ev.name+(age!==null?' turns '+age:''),source:'Birthdays'});
      }
    } else {
      if(ev.date===dk)items.push({type:ev.type||'event',text:ev.name,source:'Calendar'});
    }
  });

  // Bills (admin/Mum only)
  if(userName===ADMIN){
    bills.forEach(function(b){if(!b.paid&&b.due===dk)items.push({type:'bill',text:b.name+(b.amount?' $'+b.amount.toFixed(2):''),source:'Bills'});});
  }

  return items;
}

// Inject planner meal data (async, called after planner load)
var plannerCalCache={};
function loadPlannerForCalendar(wkKeys, callback){
  var pending=wkKeys.length;
  if(!pending){callback();return;}
  wkKeys.forEach(function(wk){
    db.ref('planner/'+wk).once('value',function(snap){
      plannerCalCache[wk]=snap.val()||{};
      pending--;if(pending===0)callback();
    });
  });
}

function getMealsForDate(dk){
  var meals=[];
  var d=new Date(dk+'T00:00:00');
  var dow=d.getDay()-1;if(dow<0)dow=6;
  var monday=new Date(d);var md=monday.getDay()||7;monday.setDate(monday.getDate()-md+1);
  var wk=dKey(monday);
  var dayData=plannerCalCache[wk]&&plannerCalCache[wk][dow];
  if(!dayData)return meals;
  ['B','L','D'].forEach(function(slot){
    if(dayData[slot])Object.values(dayData[slot]).forEach(function(m){
      meals.push({type:'meal',text:m.name,source:'Planner'});
    });
  });
  return meals;
}

function renderCalendar(){
  if(!el('pg-c'))return;
  // Show bill legend for admin
  var billLeg=el('calBillLegend');
  if(billLeg)billLeg.style.display=userName===ADMIN?'flex':'none';
  // Update view toggle buttons
  ['month','week','day'].forEach(function(v){
    var btn=el('cv-'+v);if(!btn)return;
    btn.className='cal-type-btn'+(calView===v?' on':'');
  });
  if(calView==='month')renderCalMonth();
  else if(calView==='week')renderCalWeek();
  else renderCalDay();
}

function getMonthDatesForCal(offset){
  var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);
  var yr=d.getFullYear(),mo=d.getMonth();
  var days=[];var tot=new Date(yr,mo+1,0).getDate();
  for(var i=1;i<=tot;i++)days.push(new Date(yr,mo,i));
  return{days:days,label:d.toLocaleDateString('en-AU',{month:'long',year:'numeric'}),year:yr,month:mo};
}

function renderCalMonth(){
  var mdata=getMonthDatesForCal(calOffset);
  el('calLabel').textContent=mdata.label;
  var today=todayKey();
  var firstDay=mdata.days[0].getDay();if(firstDay===0)firstDay=7;

  // Gather unique week keys needed
  var wkKeys=[];
  mdata.days.forEach(function(d){
    var mon=new Date(d);var dow=mon.getDay()||7;mon.setDate(mon.getDate()-dow+1);
    var wk=dKey(mon);if(wkKeys.indexOf(wk)<0)wkKeys.push(wk);
  });

  loadPlannerForCalendar(wkKeys, function(){
    var html='<div class="cal-month-grid">';
    ['M','T','W','T','F','S','S'].forEach(function(d){html+='<div class="cal-dow">'+d+'</div>';});
    // Empty cells before first day
    for(var i=1;i<firstDay;i++)html+='<div></div>';
    mdata.days.forEach(function(d){
      var dk=dKey(d);var isT=dk===today;
      var items=getCalItemsForDate(dk).concat(getMealsForDate(dk));
      var shown=items.slice(0,3);var more=items.length-3;
      html+='<div class="cal-day'+(isT?' today':'')+'" data-caldk="'+dk+'">';
      html+='<div class="cal-day-num">'+d.getDate()+'</div>';
      shown.forEach(function(item){
        var t=CAL_TYPES[item.type]||CAL_TYPES.personal;
        html+='<div class="cal-event-pill" style="background:'+t.bg+';color:'+t.color+'">'+t.icon+' '+esc(item.text.length>12?item.text.slice(0,12)+'…':item.text)+'</div>';
      });
      if(more>0)html+='<div class="cal-more">+'+more+' more</div>';
      html+='</div>';
    });
    html+='</div>';
    el('calGrid').innerHTML=html;
  });
}

function renderCalWeek(){
  var dates=getWeekDates(calOffset);
  var ws=dates[0],we=dates[6];
  el('calLabel').textContent=ws.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' – '+we.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
  var today=todayKey();
  var wk=dKey(ws);
  loadPlannerForCalendar([wk],function(){
    var html='<div class="cal-week-grid">';
    // Header row
    html+='<div class="cal-week-time-hdr"></div>';
    dates.forEach(function(d,i){
      var dk=dKey(d);var isT=dk===today;
      html+='<div class="cal-week-col-hdr'+(isT?' cal-week-today':'')+'"><div class="cal-week-day-name">'+DAYS[i]+'</div><div class="cal-week-day-num">'+d.getDate()+'</div></div>';
    });
    // Events row
    html+='<div class="cal-week-time" style="font-size:.65rem;padding:4px">All day</div>';
    dates.forEach(function(d){
      var dk=dKey(d);
      var items=getCalItemsForDate(dk).concat(getMealsForDate(dk));
      html+='<div class="cal-week-events">';
      items.forEach(function(item){
        var t=CAL_TYPES[item.type]||CAL_TYPES.personal;
        html+='<div class="cal-event-pill" style="background:'+t.bg+';color:'+t.color+';margin-bottom:3px">'+t.icon+' '+esc(item.text.length>14?item.text.slice(0,14)+'…':item.text)+'</div>';
      });
      html+='</div>';
    });
    html+='</div>';
    el('calGrid').innerHTML=html;
  });
}

function renderCalDay(){
  var d=new Date();d.setDate(d.getDate()+calOffset);
  var dk=dKey(d);
  el('calLabel').textContent=d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var wk=dKey(getWeekDates(Math.floor(calOffset/7))[0]);
  loadPlannerForCalendar([wk],function(){
    var allItems=getCalItemsForDate(dk).concat(getMealsForDate(dk));
    if(!allItems.length){
      el('calGrid').innerHTML='<div class="cal-day-view"><div class="cal-day-section"><div style="text-align:center;padding:24px;color:var(--muted)">Nothing on today ☀️<br><span style="font-size:.82rem">Enjoy the quiet!</span></div></div></div>';
      return;
    }
    // Group by type category
    var groups={birthday:[],event:[],meal:[],personal:[]};
    allItems.forEach(function(item){
      var g=item.type==='birthday'?'birthday':item.type==='event'?'event':item.type==='meal'?'meal':'personal';
      if(!groups[g])groups[g]=[];
      groups[g].push(item);
    });
    var sectionTitles={birthday:'🎂 Birthdays',event:'📅 Events',meal:'🍽 Meals',personal:'📋 Schedule'};
    var html='<div class="cal-day-view">';
    Object.keys(groups).forEach(function(g){
      if(!groups[g].length)return;
      var t=CAL_TYPES[g]||CAL_TYPES.personal;
      html+='<div class="cal-day-section"><div class="cal-day-section-title" style="color:'+t.color+'">'+sectionTitles[g]+'</div>';
      groups[g].forEach(function(item){
        html+='<div class="cal-day-item" style="background:'+t.bg+';border-color:'+t.border+'">';
        html+='<div class="cal-day-item-icon">'+t.icon+'</div>';
        html+='<div><div class="cal-day-item-text">'+esc(item.text)+'</div>';
        if(item.source)html+='<div class="cal-day-item-sub">'+esc(item.source)+'</div>';
        html+='</div></div>';
      });
      html+='</div>';
    });
    html+='</div>';
    el('calGrid').innerHTML=html;
  });
}

// Calendar nav
el('calPrev').addEventListener('click',function(){calOffset--;renderCalendar();});
el('calNext').addEventListener('click',function(){calOffset++;renderCalendar();});

// Calendar view toggle
document.addEventListener('click',function(e){
  var cv=e.target.closest('[data-calview]');
  if(cv&&cv.closest('#pg-c')){
    calView=cv.dataset.calview;
    calOffset=0;
    ['month','week','day'].forEach(function(v){var b=el('cv-'+v);if(b)b.className='cal-type-btn'+(calView===v?' on':'');});
    renderCalendar();
    return;
  }
  // Click day in month view
  var caldk=e.target.closest('[data-caldk]');
  if(caldk&&el('pg-c').classList.contains('on')){
    calView='day';
    var clicked=new Date(caldk.dataset.caldk+'T00:00:00');
    var today=new Date();today.setHours(0,0,0,0);
    calOffset=Math.round((clicked-today)/(86400000));
    ['month','week','day'].forEach(function(v){var b=el('cv-'+v);if(b)b.className='cal-type-btn'+(calView===v?' on':'');});
    renderCalendar();
    return;
  }
});

// Add to Calendar modal
el('calAddBtn').addEventListener('click',function(){
  if(!userName){alert('Sign in first!');return;}
  el('calAddName').value='';
  el('calAddDate').value=todayKey();
  el('calAddNotes').value='';
  el('calBirthdayFields').style.display='none';
  el('calPersonalFields').style.display='none';
  el('calAddMod').classList.remove('h');
});
el('calAddCancel').addEventListener('click',function(){el('calAddMod').classList.add('h');});

// Type selector in add modal
el('calTypeSelect').addEventListener('click',function(e){
  var btn=e.target.closest('[data-caltype]');if(!btn)return;
  el('calTypeSelect').querySelectorAll('.cal-type-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  var type=btn.dataset.caltype;
  el('calBirthdayFields').style.display=type==='birthday'?'block':'none';
  el('calPersonalFields').style.display=type==='personal'?'block':'none';
});

el('calAddSave').addEventListener('click',function(){
  var name=el('calAddName').value.trim();if(!name){alert('Enter a name.');return;}
  var date=el('calAddDate').value;if(!date){alert('Select a date.');return;}
  var typeBtn=el('calTypeSelect').querySelector('.cal-type-btn.on');
  var type=typeBtn?typeBtn.dataset.caltype:'event';
  var notes=el('calAddNotes').value.trim();

  if(type==='personal'){
    // Save to personal schedule
    var ptype=el('calPersonalType').value;
    var id='i'+Date.now();
    db.ref('personal/'+userName+'/days/'+date+'/items/'+id).set({id:id,text:name,type:ptype});
  } else if(type==='birthday'){
    // Save to calendarEvents with birthday flag
    var byear=el('calBirthYear').value;
    var recurring=el('calBirthdayRecurring').checked;
    var id='ce'+Date.now();
    db.ref('calendarEvents/'+id).set({id:id,name:name,date:date,type:'birthday',birthYear:byear?parseInt(byear):null,recurring:recurring,notes:notes,by:userName});
  } else {
    // Save to calendarEvents
    var id='ce'+Date.now();
    db.ref('calendarEvents/'+id).set({id:id,name:name,date:date,type:type,notes:notes,by:userName});
  }
  el('calAddMod').classList.add('h');
  setTimeout(renderCalendar,400);
});

// Listen to calendarEvents
db.ref('calendarEvents').on('value',function(snap){
  calEvents=[];snap.forEach(function(c){calEvents.push(c.val());});
  if(el('pg-c')&&el('pg-c').classList.contains('on'))renderCalendar();
});
