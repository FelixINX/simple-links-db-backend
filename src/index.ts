import UAParser from 'ua-parser-js'
import Url from 'url-parse'

import { Request as IttyRequest, Router } from 'itty-router'
const router = Router()

import { getCountByLink, getStatsByLink, saveView } from './macrometa'
import { cors, generateSlug, hasBody, requestStaticUpdate } from './helper'
import { checkAuth } from './auth'
import { Link } from './bindings'

// GO route
router.get('/go/:slug', async ({ params }) => {
  const destination =
    (await LINKSDB.get(params?.slug || 'default')) || 'https://google.com'

  return Response.redirect(destination)
})

router.options('/api/*', () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Authorization, content-type',
    },
  })
})

router.get('/api/links/', async () => {
  const links = await LINKSDB.list()

  const formattedLinks = links.keys.map((link) => {
    return link.metadata
  })

  return new Response(JSON.stringify(formattedLinks), {
    headers: cors,
  })
})

// Restricted routes

router.post('/api/auth/', checkAuth, async () => {
  return new Response(JSON.stringify({ success: true }), {
    headers: cors,
  })
})


router.get('/api/links/:slug/count', checkAuth, async (request: IttyRequest) => {
  if (!request.params || !request.params.slug) {
    return new Response(null, { status: 400, headers: cors })
  }

  const apiResponse = await getCountByLink(request.params.slug)
  const body = await apiResponse.json()
  
  if (!body.result) {
    return new Response(JSON.stringify(0), { headers: cors })  
  }

  return new Response(JSON.stringify(body.result[0]), { headers: cors })
})

router.get(
  '/api/links/:slug/stats',
  checkAuth,
  async (request: IttyRequest) => {
    if (!request.params || !request.params.slug) {
      return new Response(null, { status: 400, headers: cors })
    }

    if (!request.query || !request.query.start || !request.query.end) {
      return new Response(JSON.stringify({ error: 'Missing start or end' }), {
        status: 400,
        headers: cors,
      })
    }

    const apiResponse = await getStatsByLink(
      request.params.slug,
      request.query.start,
      request.query.end,
    )
    const body = await apiResponse.json()

    return new Response(JSON.stringify(body.result), { headers: cors })
  },
)

router.post('/api/links/', hasBody, checkAuth, async (request: IttyRequest) => {
  if (!request.json) return new Response(null, { status: 400 })
  const json = await request.json()

  if (!json.title || !json.destination) {
    return new Response(
      JSON.stringify({ error: 'Missing title or destination' }),
      { status: 400, headers: cors },
    )
  }

  const slug = json.slug || (await generateSlug())

  const link = {
    title: json.title,
    slug,
    destination: json.destination,
    published: json.published || false,
    backgroundColor: json.backgroundColor,
    textColor: json.textColor,
  }

  await LINKSDB.put(link.slug, link.destination, { metadata: link })
  
  await requestStaticUpdate()

  return new Response(JSON.stringify(link), {
    headers: cors,
  })
})

router.delete('/api/links/:slug', checkAuth, async (request: IttyRequest) => {
  if (!request.params || !request.params.slug) {
    return new Response(null, { status: 400, headers: cors })
  }

  await LINKSDB.delete(request.params.slug)

  await requestStaticUpdate()

  return new Response(null, { headers: cors })
})

router.put('/api/links/:slug', checkAuth, async (request: IttyRequest) => {
  if (!request.params || !request.params.slug) {
    return new Response(null, { status: 400, headers: cors })
  }

  if (!request.json) return new Response(null, { status: 400 })
  const json = await request.json()

  if (!json.title || !json.destination) {
    return new Response(
      JSON.stringify({ error: 'Missing title or destination' }),
      { status: 400, headers: cors },
    )
  }

  const currentLink: { value: string | null; metadata: Link | null } =
    await LINKSDB.getWithMetadata(request.params.slug)

  const newLink = {
    slug: json.slug || currentLink.metadata?.slug,
    title: json.title || currentLink.metadata?.title,
    destination: json.destination || currentLink.metadata?.destination,
    published: json.published || currentLink.metadata?.published,
    backgroundColor:
      json.backgroundColor || currentLink.metadata?.backgroundColor,
    textColor: json.textColor || currentLink.metadata?.textColor,
  }

  await LINKSDB.put(request.params.slug, json.destination, {
    metadata: newLink,
  })

  await requestStaticUpdate()

  return new Response(JSON.stringify(newLink), {
    headers: cors,
  })
})

router.all(
  '*',
  () => new Response('Not Found.', { status: 404, headers: cors }),
)

async function saveEvent(request: Request) {
  if (!request.url.includes('/go/')) {
    return
  }

  const linkSlug = request.url.split('/go/').pop()
  if (!linkSlug) {
    return
  }

  const ua = new UAParser(request.headers.get('user-agent') || undefined)
  const url = new Url(request.headers.get('referer') || '')

  saveView(
    ua.getBrowser().name || null,
    ua.getDevice().model || null,
    url.hostname,
    new Date(),
    linkSlug,
  )
}

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request))
  event.waitUntil(saveEvent(event.request))
})
