# Training Module - Quick Start Examples

## What's New

Your MCP server now has:
1. ✅ **Automatic Scoring** - All tests save success/failure with scores (0-10)
2. ✅ **Training Data Storage** - Learn from HTB and PortSwigger
3. ✅ **Pattern Matching** - Match current tests against learned patterns
4. ✅ **Statistics** - Track success rates and patterns

## New Tools Available

### Database Tools
- `db.get_test_results` - Get test results with scores
- `db.get_statistics` - View test statistics

### Training Tools
- `training.import` - Import training data
- `training.import_portswigger` - Import PortSwigger lab solutions
- `training.import_htb` - Import HTB challenge solutions
- `training.get` - Retrieve training data
- `training.match` - Match patterns against learned data
- `training.stats` - Get training statistics

## Example: Import PortSwigger XSS Lab

```json
{
  "tool": "training.import_portswigger",
  "params": {
    "labName": "Reflected XSS",
    "labUrl": "https://portswigger.net/web-security/cross-site-scripting/reflected/lab-html-context-nothing-encoded",
    "vulnerabilityType": "XSS",
    "solution": {
      "payloads": [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>"
      ],
      "successPattern": "Congratulations",
      "failurePattern": "Not solved",
      "score": 7
    }
  }
}
```

## Example: Import HTB Challenge

```json
{
  "tool": "training.import_htb",
  "params": {
    "challengeName": "BountyHunter",
    "challengeUrl": "http://bountyhunter.htb",
    "vulnerabilityType": "XXE",
    "exploit": {
      "payload": "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><foo>&xxe;</foo>",
      "successPattern": "root:",
      "failurePattern": "error",
      "score": 8
    }
  }
}
```

## Example: Check Test Results

```json
{
  "tool": "db.get_test_results",
  "params": {
    "testType": "xss_test",
    "success": true,
    "limit": 50
  }
}
```

## Example: Match Patterns

```json
{
  "tool": "training.match",
  "params": {
    "vulnerabilityType": "XSS",
    "target": "https://example.com/search",
    "payload": "<script>alert(1)</script>",
    "response": "Congratulations, you solved the lab!"
  }
}
```

## How It Works

1. **Import Training Data**: Add HTB/PortSwigger solutions
2. **Run Tests**: Tests automatically save with scores
3. **Pattern Learning**: System learns patterns from training data
4. **Match & Recommend**: Current tests are matched against learned patterns

## Scoring System

- **Critical (9-10)**: SQL Injection, Auth Bypass
- **High (7-8)**: XSS, IDOR
- **Medium (5-6)**: CSP issues, Info Disclosure
- **Low (3-4)**: Minor issues
- **Failed (0)**: Test failed or no vulnerability found

## Minimal LLM Approach

Instead of large models, we use:
- Pattern matching (string/regex)
- Statistical learning
- Rule-based systems
- No API costs, all local!









