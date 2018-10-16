const GenericNumberMask = function(input, masks){
    this.input = input;
    this.masks = [];
    this.regexInvalidChars = /[^0-9]/gm;
    masks.forEach(m => this.addMask(m));
    this.setPlaceholder();
    this.addListener();
}
GenericNumberMask.prototype.addMask = function(maskString){
    let valueLength = maskString.replace(this.regexInvalidChars, "").length;
    let shouldBeTheFirst = this.masks.length == 0 || this.masks[0].valueLength > valueLength;
    if(shouldBeTheFirst){
        this.masks.unshift({valueLength, maskObj: this.createMaskObj(maskString), maskString});
        return;
    }
    let index = this.masks.findIndex(m => m.valueLength > valueLength);
    index = index > -1 ? index : this.masks.length
    this.masks = this.masks.slice(0, index)
        .concat([{valueLength, maskObj: this.createMaskObj(maskString), maskString}])
        .concat(this.masks.slice(index, this.masks.length));
}
GenericNumberMask.prototype.setPlaceholder = function(){
    this.input.placeholder = this.masks[0].maskString;
}
GenericNumberMask.prototype.createMaskObj = function(maskString){
    let maskObj = {};
    let counter = 1;
    let tempString = maskString;
    while(tempString.length > 0){
        let indexSeparator = tempString.search(this.regexInvalidChars);
        indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;	
        maskObj["part" + counter] = {qtdDigits: tempString.substring(0, indexSeparator).length, separator: tempString[indexSeparator] || ""};
        tempString = tempString.substring(indexSeparator + 1);
        counter++;
    }	
    return maskObj;
}
GenericNumberMask.prototype.addListener = function(){
    this.input.addEventListener('input', e => this.handleInputEvent(e));
}
GenericNumberMask.prototype.handleInputEvent = function(event){
    let newValue = event.target.value.replace(this.regexInvalidChars, "");
    let maskOfThisLength = this.masks.find(m => m.valueLength >= newValue.length);
    maskOfThisLength = maskOfThisLength ? maskOfThisLength : this.masks[this.masks.length - 1];
    newValue = newValue.substring(0, maskOfThisLength.valueLength);
    let result = "";
    for(let maskPart in maskOfThisLength.maskObj){
        let partLength = maskOfThisLength.maskObj[maskPart].qtdDigits;
        if(newValue.length > partLength){
            result += newValue.substring(0, partLength) + maskOfThisLength.maskObj[maskPart].separator;
            newValue = newValue.substring(partLength);
        }else{
            result += newValue;
            break;
        }
    }
    event.target.value = result;
};
GenericNumberMask.init = function(input, ...masks){
    masks = !masks || masks.length == 0 ? ["(00) 0000-0000"] : masks;
    new GenericNumberMask(input, masks);
}

export default GenericNumberMask;