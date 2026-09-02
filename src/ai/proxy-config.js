const LOCAL_HOSTS=new Set(["localhost","127.0.0.1","::1"]);

function normalizeBase(value){
  const text=String(value??"").trim();
  if(!text)return "";
  return text.replace(/\/+$/,"");
}

export function resolveAIProxyEndpoint({
  configuredUrl="",
  hostname=globalThis.location?.hostname??"",
  origin=globalThis.location?.origin??""
}={}){
  const configured=normalizeBase(configuredUrl);
  if(configured){
    try{
      const url=new URL(configured,origin||undefined);
      return `${url.toString().replace(/\/+$/,"")}/api/teacher`;
    }catch{
      return null;
    }
  }

  if(LOCAL_HOSTS.has(hostname))return "/api/teacher";
  return null;
}

export function getConfiguredAIProxyEndpoint(){
  const configured=globalThis.LANGUAGE_TEACHER_CONFIG?.aiProxyBaseUrl??"";
  return resolveAIProxyEndpoint({configuredUrl:configured});
}
