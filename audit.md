# Technical PRD — n8n Community Node Quality & Security Audit

## 1. Objective

Build a repeatable audit process for our newly published **n8n community node** to verify that the package is:

* Secure
* Stable
* Compatible with n8n
* Production-ready
* Well-tested
* Efficient
* Easy to maintain
* Safe for external users to install and run

The audit should produce a **quality score, findings, severity levels, and remediation recommendations**.

---

## 2. Scope

The audit covers:

1. Source code
2. n8n node implementation
3. Credentials
4. Dependencies
5. API communication
6. Error handling
7. Input/output handling
8. Security
9. Testing
10. Build and npm package
11. Documentation
12. Performance

Out of scope:

* Business logic correctness beyond the node's documented functionality
* Infrastructure security outside the package
* n8n core security

---

# 3. Audit Architecture

```text
GitHub Repository
       │
       ▼
┌──────────────────────┐
│ Repository Scanner   │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
Static Analysis  Dependency Audit
     │           │
     └─────┬─────┘
           ▼
┌──────────────────────┐
│ n8n Node Audit       │
│                      │
│ • Credentials        │
│ • Parameters         │
│ • Execute()          │
│ • Item Linking       │
│ • Error Handling     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Security Audit       │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Automated Tests      │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Quality Scoring      │
└──────────┬───────────┘
           ▼
      Audit Report
```

---

# 4. Audit Categories

## 4.1 Repository Audit

Check:

* Repository structure
* TypeScript configuration
* ESLint configuration
* Build configuration
* npm configuration
* `.gitignore`
* README
* License
* Versioning
* GitHub Actions
* Test structure

### Acceptance Criteria

* Repository can be cloned and built from a clean environment.
* No unnecessary files are included in the npm package.
* No secrets are committed.
* Build produces the expected `dist` output.
* npm package contains only required production files.

---

# 5. Dependency Audit

Run:

```bash
npm audit
```

Also inspect:

```bash
npm outdated
npm ls
```

Check for:

* Critical vulnerabilities
* High vulnerabilities
* Unmaintained packages
* Excessive dependencies
* Unnecessary runtime dependencies
* Dependency version pinning
* Suspicious packages

### Acceptance Criteria

**Critical vulnerabilities: 0**

**High vulnerabilities: 0**, unless explicitly reviewed and accepted.

---

# 6. Security Audit

This is the highest-priority section.

## 6.1 Secret Detection

Search for:

```text
API keys
Access tokens
Bearer tokens
Passwords
Private keys
Webhook secrets
JWT secrets
Hardcoded credentials
```

Example:

```bash
git grep -i "api_key"
git grep -i "apikey"
git grep -i "secret"
git grep -i "password"
git grep -i "token"
```

Use secret-scanning tools such as:

* Gitleaks
* GitHub Secret Scanning
* TruffleHog

### Acceptance Criteria

No production secrets exist in source code or Git history.

---

## 6.2 SSRF Protection

If the node allows users to provide URLs, audit for SSRF.

Potential attack:

```text
http://localhost:3000
http://127.0.0.1
http://169.254.169.254
http://10.0.0.1
```

Also inspect:

* Redirect handling
* DNS rebinding
* Internal network access
* User-controlled HTTP requests

### Acceptance Criteria

User-controlled URLs must be validated where applicable.

---

## 6.3 Injection

Check for:

* Command injection
* SQL injection
* JavaScript injection
* Template injection
* Header injection
* Path traversal

Especially inspect:

```typescript
exec(...)
spawn(...)
eval(...)
new Function(...)
```

and dynamic SQL/query construction.

---

# 7. n8n Node Audit

## 7.1 Node Definition

Verify:

```typescript
description: INodeTypeDescription
```

Check:

* `displayName`
* `name`
* `icon`
* `group`
* `version`
* `description`
* `defaults`
* `inputs`
* `outputs`
* `properties`
* `credentials`

---

## 7.2 Parameters

Each parameter should have:

* Clear name
* Description
* Correct type
* Appropriate default
* Validation
* Required/optional state

Example:

