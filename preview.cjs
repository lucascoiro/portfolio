const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'dist');
const prefix=(process.env.PREVIEW_BASE_PATH||'').replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((req,res)=>{let file;try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(prefix){if(pathname===prefix){res.writeHead(302,{Location:prefix+'/'});return res.end();}if(!pathname.startsWith(prefix+'/')){res.writeHead(404);return res.end();}pathname=pathname.slice(prefix.length);}file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);return res.end();}if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end('Arquivo não encontrado');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});}).listen(4328,'127.0.0.1',()=>console.log('http://127.0.0.1:4328'+prefix+'/'));
