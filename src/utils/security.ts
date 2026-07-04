export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBuf = enc.encode(a)
  const bBuf = enc.encode(b)
  if (aBuf.length !== bBuf.length) return false
  let result = 0
  for (let i = 0; i < aBuf.length; i++) result |= aBuf[i] ^ bBuf[i]
  return result === 0
}

export function getSecretFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('secret')
  } catch {
    return null
  }
}
