import { readSnapshot, cloneObjWithoutProps } from "./snapshot.js";
import getSLD from "./slides/slide.js";
import common from "./common.js";
import { Tapestry } from "./logic/tapestry.js";
import { jkj } from "./jkj.js";
import ds_solver from "./design_system.js";
import projectBrowser from "./components/project_browser.js";
import * as _c from "./css_utils.js";

console.log("APP", Date.now());

common.snp = {};
common.currentSlide = null;
common.currentActor = null;
common.defaults = {
  mediaURL: "https://lib.jeekjee.net/media/ui_icons/tools_media_black@3x.png",
};
common.tps = new Tapestry();

// Initialize threads on the Tapestry
common.tps.add("project");
common.tps.add("projectID");
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
  common.tps.hook("projectID", (value) => {
    console.log(value);
    common.createdPages = {};
    _c.initStyleSheet();
    readSnapshot(common.snpPath[value].snapshot, (data) => {
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
  projectBrowser();
};

main();
