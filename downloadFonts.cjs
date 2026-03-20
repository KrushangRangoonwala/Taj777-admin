const fs = require('fs');
const path = require('path');
const https = require('https');

const stylesDir = path.join(__dirname, 'src', 'styles');
const fontsDir = path.join(__dirname, 'src', 'fonts');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const cssFiles = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));
const fontUrls = new Set();
const baseUrl = 'https://wver.sprintstaticdata.com/v207/static/admin/fonts/';

// Extract all font URLs
cssFiles.forEach(file => {
    const content = fs.readFileSync(path.join(stylesDir, file), 'utf8');
    const matches = content.match(/url\(['"]?\.\.\/fonts\/([^'"?#)]+)(?:[?#][^'"]*)?['"]?\)/g);
    if (matches) {
        matches.forEach(match => {
            const fontNameMatch = match.match(/url\(['"]?\.\.\/fonts\/([^'"?#)]+)/);
            if (fontNameMatch && fontNameMatch[1]) {
                fontUrls.add(fontNameMatch[1]);
            }
        });
    }
});

console.log('Found fonts:', Array.from(fontUrls));

// Download fonts using native fetch
async function download(url, dest) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch '${url}': ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
}

(async () => {
    let successCount = 0;
    for (const font of fontUrls) {
        const fontUrl = baseUrl + font;
        const dest = path.join(fontsDir, font);
        try {
            console.log(`Downloading ${font} ...`);
            await download(fontUrl, dest);
            successCount++;
        } catch (e) {
            console.error(`Error downloading ${font}: ${e.message}`);
        }
    }
    console.log(`Successfully downloaded ${successCount} of ${fontUrls.size} fonts.`);
})();
