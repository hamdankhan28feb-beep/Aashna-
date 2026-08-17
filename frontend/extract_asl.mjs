import fs from 'fs';
import path from 'path';

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const dir = "d:/Aashna-/frontend/public/asl";

for (const letter of letters) {
    const letterDir = path.join(dir, letter);
    if (fs.existsSync(letterDir)) {
        const files = fs.readdirSync(letterDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
        if (files.length > 0) {
            const firstFile = files[0];
            const srcPath = path.join(letterDir, firstFile);
            // Save as uppercase letter.jpg
            const destPath = path.join(dir, `${letter.toUpperCase()}.jpg`);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${letter} -> ${destPath}`);
        }
    }
}
