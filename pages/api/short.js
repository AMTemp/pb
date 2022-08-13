import connectMongoAtlas from '../../lib/connectMongoAtlas'
import Short from '../../schema/Short'
import applyRateLimit from '../../lib/applyRateLimit'
import Hashids from 'hashids'

const hashids = new Hashids('', 8)

const indexShort = async (req, res) => {

  if (process.env.ENVIRONMENT === 'PRODUCTION') {
    try {
      await applyRateLimit(req, res)
    } catch {
      return res.status(429).json({ code: 429, message: 'Too many requests' })
    }
  }

  if (!!process.env.MONGODB_URI) {

    await connectMongoAtlas()

    if (req.method === 'POST') {
      try {
        const short = await Short.create(JSON.parse(req.body))
        short.set('uid', hashids.encode(short.get('id')))
        await short.save()
        res.status(201).json({ code: 201, short })
      } catch (error) {
        res.status(400).json({ code: 400, message: error.message })
      }
    // } else if (req.method === 'GET') {
    //   try {
    //     const short = await Short.find({})
    //     res.status(200).json({ short })
    //   } catch (error) {
    //     res.status(400).json({ code: 400, message: error.message })
    //   }
    } else {
      res.status(405).json({ code: 405, message: 'Method not allowed' })
    }

  } else {
    res.status(400).json({ code: 400, message: 'MONGODB_URI environment variable is missing' })
  }

}

export default indexShort
