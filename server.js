require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = Number(process.env.PORT || 3000);
const ordersPath = path.join(__dirname, 'data', 'orders.json');
const orderEmailTo = process.env.ORDER_EMAIL_TO || 'mr4smillybusiness@gmail.com';
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname)));
function readOrders(){try{return JSON.parse(fs.readFileSync(ordersPath,'utf8'));}catch{return [];}}
function saveOrders(data){fs.mkdirSync(path.dirname(ordersPath),{recursive:true});fs.writeFileSync(ordersPath+'.tmp',JSON.stringify(data,null,2));fs.renameSync(ordersPath+'.tmp',ordersPath);}
function safeText(v,max=300){return String(v||'').trim().slice(0,max);}
function createTransport(){
  if(!process.env.SMTP_HOST||!process.env.SMTP_USER||!process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||465),secure:String(process.env.SMTP_SECURE||'true')==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
app.post('/api/orders',async(req,res)=>{
  const customer=safeText(req.body.customer,100), phone=safeText(req.body.phone,30), address=safeText(req.body.address,700), payment=safeText(req.body.payment,80);
  const items=Array.isArray(req.body.items)?req.body.items.slice(0,30).map(i=>({product:safeText(i.product,100),size:safeText(i.size,20),qty:Math.max(1,Math.min(99,Number(i.qty)||1)),price:Math.max(0,Number(i.price)||0)})):[];
  if(!customer||!phone||phone.length<7||!address||!items.length||!payment||items.some(i=>!i.product||!Number.isFinite(i.price)||i.price<=0)) return res.status(400).json({ok:false,error:'Please fill all required details, enter a valid phone number, and include valid products.'});
  const total=items.reduce((sum,i)=>sum+i.price*i.qty,0); // computed server-side from submitted line price
  const order={orderId:'LX'+Date.now(),customer,phone,address,payment,items,total,created:new Date().toISOString(),status:'New'};
  const orders=readOrders();orders.unshift(order);saveOrders(orders);
  let emailStatus='Order saved on the store server. Email notifications are not configured yet; add SMTP settings to .env to enable them.';
  const transport=createTransport();
  if(transport){try{
    const lines=items.map(i=>`${i.product} | Size ${i.size} | Qty ${i.qty} | ₹${i.price} each`).join('\n');
    await transport.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to:orderEmailTo,subject:`LUCXI New Order ${order.orderId}`,text:`NEW LUCXI ORDER\n\nOrder ID: ${order.orderId}\nCustomer: ${customer}\nPhone: ${phone}\nAddress: ${address}\nPayment method: ${payment}\nItems:\n${lines}\nTotal: ₹${total}\nOrder date: ${order.created}\nStatus: ${order.status}`});
    emailStatus='Order confirmation received. Notification email sent to store.';
  }catch(err){console.error('SMTP send error:',err.message);emailStatus='Order saved successfully, but the notification email failed. Check SMTP settings in .env and server terminal.';}
  }
  res.status(201).json({ok:true,order,emailStatus});
});
app.get('/api/health',(req,res)=>res.json({ok:true,service:'LUCXI orders'}));
app.listen(port,()=>console.log(`LUCXI is running at http://localhost:${port}`));
