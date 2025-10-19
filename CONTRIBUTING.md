# Contributing to OpenAsk 🤝

First off, thank you for considering contributing to OpenAsk! It's people like you that make OpenAsk such a great tool for the developer community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [OpenAsk Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com].

## 🚀 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the [existing issues](https://github.com/9jaDevo/OpenAsk/issues) to avoid duplicates.

**When submitting a bug report, include:**

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)
- Error messages and stack traces

**Template:**
```markdown
**Description:**
A clear description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Environment:**
- OS: [e.g., Windows 11, macOS 14]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]
- OpenAsk Version: [e.g., 1.0.0]
```

### Suggesting Features 💡

Feature suggestions are welcome! Please provide:

- Clear and descriptive title
- Detailed description of the proposed feature
- Use case and benefits
- Possible implementation approach (optional)
- Mockups or examples (if applicable)

### Code Contributions 💻

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 8 or higher
- **MongoDB** 6 or higher
- **Git**

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OpenAsk.git
cd OpenAsk

# Add upstream remote
git remote add upstream https://github.com/9jaDevo/OpenAsk.git

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your credentials

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Seed the database
cd apps/api
pnpm seed

# Start development servers
# Terminal 1
cd apps/api
pnpm dev

# Terminal 2
cd apps/web
pnpm dev
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## 📏 Coding Standards

### TypeScript

- Use **strict mode** (`"strict": true`)
- Prefer **interfaces** over types for object shapes
- Use **explicit return types** for functions
- Avoid `any` - use `unknown` or proper types
- Use **const** over let when possible

**Example:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return api.get<User>(`/users/${id}`);
}

// ❌ Bad
function getUser(id: any): any {
  return api.get(`/users/${id}`);
}
```

### React

- Use **functional components** with hooks
- Use **TypeScript** for all components
- Prefer **named exports** over default exports
- Keep components **small and focused** (< 200 lines)
- Extract **custom hooks** for reusable logic
- Use **React.FC** type annotation

**Example:**
```typescript
// ✅ Good
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Bad
export default function(props) {
  return <button className="btn">{props.children}</button>;
}
```

### API Development

- Use **Zod** for request validation
- Return **consistent error shapes**
- Use **async/await** over callbacks
- Implement **proper error handling**
- Add **request logging** with pino
- Write **JSDoc comments** for complex functions

**Example:**
```typescript
// ✅ Good
const createQuestionSchema = z.object({
  title: z.string().min(10).max(160),
  body: z.string().min(20),
  tags: z.array(z.string()).min(1).max(5),
});

router.post('/questions', 
  authRequired,
  validate({ body: createQuestionSchema }),
  async (req: Request, res: Response) => {
    try {
      const question = await Question.create(req.body);
      res.status(201).json(question);
    } catch (error) {
      logger.error(error, 'Failed to create question');
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to create question',
      });
    }
  }
);
```

### Code Style

- Use **Prettier** for formatting (automatic via pre-commit hook)
- Use **ESLint** for linting (run `pnpm lint`)
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line structures

### File Naming

- **React components**: PascalCase (`Button.tsx`, `QuestionCard.tsx`)
- **Utilities/helpers**: camelCase (`sanitize.ts`, `formatDate.ts`)
- **Types/interfaces**: PascalCase (`User.ts`, `Question.ts`)
- **Test files**: `*.test.ts` or `*.spec.ts`

## 📝 Commit Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **ci**: CI configuration changes

### Examples

```bash
# Feature
git commit -m "feat(api): add answer voting endpoint"

# Bug fix
git commit -m "fix(web): resolve question list infinite scroll"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): redesign authentication flow

BREAKING CHANGE: Auth tokens now require audience parameter"
```

### Branch Naming

```bash
# Feature branch
feature/add-comment-system
feature/improve-search-performance

# Bug fix branch
fix/question-vote-count
fix/auth-token-refresh

# Hotfix branch
hotfix/security-vulnerability

# Documentation branch
docs/update-api-reference
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with latest `main`
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks**
   ```bash
   pnpm lint          # Linting
   pnpm typecheck     # Type checking
   pnpm test          # Tests
   pnpm build         # Build verification
   ```

3. **Test manually** in the browser/API client

4. **Update documentation** if needed

5. **Add tests** for new features

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
- [ ] No new warnings
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least 1 approval** from maintainers required
3. **Address review comments** promptly
4. **Squash commits** before merging (if requested)
5. **Merge strategy**: Squash and merge preferred

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage

# Specific test file
pnpm test src/__tests__/questions.test.ts
```

### Writing Tests

- Place tests in `__tests__` directory
- Name test files: `*.test.ts`
- Use **Vitest** testing framework
- Aim for **70%+ coverage**
- Test **happy paths** and **edge cases**

**Example:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Question API', () => {
  describe('POST /api/v1/questions', () => {
    it('should create a question with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'How to test TypeScript?',
          body: 'I need help with testing TypeScript code.',
          tags: ['typescript', 'testing'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('How to test TypeScript?');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Short', // Too short
          tags: [],       // Empty tags
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

## 🐛 Issue Guidelines

### Creating Issues

- **Search existing issues** first
- Use **issue templates** when available
- Provide **clear titles**
- Include **reproduction steps** for bugs
- Add **relevant labels**

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 🎯 Areas Needing Help

We especially welcome contributions in these areas:

- 🧪 **Testing** - Increase test coverage
- 📱 **Frontend** - Complete web app implementation
- 📚 **Documentation** - Tutorials, guides, examples
- 🌐 **Internationalization** - Multi-language support
- ♿ **Accessibility** - ARIA labels, keyboard navigation
- 🎨 **UI/UX** - Design improvements
- 🚀 **Performance** - Optimization opportunities

## 📞 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/9jaDevo/OpenAsk/issues)
- **GitHub Discussions**: [Ask questions and discuss ideas](https://github.com/9jaDevo/OpenAsk/discussions)
- **Documentation**: Check [README.md](README.md) and [API docs](apps/api/README.md)

## 🏆 Recognition

Contributors will be:
- Listed in [README.md](README.md)
- Credited in release notes
- Mentioned in our Hall of Fame (coming soon)

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to OpenAsk!** 🎉

Every contribution, no matter how small, helps make OpenAsk better for everyone.
