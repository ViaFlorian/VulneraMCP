# Screenshot Guide for ZAP Blog Submission

This guide outlines the recommended screenshots to include with your blog post submission. Screenshots should be high-quality, well-cropped, and clearly demonstrate the value of your ZAP integration.

---

## Essential Screenshots (Must Have)

### 1. **ZAP Health Check & Connection**
**What to show:**
- Terminal/console showing successful ZAP connection
- ZAP version information
- Health check response

**Example command:**
```bash
curl http://localhost:8081/JSON/core/view/version/x```

**Why it matters:** Shows that your system successfully integrates with ZAP and can communicate via the REST API.

**Screenshot should include:**
- Terminal window
- ZAP version response
- Success message/status

---

### 2. **ZAP Spider Scan in Action**
**What to show:**
- Starting a spider scan via your MCP tools
- Scan progress/status
- Discovered URLs

**Example:**
- MCP tool call: `zap.start_spider` with target URL
- Status check showing progress (0% → 50% → 100%)
- List of discovered URLs

**Why it matters:** Demonstrates that your system can control ZAP's scanning capabilities programmatically.

**Screenshot should include:**
- Tool invocation (if using Cursor/IDE)
- Scan status output
- Discovered URLs list

---

### 3. **ZAP Alerts Display**
**What to show:**
- ZAP alerts retrieved via API
- Alert details (risk level, confidence, description)
- Filtered alerts (e.g., High/Critical only)

**Example:**
- JSON output showing ZAP alerts
- Or formatted display of alerts with risk levels

**Why it matters:** Shows that your system can retrieve and process ZAP's vulnerability findings.

**Screenshot should include:**
- Alert list with risk levels (High, Medium, Low)
- Alert details (name, URL, confidence)
- At least 3-5 different alerts visible

---

### 4. **Enhanced Findings with Correlation Scores**
**What to show:**
- Combined findings (ZAP alerts + custom findings)
- Correlation scores
- AI scores
- Verification status

**Example output:**
```json
{
  "findings": [
    {
      "type": "XSS",
      "severity": "high",
      "correlationScore": 0.8,
      "aiScore": 0.96,
      "verified": true,
      "source": "zap + custom"
    }
  ]
}
```

**Why it matters:** This is the **key differentiator** - shows how your system enhances ZAP's findings with custom intelligence.

**Screenshot should include:**
- Side-by-side comparison (if possible) showing:
  - ZAP alerts alone
  - Enhanced findings with correlation/AI scores
- Multiple findings with different scores
- Clear indication of "verified" vs "unverified"

---

### 5. **Custom Finding Detection**
**What to show:**
- A finding that ZAP missed but your system caught
- Examples: IDOR, business logic flaw, sensitive parameter exposure

**Example:**
- Request showing IDOR pattern
- Custom finding detection output
- Evidence/explanation

**Why it matters:** Demonstrates the value-add beyond ZAP's capabilities.

**Screenshot should include:**
- The suspicious request/endpoint
- Custom finding details
- Detection logic explanation

---

## Highly Recommended Screenshots

### 6. **Architecture Diagram (Visual)**
**What to show:**
- Visual diagram of the system architecture
- Flow showing: AI Agent → MCP Server → ZAP → Results

**Tools to create:**
- Draw.io / diagrams.net
- Excalidraw
- Mermaid diagram (can be rendered)

**Why it matters:** Helps readers understand the system at a glance.

**Screenshot should include:**
- Clear component labels
- Data flow arrows
- ZAP prominently featured

---

### 7. **Code Example in IDE**
**What to show:**
- Your ZAP client code in an editor
- Key functions (e.g., `startSpider`, `getAlerts`, `correlateFindings`)
- Syntax highlighting visible

**Why it matters:** Shows the actual implementation, making it more tangible.

**Screenshot should include:**
- Clean, readable code
- Key functions visible
- Good syntax highlighting

---

### 8. **Database of Findings**
**What to show:**
- PostgreSQL database query results
- Table showing saved findings
- Statistics (counts, scores, etc.)

**Example query:**
```sql
SELECT type, severity, score, verified 
FROM findings 
ORDER BY score DESC 
LIMIT 10;
```

**Why it matters:** Shows that findings are persisted and can be analyzed over time.

**Screenshot should include:**
- Database table with findings
- Multiple rows visible
- Score/severity columns highlighted

---

### 9. **MCP Tools in Action (If using Cursor/IDE)**
**What to show:**
- Available ZAP tools in the MCP interface
- Tool descriptions
- Tool being invoked

**Why it matters:** Shows how accessible the ZAP integration is through MCP.

**Screenshot should include:**
- Tool list showing `zap.*` tools
- Tool description visible
- Clean, professional interface

---

### 10. **Before/After Comparison**
**What to show:**
- ZAP scan results alone (before)
- Enhanced results with correlation (after)
- Side-by-side or split screen

**Why it matters:** Visually demonstrates the improvement your system provides.

**Screenshot should include:**
- Same target, same scan
- ZAP results on left
- Enhanced results on right
- Clear labels

---

## Optional but Valuable Screenshots

### 11. **Active Scan Progress**
**What to show:**
- Active scan starting
- Progress updates (0% → 25% → 50% → 100%)
- Completion message

