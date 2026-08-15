export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: './tsconfig.json',
      // Type diagnostics are intentionally disabled: the test suite exercises the
      // providers at runtime, type checking is covered by `npm run lint` / `npm run build`.
      diagnostics: false
    }]
  },
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts']
};