const GCS_URL = "https://storage.googleapis.com/video_carousel";
let COUNT = 0;

if (COUNT === 0) {
  const audio = document.getElementById("audio");
  audio.src = `${GCS_URL}/category_a/audios/audio_1.mp3`;
}

function navigateMedia() {
  const urlCount = COUNT % 5;
  const mediaCount =
    urlCount === 0 && COUNT > 5
      ? 5
      : urlCount === 0 && COUNT < 5
      ? 1
      : urlCount;
  if (COUNT <= 5) {
    return {
      url: GCS_URL + `/category_a/audios/audio_${mediaCount}.mp3`,
      type: "audio",
      title: `Audio ${mediaCount}`,
      category: "category_a",
    };
  } else if (COUNT > 5 && COUNT <= 10) {
    return {
      url: GCS_URL + `/category_a/videos/video_${mediaCount}.mp4`,
      type: "video",
      title: `Video ${mediaCount}`,
      category: "category_a",
    };
  } else if (COUNT > 10 && COUNT <= 15) {
    return {
      url: GCS_URL + `/category_b/audios/audio_${mediaCount}.mp3`,
      type: "audio",
      title: `Audio ${mediaCount}`,
      category: "category_b",
    };
  } else if (COUNT > 15 && COUNT <= 20) {
    return {
      url: GCS_URL + `/category_b/videos/video_${mediaCount}.mp4`,
      type: "video",
      title: `Video ${mediaCount}`,
      category: "category_b",
    };
  } else if (COUNT > 20 && COUNT <= 25) {
    return {
      url: GCS_URL + `/category_c/audios/audio_${mediaCount}.mp3`,
      type: "audio",
      title: `Audio ${mediaCount}`,
      category: "category_c",
    };
  } else if (COUNT > 25 && COUNT <= 30) {
    return {
      url: GCS_URL + `/category_c/videos/video_${mediaCount}.mp4`,
      type: "video",
      title: `Video ${mediaCount}`,
      category: "category_c",
    };
  }
}

function assignMedia() {
  const { url, type, title, category } = navigateMedia();
  const audio = document.getElementById("audio");
  const video = document.getElementById("video");

  console.log("url", url);
  console.log("count", COUNT);
  document.getElementById("title").innerHTML = title;
  let queryParams = new URL(location.href);
  queryParams.searchParams.set("category", category);
  history.pushState(null, "", queryParams);

  if (type === "video") {
    document.getElementById("audio").classList.add("hide");
    document.getElementById("video").classList.remove("hide");
    video.src = url;
    audio.pause();
    video.play();
  } else {
    document.getElementById("video").classList.add("hide");
    document.getElementById("audio").classList.remove("hide");
    audio.src = url;
    audio.play();
    video.pause();
  }
}

function nextMedia() {
  COUNT += 1;
  assignMedia();
}

function previousMedia() {
  if (COUNT > 0) {
    COUNT -= 1;
    assignMedia();
  }
}
