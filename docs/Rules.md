# 📏 DEVELOPMENT RULES & GUIDELINES
## Sign Language Bridge - Coding Standards & Best Practices

---

## 1. CODE STYLE & CONVENTIONS

### 1.1 Python (Training & Backend ML)

```python
# ✅ DO: Follow PEP 8
def preprocess_image(image_path: str) -> np.ndarray:
    """Load and preprocess image for model."""
    img = cv2.imread(image_path)
    img = cv2.resize(img, (64, 64))
    return img / 255.0

# ❌ DON'T: Unclear variable names, no type hints
def proc(i):
    img = cv2.imread(i)
    img = cv2.resize(img, (64, 64))
    return img / 255
```

**Rules:**
- Use type hints for all functions
- Docstrings for all functions
- Max line length: 100 characters
- 4 spaces for indentation
- Snake_case for variables and functions
- PascalCase for classes

### 1.2 JavaScript/React (Frontend)

```javascript
// ✅ DO: Clear naming, proper formatting
const handlePrediction = async (frame) => {
  const prediction = await model.predict(frame);
  return prediction;
};

// ❌ DON'T: Unclear names, no async handling
const pred = (f) => {
  return model.predict(f);
};
```

**Rules:**
- camelCase for variables and functions
- PascalCase for React components
- Use async/await (not .then())
- Arrow functions preferred
- Semicolons required
- Single quotes for strings
- 2 spaces for indentation

### 1.3 File Naming

```
Python:
├── 1_load_data.py          (snake_case, numbered)
├── 2_preprocess.py
├── 3_train_model.py
└── utils/image_processor.py

React:
├── components/
│   ├── Camera.jsx          (PascalCase)
│   ├── Prediction.jsx
│   └── Controls.jsx
├── hooks/
│   ├── useCamera.js        (use prefix)
│   └── useModel.js
├── utils/
│   ├── imageUtils.js       (camelCase)
│   └── modelUtils.js
└── styles/
    ├── Camera.module.css   (component-specific)
    └── globals.css
```

---

## 2. GIT WORKFLOW

### 2.1 Branch Naming

```
main                           (production, stable)
  ↓
develop                        (development, testing)
  ↓
feature/asl-recognition       (new features)
feature/emoji-support
feature/urdu-translation
  ↓
bugfix/camera-lag             (bug fixes)
bugfix/translation-error
```

### 2.2 Commit Messages

```
✅ GOOD commit messages:
feat: Add emoji support for common signs
fix: Fix camera lag in real-time detection
docs: Update README with setup instructions
style: Format code according to PEP 8
refactor: Simplify prediction logic
test: Add unit tests for model inference

❌ BAD commit messages:
fixed stuff
updated
wip
asdf
commit
```

**Format:**
```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Dependencies, build

### 2.3 Pull Request Process

```
1. Create feature branch from develop
2. Make changes locally
3. Test thoroughly
4. Push to GitHub
5. Create Pull Request with:
   - Clear title
   - Description of changes
   - Screenshots (if UI change)
6. Code review (partner reviews)
7. Fix feedback if needed
8. Merge to develop
9. Test in staging
10. Merge develop → main (release)
```

---

## 3. TESTING REQUIREMENTS

### 3.1 Unit Tests

```python
# ✅ Test each function independently
def test_preprocess_image():
    """Test image preprocessing."""
    img = preprocess_image('test.jpg')
    assert img.shape == (64, 64, 3)
    assert img.min() >= 0
    assert img.max() <= 1

def test_model_prediction():
    """Test model prediction."""
    model = load_model('asl_model.h5')
    prediction = model.predict(test_image)
    assert prediction.shape == (26,)
    assert sum(prediction) == pytest.approx(1.0)
```

### 3.2 Integration Tests

```javascript
// ✅ Test components together
test('Camera and Model integration', async () => {
  const { getByTestId } = render(<Camera />);
  const video = getByTestId('camera-video');
  
  await waitFor(() => {
    expect(video).toHaveBeenCalled();
  });
  
  const prediction = await model.predict(videoFrame);
  expect(prediction.letter).toBeDefined();
});
```

### 3.3 Performance Tests

```python
# ✅ Ensure real-time performance
def test_inference_speed():
    """Model must run in < 100ms."""
    start = time.time()
    for _ in range(100):
        model.predict(test_image)
    avg_time = (time.time() - start) / 100
    
    assert avg_time < 0.1, f"Inference too slow: {avg_time}s"
```

**Testing Standards:**
- Minimum 80% code coverage
- All critical paths tested
- Performance benchmarks established
- Edge cases tested

---

## 4. CODE REVIEW CHECKLIST

Before submitting a PR, ensure:

```
✅ Code Quality
  [ ] Code follows style guide
  [ ] No console.logs or print statements
  [ ] No commented-out code
  [ ] Proper error handling
  [ ] Type hints/JSDoc present

