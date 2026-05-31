const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'sdgs');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadSDGs() {
  console.log('Starting SDG download...');
  for (let i = 1; i <= 17; i++) {
    const url = `https://open-sdg.github.io/sdg-translations/assets/img/goals/en/${i}.png`;
    const dest = path.join(dir, `sdg-${i}.png`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buffer));
      console.log(`Successfully downloaded SDG ${i} -> ${dest}`);
    } catch (error) {
      console.error(`Error downloading SDG ${i}:`, error);
    }
  }
  console.log('SDG download completed!');
}

downloadSDGs();
