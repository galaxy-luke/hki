const fs = require('fs');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // handle redirect
                download(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function run() {
    try {
        console.log("Starting downloads...");
        // Swiper
        await download("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css", "plugins/swiper/swiper-bundle.min.css");
        await download("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js", "plugins/swiper/swiper-bundle.min.js");

        // FontAwesome
        await download("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css", "plugins/fontawesome/css/all.min.css");
        await download("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2", "plugins/fontawesome/webfonts/fa-solid-900.woff2");
        await download("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2", "plugins/fontawesome/webfonts/fa-brands-400.woff2");
        await download("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2", "plugins/fontawesome/webfonts/fa-regular-400.woff2");

        // Bootstrap Icons
        await download("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css", "plugins/bootstrap-icons/bootstrap-icons.min.css");
        await download("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2", "plugins/bootstrap-icons/fonts/bootstrap-icons.woff2");
        await download("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff", "plugins/bootstrap-icons/fonts/bootstrap-icons.woff");

        // Noto Fonts CSS (we'll fetch actual woff2s inside it in a separate step or modify it)
        const fontCssRes = await fetch("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;500;600;700&display=swap");
        let fontCss = await fontCssRes.text();

        fs.writeFileSync("plugins/fonts/fonts.css", fontCss);
        console.log("Downloads completed!");
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
