import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const RPC_URL = __ENV.RPC_URL || 'https://soroban-testnet.stellar.org';
const PROFILE_KEY_XDR = __ENV.PROFILE_KEY_XDR || '';
const LEADERBOARD_KEY_XDR = __ENV.LEADERBOARD_KEY_XDR || '';
const SIGNED_TIP_XDRS = (__ENV.SIGNED_TIP_XDRS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const headers = {
  'Content-Type': 'application/json',
};

const rpcLatency = new Trend('rpc_latency_ms');
const rpcFailures = new Rate('rpc_failures');

export const options = {
  scenarios: {
    tip_submissions_10: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      exec: 'tipSubmission',
      startTime: '0s',
    },
    tip_submissions_50: {
      executor: 'constant-vus',
      vus: 50,
      duration: '1m',
      exec: 'tipSubmission',
      startTime: '30s',
    },
    tip_submissions_100: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      exec: 'tipSubmission',
      startTime: '90s',
    },
    leaderboard_reads: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 60 },
        { duration: '30s', target: 0 },
      ],
      exec: 'leaderboardRead',
      startTime: '0s',
    },
    profile_queries: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 60 },
        { duration: '30s', target: 0 },
      ],
      exec: 'profileQuery',
      startTime: '0s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    rpc_failures: ['rate<0.05'],
    http_req_duration: ['p(95)<2500'],
    rpc_latency_ms: ['p(95)<2500'],
  },
};

function callRpc(method, params) {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: `${__VU}-${__ITER}-${method}`,
    method,
    params,
  });

  const res = http.post(RPC_URL, body, { headers });
  rpcLatency.add(res.timings.duration);

  const baseChecksPass = check(res, {
    'rpc status is 200': (r) => r.status === 200,
    'rpc body is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  if (!baseChecksPass) {
    rpcFailures.add(1);
    return null;
  }

  const payload = JSON.parse(res.body);
  const hasRpcError = Boolean(payload.error);

  check(payload, {
    'rpc response has result': (p) => p.result !== undefined,
    'rpc response has no error': (p) => !p.error,
  });

  rpcFailures.add(hasRpcError ? 1 : 0);
  return payload;
}

export function tipSubmission() {
  group('tip submissions', () => {
    if (!SIGNED_TIP_XDRS.length) {
      // If signed transactions are not supplied, run lightweight health traffic.
      callRpc('getLatestLedger', {});
      sleep(0.5);
      return;
    }

    const tx = SIGNED_TIP_XDRS[__ITER % SIGNED_TIP_XDRS.length];
    callRpc('sendTransaction', {
      transaction: tx,
    });
    sleep(1);
  });
}

export function leaderboardRead() {
  group('leaderboard reads', () => {
    if (!LEADERBOARD_KEY_XDR) {
      callRpc('getLatestLedger', {});
      sleep(0.5);
      return;
    }

    callRpc('getLedgerEntries', {
      keys: [LEADERBOARD_KEY_XDR],
    });
    sleep(0.5);
  });
}

export function profileQuery() {
  group('profile queries', () => {
    if (!PROFILE_KEY_XDR) {
      callRpc('getLatestLedger', {});
      sleep(0.5);
      return;
    }

    callRpc('getLedgerEntries', {
      keys: [PROFILE_KEY_XDR],
    });
    sleep(0.5);
  });
}
