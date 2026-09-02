export function renderOperationNotice(state){
  const operation=state.operation;
  if(!operation?.message)return "";

  return `<div class="operation-notice is-${operation.kind}" role="${operation.kind==="error"?"alert":"status"}">
    <span>${escapeHtml(operation.message)}</span>
    <button type="button" class="text-button" id="operation-dismiss">Закрыть</button>
  </div>`;
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}
