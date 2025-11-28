# Training Module - HTB & PortSwigger Integration

The MCP server now includes a training module that can learn from HackTheBox (HTB) and PortSwigger Academy labs to improve vulnerability detection.

## Features

### 1. **Automatic Scoring & Tracking**
- All test results are automatically stored with success/failure status
- Scores are assigned based on vulnerability severity (0-10)
- Track success rates and patterns over time

### 2. **Pattern Learning**
- Learn from successful exploits
- Match current tests against learned patterns
- Improve detection accuracy over time

### 3. **HTB Integration**
- Import challenge solutions
- Learn exploit patterns
- Store payloads and success indicators

### 4. **PortSwigger Academy Integration**
- Import lab solutions
- Learn vulnerability patterns
- Store testing methodologies

## Usage Examples

### Import PortSwigger Lab Solution

```javascript
// Example: XSS lab from PortSwigger
training.import_portswigger({
  labName: "Reflected XSS into HTML context with nothing encoded",
  labUrl: "https://portswigger.net/web-security/cross-site-scripting/reflected/lab-html-context-nothing-encoded",
  vulnerabilityType: "XSS",
  solution: {
    payloads: [
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>"
    ],
    successPattern: "Congratulations",
    failurePattern: "Not solved",
    score: 7
  }
})
```

### Import HTB Challenge

```javascript
// Example: Web challenge from HTB
training.import_htb({
  challengeName: "BountyHunter",
  challengeUrl: "http://bountyhunter.htb",
  vulnerabilityType: "XXE",
  exploit: {
    payload: `<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<foo>&xxe;</foo>`,
    successPattern: "root:",
    failurePattern: "error",
    score: 8
  }
})
```

### Match Patterns

```javascript
// Check if current test matches learned patterns
training.match({
  vulnerabilityType: "XSS",
  target: "https://example.com/search",
  payload: "<script>alert(1)</script>",
  response: "Congratulations, you solved the lab!"
})
```

### Get Statistics

```javascript
// View test statistics and success rates
training.stats()
```

### Get Test Results

```javascript
// Get all test results with scores
db.get_test_results({
  testType: "xss_test",
  success: true,
  limit: 50
})
```

## Database Schema

### test_results Table
- `id`: Primary key
- `target`: Target URL
- `test_type`: Type of test (xss_test, sqli_test, etc.)
- `success`: Boolean (true/false)
- `score`: Integer (0-10)
- `result_data`: JSONB with detailed results
- `payload`: Payload used
- `response_data`: Response received
- `timestamp`: When test was run

### training_data Table
- `id`: Primary key
- `source`: Source (htb, portswigger, custom)
- `source_id`: ID from source
- `vulnerability_type`: Type of vulnerability
- `target_pattern`: Pattern to match targets
- `payload_pattern`: Pattern for payloads
- `success_pattern`: Pattern indicating success
- `failure_pattern`: Pattern indicating failure
- `context_data`: Additional context (JSONB)
- `score`: Score for this example
- `learned_at`: When pattern was learned

## Pattern Matching Algorithm

The system uses a simple but effective pattern matching algorithm:

1. **Target Matching**: Checks if target URL matches learned patterns
2. **Payload Matching**: Compares payloads against learned patterns
3. **Response Matching**: Looks for success/failure indicators in responses
4. **Confidence Scoring**: Returns confidence score (0-1) for matches

## Minimal LLM Approach

Instead of using large language models, the system uses:
- **Pattern Matching**: Simple string/regex matching
- **Statistical Learning**: Tracks success rates and patterns
- **Rule-Based**: Learns rules from training data
- **Embedding-Free**: No vector embeddings needed

This approach is:
- ✅ Fast and lightweight
- ✅ No API costs
- ✅ Privacy-preserving (all local)
- ✅ Easy to understand and debug
- ✅ Effective for common vulnerability patterns

## Future Enhancements

Potential improvements:
- [ ] Regex pattern learning
- [ ] Weighted pattern matching
- [ ] Automatic pattern extraction from test results
- [ ] Integration with more training sources
- [ ] Pattern confidence thresholds
- [ ] Automated payload generation based on patterns

## Example Workflow

1. **Import Training Data**
   ```javascript
   training.import_portswigger({...})
   ```

2. **Run Tests**
   ```javascript
   security.test_xss({url: "...", params: {...}})
   // Automatically saves with score
   ```

3. **Check Statistics**
   ```javascript
   training.stats()
   // See success rates and patterns
   ```

4. **Match Against Learned Patterns**
   ```javascript
   training.match({...})
   // Get recommendations based on training data
   ```

## Benefits

- **Improved Detection**: Learn from proven exploits
- **Better Scoring**: Automatic scoring based on severity
- **Pattern Recognition**: Identify similar vulnerabilities
- **Knowledge Base**: Build a library of working exploits
- **Continuous Learning**: Improve over time









