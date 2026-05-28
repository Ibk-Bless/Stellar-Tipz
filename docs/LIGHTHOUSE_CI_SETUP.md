# Lighthouse CI Setup & Guide

## Overview

This document describes the Lighthouse CI implementation for automated web performance monitoring on every pull request.

## What is Lighthouse CI?

Lighthouse CI automatically measures web performance metrics on each pull request:
- **Performance**: Loading performance and runtime metrics
- **Accessibility**: WCAG compliance and accessibility best practices
- **Best Practices**: Security and web standards
- **SEO**: Search engine optimization metrics

## Files Created

### `.lighthouserc.json`
Main Lighthouse CI configuration file with:
- Score thresholds (Performance: 90, Accessibility: 95, Best Practices: 90, SEO: 90)
- 3 runs per URL for statistical significance
- Temporary public storage for results
- Chrome sandbox disabled for CI environment

### `.lighthouserc.extended.json`
Extended configuration with Web Vitals tracking:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Useful for deeper performance analysis

### `.github/workflows/lighthouse.yml`
GitHub Actions workflow that:
1. Waits for Vercel preview deployment
2. Detects preview URL from GitHub comments or deployment statuses
3. Runs Lighthouse CI against the preview URL
4. Posts results as PR comment
5. Fails PR if scores drop below thresholds
6. Uploads results as artifacts for analysis

## Configuration Details

### Assertion Levels

```json
{
  "categories:performance": ["error", { "minScore": 0.9 }]
}
```

- `"error"`: Fail the check if threshold not met
- `"warn"`: Warn but don't fail (optional alternative)
- `"off"`: Don't check this metric
- `minScore`: 0-1 scale (0.9 = 90%)

### Score Thresholds

| Category | Threshold | Justification |
|----------|-----------|----------------|
| Performance | 90 | User experience critical |
| Accessibility | 95 | Inclusive design is essential |
| Best Practices | 90 | Security and standards |
| SEO | 90 | Discoverability important |
| PWA | Off | Not critical for web app |

### Core Web Vitals

Tracked in extended config:
- **FCP** (First Contentful Paint): < 1.8s - When first content appears
- **LCP** (Largest Contentful Paint): < 2.5s - When largest content appears
- **CLS** (Cumulative Layout Shift): < 0.1 - Visual stability metric

## Workflow Triggers

The Lighthouse workflow runs when:
1. A PR is opened
2. New commits are pushed to a PR
3. A PR is reopened
4. Changes to `frontend-scaffold/**`
5. Changes to `.github/workflows/lighthouse.yml`
6. Manual trigger via `workflow_dispatch`

### Manual Trigger Usage

```bash
# Trigger workflow with custom URL
gh workflow run lighthouse.yml \
  -f url=https://custom-preview-url.vercel.app
```

## Vercel Integration

The workflow automatically detects Vercel preview URLs by:

1. **Looking for Vercel bot comments**: Vercel posts deployment links in PR comments
2. **Checking deployment statuses**: Uses GitHub deployment APIs
3. **Waiting for deployment**: Polls for up to 5 minutes if not found
4. **Manual override**: Use workflow input to specify custom URL

## PR Comment Output

When Lighthouse completes, it posts a comment like:

```markdown
## 📊 Lighthouse Performance Report

**URL**: https://stellar-tipz-pr-123.vercel.app

### Scores

| Category | Score | Status |
|----------|-------|--------|
| Performance | 92 | ✅ (min: 90) |
| Accessibility | 97 | ✅ (min: 95) |
| Best-practices | 91 | ✅ (min: 90) |
| Seo | 93 | ✅ (min: 90) |

### Opportunities

**Top Optimization Opportunities:**

- Eliminate render-blocking resources (~1250ms)
- Minify JavaScript (~850ms)
- Reduce unused JavaScript (~650ms)

### Key Metrics

- **First Contentful Paint**: 1.23s
```

## Integration Points

### With Vercel Deployments
- Automatically finds Vercel preview URL
- Waits for deployment if not yet ready
- Supports manual URL override

### With GitHub Actions
- Runs on PR events automatically
- Posts results as comments
- Fails PR if thresholds not met
- Uploads artifacts for analysis

### With GitHub Reviews
- Performance checks required before merge
- Status checks visible in PR UI
- Historical tracking via artifacts

## Running Locally

To run Lighthouse locally before pushing:

