"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var GenericNumberMask = function GenericNumberMask(input, masks) {
  var _this = this;

  this.input = input;
  this.masks = [];
  this.regexInvalidChars = /[^0-9]/gm;
  masks.forEach(function (m) {
    return _this.addMask(m);
  });
  this.setPlaceholder();
  this.addListener();
};

GenericNumberMask.prototype.addMask = function (maskString) {
  var valueLength = maskString.replace(this.regexInvalidChars, "").length;
  var shouldBeTheFirst = this.masks.length == 0 || this.masks[0].valueLength > valueLength;

  if (shouldBeTheFirst) {
    this.masks.unshift({
      valueLength: valueLength,
      maskObj: this.createMaskObj(maskString),
      maskString: maskString
    });
    return;
  }

  var index = this.masks.findIndex(function (m) {
    return m.valueLength > valueLength;
  });
  index = index > -1 ? index : this.masks.length;
  this.masks = this.masks.slice(0, index).concat([{
    valueLength: valueLength,
    maskObj: this.createMaskObj(maskString),
    maskString: maskString
  }]).concat(this.masks.slice(index, this.masks.length));
};

GenericNumberMask.prototype.setPlaceholder = function () {
  this.input.placeholder = this.masks[0].maskString;
};

GenericNumberMask.prototype.createMaskObj = function (maskString) {
  var maskObj = {};
  var counter = 1;
  var tempString = maskString;

  while (tempString.length > 0) {
    var indexSeparator = tempString.search(this.regexInvalidChars);
    indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;
    maskObj["part" + counter] = {
      qtdDigits: tempString.substring(0, indexSeparator).length,
      separator: tempString[indexSeparator] || ""
    };
    tempString = tempString.substring(indexSeparator + 1);
    counter++;
  }

  return maskObj;
};

GenericNumberMask.prototype.addListener = function () {
  var _this2 = this;

  this.input.addEventListener('input', function (e) {
    return _this2.handleInputEvent(e);
  });
};

GenericNumberMask.prototype.handleInputEvent = function (event) {
  var newValue = event.target.value.replace(this.regexInvalidChars, "");
  var maskOfThisLength = this.masks.find(function (m) {
    return m.valueLength >= newValue.length;
  });
  maskOfThisLength = maskOfThisLength ? maskOfThisLength : this.masks[this.masks.length - 1];
  newValue = newValue.substring(0, maskOfThisLength.valueLength);
  var result = "";

  for (var maskPart in maskOfThisLength.maskObj) {
    var partLength = maskOfThisLength.maskObj[maskPart].qtdDigits;

    if (newValue.length > partLength) {
      result += newValue.substring(0, partLength) + maskOfThisLength.maskObj[maskPart].separator;
      newValue = newValue.substring(partLength);
    } else {
      result += newValue;
      break;
    }
  }

  event.target.value = result;
};

GenericNumberMask.init = function (input) {
  for (var _len = arguments.length, masks = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    masks[_key - 1] = arguments[_key];
  }

  masks = !masks || masks.length == 0 ? ["(00) 0000-0000"] : masks;
  new GenericNumberMask(input, masks);
};

var _default = GenericNumberMask;
exports.default = _default;