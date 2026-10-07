import {getRequestContext} from '../../../lib/request-context';
import {ipInfo} from '../../../lib/ip-info';
export async function GET(req:Request){
 const cf=getRequestContext()?.cf||(req as any).cf; const ip=req.headers.get('cf-connecting-ip');
 let info:any={};if(ip)try{info=await ipInfo(ip)}catch{}
 return Response.json({ip:ip||null,country:info.country||cf?.country||req.headers.get('cf-ipcountry')||null,region:info.region||cf?.region||null,city:info.city||cf?.city||null,asn:info.asn||cf?.asn||null,isp:info.isp||cf?.asOrganization||null,server:cf?.colo||null,vpn:'unknown',dns:'unavailable',at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
