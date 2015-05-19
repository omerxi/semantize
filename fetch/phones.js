// TODO new site and old site navigation
//#############################################################################
var colors = require('colors/safe');
var fs = require("fs");
var webdriver = require("selenium-webdriver");
var promise = require("selenium-webdriver").promise;
var chrome = require('selenium-webdriver/chrome');
var By = require("selenium-webdriver").By;
var until = require("selenium-webdriver").until;
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
//#############################################################################
var args = process.argv.slice(2);
//#############################################################################
var inputPath = args[0];
//#############################################################################
var seedUrl = args[1];
console.log(colors.blue(seedUrl));
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

  console.log(html);

  var doc = new dom().parseFromString(html);

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
            path: "/tmp/" + vtc.id + ".json",
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
var readFile = function(fileName, callback) {
  fs.readFile(inputPath + fileName, "utf8", function(err, content) {
    var vtc = parseHtmlFile(content);
    console.log(colors.yellow(JSON.stringify(vtc, null, 2)));
    callback(vtc);
  });
};
//#############################################################################
var iterateOnVtcFiles = function() {
  fs.readdir(inputPath, function function_name(err, files) {
    for (var i = 0, n = files.length; i < n; ++i) {
      readFile(files[i], search);
      break;
    }
  });
};
//#############################################################################
var search = function(vtc) {
  console.log(vtc);
  driver.wait(until.elementLocated(By.name("nom")), 3000);
  driver.findElement(By.name("nom")).then(function(element) {
    element.sendKeys(vtc.name);
    //element.sendKeys("Bénichou");
  });
  driver.findElement(By.name("ou")).then(function(element) {
    element.sendKeys(vtc.postalCode + " " + vtc.city);
    //element.sendKeys("75015" + " " + "Paris");
  });
  driver.findElement(By.xpath("//button[contains(@title,'Trouver')]")).click();
  driver.wait(until.elementLocated(By.xpath("//a[text()='Afficher le n°']")), 10000);
  processPage(vtc, function() {
    console.log("one page done !");
    driver.findElement(By.xpath("//span[text()='Page suivante']/parent::a")).then(function(element) {
      console.log("at least one more page");
    }, function(error) {
      if (error.name !== "NoSuchElementError") return console.log("unexpected error !");
      console.log("no more pages");
    });
  });
};
//#############################################################################
/*
var service = new chrome.ServiceBuilder(__dirname + '/node_modules/.bin/chromedriver').build();
var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': [
    '--proxy-server="localhost:8118"',
    '--start-maximized',
    //'--proxy-server="socks5://localhost:8118"',
    //'--host-resolver-rules="MAP * 0.0.0.0 , EXCLUDE localhost"'
  ]
};
*/
//chromeCapabilities.set('chromeOptions', chromeOptions);
//var driver = new chrome.createDriver(webdriver.Capabilities.chrome(), service);
//var driver = new chrome.createDriver(chromeCapabilities, service);
//var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();



var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': [
    '--start-maximized',
  ]
};
chromeCapabilities.set('chromeOptions', chromeOptions);

var driver = new webdriver.Builder()
  //.withCapabilities(webdriver.Capabilities.chrome())
  .withCapabilities(chromeCapabilities)
  /*
  .setProxy(proxy.manual({
    http: 'localhost:8118',
    https: 'localhost:8118'
  }))
  */
  .build();


driver.get(seedUrl);
//driver.get("https://check.torproject.org/");
//driver.wait(until.elementLocated(By.xpath('//*[@id="popinRetourVintage"]/div[2]/div/a[@title="Fermer"]')), 3000);

driver.findElement(By.id('popinRetourVintage')).then(function(element) {
  driver.wait(until.elementLocated(By.xpath('//*[@id="popinRetourVintage"]/div[2]/div/a[@title="Fermer"]')), 3000).then(function(element) {
    console.log("aborting on beta version site");
  });
}, function(error) {
  iterateOnVtcFiles();
});
