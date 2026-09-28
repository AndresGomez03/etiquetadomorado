/* =========================================================
   Calculadora orientativa de sellos "ALTO EN" (Ley 20.606)
   Límites de la etapa final (vigente desde junio de 2019).
   ========================================================= */
(function () {
  "use strict";

  var LIMITES = {
    solido: { energia: 275, sodio: 400, azucares: 10, grasas: 4 },
    liquido: { energia: 70, sodio: 100, azucares: 5, grasas: 3 }
  };

  var NUTRIENTES = [
    { id: "energia", nombre: "Energía", unidad: "kcal", sello: "calorias", selloNombre: "CALORÍAS" },
    { id: "azucares", nombre: "Azúcares totales", unidad: "g", sello: "azucares", selloNombre: "AZÚCARES" },
    { id: "sodio", nombre: "Sodio", unidad: "mg", sello: "sodio", selloNombre: "SODIO" },
    { id: "grasas", nombre: "Grasas saturadas", unidad: "g", sello: "grasas", selloNombre: "GRASAS SATURADAS" }
  ];

  var form = document.getElementById("calc-form");
  var salida = document.getElementById("calc-salida");
  if (!form || !salida) return;

  function numero(nombre) {
    var campo = form.elements[nombre];
    var txt = String(campo.value).replace(",", ".").trim();
    if (txt === "") return null;
    var n = parseFloat(txt);
    return isNaN(n) || n < 0 ? null : n;
  }

  function fmt(n) {
    return n.toLocaleString("es-CL", { maximumFractionDigits: 1 });
  }

  // ¿Corresponde evaluar este nutriente según los ingredientes agregados?
  function seEvalua(id, add) {
    if (id === "azucares") return add.azucar;
    if (id === "sodio") return add.sodio;
    if (id === "grasas") return add.grasa;
    if (id === "energia") return add.azucar || add.grasa;
    return false;
  }

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function calcular() {
    var estado = form.elements.estado.value;
    var lim = LIMITES[estado];
    var porU = estado === "solido" ? "100 g" : "100 ml";
    var add = {
      azucar: form.elements.add_azucar.checked,
      sodio: form.elements.add_sodio.checked,
      grasa: form.elements.add_grasa.checked
    };

    var algunValor = false;
    var sellos = [];
    var lista = el("ul", "calc__detalle");

    NUTRIENTES.forEach(function (n) {
      var v = numero(n.id);
      var li = el("li");
      var izq = el("span", null, n.nombre + " (límite " + fmt(lim[n.id]) + " " + n.unidad + "/" + porU + ")");
      var der;
      if (v === null) {
        der = el("span", "nota", "sin dato");
      } else {
        algunValor = true;
        if (!seEvalua(n.id, add)) {
          der = el("span", "nota", fmt(v) + " " + n.unidad + " · no aplica");
        } else if (v > lim[n.id]) {
          der = el("span", "excede", fmt(v) + " " + n.unidad + " · ALTO EN");
          sellos.push(n);
        } else {
          der = el("span", "cumple", fmt(v) + " " + n.unidad + " · OK");
        }
      }
      li.appendChild(izq);
      li.appendChild(der);
      lista.appendChild(li);
    });

    salida.textContent = "";

    if (!algunValor) {
      salida.appendChild(el("p", "nota", "Completa al menos un nutriente para ver el resultado."));
      return;
    }

    if (sellos.length) {
      salida.appendChild(el("p", null, "Según los datos ingresados, tu producto llevaría " +
        (sellos.length === 1 ? "este sello:" : "estos " + sellos.length + " sellos:")));
      var cont = el("div", "calc__sellos");
      sellos.forEach(function (n) {
        var img = document.createElement("img");
        img.className = "sello";
        img.src = "/assets/img/sello-" + n.sello + ".svg";
        img.alt = "Sello ALTO EN " + n.selloNombre.toLowerCase();
        img.width = 104;
        img.height = 104;
        cont.appendChild(img);
      });
      salida.appendChild(cont);
    } else {
      var ok = el("div", "calc__ok");
      ok.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"/></svg>';
      ok.appendChild(el("span", null, "Con estos datos, tu producto no llevaría sellos “ALTO EN”."));
      salida.appendChild(ok);
    }

    salida.appendChild(lista);

    var msg = "¡Hola Dania! Usé la calculadora de sellos de tu web" +
      (sellos.length
        ? " y mi producto saldría ALTO EN " + sellos.map(function (n) { return n.selloNombre.toLowerCase(); }).join(", ") + "."
        : " y mi producto no llevaría sellos.") +
      " Me gustaría cotizar un etiquetado profesional.";

    var acciones = el("div", "acciones");
    var wsp = el("a", "btn btn--wsp");
    wsp.href = window.EM ? window.EM.linkWsp(msg) : "/#cotizar";
    wsp.target = "_blank";
    wsp.rel = "noopener";
    wsp.innerHTML = '<svg aria-hidden="true"><use href="#i-wsp"/></svg>';
    wsp.appendChild(document.createTextNode("Validar con Dania"));
    acciones.appendChild(wsp);
    salida.appendChild(acciones);

    salida.appendChild(el("p", "nota", "Resultado orientativo. No reemplaza la evaluación profesional del etiquetado."));
  }

  form.addEventListener("input", calcular);
  form.addEventListener("change", calcular);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calcular();
  });
})();
