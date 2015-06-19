//##############################################################################
var configuration = require('./user_modules/Configuration.js').getInstance();
//##############################################################################
(function(data) {
  var chromeDriver = require('./user_modules/ChromeDriver.js').getInstance({
    options: ['--start-maximized'],
    remote: data.remote
  });
  var phoneSupplier = require('./user_modules/PhoneSupplier.js').getInstance(chromeDriver);
  phoneSupplier.apply(data);
}({
  url: configuration.get('url') || function() {
    console.error("error: missing 'url' parameter");
    process.exit(1);
  }(),
  who: configuration.get('who') || function() {
    console.error("error: missing 'who' parameter");
    process.exit(1);
  }(),
  where: configuration.get('where') || function() {
    console.error("error: missing 'where' parameter");
    process.exit(1);
  }(),
  timeout: configuration.get('timeout') || 30 * 1000,
  output: configuration.get('output') || '/tmp/output.json',
  remote: configuration.get('remote')
}));
//##############################################################################
