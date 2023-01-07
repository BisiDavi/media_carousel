// used for accessing the GCS JSON API.
const GCS_BASE_URL = "https://www.googleapis.com/storage/v1";
let COUNT = 0;
const BUCKET_ID = "media_carousel";
const GCS_API_KEY = "AIzaSyBJqLVXZ1urMse68Dx--rz1cGU8CD_w3Gc";

const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

/**
 * Forms a URL to the GCS JSON API given a path and an optional list of query
 * parameters to include.
 */
function make_gcs_url(path, params) {
  let query_string = "?key=" + GCS_API_KEY;
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
  const metadata_url = make_gcs_url("/b/" + BUCKET_ID + "/o/", {
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
  const searchUrl = window.location.search;
  const splitUrl = searchUrl && searchUrl.split("&");
  const category = searchUrl && splitUrl[0].split("?category=")[1];
  const contentType =
    searchUrl &&
    searchUrl.includes("content_type=") &&
    splitUrl[1].split("content_type=")[1];
  const urlMediaType =
    contentType === "audios" ? "audio" : contentType === "videos" && "video";

  if (contentType) {
    const media = mediaArray.filter((item) => item.name.includes(urlMediaType));
    const mediaByCategory = media.filter((item) => item.category === category);
    if (type === "next") {
      COUNT += 1;
    } else if (type === "previous") {
      COUNT -= 1;
    } else {
      COUNT = 0;
    }
    const selectedMediaBasedOnType = mediaByCategory[COUNT];
    assignMedia(selectedMediaBasedOnType);
    controlButtonStyle(mediaByCategory.length);
  } else {
    const mediaByCategory = mediaArray.filter(
      (item) => item.category === category
    );
    if (type === "next") {
      COUNT += 1;
    } else if (type === "previous") {
      COUNT -= 1;
    } else {
      COUNT = 0;
    }
    const selectedMedia = mediaByCategory[COUNT];
    assignMedia(selectedMedia);
    controlButtonStyle(mediaByCategory.length);
  }
}

const data = fetchData();

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
    const currentSearchUrl = window.location.search;
    if (!currentSearchUrl) {
      const { type, category } = result[0];
      let queryParams = new URL(location.href);
      const mediaType = type.includes("audio") ? "audios" : "videos";
      queryParams.searchParams.set("category", category);
      queryParams.searchParams.set("content_type", mediaType);
      history.pushState(null, "", queryParams);
    }
    mediaNavigation(result);
  });
}
