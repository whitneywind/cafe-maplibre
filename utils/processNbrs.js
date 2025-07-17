// processNeighborhoods.js

// Use 'fs/promises' for async/await, or 'fs' for synchronous operations.
// Given your example uses synchronous readFileSync, we'll stick to 'fs'.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Required for __dirname with ES Modules

// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define input and output file paths relative to this script
const inputFilePath = path.join(__dirname, '..', 'src', 'assets', 'neighborhoods', 'nbrs.json');
const outputFilePath = path.join(__dirname, '..', 'src', 'assets', 'neighborhoods', 'nbrs_processed.json'); // New file to avoid overwriting original

/**
 * Formats a neighborhood name:
 * 1. Removes " NC" from the end if present.
 * 2. Converts to lowercase, then capitalizes the first letter of each word.
 * @param {string} name - The raw neighborhood name.
 * @returns {string} The formatted neighborhood name.
 */
function formatNeighborhoodName(name) {
    if (typeof name !== 'string' || !name) {
        return ""; // Handle non-string or empty inputs gracefully
    }

    // 1. Remove " NC" from the end if present
    let formattedName = name.endsWith(" NC") ? name.slice(0, -3) : name;

    // 2. Convert to lowercase, then capitalize the first letter of each word
    return formattedName
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

try {
    // Read the input JSON file synchronously
    const rawGeoJson = fs.readFileSync(inputFilePath, 'utf8');
    const geojsonData = JSON.parse(rawGeoJson);

    // Ensure it's a FeatureCollection and has features
    if (geojsonData.type === 'FeatureCollection' && Array.isArray(geojsonData.features)) {
        // Create a new array of features with modified names
        const processedFeatures = geojsonData.features.map(feature => {
            // Create a copy of the feature to avoid direct mutation issues if you were doing more complex operations
            const newFeature = { ...feature };

            // Ensure 'name' exists and is a string before processing
            if (typeof newFeature.name === 'string') {
                newFeature.name = formatNeighborhoodName(newFeature.name);
            }
            // If your GeoJSON had a 'properties' object, and 'name' was inside it,
            // you'd do: newFeature.properties.name = formatNeighborhoodName(newFeature.properties.name);
            // But based on your previous input, 'name' is directly on the feature.

            return newFeature;
        });

        const result = {
            ...geojsonData, // Keep other top-level properties from original GeoJSON
            features: processedFeatures, // Replace with the processed features
            timestamp: new Date().toISOString(), // Optional: add a timestamp of processing
        };

        // Write the modified data to the output file synchronously
        fs.writeFileSync(
            outputFilePath,
            JSON.stringify(result, null, 2), // null, 2 for pretty-printing
            'utf8'
        );

        console.log(`Successfully processed ${processedFeatures.length} neighborhood features.`);
        console.log(`Saved formatted data to ${outputFilePath}`);
        console.log("Remember to update your import in Map.jsx to use this new file.");

    } else {
        console.error("The JSON file does not appear to be a GeoJSON FeatureCollection or is missing 'features'.");
    }

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`Error: Input file not found at ${inputFilePath}`);
    } else if (error instanceof SyntaxError) {
        console.error("Error parsing JSON data:", error.message);
    } else {
        console.error("An unexpected error occurred:", error);
    }
}