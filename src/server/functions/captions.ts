export const getXMLCaptions = async (url: string) => {
  const data = await fetch(url)
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"));
  //console.log("captions:", data);
};
