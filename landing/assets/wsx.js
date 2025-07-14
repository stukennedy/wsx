/**
 * @fileoverview WSX WebSocket client for real-time HTML updates
 */

/**
 * @typedef {Object} WSXConfig
 * @property {string} url - WebSocket server URL
 * @property {number} [reconnectInterval=3000] - Reconnection interval in milliseconds
 * @property {number} [maxReconnectAttempts=5] - Maximum reconnection attempts
 * @property {boolean} [debug=false] - Enable debug logging
 */

/**
 * @typedef {Object} WSXMessage
 * @property {string} id - Message ID
 * @property {string} target - CSS selector for target element
 * @property {string} html - HTML content to insert
 * @property {'innerHTML'|'outerHTML'|'beforebegin'|'afterbegin'|'beforeend'|'afterend'} [swap='innerHTML'] - How to insert the HTML
 * @property {string} [trigger] - Event trigger name
 * @property {Object} [data] - Additional data
 */

/**
 * @typedef {Object} WSXRequest
 * @property {string} id - Request ID
 * @property {string} handler - Handler name on server
 * @property {string} target - CSS selector for target element
 * @property {string} trigger - Event trigger name
 * @property {Object} [data] - Request data
 * @property {HTMLElement} [element] - Source element
 */

class WSX {
  /**
   * @param {WSXConfig} config - Configuration object
   */
  constructor(config) {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.isConnected = false;
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    this.throttleTimers = new Map();
    this.debounceTimers = new Map();
    
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      debug: false,
      ...config
    };
    
