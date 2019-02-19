// defaultValues.js

const DEFAULT_MASK_CONFIG={
    mask: "(99) 9999-9999", validationCallback: (inputValue) => true , isMoney: false, moneyCountryMask: 'R$'
}

const DEFAULT_OPTIONS={
  submitWithMask: true,
  reverseInput: false,
  masks: [DEFAULT_MASK_CONFIG]
}

// regex-expressions.js

const regexExpressions = {
  ONLY_DIFF_NUMBER : /[^0-9]/gm,
  START_VALUE_NOT_NUMBER : /^[^0-9]$/g,
  RANGE_PARTS: /([0-9\*]*\[\d*-\d*\])/g,
  RANGE_VALUE: /^[0-9]*(\[\d*-\d*\])/m,
  RANGES: /\[\d*-\d*\]/g,
  NOT_INFINIT_CHAR: /[^\*]/,
  INFINIT_CHAR: /[\*]/
}

// Mask.js

const Mask = function(maskConfig, reverseInput){
  let config = maskConfig instanceof Object
    ? {...DEFAULT_MASK_CONFIG, placeholder: maskConfig.mask.replace(regexExpressions.RANGES, ''), ...maskConfig}
    : DEFAULT_MASK_CONFIG;
  this.valueLength = config.mask.replace(regexExpressions.RANGES, '').replace(regexExpressions.ONLY_DIFF_NUMBER, "").length;
  this.separators = this.createArraySeparators(config, reverseInput);
  this.maskString = config.mask;
  this.validationCallback = config.validationCallback;
  this.isMoney = config.isMoney;
  this.moneyCountryMask = config.moneyCountryMask;
  this.placeholder = config.placeholder;
}
Mask.prototype.createArraySeparators = function(maskOptions, reverseInput){
  if(reverseInput){
      let rangeParts = maskOptions.mask.match(regexExpressions.RANGE_PARTS) || [];
      rangeParts.forEach(p => {
          let rangePart = regexExpressions.RANGE_VALUE.exec(p)[1];
          let temp = p.replace(rangePart, '');
          temp = rangePart.split("").reverse().join("") + temp;
          maskOptions.mask = maskOptions.mask.replace(p, temp);
      })
  }
  let maskString = reverseInput ? maskOptions.mask.split("").reverse().join("") : maskOptions.mask;
  let separators = [];
  let tempString = maskString;
  while(tempString.length > 0){
      const isInfinitPart = tempString[0] === "*";
      const rangePart = regexExpressions.RANGE_VALUE.exec(tempString);
      let rangeObj = {};
      if(isInfinitPart){
          let indexSeparator = tempString.search(regexExpressions.NOT_INFINIT_CHAR);
          indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;
          let separator = tempString.substring(indexSeparator, tempString.length) || "";
          let valuePart = tempString.substring(0, indexSeparator);
          separators.push({qtdDigits: valuePart.length, separator, isInfititPart: true});
          break;
      }
      if(rangePart){
          let range = rangePart[1];
          tempString = tempString.replace(range, '');
          rangeObj.start = parseInt(range.substring(1, range.indexOf('-')));
          rangeObj.end = parseInt(range.substring(range.indexOf('-') + 1, range.length - 1));
      }
      let indexSeparator = tempString.search(regexExpressions.ONLY_DIFF_NUMBER);
      indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;
      let nextValidChar = tempString.substring(indexSeparator).search(/\d/);
      let endIndexSeparator = nextValidChar < 0 ? tempString.length : indexSeparator + nextValidChar;
      let separator = tempString.substring(indexSeparator, endIndexSeparator) || "";
      if(separator.search(regexExpressions.INFINIT_CHAR) > -1){
          endIndexSeparator = indexSeparator + tempString.substring(indexSeparator).search(regexExpressions.INFINIT_CHAR);
          separator = tempString.substring(indexSeparator, endIndexSeparator);
      }
      let valuePart = tempString.substring(0, indexSeparator);
      separators.push({qtdDigits: valuePart.length, separator, isInfititPart: false, hasRange: !!rangePart, range: rangeObj});
      tempString = tempString.substring(endIndexSeparator);
  }
  return separators;
}

// MaskAplicator.js

