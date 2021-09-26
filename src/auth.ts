import { IttyRequest } from './bindings'

export async function checkAuth(request: IttyRequest): Promise<void | Response> {
  const { protocol } = new URL(request.url)

  if (
    'https:' !== protocol ||
    'https' !== request.headers.get('x-fowarded-proto')
  ) {
    return requestException(400, 'You need to use HTTPS.')
  }

  if (!request.headers.has('Authorization')) {
    return requestException(401, 'You need to login.', true)
  }

  const authHeader = request.headers.get('Authorization') || ''

  const [scheme, encoded] = authHeader.split(' ')

  if (!encoded || scheme !== 'Basic') {
    return requestException(400, 'Malformed authorization header')
  }

  const decoded = atob(encoded).normalize()

  const index = decoded.indexOf(':')

  // eslint-disable-next-line no-control-regex
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    return requestException(400, 'Invalid authorization value.')
  }

  if (decoded.substring(0, index) !== AUTH_USER || decoded.substring(index + 1) !== AUTH_PASS) {
    return requestException(401, 'Unauthorized')
  }
}

const requestException = (code: number, error: string, authHeader = false): Response => {
  let requestConfig: ResponseInit = {
    status: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }

  if (authHeader) {
    requestConfig = {
      ...requestConfig,
      headers: {
        'WWW-Authenticate': 'Basic realm="my scope", charset="UTF-8"',
      },
    }
  }

  return new Response(
    JSON.stringify({
      error,
    }),
    requestConfig,
  )
}
