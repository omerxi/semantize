//##############################################################################
var webdriver = require('selenium-webdriver');
var promise = require('selenium-webdriver').promise;
var chrome = require('selenium-webdriver/chrome');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
//##############################################################################

ChromeDriver = function(data) {
  this.data = data;
  this.chromeCapabilities = webdriver.Capabilities.chrome();
  this.chromeCapabilities.set('chromeOptions', {
    'args': this.data.options
  });
  this.driver = null;
};

ChromeDriver.prototype = {

  constructor: ChromeDriver,

  get: function(url) {
    if (this.driver === null) {
      var driver = null;
      driver = new webdriver.Builder();
      driver = this.data.remote === undefined ? driver : driver.usingServer(this.data.remote);
      driver = driver.withCapabilities(this.chromeCapabilities).build();
      this.driver = driver;
    }
    this.driver.get(url);
    console.log("Connecting to " + url);
  },

  quit: function() {
    console.log("All Done !");
    return this.driver.quit();
  },

  findOne: function(data, element) {
    var type = Object.keys(data)[0];
    var expression = data[type];
    var context = (element === undefined) ? this.driver : element;
    return context.findElement(By[type](expression));
  },

  findAll: function(data, element) {
    var type = Object.keys(data)[0];
    var expression = data[type];
    var context = (element === undefined) ? this.driver : element;
    return context.findElements(By[type](expression));
  },

  waitFor: function(data) {
    var type = Object.keys(data)[0];
    var expression = data[type];
    return this.driver.wait(until.elementLocated(By[type](expression)), data.timeout);
  },

  newFlow: function() {
    return promise.controlFlow();
  }

};

module.exports = {

  getInstance: function(data) {
    return new ChromeDriver(data);
  }

};
