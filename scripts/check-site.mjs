import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const files=fs.readdirSync(dist,{recursive:true}).filter(file=>fs.statSync(path.join(dist,file)).isFile());
const names=new Set(files.map(file=>file.replaceAll(path.sep,'/')));
const requireAsset=(reference,from='index.html')=>{
  if(!reference||/^(?:https?:|mailto:|data:|#)/.test(reference))return;
  const clean=reference.split(/[?#]/)[0];
  if(clean.startsWith('/'))throw Error(`Absolute path is incompatible with /portifolio/: ${reference}`);
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(from),clean));
  if(!names.has(resolved))throw Error(`Missing local asset: ${from} -> ${reference}`);
};
for(const file of names){
  const full=path.join(dist,file);
  if(file.endsWith('.html'))for(const match of fs.readFileSync(full,'utf8').matchAll(/(?:src|href)="([^"]+)"/g))requireAsset(match[1],file);
  if(file.endsWith('.css'))for(const match of fs.readFileSync(full,'utf8').matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))requireAsset(match[1],file);
  if(file.endsWith('.js'))execFileSync(process.execPath,['--check',full],{stdio:'pipe'});
}
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(dist,'content.js'),'utf8'),context,{timeout:1000});
const portfolio=context.window.PORTFOLIO;
if(portfolio.companies.length!==3)throw Error('The portfolio must contain three companies.');
for(const company of portfolio.companies){
  if(!company.id||!company.name||!/^\d{4}$/.test(String(company.year)))throw Error('Company identity or reference year is missing.');
  if(company.logo)requireAsset(company.logo.src);
  const ids=new Set();
  for(const product of company.products){
    if(ids.has(product.id))throw Error(`Duplicate product: ${company.id}/${product.id}`);
    ids.add(product.id);
    for(const key of ['id','title','description','problem','solution','result'])if(!product[key])throw Error(`Missing ${key}: ${company.id}/${product.id}`);
    if(product.media?.type==='image')requireAsset(product.media.src);
  }
}
if(!portfolio.profile.linkedin.startsWith('https://www.linkedin.com/'))throw Error('Invalid LinkedIn URL.');
console.log(`Site validated: ${names.size} static files, 3 companies, ${portfolio.companies.reduce((sum,c)=>sum+c.products.length,0)} products. Relative assets are compatible with GitHub Pages.`);
