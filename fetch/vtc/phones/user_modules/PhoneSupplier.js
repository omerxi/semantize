PhoneSupplier = function(driver) {
  this.driver = driver;
};

PhoneSupplier.prototype = {

  constructor: PhoneSupplier,

  connectTo: function(url, timeout) {
    this.driver.get(url);
    return this.driver.waitFor({
      'xpath': '//a[@title="Fermer"]',
      'timeout': timeout
    }).then(function(element) {
      element.click();
    }, function() {});
  },

  search: function(who, where, timeout) {
    this.driver.findOne({
      'id': 'pj_search_qui'
    }).then(function(element) {
      element.clear();
      element.sendKeys(who);
    });
    this.driver.findOne({
      'id': 'pj_search_ou'
    }).then(function(element) {
      element.clear();
      element.sendKeys(where);
    });
    this.driver.findOne({
      'xpath': '//button[@title="Trouver"]'
    }).then(function(element) {
      element.click();
    });
    return this.driver.waitFor({
      'id': 'contentMain',
      'timeout': timeout
    }).then(function(element) {
      element.click();
    });
  },

  // TODO privatize
  _displayPhone: function(entry) {
    this.driver.findOne({
      'xpath': './descendant::a[text()="Afficher le n°"]'
    }, entry).then(function(displayPhoneButton) {
      displayPhoneButton.click();
    });
  },

  // TODO privatize
  _getName: function(entry, collector) {
    this.driver.findOne({
        'xpath': './div/h2/a'
      }, entry)
      .then(function(node) {
        node.getText().then(function(name) {
          collector.name = name.replace(" + détails", "");
        });
      });
  },

  // TODO privatize
  _getAddress: function(entry, collector) {
    this.driver.findOne({
        'xpath': './descendant::p[@class="itemAdresse"]'
      }, entry)
      .then(function(data) {
        data.getText().then(function(data) {
          collector.address = data;
        });
      });
  },

  // TODO privatize
  _getPhones: function(entry, collector) {
    this.driver.findAll({
        'xpath': "./descendant::ul[contains(@class, 'blocPhoneNumber')]/li/strong"
      }, entry)
      .then(function(data) {
        collector.phones = [];
        data.map(function(item) {
          item.getText().then(function(data) {
            collector.phones.push(data);
          });
        });
      });
  },

  getPageResults: function(callback) {
    var page = [];
    this.driver.findAll({
      'xpath': '//li[contains(@class, "visitCard")]'
    }).then(function(elements) {
      var lastTask = null;
      var flow = this.driver.newFlow();
      elements.map(function(entry) {
        var collector = {};
        lastTask = flow.execute(function() {
          this._displayPhone(entry);
          this._getName(entry, collector);
          this._getAddress(entry, collector);
          this._getPhones(entry, collector);
        }.bind(this));
        lastTask.then(function() {
          page.push(collector);
        });
      }.bind(this))
    }.bind(this))

    .then(function() {
      callback(page);
    });
  },

  hasNextPage: function(yes, no) {
    this.driver.findOne({
      'xpath': "//a[@title='Aller en page suivante']"
    }).then(yes, no);
  },

  iterateOnPageResults: function(allResults, callback) {
    this.getPageResults(function(pageResults) {
      this.hasNextPage(function(element) {
        element.click();
        this.iterateOnPageResults(allResults.concat(pageResults), callback);
      }, function() {
        callback(allResults.concat(pageResults));
      });
    }.bind(this));
  },

  collectAllResults: function(data, callback) {
    allResults = [];
    this.search(data.who, data.where, data.timeout).then(function() {
      this.iterateOnPageResults(allResults, callback);
    }.bind(this));
  },

  get: function(data) {
    this.collectAllResults(data, function(allResults) {
      var fs = require("fs");
      fs.writeFile(data.output, JSON.stringify(allResults), function(error) {
        if (!error) console.log("Collected " + allResults.length + " entries with success in " + data.output);
      });
    });
  },

  apply: function(data) {
    this.connectTo(data.url, data.timeout).then(function() {
      this.get(data);
    }.bind(this));
    this.driver.quit();
  }

};

module.exports = {
  getInstance: function(data) {
    return new PhoneSupplier(data);
  }
};
