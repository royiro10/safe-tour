import { Map } from "ol";
import Vector from "ol/layer/Vector";

import View from "ol/View";
import { defaults } from "ol/control/defaults";
import { defaults as interactionDefaults } from "ol/interaction/defaults";

import { Style, Fill, Stroke } from "ol/style";
import { Tile } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";

import { Feature } from "ol";
import { Point, Polygon } from "ol/geom";
import { fromLonLat } from "ol/proj";

import data from "./assets/data-with-coords.json";

import { getPointFeatures, getPolygonFeatures } from "./utils";
import { FeatureLike } from "ol/Feature";

const IS_POINT: boolean = true;

const features = IS_POINT ? getPointFeatures(data) : getPolygonFeatures(data);
// const _maxCount = Math.max(...features.map(f => (f?.get('count'))));

const POINT_VECTOR_SOURCE = new VectorSource({
    features: features as Feature<Point>[]
});

const POLYGON_VECTOR_SOURCE = new VectorSource({
    features: features as Feature<Polygon>[]
});

function colorMap(count: number) {
    if (count < 3) {
        return `#f5b342`;
    } else if (count < 10) {
        return `#f58a42`;
    } else if (count < 20) {
        return `#f56642`;
    }

    return `#f54242`;
}

// const POINT_STYLE = (feature: FeatureLike) => new Style({
//     image: new Circle({
//         radius: 8,
//         fill: new Fill({ color: colorMap(feature.get(`count`)) })
//     })
// });

const POLYGON_STYLE = (feature: FeatureLike) => new Style({
    stroke: new Stroke({
        color: 'black',
        width: 0.5
    }),
    fill: new Fill({
        color: `${colorMap(feature.get('count'))}88` //'rgba(255, 0, 0, 0.3)',
    }),
});

// const pointVectorLayer = new Vector({
//     source: POINT_VECTOR_SOURCE,
//     style: POINT_STYLE
// });

const polygonVectorLayer = new Vector({
    source: POLYGON_VECTOR_SOURCE,
    style: POLYGON_STYLE
});

import { Heatmap as HeatmapLayer } from "ol/layer";
import { useRef, useState } from "react";



export function useMap(): Map {
    const [blur, _setBlur] = useState(20);
    const [radius, _setRadius] = useState(10);

    const mapRef = useRef<Map>();


    const heatmaplayer = new HeatmapLayer({
        // title: "HeatMap",
        source: POINT_VECTOR_SOURCE,
        blur: blur,
        radius: radius,
        weight: () => {
            return 1; //feature.get('count') / maxCount;
        }
    });


    const map = new Map({
        target: "map",
        layers: [
            new Tile({
                source: new OSM()
            }),
            IS_POINT ? heatmaplayer : polygonVectorLayer
        ],
        view: new View({
            center: fromLonLat([35, 32.5]),
            zoom: 12,
            enableRotation: false
        }),
        controls: defaults(),
        interactions: interactionDefaults({})
    });

    if (!mapRef.current) {
        mapRef.current = map;
    }

    return mapRef.current;

}
