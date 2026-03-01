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

async function fetchFonts() {
    let cssContent = fs.readFileSync('plugins/fonts/fonts.css', 'utf8');
    const regex = /url\((https:\/\/[^)]+)\)/g;
    let match;
    let downloads = [];

    // Create folders
    if (!fs.existsSync('plugins/fonts/files')) {
        fs.mkdirSync('plugins/fonts/files', { recursive: true });
    }

    let i = 0;
    while ((match = regex.exec(cssContent)) !== null) {
        let url = match[1];
        let filename = `font-${i++}.woff2`;
        let localPath = `plugins/fonts/files/${filename}`;

        console.log(`Downloading ${url} -> ${localPath}`);
        downloads.push(download(url, localPath));

        // Replace absolute URL with local relative path in the CSS
        cssContent = cssContent.replace(url, `files/${filename}`);
    }

    await Promise.all(downloads);
    fs.writeFileSync('plugins/fonts/fonts.css', cssContent);
    console.log("All fonts downloaded and fonts.css updated.");
}

fetchFonts();
