const CalendarDataLoader = require('./CalendarDataLoader');
const CalendarOperations = require('./CalendarOperations');

class Calendar {
  constructor(calendarNumber) {
    this.calendarDataLoader = new CalendarDataLoader(calendarNumber);
    this.calendarOperations = null;
  }

  loadData() {
    const calendarData = this.calendarDataLoader.load();
    this.calendarOperations = new CalendarOperations(calendarData);
  }

  getAvailableSpots(date, duration) {
    if (!this.calendarOperations) {
      this.loadData();
    }
    return this.calendarOperations.getAvailableSpots(date, duration);
  }
}

module.exports = Calendar;