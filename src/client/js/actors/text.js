import * as _u from "../sys_utils.js";
import * as _c from "../css_utils.js";
import common from "../common.js";

const textActor = (target, actor) => {
  // first load the text, we will not take into account the variables now
  target.innerHTML = actor.dc.lang_0;

  // let's start building the css
  let css = [];
  let tP = actor.t;
  let bcorr = actor.b && actor.b.a == 1 ? actor.b.w : 0;

  // add the lookup array for text-align
  const textAlign = ["left", "center", "right", "justify"];
  const textTransform = ["none", "uppercase", "lowercase", "capitalize"];

  css.push(`font-size: ${_c.px(tP.s)};`); // s is size
  css.push(`text-align: ${textAlign[tP.a]};`); // a is align

  // m  is the way the box model behaves: 1- fixed width & height 2- width: auto 3- height: auto width: fixed
  switch (tP.m) {
    case 1:
      css.push(`display: inline-block;`);
      break;
    case 2:
      //css.push(`white-space: nowrap;`);
      css.push(`width: auto;`);
      css.push(`height: auto;`);
      break;
    case 3:
      css.push(`display: block;`);
      css.push(`height: auto;`);
      break;
  }
  // v is the font-weight, but we have to yet import the font definition
  if (tP.t > -1) css.push(`text-transform: ${textTransform[tP.t]};`); // t is text transform
  if (tP.l) css.push(`line-height: ${_c.px(tP.l)};`); // l is line Height
  css.push(`color: ${_c.cssColor({ a: 1, c: tP.c }, true)};`); // c is color

  if (tP.el) {
    // el is the ellipsis value
    css.push(`text-overflow: ellipsis;`);
    css.push(`white-space: nowrap;`);
  }
  // p is the padding
  if (tP.p) {
    if (tP.p.v) {
      css.push(`padding: ${_c.px(tP.p.v * 1 - bcorr * 2)};`);
    } else {
      if (tP.p.t != 0)
        css.push(`padding-top: ${tP.p.t - bcorr}${tP.p.format};`);
      if (tP.p.r != 0) css.push(`padding-right: ${tP.p.r}${tP.p.format};`);
      if (tP.p.b != 0)
        css.push(`padding-bottom: ${tP.p.b - bcorr}${tP.p.format};`);
      if (tP.p.l != 0) css.push(`padding-left: ${tP.p.l}${tP.p.format};`);
    }
  }

  //console.log(actor.dc.lang_0, css, target);
  return css.join("\n");
};

export default textActor;
