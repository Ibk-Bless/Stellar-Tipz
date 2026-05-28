# Lighthouse CI - Developer Quick Start Guide

## 🚀 Quick Start

### Your PR Will Now Have Performance Checks

When you open a PR, GitHub Actions will:
1. Wait for Vercel to deploy your changes
2. Run Lighthouse performance audit
3. Post results as a comment on your PR
4. 🔴 Fail the check if scores drop below thresholds

### What You'll See

After Lighthouse runs, you'll see a comment like:

```
## 📊 Lighthouse Performance Report

| Category | Score | Status |
|----------|-------|--------|
| Performance | 92 | ✅ (min: 90) |
| Accessibility | 97 | ✅ (min: 95) |
| Best-practices | 91 | ✅ (min: 90) |
| Seo | 93 | ✅ (min: 90) |
```

## ⚠️ If Your PR Fails

### Check the PR Comment

The comment will show:
- Which scores failed
- Minimum required score
- Top optimization opportunities

### Example Failure

```
| Performance | 85 | ❌ (min: 90) |
```

Performance score dropped 5 points below minimum.

### How to Fix

1. **Review Opportunities Section**
   ```
   - Eliminate render-blocking resources (~1250ms)
   - Minify JavaScript (~850ms)
   ```

2. **Implement Suggested Changes**
   - Follow the recommendations
   - Test locally if possible
   - Commit and push

3. **Vercel Will Re-deploy**
   - GitHub Actions automatically re-runs on new commit
   - Lighthouse re-audits the new version
   - Check updated PR comment

## 🧪 Test Locally Before Pushing

### Setup

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Or use with npm
npm install --save-dev @lhci/cli
```

### Run Local Audit

```bash
cd frontend-scaffold

# Development server
npm run dev
# In another terminal:

lhci autorun \
  --config=../.lighthouserc.json \
  --url=http://localhost:3000
```

### Run Against Vercel Preview

```bash
lhci autorun \
  --config=../.lighthouserc.json \
  --url=https://stellar-tipz-pr-123.vercel.app
```

### Understanding Local Results

After running locally, you'll see:

```
✅ Lighthouse Audit
✅ assertions
✅ categories:performance
✅ categories:accessibility
✅ categories:best-practices
✅ categories:seo
```

Or if failed:

```
❌ categories:performance
  Expected maximum 1.0 but found 0.85
  Minimum score 0.9 required but got 0.85
```

## 📊 Score Minimums

Your changes must maintain these scores:

| Category | Minimum | Current* |
|----------|---------|----------|
| Performance | 90 | Check PR comment |
| Accessibility | 95 | Check PR comment |
| Best Practices | 90 | Check PR comment |
| SEO | 90 | Check PR comment |

*Check the latest PR comment for current scores

## 🎯 Common Issues & Fixes

### "Performance Score Below 90"

**Common Causes:**
- New heavy dependency added
- Large image not optimized
- Render-blocking resource

**Fixes:**
```typescript
// ✅ Good: Code splitting
const Component = lazy(() => import('./heavy'));

// ❌ Bad: Importing entire library
import * as heavyLib from 'heavy-library';

// ✅ Good: Import only what you need
import { specificFunction } from 'heavy-library';
```

### "Accessibility Score Below 95"

**Common Causes:**
- Missing alt text on images
- Poor color contrast
- Missing form labels

**Fixes:**
```tsx
// ✅ Good
<img src="logo.png" alt="Company Logo" />
<label htmlFor="name">Name:</label>
<input id="name" />

// ❌ Bad
<img src="logo.png" />
<input placeholder="Name" />
```

### "SEO Score Below 90"

**Common Causes:**
- Missing meta descriptions
- Non-responsive design
- Crawlability issues

**Fixes:**
```tsx
// ✅ Good
<Helmet>
  <title>Page Title | Stellar Tipz</title>
  <meta name="description" content="Page description" />
