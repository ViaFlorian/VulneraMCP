# Training Data Import - Quick Start

## One-Command Import

Import all pre-loaded training data from Intigriti, PortSwigger, and other sources:

```
training.import_all
```

This imports:
- ✅ CSRF techniques (5 patterns from Intigriti guide)
- ✅ XSS patterns (2 from PortSwigger)
- ✅ SQL Injection patterns (2 from PortSwigger)
- ✅ User Registration vulnerabilities (2 from InfoSec Writeups)
- ✅ Google Dorking patterns (3 from Medium)

## What Gets Imported

### CSRF Patterns (from Intigriti)
1. **Basic CSRF** - Simple form-based attacks
2. **Content-Type Bypass** - text/plain to bypass JSON-only APIs
3. **Method-based CSRF** - Change HTTP methods
4. **Token Bypass** - Bypass anti-CSRF tokens
5. **Referrer Bypass** - Bypass referrer validation

### XSS Patterns
1. **Reflected XSS** - Basic reflected XSS
2. **DOM-based XSS** - DOM manipulation XSS

### SQL Injection Patterns
1. **Basic SQLi** - Classic injection patterns
2. **Time-based SQLi** - Blind injection with delays

### Registration Vulnerabilities
1. **User Enumeration** - Enumerate users during registration
2. **Weak Validation** - Bypass registration restrictions

### Google Dorking
1. **Filetype Dorking** - Find specific file types
2. **InURL Dorking** - Find URL patterns
3. **InTitle Dorking** - Find pages by title

## Extract from Writeups

To extract patterns from bug bounty writeups:

```
training.extract_from_writeup
```

Example:
```json
{
  "writeupText": "I found a CSRF vulnerability in /api/profile/update. The endpoint accepted POST requests without CSRF tokens. I crafted a form with <form method='POST'> and successfully changed the victim's email.",
  "vulnerabilityType": "CSRF",
  "source": "hackerone"
}
```

## New CSRF Testing Tool

Test for CSRF vulnerabilities with advanced techniques:

```
security.test_csrf
```

Example:
```json
{
  "url": "https://example.com/api/profile/update",
  "method": "POST",
  "params": {"email": "attacker@evil.com"},
  "testTechniques": ["basic", "content-type", "method", "token-bypass"]
}
```

This automatically:
- Tests multiple CSRF bypass techniques
- Generates PoC HTML
- Saves results with scores
- Creates findings if vulnerable

## View Training Data

```
training.get
```

Get CSRF-specific patterns:
```
training.get_csrf_patterns
```

## Statistics

```
training.stats
```

Shows:
- Test success rates
- Training data count
- Average scores

## Next Steps

1. **Import all training data**: `training.import_all`
2. **Run tests**: Tests automatically learn from training data
3. **Extract from writeups**: Use `training.extract_from_writeup` for new patterns
4. **View statistics**: Check `training.stats` to see improvements

No LLM training needed - the pattern matcher learns automatically from imported data!









