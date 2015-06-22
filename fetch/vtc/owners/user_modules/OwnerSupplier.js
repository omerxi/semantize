var colors = require("colors/safe");
var fs = require("fs");

Date.prototype.toString = function() {
  return this.getDate() + '/' + (this.getMonth() + 1) + '/' + this.getFullYear();
};

OwnerSupplier = function(driver) {
  this.driver = driver;
};

OwnerSupplier.log = function(message) {
  console.log(colors.yellow(message));
};

OwnerSupplier.prototype = {

  constructor: OwnerSupplier,

  getPageResults: function(callback) {
    var page = [];
    this.driver.waitFor({
      "xpath": "//table[@class='dataviewRecherche']",
      "timeout": this.data.timeout // TODO à revoir
    }).then(function(element) {
      this.driver.findAll({
        "xpath": "./tbody[2]/tr"
      }, element).then(function(elements) {
        elements.map(function(entry) {
          this.driver.findOne({
            "xpath": "./td[last()]/span/a"
          }, entry).then(function(element) {
            element.getAttribute("href").then(function(data) {
              this.driver.execute("window.open()");
              this.driver.getAllWindowHandles().then(function(handles) {
                var currentTab = handles[0];
                var popUpHandle = handles[1];
                this.driver.switchTo(popUpHandle);
                this.driver.get(data);
                this.driver.findOne({
                  'xpath': "//div[@id='enrobe']/div[last()]"
                }).then(function(element) {
                  element.getInnerHtml().then(function(data) {
                    this.driver.findOne({
                      'xpath': "./fieldset[1]/table[1]/tbody/tr[1]/td/div"
                    }, element).getText().then(function(id) {
                      process.stdout.write(id + ": ");
                      page.push(id);
                      var file = {
                        path: this.data.output + id + ".html",
                        content: "<html><head><meta charset='UTF-8'/><title>" + id + "</title></head><body>" + data + "</body></html>"
                      };
                      fs.writeFile(file.path, file.content, function(error) {
                        if (error) {
                          console.log(colors.red("failed"));
                          return this.driver.reject(new Error("could not write file to " + file.path));
                        } else console.log(colors.green("ok"));
                      }.bind(this));
                    }.bind(this));
                  }.bind(this));
                  //this.driver.sleep(250);
                  this.driver.execute("window.close()");
                  this.driver.switchTo(currentTab);
                }.bind(this));
              }.bind(this));
            }.bind(this))
          }.bind(this));
        }.bind(this))
      }.bind(this)).then(function() {
        callback(page);
      });
    }.bind(this), function(error) {
      callback(page);
    });
  },

  iterateOnPageResults: function(allResults, callback) {
    this.getPageResults(function(pageResults) {
      this.driver.findOne({
        "xpath": "//div[@class='navigator']/*/a[@title='Go to next page']"
      }).
      then(function(element) {
        console.log("next page");
        element.click().then(function() {
          this.iterateOnPageResults(allResults.concat(pageResults), callback);
        }.bind(this));
      }.bind(this), function() {
        callback(allResults.concat(pageResults));
      });
    }.bind(this));
  },

  dateRange: function(date, step) {
    return {
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + step - 1)
    };
  },

  search: function(data) {
    var dateRange = this.dateRange(data.from, data.step);
    OwnerSupplier.log("Searching from " + dateRange.start + " to " + dateRange.end);
    var flow = this.driver.newFlow();
    flow.execute(function() {
      this.driver.findOne({
        'xpath': '//select[@name="recherchePanel:wmcDateImmat:dateImatriculationChoix"]'
      }).then(function(element) {
        element.click();
        this.driver.findOne({
          'xpath': './option[4]'
        }, element).then(function(element) {
          element.click();
        });
      }.bind(this), function(error) {
        return this.driver.reject(error);
      }.bind(this));
    }.bind(this));
    flow.execute(function() {
      this.driver.findOne({
        'name': 'recherchePanel:wmcDateImmat:dateImatriculationDebut'
      }).then(function(element) {
        element.sendKeys(dateRange.start);
      }, function(error) {
        return this.driver.reject(error);
      }.bind(this));
    }.bind(this));
    flow.execute(function() {
      this.driver.findOne({
        'name': 'recherchePanel:wmcDateImmat:dateImatriculationFin'
      }).then(function(element) {
        element.sendKeys(dateRange.end);
      }, function(error) {
        return this.driver.reject(error);
      }.bind(this));
    }.bind(this));
    return flow.execute(function() {
      this.driver.findOne({
        'xpath': '//input[@value="Rechercher"]'
      }).then(function(element) {
        element.click();
      }, function(error) {
        return this.driver.reject(error);
      }.bind(this));
    }.bind(this));
  },

  collectAllResults: function(data, callback) {
    allResults = [];
    return this.search(data).then(function() {
      this.iterateOnPageResults(allResults, callback);
    }.bind(this), function(error) {
      return this.driver.reject(error);
    }.bind(this));
  },

  get: function(data) {
    return this.collectAllResults(data, function(allResults) {
      if (allResults.length > 0) OwnerSupplier.log("Collected " + allResults.length + " entries with success");
      else OwnerSupplier.log("No result for this search");
    }.bind(this));
  },

  connectTo: function(data) {
    this.driver.get(data.url);
    return this.driver.waitFor({
      'xpath': "//input[@value='Rechercher']",
      'timeout': data.timeout
    }).then(function(element) {}, function() {
      return this.driver.reject(new Error("could not connect to " + data.url));
    }.bind(this));
  },

  apply: function(data) {
    this.data = data; // TODO à revoir...
    OwnerSupplier.log(JSON.stringify(data, null, 2));
    var flow = this.driver.newFlow();
    flow.on('uncaughtException', function(message) {
      console.error(colors.red(message));
      this.driver.quit().then(function() {
        process.exit(1);
      });
    }.bind(this));
    flow.execute(function() {
      OwnerSupplier.log("Connecting to " + data.url);
      this.connectTo(data);
    }.bind(this));
    flow.execute(function() {
      OwnerSupplier.log("Connected to " + data.url);
      this.get(data);
    }.bind(this));
    flow.execute(function() {
      //this.driver.quit().then(function() {
        console.log(colors.green("Done !"));
        console.log(data.from);
        data.from = this.dateRange(data.from, data.step + 1).end;
        this.apply(data);
      //}.bind(this));
    }.bind(this));
  }
};

module.exports = {
  getInstance: function(data) {
    return new OwnerSupplier(data);
  }
};
