import { jkj } from "../jkj.js";

const echoJSON = (sldObj, otype) => {
  let filter = ["cBy", "cOn", "mBy", "mOn", "email", "lut", "_id", "jc", "ud"];
  switch (otype) {
    case "sld":
      filter.push("ste", "an", "ac"); // filter additional fields for sld
      break;
    case "actor":
      filter.push("ste", "an", "ac"); // filter additional fields for sld
      break;
  }
  jkj("pre.language-json").innerText = JSON.stringify(
    sldObj,
    (key, value) => {
      if (filter.includes(key)) return undefined;
      return value;
    },
    2
  );
};

export default echoJSON;
