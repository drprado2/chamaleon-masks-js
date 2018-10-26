export const DEFAULT_MASK_CONFIG={
    mask: "(99) 9999-9999", validationCallback: (inputValue) => true , isMoney: false, moneyCountryMask: 'R$'
}

export const DEFAULT_OPTIONS={
  submitWithMask: true,
  reverseInput: false,
  masks: [DEFAULT_MASK_CONFIG]
}
