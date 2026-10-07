// Node 22+, derrière un reverse proxy HTTPS. Aucun paquet tiers.
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import dns from 'node:dns/promises';
import {execFile} from 'node:child_process';
import {timingSafeEqual} from 'node:crypto';
const token=process.env.PROBE_AGENT_TOKEN;
if(!token||token.length<32)throw Error('PROBE_AGENT_TOKEN doit contenir au moins 32 caractères.');
const location=process.env.PROBE_LOCATION||'Agent auto-hébergé (lieu non renseigné)';
const allowed=(process.env.ALLOWED_TARGETS||'').split(',').map(x=>x.trim()).filter(Boolean);
function publicIP(ip){
 if(net.isIP(ip)===4){const [a,b]=ip.split('.').map(Number);return !([0,10,127].includes(a)||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&[18,19].includes(b));}
 return net.isIP(ip)===6&&/^[23][0-9a-f]{3}:/i.test(ip);
}
async function addresses(host){if(!/^[a-zA-Z0-9.:-]{1,253}$/.test(host)||host.startsWith('-'))throw Error('Cible invalide');if(allowed.length&&!allowed.includes(host))throw Error('Cible non autorisée');const rows=await dns.lookup(host,{all:true});if(!rows.length||rows.some(r=>!publicIP(r.address)))throw Error('Adresse privée ou réservée refusée');return rows}
function port(ip,p){return new Promise(resolve=>{const start=performance.now(),s=net.connect({host:ip,port:p}),done=(value)=>{s.destroy();resolve({port:p,ms:Math.round(performance.now()-start),...value})};s.setTimeout(2500);s.once('connect',()=>done({open:true}));s.once('timeout',()=>done({open:false,error:'Délai dépassé'}));s.once('error',e=>done({open:false,error:e.code}))})}
function certificate(ip,host,p){return new Promise(resolve=>{const s=tls.connect({host:ip,port:p,servername:net.isIP(host)?undefined:host,rejectUnauthorized:true,checkServerIdentity:(_,cert)=>tls.checkServerIdentity(host,cert)});let done=false;const finish=value=>{if(done)return;done=true;s.destroy();resolve(value)};s.setTimeout(5000);s.once('secureConnect',()=>{const c=s.getPeerCertificate();finish({valid:s.authorized,issuer:c.issuer,subject:c.subject,names:c.subjectaltname,expires:c.valid_to,daysRemaining:Math.floor((new Date(c.valid_to)-Date.now())/86400000),protocol:s.getProtocol()})});s.once('error',e=>finish({valid:false,error:e.code||e.message}));s.once('timeout',()=>finish({valid:false,error:'Délai dépassé'}))})}
function command(file,args,timeout){return new Promise(resolve=>execFile(file,args,{timeout,maxBuffer:32768,env:{PATH:process.env.PATH,LANG:'C'}},(err,stdout,stderr)=>resolve({output:stdout||stderr,error:err?err.code==='ENOENT'?`${file} n’est pas installé`:err.killed?'Délai dépassé':`${file} terminé avec le code ${err.code}`:undefined})))}
let active=0;const buckets=new Map();
const server=http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');const reply=(status,data)=>{res.writeHead(status);res.end(JSON.stringify(data))};
 const auth=Buffer.from(req.headers.authorization||''),expected=Buffer.from(`Bearer ${token}`);if(auth.length!==expected.length||!timingSafeEqual(auth,expected))return reply(401,{error:'Non autorisé'});
 if(req.method!=='POST'||req.url!=='/probe')return reply(404,{error:'Non trouvé'});
 const key=req.socket.remoteAddress,now=Date.now(),bucket=buckets.get(key)||{at:now,n:0};if(now-bucket.at>60000){bucket.at=now;bucket.n=0}bucket.n++;buckets.set(key,bucket);if(bucket.n>15||active>=4)return reply(429,{error:'Trop de tests simultanés'});active++;
 try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)throw Error('Requête trop grande')}const b=JSON.parse(raw),host=String(b.host||'');const rows=await addresses(host),ip=rows[0].address;const ports=Array.isArray(b.ports)?[...new Set(b.ports)]:[];if(ports.length>8||ports.some(p=>!Number.isInteger(p)||p<1||p>65535))throw Error('Ports invalides');const tlsPort=Number(b.tlsPort||443);if(!Number.isInteger(tlsPort)||tlsPort<1||tlsPort>65535)throw Error('Port TLS invalide');
 const [portsResult,tlsResult,ping,traceroute]=await Promise.all([Promise.all(ports.map(p=>port(ip,p))),b.tls?certificate(ip,host,tlsPort):null,command('ping',['-n','-c','3','-W','2',ip],8000),command('traceroute',['-n','-m','12','-q','1','-w','0.5',ip],9000)]);const stat=ping.output?.match(/min\/avg\/max\/(?:mdev|stddev)\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)/),loss=ping.output?.match(/([\d.]+)% packet loss/);if(stat)ping.stats={min:Number(stat[1]),avg:Number(stat[2]),max:Number(stat[3]),loss:loss?Number(loss[1]):null};traceroute.hops=(traceroute.output||'').split('\n').map(line=>line.match(/^\s*(\d+)\s+(?:(\S+)\s+([\d.]+)\s+ms|(\*))/)).filter(Boolean).map(m=>({hop:Number(m[1]),address:m[2]||null,ms:m[3]?Number(m[3]):null}));reply(200,{location,ip,ports:portsResult,tls:tlsResult,ping,traceroute});
 }catch(e){reply(400,{error:e.message})}finally{active--}});
server.requestTimeout=20000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||8788),process.env.BIND_ADDRESS||'127.0.0.1',()=>console.log(`Agent démarré · ${location}`));
