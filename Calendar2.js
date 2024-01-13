const moment = require('moment');
const fs = require('fs'); //Importa la biblioteca fs (File System) tiene funciones para interactuar con el sistema de archivos.

class Calendar {
  constructor(calendarNumber) {  //constructor parametrizado, recibe un parametro que se utiliza para identificar el numero de calendario
    this.calendarNumber = calendarNumber;
    this.data = this.loadData();
  }

  //lee el archivo JSON del calendario correspondiente al numero de calendario utilizando fs.readFileSync 
  //y lo convierte a un objeto js usando JSON.parse.
  loadData() {
    const rawdata = fs.readFileSync(`./calendars/calendar.${this.calendarNumber}.json`);
    return JSON.parse(rawdata);
  }

  //toma una fecha y una duración como parámetros y devuelve los espacios disponibles
  getAvailableSpots(date, duration) {
    const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD'); //convierte la fecha proporcionada al formato ISO ('YYYY-MM-DD') 
    const durationBefore = this.data.durationBefore; //Obtiene la duración antes de las sesiones del objeto data cargado anteriormente
    const durationAfter = this.data.durationAfter; //Obtiene la duración después de las sesiones del objeto data

    let daySlots = []; //aca se van a guardar las ranuras (slots) disponibles para la fecha proporcionada
    for (const key in this.data.slots) { //itera sobre las ranuras disponibles en el objeto data.slots y asigna las ranuras correspondientes a la fecha dada al array daySlots
      if (key === date) {
        daySlots = this.data.slots[key];
      }
    }

    const realSpots = []; //aca se van a guardar los slots reales despues de procesar las posibles sesiones
    daySlots.forEach(daySlot => { //itera sobre las ranuras del día y comprueba si hay conflictos con las sesiones programadas
      if (this.data.sessions && this.data.sessions[date]) {
        let noConflicts = true;
        this.data.sessions[date].forEach(sessionSlot => { //itera sobre las sesiones programadas para la fecha dada y verifica si hay conflictos con las ranuras del día
            let sessionStart = moment(dateISO + ' ' + sessionSlot.start).valueOf() //calcula el momento de inicio de la sesion
            let sessionEnd = moment(dateISO + ' ' + sessionSlot.end).valueOf() //calcula el momento de fin de sesion
            let start = moment(dateISO + ' ' + daySlot.start).valueOf()
            let end = moment(dateISO + ' ' + daySlot.end).valueOf()
            //verifica diferentes escenarios de superposición entre las sesiones y las ranuras del día, 
            //actualizando el array realSpots y la variable noConflicts según sea necesario
            if (sessionStart > start && sessionEnd < end) {
                realSpots.push({ start: daySlot.start, end: sessionSlot.start})
                realSpots.push({ start: sessionSlot.end, end: daySlot.end})
                noConflicts = false
            } else if (sessionStart === start && sessionEnd < end) {
                realSpots.push({ start: sessionSlot.end, end: daySlot.end})
                noConflicts = false
            } else if (sessionStart > start && sessionEnd === end) {
                realSpots.push({ start: daySlot.start, end: sessionSlot.start})
                noConflicts = false
            } else if (sessionStart === start && sessionEnd === end) {
                noConflicts = false
            }
        });
        if (noConflicts) { //si no hay conflictos agraga las ranura del dia de hoy al array
          realSpots.push(daySlot);
        }
      } else {
        realSpots.push(daySlot);
      }
    });

    let arrSlot = []; //inicializa un array para almacenar los espacios disponibles despues de considerar las duraciones antes y después de las sesiones.
    realSpots.forEach(function (slot) { //itera sobre las ranuras reales y procesa las duraciones antes y despues de las sesiones para obtener los espacios disponibles.
        let init = 0;
		let startHour;
		let endHour;
		let clientStartHour;
		let clientEndHour;

		function getMomentHour(hour) {
		  let finalHourForAdd = moment(dateISO + ' ' + hour);
		  return finalHourForAdd;
		}
		function addMinutes(hour, minutes) {
		  let result = moment(hour).add(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function removeMinutes(hour, minutes) {
		  let result = moment(hour).subtract(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function getOneMiniSlot(startSlot, endSlot) {
		  let startHourFirst = getMomentHour(startSlot);
		  
			startHour = startHourFirst.format('HH:mm');;
			endHour = addMinutes(startHourFirst, durationBefore + duration + durationAfter);
			clientStartHour = addMinutes(startHourFirst, durationBefore);
			clientEndHour = addMinutes(startHourFirst, duration);

		  if (moment.utc(endHour, 'HH:mm').valueOf() > moment.utc(endSlot, 'HH:mm').valueOf()) {
			return null;
		  } 
		  const objSlot = {
			startHour: moment.utc(dateISO + ' ' + startHour)
			  .toDate(),
			endHour: moment.utc(dateISO + ' ' + endHour)
			  .toDate(),
			clientStartHour: moment.utc(dateISO + ' ' + clientStartHour)
			  .toDate(),
			clientEndHour: moment.utc(dateISO + ' ' + clientEndHour)
			  .toDate(),
		  };
		  init += 1;
		  return objSlot;
		}

		let start = slot.start;
		let resultSlot;
		do {
		  resultSlot = getOneMiniSlot(start, slot.end);
		  if (resultSlot) {
			arrSlot.push(resultSlot);
			start = moment.utc(resultSlot.endHour).format('HH:mm')
		  }
		} while (resultSlot);

		return arrSlot; //devuelve los espacios disponibles
    });

    return arrSlot;
  }
}

module.exports = Calendar; //exporta la clase Calendar para que pueda ser importada y utilizada en otros archivos
