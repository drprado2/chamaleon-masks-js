import regexExpressions from './regex-expressions';
import {DEFAULT_MASK_CONFIG} from './defaultValues';

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

export default Mask;
