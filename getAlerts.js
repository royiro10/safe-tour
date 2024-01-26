import axios from 'axios';

import { config } from "dotenv"

config()

const CONFIG = {
    NINJA_API_KEY: getEnvVar(`NINJA_API_KEY`),
    GEO_ENCODING_CACHE_PATH: getEnvVar(`GEO_ENCODING_CACHE_PATH`)
}

function getEnvVar(varName, defaultValue) {
    const envVar = process.env[varName]

    if (envVar) return envVar
    if (defaultValue) return defaultValue

    throw new Error(`Missing Env Var [${varName}]`)
}


// Terror Alerts

const GET_ALERTS_QUERY_MODE = 0
const GET_ALERTS_QUERY_ENDPOINT = `https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx`
const DEFAULT_QUERY_PARAMS = `lang=en`

async function getAlerts(startTime, endTime) {
    const queryParams = `fromDate=${startTime}&toDate=${endTime}&mode=${GET_ALERTS_QUERY_MODE}`
    const endpoint = `${GET_ALERTS_QUERY_ENDPOINT}?${DEFAULT_QUERY_PARAMS}&${queryParams}`
    const res = await axios.get(endpoint)

    return res.data
}

// Geo Encoding

const NINJA_GEOENCODING_ENDPOINT = `https://api.api-ninjas.com/v1/geocoding`

const rawGeoEncodingCache = fs.readFileSync(CONFIG.GEO_ENCODING_CACHE_PATH, { encoding: `utf-8` })
const geoEncodingCache = JSON.parse(rawGeoEncodingCache)

async function getGeoEncoding(city, country = `israel`) {
    for (const item of geoEncodingCache) {
        if (item.city === city && item.country === country) {
            return item.coordinate
        }
    }

    console.debug(`cache miss ${city}-${country}`)

    const queryParams = `city=${city}&country=${country}`
    const endpoint = `${NINJA_GEOENCODING_ENDPOINT}?${queryParams}`
    const res = await axios.get(endpoint, {
        headers: {
            'X-Api-Key': CONFIG.NINJA_API_KEY
        }
    })

    const geoencodings = res.data

    if (geoencodings.length < 1) {
        console.error(`can not find ${city} - ${country}`)
        geoEncodingCache.push({ city, country, coordinate: null })
        return null
    }

    const firstResult = geoencodings[0]

    const coordinate = {
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
    }

    geoEncodingCache.push({ city, country, coordinate })

    return coordinate
}

// Main

process.on(`SIGINT`, (statusCode) => {
    saveGeoEncodingCache()
    process.exit(statusCode)
})
process.on(`SIGTERM`, (statusCode) => {
    saveGeoEncodingCache()
    process.exit(statusCode)
})

function saveGeoEncodingCache() {
    fs.writeFileSync(CONFIG.GEO_ENCODING_CACHE_PATH, JSON.stringify(geoEncodingCache), { encoding: `utf-8` })
}

main()

import fs from "fs"

async function main() {
    const alerts = await getAlerts(`7.10.2022`, `20.1.2024`)

    const NUM_OF_GEOENCOING_REQUEST_PER_SEC = 100

    for (const alertIndex in alerts) {
        const coordinate = await getGeoEncoding(alerts[alertIndex].data)
        alerts[alertIndex].coordinate = coordinate

        if (alertIndex % 100 === 0) {
            console.info(`got ${alertIndex} alerts`)
            await sleep(1000 / NUM_OF_GEOENCOING_REQUEST_PER_SEC)
        }
    }

    console.info(`got ${alerts.length} alerts`)

    fs.writeFileSync(`./data-with-coords.json`, JSON.stringify(alerts), { encoding: `utf-8` })
    saveGeoEncodingCache()
}

async function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms))
}
