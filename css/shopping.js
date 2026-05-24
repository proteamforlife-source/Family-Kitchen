// ─── SHOPPING.JS ─────────────────────────────────────────────────────────
el('shopAddBtn').addEventListener('click',addShopItem);
el('shopInp').addEventListener('keydown',function(e){if(e.key==='Enter')addShopItem();});
function addShopItem(){var v=el('shopInp').value.trim();if(!v)return;var id='sh'+Date.now();db.ref('shopping/'+id).set({id:id,name:v,done:false,by:'',addedBy:userName||''});el('shopInp').value='';}
el('shopClearBtn').addEventListener('click',function(){shopItems.filter(function(s){return s.done;}).forEach(function(s){db.ref('shopping/'+s.id).remove();});});
function renderShopping(){var c=el('shopList');if(!shopItems.length){c.innerHTML='<div class="emp"><span>🛒</span>List is empty!</div>';return;}var isAdmin=userName===ADMIN;c.innerHTML=shopItems.map(function(s){return'<div class="shoprow"><input type="checkbox" class="shopchk"'+(s.done?' checked':'')+' data-shid="'+s.id+'"><span class="shopnam'+(s.done?' done':'')+'">'+esc(s.name)+'</span>'+(s.addedBy?'<span style="margin-left:5px">'+avt(s.addedBy,members[s.addedBy]?members[s.addedBy].color:'#8A7A6E',16)+'</span>':'')+(s.done?'<span class="shopby">'+esc(s.by)+'</span>':'')+(isAdmin?'<button class="xbtn" data-dsh="'+s.id+'">🗑</button>':'')+'</div>';}).join('');}

document.addEventListener('DOMContentLoaded',function(){
  el('shopAddBtn').addEventListener('click',addShopItem);
  el('shopInp').addEventListener('keydown',function(e){if(e.key==='Enter')addShopItem();});
  el('shopClearBtn').addEventListener('click',function(){shopItems.filter(function(s){return s.done;}).forEach(function(s){db.ref('shopping/'+s.id).remove();});});
});
