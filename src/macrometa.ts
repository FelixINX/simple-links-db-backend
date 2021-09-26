const getHeaders = () => {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${MACROMETA_KEY}`)

  return headers
}

export async function getCountByLink(linkSlug: string): Promise<Response> {
  const response = await fetch(
    `https://api-gdn.paas.macrometa.io/_fabric/_system/_api/cursor`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: `RETURN LENGTH(FOR v in ${MACROMETA_COLLECTION} FILTER v.linkSlug == '${linkSlug}' RETURN v)`,
      }),
      headers: getHeaders(),
    },
  )

  return response
}

export async function getStatsByLink(
  linkSlug: string,
  start: string,
  end: string,
): Promise<Response> {
  const response = await fetch(
    `https://api-gdn.paas.macrometa.io/_fabric/_system/_api/cursor`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: `
          FOR v IN ${MACROMETA_COLLECTION}
            FILTER v.linkSlug == '${linkSlug}'
            && DATE_DIFF(IS_DATESTRING(v.dateTime) ? v.dateTime : 1, '${start}', 'd') <= 0
            && DATE_DIFF(IS_DATESTRING(v.dateTime) ? v.dateTime : 1, '${end}', 'd') >= 0
            RETURN v
        `,
      }),
      headers: getHeaders(),
    },
  )

  return response
}

export async function saveView(
  browser: string | null,
  device: string | null,
  referer: string | null,
  dateTime: Date,
  linkSlug: string | null,
): Promise<Response> {
  const response = await fetch(
    `https://api-gdn.paas.macrometa.io/_fabric/_system/_api/document/${MACROMETA_COLLECTION}`,
    {
      method: 'POST',
      body: JSON.stringify({
        browser,
        device,
        referer,
        dateTime,
        linkSlug,
      }),
      headers: getHeaders(),
    },
  )

  return response
}
