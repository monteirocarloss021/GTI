import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
const { outputFiles } = await build({
  entryPoints: ["src/world.js"],
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
  legalComments: "none",
});
const license = await readFile("node_modules/three/LICENSE", "utf8");
let html = await readFile("index.html", "utf8");
for (const [id, source] of [
  ["gti-world", "/*! " + license + " */\n" + outputFiles[0].text],
  ["gti-play", await readFile("src/play.js", "utf8")],
]) {
  const slot = new RegExp('<script id="' + id + '">[\\s\\S]*?</script>');
  if (!slot.test(html)) throw new Error("Bloco ausente: " + id);
  html = html.replace(
    slot,
    () =>
      '<script id="' +
      id +
      '">\n' +
      source.replace(/<\/script/gi, "<\\/script") +
      "\n</script>",
  );
}
await writeFile("index.html", html);
