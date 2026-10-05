module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
