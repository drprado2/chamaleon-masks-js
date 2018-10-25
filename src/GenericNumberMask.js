const DEFAULT_MASK_CONFIG={
    mask: "(99) 9999-9999", validationCallback: (inputValue) => true , isMoney: false, moneyCountryMask: 'R$'
}
const DEFAULT_OPTIONS={
    submitWithMask: true,
    reverseInput: false,
    masks: [DEFAULT_MASK_CONFIG]
}

const GenericNumberMask = function(input, options=DEFAULT_OPTIONS){
    if(!input)
        throw new Error("Should be passed a valid input!")
    options = options instanceof Object ? {...DEFAULT_OPTIONS, ...options} : DEFAULT_OPTIONS;
    options.masks = options.masks.map(m => ({...DEFAULT_MASK_CONFIG, placeholder: m.mask.replace(/\[\d*-\d*\]/g, ''), ...m}));

    this.originalInput = input;
    this.input = input;
    this.reverseInput = options.reverseInput;
    this.submitWithMask = options.submitWithMask;
    this.createCloneInput();
    this.masks = [];
    this.currentMask = null;
    this.literalInputValue = "";
    this.regexInvalidChars = /[^0-9]/gm;
    options.masks.forEach(m => this.addMask(m));
    this.changeCurrentMask(this.masks[0]);
    this.addListener();
    this.setMoneyMask();
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
        valueLength: maskOptions.mask.replace(/\[\d*-\d*\]/g, '').replace(this.regexInvalidChars, "").length,
        separators: this.createArraySeparators(maskOptions),
        maskString: maskOptions.mask,
        submitWithoutMask: maskOptions.submitWithoutMask,
        validationCallback: maskOptions.validationCallback,
        isMoney: maskOptions.isMoney,
        moneyCountryMask: maskOptions.moneyCountryMask,
        placeholder: maskOptions.placeholder,
    };
}
GenericNumberMask.prototype.setPlaceholder = function(){
    this.input.placeholder = this.currentMask.placeholder;
}
GenericNumberMask.prototype.createArraySeparators = function(maskOptions){
    if(this.reverseInput){
        let rangeParts = maskOptions.mask.match(/([0-9\*]*\[\d*-\d*\])/g) || [];
        rangeParts.forEach(p => {
            let rangePart = /^[0-9]*(\[\d*-\d*\])/gm.exec(p)[1];
            let temp = p.replace(rangePart, '');
            temp = rangePart.split("").reverse().join("") + temp;
            maskOptions.mask = maskOptions.mask.replace(p, temp);
        })
    }
    let maskString = this.reverseInput ? maskOptions.mask.split("").reverse().join("") : maskOptions.mask;
    let separators = [];
    let tempString = maskString;
    while(tempString.length > 0){
        const isInfinitPart = tempString[0] === "*";
        const rangePart = /^[0-9]*(\[\d*-\d*\])/gm.exec(tempString);
        let rangeObj = {};
        if(isInfinitPart){
            let indexSeparator = tempString.search(/[^\*]/);
            indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;
            let separator = tempString.substring(indexSeparator, tempString.length) || "";
            let valuePart = tempString.substring(0, indexSeparator);
            separators.push({qtdDigits: valuePart.length, separator, isInfitityPart: true});
            break;
        }
        if(rangePart){
            let range = rangePart[1];
            tempString = tempString.replace(range, '');
            rangeObj.start = parseInt(range.substring(1, range.indexOf('-')));
            rangeObj.end = parseInt(range.substring(range.indexOf('-') + 1, range.length - 1));
        }
        let indexSeparator = tempString.search(this.regexInvalidChars);
        indexSeparator = indexSeparator !== undefined && indexSeparator > -1 ? indexSeparator : tempString.length;
        let nextValidChar = tempString.substring(indexSeparator).search(/[0-9]/);
        let endIndexSeparator = nextValidChar < 0 ? tempString.length : indexSeparator + nextValidChar;
        let separator = tempString.substring(indexSeparator, endIndexSeparator) || "";
        if(separator.search(/\*/) > -1){
            endIndexSeparator = indexSeparator + tempString.substring(indexSeparator).search(/\*/);
            separator = tempString.substring(indexSeparator, endIndexSeparator);
        }
        let valuePart = tempString.substring(0, indexSeparator);
        separators.push({qtdDigits: valuePart.length, separator, isInfitityPart: false, hasRange: !!rangePart, range: rangeObj});
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
GenericNumberMask.prototype.setMoneyMask = function(){
    if(!this.currentMask.isMoney)
        return;

    const inputPureValue = this.input.value.replace(/[^0-9]/, '');
    const {moneyCountryMask} = this.currentMask;

    if(this.input.value && this.input.value[0].search(/[^0-9]/) > -1)
        this.input.value = this.input.value.substring(1);

    if(inputPureValue.length > 3 && this.input.value[0] === '0')
        this.input.value = this.input.value.substring(1);

    switch(inputPureValue.length){
        case(0):
            this.input.value = moneyCountryMask + ' 0,00';
            break;
        case(1):
            this.input.value = `${moneyCountryMask} 0,0${inputPureValue}`;
            break;
        case(2):
            this.input.value = `${moneyCountryMask} 0,${inputPureValue}`;
            break;
        default:
            this.input.value = `${moneyCountryMask} ${this.input.value}`;
    }
}
GenericNumberMask.prototype.cleanMoneyMask = function(newValue){
    if(this.currentMask.isMoney){
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
GenericNumberMask.prototype.handleInputEvent = function(event){
    let newValue = this.cleanMoneyMask(event.target.value.replace(this.regexInvalidChars, ""));
    this.setCurrentMask(newValue);
    this.updateLiteralInputValue(newValue, event.inputType === 'deleteContentBackward');
    let stringParts = this.getInputStringParts(event, this.literalInputValue);
    event.target.value = this.reverseInput ? stringParts.reverse().join("") : stringParts.join("");
    this.removeExtraCharsLiteralInput();
    this.setMoneyMask();
    if(!this.submitWithMask)
        this.originalInput.value = event.target.value.replace(this.regexInvalidChars, '');
    event.target.value = event.target.value.replace(/^[^0-9]$/g, '');
};
GenericNumberMask.prototype.resolveValueRange = function(partValue, maskPart){
    if(!maskPart.hasRange)
        return partValue;
    let tempValue = parseInt(partValue.replace(/[^0-9]/g, ''));
    let result = partValue;
    let isInInterval = tempValue >= maskPart.range.start && tempValue <= maskPart.range.end;
    if(!isInInterval)
        return tempValue.toString().substring(0,tempValue.toString().length - 1);

    return result;
}
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
            part = this.resolveValueRange(part, maskPart);
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
GenericNumberMask.initOptions = function(input, options=DEFAULT_OPTIONS){
    new GenericNumberMask(input, options);
}
GenericNumberMask.init = function(input, ...masks){
    let options = {...DEFAULT_OPTIONS};
    options.masks = masks.map(m => ({...DEFAULT_MASK_CONFIG, mask: m}));
    new GenericNumberMask(input, options);
}
