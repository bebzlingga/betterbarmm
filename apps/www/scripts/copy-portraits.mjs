/* `node scripts/copy-portraits.mjs` — copy the Members' portraits from the legislation workspace, which keeps them,
   into this app's public/members, so the directory serves them itself and shows a new portrait without waiting for
   legislation to deploy. The copy is ignored by git; run before dev and build. */
import fs from 'node:fs'
import path from 'node:path'

const APP = path.resolve(import.meta.dirname, '..')
const FROM = path.resolve(APP, '../legislation/public/images/members/elected')
const TO = path.join(APP, 'public/members')
fs.rmSync(TO, { recursive: true, force: true })
fs.cpSync(FROM, TO, { recursive: true })
console.log(`portraits: ${fs.readdirSync(TO).length} copied`)
