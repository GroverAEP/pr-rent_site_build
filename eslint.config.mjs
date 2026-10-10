import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/*",
                "@/modules/*/*/**",
                "!@/modules/*/index",
                "!@/modules/*/ui/actions*",
                "!@/modules/*/actions*",
              ],
              message:
                "Violación de arquitectura de Monolito Modular: No importes archivos internos de otros módulos. Importa únicamente a través de su punto de entrada público '@/modules/<modulo>'.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
