interface VerificationResult {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, status: 0 };
  }
}

async function verifyFrontendLoads(deploymentUrl: string): Promise<VerificationResult> {
  const { ok, status } = await checkUrl(deploymentUrl);
  if (!ok) {
    return {
      name: 'Frontend loads',
      status: 'failed',
      error: `Frontend returned status ${status}`,
    };
  }
  return { name: 'Frontend loads', status: 'passed' };
}

async function verifyHealthEndpoint(deploymentUrl: string): Promise<VerificationResult> {
  const healthUrl = `${deploymentUrl}/health`;
  const { ok, status } = await checkUrl(healthUrl);
  if (!ok) {
    return {
      name: 'API health',
      status: 'failed',
      error: `Health endpoint returned status ${status}`,
    };
  }
  return { name: 'API health', status: 'passed' };
}

async function verifyEnvironmentVariables(): Promise<VerificationResult> {
  const requiredVars = [
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'VERCEL_TOKEN',
  ];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    return {
      name: 'Environment variables',
      status: 'failed',
      error: `Missing required env vars: ${missing.join(', ')}`,
    };
  }
  return { name: 'Environment variables', status: 'passed' };
}

async function verifyHtmlContent(deploymentUrl: string): Promise<VerificationResult> {
  try {
    const response = await fetch(deploymentUrl, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    if (!html.includes('</html>')) {
      return {
        name: 'HTML content valid',
        status: 'failed',
        error: 'Response does not contain valid HTML',
      };
    }
    return { name: 'HTML content valid', status: 'passed' };
  } catch (error) {
    return {
      name: 'HTML content valid',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function verifySecurityHeaders(deploymentUrl: string): Promise<VerificationResult> {
  try {
    const response = await fetch(deploymentUrl, { signal: AbortSignal.timeout(15000) });
    const headers = response.headers;
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ];
    const missing = requiredHeaders.filter((h) => !headers.get(h));
    if (missing.length > 0) {
      return {
        name: 'Security headers',
        status: 'failed',
        error: `Missing security headers: ${missing.join(', ')}`,
      };
    }
    return { name: 'Security headers', status: 'passed' };
  } catch (error) {
    return {
      name: 'Security headers',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function verifyContractAccessible(): Promise<VerificationResult> {
  if (!process.env.CONTRACT_ID) {
    return {
      name: 'Contract accessible',
      status: 'failed',
      error: 'CONTRACT_ID environment variable not set',
    };
  }
  return { name: 'Contract accessible', status: 'passed' };
}

async function runVerifications(): Promise<void> {
  const deploymentUrl = process.env.DEPLOYMENT_URL || process.env.VERCEL_URL;
  if (!deploymentUrl) {
    console.error('::error::DEPLOYMENT_URL or VERCEL_URL environment variable is required');
    process.exit(1);
  }

  const url = deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;

  console.log(`\n🔍 Running deployment verification for: ${url}\n`);

  const checks: Promise<VerificationResult>[] = [
    verifyFrontendLoads(url),
    verifyHealthEndpoint(url),
    verifyHtmlContent(url),
    verifySecurityHeaders(url),
    verifyContractAccessible(),
    verifyEnvironmentVariables(),
  ];

  const results = await Promise.allSettled(checks);
  const verifications: VerificationResult[] = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { name: 'Unknown', status: 'failed', error: r.reason },
  );

  let passed = 0;
  let failed = 0;

  for (const v of verifications) {
    if (v.status === 'passed') {
      console.log(`  ✅ ${v.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${v.name}${v.error ? `: ${v.error}` : ''}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('::warning::Deployment verification failed');
    process.exit(1);
  }

  console.log('✅ Deployment verification passed');
}

runVerifications().catch((error) => {
  console.error('::error::Verification script failed:', error);
  process.exit(1);
});
