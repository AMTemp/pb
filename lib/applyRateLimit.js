// source: https://kittygiraudel.com/2022/05/16/rate-limit-nextjs-api-routes/

import rateLimit from 'express-rate-limit'
// import slowDown from 'express-slow-down' // excluding  -  hasn't been updated in a while...

const applyMiddleware = middleware => (request, response) =>
  new Promise((resolve, reject) => {
    middleware(request, response, result =>
      result instanceof Error ? reject(result) : resolve(result)
    )
  })

const getIP = request =>
  request.ip ||
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.connection.remoteAddress

export const getRateLimitMiddlewares = ({
  limit = process.env.API_RATE_LIMIT_PER_MINUTE ? parseInt(process.env.API_RATE_LIMIT_PER_MINUTE) : 20, // number of requests
  windowMs = 60 * 1000, // per minute
  // delayAfter = Math.round(10 / 2),
  // delayMs = 500,
} = {}) => [
  // slowDown({ keyGenerator: getIP, windowMs, delayAfter, delayMs }),
  rateLimit({ keyGenerator: getIP, windowMs, max: limit }),
]

const middlewares = getRateLimitMiddlewares()

async function applyRateLimit(request, response) {
  await Promise.all(
    middlewares
      .map(applyMiddleware)
      .map(middleware => middleware(request, response))
  )
}

export default applyRateLimit
