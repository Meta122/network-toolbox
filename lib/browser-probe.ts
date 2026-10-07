export async function probeFromDevice(target:string,options:{signal?:AbortSignal;pageProtocol?:string;online?:boolean;fetcher?:typeof fetch}={}){
 const at=new Date().toISOString();let url:URL;try{url=new URL(target)}catch{return {kind:'unsupported',reason:'Adresse invalide.',at}}
 const protocol=options.pageProtocol??(typeof location==='undefined'?'https:':location.protocol);
 if(!['http:','https:'].includes(url.protocol))return {kind:'unsupported',reason:'Ce test concerne uniquement les sites web.',at};
 if(protocol==='https:'&&url.protocol==='http:')return {kind:'unsupported',reason:'Cette application sécurisée ne peut pas lancer ce test vers un site HTTP. Ouvre le site directement, puis indique ce que tu observes.',at};
 if(options.online===false)return {kind:'offline',reason:'Le téléphone est hors connexion. Reconnecte-le avant de tester.',at};
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(new DOMException('Délai dépassé','TimeoutError')),8000);const signal=options.signal?AbortSignal.any([options.signal,controller.signal]):controller.signal;
 const start=performance.now();
 try{const response=await (options.fetcher??fetch)(url.href,{method:'HEAD',mode:'no-cors',credentials:'omit',cache:'no-store',redirect:'follow',referrerPolicy:'no-referrer',signal});
 const ms=Math.round(performance.now()-start);if(response.type==='error')return {kind:'unobserved',reason:'Aucune réponse observable.',at};
 await response.body?.cancel();return {kind:'response',ms,status:response.type==='opaque'?null:response.status||null,opaque:response.type==='opaque',at};
 }catch(e){if(options.signal?.aborted)throw e;return {kind:'unobserved',reason:(e as Error).name==='TimeoutError'?'Aucune réponse observable en 8 secondes.':'La requête n’a pas abouti. La connexion ou une règle du navigateur peut en être la cause.',at};
 }finally{clearTimeout(timeout);controller.abort()}
}
