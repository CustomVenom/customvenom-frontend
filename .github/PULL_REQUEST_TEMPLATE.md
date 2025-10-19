## Description

<!-- Briefly describe what this PR does -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] CI/CD or workflow change
- [ ] UI/UX change

## CI Guardrails Checklist

**Required for all PRs that modify workflows:**

- [ ] Notion/GitHub posting steps skip gracefully when secrets/vars missing
- [ ] Long JSON posting uses `scripts/*.sh` + `jq`, not inline YAML string concatenation
- [ ] CI guardrails banner present at top of workflow file

**Skip this section if your PR doesn't touch workflows.**

## Testing

- [ ] Tested locally
- [ ] Type checks pass (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] CI passes (including guardrails verification)

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Additional Context

<!-- Add any other context, notes, or migration steps here -->

