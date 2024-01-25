import common from "./common.js";

const ds_solver = () => {
  let project = common.tps.get("project");

  // media library
  const mediaLib = {};
  if (project.media) {
    Object.entries(project.media).forEach(([key, value]) => {
      if (Object.keys(value.v).length > 0) mediaLib[key] = value.v[value.av];
      //mediaLib[key].t = value.t;
    });
  }

  // design system
  if (!project.ex) return null;
  const colorLib = {};
  if (project.ex.colors) {
    // generate color palette from project colors
    Object.entries(project.ex.colors).forEach(([key, value]) => {
      if (
        value.cs.cs_0.h //&&
        // (value.pr == 1 || value.pr_l == 1 || value.ac == 1 || value.ac_l == 1)
      ) {
        colorLib[key] = {
          c: value.cs.cs_0.h,
          o: value.cs.cs_0.o ? value.cs.cs_0.o : 1,
          n: value.n,
        };
      }
    });
    // typography library
    /*     const typeLib = {};
    if (project.ex.typography) {
		Object.entries(project.ex.typography).forEach(([key, value]) => {
			typeLib[key] = {
				f: value.f,
				s: value.s,
				w: value.w
			};
		});
	} */

    return {
      media: mediaLib,
      colors: colorLib,
    };
  }
};

export default ds_solver;
