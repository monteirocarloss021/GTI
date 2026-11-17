import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
const output = await build({
  entryPoints: ["src/world.js"],
  bundle: true,
  minify: true,
  format: "iife",
  write: false,
  legalComments: "none",
});
const file = "index.html",
  html = await readFile(file, "utf8");
const license = await readFile("node_modules/three/LICENSE", "utf8");
const slot = /<script id="gti-world">[\s\S]*?<\/script>/;
if (!slot.test(html)) throw new Error("Bloco 3D ausente");
await writeFile(
  file,
  html.replace(
    slot,
    () =>
      '<script id="gti-world">\n/*! ' +
      license +
      " */\n" +
      output.outputFiles[0].text.replace(/<\/script/gi, "<\\/script") +
      "\n</script>",
  ),
);
