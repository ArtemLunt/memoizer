module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@memoizer/(.*)": "<rootDir>/src/$1"
  }
};
