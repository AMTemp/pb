import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import connectMongoAtlas from '../lib/connectMongoAtlas'
import Short from '../schema/Short'



export const getServerSideProps: GetServerSideProps = async (context) => {

  let url = null
  let list = null

  await connectMongoAtlas()

  if (Array.isArray(context.params?.short) && context.params?.short.length === 1 && context.params?.short[0].length === 8) {
    const uid = context.params?.short[0]
    const query = await Short.findOne({ uid: uid }).lean().exec()
    url = query?.url.toString()
  } else {
    const query = await Short.find({})
    list = query.map((doc) => {
      const short = doc.toObject()
      short._id = short._id.toString()
      return short
    })
    list.sort((a, b) => b.id - a.id)
  }

  return {
    props: {
      host: context.req?.headers?.host || null,
      url: url,
      list: list
    }
  }

}



const Home: NextPage = ({ host, url, list }: any) => {

  const [working, setWorking] = useState(false)
  const [shorten, setShorten] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (url) {
      router.push(url)
    } else {
      router.push('/')
    }
  }, [url])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setWorking(true)

    fetch('/api/short', {
      method: 'POST',
      body: JSON.stringify({ url: shorten })
    })
    .then((res) => res.json()
      .then((res) => {
        if (res.code === 201) {
          setWorking(false)
          setShorten('')
          setMessage(`${host}/${res.short.uid}`)
        } else {
          setWorking(false)
          setMessage(res.message)
        }
      })
    )
    .catch((err) => {
      setMessage(err)
    })
  }



  if (!url && list) {
    return (
      <div className="container mx-auto">
        <Head>
          <title>PB URL Shortener</title>
          <meta name="description" content="PB URL Shortener" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="w-full p-20">

          <h1 className="text-xl my-20">
            PB URL Shortener
          </h1>

          <form className="flex flex-col gap-5 mb-10">
            <div className="form-item flex flex-row flex-wrap my-2">
              <label className="w-full p-2" htmlFor="firstname">URL to shorten:</label>
              <input
                className="bg-gray-700 w-full md:w-3/4 p-2"
                type="text"
                id="shorten"
                name="shorten"
                placeholder=""
                value={shorten}
                onChange={(e) => setShorten(e.target.value)}
                required
              />
              { !working && (
                <input
                  className="bg-cyan-300 text-gray-700 dark:bg-cyan-700 dark:text-gray-300 cursor-pointer w-full md:w-1/4 p-2"
                  type="submit"
                  value="Shorten"
                  onClick={(e)=>{handleSubmit(e)}}
                />
              )}
              { working && (
                <input
                  className="bg-cyan-400 text-gray-600 dark:bg-cyan-600 dark:text-gray-400 cursor-wait w-full md:w-1/4 p-2"
                  type="submit"
                  value="Shorten"
                  disabled
                />
              )}
            
            </div>
          </form>

          {message && (
            <div className="text-4xl text-red-500 p-5 mb-10">{message}</div>
          )}

          {list.length > 0 ? (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-5 border border-spacing-2 border-gray-500">Short</th>
                  <th className="p-5 border border-spacing-2 border-gray-500">Target URL</th>
                </tr>
              </thead>
              <tbody>
                {list.map((short: any) => (
                  <tr key={short._id}>
                    <td className="p-5 border border-spacing-2 border-gray-500"><Link href={`http://${host}/${short.uid}`}><a>{host}/{short.uid}</a></Link></td>
                    <td className="p-5 border border-spacing-2 border-gray-500">{short.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </main>

        <footer className="text-sm text-gray-500">
          <code>https://github.com/AMTemp/pb</code>
        </footer>

      </div>

    )

  } else {
    return null
  }

}

export default Home