    this.connect();
    this.setupEventListeners();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.config.url);
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (error) {
      this.log('Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  onOpen() {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.log('Connected to WSX server');
    
    // Trigger connection event
    document.dispatchEvent(new CustomEvent('wsx:connected'));
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    } catch (error) {
      this.log('Error parsing message:', error);
    }
  }

  onClose() {
    this.isConnected = false;
    this.log('Disconnected from WSX server');
    
    // Trigger disconnection event
    document.dispatchEvent(new CustomEvent('wsx:disconnected'));
    
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  onError(error) {
    this.log('WebSocket error:', error);
    // Enable demo mode if connection fails
    this.enableDemoMode();
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached, enabling demo mode');
      this.enableDemoMode();
      return;
    }
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.log(`Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      this.connect();
    }, this.config.reconnectInterval);
  }

  enableDemoMode() {
    this.demoMode = true;
    this.isConnected = true; // Simulate connection for demo
    this.log('Demo mode enabled - simulating WebSocket responses');
    
    // Update live indicator
    const liveStats = document.getElementById('live-stats');
    if (liveStats) {
      liveStats.innerHTML = `
        <span class="live-dot"></span>
        Demo Mode (WebSocket simulation)
      `;
    }
  }

  generateDemoResponse(request) {
    const responses = {
      'animate-hero': {
        id: request.id,
        target: request.target,
        html: `<div class="glitch-text">🚀 WSX: HYPERMEDIA GOES REAL-TIME 🚀</div>`
      },
      'show-feature': {
        id: request.id,
        target: request.target,
        html: this.generateFeatureShowcase(request.data?.feature || 'realtime')
      },
      'demo-interaction': {
        id: request.id,
        target: request.target,
        html: `<div class="demo-response pulse">🎉 WSX Magic Happened! 🎉</div>`
      },
      'get-stats': {
        id: request.id,
        target: request.target,
        html: `
          <div class="stats-grid animate-fade-in">
            <div class="stat-item">
              <div class="stat-number neon-text">1</div>
              <div class="stat-label">Demo Connections</div>
            </div>
            <div class="stat-item">
              <div class="stat-number neon-text">${Math.floor(Math.random() * 10000).toLocaleString()}</div>
              <div class="stat-label">DOM Updates</div>
            </div>
            <div class="stat-item">
              <div class="stat-number neon-text">3</div>
              <div class="stat-label">Frameworks</div>
            </div>
            <div class="stat-item">
              <div class="stat-number neon-text">v1.0.0</div>
              <div class="stat-label">Version</div>
            </div>
          </div>
        `
      }
    };
    
    return responses[request.handler] || {
      id: request.id,
      target: request.target,
      html: `<div class="demo-response">Demo response for: ${request.handler}</div>`
    };
  }

  generateFeatureShowcase(feature) {
    const features = {
      realtime: {
        icon: '⚡',
        title: 'Real-Time Hypermedia',
        description: 'HTMX-style patterns with WebSocket power',
        code: `wsx.on("update", async (req, conn) => {
  return {
    target: "#content",
    html: \`<div class="live">\${data}</div>\`
  };
});`
      },
      oob: {
        icon: '🎯',
        title: 'Out-of-Band Updates',
        description: 'Update multiple DOM elements simultaneously',
        code: `return {
  target: "#main",
  html: \`<div>Main content</div>\`,
  oob: [{
    target: "#sidebar",
    html: \`<div>Sidebar update</div>\`
  }]
};`
      },
      triggers: {
        icon: '🎮',
        title: 'Advanced Triggers',
        description: 'Rich trigger system with debouncing and conditions',
        code: `<input 
  wx-send="search"
  wx-trigger="keyup delay:300ms"
  wx-target="#results"
/>`
      },
      framework: {
        icon: '🔧',
        title: 'Framework Agnostic',
        description: 'Works with Express, Hono, and custom adapters',
        code: `import { createHonoWSXServer } from "@wsx/hono";
import { createExpressWSXServer } from "@wsx/express";

const wsx = createHonoWSXServer();`
      }
    };
    
    const featureData = features[feature] || features.realtime;
    
    return `
      <div class="feature-showcase animate-in">
        <div class="feature-icon">${featureData.icon}</div>
        <h3 class="neon-text">${featureData.title}</h3>
        <p class="feature-description">${featureData.description}</p>
        <pre class="code-block"><code>${featureData.code}</code></pre>
        <div class="feature-glow"></div>
      </div>
    `;
  }

  handleMessage(message) {
    // Handle main response
    this.processSwapUpdate({
      target: message.target,
      html: message.html,
      swap: message.swap || 'innerHTML'
    }, message);

    // Handle out-of-band swaps
    if (message.oob && Array.isArray(message.oob)) {
      message.oob.forEach(oobUpdate => {
        this.log('Processing OOB update:', oobUpdate);
        this.processSwapUpdate(oobUpdate, message, true);
      });
    }

    // Clean up pending request
    this.pendingRequests.delete(message.id);
  }

  /**
   * Process a single swap update (main or OOB)
   * @param {Object} update - Update object with target, html, swap
   * @param {Object} message - Original message for events
   * @param {boolean} isOOB - Whether this is an out-of-band update
   */
  processSwapUpdate(update, message, isOOB = false) {
    const targetElement = document.querySelector(update.target);
    
    if (!targetElement) {
      this.log(`Target element not found: ${update.target}${isOOB ? ' (OOB)' : ''}`);
      return;
    }

    const swap = update.swap || 'innerHTML';
    const swapSpec = this.parseSwapSpec(swap);
    
    // Trigger before swap event
    const beforeEvent = new CustomEvent('wsx:beforeSwap', {
      detail: { 
        message, 
        element: targetElement, 
        update,
        isOOB 
      }
    });
    targetElement.dispatchEvent(beforeEvent);

    // Apply swap delay if specified
    const delay = swapSpec.swap || 0;
    
    setTimeout(() => {
      // Perform the swap
      this.performSwap(targetElement, update.html, swapSpec);

      // Apply settle delay and trigger after swap event
      const settleDelay = swapSpec.settle || 20;
      setTimeout(() => {
        const afterEvent = new CustomEvent('wsx:afterSwap', {
          detail: { 
            message, 
            element: targetElement, 
            update,
            isOOB 
          }
        });
        targetElement.dispatchEvent(afterEvent);

        // Handle show/scroll modifiers (only for main updates, not OOB)
        if (!isOOB) {
          this.handleShowScroll(targetElement, swapSpec);
        }
      }, settleDelay);

    }, delay);
  }

  performSwap(element, html, swapSpec) {
    const swapStyle = swapSpec.style || 'innerHTML';
    
    switch (swapStyle) {
      case 'innerHTML':
        element.innerHTML = html;
        break;
      case 'outerHTML':
        element.outerHTML = html;
        break;
      case 'beforebegin':
        element.insertAdjacentHTML('beforebegin', html);
        break;
      case 'afterbegin':
        element.insertAdjacentHTML('afterbegin', html);
        break;
      case 'beforeend':
        element.insertAdjacentHTML('beforeend', html);
        break;
      case 'afterend':
        element.insertAdjacentHTML('afterend', html);
        break;
      case 'delete':
        element.remove();
        break;
      case 'none':
        // Do nothing - useful for side effects only
        break;
      default:
        element.innerHTML = html;
    }
  }

  /**
   * Parse swap specification string like "innerHTML swap:100ms settle:200ms show:top scroll:top"
   * @param {string} swapString - The swap specification
   * @returns {Object} Parsed swap specification
   */
  parseSwapSpec(swapString) {
    const spec = {
      style: 'innerHTML',
      swap: 0,
      settle: 20,
      show: null,
      scroll: null,
      focus: false
    };

    if (!swapString) return spec;

    const parts = swapString.trim().split(/\s+/);
    
    // First part is the swap style if it doesn't contain ':'
    if (parts[0] && !parts[0].includes(':')) {
      spec.style = parts[0];
      parts.shift();
    }

    // Parse modifiers
    parts.forEach(part => {
      const [key, value] = part.split(':');
      
      switch (key) {
        case 'swap':
          spec.swap = this.parseTime(value);
          break;
        case 'settle':
          spec.settle = this.parseTime(value);
          break;
        case 'show':
          spec.show = value || 'top';
          break;
        case 'scroll':
          spec.scroll = value || 'top';
          break;
        case 'focus-scroll':
          spec.focus = value !== 'false';
          break;
      }
    });

    return spec;
  }

  /**
   * Parse time string like "100ms" or "1s" to milliseconds
   * @param {string} timeStr - Time string
   * @returns {number} Time in milliseconds
   */
  parseTime(timeStr) {
    if (!timeStr) return 0;
    
    const match = timeStr.match(/^(\d+(?:\.\d+)?)(ms|s)?$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'ms';
    
    return unit === 's' ? value * 1000 : value;
  }

  /**
   * Handle show and scroll modifiers
   * @param {Element} element - Target element
   * @param {Object} swapSpec - Swap specification
   */
  handleShowScroll(element, swapSpec) {
    if (swapSpec.show || swapSpec.scroll) {
      const targetEl = swapSpec.show === 'window' || swapSpec.scroll === 'window' 
        ? window 
        : element;

      if (swapSpec.show) {
        this.scrollIntoView(targetEl, swapSpec.show);
      } else if (swapSpec.scroll) {
        this.scrollIntoView(targetEl, swapSpec.scroll);
      }
    }
  }

  /**
   * Scroll element into view
   * @param {Element|Window} target - Target to scroll
   * @param {string} position - Scroll position (top, bottom, center, etc.)
   */
  scrollIntoView(target, position) {
    if (target === window) {
      const scrollPos = position === 'bottom' ? document.body.scrollHeight : 0;
      window.scrollTo({ top: scrollPos, behavior: 'smooth' });
      return;
    }

    const options = { behavior: 'smooth' };
    
    switch (position) {
      case 'top':
        options.block = 'start';
        break;
      case 'bottom':
        options.block = 'end';
        break;
      case 'center':
        options.block = 'center';
        break;
      default:
        options.block = 'nearest';
    }

    target.scrollIntoView(options);
  }

  setupEventListeners() {
    // Common events to listen for
    const events = ['click', 'submit', 'input', 'change', 'keyup', 'keydown', 'focus', 'blur', 'load', 'scroll', 'mouseover', 'mouseout'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.handleEvent(e, eventType);
      });
    });

    // Handle intersect events (for lazy loading)
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    }
  }

  handleEvent(e, eventType) {
    let element = e.target;
    
    // Walk up the DOM tree to find elements with wx-send
    while (element && element !== document) {
      if (element.hasAttribute && element.hasAttribute('wx-send')) {
        const triggerSpec = element.getAttribute('wx-trigger') || eventType;
        const triggers = this.parseTriggerSpec(triggerSpec);
        
        for (const trigger of triggers) {
          if (this.shouldTrigger(trigger, e, eventType, element)) {
            if (eventType === 'submit') {
              e.preventDefault();
            }
            
            this.processTrigger(element, trigger, e);
            break; // Only process the first matching trigger
          }
        }
      }
      element = element.parentElement;
    }
  }

  /**
   * Parse trigger specification like "click, keyup[ctrlKey] delay:500ms, change throttle:1s"
   * @param {string} triggerSpec - Trigger specification string
   * @returns {Array} Array of parsed trigger objects
   */
  parseTriggerSpec(triggerSpec) {
    if (!triggerSpec) return [{ event: 'click' }];
    
    return triggerSpec.split(',').map(spec => {
      const trigger = { event: 'click', modifiers: {} };
      const parts = spec.trim().split(/\s+/);
      
      // Parse event name and conditions
      const eventPart = parts[0];
      const conditionMatch = eventPart.match(/^(\w+)(?:\[([^\]]+)\])?$/);
      
      if (conditionMatch) {
        trigger.event = conditionMatch[1];
        if (conditionMatch[2]) {
          trigger.condition = conditionMatch[2];
        }
      }
      
      // Parse modifiers
      parts.slice(1).forEach(part => {
        const [key, value] = part.split(':');
        switch (key) {
          case 'once':
            trigger.modifiers.once = true;
            break;
          case 'changed':
            trigger.modifiers.changed = true;
            break;
          case 'delay':
            trigger.modifiers.delay = this.parseTime(value);
            break;
          case 'throttle':
            trigger.modifiers.throttle = this.parseTime(value);
            break;
          case 'from':
            trigger.modifiers.from = value;
            break;
          case 'target':
            trigger.modifiers.target = value;
            break;
          case 'consume':
            trigger.modifiers.consume = true;
            break;
          case 'queue':
            trigger.modifiers.queue = value || 'last';
            break;
        }
      });
      
      return trigger;
    });
  }

  /**
   * Check if trigger should fire based on conditions
   */
  shouldTrigger(trigger, event, eventType, element) {
    // Check if event type matches
    if (trigger.event !== eventType) return false;
    
    // Check condition (e.g., ctrlKey, shiftKey, etc.)
    if (trigger.condition) {
      try {
        // Simple condition evaluation for common cases
        if (trigger.condition.includes('ctrlKey') && !event.ctrlKey) return false;
        if (trigger.condition.includes('shiftKey') && !event.shiftKey) return false;
        if (trigger.condition.includes('altKey') && !event.altKey) return false;
        if (trigger.condition.includes('metaKey') && !event.metaKey) return false;
        
        // Handle key conditions like "keyup[Enter]"
        const keyMatch = trigger.condition.match(/^(\w+)$/);
        if (keyMatch && event.key !== keyMatch[1]) return false;
      } catch (e) {
        this.log('Error evaluating trigger condition:', e);
        return false;
      }
    }
    
    // Check 'from' modifier (event delegation)
    if (trigger.modifiers.from) {
      const fromElement = document.querySelector(trigger.modifiers.from);
      if (!fromElement || !fromElement.contains(event.target)) return false;
    }
    
    // Check 'target' modifier
    if (trigger.modifiers.target) {
      if (!event.target.matches(trigger.modifiers.target)) return false;
    }
    
    // Check 'changed' modifier for form inputs
    if (trigger.modifiers.changed && element.tagName) {
      const tagName = element.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tagName)) {
        const currentValue = element.value;
        const lastValue = element.dataset.wsxLastValue;
        if (currentValue === lastValue) return false;
        element.dataset.wsxLastValue = currentValue;
      }
    }
    
    return true;
  }

  /**
   * Process trigger with modifiers like delay, throttle, etc.
   */
  processTrigger(element, trigger, event) {
    const elementId = element.id || `wsx_${Math.random().toString(36).substr(2, 9)}`;
    if (!element.id) element.id = elementId;
    
    // Handle 'once' modifier
    if (trigger.modifiers.once) {
      if (element.dataset.wsxTriggered) return;
      element.dataset.wsxTriggered = 'true';
    }
    
    // Handle 'consume' modifier
    if (trigger.modifiers.consume) {
      event.stopPropagation();
    }
    
    const executeRequest = () => {
      this.handleTrigger(element, trigger.event, event);
    };
    
    // Handle 'delay' modifier
    if (trigger.modifiers.delay) {
      setTimeout(executeRequest, trigger.modifiers.delay);
      return;
    }
    
    // Handle 'throttle' modifier
    if (trigger.modifiers.throttle) {
      const throttleKey = `${elementId}_${trigger.event}`;
      if (this.throttleTimers.has(throttleKey)) return;
      
      executeRequest();
      this.throttleTimers.set(throttleKey, setTimeout(() => {
        this.throttleTimers.delete(throttleKey);
      }, trigger.modifiers.throttle));
      return;
    }
    
    // Handle 'queue' modifier with debouncing
    if (trigger.modifiers.queue) {
      const debounceKey = `${elementId}_${trigger.event}`;
      
      if (this.debounceTimers.has(debounceKey)) {
        clearTimeout(this.debounceTimers.get(debounceKey));
      }
      
      const timer = setTimeout(() => {
        this.debounceTimers.delete(debounceKey);
        executeRequest();
      }, 300); // Default debounce time
      
      this.debounceTimers.set(debounceKey, timer);
      return;
    }
    
    // Execute immediately
    executeRequest();
  }

  /**
   * Setup intersection observer for 'intersect' triggers
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          this.handleTrigger(element, 'intersect');
        }
      });
    });
    
    // Observe elements with intersect triggers
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[wx-trigger*="intersect"]').forEach(el => {
        observer.observe(el);
      });
    });
  }

  handleTrigger(element, eventType, event) {
    if (!this.isConnected) {
      this.log('Not connected to server');
      return;
    }

    const handler = element.getAttribute('wx-send') || '';
    const target = element.getAttribute('wx-target') || 'body';
    const swap = element.getAttribute('wx-swap') || 'innerHTML';
    const trigger = element.getAttribute('wx-trigger') || eventType;

    // Collect form data if it's a form element
    let data = {};
    
    if (element.tagName === 'FORM') {
      const formData = new FormData(element);
      data = Object.fromEntries(formData.entries());
    } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const input = element;
      data[input.name || 'value'] = input.value;
    }

    // Add any additional data from wx-data attribute
    const wxData = element.getAttribute('wx-data');
    if (wxData) {
      try {
        const additionalData = JSON.parse(wxData);
        data = { ...data, ...additionalData };
      } catch (error) {
        this.log('Error parsing wx-data:', error);
      }
    }

    // Add data-* attributes to request data
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && !attr.name.startsWith('data-wsx')) {
        const key = attr.name.substring(5); // Remove 'data-' prefix
        data[key] = attr.value;
      }
    }

    const request = {
      id: `req_${++this.requestCounter}`,
      handler,
      target,
      trigger,
      data,
      element
    };

    this.pendingRequests.set(request.id, request);

    // Trigger before request event
    const beforeEvent = new CustomEvent('wsx:beforeRequest', {
      detail: { request, element }
    });
    element.dispatchEvent(beforeEvent);

    // Send the request
    this.send({
      id: request.id,
      handler,
      target,
      trigger,
      data,
      swap
    });
  }

  send(message) {
    if (this.demoMode) {
      // Handle demo mode with simulated responses
      setTimeout(() => {
        const demoResponse = this.generateDemoResponse(message);
        this.handleMessage(demoResponse);
      }, 100 + Math.random() * 300); // Simulate network delay
    } else if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
      this.log('Sent message:', message);
    } else {
      this.log('Cannot send message: not connected');
    }
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[WSX]', ...args);
    }
  }

  // Public API
  isConnected() {
    return this.isConnected;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Programmatic trigger
  trigger(selector, data) {
    const element = document.querySelector(selector);
    if (element && element.hasAttribute('wx-send')) {
      if (data) {
        element.setAttribute('wx-data', JSON.stringify(data));
      }
      this.handleTrigger(element, 'programmatic');
    }
  }
}

// Auto-initialize if wx-config is present
document.addEventListener('DOMContentLoaded', () => {
  const configElement = document.querySelector('[wx-config]');
  if (configElement) {
    const config = JSON.parse(configElement.getAttribute('wx-config') || '{}');
    window.wsx = new WSX(config);
  }
});

// Make WSX available globally
window.WSX = WSX;