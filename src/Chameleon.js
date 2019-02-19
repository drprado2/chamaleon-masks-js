import MaskHandler from './MaskHandler';
import {DEFAULT_OPTIONS, DEFAULT_MASK_CONFIG} from './defaultValues';

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

export default Chameleon;
