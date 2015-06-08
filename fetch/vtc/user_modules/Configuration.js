Configuration = function(data) {
  var dataObject = (data === undefined) ? process.argv.slice(2) : data;
  this.data = JSON.parse(dataObject);
};

Configuration.prototype = {
  constructor: Configuration,
  get: function(name) {
    return this.data[name];
  }
};

module.exports = {
  getInstance: function(data) {
    return new Configuration(data);
  }

};
