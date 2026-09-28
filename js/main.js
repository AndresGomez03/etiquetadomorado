/* =========================================================
   Etiquetado Morado — interacción general
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  function linkWsp(mensaje) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(mensaje || cfg.mensajeWsp || "");
  }

  function storage(tipo) {
    try {
      return window[tipo];
    } catch (e) {
      return null;
    }
  }

  /* ---------- Enlaces de WhatsApp ----------
     Cualquier <a data-wsp> recibe el enlace wa.me.
     data-wsp="texto" permite un mensaje propio. */
  document.querySelectorAll("a[data-wsp]").forEach(function (a) {
    a.href = linkWsp(a.getAttribute("data-wsp"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Email ---------- */
  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (el.tagName === "A") el.href = "mailto:" + cfg.email;
    if (!el.textContent.trim() || el.hasAttribute("data-email-texto")) el.textContent = cfg.email;
  });

  /* ---------- Año del footer ---------- */
  document.querySelectorAll("[data-anio]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    var cerrar = function () {
      nav.classList.remove("abierto");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var abierto = nav.classList.toggle("abierto");
      toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrar();
    });
  }

  /* ---------- Animación al hacer scroll ---------- */
  var revelables = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revelables.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revelables.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Formulario de cotización ---------- */
  var form = document.getElementById("form-cotizacion");
  if (form) {
    var mensajes = {
      valueMissing: "Este campo es obligatorio.",
      typeMismatch: "Revisa el formato (ej: nombre@correo.cl).",
      patternMismatch: "Ingresa un teléfono válido (ej: +56 9 1234 5678).",
      tooShort: "Escribe un poco más, por favor."
    };

    var errorDe = function (campo) {
      var v = campo.validity;
      if (v.valid) return "";
      for (var k in mensajes) {
        if (v[k]) return mensajes[k];
      }
      return "Revisa este campo.";
    };

    var pintar = function (campo) {
      var cont = campo.closest(".campo");
      var err = cont && cont.querySelector(".campo__error");
      var msg = errorDe(campo);
      campo.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return !msg;
    };

    form.querySelectorAll("input, select, textarea").forEach(function (campo) {
      if (campo.name === "botcheck" || campo.type === "hidden") return;
      campo.addEventListener("blur", function () {
        if (campo.value) pintar(campo);
      });
      campo.addEventListener("input", function () {
        if (campo.getAttribute("aria-invalid") === "true") pintar(campo);
      });
    });

    form.addEventListener("submit", function (e) {
      var primero = null;
      form.querySelectorAll("[required]").forEach(function (campo) {
        if (!pintar(campo) && !primero) primero = campo;
      });
      if (primero) {
        e.preventDefault();
        primero.focus();
        return;
      }

      // Guardamos un resumen para ofrecer seguir la conversación por WhatsApp en /gracias/
      var d = new FormData(form);
      var resumen = {
        nombre: d.get("nombre") || "",
        empresa: d.get("empresa") || "",
        producto: d.get("tipo_producto") || "",
        cantidad: d.get("cantidad_productos") || "",
        receta: d.get("tiene_receta") || ""
      };
      var ss = storage("sessionStorage");
      try {
        if (ss) ss.setItem("em_cotizacion", JSON.stringify(resumen));
      } catch (err) {
        /* sin almacenamiento: /gracias/ usa el mensaje por defecto */
      }

      // Envío con fetch a Web3Forms; sin JS el formulario se envía de forma nativa
      // y Web3Forms redirige a /gracias/ con el campo "redirect".
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var textoBtn = btn ? btn.textContent : "";
      var estado = document.getElementById("form-estado");
      if (estado) estado.hidden = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Enviando…";
      }

      var fallar = function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = textoBtn;
        }
        if (estado) {
          estado.hidden = false;
          estado.focus();
        }
      };

      if (String(d.get("access_key")).indexOf("TU_") === 0) {
        console.warn("Formulario sin configurar: falta la Access Key de Web3Forms (ver README).");
        fallar();
        return;
      }

      fetch(form.action, { method: "POST", body: d, headers: { Accept: "application/json" } })
        .then(function (r) {
          return r.json().then(function (json) {
            if (!r.ok || !json.success) throw new Error(json.message || r.status);
          });
        })
        .then(function () {
          window.location.href = "/gracias/";
        })
        .catch(function (err) {
          console.error("Error al enviar el formulario:", err);
          fallar();
        });
    });
  }

  /* ---------- Página de gracias ---------- */
  var btnGracias = document.getElementById("wsp-gracias");
  if (btnGracias) {
    var datos = null;
    var ss2 = storage("sessionStorage");
    try {
      datos = ss2 && JSON.parse(ss2.getItem("em_cotizacion") || "null");
    } catch (e) {
      datos = null;
    }
    var msg = cfg.mensajeWsp;
    if (datos && datos.nombre) {
      msg =
        "¡Hola Dania! Soy " + datos.nombre +
        (datos.empresa ? " de " + datos.empresa : "") +
        ". Acabo de enviar el formulario de cotización en la web" +
        (datos.producto ? " para " + datos.producto.toLowerCase() : "") +
        (datos.cantidad ? " (" + datos.cantidad + " producto/s)" : "") +
        ". ¿Podemos conversar?";
      var saludo = document.getElementById("gracias-nombre");
      if (saludo) saludo.textContent = ", " + datos.nombre.split(" ")[0];
    }
    btnGracias.href = linkWsp(msg);
  }

  // Exponer para otros scripts (calculadora)
  window.EM = { linkWsp: linkWsp };
})();
