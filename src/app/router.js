const ROUTES=new Set([
  "today","practice","session","speech","review","words","progress","settings"
]);

function routeFromHash(){
  const raw=window.location.hash.replace(/^#\/?/,"").trim();
  return ROUTES.has(raw)?raw:"today";
}

export function getRoute(){
  return routeFromHash();
}

export function navigate(route){
  const next=ROUTES.has(route)?route:"today";
  window.location.hash=`#/${next}`;
}

export function startRouter(onChange){
  const handler=()=>onChange(routeFromHash());
  window.addEventListener("hashchange",handler);
  if(!window.location.hash){
    window.location.hash="#/today";
  }else{
    handler();
  }
  return()=>window.removeEventListener("hashchange",handler);
}
