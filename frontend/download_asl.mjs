import fs from 'fs';
import https from 'https';
import path from 'path';

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const dir = "d:/Aashna-/frontend/public/asl";

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  for (const letter of letters) {
    const fileName = `Sign_language_${letter}.svg`;
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=url&format=json`;
    
    try {
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Aashna-AI-App/1.0 (contact@aashna.ai)'
        }
      });
      const data = await res.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === "-1") {
          console.error(`File not found for ${letter}`);
          continue;
      }
      
      const imageUrl = pages[pageId].imageinfo[0].url;
      
      const file = fs.createWriteStream(path.join(dir, `${letter}.svg`));
      
      const options = {
          headers: { 'User-Agent': 'Aashna-AI-App/1.0' }
      };
      
      https.get(imageUrl, options, (response) => {
        response.pipe(file);
      });
      console.log(`Downloaded ${letter}.svg`);
    } catch (e) {
      console.error(`Failed ${letter}`, e.message);
    }
  }
}
download();
