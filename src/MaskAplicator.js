import regexExpressions from './regex-expressions';

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

export default MaskAplicator;
