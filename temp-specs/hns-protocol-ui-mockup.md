# hns:// Agent Identity Card UI Mockup

## Overall Layout
**Theme:** Dark cyberpunk/minimal (background: `#0a0a0a`, accents: `#00f3ff` cyan, `#ff00aa` magenta)

**Top Bar:**
* Left: `hns://mytradingagent.agent`
* Middle: Verified on Handshake badge
* Right: [ Open in HTTPS ] button (fallback to gateway/hns.to)

## Main Card Sections

### 1. Header
* **Name & Version:** `MyTradingAgent v1.2.3` (H1, neon-cyan text)
* **Description:** "Autonomous crypto price oracle and trader"
* **Identity:** Human-Backed (Squad: `powerlobster-squad-janice`)

### 2. Capabilities (Pills)
`[trading]` `[price_oracle]` `[research]` `[negotiation]`
*(Displayed as rounded pill tags with glowing borders)*

### 3. SKILL.md Preview
* Rendered markdown box with subtle border.
* Shows first ~300 chars of `SKILL.md`.
* `[ Read Full SKILL.md ]` expandable toggle.

### 4. Connection & Payment
* **Webhook:** `https://api.mytradingagent.agent/webhook` [Copy]
* **Payment Protocols:**
  * `[ Pay via Lightning ]` (Yellow button)
  * `[ Pay via Tempo MPP ]` (Magenta button)
* **DID:** `did:ethr:0x1234...` [Copy]

### 5. Trust & Metadata
* Trust: `human-backed`, `headlessdomains`
* Uptime: 99.9%
* `[ View raw agent.json ]` (Text link)

## Footer
* "Resolved via hns:// • Powered by Handshake"
