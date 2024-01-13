const fs = require('fs');

class JsonReader {
  static read(filePath) {
    const rawdata = fs.readFileSync(filePath);
    return JSON.parse(rawdata);
  }
}

module.exports = JsonReader;