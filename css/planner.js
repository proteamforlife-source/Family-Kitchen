// ─── PLANNER.JS ───────────────────────────────────────────────────────────
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

document.addEventListener('DOMContentLoaded',function(){
  el('planPrev').addEventListener('click',function(){if(plannerView==='month'){planMonthOffset--;}else{planOffset--;}renderPlanner();setupPlannerListener();});
  el('planNext').addEventListener('click',function(){if(plannerView==='month'){planMonthOffset++;}else{planOffset++;}renderPlanner();setupPlannerListener();});
  el('mealModCancel').addEventListener('click',function(){el('mealMod').classList.add('h');});
  el('mealModSave').addEventListener('click',saveMealSug);
  el('mealModInp').addEventListener('keydown',function(e){if(e.key==='Enter')saveMealSug();});
  el('mealModInp').addEventListener('input',function(){var q=el('mealModInp').value.toLowerCase(),list=el('mealSugList');list.innerHTML='';if(!q){list.style.display='none';return;}var m=recipes.filter(function(r){return r.name.toLowerCase().indexOf(q)>-1;}).slice(0,5);if(!m.length){list.style.display='none';return;}list.style.display='block';list.innerHTML=m.map(function(r){return'<div style="padding:5px 8px;cursor:pointer;font-size:.84rem;border-radius:6px;background:var(--cream);margin-bottom:2px" data-mealrec="'+esc(r.name)+'">'+esc(r.name)+'</div>';}).join('');});
  el('dayDetailClose').addEventListener('click',function(){el('dayDetailMod').classList.add('h');});
});
