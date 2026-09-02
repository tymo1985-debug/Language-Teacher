export const TEACHER_RESPONSE_SCHEMA_VERSION=1;

const BLOCK_TYPES=new Set([
  "CONTEXT","LISTEN","UNDERSTAND","PHRASE","NOTICE","REPEAT",
  "SPEAK","RESPOND","GRAMMAR","ROLEPLAY","CORRECTION","RECALL"
]);

const SEVERITIES=new Set(["low","medium","high"]);

function isObject(value){
  return Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
}

export function validateTeacherResponse(value){
  const errors=[];

  if(!isObject(value)){
    return {valid:false,errors:["Response must be an object."]};
  }

  if(value.schemaVersion!==TEACHER_RESPONSE_SCHEMA_VERSION){
    errors.push(`schemaVersion must be ${TEACHER_RESPONSE_SCHEMA_VERSION}.`);
  }

  if(value.kind!=="teacher-response"){
    errors.push('kind must be "teacher-response".');
  }

  if(typeof value.message!=="string"){
    errors.push("message must be a string.");
  }

  if(!Array.isArray(value.blocks)){
    errors.push("blocks must be an array.");
  }else{
    value.blocks.forEach((block,index)=>{
      if(!isObject(block)){
        errors.push(`blocks[${index}] must be an object.`);
        return;
      }
      if(!BLOCK_TYPES.has(block.type)){
        errors.push(`blocks[${index}].type is unsupported.`);
      }
      if(typeof block.title!=="string"){
        errors.push(`blocks[${index}].title must be a string.`);
      }
      if(typeof block.prompt!=="string"){
        errors.push(`blocks[${index}].prompt must be a string.`);
      }
    });
  }

  if(!Array.isArray(value.corrections)){
    errors.push("corrections must be an array.");
  }else{
    value.corrections.forEach((correction,index)=>{
      if(!isObject(correction)){
        errors.push(`corrections[${index}] must be an object.`);
        return;
      }
      ["original","corrected","natural","note"].forEach(field=>{
        if(typeof correction[field]!=="string"){
          errors.push(`corrections[${index}].${field} must be a string.`);
        }
      });
      if(!SEVERITIES.has(correction.severity)){
        errors.push(`corrections[${index}].severity is unsupported.`);
      }
    });
  }

  if(!isObject(value.learningSignals)){
    errors.push("learningSignals must be an object.");
  }

  return {valid:errors.length===0,errors};
}
