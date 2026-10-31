import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/data',{recursive:true});
for(const file of ['index.html','style.css','app.js']) await copyFile(`src/${file}`,`dist/${file}`);
await copyFile('data/venues.json','dist/data/venues.json');
console.log('Rakennettu: dist/');
