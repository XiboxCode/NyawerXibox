export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`
}

export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}

export function formatTanggal(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