</Helmet>

// ❌ Bad
<title>Page</title>
```

## 📈 Performance Tips

### Bundle Size Matters

From issue #508, we've already optimized Stellar SDK:
```bash
# Check current bundle size
cd frontend-scaffold
npm run analyze
```

### Image Optimization

```tsx
// ✅ Lazy load images
<img loading="lazy" src="..." />

// ✅ Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>

// ✅ Responsive images
<img 
  srcSet="image-400w.jpg 400w, image-800w.jpg 800w"
  src="image-800w.jpg"
  alt="Description"
/>
```

### Code Splitting

```tsx
// ✅ Route-based splitting
const Dashboard = lazy(() => import('./features/dashboard'));
const Admin = lazy(() => import('./features/admin'));

export const routes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/admin', element: <Admin /> },
];
```

### CSS Optimization

```scss
// ✅ Only import what you use
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

// ❌ Don't import unused CSS
@import 'bootstrap'; // Don't use entire framework
```

## 🔍 What Gets Tested

### Performance (90+ required)
- Page load speed
- Runtime performance
- JavaScript execution time
- CSS rendering
- Image optimization

### Accessibility (95+ required)
- Color contrast
- ARIA labels
- Semantic HTML
- Keyboard navigation
- Form labels

### Best Practices (90+ required)
- HTTPS usage
- Console errors
- No deprecated APIs
- External dependencies
- Browser compatibility

### SEO (90+ required)
- Meta descriptions
- Mobile-friendly design
- Robots.txt
- Structured data
- Crawlability

## ❓ FAQs

### Q: Can I ignore a failing score?

**A:** No. All thresholds must be met before merge. This ensures:
- Consistent performance
- Accessibility for all users
- Security standards
- SEO best practices

### Q: Can I adjust thresholds?

**A:** Yes, but only with team approval. Edit `.lighthouserc.json`:
```json
"categories:performance": ["error", { "minScore": 0.85 }]
```

### Q: Why does my local test differ from CI?

**Possible reasons:**
- Different hardware performance
- Network differences
- Browser cache differences
- Chrome version differences

**Solution:** CI results are most accurate (3 runs averaged)

### Q: How long does Lighthouse take?

- ⏱️ ~2-5 minutes to run
- ⏱️ ~30 seconds Vercel deployment (if not ready)
- **Total**: Usually 5-10 minutes

### Q: What if Vercel deployment fails?

**CI will wait up to 5 minutes** for deployment. If it doesn't complete:
1. Check Vercel build logs
2. Fix deployment issues first
3. Push again to trigger re-check

### Q: Can I test with mobile metrics?

**Currently:** Desktop only (mobile coming soon)

**To test on mobile locally:**
```bash
lhci autorun \
  --config=.lighthouserc.json \
  --url=http://localhost:3000 \
  --chrome-flags="--window-size=375,667"
```

## 🚀 Before Pushing

### Checklist

- [ ] Code changes complete
- [ ] No console errors/warnings
- [ ] Images optimized
- [ ] No unused imports/CSS
- [ ] Accessibility features added
- [ ] Run locally: `npm run analyze` (bundle size)
- [ ] Run locally: `lhci autorun ...` (Lighthouse)
- [ ] Ready to push and get CI feedback

## 📚 Learn More

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Performance APIs](https://web.dev/performance/)
- [Accessibility Guide](https://web.dev/accessibility/)
- [SEO Starter Guide](https://developers.google.com/search/docs)

## 💬 Need Help?

1. Check the "Opportunities" section in PR comment
2. Review [LIGHTHOUSE_CI_SETUP.md](./LIGHTHOUSE_CI_SETUP.md) for details
3. Check GitHub Actions logs: Actions → Lighthouse CI
4. Review Lighthouse audit in browser: DevTools → Lighthouse tab

---

**Remember**: Good performance = Happy users! 🎉
