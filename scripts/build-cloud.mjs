import {readFile,readdir,mkdir,rm,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {build} from "esbuild";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml"};
const assets={};
async function add(relative){
  const content=await readFile(path.join(root,relative));
  assets[`/${relative}`]={base64:content.toString("base64"),contentType:mime[path.extname(relative)]??"application/octet-stream"};
}
async function addDirectory(relative){
  for(const entry of await readdir(path.join(root,relative),{withFileTypes:true})){
    if(entry.name.startsWith("."))continue;
    const child=`${relative}/${entry.name}`;
    if(entry.isDirectory())await addDirectory(child);
    else if(entry.isFile())await add(child);
  }
}
for(const file of ["index.html","sw.js","manifest.webmanifest","update.json"])await add(file);
await addDirectory("src");
await addDirectory("assets");
await rm(path.join(root,"dist"),{recursive:true,force:true});
await mkdir(path.join(root,"dist/server"),{recursive:true});
// Embed only the public allowlist: no server code, configuration or keys can be
// fetched as a static asset. A single module also avoids host-specific bindings.
await build({
  stdin:{contents:`import {createCloudWorker} from './server/cloud-worker.mjs';\nexport default createCloudWorker({assets:${JSON.stringify(assets)}});`,
    resolveDir:root,sourcefile:"cloud-entry.mjs"},
  outfile:path.join(root,"dist/server/index.js"),bundle:true,format:"esm",platform:"browser",target:"es2022"
});
try{
  const hosting=await readFile(path.join(root,".openai/hosting.json"),"utf8");
  await mkdir(path.join(root,"dist/.openai"),{recursive:true});
  await writeFile(path.join(root,"dist/.openai/hosting.json"),hosting);
}catch(error){if(error.code!=="ENOENT")throw error;}
console.log(`Cloud build ready: ${Object.keys(assets).length} public assets, server entrypoint dist/server/index.js.`);