```typescript
{
  displayName: 'API Key',
  name: 'apiKey',
  type: 'string',
  typeOptions: {
    password: true,
  },
  default: '',
  required: true,
}
```

Avoid exposing sensitive values as plain text.

---

# 8. Credential Audit

Verify:

* Credentials are defined separately from node logic.
* Secrets are not logged.
* Credentials are not returned as output.
* Authentication headers are generated correctly.
* OAuth refresh behavior works where applicable.
* Authentication errors are handled correctly.

Test:

```text
Valid credentials
Invalid credentials
Expired credentials
Missing credentials
Revoked credentials
```

---

# 9. API Request Audit

Inspect every HTTP request.

Check:

* HTTP method
* URL construction
* Headers
* Authentication
* Request body
* Query parameters
* Timeout
* Retry behavior
* Pagination
* Rate limiting
* Response parsing

Avoid:

```typescript
console.log(response)
```

when the response may contain sensitive information.

---

# 10. Error Handling

Every external API call should have predictable error handling.

Test:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Rate Limited
500 Server Error
502 Bad Gateway
503 Service Unavailable
Timeout
Network Failure
Malformed JSON
Empty Response
```

The node should return useful errors such as:

```text
Authentication failed: API key is invalid.
```

instead of:

```text
Request failed
```

---

# 11. n8n Item Handling

Audit how the node handles:

```typescript
items
```

Check:

* Single item
* Multiple items
* Empty input
* Large input
* Item-to-item mapping
* `pairedItem`
* Expression resolution

Example:

```typescript
return items.map((item, index) => ({
  json: result[index],
  pairedItem: {
    item: index,
  },
}));
```

This is important because downstream n8n expressions depend on correct item relationships.

---

# 12. Input Validation

Test:

```text
Empty string
Null
Undefined
Wrong data type
Very large input
Special characters
Unicode
Malformed JSON
Unexpected arrays
Unexpected objects
```

Example:

```text
email = ""
email = null
email = "test@example.com"
email = {}
```

The node should fail gracefully rather than crash.

---

# 13. Performance Audit

Test:

### Small

```text
1 item
10 items
```

### Medium

```text
100 items
1,000 items
```

### Large

```text
10,000+ items
```

Measure:

* Execution time
* Memory usage
* API calls
* CPU usage
* Response size

Look for:

```typescript
for (...) {
   await apiCall()
}
```

when batching or parallelization would be more appropriate.

But avoid uncontrolled concurrency that can trigger API rate limits.

---

# 14. Testing Strategy

Minimum test coverage:

### Unit Tests

```text
Parameter validation
Data transformation
Authentication
Response parsing
Error handling
```

### Integration Tests

Test the node against the actual API or a controlled mock server.

### n8n Workflow Tests

Example:

```text
Manual Trigger
      ↓
Our Node
      ↓
Set
      ↓
IF
      ↓
HTTP Request
```

Verify the output works correctly with downstream n8n nodes.

---

# 15. Static Code Analysis

Recommended tools:

```bash
npm run lint
npm run build
npm test
npm audit
```

Add:

```text
ESLint
TypeScript
Prettier
Gitleaks
npm audit
```

Optionally:

```text
Semgrep
CodeQL
SonarQube
```

---

# 16. npm Package Audit

Before release:

```bash
npm pack --dry-run
```

Inspect:

```text
package.json
dist/
credentials/
nodes/
README.md
LICENSE
```

Verify that the package does **not** contain:

```text
.env
.env.local
private keys
development files
test secrets
large datasets
debug logs
source credentials
```

Then test installation in a clean environment:

```bash
npm install <package-name>
```

---

# 17. Documentation Audit

README must explain:

### Installation

```bash
npm install <package-name>
```

### Credentials

How users obtain and configure credentials.

### Operations

Every available operation.

### Parameters

Required and optional parameters.

### Examples

At least 3 practical workflow examples.

### Error Handling

Common errors and solutions.

### Limitations

API limits, supported versions, etc.

---

# 18. Compatibility Audit

Test against supported n8n versions.

Minimum:

```text
Current n8n version
Previous supported version
```

Check:

* Community node installation
* Credential loading
* Node execution
* Expressions
* Error behavior
* Webhook behavior if applicable

---

# 19. Quality Scoring

Use a 100-point score.

| Category                |  Weight |
| ----------------------- | ------: |
| Security                |      25 |
| n8n Compatibility       |      20 |
| Reliability             |      15 |
| Testing                 |      15 |
| Code Quality            |      10 |
| Performance             |       5 |
| Documentation           |       5 |
| Package/Release Quality |       5 |
| **Total**               | **100** |

### Rating

```text
90–100   Excellent
80–89    Production Ready
70–79    Needs Improvement
60–69    Risky
<60      Do Not Release
```

### Mandatory Release Gates

Regardless of score:

```text
Critical security issue = FAIL

