import fs from 'fs';

const raw = fs.readFileSync('src/assets/json/fCafes.json', 'utf-8');
const rawData = JSON.parse(raw);

const filtered = rawData.features.filter((feature) => {
  const cuisine = (feature.properties?.cuisine || '').toLowerCase();
  return !cuisine || cuisine.includes('coffee_shop');
});

const result = {
  ...rawData,
  features: filtered,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(
  'src/assets/json/ccafes2.json',
  JSON.stringify(result, null, 2)
);

console.log(`Saved ${filtered.length} cafes (filtered from ${rawData.features.length})`);
