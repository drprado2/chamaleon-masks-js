import MaskAplicator from './MaskAplicator';
import Mask from './Mask';
import regexExpressions from './regex-expressions';
import {DEFAULT_OPTIONS, DEFAULT_MASK_CONFIG} from './defaultValues';

const MaskHandler = function(input, options=DEFAULT_OPTIONS){
  if(!input)
      throw new Error("Should be passed a valid input!")
  options = options instanceof Object ? {...DEFAULT_OPTIONS, ...options} : DEFAULT_OPTIONS;
  options.masks = options.masks.map(m => ({...DEFAULT_MASK_CONFIG, placeholder: m.mask.replace(regexExpressions.RANGES, ''), ...m}));
  this.maskAplicator = new MaskAplicator(input, options.reverseInput, options.submitWithMask);
  this.input = input;
  this.masks = [];
  options.masks.forEach(m => this.addMask(new Mask(m, options.reverseInput)));
  this.currentMask = this.masks[0];
  this.setPlaceholder();
  this.addListener();
  this.maskAplicator.applyValue(this, '');
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

export default MaskHandler;
