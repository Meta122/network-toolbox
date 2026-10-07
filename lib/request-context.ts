import {AsyncLocalStorage} from 'node:async_hooks';
type Context={cf:any;agentURL?:string;agentToken?:string};
const store=new AsyncLocalStorage<Context>();
export function runWithRequestContext<T>(context:Context,fn:()=>T):T{return store.run(context,fn)}
export function getRequestContext(){return store.getStore()}
