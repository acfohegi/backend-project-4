import PageLoader from "./src/PageLoader.js";

const load = (url, output) => {
  const pl = new PageLoader(url, { output });
  return pl.load();
};

export default load;
