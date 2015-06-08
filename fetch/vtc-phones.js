//##############################################################################
// TODO iterate on rdf query results
// TODO silk matching
// TODO update rdf database
//##############################################################################
var Configuration = require('./local_modules/Configuration.js').getInstance();
var ChromeDriver = require('./local_modules/ChromeDriver.js').getInstance(['--start-maximized']);
var PhoneSupplier = require('./local_modules/PhoneSupplier.js').getInstance(ChromeDriver);
//##############################################################################
var url = Configuration.get('url') || function() {
  console.error("error: missing 'url' parameter");
  process.exit(1);
}();
var who = Configuration.get('who') || function() {
  console.error("error: missing 'who' parameter");
  process.exit(1);
}();
var where = Configuration.get('where') || function() {
  console.error("error: missing 'where' parameter");
  process.exit(1);
}();
var timeout = Configuration.get('timeout') || 15 * 1000;
var output = Configuration.get('output') || '/tmp/output.json';
//##############################################################################
PhoneSupplier.connectTo(url, timeout).then(function() {

  var IterateOnPageResults = function(allResults, callback) {
    PhoneSupplier.getPageResults(function(pageResults) {
      PhoneSupplier.hasNextPage(function(element) {
        element.click();
        IterateOnPageResults(allResults.concat(pageResults), callback);
      }, function() {
        callback(allResults.concat(pageResults));
      });
    });
  };

  var collectAllResults = function(callback) {
    allResults = [];
    PhoneSupplier.search(who, where, timeout).then(function() {
      IterateOnPageResults(allResults, callback);
    });
  };

  collectAllResults(function(allResults) {
    var fs = require("fs");
    fs.writeFile(output, JSON.stringify(allResults), function(error) {
      if (!error) console.log(allResults.length);
    });
  });

});
//##############################################################################
//ChromeDriver.quit();
//##############################################################################
