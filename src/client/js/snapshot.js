import common from "./common.js";

/**
 * Reads a snapshot file from a given URL
 * @param {string} snp - The URL of the snapshot file to load
 * @param {Function} cb - An optional callback that is called with the parsed JSON data
 * Fetches the snapshot file from the given URL
 * Handles loading status with console.time/timeEnd
 * Throws errors for non-200 responses and other fetch errors
 * Parses the response as JSON
 * Returns the JSON data to the callback if provided
 */
export const readSnapshot = (snp, cb) => {
  console.time("loadingSnp");
  fetch(snp)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((jsonData) => {
      console.timeEnd("loadingSnp");
      return cb && cb(jsonData);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
};

/**
 * Creates a shallow clone of the given object, excluding any properties
 * whose keys exist in the given array of excluded properties.
 *
 * @param {Object} obj - The object to clone
 * @param {string[]} excludedProps - Array of property names to exclude from the cloned object
 * @returns {Object} A shallow clone of the object excluding the given properties
 */
export const cloneObjWithoutProps = (obj, excludedProps) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !excludedProps.includes(key))
  );
};

/**
 * Finds slide dependencies by traversing the slide actions and elements.
 *
 * @param {string} id - The slide ID
 * @param {Object} actors - Accumulator object for dependencies
 * @returns {Object} - Updated dependencies object
 */
export const findSldDependencies = (id, actors = {}) => {
  // Let's iterate thru the actions of the slide
  if (id in actors) return actors;
  if (common.snp[id].ac)
    actors = findDependenciesInActions(common.snp[id].ac, actors);
  Object.entries(common.snp[id].a).forEach(([key, value]) => {
    let element = value;
    if (element.tI === 10 && element.i && element.i.s) {
      actors[element.i.s] = { src: "includeActor" };
      //console.log("INCLUDE ACTOR ->", common.snp[element.i.s].d);
    }
    if (element.ac) {
      actors = findDependenciesInActions(element.ac, actors);
    }
  });

  //Let's deepClone actors to look for new actions or dependencies in them
  const cActors = JSON.parse(JSON.stringify(actors));
  Object.keys(cActors).forEach((key) => {
    actors = findSldDependencies(key, actors);
  });

  return actors;
};

/**
 * Recursively searches through the given actions object to find references
 * to slide IDs and other values, adding them to the dependencies accumulator
 * object.
 *
 * @param {Object} ac - The actions object to search through
 * @param {Object} depen - Accumulator object for found dependencies
 * @returns {Object} - The updated dependencies object
 */
// Also we have to look into the variables to locate link to objects
const findDependenciesInActions = (ac, depen) => {
  //console.log("Actions:", ac);
  Object.entries(ac).forEach(([key, value]) => {
    // first level are triggers
    if ((value.a = 1)) {
      //console.log(value.trigger);
      Object.entries(value.fn).forEach(([fn, action]) => {
        findActionWithValues(
          action,
          { repeat: "layout", include: "slide", popUp: "slide" },
          depen
        );
      });
    }
  });
  return depen;
};

/**
 * Recursively searches through the actions and branches of the given action object to find references to slide IDs and other values.
 *
 * @param {Object} action - The action object to search through
 * @param {Object} actionID - An object mapping action names to expected value names to search for
 * @param {Object} depen - Accumulator object for found dependencies to add to
 */
const findActionWithValues = (action, actionID, depen) => {
  // only in active actions | a=1
  if (action.a == 1) {
    //console.log(action.name, "<-->");
    if (action.name in actionID) {
      // If found
      const found = action.options[actionID[action.name]];

      /*     console.log(
          "*** FOUND ",
          action.name,
          " -> ",
          actionID[action.name],
          " ",
          found
        ); */

      if (found.indexOf("$") == -1) {
        depen[found] = { src: action.name };
      }
    } else if (action.options.branches) {
      // Let's look into the branches
      /*      console.log(
          "Looking into action [",
          action.name + "] branches",
          action.options.branches
        ); */
      Object.entries(action.options.branches).forEach(([fn, bFunc]) => {
        //console.log(bFunc.name);
        Object.entries(bFunc.fn).forEach(([brn, bAction]) => {
          // console.log(bAction);
          findActionWithValues(bAction, actionID, depen);
        });
      });
    }
  }
};

/**
 * Recursively clones a JavaScript object, handling nested objects, arrays,
 * functions, dates and other object types.
 *
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep clone of the input object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  let temp = obj.constructor(); // give temp the original obj's constructor
  for (let key in obj) {
    temp[key] = deepClone(obj[key]);
  }

  return temp;
}
