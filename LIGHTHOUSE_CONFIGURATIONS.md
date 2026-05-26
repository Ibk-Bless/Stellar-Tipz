# Desktop Configuration
# .lighthouserc.json - Default configuration for desktop audits
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--no-sandbox"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["off"]
      }
    }
  }
}

---

# Mobile Configuration
# .lighthouserc.mobile.json - Configuration for mobile audits (future)
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--no-sandbox",
        "emulatedFormFactor": "mobile",
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638,
          "cpuSlowdownMultiplier": 4
        }
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.85 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["off"]
      }
    }
  }
}

---

# Notes on Device Configurations

## Desktop (Current)
- Chrome default emulation
- 2.7x CPU slowdown (simulates mid-tier device)
- Standard network throttling
- Performance threshold: 90

## Mobile (For Future Implementation)
- 4G 4x slowdown
- Mobile device emulation
- More aggressive thresholds due to constraints
- Performance threshold: 85 (more realistic)

## Why Different Thresholds?
Mobile devices have:
- Slower processors
- Limited memory
- Slower network connectivity
- Different viewport considerations

Therefore:
- Mobile performance threshold is slightly lower (85 vs 90)
- Accessibility same for both (95) - universal standard
- Best practices slightly lower on mobile (85 vs 90)
