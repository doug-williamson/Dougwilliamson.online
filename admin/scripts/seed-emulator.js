/**
 * Seeds the Firebase Auth emulator with the admin user and writes
 * `site-config/default` to the Firestore emulator (for FolioKit blog/admin).
 *
 * Run AFTER `firebase emulators:start` is up.
 * Usage: node scripts/seed-emulator.js
 *
 * Production: deploy `firestore.rules`, then create `site-config/default`
 * (Firebase Console or Admin site-config UI) if it does not exist yet.
 */

const AUTH_EMULATOR = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = '127.0.0.1';
const FIRESTORE_EMULATOR_PORT = 8080;
const PROJECT_ID = 'dougwilliamson-online';

/** Public web config (same project as blog `environment.ts`). */
const FIREBASE_WEB_CONFIG = {
  apiKey: 'AIzaSyDAR62TZbezrBOZ-nld4oz4DaSlZh82o2k',
  authDomain: 'dougwilliamson-online.firebaseapp.com',
  projectId: PROJECT_ID,
};

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

async function seedDefaultSiteConfig() {
  const { initializeApp } = await import('firebase/app');
  const { getAuth, connectAuthEmulator, signInWithEmailAndPassword } = await import('firebase/auth');
  const { getFirestore, connectFirestoreEmulator, doc, setDoc, Timestamp } = await import(
    'firebase/firestore',
  );

  const app = initializeApp(FIREBASE_WEB_CONFIG);
  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_EMULATOR, { disableWarnings: true });

  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);

  await signInWithEmailAndPassword(auth, ADMIN_USER.email, ADMIN_USER.password);

  await setDoc(doc(db, 'site-config', 'default'), {
    id: 'default',
    siteName: 'Doug Williamson',
    siteUrl: 'http://localhost:4200',
    nav: [
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/blog' },
    ],
    pages: {
      home: {
        enabled: true,
        heroHeadline: 'Welcome',
        heroSubheadline: '',
        showRecentPosts: true,
      },
      about: {
        enabled: false,
        headline: '',
        bio: '',
      },
      links: {
        enabled: false,
        links: [],
      },
    },
    setupComplete: true,
    updatedAt: Timestamp.now(),
  });

  console.log('Seeded Firestore: site-config/default');
}

async function main() {
  await clearUsers();
  await createUser(ADMIN_USER);
  await seedDefaultSiteConfig();
  console.log('\nEmulator seeded. Login with:');
  console.log(`  Email:    ${ADMIN_USER.email}`);
  console.log(`  Password: ${ADMIN_USER.password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
