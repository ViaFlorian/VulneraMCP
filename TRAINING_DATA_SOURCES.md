# Training Data Sources & Import Guide

## Pre-Loaded Training Data

The MCP server now includes pre-loaded training data extracted from:

### 1. Intigriti CSRF Guide
**Source:** https://www.intigriti.com/researchers/blog/hacking-tools/csrf-a-complete-guide-to-exploiting-advanced-csrf-vulnerabilities

**Techniques Included:**
- Basic CSRF (form-based attacks)
- Content-Type bypass (text/plain for JSON APIs)
- Method-based CSRF (HTTP method changes)
- Anti-CSRF token bypass (4 methods)
- Referrer-based CSRF bypass

**Import:** Already included in `training.import_all`

### 2. PortSwigger Research
**Sources:**
- Top 10 Web Hacking Techniques of 2023
- PortSwigger Academy labs
- Research articles

**Patterns Included:**
- XSS (Reflected, DOM-based)
- SQL Injection (Basic, Time-based)
- Advanced exploitation techniques

### 3. InfoSec Writeups
**Source:** https://infosecwriteups.com/

**Patterns Included:**
- User Registration vulnerabilities
- Email/Username enumeration
- Weak input validation

### 4. Google Dorking
**Source:** Medium article on Google Dorking

**Patterns Included:**
- Filetype dorking
- InURL dorking
- InTitle dorking
- Custom dork crafting

### 5. HackerOne Writeups
**Pattern:** GET-based CSRF leading to PII leak

**Example from Image:**
- Technique: GET request CSRF
- Impact: One-click customer data leak
- Pattern: `/?corelationID=xxx&email=victim@mail.com&accept=true`

## How to Import

### Quick Import (All Sources)
```
training.import_all
```

### Import Specific Sources
```
training.import_all
{
  "sources": ["csrf", "xss", "sqli"]
}
```

### Extract from Writeup Text
```
training.extract_from_writeup
{
  "writeupText": "Full writeup text here...",
  "vulnerabilityType": "CSRF",
  "source": "hackerone"
}
```

## Training Data Structure

Each training entry contains:
- `source`: Where it came from (intigriti, portswigger, etc.)
- `sourceId`: Unique identifier
- `vulnerabilityType`: Type of vulnerability
- `targetPattern`: URL/endpoint pattern to match
- `payloadPattern`: Payload pattern that works
- `successPattern`: Response pattern indicating success
- `failurePattern`: Response pattern indicating failure
- `contextData`: Additional context and examples
- `score`: Severity score (0-10)

## Pattern Matching

The system uses simple but effective pattern matching:

1. **Target Matching**: Checks if target URL matches learned patterns
2. **Payload Matching**: Compares payloads against learned patterns  
3. **Response Matching**: Looks for success/failure indicators
4. **Confidence Scoring**: Returns confidence (0-1) for matches

## Continuous Learning

As you:
- Import more training data
- Run tests (automatically saved)
- Extract from writeups

The pattern matcher improves its detection accuracy!

## No LLM Required

This system uses:
- ✅ Pattern matching (fast, local)
- ✅ Statistical learning
- ✅ Rule-based systems
- ❌ No large language models
- ❌ No API costs
- ❌ No training needed

Just import data and start using it!









