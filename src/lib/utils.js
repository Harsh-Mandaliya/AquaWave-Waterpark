// Small helpers shared across the site and the admin panel.

export function youtubeId(url = '') {
  if (!url) return ''
  if (/^[\w-]{11}$/.test(url)) return url
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return m ? m[1] : ''
}

export const youtubeThumb = (url) => {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}

export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`

export const whatsappHref = (phone = '', text = '') =>
  `https://wa.me/${phone.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const mapEmbedSrc = (address = '') =>
  `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`

export const rupee = (n) =>
  n === '' || n == null || Number.isNaN(Number(n)) ? '—' : `₹${Number(n).toLocaleString('en-IN')}`

export const isWeekend = (date = new Date()) => [0, 6].includes(date.getDay())

// Shrinks an uploaded photo in the browser and returns a data URL.
// Keeps each image well under Firestore's 1 MB document limit, so no paid
// Firebase Storage plan is needed.
export function compressImage(file, maxSize = 1400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That image could not be opened.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const isPng = file.type === 'image/png'
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export const cls = (...parts) => parts.filter(Boolean).join(' ')
