/**
 * Seeds the Firebase Auth emulator with the admin user.
 *
 * Run AFTER `firebase emulators:start` is up.
 * Usage: node scripts/seed-emulator.js
 */

const AUTH_EMULATOR = 'http://127.0.0.1:9099';
const PROJECT_ID = 'dougwilliamson-online';

const ADMIN_USER = {
  email: 'dev.foliokit@gmail.com',
  password: 'admin123',
  displayName: 'FolioKit Dev',
};

async function clearUsers() {
  const res = await fetch(
    `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`Failed to clear users: ${res.status}`);
  console.log('Cleared existing emulator users.');
}

async function createUser({ email, password, displayName }) {
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, returnSecureToken: true }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create user ${email}: ${res.status} ${body}`);
  }
  const data = await res.json();
  console.log(`Created user: ${email} (uid: ${data.localId})`);
}

async function main() {
  await clearUsers();
  await createUser(ADMIN_USER);
  console.log('\nEmulator seeded. Login with:');
  console.log(`  Email:    ${ADMIN_USER.email}`);
  console.log(`  Password: ${ADMIN_USER.password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