const MaskAplicator = function(input, reverseInput, submitWithMask){
  this.originalInput = input;
  this.input = input;
  this.reverseInput = reverseInput;
  this.submitWithMask = submitWithMask;
  this.createCloneInput();
  this.literalInputValue = "";

}
MaskAplicator.prototype.applyMoneyMask = function(mask, value){
  if(!mask.isMoney)
      return value;

  const inputPureValue = value.replace(regexExpressions.ONLY_DIFF_NUMBER, '');
  const {moneyCountryMask} = mask;

  if(value && value[0].search(regexExpressions.ONLY_DIFF_NUMBER) > -1)
    value = value.substring(1);

  if(inputPureValue.length > 3 && value[0] === '0')
    value.value = value.substring(1);

  switch(inputPureValue.length){
      case(0):
          value = moneyCountryMask + ' 0,00';
          break;
      case(1):
          value = `${moneyCountryMask} 0,0${inputPureValue}`;
          break;
      case(2):
          value = `${moneyCountryMask} 0,${inputPureValue}`;
          break;
      default:
          value = `${moneyCountryMask} ${value}`;
  }
  return value;
}
MaskAplicator.prototype.cleanMoneyMask = function(mask, newValue){
  if(mask.isMoney){
      switch(this.literalInputValue.length){
          case(0):
              newValue = newValue.substring(3);
              break;
          case(1):
              newValue = newValue.substring(2);
              break;
          case(2):
              newValue = newValue[0] + newValue.substring(2);
              break;
          default:
              newValue = newValue;
      }
  }
  return newValue;
}
MaskAplicator.prototype.resolveValueRange = function(partValue, maskPart){
  if(!maskPart.hasRange)
      return partValue;
  let tempValue = parseInt(partValue.replace(regexExpressions.ONLY_DIFF_NUMBER, ''));
  let result = partValue;
  let isInInterval = tempValue >= maskPart.range.start && tempValue <= maskPart.range.end;
  if(!isInInterval)
      return tempValue.toString().substring(0,tempValue.toString().length - 1);

  return result;
}
MaskAplicator.prototype.applyValue = function(maskHandler, value, eventInputType){
  let newValue = this.cleanMoneyMask(maskHandler.currentMask, value.replace(regexExpressions.ONLY_DIFF_NUMBER, ""));
  maskHandler.updateCurrentMask(newValue);
  this.updateLiteralInputValue(newValue, eventInputType);
  let stringParts = this.getInputStringParts(maskHandler.currentMask, eventInputType, this.literalInputValue);
  newValue = this.reverseInput ? stringParts.reverse().join("") : stringParts.join("");
  this.removeExtraCharsLiteralInput(newValue);
  newValue = this.applyMoneyMask(maskHandler.currentMask, newValue);
  if(!this.submitWithMask)
      this.originalInput.value = newValue.replace(this.regexInvalidChars, '');
  this.input.value = newValue.replace(regexExpressions.START_VALUE_NOT_NUMBER, '');
}
MaskAplicator.prototype.getInputStringParts = function(mask, eventInputType, newValue) {
  let stringParts = [];
  let isPasteReverse = eventInputType === 'insertFromPaste' && this.reverseInput;
  let tempSeparators = [].concat(mask.separators);
  for(let maskPart of tempSeparators){
      if(newValue.length >= maskPart.qtdDigits){
          let part = null;
          if(isPasteReverse){
              part = maskPart.separator + newValue.substring(newValue.length - maskPart.qtdDigits);
              newValue = newValue.substring(0, newValue.length - maskPart.qtdDigits);
          }else{
              part = this.reverseInput
                  ? maskPart.separator + newValue.substring(0, maskPart.qtdDigits)
                  : newValue.substring(0, maskPart.qtdDigits) + maskPart.separator;
              newValue = newValue.substring(maskPart.qtdDigits);
          }
          part = this.resolveValueRange(part, maskPart);
          stringParts.push(part);
      }else{
          stringParts.push(newValue);
          break;
      }
      if(maskPart.isInfititPart)
          tempSeparators.push(tempSeparators[tempSeparators.length - 1]);
  }
  return stringParts;
}
MaskAplicator.prototype.updateLiteralInputValue = function(newValue, eventInputType){
  let isDeleteEvent = eventInputType === 'deleteContentBackward';
  let diffLength = newValue.length - this.literalInputValue.length;
  diffLength = isDeleteEvent && diffLength >= 0 ? -1 : diffLength;
  this.literalInputValue = diffLength < 0
      ? this.literalInputValue.substring(0, this.literalInputValue.length + diffLength)
      : this.literalInputValue + newValue.substring(this.literalInputValue.length);
}
MaskAplicator.prototype.removeExtraCharsLiteralInput = function(newValue){
  let diffLength = this.literalInputValue.length - newValue.replace(regexExpressions.ONLY_DIFF_NUMBER, '').length;
  this.literalInputValue = this.literalInputValue.substring(0, this.literalInputValue.length - diffLength);
}
MaskAplicator.prototype.createCloneInput = function(){
  if(this.submitWithMask)
      return;
  let cloneInput = document.createElement('input');
  cloneInput.type = 'text';
  cloneInput.classList = this.originalInput.classList;
  cloneInput.classList.add('chamaleon-input-clone')
  cloneInput.name = `${this.originalInput.name}-clone`;
  cloneInput.placeholder = this.originalInput.placeholder;
  this.originalInput.type = 'hidden';
  this.originalInput.parentElement.insertBefore(cloneInput, this.originalInput.nextSibling);
  this.input = cloneInput;
}

