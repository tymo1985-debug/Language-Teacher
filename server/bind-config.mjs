export function getServerBindConfig(env=process.env){
  return {
    host:String(env.HOST||"0.0.0.0"),
    port:Number(env.PORT)||8787
  };
}
