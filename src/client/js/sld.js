import { Jkj, jkj } from "./jkj.js";
import * as _c from "./css_utils.js";
import common from "./common.js";
import * as _u from "./sys_utils.js";
import textActor from "./actors/text.js";
import groupActor from "./actors/group.js";
import mediaActor from "./actors/media.js";
/*
    TO-DO
    Bring the design system to create the variables in :root
    It would be good to try to search for common items among the actors, i.e. Border-radius (r), paddings for texts, shadows ...,  that actually are not part of the design system specifications, to try to infere them globally and add them to the design system so we can reuse them as CSS variables

    Let's also add flex to group objects and simplify layouts. We are going to add margin-top as the gap property between actors
We have to lookup for the inneer elements of autolayout inner aligments

Work on a project browser

    We also need to keep a track of all actors css styles in object format so we can compare them. i.e if some objects in different slides has the same style, but the definition is somewhat different between them we should add a new class with the incremental changes and reuse that class instead of duplicating styles


preview url :  https://preview.persp.info/JKJ-1649495768004/00@kz0w41px?live=true
image url: background-image: url("https://ftp.persp.info/projects/P1643524595831/media/d5rGM8q14iMVoPgB_800.png")

Implement media


    DONE
    Replace colors first (fn). Fonts next.
    FN for solving g taking into account the anchoring values defined in first level actor property "a"
    
    Add click state for actors to be able to inspect the actor's original object. Right now we will display that info in the details panel
    Display the list of sld actors next to the sld list
    Simplified version of tapestry module
*/

const j = new Jkj();

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
    const el = drawActor(target, elem.id, actor, sldObj.id);
    if (el.grp) groupedActors.push(el);
    // Add the css definition only if the page has not been created
    if (!common.createdPages[sldObj.id]) cssRules.push(el.style);
  });

  // now let´s connect elements that belong to groups to their parents
  //console.log("Grouping actors...", groupedActors);
  groupedActors.forEach((grp) => {
    const group = document.querySelector(`[data-id="${grp.grp}"]`);
    // console.log("Group", group);
    if (group) group.appendChild(grp.element);
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
const drawActor = (target, actorID, actor, sldID) => {
  const actorElement = document.createElement("div");
  const cName = actorID.split("@")[1] + "-" + sldID.split("@")[1];

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
  if (actor.srt && actor.gr) solvedCSS.push(`order: ${actor.srt};`); // overflow hidden

  // Actor's Geometry class
  let css = `/* Actor "${actor.d}" [${actorID}]*/\n`;
  let geo = _c.solveGeo(actor);
  let extra = "";
  let grCSS;
  css += `.ac_g_${cName} {${geo.css}}\n`;

  // Add the object class dependendant properties like text, media ...
  switch (actor.tI) {
    case 4: // Text
      solvedCSS.push(textActor(actorElement, actor));
      break;
    case 7: // media
      let media = mediaActor(actorElement, actor);
      if (media != "") solvedCSS.push(media);
      break;
    case 9: // Group
      grCSS = groupActor(actorElement, cName, actor);
      if (grCSS) {
        solvedCSS.push(grCSS.gr);
        //console.log(grCSS);
        extra = grCSS.grRule;
      }
      break;
    case 10: // include
      drawSlide(common.snp[actor.i.s], actorElement);
      break;
    default:
      break;
  }

  // Actor's Visual class
  if (solvedCSS.length > 0) {
    // Temporary let's add an external border to all just to be able to visualize the elements that don't have border
    css += `.ac_v_${cName} {
      border: 0px ${
        actor.tI == 9 ? "dashed" : actor.tI == 10 ? "solid" : "dotted"
      } #fff3;
      ${solvedCSS.join("\n")}
    }`;
  }
  css += "\n" + extra;

  // Apply the classes. By default we use first the actor class, then the visual and last the geometry. Probably we will add some more in between actor and visual classes
  let clasess = [`actor`, `ac_v_${cName}`, `ac_g_${cName}`];
  if (grCSS) clasess.push(`ac_autolayout_${cName}`);
  if (actor.h) clasess.push(`hide`);
  actorElement.className = clasess.join(" ");

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
    grp: actor.gr ? actor.gr : null,
  };
};

const drawSlide = (sldObj, itarget) => {
  if (!sldObj) return;
  jkj(itarget).innerHTML = "";

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
  const target = new Jkj(itarget).n(sldObj.d, sldObj.id).setClass(cName);
  sldStyle.push(drawActors(sldObj, target));

  // We only compile and the classes to the style sheet once, only if it does not exist previously
  if (!common.createdPages[sldObj.id]) {
    common.createdPages[sldObj.id] = sldStyle.join("\n");
    document
      .getElementById("compileTMPCSS")
      .appendChild(document.createTextNode(common.createdPages[sldObj.id]));
  }
};

export default drawSlide;
