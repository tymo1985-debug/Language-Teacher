import {LocalDemoAIProvider} from "./local-demo-provider.js";
import {ProxyAIProvider} from "./proxy-provider.js";
import {buildTeacherContext} from "./context-builder.js";
import {parseTeacherResponse} from "./response-parser.js";

const providers=new Map();
providers.set("local-demo",new LocalDemoAIProvider());
providers.set("proxy",new ProxyAIProvider());

let activeProviderId="local-demo";

export function listAIProviders(){
  return [...providers.values()].map(provider=>({
    id:provider.id,
    label:provider.label,
    capabilities:provider.getCapabilities()
  }));
}

export function setAIProvider(providerId){
  if(!providers.has(providerId)){
    throw new Error(`Unknown AI provider: ${providerId}`);
  }
  activeProviderId=providerId;
}

export function getActiveAIProvider(){
  return providers.get(activeProviderId);
}

export async function requestTeacherResponse({
  languageProfile,
  mode="practice",
  userInput=""
}){
  const provider=getActiveAIProvider();
  if(!provider){
    throw new Error("No AI provider is configured.");
  }

  const context=await buildTeacherContext({
    languageProfile,
    mode,
    userInput
  });

  const raw=await provider.generateTeacherResponse(context);
  const response=parseTeacherResponse(raw);

  return {
    context,
    response,
    provider:{
      id:provider.id,
      label:provider.label,
      capabilities:provider.getCapabilities()
    }
  };
}
