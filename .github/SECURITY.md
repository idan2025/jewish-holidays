# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| main    | :white_check_mark: |

## Security Scanning

This project uses multiple layers of security scanning:

### 1. Dependency Scanning
- **npm audit**: Runs on every build to check for known vulnerabilities in npm packages
- **Dependabot**: Automatically creates PRs for dependency updates weekly
- **Dependency Review**: Reviews dependency changes in pull requests

### 2. Docker Image Scanning
- **Trivy**: Scans Docker images for OS and application vulnerabilities
- Runs before pushing images to Docker Hub
- Fails builds if critical or high vulnerabilities are found

### 3. Code Analysis
- **CodeQL**: Automated code scanning for security vulnerabilities
- Runs weekly and on pull requests

### 4. Continuous Monitoring
- Weekly automated scans run every Monday at 9 AM UTC
- Results are uploaded to GitHub Security tab
- Critical/high vulnerabilities fail the build

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly at [your-email@example.com]
3. Include detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### Response Timeline
- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

## Security Best Practices

When contributing to this project:

1. **Dependencies**: Always use exact versions or caret ranges for security-critical packages
2. **Secrets**: Never commit secrets, API keys, or credentials
3. **Updates**: Keep dependencies updated, especially security patches
4. **Testing**: Run `npm audit` locally before committing
5. **Docker**: Use specific base image versions, not `latest`

## Recent Security Incidents

### CVE-2025-55182 & CVE-2025-66478 (December 2025)
- **Impact**: Critical RCE vulnerability in React Server Components
- **Action Taken**: Updated React to 19.1.2 and Next.js to 15.5.9
- **Date Fixed**: January 7, 2026
- **Status**: ✅ Resolved

## Security Tooling

### Local Development
Run security checks locally:

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically (when possible)
npm audit fix

# Check for high/critical only
npm audit --audit-level=high

# Scan Docker image with Trivy
docker build -t jewish-holidays:scan .
trivy image jewish-holidays:scan
```

### CI/CD Pipeline
All builds automatically run:
- npm audit (fails on high/critical)
- Trivy Docker scan (fails on high/critical with fixes)
- CodeQL analysis (weekly)

## Compliance

This project follows:
- OWASP Top 10 guidelines
- CIS Docker Benchmark recommendations
- npm security best practices

## Security Contact

For security concerns, contact:
- GitHub Security Advisories: Use the Security tab
- Email: [your-email@example.com] (replace with actual email)

Last Updated: January 7, 2026
