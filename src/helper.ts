import { IttyRequest } from "./bindings"

export async function generateSlug(): Promise<string> {
  const random = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)
  
  const inKv = await LINKSDB.get(random)
  
  if (inKv) {
    console.log('slug exists')
    return generateSlug()
  }
  
  return random
}

export async function hasBody(request: IttyRequest): Promise<void | Response> {
  if (!request.json) {
    return new Response(JSON.stringify({ error: 'Body missing' }), { status: 400 })
  }
}

export const cors = {
  'Access-Control-Allow-Origin': FRONTEND_CORS ?? '*'
}