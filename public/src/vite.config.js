import viteCompression from "vite-plugin-compression"
// vite.config.js
/** @type {import('vite').UserConfig} */

export default {
    root: "../../public",
    plugins: [viteCompression({ filter: /\.(js|mjs|json|css|html)$/i, "deleteOriginFile": true })]
}