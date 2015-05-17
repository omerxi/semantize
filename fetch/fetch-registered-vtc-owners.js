//#############################################################################
// TODO end condition -> driver.quit
// TODO retry on connection error
//#############################################################################
var util = require("util");
var mkdirp = require('mkdirp');
var colors = require('colors/safe');
var fs = require("fs");
var webdriver = require("selenium-webdriver");
var By = require("selenium-webdriver").By;
var until = require("selenium-webdriver").until;
//#############################################################################
var args = process.argv.slice(2);
//#############################################################################
// TODO default to "tmp/"
// TODO handle trailing slashes
var outputPath = '/media/usb0/registered-vtc-files/';
mkdirp(outputPath, function(err) {
  if (err) console.error(err);
  else console.log("will write files to " + outputPath);
});
//#############################################################################
var seedUrl = args[0];
console.log("####################################################################");
console.log(seedUrl);
//#############################################################################
var initialDate = new Date(args[1]);
var initialDateRange = {
  start: new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate()),
  end: new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate() + 10)
};
//#############################################################################
var leadingZeroForTwoDigitsNumber = function(x) {
  return Math.floor(x / 10) === 0 ? "0" + x : x;
};
//#############################################################################
Date.prototype.format = function() {
  return this.getFullYear() + '-' + leadingZeroForTwoDigitsNumber(this.getMonth() + 1) + '-' + leadingZeroForTwoDigitsNumber(this.getDate());
};
//#############################################################################
Date.prototype.toString = function() {
  return leadingZeroForTwoDigitsNumber(this.getDate()) + '/' + leadingZeroForTwoDigitsNumber(this.getMonth() + 1) + '/' + this.getFullYear();
};
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
var onResultsetHavingPagination = function(dateRange) {
  return function() {
    driver.findElement(By.xpath("//div[@class='navigatorLabel']/span")).getText()
      .then(function(data) {
        var matches = data.match("Lignes (.+) à (.+) sur (.+)");
        var start = parseInt(matches[1]);
        var end = parseInt(matches[2]);
        var total = parseInt(matches[3]);
        var pages = Math.ceil(total / 100);
        console.log(colors.blue(total + " records on " + pages + " page(s)"));
        console.log("####################################################################");
        getNextRow(1, 0, total, dateRange);
      });
  };
};
//#############################################################################
var onResultsetHavingNoPagination = function(dateRange) {
  return function(error) {
    if (error.name !== "NoSuchElementError") return console.log("unexpected error !");
    driver.findElement(webdriver.By.xpath("//div[@id='enrobe']/fieldset/legend/span")).getText()
      .then(function(data) {
        var start = 1;
        var end = parseInt(data);
        var total = end;
        var pages = 1;
        console.log(colors.blue(total + " records on " + pages + " page(s)"));
        console.log("####################################################################");
        getNextRow(1, 0, total, dateRange);
      });
  };
};
//#############################################################################
var onSearchHavingResult = function(dateRange) {
  driver.findElement(webdriver.By.xpath('//div[@class="navigator"]'))
    .then(onResultsetHavingPagination(dateRange), onResultsetHavingNoPagination(dateRange));
};
//#############################################################################
var onSearchHavingBetweenZeroAndOneResult = function(dateRange) {
  return function(error) {
    driver.getTitle().then(function(title) {
      if (title.indexOf("Fiche") > -1) {
        console.log("single result");
        getRecord(1, 0, 1, dateRange, afterGetRecord2);
      } else {
        console.log("no result");
        searchWithDateRange(getNextDateRange(dateRange));
      }
    });
  };
};
//#############################################################################
var searchWithDateRange = function(dateRange) {
  console.log("####################################################################");
  console.log(colors.blue(dateRange.start.format()) + " - " + colors.blue(dateRange.end.format()));
  driver.findElement(By.xpath('//select[@name="recherchePanel:wmcDateImmat:dateImatriculationChoix"]')).click();
  driver.findElement(By.xpath('//select[@name="recherchePanel:wmcDateImmat:dateImatriculationChoix"]/option[4]')).click();
  driver.wait(until.elementLocated(By.name('recherchePanel:wmcDateImmat:dateImatriculationFin')), 3000).then(function() {
    driver.findElement(By.name('recherchePanel:wmcDateImmat:dateImatriculationDebut')).then(function(element) {
      element.clear().then(function() {
        element.sendKeys(dateRange.start);
      });
    });
    driver.findElement(By.name('recherchePanel:wmcDateImmat:dateImatriculationFin')).then(function(element) {
      element.clear().then(function() {
        element.sendKeys(dateRange.end);
      });
    });
    driver.findElement(By.xpath('//input[@value="Rechercher"]')).click();
    driver.wait(until.titleContains("Résultats"), 3000).then(
      onSearchHavingResult(dateRange),
      onSearchHavingBetweenZeroAndOneResult(dateRange)
    );
  });
};
//#############################################################################
var getNextDateRange = function(dateRange) {
  return {
    start: new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate() + 1),
    end: new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate() + 10)
  };
};
//#############################################################################
var getRecord = function(i, offset, total, dateRange, callback) {
  driver.findElement(By.xpath("//div[@id='enrobe']/div[last()]")).then(function(element) {
    element.getInnerHtml().then(function(data) {
      element.findElement(By.xpath("./fieldset[1]/table[1]/tbody/tr[1]/td/div")).getText().then(function(id) {
        var file = {
          path: outputPath + id + ".html",
          content: "<html><head><meta charset='UTF-8'><title>" + id + "</title></head><body>" + data + "</body></html>"
        };
        util.print(colors.green("Successful fetch of " + (i + offset) + " on " + total + " | " + id));
        callback({
          i: i,
          offset: offset,
          total: total,
          dateRange: dateRange,
          file: file
        });
      });
    });
  });
};
//#############################################################################
// TODO rename this method
var afterGetRecord1 = function(data) {
  save(data.file);
  driver.navigate().back();
  driver.wait(until.titleContains("Résultats"), 3000).then(function() {
    getNextRow(data.i + 1, data.offset, data.total, data.dateRange);
  });
};
//#############################################################################
// TODO rename this method
var afterGetRecord2 = function(data) {
  save(data.file);
  driver.findElement(By.xpath("//div[@id='navigationP']/a[1]")).click();
  driver.wait(until.titleContains("Recherche"), 3000).then(function() {
    searchWithDateRange(getNextDateRange(data.dateRange));
  });
};
//#############################################################################
var onNextRow = function(i, offset, total, dateRange) {
  return function(element) {
    element.getAttribute("href").then(function(data) {
      driver.get(data).then(function() {
        driver.wait(until.titleContains("Fiche"), 3000).then(function() {
          getRecord(i, offset, total, dateRange, afterGetRecord1);
        });
      });
    });
  };
};
//#############################################################################
var onNoNextRow = function(i, offset, total, dateRange) {
  return function(error) {
    if (error.name !== "NoSuchElementError") return console.error(colors.red("unexpected error !"));
    driver.findElement(By.xpath("//div[@class='navigator']/*/a[@title='Go to next page']")).then(
      function(element) {
        element.click().then(function(value) {
          driver.wait(until.elementLocated(By.xpath("//table[@class='dataviewRecherche']")), 3000).then(function() {
            getNextRow(1, offset + i - 1, total, dateRange);
          });
        });
      },
      function(error) {
        if (error.name !== "NoSuchElementError") return console.log("unexpected error !");
        driver.findElement(By.xpath("//div[@id='navigationP']/a[1]")).click();
        driver.wait(until.titleContains("Recherche"), 3000).then(function() {
          searchWithDateRange(getNextDateRange(dateRange));
        });
      }
    );
  };
};
//#############################################################################
var getNextRow = function(i, offset, total, dateRange) {
  driver.findElement(By.xpath("//table[@class='dataviewRecherche']/tbody[last()]/tr[" + i + "]" + "/td[last()]/span/a")).
  then(onNextRow(i, offset, total, dateRange), onNoNextRow(i, offset, total, dateRange));
};
//#############################################################################
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
//#############################################################################
driver.get(seedUrl);
driver.wait(until.titleContains("Recherche"), 3000).then(
  function() {
    searchWithDateRange(initialDateRange);
  },
  function(error) {
    console.error(colors.red(error.message));
  });
//#############################################################################
