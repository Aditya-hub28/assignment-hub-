/**
 * ASSIGNMENTHUB — 3X CONSECUTIVE PASS ORCHESTRATOR
 * Executes 3 consecutive 100% audit passes covering:
 * - Frontend Build
 * - Jest Test Suite (Unit, Integration, Security, RBAC, Validation)
 * - Route Preservation & Integrity (16 routes)
 * - Live E2E Lifecycle (Direct Registration, Immediate Login, Profile, Request, Inquiry, Admin, IDOR)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { runComprehensiveVerification } = require('./verify-full-system');

const ROOT_DIR = path.resolve(__dirname, '..');
const REQUIRED_CONSECUTIVE_PASSES = 3;

function runCommand(cmd, cwd = ROOT_DIR, extraEnv = {}) {
  const isWin = process.platform === 'win32';
  const fullCmd = isWin ? `cmd.exe /d /s /c "${cmd}"` : cmd;
  return execSync(fullCmd, {
    cwd,
    stdio: 'pipe',
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    env: {
      ...process.env,
      ...extraEnv
    }
  });
}

function verifyFrontendRoutes() {
  const appFile = fs.readFileSync(path.join(ROOT_DIR, 'frontend', 'src', 'App.jsx'), 'utf-8');
  const requiredRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/dashboard',
    '/services',
    '/services/new',
    '/services/custom',
    '/services/review',
    '/services/success',
    '/my-requests',
    '/inquiries',
    '/profile',
    '/privacy-policy',
    '/terms'
  ];

  const missing = [];
  for (const route of requiredRoutes) {
    if (!appFile.includes(`path="${route}"`)) {
      missing.push(route);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required routes in App.jsx: ${missing.join(', ')}`);
  }

  return { verifiedRoutesCount: requiredRoutes.length };
}

async function executeSinglePass(passNumber) {
  console.log(`\n============================================================`);
  console.log(`🌟 RUNNING AUDIT PASS ${passNumber} OF ${REQUIRED_CONSECUTIVE_PASSES}`);
  console.log(`============================================================\n`);

  // 1. Route Preservation Check
  console.log(`[PASS ${passNumber}] Verifying Route Inventory & Preservation...`);
  const routesResult = verifyFrontendRoutes();
  console.log(`  ✅ All ${routesResult.verifiedRoutesCount} required routes verified in frontend App.jsx`);

  // 2. Frontend Production Build Check
  console.log(`\n[PASS ${passNumber}] Checking Frontend Production Build (Vite)...`);
  const buildOutput = runCommand('npm --prefix frontend run build');
  if (!buildOutput.includes('built in') && !buildOutput.includes('dist/index.html')) {
    throw new Error('Frontend build did not produce expected output artifacts.');
  }
  console.log(`  ✅ Frontend production bundle built cleanly with 0 errors.`);

  // 3. Backend Test Suite Execution
  console.log(`\n[PASS ${passNumber}] Running Jest Backend Test Suite (Unit, Security, Validation, Migration)...`);
  const jestOutput = runCommand('node ./node_modules/jest/bin/jest.js --runInBand --forceExit', ROOT_DIR, { NODE_ENV: 'test' });
  if (jestOutput.includes('FAIL')) {
    throw new Error(`Jest test suite encountered failures:\n${jestOutput}`);
  }
  console.log(`  ✅ All backend test suites passed 100%.`);

  // 4. Live Comprehensive E2E Verification
  console.log(`\n[PASS ${passNumber}] Executing Live E2E Lifecycle Flow (Zero OTP Register, Login, Profile, Request, Inquiry, Admin, Security)...`);
  const e2eResult = await runComprehensiveVerification(passNumber);
  if (e2eResult.failed > 0) {
    throw new Error(`E2E Verification failed ${e2eResult.failed} checks during Pass ${passNumber}`);
  }
  console.log(`  ✅ Live E2E verification passed 100% (${e2eResult.passed}/${e2eResult.passed} checks).`);

  return true;
}

async function main() {
  console.log(`============================================================`);
  console.log(`🚀 ASSIGNMENTHUB AUTONOMOUS 3X CONSECUTIVE VERIFICATION GATE`);
  console.log(`   Target: 100% Quality across ${REQUIRED_CONSECUTIVE_PASSES} Consecutive Runs`);
  console.log(`============================================================`);

  let consecutivePasses = 0;

  for (let attempt = 1; attempt <= REQUIRED_CONSECUTIVE_PASSES; attempt++) {
    try {
      await executeSinglePass(attempt);
      consecutivePasses++;
      console.log(`\n🎉 PASS ${attempt} COMPLETED SUCCESSFULLY! (${consecutivePasses}/${REQUIRED_CONSECUTIVE_PASSES} Consecutive)`);
    } catch (err) {
      console.error(`\n❌ AUDIT ATTEMPT ${attempt} FAILED:`, err.message);
      consecutivePasses = 0;
      process.exit(1);
    }
  }

  console.log(`\n============================================================`);
  console.log(`🏆 100% VERIFICATION CONFIRMED: 3 CONSECUTIVE PASSES ACHIEVED!`);
  console.log(`   All routes preserved.`);
  console.log(`   Direct OTP-free registration & immediate login verified.`);
  console.log(`   Zero regressions found.`);
  console.log(`============================================================\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
