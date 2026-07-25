// karma.conf.js — Multi-browser + Coverage
// Place in project root. Run: ng test / npm run test:all-browsers
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-edge-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: { random: false },
      clearContext: false,
    },
    jasmineHtmlReporter: { suppressAll: true },

    // ── Coverage ─────────────────────────────────────────────
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/egy-passport'),
      subdir: '.',
      reporters: [
        { type: 'html' },          // browsable report → coverage/index.html
        { type: 'text-summary' },  // console summary
        { type: 'lcovonly' },      // for CI tools
      ],
      check: {
        global: {                  // ── Coverage thresholds ──
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70,
        },
      },
    },

    reporters: ['progress', 'kjhtml', 'coverage'],

    // ── Browsers ─────────────────────────────────────────────
    // Default: Chrome. For all browsers: npm run test:all-browsers
    browsers: ['Chrome'],

    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },

    restartOnFileChange: true,
  });
};

/* ═══════════════════════════════════════════════════════════════
   package.json — add these scripts:

   "scripts": {
     "test":               "ng test",
     "test:chrome":        "ng test --browsers=Chrome --watch=false",
     "test:firefox":       "ng test --browsers=Firefox --watch=false",
     "test:edge":          "ng test --browsers=Edge --watch=false",
     "test:all-browsers":  "ng test --browsers=Chrome,Firefox,Edge --watch=false",
     "test:ci":            "ng test --browsers=ChromeHeadlessCI,FirefoxHeadless --watch=false --code-coverage",
     "test:coverage":      "ng test --watch=false --code-coverage"
   }

   Install launchers:
   npm i -D karma-firefox-launcher karma-edge-launcher
═══════════════════════════════════════════════════════════════ */
