/**
 * Checks if the given value is an object.
 *
 * @param {*} obj - The value to check.
 * @returns {boolean} True if `obj` is an object, false otherwise.
 */
export const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

/**
 * Checks if the given variable is defined (i.e. not undefined).
 *
 * @param {*} variable - The variable to check.
 * @returns {boolean} True if variable is defined, false otherwise.
 */
export const isDefined = (variable) => {
  return variable !== undefined;
};

export const isArray = (arr) => {
  return Array.isArray(arr);
};

export const isString = (str) => {
  return typeof str === "string";
};

/**
 * Sorts the given array in ascending order by the given property.
 *
 * @param {Array} array - The array to sort
 * @param {string} prop - The property to sort by
 */
export const orderBy = (array, prop, direction = "asc") => {
  return array.sort((a, b) =>
    direction == "desc" ? b[prop] - a[prop] : a[prop] - b[prop]
  );
};

/**
 * Resolves a DOM element (node) from different input types.
 *
 * @param {HTMLElement|string} input - The DOM element or selector string
 * @returns {HTMLElement|null} The resolved DOM element or null if not found
 * @throws {Error} If input type is invalid
 */
export const resolveNode = (input) => {
  let element;

  if (input instanceof HTMLElement) {
    // Input is a DOM element
    element = input;
  } else if (typeof input === "string") {
    // Validate selector string format
    // Try to resolve string input to DOM element
    if (input.indexOf(".") > -1) {
      //console.log(input);
      // if (!input.match(/^[.#]?[\w-]+$/)) {
      //   throw new Error("Invalid selector string");
      // }
      // Selector string
      element = document.querySelector(input);
    } else {
      // ID string
      element = document.getElementById(input);
    }
  } else {
    // Invalid input type
    throw new Error("Input must be a DOM element or selector string");
  }

  if (!element) {
    // Element not found
    return null;
  }

  // Found valid element, return early
  return element;
};
