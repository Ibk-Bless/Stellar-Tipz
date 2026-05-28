# Security Policy

## Overview

The Stellar Tipz team takes security seriously. We appreciate responsible disclosure and will work with reporters to address verified vulnerabilities promptly.

---

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| `main`   | ✅ Yes     |
| Older branches | ❌ No |

We only actively patch the `main` branch. Please report vulnerabilities against the latest commit on `main`.

---

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available puts users at risk.

### Option 1 — GitHub Private Security Advisory (Preferred)

1. Navigate to the **Security** tab of this repository.
2. Click **"Report a vulnerability"**.
3. Fill in the advisory form with as much detail as possible (see the template below).
4. Submit the advisory. It will be visible only to you and the maintainers.

### Option 2 — Email

Send a report to **security@stellar-tipz.dev** (monitored by the core maintainers). Encrypt your email using our PGP key if the report contains sensitive details:

```
Key ID:   0xEXAMPLE
Fingerprint: XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX
```

> If a PGP key is not yet published, email in plaintext and we will establish an encrypted channel for follow-up.

### Vulnerability Report Template

Please include the following in your report:

```
**Summary:**        One-sentence description of the vulnerability.
**Severity:**       Critical / High / Medium / Low (your assessment)
**Affected component:** Contract / Frontend / CI / Other
**Affected version/commit:** <commit SHA or branch>

**Steps to reproduce:**
1. …
2. …

**Expected behaviour:**   What should happen.
**Actual behaviour:**     What actually happens.

**Proof of concept:**     Code snippet, transaction hash, or screenshot (optional but helpful).

**Suggested fix:**        If you have one (optional).

**Disclosure timeline:**  When do you plan to disclose publicly?
```

---

## Scope

### In scope

| Component | Description |
| --------- | ----------- |
| Smart contract (`contracts/`) | Logic errors, access-control bypasses, arithmetic overflows, reentrancy, fund loss |
| Frontend (`frontend-scaffold/`) | XSS, CSRF, wallet key exposure, insecure direct object references |
| CI/CD (`.github/workflows/`) | Supply-chain attacks, secret leakage, workflow injection |
| Dependencies | Transitive vulnerabilities with a clear exploit path in this project |

### Out of scope

- Vulnerabilities in the Stellar network protocol itself (report to [SDF](https://www.stellar.org/foundation/security)).
- Theoretical or "informational" findings with no practical exploit path.
- Issues already listed in open GitHub issues or known limitations in the README.
- Social-engineering attacks against team members.
- Denial-of-service via resource exhaustion that requires > 10,000 USD of XLM.

---

## Response Time Commitments

| Milestone | Target SLA |
| --------- | ---------- |
| **Acknowledgement** of receipt | 2 business days |
| **Initial triage** (severity assessment) | 5 business days |
| **Status update** (accepted / declined / needs more info) | 10 business days |
| **Fix deployed** for Critical / High | 14 calendar days after acceptance |
| **Fix deployed** for Medium | 30 calendar days after acceptance |
| **Fix deployed** for Low | Next scheduled release |
| **Public disclosure** (coordinated) | After fix is deployed; coordinated with reporter |

If we are unable to meet a deadline, we will communicate the delay and provide a revised timeline.

---

## Severity Definitions

We follow [CVSS v3.1](https://www.first.org/cvss/calculator/3.1) as a baseline and adjust based on the on-chain financial impact.

| Severity | CVSS Range | Examples |
| -------- | ---------- | -------- |
| **Critical** | 9.0–10.0 | Fund theft, contract takeover, unauthorized admin transfer |
| **High** | 7.0–8.9 | Balance manipulation, fee bypass, leaderboard spoofing |
| **Medium** | 4.0–6.9 | Information leakage, denial of service for a single user |
| **Low** | 0.1–3.9 | Minor UI issues, non-sensitive data exposure |

---

## Safe Harbour

Stellar Tipz will not take legal action against researchers who:

- Report vulnerabilities through the responsible disclosure process described above.
- Do not exfiltrate, modify, or destroy data beyond what is minimally required to demonstrate the vulnerability.
- Do not disrupt production services or other users.
- Do not demand payment as a condition of disclosure.

We ask that you give us a reasonable window to address the issue before any public disclosure.

---

## Hall of Fame

We publicly recognise researchers who help keep Stellar Tipz secure. With your permission, we will add your name or handle here after the fix is deployed.

| Researcher | Severity | Year | Summary |
| ---------- | -------- | ---- | ------- |
| *(Be the first!)* | — | — | — |

---

## Security Best Practices for Users

- **Never share your wallet seed phrase or private key** with anyone, including the Tipz team.
- Always verify the URL is `stellar-tipz.vercel.app` (or the official domain) before connecting your wallet.
- Use a hardware wallet or a dedicated browser profile for on-chain interactions.
- Review each transaction your wallet prompts you to sign before approving.

---

## Resources

- [GitHub Security Advisories for this repo](../../security/advisories)
- [Stellar Development Foundation Security Policy](https://www.stellar.org/foundation/security)
- [CVSS v3.1 Calculator](https://www.first.org/cvss/calculator/3.1)
- [Soroban Security Documentation](https://soroban.stellar.org/docs/learn/security)
