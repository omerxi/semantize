(function() {
  var configuration = require('./user_modules/Configuration.js').getInstance();
  (function(data) {
    var chromeDriver = require('./user_modules/ChromeDriver.js').getInstance({
      options: ['--start-maximized'],
      remote: data.remote
    });
    var mkdirp = require('mkdirp');
    mkdirp(data.output, function(error) {
      if (error) {
        console.error(err);
        process.exit(1);
      }
    });
    var ownerSupplier = require('./user_modules/OwnerSupplier.js').getInstance(chromeDriver);
    ownerSupplier.apply(data);
  }({
    url: configuration.get('url') || function() {
      // TODO extract method into Configuration
      console.error("error: missing 'url' parameter");
      process.exit(1);
    }(),
    from: new Date(configuration.get('from')) || function() {
      // TODO extract method into Configuration
      console.error("error: missing 'from' parameter");
      process.exit(1);
    }(),
    step: configuration.get('step') || 10,
    timeout: configuration.get('timeout') || 30 * 1000,
    output: configuration.get('output') || '/tmp/vtc/owners/',
    remote: configuration.get('remote')
  }));
}());
