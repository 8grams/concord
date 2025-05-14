/**
 * Self-executing function to handle file uploads in Trix editor
 * This script converts uploaded files to base64 data URLs and inserts them as images
 */
(function () {
  /**
   * Converts a file to a base64 data URL
   * @param {File} file - The file object to convert
   * @returns {Promise<string>} Promise resolving to the base64 data URL
   */
  function asBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Event listener for file acceptance in Trix editor
   * Prevents the default file handling and inserts the file as an embedded image
   */
  document.addEventListener("trix-file-accept", function (event) {
    event.preventDefault();
    if (event.file) {
      asBase64(event.file)
        .then(function (data) {
          let image = document.createElement("img");
          image.src = data;
          let tmp = document.createElement("div");
          tmp.appendChild(image);
          let editor = document.querySelector("trix-editor");
          editor.editor.insertHTML(tmp.innerHTML);
        })
        .catch((e) => console.log(e));
    }
  });
})();
