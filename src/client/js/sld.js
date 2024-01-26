import { Jkj, jkj } from "./jkj.js";
import * as _c from "./css_utils.js";
import common from "./common.js";
import * as _u from "./sys_utils.js";
import textActor from "./actors/text.js";

/*
    TO-DO
    Bring the design system to create the variables in :root

    It would be good to try to search for common items among the actors, i.e. Border-radius (r), paddings for texts, shadows ...,  that actually are not part of the design system specifications, to try to infere them globally and add them to the design system so we can reuse them as CSS variables


    DONE
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

  //
  let groupedActors = [];
  myobj.forEach((elem) => {
    // Draw each actor based on its geometry
    const actor = sldObj.a[elem.id];
    const el = drawActor(target, elem.id, actor);
    if (el.grp) groupedActors.push(el);
    // Add the css definition only if the page has not been created
    if (!createdPages[sldObj.id]) cssRules.push(el.style);
  });

  // now let´s connect elements that belong to groups to their parents
  groupedActors.forEach((grp) => {
    const group = document.querySelector(`[data-id="${grp.grp}"]`);
    console.log("Group", group);
    group.appendChild(grp.element);
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
      grp: null,
    };

  // CSS calculations
  let solvedCSS = [];
  solvedCSS.push(_c.cssColor(actor.bg)); // bg color
  solvedCSS.push(_c.borderRadius(actor.r)); // border radius
  solvedCSS.push(_c.border(actor.b)); // border
  if (actor.o) solvedCSS.push(`opacity: ${actor.o};`); // opacity
  if (actor.ove) solvedCSS.push(`overflow: hidden;`); // overflow hidden

  // Actor's Geometry class
  let css = `/* Actor "${actor.d}" [${actorID}]*/\n`;
  let geo = _c.solveGeo(actor);
  css += `.ac_g_${cName} {${geo.css}}\n`;

  // Add the object class dependendant properties like text, media ...
  switch (actor.tI) {
    case 4: // Text
      solvedCSS.push(textActor(actorElement, actor));
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
    grp: actor.tI != 10 && actor.gr ? actor.gr : null,
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
    min-height: ${sldObj.g.h}px;
    ${bgcolor};
    overflow:hidden;
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
