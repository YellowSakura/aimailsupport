export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: './tsconfig.json'
    }]
  },
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts']
};