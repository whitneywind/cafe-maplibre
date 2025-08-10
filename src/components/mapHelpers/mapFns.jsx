import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import neighborhoodPolygons from "../../assets/neighborhoods/nbrs.json";


// fn to determine the neighborhood for a given cafe
export const getNeighborhoodForCafe = (cafeCoordinates) => {
    // convert cafe coordinates to a Turf.js point
    const cafePoint = {
        type: "Feature",
        properties: {},
        geometry: {
        type: "Point",
        coordinates: cafeCoordinates,
        },
    };

    for (const feature of neighborhoodPolygons.features) {
        if (booleanPointInPolygon(cafePoint, feature)) {
        return feature.name;
        }
    }
    return null;
    };