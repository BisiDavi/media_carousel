$(function () {
  // used for accessing the GCS JSON API.
  const GCS_BASE_URL = "https://www.googleapis.com/storage/v1";

  let metadata_xhr = null;

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

  function fetch_data() {
    let metadata_url;
    if (metadata_xhr !== null) {
      metadata_xhr.abort();
    }
    metadata_url = make_gcs_url("/b/" + GCS_BUCKET + "/o/", { alt: "json" });
    metadata_xhr = $.ajax({
      url: metadata_url,
      dataType: "json",
      success: function (data) {
        const mediaFiles = data.items.filter(
          (item) => item.contentType !== "text/plain"
        );
        let dataArray = [];
        mediaFiles.map((item) => {
          const name = item.name.includes("audios")
            ? item.name.split("/audios/")[1]
            : item.name.split("/videos/")[1];
          const category = item.name.includes("audios")
            ? item.name.split("/audios/")[0]
            : item.name.split("/videos/")[0];
          const itemId = item.id.split(`/${item.generation}`)[0];
          const itemUrl = `https://storage.googleapis.com/${itemId}`;
          dataArray.push({
            name,
            category,
            itemUrl,
            contentType: item.contentType,
            bucket: item.bucket,
          });
        });
        console.log("dataArray", dataArray);
      },
    });
  }

  fetch_data();
});
