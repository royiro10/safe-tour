const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const CONFIG = {
    PORT: parseInt(process.env[`PORT`])
}

const app = express()

const monitorRequests = (req, res, next) => {
    console.debug(`[${new Date().toISOString()}] - request [${req.path}] from ${req.ip}`)
    next()
}

app.use(`/`, monitorRequests)
app.get('/', (req, res) => {
    res.json({ msg: `hello world` })
})

app.listen(CONFIG.PORT, () => {
    console.log(`server is listening on port: ${CONFIG.PORT}`)
})