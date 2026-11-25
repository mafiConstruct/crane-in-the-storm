// Builds the single-file game (index.html) from src/.
import { readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
const js = readFileSync('src/main_stage2.js', 'utf8').replace('//RENDER', readFileSync('src/render.js', 'utf8'));
writeFileSync('src/.main.js', "import * as THREE from 'three';\n" + js);
const out = await build({ entryPoints: ['src/.main.js'], bundle: true, format: 'iife', minify: true, write: false });
const code = out.outputFiles[0].text.replace('</script>', '<\\/script>');
const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grúa en la tormenta - prueba Three.js 3/4</title><style>html,body{margin:0;background:#0b0e13;height:100%;overflow:hidden;font-family:system-ui,sans-serif}canvas{display:block;width:100vw;height:100vh;object-fit:contain}</style></head><body><canvas id="c" width="960" height="540"></canvas><script>' + code + '</script></body></html>';
writeFileSync('index.html', html);
console.log('index.html', html.length, 'bytes');
