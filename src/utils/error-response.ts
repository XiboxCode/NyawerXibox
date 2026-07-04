export function errorResponse(status: number, message: string, details?: unknown): Response {
  const body: Record<string, unknown> = { error: message }
  if (details !== undefined) body.details = details
  return new Response(JSON.stringify(body), { status })
}
