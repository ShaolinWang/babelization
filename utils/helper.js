exports.isFit = function (obj, type) {
  return Object.prototype.toString.call(obj).slice(8, -1) === type;
}
