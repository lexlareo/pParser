import { jkj } from "../jkj.js";
import list from "../components/list.js";
import drawSlide from "../sld.js";
import common from "../common.js";
import { findSldDependencies } from "../snapshot.js";
import echoJSON from "../panels/json.js";

const getSLD = () => {
  // Hook the currentSlide to update the UI
  common.tps.hook("currentSlide", (value, sldList) => {
    console.time("processingSNP");
    if (jkj("sld_list")) {
      let actors = findSldDependencies(value);
      jkj("sld_list").highlightDependecies(actors);
    }
    actorsList();
    console.timeEnd("processingSNP");
  });

  // Let's clear the hooks for currentActor so they are not accumulated
  common.tps.clearHooks("currentActor");
  // Hook the currentActor to update the UI
  common.tps.hook("currentActor", (value) => {
    // Turn off last actor
    let lastActor = common.tps.get("lastActor");
    if (lastActor) {
      // Turn off current highlight
      common.tps.set("highlightedActor", lastActor);
      // Turn off current selected state
      const element = document.querySelector(`[data-id="${lastActor}"]`);
      if (element) element.select(false);
    }

    // Turn on selcted actor
    const element = document.querySelector(`[data-id="${value}"]`);
    // Do the selection, both on the list and on the canvas
    if (element) element.select(true);
    jkj("actor_list").select(value, true); // Select on list without runing the CallBack

    // display the JSON for the selected actor
    const sldID = common.tps.get("currentSlide");
    echoJSON(common.snp[sldID].a[value], "actor");

    // Save currentActor as lastActor so we can use it after updating the value of currentActor
    common.tps.set("lastActor", value);
  });

  // Hook the highlighted to update the UI
  common.tps.hook("highlightedActor", (value) => {
    jkj("actor_list").highlight(value);
    const element = document.querySelector(`[data-id="${value}"]`);
    if (element) element.highlight();
  });

  // create the list of slides
  const sldList = list(
    common.snp,
    { key: "id", label: "d", srt: "cOn" },
    null,
    "sld_list",
    "slides",
    "sld-list",
    (id) => {
      common.tps.set("currentSlide", id);
    }
  );

  //let's add specific behavior to the list
  sldList.highlightDependecies = function (dList) {
    if (this.dependencies && Object.keys(this.dependencies).length) {
      Object.entries(this.dependencies).forEach(([key, value]) => {
        jkj(key).classList.remove("dependency");
        jkj(key).classList.remove("d-" + value.src);
      });
    }
    this.dependencies = {};
    if (Object.keys(dList).length == 0) return;
    Object.entries(dList).forEach(([key, value]) => {
      jkj(key).classList.add("dependency");
      jkj(key).classList.add("d-" + value.src);
      this.dependencies[key] = value;
    });
    console.log(dList);
  };
  sldList.select(Object.keys(common.snp)[0]);
};

const actorsList = () => {
  const sldID = common.tps.get("currentSlide");
  drawSlide(common.snp[sldID]);

  // Create the actors list
  const actorList = list(
    common.snp[sldID].a,
    { key: "id", label: "d", icn: null, srt: "srt", dir: "desc" }, //"view_column"
    null,
    "actor_list",
    "actors",
    "sld-list",
    //click event
    (id) => {
      common.tps.set("currentActor", id);
    },
    //hover event
    (id) => {
      // Highlight the selected actor
      common.tps.set("highlightedActor", id);
    },
    //unhover event
    (id) => {
      // Highlight the selected actor
      common.tps.set("highlightedActor", id);
    }
  );
  actorList.select(Object.keys(common.snp[sldID].a)[0]);
};

export default getSLD;
