
import ngeohash from "ngeohash";
import Feature from "ol/Feature";
import { Point, Polygon } from "ol/geom";
import { fromLonLat } from "ol/proj";

export type RawData = Array<{
    data: string, coordinate: { longitude: number, latitude: number; } | null;
}>;

export function getPointFeatures(data: RawData) {
    const d: { [k: string]: { count: number, location: string, coordinate: { longitude: number, latitude: number; } | null; }; } = {};
    const features = [];

    for (const x of data) {
        if (d[x.data]) {
            d[x.data].count += 1;
        } else {
            d[x.data] = {
                count: 1,
                coordinate: x.coordinate,
                location: x.data
            };
        }
    }

    for (const key in d) {
        const alert = d[key];
        const coord = alert.coordinate;
        if (coord !== null)
            features.push(new Feature({
                geometry: new Point(fromLonLat([
                    coord?.longitude, coord?.latitude
                ])),
                count: alert.count
            }));
    }

    return features;
    // return data.map(x => {
    //     if (!x.coordinate) return null;
    //     return new Feature({
    //         geometry: new Point(fromLonLat([
    //             x.coordinate?.longitude, x.coordinate?.latitude
    //         ])),
    //     });
    // }).filter(x => x);
}

const RESOLUTION = 5;
export function getPolygonFeatures(data: RawData) {
    const features = [];
    const s: { [k: string]: { count: number, location: string, geohash: string | null; }; } = {};

    const r = data.reduce((acc: typeof s, curr) => {
        const alert = curr;

        if (alert.coordinate === null) return acc;

        const geohash = ngeohash.encode(alert.coordinate.latitude, alert.coordinate.longitude, RESOLUTION);
        if (acc[geohash] === undefined) {
            acc[geohash] = {
                geohash,
                count: 1,
                location: alert.data
            };
        } else {
            acc[geohash].count++;
        }

        return acc;
    }, s);

    for (const key in r) {
        const alert = s[key];
        const geohash = alert.geohash;
        if (geohash === null) continue;

        const [minlat, minlon, maxlat, maxlon] = ngeohash.decode_bbox(geohash);

        features.push(new Feature({
            geometry: new Polygon([[
                fromLonLat([minlon, minlat]),
                fromLonLat([minlon, maxlat]),
                fromLonLat([maxlon, maxlat]),
                fromLonLat([maxlon, minlat])
            ]]),
            count: alert.count
        }));
    }
    return features;
}
