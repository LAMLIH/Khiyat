import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));
const external = Object.keys(pkg.dependencies || {});

async function build() {
    try {
        await esbuild.build({
            entryPoints: [path.resolve(__dirname, "../server/index.ts")],
            bundle: true,
            platform: "node",
            format: "esm",
            outfile: path.resolve(__dirname, "../dist/index.js"),
            external,
        });
        console.log("Server build complete");
    } catch (error) {
        console.error("Server build failed:", error);
        process.exit(1);
    }
}

build();
