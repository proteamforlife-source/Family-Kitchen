// ─── DASHBOARD.JS ────────────────────────────────────────────────────────
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
      var answersList=Object.entries(dqData).map(function(e){
        var col=members[e[0]]?members[e[0]].color:'#8A7A6E';
        var isMe=e[0]===userName;
        return'<span class="dq-answer"'+(isMe?' data-dqa="clear" style="cursor:pointer;opacity:.65;text-decoration:line-through" title="Tap to clear your answer"':'')+'>'+avt(e[0],col,16)+'<span style="margin-left:3px;font-size:.75rem">'+esc(e[0])+': '+(e[1]==='yes'?'Yes':'No')+'</span></span>';
      }).join('');
      var lastRead=personalData.lastRead||{};
      var now=new Date();now.setHours(0,0,0,0);
      var weekEnd=new Date(now);weekEnd.setDate(weekEnd.getDate()+7);
      var dueSoon=bills.filter(function(b){
        if(b.paid)return false;
        var d=new Date(b.due+'T00:00:00');
        return d>=now&&d<=weekEnd;
      }).sort(function(a,b){return a.due<b.due?-1:1;});
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
  var todayIdx=new Date().getDay()-1;if(todayIdx<0)todayIdx=6;
  var wkKey=dKey(getWeekDates(0)[0]);

  var billsCard='';
  if(dueSoon.length){
    billsCard='<div class="dash-card" data-switchtab="b" style="cursor:pointer;border-left:3px solid #e65100">'+
      '<h3>💳 Bills Due This Week</h3>'+
      dueSoon.map(function(b){
        var daysLeft=daysUntil(b.due);
        var urgency=daysLeft===0?'<span style="color:#c62828;font-weight:700;font-size:.72rem">TODAY</span>':daysLeft===1?'<span style="color:#e65100;font-weight:700;font-size:.72rem">TOMORROW</span>':'<span style="color:var(--muted);font-size:.72rem">'+fmtDate(b.due)+'</span>';
        return'<div style="display:flex;align-items:center;j