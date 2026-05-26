import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { createHash } from "crypto";
import fs from "fs";

// Plugin to generate and log SRI hashes for built assets
function sriPlugin() {
  return {
    name: "vite-plugin-sri",
    apply: "build" as const,
    async writeBundle(options: any) {
      const outDir = options.dir || "build";
      const assets = fs.readdirSync(outDir, { recursive: true });

      assets.forEach((file: string) => {
        const filePath = path.join(outDir, file as string);
        if (fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          const hash = createHash("sha384").update(content).digest("base64");
          const integrity = `sha384-${hash}`;
          console.log(`SRI for ${file}: ${integrity}`);
        }
      });
    },
  };
}

// Plugin to analyze and report bundle size
function bundleAnalyzerPlugin() {
  return {
    name: "vite-plugin-bundle-analyzer",
    apply: "build" as const,
    async writeBundle(options: any) {
      const outDir = options.dir || "build";
      const files = fs.readdirSync(outDir, { recursive: true });
      const sizeMap: { [key: string]: number } = {};

      files.forEach((file: string) => {
        const filePath = path.join(outDir, file as string);
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          sizeMap[file as string] = stats.size;
        }
      });

      // Log bundle sizes
      console.log("\n📦 Bundle Size Report:");
      const sortedFiles = Object.entries(sizeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      sortedFiles.forEach(([file, size]) => {
        const sizeKb = (size / 1024).toFixed(2);
        const gzipSize = Math.round(size * 0.3); // Rough estimate
        const gzipKb = (gzipSize / 1024).toFixed(2);
        console.log(
          `  ${file}: ${sizeKb}KB (gzip: ~${gzipKb}KB)`
        );
      });

      // Check Stellar SDK bundle size
      const stellarChunks = Object.entries(sizeMap).filter(([file]) =>
        file.includes("stellar") || file.includes("soroban")
      );
      if (stellarChunks.length > 0) {
        console.log("\n🌟 Stellar SDK Chunks:");
        stellarChunks.forEach(([file, size]) => {
          const sizeKb = (size / 1024).toFixed(2);
          const gzipSize = Math.round(size * 0.3);
          const gzipKb = (gzipSize / 1024).toFixed(2);
          console.log(`  ${file}: ${sizeKb}KB (gzip: ~${gzipKb}KB)`);
        });
      }

      // Total app size
      const totalSize = Object.values(sizeMap).reduce((a, b) => a + b, 0);
      const totalKb = (totalSize / 1024).toFixed(2);
      console.log(`\n📊 Total Bundle: ${totalKb}KB\n`);
    },
  };
}

export default defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      nodePolyfills({
        include: ["buffer"],
        globals: { Buffer: true },
      }),
      sriPlugin(),
      bundleAnalyzerPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "framer-motion": path.resolve(__dirname, "node_modules/framer-motion/dist/cjs/index.js"),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "build",
      sourcemap: true,
      // Enable minification
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false, // Keep console for debugging, set to true in production
          drop_debugger: true,
          pure_funcs: ["console.debug"], // Remove debug logs
        },
        mangle: true,
        output: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          // Manual chunk split to separate vendor code
          manualChunks: (id) => {
            // Keep stellar SDK in a separate chunk for better caching
            if (id.includes("node_modules/@stellar")) {
              return "stellar-sdk";
            }
            // Keep React in separate chunk
            if (id.includes("node_modules/react")) {
              return "react-vendor";
            }
            // Keep other large dependencies in vendor chunk
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      server: {
        deps: {
          inline: [/@csstools/],
        },
      },
    },
});
