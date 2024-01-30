import * as _u from "../sys_utils.js";
import * as _c from "../css_utils.js";
import common from "../common.js";

/*
    Just for reference the common.ds.media obj can have this properties:
    {
        "c": { // more dominant colors (patched) extracted from the image
            "0": "#000000ff"
        },
        "ex": 4, // TBD looking into the original code
        "h": 164, // height in px
        "id": "ITa7WpfeeP9sD1Ao", // id (name used internally when the file was saved)
        "r": 5.7073170731707314,
        "re": 1, // TBD looking into the original code
        "s": 41260, // size in bytes
        "sz": { // different sizes saved when the media file was uploaded. Not applicable for uploaded videos
            "small": 90,
            "medium": 800,
            "high": 1024
        },
        "u": "image.png", // name of the original file (or url)
        "w": 936, // width size
        "f": "png",// file extension
        "e":{ This property is only present when the media object is a video
            "poster": "sZNGbGtGARAczLKZ.jpg",
            "duration": "00:00:22.80",
            "space": 0,
            "size": "bt709)"
        }
    }

    These are the properties of the f(media) property of the actor
     "f": {
        "ap": 0, // autoplay [video]
        "c": 1, // cover (1) or contain (0)
        "co": 0, // display controls [video]
        "lo": 0, // loop [video]
        "mu": 0, // mute [video]
        "pv": 1, //controls the aligment (vertical) of the media object if in cover mode 0: top, 1: middle, 2: bottom
        "ph": 1, //controls the aligment (horizontal) of the media object if in cover mode 0:left, 1:center, 2:right
        "po": 0, // poster [video]
        "pu": 0,
        "r": 0,
        "rs": [
            0,
            0
        ],
        "s": "100%",
        "ty": 0,
        "u": "media_3"
    },

    			    backgroundRepeat: 'no-repeat',
				    backgroundSize: that.virtualPointer.f.c ? 'cover' : 'contain',
				    backgroundPosition: 'center center',


*/

/**
 * Checks if a given media name or URL is a video
 * @param {string} nmed - The name or URL of the media to check
 * @returns {boolean} True if the media is a video, false otherwise
 */
function isVideo(nmed) {
  var isvid = false;
  if (!nmed) return false;
  if (
    nmed.indexOf(".mp4") !== -1 ||
    ((nmed.indexOf("http://") === 0 || nmed.indexOf("https://") === 0) &&
      (nmed.indexOf("vimeo") !== -1 ||
        nmed.indexOf("youtube") !== -1 ||
        nmed.indexOf("youtu.be") !== -1))
  )
    isvid = true;

  return isvid;
}

const mediaActor = (target, actor) => {
  let mda = actor.f;
  let css = [];
  let url;
  if (mda) {
    if (!mda.svg) {
      //console.log("Rendering media actor", mda.u);
      //image url: background-image: url("https://ftp.persp.info/projects/P1643524595831/media/d5rGM8q14iMVoPgB_800.png")
      if (mda.u.indexOf("media_") == 0) {
        //console.log(common.ds.media);
        let isvid = mda.e;
        if (common.ds.media[mda.u]) {
          // console.log("Media is in library", common.ds.media[mda.u]);
          let folder = common.snpPath[common.tps.get("projectID")].mediaFolder;
          url = `https://ftp.persp.info/projects/${folder}/media/${
            common.ds.media[mda.u].id
          }${!common.ds.media[mda.u].e ? "_800" : ""}.${
            common.ds.media[mda.u].f
          }`;
          //console.log("Media url", url);
        } else {
          //console.log("Media not found in library", mda.u);
          url = common.defaults.mediaURL;
        }
      } else {
        url = mda.u;
      }
      // shape the media div in the actor. If it is a media, we should place it like a background image,
      // with no-repeat and position center center

      if (isVideo(url)) {
        css.push(`
          position: relative;
          width: 100%;
          height: 100%;
        `);
        /* 
        let video = `
          <video
            src="${url}"
            style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            "
            ${mda.ap ? 'autoplay' : ''}
            ${mda.co ? 'controls' : ''}
            ${mda.lo ? 'loop' : ''}
            ${mda.mu ? 'muted' : ''}
          ></video>
        `; */
        // Append video element
        let video = document.createElement("video");
        video.src = url;
        video.autoplay = mda.ap;
        video.controls = mda.co;
        video.loop = mda.lo;
        video.muted = mda.mu;
        // Append video element to target
        target.appendChild(video);
      } else {
        css.push(`background-image: url("${url}");`);
      }

      // Render media element
      css.push(`background-image: url("${url}");`);
      // Set styles
      css.push(`background-repeat: no-repeat;`);
      css.push(`background-size: ${mda.c ? "cover" : "contain"};`);
      css.push(`background-position: center center;`);
      //console.log("Drawing media", css);
      return css.join("\n");
    }
  }
  return "";
};

export default mediaActor;
