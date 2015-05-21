//#############################################################################
// TODO handle results on several pages
// TODO new site and old site navigation
//#############################################################################
var mkdirp = require('mkdirp');
var colors = require('colors/safe');
var fs = require("fs");
var webdriver = require("selenium-webdriver");
var promise = require("selenium-webdriver").promise;
var chrome = require('selenium-webdriver/chrome');
var By = require("selenium-webdriver").By;
var until = require("selenium-webdriver").until;
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
    fs.appendFile(file.path, file.content, function(error) {
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
  return json;
};
//#############################################################################
var collectResult = function(item, acc) {
  return function() {
    var entry = {};
    item.findElement(By.xpath("./span[@class = 'number']")).then(function(data) {
      data.getText().then(function(data) {
        entry.ordinal = data;
      });
    }).then(function(value) {
      item.findElement(By.xpath("./div/h2/a")).then(function(data) {
        data.getText().then(function(data) {
          entry.name = data.replace(" + détails", "");
        });
      });
    }).then(function(value) {
      item.findElement(By.xpath("./descendant::p[@class='itemAdresse']")).then(function(data) {
        data.getText().then(function(data) {
          entry.address = data;
        });
      });
    }).then(function(value) {
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
    return promise.delayed(250);
  };
};
//#############################################################################
var processPage = function(vtc, callback) {
  driver.findElements(By.xpath("//a[text()='Afficher le n°']")).then(function(elements) {
    var lastTask = null;
    var flow = promise.controlFlow();
    elements.map(function(item) {
      lastTask = flow.execute(function() {
        item.click();
      });
    });
    var f = function() {
      var flow = promise.controlFlow();
      var task = null;
      driver.findElements(By.xpath("//*[@id='contentMain']/*/ol/li")).then(function(elements) {
        var acc = [];
        elements.map(function(item) {
          task = flow.execute(collectResult(item, acc));
        });
        task.then(function() {
          var data = "";
          acc.map(function(entry) {
            if (data !== "") data += ",\n";
            entry["@context"] = "http://omerxi.com/ontologies/context_phone.jsonld";
            data += JSON.stringify(entry, null, 2);
          });
          var file = {
            path: outputPath + vtc.id + ".json",
            content: "[" + data + "]"
          };
          save(file);
          callback(acc);
        });
      });
    };
    lastTask.then(f(elements));
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
    var vtcs = [];
    for (var i = 0, n = 5 /*files.length*/ ; i < n; ++i) {
      readFile(i, inputPath + files[i], function(i, content) {
        console.log(i);
        console.log(files[i]);
        vtcs.push(parseHtmlFile(content));
        if (i + 1 === n) callback(vtcs);
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

  var processPageRecursive = function() {
    driver.wait(until.elementLocated(By.xpath("//a[text()='Afficher le n°']")), 5000).then(
      function() {
        processPage(vtc, function() {
          console.log("one page done !");
          driver.findElement(By.xpath("//span[text()='Page suivante']/parent::a")).then(function(element) {
            console.log("at least one more page");
            element.click();
            processPageRecursive();
          }, function(error) {
            if (error.name !== "NoSuchElementError") return console.log("unexpected error !");
            console.log("no more pages");
            callback();
          });
        });
      },
      function(error) {
        console.log(colors.red("no results"));
        callback();
      }
    );
  };
  processPageRecursive();
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
  driver.wait(until.elementLocated(By.xpath('//*[@id="popinRetourVintage"]/div[2]/div/a[@title="Fermer"]')), 3000).then(function(element) {
    console.log("aborting on beta version site");
  });
}, function(error) {

  iterateOnVtcFiles(function(vtcs) {
    console.log(vtcs.length);
    var searchAll = function() {
      var vtc = vtcs.pop();
      search(vtc, searchAll);
    };
    searchAll();
  });

});
//#############################################################################
