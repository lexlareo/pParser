import { Jkj, jkj } from "./jkj.js";
import * as _c from "./css_utils.js";
import common from "./common.js";
import * as _u from "./sys_utils.js";
import textActor from "./actors/text.js";

/*
This module would be used to draw the contents of a slide sld. 
We are going to use bounding boxes right now, and then we are going to create modules for each type of actor.
the geometry of the actors come straight from the g property of each actor object in the snapshot data.
We would also use a simple light grey color for the contents against a white background

The first item to draw is the box of the slide itself. We should draw it its default width and height, and it should be horizontally centered in the container "preview".

We are going to use data-id on each html element to add the id of the actor /slide for reference later.

All actors inside a slide should be children of the sld object

Each actor should point at least to a class named like its id (for easy relationship) and this class should be the last one, since its going to have the geometry values, like left, top, width, height, etc.

We also should create the class on the fly and add it to each actor element.

*/

/*
    TO-DO
    Bring the design system to create the variables in :root

    It would be good to try to search for common items among the actors, i.e. Border-radius (r), paddings for texts, shadows ...,  that actually are not part of the design system specifications, to try to infere them globally and add them to the design system so we can reuse them as CSS variables

    Replace colors first (fn). Fonts next.
    FN for solving g taking into account the anchoring values defined in first level actor property "a"
    
    Add click state for actors to be able to inspect the actor's original object. Right now we will display that info in the details panel
    Display the list of sld actors next to the sld list
    Simplified version of tapestry module
*/

const j = new Jkj();
const jkjStyle = document.createElement("style");
jkjStyle.type = "text/css";
document.head.appendChild(jkjStyle);

let createdPages = {};

let css = [];
css.push(`/* Project Variables */\n :root {
    --sys-pbody-bg: #040404;
  }`);
css.push(`/* Base actors */\n.actor {
    position: absolute;
    box-sizing: border-box;
  }`);

jkjStyle.appendChild(document.createTextNode(css.join("\n")));

// Draw actors
const drawActors = (sldObj, target) => {
  // We will store the CSS rules here
  let cssRules = [];
  // Add the actors (which are properties themselves) to an array so we can sort it
  let myobj = [];
  Object.entries(sldObj.a).forEach(([key, actor]) => {
    myobj.push({ id: key, srt: actor.srt || 0 });
  });
  // Sort the array
  myobj = _u.orderBy(myobj, "srt");
  // Draw actors in the correct order
  myobj.forEach((elem) => {
    // Draw each actor based on its geometry
    const actor = sldObj.a[elem.id];
    const el = drawActor(target, elem.id, actor);
    // Add the css definition only if the page has not been created
    if (!createdPages[sldObj.id]) cssRules.push(el.style);
  });
  return cssRules.join("\n");
};

// Draw one actor
/**
 * Draws a single actor element based on the provided actor data and appends it to the target container.
 *
 * @param {HTMLElement} target - The container element to append the actor element to
 * @param {Object} actor - The actor data object
 * @returns {Object} - Returns an object with the created actor element and generated CSS
 */
const drawActor = (target, actorID, actor) => {
  const actorElement = document.createElement("div");
  const cName = actorID.split("@")[1];

  // we cut execution if theere are not geometry properties to draw the actor
  if (!actor.g)
    return {
      element: null,
      style: "",
    };

  // CSS calculations
  let solvedCSS = [];
  solvedCSS.push(_c.cssColor(actor.bg));
  solvedCSS.push(_c.borderRadius(actor.r));
  solvedCSS.push(_c.border(actor.b));

  // Actor's Geometry class
  let css = `/* Actor "${actor.d}" [${actorID}]*/\n`;
  let geo = _c.solveGeo(actor);
  css += `.ac_g_${cName} {${geo.css}}\n`;

  // Add the object class dependendant properties like text, media ...
  switch (actor.tI) {
    case 4: // Text
      css += textActor(actorElement, actor);
      break;
    default:
      break;
  }

  // Actor's Visual class
  if (solvedCSS.length > 0) {
    // Temporary let's add an external border to all just to be able to visualize the elements that don't have border
    css += `.ac_v_${cName} {
      border: 1px ${
        actor.tI == 9 ? "dashed" : actor.tI == 10 ? "solid" : "dotted"
      } #fff3;
      ${solvedCSS.join("\n")}
    }`;
  }

  // Apply the classes. By default we use first the actor class, then the visual and last the geometry. Probably we will add some more in between actor and visual classes
  actorElement.className = `actor ac_v_${cName} ac_g_${cName}${
    actor.h ? " hide" : ""
  }`;

  actorElement.dataset.id = actorID;
  actorElement.dataset.name = actor.d;

  // Methods for the actors
  actorElement.highlight = function () {
    let active = this.classList.contains("highlight");
    if (active) {
      this.classList.remove("highlight");
    } else {
      this.classList.add("highlight");
    }
  };

  actorElement.select = function (active) {
    if (!active) {
      this.classList.remove("actor-selected");
    } else {
      this.classList.add("actor-selected");
    }
  };

  // Events for the actors
  actorElement.addEventListener("click", function (e) {
    common.tps.set("currentActor", this.dataset.id);
  });

  actorElement.addEventListener("mouseover", function (e) {
    let cActor = common.tps.get("currentActor");
    if (cActor !== this.dataset.id) {
      common.tps.set("highlightedActor", this.dataset.id);
    }
  });

  actorElement.addEventListener("mouseout", function (e) {
    let cActor = common.tps.get("currentActor");
    if (cActor !== this.dataset.id) {
      common.tps.set("highlightedActor", this.dataset.id);
    }
  });

  let n = target.appendChild(actorElement);
  return {
    element: actorElement,
    style: css,
  };
};

const drawSlide = (sldObj) => {
  jkj(".prev-prev").innerHTML = "";

  // Calculate the SLD class
  const cName = `sld_${sldObj.id.split("@")[1]}`;

  let sldStyle = [];

  // CSS calculations
  let bgcolor = _c.cssColor(sldObj.bg);

  sldStyle.push(`/* Classes belonging to Slide "${sldObj.d}" [${sldObj.id}] */\n.${cName} {
    position: relative;
    width: ${sldObj.g.w}px;
    height: ${sldObj.g.h}px;
    ${bgcolor};
  }`);

  // Create the slide and assign its class
  const target = new Jkj(".prev-prev").n(sldObj.d, sldObj.id).setClass(cName);
  sldStyle.push(drawActors(sldObj, target));

  // We only compile and the classes to the style sheet once, only if it does not exist previously
  if (!createdPages[sldObj.id]) {
    createdPages[sldObj.id] = sldStyle.join("\n");
    jkjStyle.appendChild(document.createTextNode(createdPages[sldObj.id]));
  }
};

export default drawSlide;
