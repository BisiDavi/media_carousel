// used for accessing the GCS JSON API.
const GCS_BASE_URL = "https://www.googleapis.com/storage/v1";
let COUNT = 0;
const searchUrl = window.location.search;
const splitUrl = searchUrl.split("&");
const categoryType = splitUrl[0].split("?category=")[1];
const contentType = splitUrl[1].split("content_type=")[1];
const mediaType = contentType === "audios" ? "audio" : "video";
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

/**
 * Forms a URL to the GCS JSON API given a path and an optional list of query
 * parameters to include.
 */
function make_gcs_url(path, params) {
  let query_string = "?key=" + "AIzaSyBJqLVXZ1urMse68Dx--rz1cGU8CD_w3Gc";
  if (params != undefined) {
    for (prop in params) {
      query_string += "&" + prop + "=" + params[prop];
    }
  }
  return GCS_BASE_URL + path + query_string;
}

function formatData(data) {
  const dataArray = [];
  const mediaFiles = data.filter((item) => item.contentType !== "text/plain");
  mediaFiles.map((item) => {
    const name = item.name.includes("audios")
      ? item.name.split("/audios/")[1]
      : item.name.split("/videos/")[1];
    const category = item.name.includes("audios")
      ? item.name.split("/audios/")[0]
      : item.name.split("/videos/")[0];
    const itemId = item.id.split(`/${item.generation}`)[0];
    const url = `https://storage.googleapis.com/${itemId}`;
    dataArray.push({
      name,
      category,
      url,
      type: item.contentType,
      bucket: item.bucket,
    });
  });
  return dataArray;
}

function fetchData() {
  const metadata_url = make_gcs_url("/b/" + "media_carousel" + "/o/", {
    alt: "json",
  });
  return $.ajax({
    url: metadata_url,
    dataType: "json",
  });
}

function assignMedia(media) {
  const { url, type, category } = media;
  const audio = document.getElementById("audio");
  const video = document.getElementById("video");
  const mediaType = type.includes("audio") ? "audios" : "videos";

  let queryParams = new URL(location.href);
  queryParams.searchParams.set("category", category);
  queryParams.searchParams.set("content_type", mediaType);
  history.pushState(null, "", queryParams);

  if (type.includes("video")) {
    document.getElementById("slider").classList.add("video");
    document.getElementById("slider").classList.remove("audio");
    document.getElementById("audio").classList.add("hide");
    document.getElementById("video").classList.remove("hide");

    video.src = url;
    audio.pause();
    video.play();
  } else {
    document.getElementById("slider").classList.remove("video");
    document.getElementById("slider").classList.add("audio");
    document.getElementById("video").classList.add("hide");
    document.getElementById("audio").classList.remove("hide");

    audio.src = url;
    audio.play();
    video.pause();
  }
}

const data = fetchData();

function controlButtonStyle(maxLength) {
  if (COUNT === 0) {
    prevButton.disabled = true;
  } else if (COUNT === Number(maxLength - 1)) {
    nextButton.disabled = true;
  } else if (COUNT < Number(maxLength - 1)) {
    nextButton.disabled = false;
  } else if (COUNT > 0) {
    prevButton.disabled = false;
  }
}

function mediaNavigation(mediaArray, type) {
  if (contentType) {
    const media = mediaArray.filter((item) => item.name.includes(mediaType));
    if (type === "next") {
      COUNT += 1;
    } else if (type === "previous") {
      COUNT -= 1;
    } else {
      COUNT = 0;
    }
    const selectedMediaBasedOnType = media[COUNT];
    assignMedia(selectedMediaBasedOnType);
    controlButtonStyle(media.length);
  } else {
    if (type === "next") {
      COUNT += 1;
    } else if (type === "previous") {
      COUNT -= 1;
    } else {
      COUNT = 0;
    }
    const selectedMedia = mediaArray[COUNT];
    assignMedia(selectedMedia);
    controlButtonStyle(media.length);
  }
}

async function previousMedia() {
  prevButton.disabled = false;
  const dataResult = await data;
  const result = formatData(dataResult.items);
  mediaNavigation(result, "previous");
}

async function nextMedia() {
  prevButton.disabled = false;
  const dataResult = await data;
  const result = formatData(dataResult.items);
  mediaNavigation(result, "next");
}

if (COUNT === 0) {
  data.then((response) => {
    const result = formatData(response.items);
    mediaNavigation(result);
  });
}