// MaskHandler.js

const MaskHandler = function(input, options=DEFAULT_OPTIONS){
  if(!input)
      throw new Error("Should be passed a valid input!")
  let currentValue = input.value;
  options = options instanceof Object ? {...DEFAULT_OPTIONS, ...options} : DEFAULT_OPTIONS;
  options.masks = options.masks.map(m => ({...DEFAULT_MASK_CONFIG, placeholder: m.mask.replace(regexExpressions.RANGES, ''), ...m}));
  this.maskAplicator = new MaskAplicator(input, options.reverseInput, options.submitWithMask);
  this.input = input;
  this.masks = [];
  options.masks.forEach(m => this.addMask(new Mask(m, options.reverseInput)));
  this.currentMask = this.masks[0];
  this.setPlaceholder();
  this.addListener();
  this.maskAplicator.applyValue(this, currentValue);
}
MaskHandler.prototype.addMask = function(mask){
  let shouldBeTheFirst = this.masks.length === 0 || this.masks[0].valueLength > mask.valueLength;
  if(shouldBeTheFirst){
      this.masks.unshift(mask);
      return;
  }
  let index = this.masks.findIndex(m => m.valueLength > mask.valueLength);
  index = index > -1 ? index : this.masks.length
  this.masks = this.masks.slice(0, index)
      .concat([mask])
      .concat(this.masks.slice(index, this.masks.length));
}
MaskHandler.prototype.setPlaceholder = function(){
  this.input.placeholder = this.currentMask.placeholder;
}
MaskHandler.prototype.addListener = function(){
  this.input.addEventListener('input', e => this.handleInputEvent(e));
  this.input.addEventListener('change', e => this.currentMask.validationCallback(e.target.value));
}
MaskHandler.prototype.handleInputEvent = function(event){
  this.maskAplicator.applyValue(this, event.target.value, event.inputType);
};
MaskHandler.prototype.updateCurrentMask = function(inputValue){
  let maskOfThisLength = this.masks.find(m => m.valueLength >= inputValue.length);
  maskOfThisLength = maskOfThisLength ? maskOfThisLength : this.masks[this.masks.length - 1];
  this.currentMask = maskOfThisLength;
}

// Chameleon.js

const Chameleon = {
  initOptions : function(input, options=DEFAULT_OPTIONS){
    if(Object.getPrototypeOf(input) == String.prototype){
      Array.prototype.forEach.call(document.querySelectorAll(input), x => new MaskHandler(x, options));
    }else{
      new MaskHandler(input, options);
    }
  },
  init: function(input, ...masks){
    let options = {...DEFAULT_OPTIONS};
    options.masks = masks.map(m => ({...DEFAULT_MASK_CONFIG, mask: m}));
    if(Object.getPrototypeOf(input) == String.prototype){
      Array.prototype.forEach.call(document.querySelectorAll(input), x => new MaskHandler(x, options));
    }else{
      new MaskHandler(input, options);
    }
  }
};
