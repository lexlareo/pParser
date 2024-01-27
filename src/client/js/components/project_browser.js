import { jkj } from "../jkj.js";
import * as _u from "../sys_utils.js";
import common from "../common.js";

common.snpPath = {
  "6565d68db1bc9329bc3ede6e": {
    id: "6565d68db1bc9329bc3ede6e",
    label: "Knotpoint App",
    snapshot: "snapshots/snapshot_knotpoint_app.json",
    mediaFolder: "P1701172877086",
  },
  "657c9c2a54124a21489fe91b": {
    id: "657c9c2a54124a21489fe91b",
    label: "Datu Batuketa",
    snapshot: "snapshots/snapshot_bbm.json",
    mediaFolder: "P1647888489594",
  },
  "62514ed83cf516761f118fcb": {
    id: "62514ed83cf516761f118fcb",
    label: "Stellar",
    snapshot: "snapshots/snapshot_stellar.json",
    mediaFolder: "P1643524595831",
  },
};

const projectBrowser = () => {
  // Update the snpPath thread
  let browser = document.querySelector(".browser-area");

  Object.entries(common.snpPath).forEach(([key, proj]) => {
    let item = document.createElement("div");
    item.classList.add("browser-item");
    item.innerText = proj.label;
    item.id = proj.id;
    item.addEventListener("click", () => {
      browser.select(proj.id);
    });
    browser.appendChild(item);
  });

  browser.select = function (id) {
    const oldID = common.tps.get("projectID");
    if (oldID) {
      jkj(oldID).classList.remove("browser-item-selected");
    }
    jkj(id).classList.add("browser-item-selected");
    common.tps.set("projectID", id);
  };
  browser.select(Object.keys(common.snpPath)[0]);
};

export default projectBrowser;
