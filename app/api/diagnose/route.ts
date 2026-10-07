import {getRequestContext} from '../../../lib/request-context';
import {targetURL,lookup,safeHTTP} from '../../../lib/network';
export async function POST(req:Request){
 try{
 if(Number(req.headers.get('content-length')||0)>4096)return Response.json({error:'Requête trop grande.'},{status:413});
 const body:any=await req.json();const u=targetURL(String(body.target||'').trim());const ports=Array.isArray(body.ports)?body.ports.filter((p:any)=>Number.isInteger(p)&&p>0&&p<65536).slice(0,8):[80,443];
 const kind=body.kind==='tcp'?'tcp':body.kind==='udp'?'udp':'web';const started=Date.now();const ip=/^[\d.]+$/.test(u.hostname)||u.hostname.includes(':');
 const dns=ip?[]:await Promise.all(['Cloudflare','Google'].flatMap(resolver=>['A','AAAA','CNAME','MX','TXT','NS'].map(async type=>{try{return {resolver,type,...await lookup(u.hostname,type)}}catch(e){return {resolver,type,error:(e as Error).message}}})));
 let http:any={skipped:true};try{if(kind==='web')http=await safeHTTP(u)}catch(e){http={error:(e as Error).name==='TimeoutError'?'Le serveur n’a pas répondu dans le délai de 8 secondes.':(e as Error).message}}
 let agent:any={available:false,reason:'L’agent de tests avancés n’est pas configuré. Les tests TCP, TLS détaillé, ICMP et traceroute nécessitent cet agent.'};
 const agentURL=getRequestContext()?.agentURL||process.env.PROBE_AGENT_URL;const token=getRequestContext()?.agentToken||process.env.PROBE_AGENT_TOKEN;
 if(agentURL&&token){try{if(new URL(agentURL).protocol!=='https:')throw new Error('L’agent doit être exposé en HTTPS.');const r=await fetch(`${agentURL.replace(/\/$/,'')}/probe`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({host:u.hostname.replace(/^\[|\]$/g,''),ports:kind==='udp'?[]:ports,tls:kind==='web'&&u.protocol==='https:',tlsPort:Number(u.port||443)}),signal:AbortSignal.timeout(18000)});if(!r.ok)throw new Error(`Agent : réponse ${r.status}`);agent={available:true,...await r.json() as any}}catch(e){agent={available:false,reason:`Agent inaccessible : ${(e as Error).message}`}}}
 const cf=getRequestContext()?.cf||(req as any).cf;return Response.json({id:crypto.randomUUID(),target:u.href,host:u.hostname,kind,requestedPorts:ports,at:new Date().toISOString(),location:cf?.colo||'point de présence de l’hébergement (localisation non fournie)',dns,http,agent,elapsed:Date.now()-started},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:(e as Error).message},{status:400})}
}
