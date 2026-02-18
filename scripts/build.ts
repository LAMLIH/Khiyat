import esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
    try {
        await esbuild.build({
            entryPoints: [path.resolve(__dirname, "../server/index.ts")],
            bundle: true,
            platform: "node",
            format: "esm",
            outfile: path.resolve(__dirname, "../dist/index.js"),
            external: ["express", "pg", "postgres", "drizzle-orm", "bcrypt", "passport", "express-session"],
        });
        console.log("Server build complete");
    } catch (error) {
        console.error("Server build failed:", error);
        process.exit(1);
    }
}

build();
