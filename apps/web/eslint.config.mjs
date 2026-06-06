import next from 'eslint-config-next';

/**
 * Flat ESLint config (ESLint 9).
 *
 * Uses eslint-config-next's **native flat config** (v15.3+/16) directly. The
 * previous setup bridged the legacy shareable config through
 * `FlatCompat` + `@eslint/eslintrc`, which crashed ESLint 9 with
 * "TypeError: Converting circular structure to JSON" while the eslintrc config
 * validator tried to serialize the (circular) react plugin object — leaving the
 * repo with no working lint gate (typecheck + Vitest + build were the de-facto
 * gates). The native export already bundles `next/core-web-vitals` +
 * `next/typescript` (react, react-hooks, import, jsx-a11y) and its own global
 * ignores; we only add project-specific ignores on top.
 */
const eslintConfig = [
  ...next,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'coverage/**'],
  },
];

export default eslintConfig;
