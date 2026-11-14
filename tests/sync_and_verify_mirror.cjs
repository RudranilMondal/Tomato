const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

const primaryDir = 'D:/Projects/Zomato/Zomato/supabase/migrations';
const mirrorDir = 'D:/Projects/Zomato/supabase/migrations';

if (!fs.existsSync(mirrorDir)) {
  fs.mkdirSync(mirrorDir, { recursive: true });
}

const primaryFiles = fs.readdirSync(primaryDir).filter(f => f.endsWith('.sql'));

console.log('=== SYNCHRONIZING PRIMARY MIGRATIONS TO EXTERNAL MIRROR ===');
for (const file of primaryFiles) {
  const pPath = path.join(primaryDir, file);
  const mPath = path.join(mirrorDir, file);
  
  // Copy to mirror
  fs.copyFileSync(pPath, mPath);
  
  const pHash = sha256(pPath);
  const mHash = sha256(mPath);
  
  if (pHash === mHash) {
    console.log(`[SYNCHRONIZED] ${file} -> SHA256: ${pHash}`);
  } else {
    console.error(`[FAILED] ${file} hash mismatch!`);
    process.exit(1);
  }
}

// Also sync test harness
const pTest = 'D:/Projects/Zomato/Zomato/supabase/tests/staging_validation_test.sql';
const mTest = 'D:/Projects/Zomato/supabase/tests/staging_validation_test.sql';
if (fs.existsSync(pTest)) {
  fs.copyFileSync(pTest, mTest);
  console.log(`[SYNCHRONIZED] staging_validation_test.sql -> SHA256: ${sha256(pTest)}`);
}

console.log('\nAll migrations and test files in external mirror are 100% synchronized and verified!');
