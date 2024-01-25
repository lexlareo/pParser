import { readSnapshot, cloneObjWithoutProps } from "./snapshot.js";
import getSLD from "./slides/slide.js";
import common from "./common.js";
import { Tapestry } from "./logic/tapestry.js";
import { jkj } from "./jkj.js";
import ds_solver from "./design_system.js";

console.log("APP", Date.now());

const snpPath = [
  "snapshots/snapshot_knotpoint_app.json",
  "snapshots/snapshot_bbm.json",
  "snapshots/snapshot_stellar.json",
];
common.snp = {};
common.snpPath = snpPath;
common.currentSlide = null;
common.currentActor = null;
common.tps = new Tapestry();

// Initialize threads on the Tapestry
common.tps.add("snpPath");
common.tps.add("project");
common.tps.add("currentSlide");
common.tps.add("currentActor");
common.tps.add("lastActor");
common.tps.add("highlightedActor");

const main = () => {
  //  Hook project
  common.tps.hook(
    "project",
    (value) => {
      document.querySelector(".app-title").innerText = value.name;
      common.ds = ds_solver();
    },
    null,
    "projectHook"
  );

  // Hook to load snapshot when snpPath changes
  common.tps.hook("snpPath", (value) => {
    readSnapshot(value, (data) => {
      console.log(data);
      if (data.p) {
        common.snp = data.p.sld;
        let proj = cloneObjWithoutProps(data, ["p"]);
        common.tps.set("project", proj);
      } else if (data.sld) {
        common.snp = data.sld;
      }
      common.tps.clearHooks("currentSlide");
      getSLD();
      console.log(common);
    });
  });

  // Update the snpPath thread
  common.tps.set("snpPath", snpPath[0]);
};

main();
