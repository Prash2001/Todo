module.exports.getLocaleDate = getLocaleDate;
function getLocaleDate(){
  let currentDay = new Date().toLocaleString("en-us", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return currentDay;
};
module.exports.getDay = getDay;
function getDay(){
  let currentDay = new Date().toLocaleString("en-us", {
    weekday: "long"
  });
  return currentDay;
};