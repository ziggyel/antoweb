# Expediente: anomalía pendiente de resolución — versión con mecánicas

Esta versión parte de los archivos actuales del proyecto y suma interacciones inspiradas en los sistemas de *Disco Elysium*, sin usar assets oficiales del juego.

## Qué se agregó

- **Tareas / journal** en el HUD, con progreso automático.
- **Check blanco de Empatía**: falla obligatoriamente la primera vez, queda bloqueado y se reabre después de investigar.
- **Living investigable**: seis puntos clickeables sobre la ilustración (`sillón`, `manta`, `televisión`, `mesa`, `salida`, `ventana`). Hay que descubrir al menos tres.
- **Checks pasivos** de habilidades que interrumpen el diálogo con observaciones breves.
- **Thought Cabinet**: aparece el pensamiento **“La forma de un hogar”**, se puede internalizar y revela problema, solución y efectos.
- **Pruebas / thought orbs**: después de internalizar el pensamiento hay que revisar cualquier tres recuerdos del expediente.
- **Tirada roja final**: los modificadores encontrados quedan resaltados y la probabilidad se actualiza según la evidencia reunida.
- **Texto del diálogo** reajustado para ser más íntimo, melancólico y menos administrativo.

## Cómo subirlo a GitHub

Reemplazá en la raíz de tu repositorio:

- `index.html`
- `style.css`
- `script.js`

**No borres tu carpeta `assets/`.** Esta versión sigue usando los mismos nombres:

- `assets/anto-portrait.png`
- `assets/living.png`
- `assets/ambient.mp3`

El HTML ya tiene `?v=de8` en CSS y JS para ayudar a evitar que GitHub Pages muestre una versión vieja en caché.

## Recorrido nuevo

1. Revisar expediente.
2. Entrar al living.
3. Intentar un check blanco de Empatía.
4. Fallar y examinar al menos tres objetos del living.
5. Reintentar el check blanco.
6. Internalizar “La forma de un hogar”.
7. Revisar cualquier tres esferas / pruebas.
8. Continuar el diálogo con checks pasivos.
9. Llegar a la tirada roja de Volición.
10. Resolver el caso.


## Corrección DE6 — reinicio
El botón **“Revisar el expediente desde el inicio”** ahora funciona también como enlace de respaldo y, con JavaScript activo, recarga la página completa. Esto restablece todas las mecánicas, checks, pistas, tareas y pensamientos al estado inicial.

## Actualización — Volición + Anexo 41-B

- El diagnóstico del sujeto fue reemplazado por la nueva lectura de **Volición**, con énfasis en el cierre sobre seguridad y cuidado.
- La ficha del personaje incorpora un bloque visualmente separado: **Documento adjunto 41-B — Notas de campo del Tte. Kitsuragi**.
- La imagen de Kim se carga desde la URL indicada en el HTML.


## Actualización DE8 — Libreta de Kim

- Se tomó como base la última versión subida por la usuaria.
- Se conserva el diagnóstico actualizado de **Volición**, todas las mecánicas DE5 y el reinicio seguro DE6.
- Se corrigió además el `z-index` del panel **Tareas** a `105`, porque la última copia subida todavía tenía el valor anterior (`91`).
- El bloque visible de Kim debajo de la ficha fue eliminado.
- En la ficha aparece ahora **[INSPECCIONAR DOCUMENTO ADJUNTO 41-B]**.
- El botón abre un **anotador de dos páginas**: papel envejecido, foto pegada con cinta, tipografía manuscrita, subrayados, tachones, comentarios al margen, mancha de café y firma de Kim.
- Se puede cerrar con **×**, clic fuera del cuaderno o **Escape**.
- En pantallas angostas las dos páginas se apilan verticalmente.
- La imagen de Kim continúa cargándose desde la URL indicada en el HTML; no hace falta agregar un asset nuevo.
