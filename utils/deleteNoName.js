import { promises as fs } from "fs";

async function processGeoJSON(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);

    if (
      !jsonData ||
      jsonData.type !== "FeatureCollection" ||
      !Array.isArray(jsonData.features)
    ) {
      console.error(`Invalid GeoJSON FeatureCollection in: ${filePath}`);
      return;
    }

    const updatedFeatures = jsonData.features.filter((feature) => {
      return feature.properties && feature.properties.hasOwnProperty("name");
    });

    const updatedGeoJSON = {
      ...jsonData,
      features: updatedFeatures,
    };

    const updatedContent = JSON.stringify(updatedGeoJSON, null, 2);
    await fs.writeFile(filePath, updatedContent, "utf8");

    console.log(
      `Successfully removed features without 'name' from: ${filePath}`
    );
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function main() {
  const coffeeshopsPath = "../src/assets/coffeeshopscopy.json";

  await processGeoJSON(coffeeshopsPath);

  console.log("Finished processing coffeeshops.json.");
}

main();
