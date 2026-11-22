// Quick self-check for the form rules:  node scripts/test-validation.mjs
import assert from 'node:assert/strict'
import { validateEnquiry, normalizeIndianMobile, toGuestCount, localDate, addDays } from '../src/lib/validate.js'

const today = '2026-11-22'
const ok = { name: 'Ravi Patel', phone: '9876543210', email: '', date: '2026-11-29', ticket: 'adult', adults: 2, kids: 1, groupType: 'family', message: '' }
const check = (patch, opts = {}) => validateEnquiry({ ...ok, ...patch }, { kind: 'booking', ticketIds: ['kids', 'adult', 'combo'], today, ...opts })

let n = 0
const t = (label, fn) => { fn(); n++; console.log('  ok -', label) }

t('valid booking passes', () => assert.deepEqual(check({}), {}))
t('today is allowed', () => assert.equal(check({ date: today }).date, undefined))
t('yesterday is rejected', () => assert.match(check({ date: '2026-11-21' }).date, /past/))
t('more than a year ahead is rejected', () => assert.match(check({ date: addDays(today, 400) }).date, /one year/))
t('missing date is rejected', () => assert.ok(check({ date: '' }).date))
t('garbage date is rejected', () => assert.ok(check({ date: '29/11/2026' }).date))
t('negative adults rejected', () => assert.ok(check({ adults: -1 }).adults))
t('negative kids rejected', () => assert.ok(check({ kids: '-3' }).kids))
t('decimal guests rejected', () => assert.ok(check({ adults: '1.5' }).adults))
t('text guests rejected', () => assert.ok(check({ kids: 'abc' }).kids))
t('zero guests rejected', () => assert.ok(check({ adults: 0, kids: 0 }).adults))
t('kids without adult rejected', () => assert.match(check({ adults: 0, kids: 3 }).adults, /adult/))
t('over 200 guests rejected', () => assert.ok(check({ adults: 150, kids: 60 }).adults))
t('missing ticket rejected', () => assert.ok(check({ ticket: '' }).ticket))
t('unknown ticket rejected', () => assert.ok(check({ ticket: 'vip-hack' }).ticket))
t('unknown visit type rejected', () => assert.ok(check({ groupType: 'party' }).groupType))
t('short phone rejected', () => assert.ok(check({ phone: '12345' }).phone))
t('phone starting with 5 rejected', () => assert.ok(check({ phone: '5876543210' }).phone))
t('+91 phone accepted', () => assert.equal(normalizeIndianMobile('+91 98765-43210'), '9876543210'))
t('0-prefixed phone accepted', () => assert.equal(normalizeIndianMobile('09876543210'), '9876543210'))
t('name with digits rejected', () => assert.ok(check({ name: 'R4vi' }).name))
t('Gujarati name accepted', () => assert.equal(check({ name: 'રવિ પટેલ' }).name, undefined))
t('bad email rejected', () => assert.ok(check({ email: 'ravi@' }).email))
t('contact needs a message', () => assert.ok(validateEnquiry({ ...ok, message: '' }, { kind: 'contact', today }).message))
t('guest count parser', () => { assert.equal(toGuestCount('4'), 4); assert.equal(toGuestCount('-4'), null); assert.equal(toGuestCount('4e2'), null) })
t('localDate format', () => assert.match(localDate(), /^\d{4}-\d{2}-\d{2}$/))

console.log(`\n${n} checks passed`)
