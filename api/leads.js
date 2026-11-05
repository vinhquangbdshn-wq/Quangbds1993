const {createHmac}=require('node:crypto');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const send=(status,body)=>res.status(status).json(body);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{ok:false,message:'Phương thức không hỗ trợ.'});}
 const allowed='https://anlac-green-symphony.vercel.app';
 if(req.headers.origin!==allowed)return send(403,{ok:false,message:'Yêu cầu không hợp lệ.'});
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(415,{ok:false,message:'Yêu cầu không hợp lệ.'});
 let p=req.body;try{if(typeof p==='string'){if(Buffer.byteLength(p)>10000)throw Error();p=JSON.parse(p);}}catch{return send(400,{ok:false,message:'Yêu cầu không hợp lệ.'});}
 if(!p||Array.isArray(p)||typeof p!=='object'||Buffer.byteLength(JSON.stringify(p))>10000)return send(400,{ok:false,message:'Yêu cầu không hợp lệ.'});
 if(p.website)return send(400,{ok:false,message:'Yêu cầu không hợp lệ.'});
 const name=typeof p.name==='string'?p.name.trim():'',phone=typeof p.phone==='string'?p.phone.replace(/[ ()-]/g,'').replace(/^\+84/,'0'):'';
 const message=typeof p.message==='string'?p.message.trim():'';
 if(!name||name.length>100||!/^0[0-9]{9}$/.test(phone)||message.length>1500||!['Căn hộ 2PN','Căn hộ 2PN + 1','Căn hộ 3PN','Cần tư vấn thêm'].includes(p.property)||p.consent!==true||!/^[0-9a-f-]{36}$/.test(p.id||''))return send(400,{ok:false,message:'Vui lòng kiểm tra họ tên, số điện thoại Việt Nam và đồng ý liên hệ.'});
 const url=process.env.LEADS_WEBHOOK_URL,secret=process.env.LEADS_WEBHOOK_SECRET;
 if(!url||!secret)return send(503,{ok:false,message:'Hệ thống đang bận. Anh chị vui lòng gọi 0975 483 990.'});
 try{
  const client=createHmac('sha256',secret).update(String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()).digest('hex');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,id:p.id,name,phone,property:p.property,message,consent:true,client}),signal:AbortSignal.timeout(25000),redirect:'follow'});
  const result=await response.json();
  if(result.ok&&result.id===p.id)return send(200,{ok:true,id:p.id});
  if(result.code==='rate_limited')return send(429,{ok:false,message:'Anh chị đã gửi nhiều yêu cầu. Vui lòng thử lại sau 10 phút hoặc gọi 0975 483 990.'});
 }catch{}
 return send(503,{ok:false,message:'Chưa xác nhận lưu đăng ký. Anh chị vui lòng thử lại hoặc gọi 0975 483 990.'});
};
