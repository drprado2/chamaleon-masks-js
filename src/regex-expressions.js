const regexExpressions = {
  ONLY_DIFF_NUMBER : /[^0-9]/gm,
  START_VALUE_NOT_NUMBER : /^[^0-9]$/g,
  RANGE_PARTS: /([0-9\*]*\[\d*-\d*\])/g,
  RANGE_VALUE: /^[0-9]*(\[\d*-\d*\])/m,
  RANGES: /\[\d*-\d*\]/g,
  NOT_INFINIT_CHAR: /[^\*]/,
  INFINIT_CHAR: /[\*]/
}

export default regexExpressions;
