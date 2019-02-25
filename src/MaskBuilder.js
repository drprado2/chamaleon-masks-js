export class MaskBuilder{

  constructor(){
    this._simpleMasks = [];
    this._infinitMasks = null;
    this._moneyMask = null;
    this._limitedMasks = [];
    this._withReverseInput = false;
    this._validationsCallback = [];
    this._input = null;
  }

  static begin(){
    return new MaskBuilder();
  }

  withSimpleMask(){
    
  }
}
