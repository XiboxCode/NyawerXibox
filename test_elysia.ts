import { Elysia, t } from 'elysia'

const app = new Elysia()
  .post('/', async ({ body, request }) => {
    try {
      const raw = await request.clone().text()
      return { ok: true, raw }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }, {
    body: t.Object({ name: t.String() })
  })
  .listen(3000)

async function test() {
  const res = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test' })
  })
  console.log(await res.json())
  app.stop()
}

test()
