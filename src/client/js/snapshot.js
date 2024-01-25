import common from "./common.js";

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
  console.log(cActors);
  Object.keys(cActors).forEach((key) => {
    console.log(key);
    actors = findSldDependencies(key, actors);
  });

  return actors;
};

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
