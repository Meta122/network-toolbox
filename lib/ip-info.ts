export async function ipInfo(ip:string){
 const r=await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`,{signal:AbortSignal.timeout(4500)});
 if(!r.ok)throw Error('Le service d’informations IP est indisponible.');const d:any=await r.json();if(d.success===false)throw Error(d.message||'Informations IP indisponibles.');
 return {ip:d.ip,country:d.country,region:d.region,city:d.city,asn:d.connection?.asn,isp:d.connection?.isp||d.connection?.org,approximate:true};
}
