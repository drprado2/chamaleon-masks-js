import MaskHandler from './MaskHandler';
import {DEFAULT_OPTIONS, DEFAULT_MASK_CONFIG} from './defaultValues';

const Chameleon = {
  initOptions : function(input, options=DEFAULT_OPTIONS){
    if(Object.getPrototypeOf(input) == String.prototype)
      input = document.querySelector(input);
    new MaskHandler(input, options);
  },
  init: function(input, ...masks){
    if(Object.getPrototypeOf(input) == String.prototype)
      input = document.querySelector(input);
    let options = {...DEFAULT_OPTIONS};
    options.masks = masks.map(m => ({...DEFAULT_MASK_CONFIG, mask: m}));
    new MaskHandler(input, options);
  }
};

export default Chameleon;
