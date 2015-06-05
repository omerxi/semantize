//#############################################################################
var mkdirp = require('mkdirp');
var colors = require('colors/safe');
var fs = require("fs");

//#############################################################################
var webdriver = require("selenium-webdriver");
var promise = require("selenium-webdriver").promise;
var chrome = require('selenium-webdriver/chrome');
var By = require("selenium-webdriver").By;
var until = require("selenium-webdriver").until;
//#############################################################################

var xpath = require('xpath');
var DOMParser = require('xmldom').DOMParser;
//#############################################################################
var args = process.argv.slice(2);
//#############################################################################
var inputPath = args[0];
//#############################################################################
var seedUrl = args[1];
//#############################################################################
var outputPath = args[2];
mkdirp(outputPath, function(err) {
  if (err) console.error(err);
  else console.log("will write files to " + outputPath);
});
//#############################################################################
var save = function(file) {
  fs.exists(file.path, function(exists) {
    fs.writeFile(file.path, file.content, function(error) {
      if (error) console.error(colors.red("\n" + "Write error on : " + file.path + "\n" + error.message + "\n" + "content:\n" + file.content));
      else {
        console.log(colors.green(" -> " + file.path));
        if (exists) console.warn(colors.yellow(file.path + " already existed !" + "\n"));
      }
    });
  });
};
//#############################################################################
var parseHtmlFile = function(html) {
  var json = {};
  var doc = new DOMParser({
    locator: {},
    errorHandler: {
      warning: function(w) {
        console.warn(w);
        console.log(colors.red(html));
      }
    }
  }).parseFromString(html);
  var nodes = xpath.select("//b[text()='Représentant principal']/following-sibling::div", doc);
  if (nodes.length === 0) {
    var prenom = xpath.select("//td[text()='Nom']/following-sibling::td/div", doc)[0].firstChild.data;
    var nom = xpath.select("//td[text()='Prénom']/following-sibling::td/div", doc)[0].firstChild.data;
    json.name = prenom + " " + nom;
  } else {
    json.name = nodes[0].firstChild.data.match("(.+), .+")[1];
  }
  var nodes2 = xpath.select("//td[text()='Code Postal']/following-sibling::td/div", doc);
  json.postalCode = nodes2[0].firstChild.data;
  var nodes3 = xpath.select("//td[text()='Ville']/following-sibling::td/div", doc);
  json.city = nodes3[0].firstChild.data;
  var nodes4 = xpath.select("//title", doc);
  json.id = nodes4[0].firstChild.data;
  json["@context"] = "http://omerxi.com/ontologies/context_phone.jsonld";
  json["@id"] = "potential-vtc-driver-match/" + json.id;
  return json;
};
//#############################################################################
var collectResult = function(item, acc) {
  return function() {
    var entry = {};
    item.findElement(By.xpath("./div/h2/a")).then(function(data) {
      data.getText().then(function(data) {
        entry.name = data.replace(" + détails", "");
      });
    }).then(function(value) {
      item.findElement(By.xpath("./descendant::p[@class='itemAdresse']")).then(function(data) {
        data.getText().then(function(data) {
          entry.address = data;
        });
      });
    }).then(function(value) {
      // TODO fax, mobile, fixed
      item.findElements(By.xpath("./descendant::ul[contains(@class, 'blocPhoneNumber')]/li/strong")).then(function(data) {
        entry.phones = [];
        data.map(function(item) {
          item.getText().then(function(data) {
            entry.phones.push(data);
          });
        });
      });
    }).then(function(value) {
      acc.push(entry);
      console.log(entry);
    });
    return promise.delayed(100);
  };
};
//#############################################################################
var processPage = function(vtc, acc, callback) {
  driver.findElements(By.xpath("//a[text()='Afficher le n°']")).then(function(elements) {
    var lastTask = null;
    var flow = promise.controlFlow();
    elements.map(function(item) {
      lastTask = flow.execute(function() {
        item.click();
      });
    });
    var f = function(acc) {
      var flow = promise.controlFlow();
      var task = null;
      driver.findElements(By.xpath("//*[@id='contentMain']/*/ol/li")).then(function(elements) {
        elements.map(function(item) {
          task = flow.execute(collectResult(item, acc));
        });
        task.then(function() {
          //console.log("page processed");
          callback(acc);
        });
      });
    };
    lastTask.then(f(acc));
  });
};
//#############################################################################
var readFile = function(i, file, callback) {
  fs.readFile(file, "utf8", function(err, content) {
    callback(i, content);
  });
};
//#############################################################################
var iterateOnVtcFiles = function(callback) {
  fs.readdir(inputPath, function function_name(err, files) {
    files.length = 100;
    console.log("building context...");
    var vtcs = [];
    var total = files.length;
    for (var i = 0, n = files.length; i < n; ++i) {
      var file = files[i];
      readFile(i, inputPath + file, function(i, content) {
        process.stdout.write("parsing : " + i + " on " + total + "\r");
        vtcs.push(parseHtmlFile(content));
        if (i + 1 === total) {
          console.log("parsing : " + n + " on " + total);
          callback(vtcs);
        }
      });
    }
  });
};
//#############################################################################
var search = function(vtc, callback) {

  console.log(vtc);
  driver.wait(until.elementLocated(By.name("nom")), 3000);

  driver.findElement(By.name("nom")).then(function(element) {
    element.clear();
    element.sendKeys(vtc.name);
  });

  driver.findElement(By.name("ou")).then(function(element) {
    element.clear();
    element.sendKeys(vtc.postalCode + " " + vtc.city);
  });

  driver.findElement(By.xpath("//button[contains(@title,'Trouver')]")).click();

  var processPageRecursive = function(acc) {

    //console.log(acc.length);

    driver.wait(until.elementLocated(By.xpath("//a[text()='Afficher le n°']")), 5000).then(
      function() {
        processPage(vtc, acc, function(acc) {
          driver.findElement(By.xpath("//span[text()='Page suivante']/parent::a")).then(function(element) {
            element.click();
            processPageRecursive(acc);
          }, function(error) {
            if (error.name !== "NoSuchElementError") return console.log("unexpected error !");
            var data = {
              results: acc
            };
            var file = {
              path: outputPath + vtc.id + ".json",
              content: "[" + JSON.stringify(data, null, 4) + "]"
            };
            save(file);
            callback(acc);
          });
        });
      },
      function(error) {
        var data = {
          results: []
        };
        var file = {
          path: outputPath + vtc.id + ".json",
          content: "[" + JSON.stringify(data, null, 4) + "]"
        };
        save(file);
        callback();
      }
    );
  };
  processPageRecursive([]);
};
//#############################################################################
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': ['--start-maximized']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
driver.get(seedUrl);
driver.findElement(By.id('popinRetourVintage')).then(function(element) {
  driver.wait(until.elementLocated(By.xpath('//*[@id="popinRetourVintage"]/div[2]/div/a[@title="Fermer"]')), 5000).then(function(element) {
    console.log("aborting on beta version site");
    driver.quit();
  });
}, function(error) {
  iterateOnVtcFiles(function(vtcs) {
    /*
    vtcs = [{
      name: 'Bénichou',
      postalCode: '',
      city: 'Paris',
      id: 'EVTC444444444',
      '@context': 'http://omerxi.com/ontologies/context_phone.jsonld',
      '@id': 'potential-vtc-driver-match/EVTC006100043'
    }];
    */
    var searchAll = function() {
      if (vtcs.length === 0) {
        console.log("All done !");
        driver.quit();
      } else {
        var vtc = vtcs.pop();
        console.log(vtc);
        search(vtc, searchAll);
      }
    };
    searchAll();
  });
});
//#############################################################################
