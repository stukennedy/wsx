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
  }

  scheduleReconnect() {
    setTimeout(() => {
      this.reconnectAttempts++;
      this.log(`Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      this.connect();
    }, this.config.reconnectInterval);
  }

  handleMessage(message) {
    const targetElement = document.querySelector(message.target);
    
    if (!targetElement) {
      this.log(`Target element not found: ${message.target}`);
      return;
    }

    const swap = message.swap || 'innerHTML';
    const swapSpec = this.parseSwapSpec(swap);
    
    // Trigger before swap event
    const beforeEvent = new CustomEvent('wsx:beforeSwap', {
      detail: { message, element: targetElement }
    });
    targetElement.dispatchEvent(beforeEvent);

    // Apply swap delay if specified
    const delay = swapSpec.swap || 0;
    
    setTimeout(() => {
      // Perform the swap
      this.performSwap(targetElement, message.html, swapSpec);

      // Apply settle delay and trigger after swap event
      const settleDelay = swapSpec.settle || 20;
      setTimeout(() => {
        const afterEvent = new CustomEvent('wsx:afterSwap', {
          detail: { message, element: targetElement }
        });
        targetElement.dispatchEvent(afterEvent);

        // Handle show/scroll modifiers
        this.handleShowScroll(targetElement, swapSpec);
      }, settleDelay);

    }, delay);

    // Clean up pending request
    this.pendingRequests.delete(message.id);
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
    // Handle clicks
    document.addEventListener('click', (e) => {
      const element = e.target;
      if (element.hasAttribute('wx-send')) {
        e.preventDefault();
        this.handleTrigger(element, 'click');
      }
    });

    // Handle form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.hasAttribute('wx-send')) {
        e.preventDefault();
        this.handleTrigger(form, 'submit');
      }
    });

    // Handle input changes
    document.addEventListener('input', (e) => {
      const element = e.target;
      if (element.hasAttribute('wx-send') && element.hasAttribute('wx-trigger')) {
        const trigger = element.getAttribute('wx-trigger');
        if (trigger.includes('input') || trigger.includes('change')) {
          this.handleTrigger(element, 'input');
        }
      }
    });

    // Handle custom triggers
    document.addEventListener('keyup', (e) => {
      const element = e.target;
      if (element.hasAttribute('wx-send') && element.hasAttribute('wx-trigger')) {
        const trigger = element.getAttribute('wx-trigger');
        if (trigger.includes('keyup')) {
          this.handleTrigger(element, 'keyup');
        }
      }
    });
  }

  handleTrigger(element, eventType) {
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
    if (this.ws && this.isConnected) {
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