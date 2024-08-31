/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  verbose: true,
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {
      useESM: true
    }],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};