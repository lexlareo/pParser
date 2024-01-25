import * as _u from "./sys_utils.js";

/**
 * Converts a style object to a CSS string.
 * @param {Object} obj - The style object to convert.
 * @returns {string} The CSS string representation of the style object.
 */
export const styleToCSS = (obj) => {
  let style = "";
  Object.entries(obj).forEach(([key, value]) => {
    style += `${key}: ${value};`;
  });
  return style;
};

export const px = (val) => {
  if (!_u.isDefined(val)) return "auto";
  if (typeof val !== "number") return val;
  return `${val}px`;
};

export const rem = (val) => {
  if (!_u.isDefined(val)) return "auto";
  if (typeof val !== "number") return val;
  return `${val}rem`;
};

export const jColor = (colorObj) => {
  if (_u.isObject(colorObj) && colorObj.cs) {
    return colorObj.cs.cs_0.h;
  }
};
