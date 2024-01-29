"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var fs = require("fs");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var CONFIG = {
    GOOGLE_API_KEY: getEnvVar("GOOGLE_API_KEY"),
    GEO_ENCODING_CACHE_PATH: getEnvVar("GEO_ENCODING_CACHE_PATH")
};
function getEnvVar(varName, defaultValue) {
    var envVar = process.env[varName];
    if (envVar)
        return envVar;
    if (defaultValue)
        return defaultValue;
    throw new Error("Missing Env Var [".concat(varName, "]"));
}
// Terror Alerts
var GET_ALERTS_QUERY_MODE = 0;
var GET_ALERTS_QUERY_ENDPOINT = "https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx";
var DEFAULT_QUERY_PARAMS = "lang=he";
function getAlerts(startTime, endTime) {
    return __awaiter(this, void 0, void 0, function () {
        var queryParams, endpoint, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryParams = "fromDate=".concat(startTime, "&toDate=").concat(endTime, "&mode=").concat(GET_ALERTS_QUERY_MODE);
                    endpoint = "".concat(GET_ALERTS_QUERY_ENDPOINT, "?").concat(DEFAULT_QUERY_PARAMS, "&").concat(queryParams);
                    return [4 /*yield*/, axios_1.default.get(endpoint)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.data];
            }
        });
    });
}
// Geo Encoding
var GOOGLE_GEOENCODING_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";
var rawGeoEncodingCache = fs.readFileSync(CONFIG.GEO_ENCODING_CACHE_PATH, { encoding: "utf-8" });
var geoEncodingCache = JSON.parse(rawGeoEncodingCache);
function getGeoEncoding(city, country) {
    if (country === void 0) { country = "israel"; }
    return __awaiter(this, void 0, void 0, function () {
        var _i, geoEncodingCache_1, item, queryParams, endpoint, res, geoencodings, firstResult, coordinate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    for (_i = 0, geoEncodingCache_1 = geoEncodingCache; _i < geoEncodingCache_1.length; _i++) {
                        item = geoEncodingCache_1[_i];
                        if (item.city === city && item.country === country) {
                            return [2 /*return*/, item.coordinate];
                        }
                    }
                    console.debug("cache miss ".concat(city, "-").concat(country));
                    queryParams = "address=".concat(city, ", ").concat(country, "&key=").concat(CONFIG.GOOGLE_API_KEY);
                    endpoint = "".concat(GOOGLE_GEOENCODING_ENDPOINT, "?").concat(queryParams);
                    return [4 /*yield*/, axios_1.default.get(endpoint)];
                case 1:
                    res = _a.sent();
                    geoencodings = res.data;
                    firstResult = geoencodings.results[0];
                    coordinate = {
                        latitude: firstResult.geometry.location.lat,
                        longitude: firstResult.geometry.location.lng,
                    };
                    geoEncodingCache.push({ city: city, country: country, coordinate: coordinate });
                    return [2 /*return*/, coordinate];
            }
        });
    });
}
// Main
process.on("SIGINT", function (statusCode) {
    saveGeoEncodingCache();
    process.exit(statusCode);
});
process.on("SIGTERM", function (statusCode) {
    saveGeoEncodingCache();
    process.exit(statusCode);
});
function saveGeoEncodingCache() {
    fs.writeFileSync(CONFIG.GEO_ENCODING_CACHE_PATH, JSON.stringify(geoEncodingCache), { encoding: "utf-8" });
}
main();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var alerts, NUM_OF_GEOENCOING_REQUEST_PER_SEC, _a, _b, _c, _i, alertIndex, coordinate;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getAlerts("7.10.2022", "26.1.2024")];
                case 1:
                    alerts = _d.sent();
                    NUM_OF_GEOENCOING_REQUEST_PER_SEC = 100;
                    _a = alerts;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 5];
                    alertIndex = _c;
                    return [4 /*yield*/, getGeoEncoding(alerts[alertIndex].data)];
                case 3:
                    coordinate = _d.sent();
                    alerts[alertIndex].coordinate = coordinate;
                    if (!(parseInt(alertIndex) % 100 === 0)) return [3 /*break*/, 5];
                    console.info("got ".concat(alertIndex, " alerts"));
                    return [4 /*yield*/, sleep(1000 / NUM_OF_GEOENCOING_REQUEST_PER_SEC)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    console.info("got ".concat(alerts.length, " alerts"));
                    fs.writeFileSync("./data-with-coords.json", JSON.stringify(alerts), { encoding: "utf-8" });
                    saveGeoEncodingCache();
                    return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) { return setTimeout(res, ms); })];
        });
    });
}
