# Etiquetado Morado — sitio web

Sitio estático (HTML, CSS y JavaScript sin frameworks) para promocionar el servicio de etiquetado nutricional de Dania ([@etiquetadomorado](https://www.instagram.com/etiquetadomorado/)) a pymes y emprendedores de alimentos en Chile.

## Páginas

| URL | Contenido |
|---|---|
| `/` | Landing: servicio, proceso, rubros, sobre mí, planes, FAQ y formulario de cotización |
| `/servicios/` | Detalle del servicio |
| `/ley-de-etiquetado/` | Guía de la Ley 20.606 (contenido pensado para posicionar en Google) |
| `/preguntas-frecuentes/` | FAQ completa |
| `/gracias/` | Confirmación tras enviar el formulario (no se indexa) |
| `404.html` | Página de error |

## 1. Lista de placeholders (reemplazar antes de publicar)

Usa "Buscar y reemplazar en todos los archivos" (en VS Code: `Ctrl+Shift+H`):

| Buscar | Reemplazar por | Dónde aparece |
|---|---|---|
| `56979828311` | (ya configurado) Si cambia el WhatsApp, reemplázalo sin `+` ni espacios | `js/config.js`, enlaces de respaldo y JSON-LD (`+56979828311`) |
| `andres.gomez.rodriguez2003@gmail.com` | (ya configurado) Si cambia el correo de contacto | `js/config.js`, HTML y JSON-LD |
| `https://www.etiquetadomorado.cl` | Dominio definitivo | canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` y el campo `redirect` del formulario |
| `$XX.XXX` | Precios reales | `index.html` (sección Planes) |
| `8aba79ce-076e-4aed-ba34-f2d3830c78c3` | (ya configurado) Access Key de Web3Forms, si cambia el correo de destino (ver sección 3) | `index.html` (formulario) |

Además:

- **Logo:** reemplaza `assets/img/logo.svg` por el logo original, idealmente en SVG. Si cambia, regenera también `favicon.ico`, `assets/img/apple-touch-icon.png` y `assets/img/og-image.png` (1200×630).
- **Foto:** reemplaza `assets/img/dania.svg` por una foto cuadrada real (WebP, 600×600 o más) y actualiza el `src` en `index.html`.
- **Sobre mí:** confirma el título o la formación exacta de Dania (busca `TODO` en `index.html`).
- **Testimonios:** la sección está comentada en `index.html`. Actívala solo con testimonios reales de clientes.
- Todos los puntos pendientes están marcados con `TODO` en el código.

> El header, el footer y el sprite de íconos se repiten en cada HTML. Si cambias un enlace del menú, usa buscar y reemplazar en todos los archivos.

## 2. Ver el sitio en local

Cualquier servidor estático sirve. Por ejemplo, en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .claude/serve.ps1
```

Luego abre http://localhost:8080. No abras los `.html` con doble clic: las rutas empiezan con `/` y necesitan un servidor.

## 3. Formulario de contacto (Web3Forms)

Cloudflare Pages no procesa formularios, así que las solicitudes de cotización se envían con [Web3Forms](https://web3forms.com). Es gratis (250 envíos al mes) y no necesita backend.

1. Entra a [web3forms.com](https://web3forms.com), ingresa **el correo donde Dania quiere recibir las solicitudes** y pulsa **Create Access Key**. La clave llega a ese correo.
2. En `index.html`, pon esa clave en el campo `access_key` del formulario (ya configurada). No es un dato secreto: Web3Forms está pensado para que la clave vaya en el HTML.
3. Publica el sitio y envía una solicitud de prueba. Debe llegar al correo y la página debe redirigir a `/gracias/`.

Si la clave falta o el envío falla, el formulario muestra un mensaje de error con un enlace a WhatsApp, así no se pierde ningún contacto.

## 4. Publicar en Cloudflare Pages (gratis)

Crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com) y elige **una** de estas dos opciones.

### Opción A: subida manual (sin Git)

1. Genera la carpeta `dist/` solo con los archivos públicos. El script también avisa si quedan placeholders sin reemplazar.
   ```powershell
   powershell -ExecutionPolicy Bypass -File .claude/empaquetar.ps1
   ```
2. En Cloudflare, ve a **Workers & Pages → Create → Pages → Upload assets**.
3. Nombra el proyecto `etiquetadomorado` y arrastra la carpeta **`dist`**.
4. El sitio queda publicado en `https://etiquetadomorado.pages.dev`.
5. Para actualizarlo: vuelve a ejecutar el script, entra al proyecto y usa **Create deployment** para subir `dist` de nuevo.

### Opción B: GitHub (se publica solo con cada cambio)

1. Sube el proyecto a un repositorio de GitHub. El `.gitignore` ya excluye `.claude/` y `dist/`.
2. En Cloudflare, ve a **Workers & Pages → Create → Pages → Connect to Git** y elige el repositorio.
3. Configuración del build:
   - **Framework preset:** None
   - **Build command:** vacío
   - **Build output directory:** `/`
4. Desde ahí, cada `git push` a la rama principal publica el sitio. Las demás ramas generan URLs de vista previa.

### Qué ya está configurado

- **`_headers`:** caché, headers de seguridad y `noindex` para `/gracias/` y para la URL `*.pages.dev` (así Google no la toma como contenido duplicado del dominio real).
- **`404.html`:** Cloudflare la usa automáticamente para las páginas que no existen.
- **URLs limpias:** `/servicios/` y las demás funcionan sin configurar nada.

## 5. Dominio propio (`etiquetadomorado.cl`)

1. Compra el dominio en [NIC Chile](https://www.nic.cl).
2. En Cloudflare, usa **Add a site**, escribe `etiquetadomorado.cl` y elige el plan **Free**. Cloudflare te mostrará dos *nameservers*.
3. En NIC Chile, entra a la administración del dominio y reemplaza sus servidores DNS por esos dos. La propagación toma desde minutos hasta unas horas.
4. En el proyecto de Pages, ve a **Custom domains → Set up a custom domain** y agrega `www.etiquetadomorado.cl`. Luego repite con `etiquetadomorado.cl`. El certificado HTTPS se emite solo.
5. **Redirigir el dominio sin `www`:** los canonical y el sitemap usan `www`, así que en el panel del dominio ve a **Rules → Redirect Rules → Create rule** y configura:
   - **Si:** *Hostname* es igual a `etiquetadomorado.cl`
   - **Entonces:** *Dynamic redirect* a `concat("https://www.etiquetadomorado.cl", http.request.uri.path)`, código **301**, con **Preserve query string** marcado.
6. Opcional: activa **Analytics & Logs → Web Analytics** para tener estadísticas de visitas gratis y sin cookies.

## 6. SEO: pasos después de publicar

El sitio ya incluye:

- título y descripción únicos por página;
- canonical y Open Graph;
- datos estructurados (ProfessionalService, FAQPage, Article y BreadcrumbList);
- `sitemap.xml` y `robots.txt`;
- HTML semántico y buen rendimiento.

Para posicionar mejor en Google:

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)):
   - agrega el dominio;
   - envía `https://www.etiquetadomorado.cl/sitemap.xml`;
   - pide la indexación de la página de inicio.
2. **Google Business Profile** ([business.google.com](https://business.google.com)): crea el perfil como "negocio de servicios" sin dirección pública, con área de servicio "Chile", categoría "Nutricionista" o "Servicio de consultoría" y el enlace a la web. Esto es clave para las búsquedas locales.
3. **Reseñas:** pide a cada cliente satisfecho una reseña en Google.
4. **Instagram:** pon el enlace de la web en la bio y en las historias destacadas.
5. **Enlaces entrantes:** busca aparecer en directorios de emprendedores, en ferias y en cámaras de comercio. Comparte la guía de la Ley 20.606 en grupos de emprendedores.
6. **Contenido:** publicar de vez en cuando artículos nuevos ayuda mucho al posicionamiento. Algunas ideas:
   - "¿Cómo calcular la porción de mi producto?"
   - "Alérgenos que debes declarar"
   - "Qué significa 'libre de azúcar'"

   Puedes duplicar `ley-de-etiquetado/index.html` como plantilla y agregar cada página nueva a `sitemap.xml`.
7. **Validación:** revisa los datos estructurados con el [Rich Results Test](https://search.google.com/test/rich-results) y la velocidad con [PageSpeed Insights](https://pagespeed.web.dev).

## Estructura

```
index.html, 404.html, */index.html   páginas
css/styles.css                       estilos (paleta en :root)
js/config.js                         WhatsApp, email e Instagram
js/main.js                           menú, WhatsApp, formulario, animaciones
assets/img/                          logo, sellos, og-image, íconos
robots.txt, sitemap.xml, site.webmanifest
_headers                             headers de Cloudflare Pages (caché, seguridad, noindex)
_redirects                           redirecciones 301 (ej. la antigua /calculadora-sellos/)
.claude/serve.ps1                    servidor local
.claude/empaquetar.ps1               genera dist/ para la subida manual
```

## Nota legal

La guía de la ley es informativa y usa los límites de la etapa final de la Ley 20.606 (DS 13/2015, vigentes desde junio de 2019). Conviene que Dania revise el contenido y lo mantenga al día ante cambios normativos.
