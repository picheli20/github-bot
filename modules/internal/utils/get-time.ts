function checkTime(i: number) {
  if (i < 10) {
    return `0${i}`;
  }
  return `${i}`;
}

export default () => {
  var today = new Date();
  var h = today.getHours();
  var m: string | number = today.getMinutes();
  var s: string | number = today.getSeconds();
  // add a zero in front of numbers<10
  m = checkTime(m);
  s = checkTime(s);
  return h + ":" + m + ":" + s;
}
