// Deploy as a web app, execute as owner. Script property WEBHOOK_SECRET required.
const LEADS_SHEET_ID = '18yVlQhcHajrlI19DzYl3sn51pcNaVjvvPZzElWm1np8';
function authorizeSheet() { SpreadsheetApp.openById(LEADS_SHEET_ID).getSheets()[0].getRange('A1').getValue(); }
function reply_(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
function safe_(value) { const s=String(value||'');return /^[=+@\-]/.test(s)?"'"+s:s; }
function doPost(e) {
 const secret=PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
 let p;try{p=JSON.parse(e.postData.contents);}catch(_){return reply_({ok:false,code:'invalid'});}
 if(!secret||p.secret!==secret)return reply_({ok:false,code:'forbidden'});
 if(!/^[0-9a-f-]{36}$/.test(p.id||'')||typeof p.name!=='string'||!p.name.trim()||p.name.length>100||!/^0[0-9]{9}$/.test(p.phone||'')||!['Căn hộ 2PN','Căn hộ 2PN + 1','Căn hộ 3PN','Cần tư vấn thêm'].includes(p.property)||typeof p.message!=='string'||p.message.length>1500||p.consent!==true||!/^[a-f0-9]{64}$/.test(p.client||''))return reply_({ok:false,code:'invalid'});
 const lock=LockService.getScriptLock();if(!lock.tryLock(15000))return reply_({ok:false,code:'busy'});
 try {
  const sheet=SpreadsheetApp.openById(LEADS_SHEET_ID).getSheets()[0],last=sheet.getLastRow();
  if(last>1&&sheet.getRange(2,9,last-1,1).createTextFinder(p.id).matchEntireCell(true).findNext())return reply_({ok:true,id:p.id});
  const cache=CacheService.getScriptCache(),key='rate:'+p.client,count=Number(cache.get(key)||0);
  if(count>=5)return reply_({ok:false,code:'rate_limited'});
  const date=Utilities.formatDate(new Date(),'Asia/Ho_Chi_Minh','yyyy-MM-dd HH:mm:ss'),row=last+1;
  sheet.getRange(row,1,1,9).setNumberFormat('@').setValues([[date,safe_(p.name.trim()),p.phone,safe_(p.property),safe_(p.message),'Mới','Đã đồng ý','Landing page Moonlight 2',p.id]]);
  SpreadsheetApp.flush();cache.put(key,String(count+1),600);
  return reply_({ok:true,id:p.id});
 }catch(_){return reply_({ok:false,code:'unavailable'});}finally{lock.releaseLock();}
}
