// ─── BILLS.JS ────────────────────────────────────────────────────────────
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

document.addEventListener('DOMContentLoaded',function(){
  el('addBillBtn').addEventListener('click',function(){
    var n=el('billName').value.trim();if(!n){alert('Enter a bill name.');return;}
    var due=el('billDue').value;if(!due){alert('Select a due date.');return;}
    var bill={id:'bi'+Date.now(),name:n,amount:parseFloat(el('billAmt').value)||0,freq:el('billFreq').value,due:due,cat:el('billCat').value,notes:el('billNotes').value.trim(),paid:false,paidDate:'',paidBy:'',addedBy:userName};
    db.ref('bills/'+bill.id).set(bill);
    ['billName','billAmt','billDue','billNotes'].forEach(function(i){el(i).value='';});
  });
  el('billFilterBar').addEventListener('click',function(e){
    var btn=e.target.closest('[data-bf]');if(!btn)return;
    billFilter=btn.dataset.bf;
    el('billFilterBar').querySelectorAll('button').forEach(function(b){b.className=b.dataset.bf===billFilter?'st':'sx';});
    renderBills();
  });
  el('editBillCancel').addEventListener('click',function(){el('editBillMod').classList.add('h');editBillId='';});
  el('editBillSave').addEventListener('click',function(){
    if(!editBillId)return;
    db.ref('bills/'+editBillId).update({name:el('ebName').value.trim(),amount:parseFloat(el('ebAmt').value)||0,freq:el('ebFreq').value,due:el('ebDue').value,cat:el('ebCat').value,notes:el('ebNotes').value.trim()});
    el('editBillMod').classList.add('h');editBillId='';
  });
});
