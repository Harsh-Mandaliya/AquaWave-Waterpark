// Checks for the booking and contact forms.
// The same limits are enforced again on the server in firestore.rules,
// so a visitor cannot get around them by editing the page.

export const VISIT_TYPES = ['family', 'friends', 'school', 'corporate', 'birthday', 'offer']
export const MAX_GUESTS = 200
export const MAX_DAYS_AHEAD = 365

// Local calendar date as YYYY-MM-DD (toISOString would give yesterday's date before 5:30 AM in India).
export function localDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function addDays(iso, days) {
  const d = new Date(iso + 'T00:00')
  d.setDate(d.getDate() + days)
  return localDate(d)
}

// "+91 98765-43210", "098765 43210" -> "9876543210"; anything else returns ''.
export function normalizeIndianMobile(raw = '') {
  let digits = String(raw).replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits) ? digits : ''
}

// Whole numbers only, 0..MAX_GUESTS. Returns null for anything else (negative, decimal, text).
export function toGuestCount(value) {
  if (value === '' || value === null || value === undefined) return null
  const s = String(value).trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return n >= 0 && n <= MAX_GUESTS ? n : null
}

export function validateEnquiry(form, { kind = 'booking', ticketIds = [], today = localDate() } = {}) {
  const errors = {}
  const name = (form.name || '').trim()
  if (name.length < 2) errors.name = 'Please enter your full name.'
  else if (name.length > 60) errors.name = 'Name is too long (max 60 characters).'
  else if (!/^[\p{L}\p{M} .'-]+$/u.test(name)) errors.name = 'Name can only contain letters and spaces.'

  if (!normalizeIndianMobile(form.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).'

  const email = (form.email || '').trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'This email address does not look right.'

  const message = (form.message || '').trim()
  if (message.length > 500) errors.message = 'Please keep it under 500 characters.'

  if (kind === 'booking') {
    if (!form.date) errors.date = 'Please choose your visit date.'
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || Number.isNaN(new Date(form.date + 'T00:00').getTime())) errors.date = 'Please choose a valid date.'
    else if (form.date < today) errors.date = 'Visit date cannot be in the past.'
    else if (form.date > addDays(today, MAX_DAYS_AHEAD)) errors.date = 'Bookings open up to one year ahead.'

    if (!form.ticket) errors.ticket = 'Please select a ticket.'
    else if (ticketIds.length && !ticketIds.includes(form.ticket)) errors.ticket = 'Please select a ticket from the list.'

    const adults = toGuestCount(form.adults)
    const kids = toGuestCount(form.kids)
    if (adults === null) errors.adults = `Adults must be a whole number from 0 to ${MAX_GUESTS}.`
    if (kids === null) errors.kids = `Kids must be a whole number from 0 to ${MAX_GUESTS}.`
    if (adults !== null && kids !== null) {
      if (adults + kids === 0) errors.adults = 'Add at least one guest.'
      else if (adults === 0) errors.adults = 'At least one adult must come with the kids.'
      else if (adults + kids > MAX_GUESTS) errors.adults = `For groups over ${MAX_GUESTS}, please call us.`
    }

    if (!VISIT_TYPES.includes(form.groupType)) errors.groupType = 'Please select a visit type.'
  } else if (message.length < 5) {
    errors.message = 'Please write your question (at least 5 characters).'
  }

  return errors
}
