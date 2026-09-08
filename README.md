# El milagro de Martinaise

One-page interactiva para GitHub Pages.

## Publicarla
1. Creá un repositorio nuevo en GitHub.
2. Subí `index.html`, `style.css`, `script.js` y la carpeta `assets` en la raíz.
3. En GitHub: **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná `main` y `/ (root)`.
6. Guardá y esperá a que GitHub te dé la URL.

## Retrato de Anto
La web ya funciona con `assets/anto.png`, que usa la foto adjunta con un tratamiento visual CSS.

Si generás una versión pictórica con `PROMPT_RETRATO.txt`, simplemente reemplazá `assets/anto.png` por la nueva imagen manteniendo el mismo nombre. No hace falta tocar el código.

## Sonido
No hace falta subir un MP3. El botón de cassette genera un ambiente muy sutil con Web Audio API y, por políticas del navegador, se activa únicamente cuando la usuaria hace clic.
