export function appendEventLog(text: string): void {
  const el = document.getElementById('event-log')
  if (!el) return

  const time = new Date().toLocaleTimeString()
  el.textContent = `[${time}] ${text}\n` + (el.textContent ?? '')

  const lines = el.textContent.split('\n')
  if (lines.length > 200) {
    el.textContent = lines.slice(0, 200).join('\n')
  }
}