**Why it matters:** Shows real-time scanning capabilities.

---

### 12. **Context Management**
**What to show:**
- Creating a ZAP context
- Including URLs in context
- Context-based scanning

**Why it matters:** Demonstrates advanced ZAP API usage.

---

### 13. **Request/Response Analysis**
**What to show:**
- A request being processed through the proxy layer
- Request details
- Response analysis
- Findings generated

**Why it matters:** Shows the proxy layer in action.

---

### 14. **Statistics Dashboard (If you have one)**
**What to show:**
- Summary statistics
- Findings by type
- Success rates
- Score distributions

**Why it matters:** Shows the system's analytical capabilities.

---

### 15. **Terminal Output - Full Workflow**
**What to show:**
- Complete workflow from start to finish:
  1. ZAP health check
  2. Spider scan
  3. Active scan
  4. Alert retrieval
  5. Enhanced analysis
  6. Results summary

**Why it matters:** Shows the complete user experience.

---

## Screenshot Best Practices

### Technical Requirements
- **Resolution:** At least 1920x1080, preferably higher
- **Format:** PNG (for code/UI) or JPG (for photos)
- **File size:** Optimize but maintain quality (aim for <2MB each)
- **Naming:** Use descriptive names like `zap-health-check.png`, `enhanced-findings.png`

### Content Guidelines
- **Remove sensitive data:** 
  - Blur or redact real URLs, tokens, API keys
  - Use example.com or test targets
  - Remove personal information
- **Clean interface:**
  - Close unnecessary tabs/windows
  - Use clean terminal/IDE themes
  - Remove clutter
- **Add annotations:**
  - Use arrows, boxes, or text to highlight key points
  - Add labels if needed (e.g., "ZAP Alert", "Custom Finding", "AI Score")
- **Consistent styling:**
  - Use same theme/colors across screenshots
  - Maintain consistent cropping/padding

### What to Avoid
- ❌ Screenshots with personal/sensitive information
- ❌ Cluttered interfaces with too many windows
- ❌ Low-resolution or blurry images
- ❌ Screenshots that don't clearly show the point
- ❌ Overly complex diagrams that are hard to read
- ❌ Screenshots of errors or failures (unless demonstrating error handling)

---

## Recommended Screenshot Order for Blog Post

1. **Architecture Diagram** - Early in the post (after introduction)
2. **ZAP Health Check** - In the "ZAP Integration" section
3. **Code Example** - When showing implementation
4. **Spider Scan** - When demonstrating scanning workflow
5. **ZAP Alerts** - When showing ZAP results
6. **Enhanced Findings** - The key screenshot (in "Correlation Engine" section)
7. **Before/After Comparison** - In "Benefits" section
8. **Database Results** - In "Results" section
9. **Full Workflow** - Near the end

---

## Quick Checklist

Before submitting, ensure you have:

- [ ] At least 5-7 high-quality screenshots
- [ ] Architecture diagram (visual)
- [ ] ZAP integration proof (health check, scan)
- [ ] Enhanced findings example (the key differentiator)
- [ ] Code example screenshot
- [ ] All sensitive data removed/redacted
- [ ] Consistent styling across all screenshots
- [ ] Clear annotations where needed
- [ ] Descriptive file names

---

## Tools for Creating Screenshots

### Screenshot Tools
- **macOS:** Cmd+Shift+4 (select area), Cmd+Shift+3 (full screen)
- **Windows:** Snipping Tool, Win+Shift+S
- **Linux:** Flameshot, Shutter

### Annotation Tools
- **macOS:** Preview (built-in), Skitch
- **Windows:** Snagit, Greenshot
- **Online:** Annotely, Photopea

### Diagram Tools
- **Draw.io / diagrams.net** (free, web-based)
- **Excalidraw** (free, hand-drawn style)
- **Mermaid** (code-based, can render to image)
- **Lucidchart** (paid, professional)

---

## Example Screenshot Descriptions

### Example 1: ZAP Health Check
**Caption:** "Successful connection to ZAP via REST API showing version 2.14.0"

**What's visible:**
- Terminal window
- curl command or tool invocation
- JSON response with ZAP version
- Success indicator

### Example 2: Enhanced Findings
**Caption:** "Combined findings showing ZAP alerts enhanced with correlation scores and AI-powered analysis"

**What's visible:**
- Side-by-side: ZAP alerts vs Enhanced findings
- Correlation scores (0.0-1.0)
- AI scores (boosted values)
- Verification status
- Clear labels

### Example 3: Custom Finding Detection
**Caption:** "IDOR vulnerability detected by custom analysis layer - a finding ZAP's traditional scanner missed"

**What's visible:**
- Suspicious request (e.g., `/api/user/123`)
- Custom finding details
- Detection explanation
- Evidence/parameters highlighted

---

## Final Tips

1. **Tell a story:** Screenshots should flow logically with your blog post narrative
2. **Highlight the unique:** Emphasize what makes your system special (correlation, AI scores)
3. **Show, don't just tell:** Visual proof of claims (e.g., "2-3x better accuracy")
4. **Keep it professional:** Clean, polished screenshots reflect well on your work
5. **Test on different screens:** Ensure screenshots look good on various devices

Good luck with your submission! 🚀


