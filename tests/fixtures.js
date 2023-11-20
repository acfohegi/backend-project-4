import { readFile } from "fs/promises";
import { getFixturePath } from "./helpers";

const html = await readFile(getFixturePath('ru-hexlet-io-courses.html'));
const image = await readFile(getFixturePath('nodejs.png'));
const css = await readFile(getFixturePath('application.css'));
const script = await readFile(getFixturePath('runtime.js'));

export { html, image, css, script };
