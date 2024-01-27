import * as _u from "./sys_utils.js";
import common from "./common.js";

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

// Geometry calculators
export const solveGeo = (actor) => {
  // the properties that we need to deal with geometry are  a (alignment string up to 6 characters in 2 characters groups) and  g (geometry values)
  // let's decompose the alignment in groups of 2 characters
  const alignment = actor.a.match(/.{1,2}/g);
  let coords = {};

  coords.w = actor.g.w;
  coords.h = actor.g.h;

  // Solving Horizontal (X) anchoring
  switch (alignment[0].charAt(1)) {
    case "L":
      coords.x = actor.g.x;

      break;
    case "R":
      coords.r = actor.g.r;
      break;
    case "C":
      coords.x = `calc(50% ${actor.g.oX > 0 ? "+ " : "- "}${px(
        Math.abs(actor.g.oX)
      )})`;
      break;
  }

  // Solving Vertical (Y) anchoring
  switch (alignment[0].charAt(0)) {
    case "T":
      coords.y = actor.g.y;
      break;
    case "B":
      coords.b = actor.g.b;
      break;
    case "M":
      coords.y = `calc(50% ${actor.g.oY > 0 ? "+ " : "- "}${px(
        Math.abs(actor.g.oY)
      )})`;
      break;
  }

  // Solve the pinning of the edges
  alignment.forEach((item, index) => {
    if (index >= 1) {
      switch (item) {
        case "TC": // Vertical pinning
        case "BC":
          delete coords.h;
          coords.y = actor.g.y;
          coords.b = actor.g.b;
          break;
        case "ML":
        case "MR": // Horizontal pinning
          delete coords.w;
          coords.x = actor.g.x;
          if (item == "ML" && actor.g.oX)
            coords.x = `calc(50% - ${px(actor.g.oX + actor.g.w)})`;
          coords.r = actor.g.r;
          break;
      }
    }
  });

  // Let's map geo object properties to CSS properties
  const keyMap = {
    x: "left",
    y: "top",
    w: "width",
    h: "height",
    r: "right",
    b: "bottom",
  };
  const cssCoord = [];
  // Only transform the existing properties in coords to css (not those of the original object)
  Object.entries(coords).forEach(([key, value]) => {
    cssCoord.push(`${keyMap[key]}: ${px(value)};`);
  });

  // Applies CSS transform properties based on the rotate
  // property of the actor, which can specify a single
  // rotation around the Z axis, or individual rotations
  // around the X, Y, and Z axes
  if (actor.rt) {
    if (actor.rt.v) {
      cssCoord.push(`transform: Rotate( ${actor.rt.v}deg);`);
    } else if (actor.rt.x && actor.rt.y && actor.rt.z) {
      cssCoord.push(
        `transform: RotateX( ${actor.rt.x}deg) RotateY( ${actor.rt.y}deg) RotateZ( ${actor.rt.z}deg);`
      );
    }
  }
  return { coords, css: cssCoord.join("\n") };
};

// Color manipulations

export const jColor = (colorObj) => {
  if (_u.isObject(colorObj) && colorObj.cs) {
    // Let's iterate over the color steps (cs) of the color obj to create a formatted array of flattened colors
    let steps = [];
    Object.entries(colorObj.cs).forEach(([key, value]) => {
      let color = value.h;
      // if opacity is not defined, set it to fully opaque (1)
      let opacity = value.o ? value.o : 1;
      // if c is a named color from the design system (always start with "color_"), lookup the hex value
      if (color.indexOf("color_") == 0) {
        // if the color name exists in the design system colors, lookup the hex value
        if (common.ds.colors[color].c) {
          if (common.ds.colors[color].o && opacity == 1) {
            opacity = common.ds.colors[color].o;
          }
          color = common.ds.colors[color].c;
        } else {
          (color = "#FFFF00"), (opacity = 1);
        }
      }
      let formatttedColor = {
        c: color,
        o: opacity,
      };
      steps.push(calcColorOpacity(formatttedColor));
    });
    // if there is an m property, it means that we are dealing with a gradient: L is linear and R is radial. "a" property of colorObj provides the direction
    if (colorObj.m) {
      let direction = "";
      if (colorObj.m == "L") {
        direction = "linear-gradient(";
      } else {
        direction = "radial-gradient(";
      }

      direction += colorObj.a + "deg";

      steps.forEach((step) => {
        direction += "," + step;
      });

      direction += ")";

      return direction;
    } else {
      // it is a single color
      return steps[0];
    }
  }
};

