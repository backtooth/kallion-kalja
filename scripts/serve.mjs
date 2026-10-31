import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
const root=resolve('dist');
createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}const file=path===root?resolve(root,'index.html'):path;const body=await readFile(file);res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript','json':'application/json'})[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404).end('Ei löydy');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
