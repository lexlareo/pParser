import * as _u from "../sys_utils.js";
import * as _c from "../css_utils.js";

const groupActor = (element, eclass, actor) => {
  let gro = actor.gro;
  switch (gro.tI) {
    case 1:
      if (gro.magic) {
        /* 
        console.log("Group actor", actor.d);
        console.log(actor.gro); */

        /* 
        Cody, just so you know the gro propertes are:
        {
            "tI": 1, // this is the type of group. It could be 0 - classical group, 1 - frame (div behavior)
            "magic": true, // We are using autolayout (flex)
            "al": 2, // align-items -> 1 - row (horizontal), 2-column (vertical)
            "w": 0,
            "ph": 10, // horizontal padding
            "sp": 8, // gap. In our interpretation we will add margin-top to the inner elements
            "pv": 10 // vertical padding
        }
        */
        const css = [];
        // Add flex container styles
        css.push(`display: flex;`);
        css.push(`flex-direction: ${gro.al == 1 ? "row" : "column"};`);
        css.push(`height: auto;`);
        /**
         * Adds padding styles to the CSS if the vertical or horizontal
         * padding values are set in the group properties. Checks if the
         * vertical and horizontal padding values are not 0, and adds padding
         * style with values from the group properties converted to pixels.
         */
        if ((gro.pv && gro.pv != 0) || (gro.ph && gro.ph != 0)) {
          css.push(
            `padding: ${gro.pv != 0 ? _c.px(gro.pv) : ""} ${
              gro.ph != 0 ? _c.px(gro.ph) : ""
            };`
          );
        }

        // Add margin-top to inner elements
        let grRule = null;
        // if (gro.sp && gro.sp != 0) { ${sets.pos}:auto;
        let sets = { margin: "bottom", pos: "top" };
        if (gro.al == 1) sets = { margin: "right", pos: "left" };
        grRule = `.ac_autolayout_${eclass}> * {
          position:relative;
          margin-${sets.margin}: ${_c.px(gro.sp)};
          left:auto;
          top:auto;
        }`;
        //}
        // console.log(css);
        return { gr: css.join("\n"), grRule: grRule };
      }

      break;
  }
  return null;
};

export default groupActor;
