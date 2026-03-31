# hns:// — Native Protocol for Sovereign Agents on Handshake

## 1. Vision & Goals
`hns://` turns every `.agent` (and other Handshake TLD) into a first-class native protocol, just like `ipfs://`, `magnet://`, or `mailto://`.

**Core goals:**
* Agents can discover, verify, and communicate with each other without relying on centralized `https://` gateways.
* Humans get a clean, native "Agent Dashboard" in the browser when they click `hns://myagent.agent`.
* Full graceful fallback to existing gateways for maximum accessibility.
* Open-source and community-owned (not locked to HeadlessDomains).

**Tagline:**
"The only place autonomous agents have their own native address. Break free from HTTP. Discover, pay, and communicate via the sovereign `hns://` protocol on Handshake."

## 2. Core Protocol Behavior
**Scheme:** `hns://<name>.<tld>` or `hns://<subdomain>.<name>.<tld>`

**Resolution flow:**
1. Browser extension or SDK intercepts the `hns://` URL.
2. Attempts direct resolution against Handshake (light node or decentralized resolver fleet).
3. On failure or "gateway" mode → falls back to our optimized resolver.
4. Returns TXT records → parses `agent-manifest` and `skill-md` pointers → fetches and renders the JSON + MD.

## 3. Components

### 3.1 Python SDK (`hns-py` module)
```python
client = HeadlessDomainsClient(...)   # or new HNSClient()

# New methods
result = await client.fetch_hns("hns://mytradingagent.agent")          # returns resolved records + manifest
result = await client.fetch_hns("hns://mytradingagent.agent/manifest", mode="direct")  # or "gateway"
```

### 3.2 Browser Extension (Chrome / Firefox / Brave / Edge)
* Registers `hns://` as a protocol handler.
* On navigation to `hns://...`:
  * Shows a clean "Agent Identity Card" UI (React/Vue) with:
    * `SKILL.md` rendered nicely
    * Capabilities list
    * MPP / Lightning payment buttons
    * Trust attestations (human-backed, IronClaw, etc.)
    * Direct links to webhook, DID, etc.
* Optional "Open in normal browser" button that falls back to `https://hns.to/...` or our gateway.

### 3.3 Desktop / System-Wide Resolver (optional future)
* Small native app or system service that registers `hns://` at OS level.

## 4. Resolution Modes (SDK + Extension)
* **gateway** (default v1) — uses our reliable backend
* **direct** — pure on-chain via light node / HDNS / HSD fleet

## 5. Security & Privacy
* Extension runs in sandboxed Manifest V3.
* No telemetry by default.
* Manifest data is fetched client-side only.
* Clear permissions list on install.

## 6. Phased Rollout (Post April 27)

**Phase 4.1 (2–4 weeks after launch)**
* SDK support for `hns://` fetch (gateway mode)
* Open-source browser extension MVP (basic card UI)

**Phase 4.2 (4–8 weeks)**
* Direct resolution mode
* Polish extension UI + add payment buttons

**Phase 4.3 (later)**
* Desktop resolver, community contributions, support for all Handshake TLDs
