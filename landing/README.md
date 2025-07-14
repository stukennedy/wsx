# WSX Landing Page

A funky retro single-page application showcasing the WSX framework, built with Hono and deployed on Cloudflare Workers.

## 🌟 Features

- **Retro Aesthetic**: 80s-inspired design with neon colors, grid backgrounds, and glitch effects
- **Real-time Interactions**: Live WebSocket demonstrations using WSX
- **Responsive Design**: Works perfectly on all devices
- **Performance**: Optimized for Cloudflare Workers edge computing
- **Interactive Demo**: Live examples of WSX features and capabilities

## 🚀 Tech Stack

- **Framework**: Hono (edge-optimized web framework)
- **WebSockets**: WSX real-time hypermedia framework
- **Deployment**: Cloudflare Workers
- **Styling**: Custom CSS with retro animations and effects

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Wrangler CLI
- Cloudflare account (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8787` to see the landing page.

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 📁 Project Structure

```
landing/
├── src/
│   ├── index.js          # Main Hono app with WSX handlers
│   ├── pages/
│   │   ├── landing.js    # Retro landing page
│   │   └── docs.js       # Documentation page
│   └── client/
│       └── wsx-client.js # WSX client library
├── package.json
├── wrangler.toml        # Cloudflare Workers config
└── README.md
```

## 🎨 Design Features

### Visual Elements

- **Neon Text Effects**: Glowing text with multiple color variations
- **Animated Grid Background**: Moving retro grid pattern
- **Glitch Animations**: Text glitch effects for cyberpunk feel
- **Gradient Animations**: Rainbow and hue-shifting effects
- **Pulse Animations**: Breathing light effects

### Interactive Elements

- **Live Demo Section**: Real-time WebSocket interactions
- **Feature Showcase**: Click-to-reveal feature demonstrations
- **Live Stats**: Real-time connection and usage statistics
- **Animated Hero**: Dynamic title animations
- **Scroll Reveals**: Elements animate as they come into view

### WSX Integrations

- **Real-time Updates**: Live connection indicators
- **Interactive Demos**: Button clicks trigger WebSocket responses
- **Feature Examples**: Code snippets with live demonstrations
- **Statistics Display**: Real-time framework usage stats
- **Out-of-Band Updates**: Multiple element updates from single interactions

## 🌐 Pages

### Landing Page (`/`)
- Hero section with animated WSX branding
- Interactive demo showcasing real-time capabilities
- Feature cards with live code examples
- Real-time statistics and connection indicators

### Documentation Page (`/docs`)
- Embedded Mintlify documentation
- Clean interface with links to external docs
- Responsive iframe for seamless documentation browsing

## 🔧 WSX Handlers

The landing page includes several WSX handlers demonstrating real-time capabilities:

- `animate-hero`: Cycles through different hero text animations
- `show-feature`: Displays feature details with code examples
- `demo-interaction`: Shows various animation effects
- `get-stats`: Provides live framework statistics
- `scroll-reveal`: Triggers animations on scroll

## 🎯 Performance

- **Edge Optimization**: Built for Cloudflare Workers global edge network
- **Minimal Bundle**: Lightweight client library with core WSX features
- **Efficient Updates**: Real-time DOM updates without full page reloads
- **Caching**: Optimized asset caching for fast loading

## 🔮 Future Enhancements

- **Code Playground**: Interactive WSX code editor
- **More Demos**: Additional real-time application examples
- **Theme Switcher**: Multiple retro theme options
- **Performance Metrics**: Real-time performance monitoring
- **Community Features**: User submissions and examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Cloudflare Workers
5. Submit a pull request

## 📄 License

This project is part of the WSX framework ecosystem. See the main repository for licensing details.

---

Built with ❤️ and ⚡ by the WSX team