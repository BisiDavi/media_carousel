// used for accessing the GCS JSON API.
const GCS_BASE_URL = "https://www.googleapis.com/storage/v1";

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

function fetch_data() {
  const metadata_url = make_gcs_url("/b/" + "media_carousel" + "/o/", {
    alt: "json",
  });
  return $.ajax({
    url: metadata_url,
    dataType: "json",
  });
}

function assignMedia(media) {
  const { url, type, name, category } = media;
  const audio = document.getElementById("audio");
  const video = document.getElementById("video");

  document.getElementById("title").innerHTML = name;
  let queryParams = new URL(location.href);
  queryParams.searchParams.set("category", category);
  history.pushState(null, "", queryParams);

  if (type.includes("video")) {
    document.getElementById("slider").classList.add("video");
    document.getElementById("slider").classList.remove("audio");
    document.getElementById("audio").classList.add("hide");
    document.getElementById("video").classList.remove("hide");
    document.getElementById("videoTitle").innerHTML = name;

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

const data = fetch_data();

let COUNT = 0;

async function previousMedia() {
  if (COUNT > 0) {
    const dataResult = await data;
    const result = formatData(dataResult.items);
    COUNT -= 1;
    console.log("COUNT", COUNT);
    const media = result[COUNT];
    assignMedia(media);
  }
}

async function nextMedia() {
  const dataResult = await data;
  const result = formatData(dataResult.items);
  COUNT += 1;
  console.log("COUNT", COUNT);
  const media = result[COUNT];
  assignMedia(media);
}

if (COUNT === 0) {
  data.then((response) => {
    const result = formatData(response.items);
    const media = result[COUNT];
    assignMedia(media);
  });
}
