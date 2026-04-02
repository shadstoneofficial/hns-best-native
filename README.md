# hns:// Native Protocol Extension

The only place autonomous agents have their own native address. Break free from HTTP. Discover, pay, and communicate via the sovereign `hns://` protocol on Handshake.

This repository contains the official open-source Chrome extension that registers `hns://` as a native protocol handler, rendering a beautiful Agent Identity Card directly in your browser.

## Features

- **Native `hns://` Protocol Handler:** Type `hns myagent.agent` in your omnibox or click on any `<a href="hns://...">` link on the web.
- **Agent Identity Card UI:** A clean, dark-cyberpunk React dashboard that displays the agent's capabilities, `SKILL.md`, and connection details (Webhook, DID).
- **Dynamic Manifest Resolution:** Fetches live agent data (capabilities, version, description, payment endpoints, etc.) and fully renders markdown `SKILL.md` using `react-markdown`.
- **Gateway Fallback:** Gracefully falls back to the `hns.to` HTTPS gateway for maximum accessibility.
- **Secure Sandboxed Execution:** Built on Manifest V3 with minimal permissions and no default telemetry.

## Installation (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/shadstoneofficial/hns-best-native.git
   cd hns-best-native
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load into Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** in the top right corner.
   - Click **"Load unpacked"** and select the `dist/` directory generated in step 3.

## Usage & Testing

Once installed, the extension works seamlessly in the background:
- **Direct Address Bar (Omnibox) Integration:** Simply type `hns://[agent.name]` directly into your Chrome address bar and hit enter! 
- **Keyword Integration:** You can also type `hns`, press `Space` or `Tab`, and enter an agent's Handshake name (e.g., `mytradingagent.agent`).
- **Web Links:** Click on any `hns://` link across the web to securely open the Agent Identity Card.
- **Resolver Mode Toggle:** Click the extension icon to open the popup. You can switch between **Gateway (Default)** and **Decentralized Resolver** mode. 
  - *Gateway mode* fetches data reliably via `headlessdomains.com`.
  - *Decentralized mode* uses DNS-over-HTTPS (DoH) to query the Handshake blockchain directly for the `agent-manifest` TXT record, resolving data straight from the decentralized web. If it fails or times out, it gracefully falls back to Gateway mode.
- **Testing Dynamic Resolution:** You can test the dynamic fetching by typing `hns myagent.agent` in the omnibox. If the manifest is registered, it will render the full Agent Identity Card with live data. If not, you will see a friendly "Resolution Failed" screen with an option to register the agent.

## Development Stack

- [Vite](https://vitejs.dev/) - Lightning fast build tool
- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling (with `@tailwindcss/typography`)
- [Lucide React](https://lucide.dev/) - Beautiful icons
- Manifest V3 Background & Content Scripts

## Phased Rollout

- **Phase 4.1:** SDK support & Open-source browser extension MVP (gateway mode) - *Completed*
- **Phase 4.2:** Direct on-chain resolution mode via light node/HDNS fleet. - *Current Focus*
- **Phase 4.3:** Desktop resolver, system-wide integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License