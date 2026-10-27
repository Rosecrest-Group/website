import { revalidatePath } from 'next/cache'
import { after, type NextRequest, NextResponse } from 'next/server'
import { submitToIndexNow } from '@/lib/indexnow'
import { parseBody } from 'next-sanity/webhook'

const secret = process.env.SANITY_REVALIDATE_SECRET

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string
      slug?: { current?: string }
    }>(req, secret)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad request', { status: 400 })
    }

    revalidatePath('/blog')
    const changed = ['/blog']

    if (body._type === 'post' && body.slug?.current) {
      revalidatePath(`/blog/${body.slug.current}`)
      changed.push(`/blog/${body.slug.current}`)
    }

    // Tell Bing and other IndexNow engines once the response is sent. Dev builds never ping.
    if (process.env.NODE_ENV === 'production') {
      after(async () => {
        const result = await submitToIndexNow(changed).catch((err: unknown) => ({ error: String(err) }))
        console.log('IndexNow:', JSON.stringify(result))
      })
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type: body._type,
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return new NextResponse('Error revalidating', { status: 500 })
  }
}
