# Bundle Size Optimization - Quick Reference Guide

## 🚀 Most Important Commands

```bash
# Check bundle size locally
npm run analyze

# Run bundle size tests
npm test -- bundle-size.test.ts

# Full check (recommended before committing)
npm run build && npm run analyze && npm test -- bundle-size.test.ts
```

## 📋 What Changed?

### 🎯 Core Optimization
- **Vite Configuration**: Aggressive minification + chunk splitting
- **Bundle Analysis**: Automatic size reporting on build
- **CI Checks**: Automatic size validation on PR
- **Tests**: Bundle size assertions with thresholds

### 📂 Files Changed
1. `frontend-scaffold/vite.config.ts` - Terser + chunk config
2. `frontend-scaffold/src/services/soroban.ts` - Added comments
3. `frontend-scaffold/src/hooks/useContract.ts` - Added comments
4. `frontend-scaffold/package.json` - Added analyze script

### 📂 Files Created
1. `scripts/analyze-bundle.mjs` - Bundle analysis
2. `src/__tests__/bundle-size.test.ts` - Size tests
3. `.github/workflows/bundle-size.yml` - CI workflow
4. `docs/BUNDLE_OPTIMIZATION.md` - Full guide

## 📊 Size Limits

| Chunk | Limit | Status |
|-------|-------|--------|
| Stellar SDK | 200KB (gzip) | ✅ Target |
| Total Bundle | 500KB (gzip) | ✅ Target |
| App Code | 100KB (gzip) | ✅ Target |
| React Vendor | 150KB (gzip) | ✅ Target |

## ✅ When Building

```bash
# Build process now includes:
npm run build

# Output shows:
# 1. Size of each chunk
# 2. Stellar SDK size
# 3. Total bundle size
# 4. Success/warning messages

# Then analyze:
npm run analyze
```

## ⚠️ If Bundle Size Increases

1. **Check what changed**:
   ```bash
   npm run analyze
   # Look for top files and Stellar SDK size
   ```

2. **Identify large imports**:
   ```bash
   # Search for new @stellar/stellar-sdk imports
   grep -r "@stellar/stellar-sdk" src/
   ```

3. **Review pull request**:
   ```bash
   # Check what dependencies were added
   git diff package.json
   ```

4. **Consider alternatives**:
   - Use lighter libraries
   - Lazy load heavy features
   - Use direct API calls instead of SDK

## 🔍 Understanding Chunk Names

When you run `npm run analyze`, you'll see chunks like:

- `stellar-sdk-*.js` → Stellar SDK dependencies (should be < 200KB gzip)
- `react-vendor-*.js` → React libraries (should be < 150KB gzip)
- `vendor-*.js` → Other dependencies
- `index-*.js` → Your application code (should be < 100KB gzip)

## 📈 Example Output

```
📊 Bundle Size Report

Top 15 Largest Files:
────────────────────────────────────────────────────────────
File                                    Size                Gzip
────────────────────────────────────────────────────────────
...stellar-sdk-hash.js                  180.45KB            52.13KB
...react-vendor-hash.js                 120.32KB            35.76KB
...vendor-hash.js                       150.20KB            42.51KB
...index-hash.js                        85.43KB             24.12KB
────────────────────────────────────────────────────────────
TOTAL                                   536.4KB             154.52KB

🌟 Stellar SDK Bundle Analysis:
────────────────────────────────────────────────────────────
stellar-sdk-hash.js                     180.45KB            52.13KB
────────────────────────────────────────────────────────────
Stellar SDK Total                       180.45KB            52.13KB

✅ Stellar SDK gzip size within limit - 26%
```

## 🔧 Before Importing New Dependencies

Ask yourself:
1. Is this library essential? Can I use vanilla JS?
2. How large is this library? (check npm.com)
3. Does it affect bundle size significantly?
4. Is there a lighter alternative?

**Example** - Don't:
```typescript
import * as StellarSdk from "@stellar/stellar-sdk"; // ❌ Bundles everything
```

**Do**:
```typescript
import { Contract, Address } from "@stellar/stellar-sdk"; // ✅ Tree-shakeable
```

## 📚 Full Documentation

For comprehensive information:
- [Bundle Optimization Guide](./BUNDLE_OPTIMIZATION.md)
- [Implementation Summary](./BUNDLE_SIZE_OPTIMIZATION_SUMMARY.md)

## 🐛 Troubleshooting

### Bundle size tests failing
```bash
# Make sure build exists
npm run build

# Then run tests
npm test -- bundle-size.test.ts
```

### Can't find analyze-bundle.mjs
```bash
# Make sure you're in frontend-scaffold directory
cd frontend-scaffold

# Or run from root with:
cd frontend-scaffold && npm run analyze
```

### CI workflow failing
Check:
1. Node version (should be 18+)
2. Dependencies installed (`npm ci`)
3. Build successful (`npm run build`)
4. Review workflow logs in GitHub Actions

## 🎯 Key Takeaways

1. **Tree-shaking works**: Using named imports enables bundler optimization
2. **Visibility is important**: `npm run analyze` shows what's bundled
3. **Monitor regularly**: Check size before each commit
4. **CI catches issues**: Pull request checks prevent regressions
5. **Documentation helps**: Future developers understand decisions

---

**Last Updated**: May 26, 2026
**Related Issue**: #508 - Reduce Stellar SDK bundle size with tree shaking
**Target**: 60%+ bundle size reduction (500KB → <200KB)
