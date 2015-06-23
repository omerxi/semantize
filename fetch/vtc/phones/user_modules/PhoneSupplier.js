PhoneSupplier = function(driver) {
  this.driver = driver;
};

PhoneSupplier.prototype = {

  constructor: PhoneSupplier,

  connectTo: function(url, timeout) {
    this.driver.get(url)
    return this.driver.waitFor({
      'xpath': '//a[@class="pjpopin-closer"][1]',
      'timeout': timeout
    }).then(function(element) {
      console.log("Connected");
      element.click();
    }, function() {});
  },

  search: function(who, where, timeout) {
    console.log("Searching " + who + " " + where);
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
      'xpath': '//button[@title="Trouver"][1]'
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
        'xpath': './descendant::p[@class="itemAdresse"][1]'
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
            collector.phones.push(data.replace(/^\./, ''));
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
        console.log('.');
        var collector = {};
        lastTask = flow.execute(function() {
          this.driver.findOne({
            'xpath': './descendant::a[text()="Afficher le n°"][1]'
          }, entry).then(function(element) {
            element.click();
            this._getName(entry, collector);
            this._getAddress(entry, collector);
            this._getPhones(entry, collector);
          }.bind(this), function() {
            console.log("skipping entry without any phone");
          });
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

  iterateOnPageResults: function(allResults, callback) {
    this.getPageResults(function(pageResults) {
      this.driver.findOne({
        "xpath": "//li[@class='linkNext']/a[1]"
      }).
      then(function(element) {
        console.log("It has Next page");
        element.getText().then(function(data) {
          console.log(data);
        });
        element.click().then(function() {
          this.iterateOnPageResults(allResults.concat(pageResults), callback);
        }.bind(this));
      }.bind(this), function() {
        callback(allResults.concat(pageResults));
      });
    }.bind(this));
  },

  collectAllResults: function(data, callback) {
    allResults = [];
    return this.search(data.who, data.where, data.timeout).then(function() {
      this.iterateOnPageResults(allResults, callback);
    }.bind(this));
  },

  get: function(data) {
    return this.collectAllResults(data, function(allResults) {

      // TODO inject function
      var i = 0;
      var copy = [];

      var json_ld_context = {
        "name": "http://omerxi.com/ontologies/core.owl.ttl#name",
        "address": "http://omerxi.com/ontologies/core.owl.ttl#address",
        "phones": "http://omerxi.com/ontologies/core.owl.ttl#phones",
        "timeout": "http://omerxi.com/ontologies/core.owl.ttl#timeout",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "vcard": "http://www.w3.org/2006/vcard/ns#",
        "oxi": "http://omerxi.com/ontologies/core.owl.ttl#"
      };

      allResults.map(function(result) {
        result['@id'] = "potential-match:" + (++i);
        result['@context'] = json_ld_context;
        copy.push(result);
      });
      allResults = copy;

      var fs = require("fs");
      fs.writeFile(data.output, JSON.stringify(allResults, null, 4), function(error) {
        if (!error) console.log("Collected " + allResults.length + " entries with success in " + data.output);
      });

    });
  },

  apply: function(data) {
    this.connectTo(data.url, data.timeout).then(function() {
      this.get(data).then(function() {
        this.driver.quit();
      }.bind(this))
    }.bind(this));
  }

};

module.exports = {
  getInstance: function(data) {
    return new PhoneSupplier(data);
  }
};
