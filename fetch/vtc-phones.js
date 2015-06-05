//##############################################################################
// TODO iterate on rdf query results
// TODO iterate on search pages
// TODO silk matching
// TODO update rdf database
//##############################################################################
var Configuration = require('./local_modules/Configuration.js')
  .getInstance('{"url": "http://www.pagesjaunes.fr/pagesblanches"}');
var ChromeDriver = require('./local_modules/ChromeDriver.js')
  .getInstance(['--start-maximized']);
var PhoneSupplier = require('./local_modules/PhoneSupplier.js')
  .getInstance(ChromeDriver);
//##############################################################################
var timeout = 10000;
PhoneSupplier.connectTo(Configuration.get('url'), timeout).then(function() {
  PhoneSupplier.search("Bénichou", "Paris", timeout).then(function() {
    PhoneSupplier.getPageResults(function (page) {
      console.log(page);
    });
  });
});
//##############################################################################
ChromeDriver.quit();
//##############################################################################
