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
  const provider=providers.get(providerId);
  if(!provider)throw new Error(`Unknown AI provider: ${providerId}`);
  if(provider.getCapabilities().available===false){
    throw new Error("Secure cloud AI backend не настроен для этой публикации.");
  }
  activeProviderId=providerId;
}

export function getActiveAIProvider(){
  return providers.get(activeProviderId);
}

export async function requestTeacherResponse({
  languageProfile,
  mode="practice",
  userInput="",
  conversationTurns=[]
}){
  const provider=getActiveAIProvider();
  if(!provider)throw new Error("No AI provider is configured.");

  const context=await buildTeacherContext({
    languageProfile,
    mode,
    userInput,
    conversationTurns
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
