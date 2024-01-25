import { readSnapshot } from "./snapshot.js";
import getSLD from "./slides/slide.js";
import common from "./common.js";
import { Tapestry } from "./logic/tapestry.js";

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
common.tps.add("currentSlide");
common.tps.add("currentActor");
common.tps.add("lastActor");
common.tps.add("highlightedActor");

const main = () => {
  // Hook to load snapshot when snpPath changes
  common.tps.hook("snpPath", (value) => {
    readSnapshot(value, (data) => {
      console.log(data);
      if (data.p) {
        common.snp = data.p.sld;
      } else if (data.sld) {
        common.snp = data.sld;
      }
      common.tps.clearHooks("currentSlide");
      getSLD();
    });
  });

  // Update the snpPath thread
  common.tps.set("snpPath", snpPath[2]);
  console.log(common);
};

main();
