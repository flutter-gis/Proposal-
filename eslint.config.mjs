import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // ── Re-enabled rules (were all "off" before) ──────────────────────────
    // These catch real bugs — exhaustive-deps would have caught A1, A2, B8.
    "react-hooks/exhaustive-deps": "warn", // warn, not error, to avoid blocking builds
    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    }],
    "no-console": ["warn", {
      allow: ["error"],
    }],
    "prefer-const": "warn",
    "no-unreachable": "warn",
    "no-empty": "warn",

    // ── Still disabled (would require significant refactoring) ────────────
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",

    // React Compiler rules — too many false positives for Three.js / R3F
    "react-hooks/purity": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/immutability": "off",
    "react-hooks/refs": "off",
    "react-hooks/use-memo": "off", // false positive for generic hook wrappers
    "react-hooks/static-components": "off", // false positive for dynamic scene selection
    "react-compiler/react-compiler": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",

    "@next/next/no-img-element": "off", // we use <img> in some places intentionally
    "@next/next/no-html-link-for-pages": "off",

    "no-debugger": "off", // removeConsole in next.config handles this
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-useless-escape": "off",
  },
}, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "examples/**",
    "skills",
    "scripts/**",
  ],
}];

export default eslintConfig;
