const JsonReader = require('./JsonReader');

class CalendarDataLoader {
  constructor(calendarNumber) {
    this.calendarNumber = calendarNumber;
  }

  load() {
    const filePath = `./calendars/data/calendar.${this.calendarNumber}.json`;
    return JsonReader.read(filePath);
  }
}

module.exports = CalendarDataLoader;