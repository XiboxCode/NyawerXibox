async function run() {
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ name: 'test' })
  })

  // Simulate Elysia consuming the body
  await req.json()

  try {
    // What the user does:
    const cloneText = await req.clone().text()
    console.log("Success:", cloneText)
  } catch (e: any) {
    console.log("Error:", e.name, e.message)
  }
}

run()
