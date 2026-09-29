const destinatario = document.getElementById("destinatario");
const entrega = document.getElementById("entrega");
const ciudad = document.getElementById("ciudad");
const rto = document.getElementById("rto");
const of = document.getElementById("of");
const oc = document.getElementById("oc");
const finaliza = document.getElementById("finaliza");
const parcial = document.getElementById("parcial");
const despachar = document.getElementById("despachar");

document.getElementById("btnImprimir").addEventListener("click", imprimir);
document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);

finaliza.addEventListener("change", () => { if (finaliza.checked) parcial.checked = false; });
parcial.addEventListener("change", () => { if (parcial.checked) finaliza.checked = false; });

function imprimir(){
  let url = "print.html?" +
    "destinatario=" + encodeURIComponent(destinatario.value) +
    "&entrega=" + encodeURIComponent(entrega.value) +
    "&ciudad=" + encodeURIComponent(ciudad.value) +
    "&rto=" + encodeURIComponent(rto.value.trim()) +
    "&of=" + encodeURIComponent(of.value.trim()) +
    "&oc=" + encodeURIComponent(oc.value.trim()) +
    "&finaliza=" + finaliza.checked +
    "&parcial=" + parcial.checked +
    "&despachar=" + encodeURIComponent(despachar.value);
  window.open(url, "_blank");
}

function limpiarFormulario(){
  document.getElementById("etiquetasForm").reset();
  destinatario.focus();
}
