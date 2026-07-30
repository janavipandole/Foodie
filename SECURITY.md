# 🛡️ Security Policy for Foodie

The Foodie development team takes the security of our application and the privacy of our users as our highest priority. We believe in transparent, secure development and are committed to working closely with the security research community to ensure the safety of our platform.

---

## 📌 Supported Versions

We currently provide active security updates, patches, and hotfixes for the following branches and versions of Foodie:

| Version | Branch | Security Support | Maintenance Status | Next End of Life |
| :---: | :---: | :---: | :--- | :--- |
| **`v1.x.x` (Current)** | `main` | ✅ **Fully Supported** | Active feature development & critical patches | TBD |
| **`v0.x.x` (Beta)** | `beta` | ❌ **Unsupported** | Deprecated. Please migrate to v1.x.x | Passed |

> [!WARNING]
> Please ensure you are testing against the `main` branch before submitting any vulnerability reports. Vulnerabilities discovered in older, unsupported versions will be marked as informative but will not be officially addressed.

---

## 🎯 Scope of Vulnerability Reporting

When testing the Foodie web application and browser extensions, please prioritize your efforts on the following critical threat vectors:

- **Authentication & Authorization:** Weak password handling, missing authentication checks, broken access control (BOLA/IDOR), or privilege escalation.
- **Client-Side Attacks:** Stored/Reflected Cross-Site Scripting (XSS), DOM-based vulnerabilities, and sensitive data exposure in `localStorage`, `sessionStorage`, or cookies.
- **Data Integrity & Server-Side:** Bypassing client-side validation logic, order modification, SQL Injection (SQLi), Server-Side Request Forgery (SSRF), or insecure direct object references.
- **Dependency Vulnerabilities:** Exploitable flaws in third-party libraries we use (e.g., active exploit chains that bypass our existing Dependabot configurations).

### 🚫 Out of Scope

To save both your time and ours, the following issues are generally considered **out of scope** and will not be accepted:
- Clickjacking on pages with no sensitive actions.
- Missing HTTP security headers (unless they directly lead to an exploitable vulnerability).
- Vulnerabilities requiring unlikely user interaction or physical access to an unlocked device.
- Denial of Service (DoS) or Distributed Denial of Service (DDoS) attacks.
- Spam, social engineering, or phishing attacks targeting Foodie employees or users.
- Output from automated scanners without a valid proof of concept.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, **please do NOT report it by creating a public GitHub issue**. Responsible disclosure is critical to protecting our users. 

Follow these steps to securely disclose the issue to our maintainers:

1. **GitHub Security Advisories:** Navigate to the **Security** tab of this repository and click **Report a vulnerability**. This creates a Private Vulnerability Report.
2. **Direct Email (Alternative):** If GitHub Security Advisories are disabled, please email our security team directly at `security@foodie-app.mock` (simulated).

### 📝 Report Template
When submitting a report, please include the following details to help us triage the issue quickly:
- **Vulnerability Type** (e.g., Stored XSS, Authentication Bypass, Data Leak).
- **Location** of the vulnerability (e.g., specific file, API endpoint, or script).
- **Steps to Reproduce** the issue (a clear proof-of-concept snippet or video is highly appreciated).
- **Impact Analysis** (what can an attacker achieve? Data exfiltration? Account takeover?).
- **Suggested Remediation** (if you have one).

---

## 🔄 Our Incident Response Process

We strive to handle all reports with speed and professionalism:

1. **Acknowledgment:** We will acknowledge receipt of your vulnerability report within **48 hours**.
2. **Triage & Verification:** Our security engineering team will review the report and attempt to reproduce the vulnerability within **3-5 business days**. We may reach out for further clarification.
3. **Resolution & Patching:** Once verified, we will develop a patch. High-severity issues are typically patched within **7 days**.
4. **Disclosure & Credit:** After the patch is deployed and users have been notified, we may publicly disclose the vulnerability via a CVE and credit you in our Security Hall of Fame (if you desire).

---

## 🛠️ Security Best Practices for Contributors

If you are contributing code to Foodie, you are required to adhere to the following secure coding guidelines:

- **Input Sanitization:** Always sanitize and validate user input on both the client and server side. When rendering data to the DOM, prevent XSS by using safe properties (e.g., `textContent` instead of `innerHTML`) or a trusted HTML sanitizer (like DOMPurify).
- **Secure Storage:** **Never** store sensitive data (e.g., plain-text passwords, JWT tokens, PII) in `localStorage`. Use `HttpOnly`, `Secure` cookies for session tokens.
- **Least Privilege:** Ensure all API endpoints rigorously check user roles and permissions before performing actions or returning data.
- **Dependency Auditing:** Avoid introducing unsafe dependencies. Always review the security posture of new libraries and ensure you are using the latest stable versions.

---

*Thank you for helping keep the Foodie community safe and secure! 🍔🔐*
