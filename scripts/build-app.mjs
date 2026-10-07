import {spawnSync} from 'node:child_process';
import {readdirSync,writeFileSync} from 'node:fs';
const result=spawnSync(process.execPath,['scripts/run-framework.mjs','build',...process.argv.slice(2)],{stdio:'inherit'});
if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
const base='dist/client';
function list(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?list(`${directory}/${entry.name}`):[`${directory}/${entry.name}`])}
const assets=list(`${base}/_next/static`).filter(path=>/\.(?:js|css|woff2?)$/.test(path)).map(path=>path.slice(base.length));
writeFileSync(`${base}/offline-assets.json`,JSON.stringify({assets}));
console.log(`Offline bundle: ${assets.length} static assets.`);
