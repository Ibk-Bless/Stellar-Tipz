# Bundle Size Optimization - Implementation Guide

## Overview
This document describes the bundle size optimization implemented for the Stellar-Tipz frontend to reduce the Stellar SDK bundle from ~500KB to <200KB (gzip).

## Changes Made

### 1. **Vite Configuration Optimization** (`vite.config.ts`)
- **Enabled Terser minification** with aggressive settings
  - Drop debugger statements
  - Remove console.debug logs
  - Mangle variable names
  - Remove comments

- **Manual Chunk Splitting** for better caching and analysis
  - `stellar-sdk`: Isolated Stellar SDK dependencies
  - `react-vendor`: React and related libraries
  - `vendor`: Other node_modules dependencies
  - `main`: Application code

- **Bundle Analyzer Plugin**: Automatic bundle size reporting during build
  - Shows top 10 largest files
  - Displays Stellar SDK chunk sizes
  - Estimates gzip sizes

### 2. **Tree-Shaking Optimizations**
- **Named Imports**: Already using named imports from `@stellar/stellar-sdk` which enables tree-shaking
  - Only imported symbols are bundled
  - Unused code is eliminated during minification

### 3. **Bundle Size Monitoring**

#### A. Bundle Analysis Script (`scripts/analyze-bundle.mjs`)
Run with: `npm run analyze`

Features:
- Gzip size calculation for all chunks
- Top 15 largest files report
- Stellar SDK bundle size tracking
- Automatic limit checking (200KB gzip for Stellar SDK)
- Detailed breakdown by chunk type

#### B. Bundle Size Tests (`src/__tests__/bundle-size.test.ts`)
Run with: `npm test -- bundle-size.test.ts`

Assertions:
- ✅ Stellar SDK chunk < 200KB (gzip)
- ✅ Total bundle < 500KB (gzip)
- ✅ App chunk < 100KB (gzip)
- ✅ React vendor chunk < 150KB (gzip)

#### C. CI Integration (`.github/workflows/bundle-size.yml`)
Automatic checks on:
- Pull requests to main/develop
- Pushes to main/develop
- Files in `frontend-scaffold/src/**`

## Stellar SDK Import Analysis

### Current Imports (soroban.ts)
```typescript
import {
  Account,              // Transaction account management
  Address,              // Stellar address handling
  Contract,             // Soroban contract interaction
  Memo,                 // Transaction memo
  MemoType,             // Memo type enum
  nativeToScVal,        // Native to Soroban value conversion
  Operation,            // Transaction operations
  scValToNative,        // Soroban value to native conversion
  SorobanRpc,           // Soroban RPC client
  TimeoutInfinite,      // Transaction timeout constant
  Transaction,          // Transaction class
  TransactionBuilder,   // Builder for transactions
  xdr,                  // XDR encoding/decoding
} from "@stellar/stellar-sdk";
```

All imports are **essential** for Soroban contract interaction and are already optimized using named imports.

### Current Imports (useContract.ts)
```typescript
import {
  Contract,             // Essential
  TimeoutInfinite,      // Essential
  nativeToScVal,        // Essential
  xdr,                  // Essential
} from "@stellar/stellar-sdk";
```

These are subset of soroban.ts imports and properly tree-shaken.

### Why Not Subpath Imports?
Stellar SDK v11.3.0 has limited subpath export support. The named imports approach is:
- ✅ Already tree-shakeable
- ✅ Properly minified by Terser
- ✅ More compatible
- ✅ Cleaner than conditional imports

Future versions (v13+) have better subpath support that can further reduce bundle size.

## Performance Impact

### Expected Results
- **Stellar SDK chunk**: 150-200KB (gzip)
- **Total bundle**: 300-400KB (gzip)
- **Improvement**: 60-70% reduction from baseline

### Benchmarking Commands
```bash
# Full analysis
npm run analyze

# Run tests
npm test -- bundle-size.test.ts

# Build and test together
npm run build && npm test -- bundle-size.test.ts
```

## Maintenance

### When to Re-optimize
- ✅ After upgrading `@stellar/stellar-sdk`
- ✅ When adding new large dependencies
- ✅ When bundle exceeds limits
- ✅ During performance optimization sprints

### Monitoring
- **CI Checks**: Automatic on every PR
- **Local**: Run `npm run analyze` before committing
- **Dashboard**: GitHub Actions workflow results

## Further Optimizations (Future)

1. **Upgrade to Stellar SDK v13+**: Better subpath exports
   ```typescript
   import { SorobanRpc } from "@stellar/stellar-sdk/soroban_rpc";
   import { Account } from "@stellar/stellar-sdk/transaction";
   ```

2. **Dynamic Imports**: Lazy load rarely-used features
   ```typescript
   const { Contract } = await import("@stellar/stellar-sdk");
   ```

3. **API Optimization**: Replace SDK calls with custom implementations for simple operations
   - Balance checking via direct Horizon API (already done in stellar.ts)
   - Reduce SDK usage for read-only operations

4. **Dependency Review**: Evaluate alternatives for
   - Large validation libraries
   - Heavy formatting utilities
   - Unused transitive dependencies

## Troubleshooting

### Bundle size not decreasing
1. Check that minification is enabled: `npm run build`
2. Verify no additional SDK imports were added
3. Run `npm run analyze` to identify problematic chunks
4. Check for circular dependencies: `npm run build -- --debug`

### Tests failing
1. Ensure `npm run build` completes successfully
2. Check that build artifacts exist in `build/` directory
3. Review test output for chunk name patterns
4. Adjust thresholds in `bundle-size.test.ts` if needed

### CI failing
1. Review workflow logs: `.github/workflows/bundle-size.yml`
2. Check that dependencies are installed
3. Verify Node.js version compatibility
4. Run `npm ci` to ensure clean install

## References
- [Vite Tree-shaking Guide](https://vitejs.dev/guide/features.html#tree-shaking)
- [Stellar SDK Documentation](https://developers.stellar.org/docs/learn/encyclopedia/stellar-data-structures)
- [Terser Options](https://terser.org/docs/options)
- [Web.dev Bundle Analysis](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
