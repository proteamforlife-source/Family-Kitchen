// ─── APP.JS — Init, tab routing, global event delegation ──────────────────
// Loaded LAST.

var tabs=['d','r','p','e','c','b','t','s','m'];

function switchTab(id){
  tabs.forEach(function(t){el('pg-'+t).classList.remove('on');el('tb-'+t).classList.remove('on');});
  el('pg-'+id).classList.add('on');el('tb-'+id).classList.add('on');
  if(id==='p'){renderPlanner();setupPlannerListener();}
  if(id==='d')renderDashboard();
  if(id==='c')renderCalendar();
}

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
  db.ref('calendarEvents').on('value',function(snap){calEvents=[];snap.forEach(function(c){calEvents.push(c.val());});if(el('pg-c')&&el('pg-c').classList.contains('on'))renderCalendar();});
}

document.addEventListener('DOMContentLoaded',function(){
  // Tab listeners
  tabs.forEach(function(id){
    el('tb-'+id).addEventListener('click',function(){
      switchTab(id);
      if(id==='m')renderMyPage();
      if(id==='b')renderBills();
    });
  });

  // Image modal close
  el('imgModal').querySelector('button').addEventListener('click',function(){el('imgModal').classList.remove('on');});
});

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
  var vote=t.closest('[data-vote]');if(vote){if(!userName)return;var vref=db.ref('planner/'+vote.dataset.wk+'/'+vote.dataset.di+'/'+vote.dataset.slot+'/'+vote.dataset.vote+'/votes/'+userName);vref.once('value',function(s){if(s.val())vref.remove();else vref.set(true);setTimeout(function(){if(el('pg-d').classList.contains('on'))renderDashboard();},500);});return;}
  var cook=t.closest('[data-cook]');if(cook){if(!userName)return;var cref=db.ref('planner/'+cook.dataset.wk+'/'+cook.dataset.di+'/'+cook.dataset.slot+'/'+cook.dataset.cook+'/cooker');cref.once('value',function(s){cref.set(s.val()===userName?'':userName);setTimeout(function(){if(el('pg-d').classList.contains('on'))renderDashboard();},500);});return;}
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
  var caledit=t.closest('[data-caledit]');if(caledit){openCalEdit(caledit.dataset.caledit);return;}
  var caldel=t.closest('[data-caldel]');if(caldel){if(!confirm('Remove this?'))return;db.ref('calendarEvents/'+caldel.dataset.caldel).remove();setTimeout(renderCalendar,300);return;}
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
        items.push({type:'birthday',text:ev.name+(age!==null?' turns '+age:''),source:'Birthdays',id:ev.id,ev:ev});
      }
    } else {
      if(ev.date===dk)items.push({type:ev.type||'event',text:ev.name,source:'Calendar',id:ev.id,ev:ev});
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
  // Month jump picker
  var jumpHtml='<select id="calMonthJump" style="margin-left:8px;padding:4px 8px;border:1.5px solid var(--border);border-radius:8px;font-size:.8rem;font-weight:600;outline:none;font-family:inherit;background:#fff;color:var(--charcoal);cursor:pointer">';
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var now=new Date();
  for(var y=now.getFullYear()-1;y<=now.getFullYear()+2;y++){
    months.forEach(function(m,mi){
      var val=(y-now.getFullYear())*12+(mi-now.getMonth());
      jumpHtml+='<option value="'+val+'"'+(val===calOffset?' selected':'')+'>'+m+' '+y+'</option>';
    });
  }
  jumpHtml+='</select>';
  el('calLabel').innerHTML=mdata.label+jumpHtml;
  setTimeout(function(){
    var sel=el('calMonthJump');
    if(sel)sel.addEventListener('change',function(){calOffset=parseInt(this.value);renderCalendar();});
  },50);
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
        html+='<div style="flex:1"><div class="cal-day-item-text">'+esc(item.text)+'</div>';
        if(item.source)html+='<div class="cal-day-item-sub">'+esc(item.source)+'</div>';
        html+='</div>';
        if(item.id&&(item.type==='birthday'||item.type==='event')){
          html+='<div style="display:flex;gap:4px">';
          html+='<button class="sm sx" style="font-size:.68rem;padding:2px 7px" data-caledit="'+item.id+'">Edit</button>';
          html+='<button class="xbtn" data-caldel="'+item.id+'">🗑</button>';
          html+='</div>';
        }
        html+='</div>';
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
el('calAddCancel').addEventListener('click',function(){el('calAddMod').classList.add('h');editCalId='';if(el('calAddSave'))el('calAddSave').dataset.editing='';});

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
  // If editing existing
  if(el('calAddSave').dataset.editing==='1'&&editCalId){
    var updates={name:name,date:date,notes:notes};
    if(type==='birthday'){updates.birthYear=el('calBirthYear').value?parseInt(el('calBirthYear').value):null;updates.recurring=el('calBirthdayRecurring').checked;}
    db.ref('calendarEvents/'+editCalId).update(updates);
    el('calAddMod').classList.add('h');editCalId='';el('calAddSave').dataset.editing='';setTimeout(renderCalendar,400);return;
  }
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


// Calendar event edit/delete
var editCalId='';
function openCalEdit(id){
  var ev=calEvents.find(function(x){return x.id===id;});if(!ev)return;
  editCalId=id;
  // Reuse calAddMod
  el('calAddName').value=ev.name||'';
  el('calAddDate').value=ev.date||'';
  el('calAddNotes').value=ev.notes||'';
  // Set type
  el('calTypeSelect').querySelectorAll('.cal-type-btn').forEach(function(b){
    b.classList.toggle('on',b.dataset.caltype===(ev.type==='birthday'?'birthday':ev.type==='personal'?'personal':'event'));
  });
  el('calBirthdayFields').style.display=ev.type==='birthday'?'block':'none';
  el('calPersonalFields').style.display=ev.type==='personal'?'block':'none';
  if(ev.type==='birthday'){
    el('calBirthYear').value=ev.birthYear||'';
    el('calBirthdayRecurring').checked=ev.recurring!==false;
  }
  // Change save button to update
  el('calAddSave').dataset.editing='1';
  el('calAddMod').classList.remove('h');
}

// Listen to calendarEvents
db.ref('calendarEvents').on('value',function(snap){
  calEvents=[];snap.forEach(function(c){calEvents.push(c.val());});
  if(el('pg-c')&&el('pg-c').classList.contains('on'))renderCalendar();
});

init();
