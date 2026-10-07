export function targetURL(input: string) {
 if(!input || input.length>2048) throw new Error('Saisis un domaine, une adresse IP ou une URL.');
 let u:URL; try {u=new URL(/^[a-z]+:\/\//i.test(input)?input:`https://${input}`)}catch{throw new Error('Cette adresse ne semble pas valide.')}
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password) throw new Error('Utilise une adresse HTTP ou HTTPS sans identifiants.');
 if(u.port && ![80,443,8080,8443].includes(Number(u.port))) throw new Error('Pour le web, utilise les ports 80, 443, 8080 ou 8443. Les autres ports se testent via l’agent.');
 assertPublic(u.hostname); return u;
}
export function assertPublic(host:string) {
 const h=host.replace(/^\[|\]$/g,'').toLowerCase();
 if(h==='localhost'||h.endsWith('.local')||h.endsWith('.internal')||h.includes(':')&&!/^[23][0-9a-f]{3}:/.test(h))throw new Error('Seules les adresses publiques sont autorisées depuis le serveur de diagnostic.');
 if(/^\d+\.\d+\.\d+\.\d+$/.test(h)) {const a=h.split('.').map(Number);if(a.some(x=>x>255)||[0,10,127].includes(a[0])||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===198&&[18,19].includes(a[1]))throw new Error('Cette adresse appartient à un réseau privé ou réservé.');}
}
export async function lookup(host:string,type:string,resolver='Cloudflare'):Promise<any> {
 const base=resolver==='Google'?'https://dns.google/resolve':'https://cloudflare-dns.com/dns-query';
 const r=await fetch(`${base}?name=${encodeURIComponent(host)}&type=${type}`,{headers:{Accept:'application/dns-json'},signal:AbortSignal.timeout(6000)});
 if(!r.ok)throw new Error(`Le résolveur ${resolver} ne répond pas (${r.status}).`);return r.json();
}
export async function safeHTTP(url:URL) {
 const redirects:string[]=[];let u=url;const start=performance.now();
 for(let n=0;n<6;n++) {assertPublic(u.hostname);if(!u.hostname.includes(':')&&!/^\d+\./.test(u.hostname)){const [a,b]=await Promise.all([lookup(u.hostname,'A'),lookup(u.hostname,'AAAA')]);if(a.Status!==0||!([...a.Answer??[],...b.Answer??[]].some((x:any)=>[1,28].includes(x.type))))throw new Error('Le nom du serveur ne peut pas être résolu.');for(const x of [...a.Answer??[],...b.Answer??[]])if([1,28].includes(x.type))assertPublic(x.data);}
 const r=await fetch(u,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(8000),headers:{'User-Agent':'NetworkToolbox/1.0'}});await r.body?.cancel();
 if([301,302,303,307,308].includes(r.status)&&r.headers.get('location')) {u=targetURL(new URL(r.headers.get('location')!,u).href);redirects.push(u.href);continue;}
 return {status:r.status,url:u.href,ms:Math.round(performance.now()-start),redirects,headers:Object.fromEntries([...r.headers].filter(([k])=>!['set-cookie'].includes(k)))};
 }throw new Error('Le site redirige trop de fois.');
}
