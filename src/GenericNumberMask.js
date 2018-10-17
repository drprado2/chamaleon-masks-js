const DEFAULT_MASK_CONFIG={
    mask: "(99) 9999-9999", validationCallback: (inputValue) => true , isMoney: true, moneyCountry: 'BR'
}
const DEFAULT_OPTIONS={
    showPlaceholder: true,
    submitWithMask: true,
    reverseInput: false,
    masks: [DEFAULT_MASK_CONFIG]
}
const MONEY_COUNTRY_MASKS={
    'BR': "R$"
}

const GenericNumberMask = function(input, options=DEFAULT_OPTIONS){
    options = options instanceof Object ? {...DEFAULT_OPTIONS, ...options} : DEFAULT_OPTIONS;
    options.masks = options.masks.map(m => ({...DEFAULT_MASK_CONFIG, ...m}));
    this.originalInput = input;
    this.input = input;
    this.reverseInput = options.reverseInput;
    this.submitWithMask = options.submitWithMask;
    this.createCloneInput();
    this.masks = [];
    this.currentMask = null;
    this.literalInputValue = "";
    this.showPlaceholder = options.showPlaceholder;
    this.regexInvalidChars = /[^0-9]/gm;
    options.masks.forEach(m => this.addMask(m));
    this.changeCurrentMask(this.masks[0]);
    this.addListener();
}
GenericNumberMask.prototype.createCloneInput = function(){
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
GenericNumberMask.prototype.addMask = function(maskOptions){
    let valueLength = maskOptions.mask.replace(this.regexInvalidChars, "").length;
    let shouldBeTheFirst = this.masks.length == 0 || this.masks[0].valueLength > valueLength;
    if(shouldBeTheFirst){
        this.masks.unshift(this.createMaskObj(maskOptions));
        return;
    }
    let index = this.masks.findIndex(m => m.valueLength > valueLength);
    index = index > -1 ? index : this.masks.length
    this.masks = this.masks.slice(0, index)
        .concat([this.createMaskObj(maskOptions)])
        .concat(this.masks.slice(index, this.masks.length));
}
GenericNumberMask.prototype.createMaskObj = function(maskOptions){
    return {
        valueLength: maskOptions.mask.replace(this.regexInvalidChars, "").length,
        separators: this.createArraySeparators(maskOptions), 
        maskString: maskOptions.mask,
        submitWithoutMask: maskOptions.submitWithoutMask,
        validationCallback: maskOptions.validationCallback,
        isMoney: maskOptions.isMoney, 
        moneyCountry: maskOptions.moneyCountry
    };
}
GenericNumberMask.prototype.setPlaceholder = function(){
    if(this.showPlaceholder)
        this.input.placeholder = this.currentMask.maskString;
}
GenericNumberMask.prototype.createArraySeparators = function(maskOptions){
    let maskString = this.reverseInput ? maskOptions.mask.split("").reverse().join("") : maskOptions.mask;
    let separators = [];
    let tempString = maskString;
    while(tempString.length > 0){
        if(tempString[0] === "*"){
            let indexSeparator = tempString.search(/[^\*]/);
            indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;	
            let separator = tempString.substring(indexSeparator, tempString.length) || "";
            let valuePart = tempString.substring(0, indexSeparator);
            separators.push({qtdDigits: valuePart.length, separator, isInfitityPart: true});
            break;
        }
        let indexSeparator = tempString.search(this.regexInvalidChars);
        indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;	
        let nextValidChar = tempString.substring(indexSeparator).search(/[0-9]/);
        let endIndexSeparator = nextValidChar < 0 ? tempString.length - 1 : indexSeparator + nextValidChar;
        let separator = tempString.substring(indexSeparator, endIndexSeparator) || "";
        if(separator.search(/\*/) > -1){
            endIndexSeparator = indexSeparator + tempString.substring(indexSeparator).search(/\*/);
            separator = tempString.substring(indexSeparator, endIndexSeparator);
        }
        let valuePart = tempString.substring(0, indexSeparator);
        separators.push({qtdDigits: valuePart.length, separator, isInfitityPart: false});
        tempString = tempString.substring(endIndexSeparator);
    }	
    return separators;
}
GenericNumberMask.prototype.changeCurrentMask = function(newMask){
    this.currentMask = newMask;
    this.setPlaceholder();
}
GenericNumberMask.prototype.addListener = function(){
    this.input.addEventListener('input', e => this.handleInputEvent(e));
    this.input.addEventListener('change', e => this.currentMask.validationCallback(e.target.value));
}
GenericNumberMask.prototype.handleInputEvent = function(event){
    let newValue = event.target.value.replace(this.regexInvalidChars, "");
    this.setCurrentMask(newValue);
    this.updateLiteralInputValue(newValue, event.inputType === 'deleteContentBackward');
    let stringParts = this.getInputStringParts(event, this.literalInputValue);
    event.target.value = this.reverseInput ? stringParts.reverse().join("") : stringParts.join("");
    this.removeExtraCharsLiteralInput();
    if(this.currentMask.isMoney){
        if(event.target.value[0].search(/[^0-9]/) > -1)
            event.target.value = event.target.value.substring(1);
        if(event.target.value.replace(/[^0-9]/).length == 1)
            event.target.value = `0,0${event.target.value}`;
        else if(event.target.value.replace(/[^0-9]/).length == 2)
            event.target.value = `0,${event.target.value}`;

        event.target.value = `${event.target.value} ${MONEY_COUNTRY_MASKS[this.currentMask.moneyCountry]}`;
    }
    if(!this.submitWithMask)
        this.originalInput.value = event.target.value.replace(this.regexInvalidChars, '');
};
GenericNumberMask.prototype.removeExtraCharsLiteralInput = function(){
    let diffLength = this.literalInputValue.length - this.input.value.replace(this.regexInvalidChars, '').length;
    this.literalInputValue = this.literalInputValue.substring(0, this.literalInputValue.length - diffLength);
}
GenericNumberMask.prototype.getInputStringParts = function(event, newValue) {
    let stringParts = [];
    let isPasteReverse = event.inputType === 'insertFromPaste' && this.reverseInput;
    let tempSeparators = [].concat(this.currentMask.separators);
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
            stringParts.push(part);
        }else{
            stringParts.push(newValue);
            break;
        }
        if(maskPart.isInfitityPart)
            tempSeparators.push(tempSeparators[tempSeparators.length - 1]);
    }
    return stringParts;
}
GenericNumberMask.prototype.updateLiteralInputValue = function(newValue, isDeleteEvent){
    let diffLength = newValue.length - this.literalInputValue.length;
    diffLength = isDeleteEvent && diffLength >= 0 ? -1 : diffLength; 
    this.literalInputValue = diffLength < 0
        ? this.literalInputValue.substring(0, this.literalInputValue.length + diffLength) 
        : this.literalInputValue + newValue.substring(this.literalInputValue.length); 
}
GenericNumberMask.prototype.setCurrentMask = function(inputValue){
    let maskOfThisLength = this.masks.find(m => m.valueLength >= inputValue.length);
    maskOfThisLength = maskOfThisLength ? maskOfThisLength : this.masks[this.masks.length - 1];
    this.changeCurrentMask(maskOfThisLength);
}
GenericNumberMask.init = function(input, options=DEFAULT_OPTIONS){
    new GenericNumberMask(input, options);
}