Hardcoded secret = FAIL

Critical npm vulnerability = FAIL

Node cannot build = FAIL

Node cannot install = FAIL

Credential leakage = FAIL
```

---

# 20. Audit Report

The audit system should generate:

```text
================================
n8n Community Node Audit
================================

Package:
Version:
Repository:
Audit Date:

Overall Score: 87/100
Status: PRODUCTION READY

Security:             23/25
n8n Compatibility:    18/20
Reliability:          14/15
Testing:              12/15
Code Quality:          9/10
Performance:           4/5
Documentation:         4/5
Release Quality:       3/5
```

Then:

```text
CRITICAL
---------
0 issues

HIGH
----
2 issues

MEDIUM
------
4 issues

LOW
----
3 issues
```

Each finding should contain:

```text
ID
Severity
File
Line
Issue
Risk
Recommendation
Status
```

Example:

```text
SEC-001

Severity: HIGH
File: nodes/MyNode/MyNode.node.ts
Line: 142

Issue:
User-controlled URL is sent directly to HTTP client.

Risk:
Potential SSRF vulnerability.

Recommendation:
Validate and restrict destination URLs.
```

---

# 21. CI/CD Quality Gate

The audit should eventually run automatically whenever code is pushed.

```text
Git Push
   ↓
GitHub Actions
   ↓
Install
   ↓
Lint
   ↓
Type Check
   ↓
Build
   ↓
Unit Tests
   ↓
npm Audit
   ↓
Secret Scan
   ↓
Security Scan
   ↓
Package Audit
   ↓
Quality Score
   ↓
PASS / FAIL
```

Example release rule:

```text
IF criticalIssues > 0
    FAIL

IF highSecurityIssues > 0
    FAIL

IF testsFailed > 0
    FAIL

IF score < 80
    BLOCK RELEASE

ELSE
    APPROVE RELEASE
```

---

# 22. Definition of Done

The n8n node is considered production-ready when:

* [ ] Build succeeds
* [ ] Lint succeeds
* [ ] TypeScript check succeeds
* [ ] Tests pass
* [ ] No hardcoded secrets
* [ ] No critical security vulnerabilities
* [ ] No high-risk unresolved security issues
* [ ] Credentials are securely implemented
* [ ] API errors are handled
* [ ] Rate limits are handled
* [ ] Input validation exists
* [ ] n8n item linking is correct
* [ ] Large inputs have been tested
* [ ] npm package has been inspected
* [ ] Clean installation succeeds
* [ ] README is complete
* [ ] Supported n8n versions are tested
* [ ] Overall score ≥ 80
* [ ] Security score ≥ 20/25

---

## 23. Recommended Implementation

For our team, I would make this a **reusable "Node Audit Pipeline"**, rather than manually reviewing every future n8n node.

```text
GitHub
   ↓
GitHub Actions
   ↓
┌──────────────────────────┐
│ Automated Node Auditor   │
├──────────────────────────┤
│ ESLint                   │
│ TypeScript               │
│ npm audit                │
│ Gitleaks                 │
│ Semgrep                  │
│ Unit Tests               │
│ Package Validation       │
│ n8n Compatibility Tests  │
└────────────┬─────────────┘
             ↓
      Quality Scoring
             ↓
      Audit Report
             ↓
       Release Gate
```

The key goal is: **every time we publish an n8n node, the same automated audit runs before the npm release.** This gives us a repeatable quality standard instead of relying on manual code review.
