# VRA+

**Vulnerability Remediation Automation by Rebellis.** VRA+ scans code, dependencies, containers and infrastructure, then opens pull or merge requests with fixes verified by your own build.

- Website: https://vra-plus.io
- Downloads: [latest release](https://github.com/gboie/vra-plus/releases/latest)

| Platform | File |
|---|---|
| Linux x86-64 | `vra-linux-amd64` |
| Debian / Ubuntu | `vra-linux-amd64.deb` |
| RHEL / Fedora | `vra-linux-amd64.rpm` |
| macOS Apple Silicon | `vra-darwin-arm64` |
| Windows x86-64 | `vra-windows-amd64.exe` |

```bash
curl -LO https://github.com/gboie/vra-plus/releases/latest/download/vra-linux-amd64
chmod +x vra-linux-amd64 && sudo mv vra-linux-amd64 /usr/local/bin/vra
vra --version
```

## This repository

It holds the website (served by GitHub Pages) and the release binaries. The VRA+ source code lives elsewhere.

| File | What |
|---|---|
| `index.html`, `style.css`, `main.js`, `assets/` | the website: plain HTML, CSS and JavaScript, no build step |
| `CNAME` | custom domain for GitHub Pages |
| `.nojekyll` | serve files as-is |

Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000.
