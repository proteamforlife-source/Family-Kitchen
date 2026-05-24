// ─── CALENDAR.JS ──────────────────────────────────────────────────────────
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

document.addEventListener('DOMContentLoaded',function(){
  el('calPrev').addEventListener('click',function(){calOffset--;renderCalendar();});
  el('calNext').addEventListener('click',function(){calOffset++;renderCalendar();});
  el('calAddBtn').addEventListener('click',function(){if(!userName){alert('Sign in first!');return;}el('calAddName').value='';el('calAddDate').value=todayKey();el('calAddNotes').value='';el('calBirthdayFields').style.display='none';el('calPersonalFields').style.display='none';el('calAddMod').classList.remove('h');});
  el('calAddCancel').addEventListener('click',function(){el('calAddMod').classList.add('h');editCalId='';if(el('calAddSave'))el('calAddSave').dataset.editing='';});
  el('calTypeSelect').addEventListener('click',function(e){var btn=e.target.closest('[data-caltype]');if(!btn)return;el('calTypeSelect').querySelectorAll('.cal-type-btn').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');var type=btn.dataset.caltype;el('calBirthdayFields').style.display=type==='birthday'?'block':'none';el('calPersonalFields').style.display=type==='personal'?'block':'none';});
});
