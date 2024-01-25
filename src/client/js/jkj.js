/**
 * Jkj class to create and manipulate DOM elements
 * @class
 * @param {Node} node - DOM node to initialize Jkj instance
 * @returns {Jkj} Jkj instance
 */
import * as _u from "./sys_utils.js";
import * as _c from "./css_utils.js";

export class Jkj {
  /**
   * Constructor for Jkj class. Initializes the element property to the passed node.
   * If no node is passed, sets element to undefined.
   * @param {Node} node - DOM node to initialize element to
   */
  constructor(node) {
    if (!node) return undefined;
    let nodeObj = _u.resolveNode(node);
    this.element = nodeObj;
  }
  e() {
    return this.element;
  }

  /**
   * Creates a new DOM element of type `type` (default "div")
   * and appends it to the current element or document.body.
   * Sets the id to `name` and data-id to `dataId` if provided.
   * Updates the current element to the newly created element
   * and returns the Jkj instance.
   */
  n(name, dataId, type = "div") {
    let el = document.createElement(type);
    if (dataId) el.dataset.id = dataId;
    if (name) el.id = name;
    let obj;
    if (_u.isDefined(this.element)) {
      obj = this.element.appendChild(el);
    } else {
      obj = document.body.appendChild(el);
    }
    this.element = obj;
    return this;
  }
  /**
   * Gets or sets the geometry (position and dimensions) of the element.
   *
   * If no geometry is passed, returns an object with the current geometry.
   *
   * If a geometry object is passed, sets the element's style properties to match
   * the passed geometry values. Valid keys are x, y, w, h, r, b.
   *
   * Returns the Jkj instance for chaining.
   */
  g(geometry) {
    if (!geometry) {
      return {
        x: this.element.offsetLeft,
        y: this.element.offsetTop,
        w: this.element.offsetWidth,
        h: this.element.offsetHeight,
      };
    } else {
      if (_u.isObject(geometry)) {
        let geoStyle = {};
        if (geometry.x) geoStyle.left = _c.px(geometry.x);
        if (geometry.y) geoStyle.top = _c.px(geometry.y);
        if (geometry.w) geoStyle.width = _c.px(geometry.w);
        if (geometry.h) geoStyle.height = _c.px(geometry.h);
        if (geometry.r) geoStyle.right = _c.px(geometry.r);
        if (geometry.b) geoStyle.bottom = _c.px(geometry.b);
        console.log(_c.styleToCSS(geoStyle));
      }
      return this.element;
    }
  }

  setClass(className) {
    this.element.classList.add(className);
    return this.element;
  }
}

export const jkj = (node) => {
  return new Jkj(node).e();
};
