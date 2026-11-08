import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Base64-encode: bcrypt hashes contain "$" (e.g. $2b$10$...), and Next.js's
// env loader does shell-style $VAR expansion on .env values (and on
// platform-provided env vars too), which silently corrupts a raw hash.
// Base64 has no "$" so it round-trips safely everywhere.
const encoded = Buffer.from(hash, "utf8").toString("base64");
console.log(encoded);
