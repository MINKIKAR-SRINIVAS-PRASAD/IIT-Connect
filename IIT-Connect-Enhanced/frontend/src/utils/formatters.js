export function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString()
}

export function formatDateTime(ts) {
  const d = new Date(ts)
  return d.toLocaleString()
}