✅ Functionality
  [ ] Feature works as intended
  [ ] All acceptance criteria met
  [ ] No breaking changes
  [ ] Backward compatible

✅ Testing
  [ ] Unit tests pass
  [ ] Integration tests pass
  [ ] No regressions
  [ ] Coverage > 80%

✅ Performance
  [ ] No unnecessary re-renders
  [ ] Model inference < 100ms
  [ ] API response < 500ms
  [ ] Memory usage acceptable

✅ Security
  [ ] No hardcoded secrets
  [ ] Input validation present
  [ ] No XSS vulnerabilities
  [ ] API calls authenticated

✅ Documentation
  [ ] README updated
  [ ] Comments added for complex logic
  [ ] API docs updated
  [ ] Screenshots included (if UI)
```

---

## 5. DOCUMENTATION STANDARDS

### 5.1 Code Comments

```python
# ✅ GOOD: Explain WHY, not WHAT
# We normalize by dividing by 255 because pixel values are 0-255
# and the model expects values between 0-1
X = X / 255.0

# ❌ BAD: Obvious what it does, not why
# Divide by 255
X = X / 255.0
```

### 5.2 Docstrings

```python
# ✅ GOOD: Comprehensive docstring
def train_model(X_train, y_train, epochs=20, batch_size=32):
    """
    Train CNN model on ASL dataset.
    
    Args:
        X_train (np.ndarray): Training images, shape (n, 64, 64, 3)
        y_train (np.ndarray): Training labels, shape (n,), values 0-25
        epochs (int): Number of training epochs. Default: 20
        batch_size (int): Batch size for training. Default: 32
    
    Returns:
        keras.Model: Trained model with accuracy >= 95%
    
    Raises:
        ValueError: If X_train shape invalid
        FileNotFoundError: If data files not found
    
    Example:
        >>> model = train_model(X_train, y_train, epochs=10)
        >>> accuracy = evaluate_model(model, X_test)
    """
    pass
```

### 5.3 README Standards

```markdown
# Project Name

## Overview
Brief description (2-3 sentences)

## Features
- Feature 1
- Feature 2

## Quick Start
1. Clone repo
2. Install dependencies
3. Run command

## Project Structure
Folder explanation

## Contributing
How to contribute

## License
License info
```

---

## 6. PERFORMANCE STANDARDS

### 6.1 Frontend Performance

| Metric | Target | Acceptable |
|--------|--------|------------|
| Page Load Time | < 2s | < 5s |
| Model Inference | < 100ms | < 200ms |
| API Response | < 500ms | < 1s |
| FPS (Camera) | 30+ | 24+ |
| Memory Usage | < 200MB | < 500MB |

### 6.2 Backend Performance

| Metric | Target | Acceptable |
|--------|--------|------------|
| API Response | < 500ms | < 1s |
| Database Query | < 100ms | < 200ms |
| Translation API | < 2s | < 5s |
| TTS Generation | < 5s | < 10s |
| Concurrent Users | 1000+ | 500+ |

---

## 7. SECURITY RULES

### 7.1 Secrets Management

```
❌ NEVER commit:
- API keys
- Database passwords
- Private keys
- JWT secrets
- AWS credentials

✅ USE:
- .env files (in .gitignore)
- Environment variables
- Secret managers (Firebase, Google Cloud)
- Encrypted vaults

Example .env:
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_GOOGLE_TRANSLATE_API_KEY=yyy
NODE_ENV=production
```

### 7.2 Input Validation

```python
# ✅ GOOD: Validate all inputs
def translate_text(text: str, target_language: str) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be string")
    if len(text) > 1000:
        raise ValueError("text too long")
    if target_language not in ['en', 'ur']:
        raise ValueError("unsupported language")
    
    return google_translate(text, target_language)

# ❌ BAD: No validation
def translate_text(text, lang):
    return google_translate(text, lang)
```

### 7.3 API Security

```javascript
// ✅ GOOD: Verify auth token
app.post('/api/conversations', authenticateToken, (req, res) => {
  const userId = req.user.id;  // From verified token
  saveConversation(userId, req.body);
});

// ❌ BAD: No auth check
app.post('/api/conversations', (req, res) => {
  saveConversation(req.body.userId, req.body);  // User can fake ID
});
```

---

## 8. LOGGING & ERROR HANDLING

### 8.1 Logging Levels

```python
import logging

logger = logging.getLogger(__name__)

# DEBUG: Detailed info for debugging
logger.debug("Model loaded successfully")

# INFO: General informational messages
logger.info(f"Training started, {n} images")

# WARNING: Something unexpected
logger.warning("Low confidence prediction: 0.65")

