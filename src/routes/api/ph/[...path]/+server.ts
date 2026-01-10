

export const GET = async (event) => {
  const { pathname } = event.url

  const hostname = pathname.startsWith('/api/ph/static/')
    ? 'us-assets.i.posthog.com'
    : 'us.i.posthog.com'

  const url = new URL(event.request.url)
  url.protocol = 'https:'
  url.hostname = hostname
  url.port = '443'
  url.pathname = pathname.replace(/^\/api\/ph/, '')

  const headers = new Headers(event.request.headers)
  headers.set('host', hostname)
  headers.set('accept-encoding', '')

  // Forward client IP for geolocation
  const clientIp = event.request.headers.get('x-forwarded-for') || event.getClientAddress()
  if (clientIp) {
    headers.set('x-forwarded-for', clientIp)
  }

  const response = await fetch(url.toString(), {
    method: event.request.method,
    headers,
    body: event.request.body,
    // @ts-expect-error - duplex is required for streaming request bodies
    duplex: 'half'
  })

  return response
}

export const POST = GET;