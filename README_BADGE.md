# 🏷️ **README Badge - Ready to Paste**

## **GitHub Actions Status Badge**

Add this to your README.md under the CI section:

```markdown
[![E2E Tests](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg)](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml)
```

## **Custom Badge with Custom Text**

```markdown
[![Frontend E2E](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg?label=Frontend%20E2E)](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml)
```

## **Complete CI Section Example**

```markdown
## 🧪 **Testing**

- **E2E Tests**: [![Frontend E2E](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg?label=Frontend%20E2E)](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml)
- **Preflight**: `npm run preflight`
- **Local E2E**: `npm run dev` then `npx playwright test`

## 🚀 **CI/CD**

- **Required Checks**: `frontend:e2e` (only check required on main)
- **Health Gate**: Fast-fail API health check before tests
- **Protection Mode**: Always-on resilience for leagues endpoint
```

## **Badge URLs**

Replace `your-username` and `customvenom-frontend` with your actual values:

- **Repository**: `https://github.com/your-username/customvenom-frontend`
- **Workflow**: `frontend-e2e.yml`
- **Badge**: `https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg`

## **Badge States**

- 🟢 **Passing**: Green badge when tests pass
- 🔴 **Failing**: Red badge when tests fail
- 🟡 **Running**: Yellow badge when tests are running
- ⚪ **Unknown**: Gray badge when no recent runs

## **Advanced Badge Options**

### **Branch-Specific Badge**
```markdown
[![E2E Tests](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg?branch=main)](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml)
```

### **Custom Style**
```markdown
[![E2E Tests](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml/badge.svg?style=flat-square)](https://github.com/your-username/customvenom-frontend/actions/workflows/frontend-e2e.yml)
```

---

**✅ Copy-paste ready! Just replace the repository details with your actual values.**