# ERROR: Something went wrong
logger.error("Failed to load model", exc_info=True)

# CRITICAL: System might fail
logger.critical("Database connection lost")
```

### 8.2 Error Handling

```python
# ✅ GOOD: Specific error handling
try:
    model = load_model('asl_model.h5')
except FileNotFoundError:
    logger.error("Model file not found")
    raise
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise

# ❌ BAD: Catch all exceptions silently
try:
    model = load_model('asl_model.h5')
except:
    pass  # Silently fail
```

---

## 9. DEPLOYMENT RULES

### 9.1 Before Deploying

```
✅ Checklist:
  [ ] All tests passing
  [ ] No console errors/warnings
  [ ] Environment variables set correctly
  [ ] Database migrations run
  [ ] API endpoints working
  [ ] Model accuracy verified
  [ ] Performance benchmarks met
  [ ] Security audit passed
  [ ] Documentation updated
```

### 9.2 Deployment Process

```bash
# 1. Merge to main branch
git checkout develop
git pull origin develop
git checkout main
git merge develop

# 2. Tag version
git tag v1.0.0
git push origin main --tags

# 3. Deploy (automated via CI/CD)
# GitHub Actions runs tests
# If all pass → deploy to Firebase
# If fails → rollback and alert team

# 4. Monitor
# Check logs for errors
# Monitor performance metrics
# Check user feedback
```

---

## 10. NAMING CONVENTIONS

### 10.1 Constants

```python
# ✅ ALL CAPS for constants
IMG_SIZE = 64
NUM_CLASSES = 26
CONFIDENCE_THRESHOLD = 0.7
MODEL_PATH = 'models/asl_model.h5'

# ❌ Don't use for constants
img_size = 64
ImageSize = 64
```

### 10.2 Database Field Naming

```
✅ GOOD: snake_case, lowercase
user_id
created_at
is_public
total_conversations

❌ BAD: camelCase, spaces, special chars
userId
created at
isPublic
total_conversations123
```

---

## 11. DEPENDENCY MANAGEMENT

### 11.1 Requirements

```
requirements.txt (Python):
- Pin specific versions
- Group by category
- Include comments

tensorflow==2.13.0
opencv-python==4.8.0.76
numpy==1.24.3

package.json (JavaScript):
- Use ^ for flexibility
- Update regularly
- Audit for vulnerabilities

"react": "^18.2.0",
"tensorflow/tfjs": "^4.10.0"
```

### 11.2 Dependency Updates

```bash
# Check for updates
npm outdated
pip list --outdated

# Update safely
npm update
pip install --upgrade package_name

# Test after update
npm test
pytest tests/
```

---

## 12. VERSION CONTROL RULES

### 12.1 Never Push to Main

```
✅ DO:
1. Create feature branch
2. Make changes
3. Test locally
4. Push to feature branch
5. Create PR
6. Code review
7. Merge via PR

❌ DON'T:
- Force push (git push -f)
- Commit directly to main
- Merge without review
- Delete branches randomly
```

### 12.2 Merge Conflicts

```bash
# Resolve locally, don't merge automatically
git fetch origin
git merge origin/develop
# Resolve conflicts in editor
git add .
git commit -m "Resolve merge conflicts"
git push origin feature/branch
```

---

## 13. TEAM COMMUNICATION RULES

### 13.1 Before Starting

```
✅ DO:
- Tell partner what you're working on
- Update task status in tracker
- Ask for help if stuck > 30 mins
- Share progress daily

❌ DON'T:
- Start without discussing
- Work on same feature separately
- Keep problems to yourself
- Disappear for hours
```

### 13.2 Code Review Etiquette

```
✅ DO:
- Be constructive and kind
- Suggest improvements
- Ask questions if unclear
- Test changes locally

❌ DON'T:
- Reject without explanation
- Be critical of person
- Approve without reviewing
- Approve duplicate code
```

---

## 14. ACCESSIBILITY RULES

### 14.1 Web Content Accessibility Guidelines (WCAG)

```
✅ DO:
- Use semantic HTML (<button>, <header>, not <div>)
- Alt text for images
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatible

❌ DON'T:
- Images without alt text
- Only color to convey info
- Unclickable clickable elements
- Flash or animations > 3x/sec
```

### 14.2 Component Accessibility

```jsx
// ✅ GOOD: Accessible button
<button 
  onClick={handleClick}
  aria-label="Recognize sign"
  className="bg-blue-500 py-2 px-4"
>
  Start
</button>

// ❌ BAD: Inaccessible
<div onClick={handleClick} className="cursor-pointer">
  Start
</div>
```

---

## SUMMARY CHECKLIST

Before every commit:
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No secrets committed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Commit message clear

---

**Document Owner:** Development Team  
**Last Updated:** August 7, 2026  
**Next Review:** August 14, 2026
