function imprimir(){
  const transporte = document.getElementById("transporte");
  const destino = document.getElementById("destino");
  const remito = document.getElementById("remito");
  const bultos = document.getElementById("bultos");

  if (!transporte.value || !destino.value) {
    alert("Seleccioná el transporte y el destino antes de imprimir.");
    return;
  }

  const url =
    "instrucciones_print.html?" +
    "transporte=" + encodeURIComponent(transporte.value) +
    "&destino=" + encodeURIComponent(destino.value) +
    "&remito=" + encodeURIComponent(remito.value) +
    "&bultos=" + encodeURIComponent(bultos.value);

  window.open(url, "_blank");
}

function limpiar(){
  document.getElementById("transporte").selectedIndex = 0;
  document.getElementById("destino").selectedIndex = 0;
  document.getElementById("remito").value = "";
  document.getElementById("bultos").value = "";
  document.getElementById("transporte").focus();
}
