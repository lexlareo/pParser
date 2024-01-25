// Import the jkj module for selecting DOM elements
import { jkj } from "../jkj.js";
import * as _u from "../sys_utils.js";

/**
 * Renders a list element by processing input data
 * and generating HTML with selection and hover states.
 *
 * @param {Object} data - Input data to render
 * @param {Object} def - Render definitions
 * @param {string} selID - ID of initially selected item
 * @param {string} dTarget - Selector ID to render the list in
 * @param {string} lname - Name for generated list
 * @param {string} lClass - Class name for list items
 * @param {Function} cb - Click callback
 * @param {Function} hoverCB - Hover callback
 * @param {Function} leaveCB - Mouse leave callback
 * @returns {Element} The rendered element target
 */
const list = (
  data,
  def,
  selID,
  dTarget,
  lname,
  lClass,
  cb,
  hoverCB,
  leaveCB
) => {
  console.time(dTarget + "_listDrawing");
  // Initialize an array to hold the processed data
  let myobj = [];
  // Iterate over each entry in the data object
  Object.entries(data).forEach(([key, value]) => {
    myobj.push({
      id: value[def.key],
      label: value[def.label]
        ? value[def.label]
        : value[def.key]
        ? value[def.key]
        : key,
      selected: key === selID,
      icn: def.icn ? def.icn : null,
      srt: def.srt && value[def.srt] ? value[def.srt] : 0,
    });
  });

  // Sort the array
  myobj = _u.orderBy(myobj, "srt", def.dir);

  // Start building the list HTML as a string
  let str = `<ul role="list" id="${lname}_ctrl">`;

  // Iterate over each element in myobj to create list items
  myobj.forEach((element) => {
    // Append each list item to the string
    let icn = element.icn
      ? `<span class="material-symbols-rounded opa-light">${element.icn}</span>`
      : "";

    str += `<li id="${element.id}" role="listitem" class="${lClass}-item${
      element.selected ? " " + lClass + "-item-selected" : ""
    }">${icn}&nbsp${element.label}</li>`;
  });

  // Close the unordered list tag
  str += "</ul>";

  // Check if the target element exists
  const targetElement = jkj(dTarget);
  if (!targetElement) {
    console.error(`Element with id '${dTarget}' not found.`);
    return;
  }
  targetElement.innerHTML = str;
  targetElement.selID = null;

  // Add an event listener to the newly created list
  jkj(lname + "_ctrl").addEventListener("click", function (e) {
    // Check if the clicked element is a list item
    if (e.target.tagName === "LI") {
      // Log the ID of the clicked list item
      targetElement.select(e.target.id);
    }
  });

  jkj(lname + "_ctrl").addEventListener("mouseover", function (e) {
    // Check if the clicked element is a list item
    if (e.target.tagName === "LI") {
      // Log the ID of the clicked list item
      hoverCB && hoverCB(e.target.id, e.target);
    }
  });

  jkj(lname + "_ctrl").addEventListener("mouseout", function (e) {
    // Check if the clicked element is a list item
    if (e.target.tagName === "LI") {
      // Log the ID of the clicked list item
      leaveCB && leaveCB(e.target.id, e.target);
    }
  });

  targetElement.select = function (id, notCB) {
    if (!id) return;
    if (this.selID) {
      // there is no need to update the selection if it's already selected
      if (this.selID === id) return;
      jkj(this.selID).classList.remove(lClass + "-item-selected");
    }
    if (!jkj(id)) return;
    jkj(id).classList.add(lClass + "-item-selected");
    this.selID = id;
    // Execute the callback function, if provided, with the ID of the clicked item
    !notCB && cb && cb(id);
  };

  targetElement.highlight = function (id) {
    const myclass = lClass + "-item-hover";
    const hovered = jkj(id);
    if (!hovered) return;
    let active = hovered.classList.contains(myclass);
    if (active) {
      hovered.classList.remove(myclass);
    } else {
      hovered.classList.add(myclass);
    }
  };

  targetElement.select(selID);
  console.timeEnd(dTarget + "_listDrawing");
  return targetElement;
};

export default list;
