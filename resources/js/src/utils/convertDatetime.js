import moment from "moment/moment";

const convertFromTimestamp = (timestamp) => {
  const converted = moment(timestamp.toDate()).format(
    "MMMM Do YYYY, h:mm:ss a"
  );
  return converted;
};

const getDDMMYY = (date) => {
  const formattedDate = moment(date).format("DDMMYY");
  return formattedDate;
};

const reverseDDMMYY = (date) => {
  const formattedDate = moment(date, "DDMMYY").toDate();
  return formattedDate;
};

const substractHHMMToHour = (time1, time2) => {
  const duration = moment.duration(
    moment(time2, "HH:mm").diff(moment(time1, "HH:mm"))
  );

  const hours = duration.hours();

  return hours;
};

const formatDateToWords = (date) => {
  const dateObj = moment(date, "DDMMYY").toDate();
  const formattedDate = moment(dateObj).format("dddd, MMMM Do YYYY");
  return formattedDate;
};

const plusDay = (date, quanty) => {
  const momentDate = moment(date, "DDMMYY");
  const addedDate = momentDate.clone().add(quanty, "days");
  return getDDMMYY(addedDate);
};

const isPastDate = (dateString) => {
  const date = moment(dateString, "DDMMYY");
  const today = moment().startOf("day");
  return date.isBefore(today);
};

const isLaterHour = (hour1, hour2) => {
  const time1 = moment(hour1, "HH:mm");
  const time2 = moment(hour2, "HH:mm");
  return time2.isAfter(time1);
};

const checkBetweenTwoHours = (timeFirst, timeQuantity, timeSecond, endTime) => {
  const currentTime = moment(timeFirst, "HH:mm");
  let futureTime = null;
  if (endTime) {
    futureTime = moment(endTime, "HH:mm");
  } else {
    futureTime = currentTime.clone().add(timeQuantity, "hours");
  }
  const timeToCheck = moment(timeSecond, "HH:mm");

  if (endTime) {
    if (timeToCheck.isBetween(currentTime, futureTime)) {
      return true;
    } else {
      return false;
    }
  }

  if (timeQuantity > 0) {
    if (timeToCheck.isBetween(currentTime, futureTime)) {
      return true;
    } else {
      return false;
    }
  } else {
    if (timeToCheck.isBetween(futureTime, currentTime)) {
      return true;
    } else {
      return false;
    }
  }
};

/** Trips: [{
 *  id: 1,
 *  date: "dd/MM/yyyy",
 *  arrivalTime: "hh:mm",
 *  ...
 * }] */

const sortTripsAscending = (trips) => {
  const sortedTrips = [...trips];
  return sortedTrips.sort((a, b) => {
    const dateA = moment(a.date, "DD/MM/YYYY");
    const dateB = moment(b.date, "DD/MM/YYYY");
    if (dateA.isBefore(dateB)) {
      return -1;
    }
    if (dateA.isAfter(dateB)) {
      return 1;
    }

    const timeA = moment(a.arrivalTime, "HH:mm");
    const timeB = moment(b.arrivalTime, "HH:mm");
    if (timeA.isBefore(timeB)) {
      return -1;
    }
    if (timeA.isAfter(timeB)) {
      return 1;
    }

    return 0;
  });
};

const sortTripsDescending = (trips) => {
  const sortedTrips = [...trips];
  return sortedTrips.sort((a, b) => {
    const dateA = moment(a.date, "DD/MM/YYYY");
    const dateB = moment(b.date, "DD/MM/YYYY");
    if (dateB.isBefore(dateA)) {
      return -1;
    }
    if (dateB.isAfter(dateA)) {
      return 1;
    }

    const timeA = moment(a.arrivalTime, "HH:mm");
    const timeB = moment(b.arrivalTime, "HH:mm");
    if (timeB.isBefore(timeA)) {
      return -1;
    }
    if (timeB.isAfter(timeA)) {
      return 1;
    }

    return 0;
  });
};

export {
  convertFromTimestamp,
  getDDMMYY,
  reverseDDMMYY,
  substractHHMMToHour,
  formatDateToWords,
  plusDay,
  isPastDate,
  isLaterHour,
  checkBetweenTwoHours,
  sortTripsAscending,
  sortTripsDescending,
};
