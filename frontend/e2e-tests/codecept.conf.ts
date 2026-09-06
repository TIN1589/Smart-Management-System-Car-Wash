export const config: CodeceptJS.MainConfig = {
  tests: './*_test.ts',
  output: './output',

  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:5173',
      show: true,
    },
  },

  plugins: {
    screenshotOnFail: {
      enabled: true,
    },
  },

 name: 'SmartWashCar E2E Regression Tests',
};