// lets create a quick function that calculates the opacity values of a color object as a Hex value mapping opcity (0-1) to 0-256 and then returning the Hex value
export const calcColorOpacity = (colorObj) => {
  if (_u.isObject(colorObj) && colorObj.c && colorObj.o) {
    let opacity = Math.round(colorObj.o * 255);
    let hex = colorObj.c.replace("#", "");

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    return "#" + hex + opacity.toString(16).padStart(2, "0");
  }

  return colorObj.c;
};

/**
 * Converts a color object to a CSS background style string.
 * Handles transparency and gradient colors.
 * @param {Object} colorObj - The color object to convert. It can contains a complex structure with at least a cs property
 * @returns {string} The CSS string representation of the color object flattened.
 */
export const cssColor = (color, justcolor = false) => {
  let bgcolor = "";
  // color is enabled so we can paint it
  if (color.a == 1) {
    // _c.jColor() returns a proper hex value that includes transparency and solves any link to the design system color values
    let micolor = jColor(color.c);
    if (justcolor) return micolor;
    // Multicolor, so we need a gradient
    if (color.c.m) {
      bgcolor = `background: ${micolor};`;
    } else {
      bgcolor = `background-color: ${micolor};`;
    }
  }
  return bgcolor;
};

// Visual attributes calculators

/**
 * Calculates CSS border-radius property value based on the passed border radius object.
 * Handles shorthand all-corners radius as well as per-corner values.
 * @param {Object} bRad - The borderRadius object to convert. If present it can have 2 variants. One with only the v property that is the all-cornes radius value. Or with tr, tl, br, bl properties for per-corner values.
 * @returns {string} The CSS string representation of the style object.
 */
export const borderRadius = (bRad) => {
  // Let's calculate properly the border radius
  if (bRad) {
    if (bRad.v) {
      return `border-radius: ${bRad.v}px;`;
    } else if (bRad.tr && bRad.tl && bRad.br && bRad.bl) {
      let tmpBR = [];
      // if any of the radius properties is 0, we do not include it in the output
      if (bRad.tl != 0)
        tmpBR.push(
          `border-top-left-radius: ${bRad.tl}${
            bRad.format ? bRad.format : "px"
          };`
        );
      if (bRad.tr != 0)
        tmpBR.push(
          `border-top-right-radius: ${bRad.tr}${
            bRad.format ? bRad.format : "px"
          };`
        );
      if (bRad.br != 0)
        tmpBR.push(
          `border-bottom-right-radius: ${bRad.br}${
            bRad.format ? bRad.format : "px"
          };`
        );
      if (bRad.bl != 0)
        tmpBR.push(
          `border-bottom-left-radius: ${bRad.bl}${
            bRad.format ? bRad.format : "px"
          };`
        );
      return tmpBR.join("\n");
    } else {
      if (_u.isString(bRad)) {
        return `border-radius: ${bRad};`;
      }
    }
  }
  return "";
};

/**
 * Calculates CSS border property value based on the passed border object.
 * Handles shorthand border width, style and color.
 * @param {Object} brd - The border object to convert.
 * @returns {string} The CSS string representation of the border style.
 */

// We will have to review what the border property m represents
export const border = (brd) => {
  if (!brd) return "";
  let color = cssColor(brd);
  if (color != "") {
    return `border: ${brd.w}px ${brd.t} ${color.split(": ")[1]};`;
  } else {
    return "";
  }
};
