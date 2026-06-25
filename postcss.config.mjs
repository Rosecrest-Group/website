import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      // Pin resolution to this app — avoids walking up to C:\Users\<you>\node_modules
      // (e.g. an old Tailwind v3 install) when the repo lives under your profile folder.
      base: projectRoot,
    },
  },
};

export default config;
