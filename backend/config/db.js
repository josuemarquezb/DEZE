// config/db.js — re-exports the shared Prisma client singleton.
// The singleton itself lives in prisma.js (backend root); this file exists
// so existing `import prisma from '../config/db.js'` call sites keep working.
// New code can import '../prisma.js' directly.

export { default } from '../prisma.js';
