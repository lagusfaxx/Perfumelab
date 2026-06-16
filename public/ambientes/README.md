# Fotos de ambientación 🌿

Acá van las **fotos de fondo** que aparecen detrás del ritual y de la revelación,
según el ingrediente / la escena que elige el cliente.

## Cómo funciona (no se rompe si falta una foto)

Cuando el cliente pasa o elige una opción, el fondo carga, en este orden:

1. La foto de **esa opción** (ej. `lugar/bosque.jpg`).
2. Si no existe → la foto de su **familia** (ej. `familia/verdes.jpg`).
3. Si tampoco → el **color** profundo de la familia.

➡️ Puedes empezar subiendo **solo las 6 de `familia/`** (cubren todo) y luego
agregar las específicas para más realismo. Nada se rompe en el camino.

## Especificaciones (importante)

- **Formato:** `.jpg` o `.webp`
- **Orientación:** horizontal (apaisada). Se recorta a pantalla completa, así que
  deja el sujeto algo centrado.
- **Tamaño:** ~**1920×1280 px** (mínimo 1600 px de ancho).
- **Peso:** idealmente **< 400 KB** cada una (compáctalas en tinypng.com o similar).
- **Estética:** oscuras, naturales, con sombra. Encima va un **velo oscuro** para que
  se lea el texto, así que funcionan mejor las fotos **moody / desaturadas / terrosas**.
- **Nombres:** EXACTOS como la lista de abajo (minúsculas, sin tildes, sin espacios).

---

## Lista de archivos

### `familia/` — 6 fotos (MÍNIMO recomendado, cubren todo)
| Archivo | Qué mostrar |
|---|---|
| `familia/citricos.jpg` | Luz brillante, cítricos partidos, amarillos/verdes, frescor |
| `familia/florales.jpg` | Pétalos, jardín suave, tonos pastel, luz difusa |
| `familia/amaderados.jpg` | Madera, troncos, tonos tierra/marrón, cálido |
| `familia/orientales.jpg` | Penumbra dorada, especias, ámbar, íntimo y oscuro |
| `familia/acuaticos.jpg` | Mar, olas, azules, brisa, agua |
| `familia/verdes.jpg` | Hojas, musgo, bosque verde, savia |

### `lugar/` — 5 fotos (alto impacto, son escenas)
| Archivo | Qué mostrar |
|---|---|
| `lugar/bosque.jpg` | Bosque después de la lluvia: tierra mojada, musgo, niebla |
| `lugar/costa.jpg` | Costa al atardecer: sal, olas, viento |
| `lugar/jardin.jpg` | Jardín en flor: rosas/jazmín, pasto |
| `lugar/mercado.jpg` | Mercado de especias: cardamomo/azafrán, colores cálidos |
| `lugar/huerto.jpg` | Huerto de cítricos al sol: naranjos |

### `momento/` — 4 fotos
| Archivo | Qué mostrar |
|---|---|
| `momento/amanecer.jpg` | Primer rayo, aire limpio, rocío, luz fría dorada |
| `momento/mediodia.jpg` | Sol alto, mar, luz intensa |
| `momento/atardecer.jpg` | El oro del atardecer, cálido |
| `momento/medianoche.jpg` | Penumbra, brasa, oscuro e íntimo |

### `textura/` — 5 fotos (primer plano de texturas)
| Archivo | Qué mostrar |
|---|---|
| `textura/seda.jpg` | Seda fría / tela / pétalo suave |
| `textura/madera.jpg` | Madera pulida, veta, cálido |
| `textura/agua.jpg` | Agua, gotas, piedra mojada |
| `textura/terciopelo.jpg` | Terciopelo oscuro, textura profunda |
| `textura/hoja.jpg` | Hoja recién partida, savia, verde |

### `amor/` — 6 fotos (ingredientes en primer plano)
| Archivo | Qué mostrar |
|---|---|
| `amor/citrico.jpg` | Naranja y bergamota partidas |
| `amor/flor.jpg` | Jazmín, rosa, flor de azahar |
| `amor/madera.jpg` | Sándalo, cedro, vetiver |
| `amor/ambar.jpg` | Ámbar, vainilla, incienso |
| `amor/salino.jpg` | Sal, ozono, brisa marina |
| `amor/verde.jpg` | Higuera, té verde, galbanum |

---

### Opcionales (si quieres aún más detalle)
Los pasos **intensidad**, **ocasión** y **rechazo** son abstractos y usan la foto de
familia por defecto. Si igual quieres ponerles foto, el patrón es el mismo:
`public/ambientes/<paso>/<opcion>.jpg` (ej. `ocasion/noche.jpg`).

> Sube los archivos a la carpeta que corresponde y haz deploy. Listo.
