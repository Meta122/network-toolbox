import {assertPublic} from '../../../lib/network';
import {ipInfo} from '../../../lib/ip-info';
export async function GET(req:Request){try{const ip=new URL(req.url).searchParams.get('ip')||'';if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)&&!ip.includes(':'))throw Error('Saisis une adresse IPv4 ou IPv6.');assertPublic(ip);return Response.json(await ipInfo(ip),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:(e as Error).message},{status:400})}}