```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Run against local development server
lhci autorun --config=.lighthouserc.json --url=http://localhost:3000

# Run against specific URL
LHCI_GITHUB_APP_TOKEN=xxx lhci autorun \
  --config=.lighthouserc.json \
  --url=https://your-preview-url.vercel.app
```

## Understanding Results

### Performance Score (0-100)
- 90-100: Good
- 50-89: Needs improvement
- 0-49: Poor

Key metrics affecting score:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### Accessibility Score (0-100)
- 90-100: Excellent
- 75-89: Good
- 50-74: Needs improvement
- 0-49: Critical issues

Checks:
- Color contrast
- ARIA labels
- Keyboard navigation
- Form labels

### Best Practices Score (0-100)
- Security issues
- Browser compatibility
- Web standards compliance

### SEO Score (0-100)
- Mobile-friendly
- Meta descriptions
- Structured data
- Crawlability

## Troubleshooting

### "Could not find Vercel preview deployment URL"
**Cause**: Vercel hasn't deployed yet or comment hasn't been posted

**Solutions**:
1. Wait for Vercel deployment (usually 2-5 minutes)
2. Check Vercel deployment status in GitHub checks
3. Use manual workflow trigger with custom URL
4. Verify Vercel is configured for this repository

### "Lighthouse CI failed with score below threshold"
**Cause**: One or more metrics scored below minimum

**Solution**:
1. Review the PR comment with scores
2. Check "Opportunities" section for fixes
3. Implement suggestions
4. Re-push to trigger re-run

### "Timeout waiting for Vercel deployment"
**Cause**: Deployment taking longer than 5 minutes

**Solutions**:
1. Check Vercel build logs
2. If build failing, fix errors first
3. Manually trigger workflow with deployed URL
4. Increase timeout in workflow (edit lighthouse.yml)

### "Chrome flags error"
**Cause**: Sandbox not compatible with CI environment

**Solution**:
Already handled by `--no-sandbox` flag in configuration

## Performance Tips

To maintain good Lighthouse scores:

### 1. Keep JavaScript Small
```
- Use code splitting
- Lazy load routes
- Remove unused dependencies
```

### 2. Optimize Images
```
- Use WebP format
- Responsive images with srcset
- Lazy load below fold
```

### 3. Reduce Network Requests
```
- Combine small assets
- Minify CSS/JS
- Remove unused CSS
```

### 4. Improve Accessibility
```
- Use semantic HTML
- Add alt text to images
- Ensure color contrast
- Test with keyboard
```

### 5. Monitor Core Web Vitals
```
- First Contentful Paint < 1.8s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
```

## Historical Tracking

Lighthouse results are uploaded to temporary public storage:

1. **Artifact Storage**: Results stored 30 days in GitHub artifacts
2. **Trend Analysis**: Review artifact history to track improvement
3. **Regression Detection**: Compare against previous runs

### Viewing Historical Data

```bash
# Download artifacts from GitHub CLI
gh run download WORKFLOW_ID

# Or download from GitHub UI
# Actions → Workflow → Click run → Artifacts
```

## CI Thresholds Configuration

To adjust thresholds, edit `.lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],  // Lower threshold
        "categories:seo": ["warn", { "minScore": 0.8 }]             // Warn only
      }
    }
  }
}
```

## Preset Configurations

Available presets in Lighthouse:

```
lighthouse:recommended  - Default (recommended)
lighthouse:all         - Include all audits
lighthouse:full        - Maximum detail
```

## Next Steps

### Implementation
1. ✅ `.lighthouserc.json` configured
2. ✅ Workflow created
3. ✅ Vercel integration ready
4. Next: Create PR to test integration

### Monitoring
1. Review CI results on next PR
2. Adjust thresholds if needed
3. Track trends over time
4. Share results with team

### Optimization
1. Review Lighthouse recommendations
2. Implement high-impact suggestions
3. Monitor improvements in future runs
4. Document performance decisions

## References

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Audits](https://web.dev/lighthouse-audits/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Accessibility Basics](https://web.dev/accessibility/)
- [Web Standards](https://web.dev/lighthouse-best-practices/)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review GitHub Actions logs
3. Check Lighthouse CI documentation
4. Verify Vercel configuration
5. Review PR comments for specific failures

---

**Last Updated**: May 26, 2026
**Issue**: #511 - Add Lighthouse CI for automated performance monitoring
**Status**: ✅ Configured and Ready
