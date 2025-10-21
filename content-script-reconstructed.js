/**
 * Content Script - Reconstructed from minified code
 * This is a browser extension content script with viewport detection,
 * DOM manipulation, and message handling capabilities
 */

"use strict";

// ============================================
// UTILITY FUNCTIONS & HELPERS
// ============================================

/**
 * Define property with specific descriptor
 */
const definePropertyHelper = Object.defineProperty;

/**
 * Throw TypeError helper
 */
const throwTypeError = (message) => {
  throw TypeError(message);
};

/**
 * Set property on object with proper descriptor
 */
const setPropertyWithDescriptor = (obj, prop, value) => 
  prop in obj 
    ? definePropertyHelper(obj, prop, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
      }) 
    : obj[prop] = value;

/**
 * Set property helper with symbol support
 */
const setProperty = (obj, prop, value) => 
  setPropertyWithDescriptor(obj, typeof prop != "symbol" ? prop + "" : prop, value);

/**
 * Check if property exists or throw error
 */
const checkPropertyOrThrow = (obj, prop, action) => 
  prop.has(obj) || throwTypeError("Cannot " + action);

/**
 * Read from private field
 */
const readPrivateField = (obj, field, getter) => (
  checkPropertyOrThrow(obj, field, "read from private field"),
  getter ? getter.call(obj) : field.get(obj)
);

/**
 * Add private member
 */
const addPrivateMember = (obj, field, value) => 
  field.has(obj) 
    ? throwTypeError("Cannot add the same private member more than once") 
    : field instanceof WeakSet 
      ? field.add(obj) 
      : field.set(obj, value);

/**
 * Write to private field
 */
const writePrivateField = (obj, field, value, setter) => (
  checkPropertyOrThrow(obj, field, "write to private field"),
  setter ? setter.call(obj, value) : field.set(obj, value),
  value
);

/**
 * Access private method
 */
const accessPrivateMethod = (obj, field, method) => (
  checkPropertyOrThrow(obj, field, "access private method"),
  method
);

/**
 * Create private property accessor
 */
const createPrivateAccessor = (obj, field, setter, getter) => ({
  set _(value) {
    writePrivateField(obj, field, value, setter);
  },
  get _() {
    return readPrivateField(obj, field, getter);
  }
});

// ============================================
// BROWSER API DETECTION
// ============================================

/**
 * Detect and get the appropriate browser API (Chrome or Firefox)
 */
const getBrowserAPI = (() => {
  const browserRuntime = globalThis.browser?.runtime;
  const hasRuntimeId = browserRuntime?.id;
  return hasRuntimeId == null ? globalThis.chrome : globalThis.browser;
})();

// ============================================
// VIEWPORT DETECTION CONSTANTS
// ============================================

const VIEWPORT_CLASS = "dex-viewport";
const VIEWPORT_START_ID = "dex-viewport-start";
const VIEWPORT_END_ID = "dex-viewport-end";

// ============================================
// LOGGING UTILITIES
// ============================================

/**
 * Identity function
 */
function identity(value) {
  return value;
}

/**
 * Create a no-op logger
 */
const createNoOpLogger = (config) => ({
  info: (...args) => {},
  success: (...args) => {},
  error: (...args) => {},
  warn: (...args) => {}
});

// ============================================
// VIEWPORT DETECTION FUNCTIONS
// ============================================

/**
 * Check if an element is visible in the viewport
 * @param {Node} element - The element to check
 * @param {number} buffer - Buffer zone around viewport (default: 0)
 * @returns {boolean} - True if element is visible
 */
function isElementInViewport(element, buffer = 0) {
  try {
    const parent = element.parentElement;
    if (!parent) return false;
    
    const styles = window.getComputedStyle(parent);
    if (styles.display === "none" || 
        styles.visibility === "hidden" || 
        styles.opacity === "0") {
      return false;
    }
    
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = range.getClientRects();
    
    if (!rects || rects.length === 0) return false;
    
    for (const rect of rects) {
      const isNotEmpty = rect.width !== 0 && rect.height !== 0;
      const isInViewport = !(
        rect.bottom < -buffer || 
        rect.top > window.innerHeight + buffer || 
        rect.right < -buffer || 
        rect.left > window.innerWidth + buffer
      );
      
      if (isNotEmpty && isInViewport) {
        return true;
      }
    }
  } catch (error) {
    // Silently fail
  }
  return false;
}

/**
 * Clear all viewport markers from the document
 */
function clearViewportMarkers() {
  // Remove viewport class from all elements
  document.querySelectorAll(`.${VIEWPORT_CLASS}`).forEach(element => {
    element.classList.remove(VIEWPORT_CLASS);
  });
  
  // Remove start marker
  const startMarker = document.getElementById(VIEWPORT_START_ID);
  if (startMarker) startMarker.remove();
  
  // Remove end marker  
  const endMarker = document.getElementById(VIEWPORT_END_ID);
  if (endMarker) endMarker.remove();
  
  // Remove data-marker-type elements
  document.querySelectorAll('[data-marker-type="viewport-start"]')
    .forEach(element => element.remove());
  document.querySelectorAll('[data-marker-type="viewport-end"]')
    .forEach(element => element.remove());
}

/**
 * Mark visible text nodes in the viewport
 * @param {number} buffer - Buffer zone around viewport
 */
function markViewportContent(buffer = 0) {
  // Clear existing markers
  clearViewportMarkers();
  
  let firstVisibleElement = null;
  let lastVisibleElement = null;
  
  // Create tree walker to traverse text nodes
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const text = node.textContent?.trim();
        const parent = node.parentElement;
        
        if (parent) {
          const tagName = parent.tagName.toLowerCase();
          // Skip script, style, code, and pre elements
          if (tagName === "script" || 
              tagName === "style" || 
              tagName === "code" || 
              tagName === "pre") {
            return NodeFilter.FILTER_REJECT;
          }
          
          const styles = window.getComputedStyle(parent);
          if (styles.display === "none" || 
              styles.visibility === "hidden") {
            return NodeFilter.FILTER_REJECT;
          }
        }
        
        return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  // Walk through text nodes
  let node;
  while (node = treeWalker.nextNode()) {
    const textNode = node;
    if (isElementInViewport(textNode, buffer)) {
      const parent = textNode.parentElement;
      if (parent && !parent.classList.contains(VIEWPORT_CLASS)) {
        parent.classList.add(VIEWPORT_CLASS);
        
        if (!firstVisibleElement) {
          firstVisibleElement = parent;
        }
        lastVisibleElement = parent;
      }
    }
  }
  
  // Add viewport markers if we found visible content
  if (firstVisibleElement && lastVisibleElement) {
    // Adjust for code/pre parent elements
    adjustForCodeBlocks(firstVisibleElement, lastVisibleElement);
    
    // Create start marker
    const startMarker = document.createElement("div");
    startMarker.id = VIEWPORT_START_ID;
    startMarker.className = "dex-viewport-marker-start";
    startMarker.style.display = "none";
    startMarker.setAttribute("data-marker-type", "viewport-start");
    
    // Create end marker
    const endMarker = document.createElement("div");
    endMarker.id = VIEWPORT_END_ID;
    endMarker.className = "dex-viewport-marker-end";
    endMarker.style.display = "none";
    endMarker.setAttribute("data-marker-type", "viewport-end");
    
    // Insert markers
    firstVisibleElement.parentNode?.insertBefore(startMarker, firstVisibleElement);
    
    if (lastVisibleElement.nextSibling) {
      lastVisibleElement.parentNode?.insertBefore(endMarker, lastVisibleElement.nextSibling);
    } else {
      lastVisibleElement.parentNode?.appendChild(endMarker);
    }
  }
  
  /**
   * Adjust elements if they're inside code or pre blocks
   */
  function adjustForCodeBlocks(first, last) {
    // Check first element
    let parent = first.parentNode;
    while (parent && parent !== document.body) {
      const tagName = parent.tagName?.toLowerCase();
      if (tagName === "code" || tagName === "pre") {
        parent = parent.parentNode;
        firstVisibleElement = parent;
      } else {
        break;
      }
    }
    
    // Check last element
    parent = last.parentNode;
    while (parent && parent !== document.body) {
      const tagName = parent.tagName?.toLowerCase();
      if (tagName === "code" || tagName === "pre") {
        parent = parent.parentNode;
        lastVisibleElement = parent;
      } else {
        break;
      }
    }
  }
}

// ============================================
// MODULE HELPERS
// ============================================

/**
 * Get the default export from a module
 */
function getDefaultExport(module) {
  return module && module.__esModule && 
         Object.prototype.hasOwnProperty.call(module, "default") 
    ? module.default 
    : module;
}

// ============================================
// EXPORT MODULE PATTERN
// ============================================

const moduleExports = {
  exports: {}
};

const ReactProductionExports = {};

// ============================================
// REACT PRODUCTION EXPORTS
// ============================================

/**
 * React Production Module
 * Based on React v19.1.1
 */
function initializeReactProduction() {
  if (ReactProductionExports._initialized) return ReactProductionExports;
  
  ReactProductionExports._initialized = true;
  
  // React symbols
  const REACT_ELEMENT_SYMBOL = Symbol.for("react.transitional.element");
  const REACT_PORTAL_SYMBOL = Symbol.for("react.portal");
  const REACT_FRAGMENT_SYMBOL = Symbol.for("react.fragment");
  const REACT_STRICT_MODE_SYMBOL = Symbol.for("react.strict_mode");
  const REACT_PROFILER_SYMBOL = Symbol.for("react.profiler");
  const REACT_CONSUMER_SYMBOL = Symbol.for("react.consumer");
  const REACT_CONTEXT_SYMBOL = Symbol.for("react.context");
  const REACT_FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
  const REACT_SUSPENSE_SYMBOL = Symbol.for("react.suspense");
  const REACT_MEMO_SYMBOL = Symbol.for("react.memo");
  const REACT_LAZY_SYMBOL = Symbol.for("react.lazy");
  
  const ITERATOR_SYMBOL = Symbol.iterator;
  
  /**
   * Get iterator from an object
   */
  function getIterator(obj) {
    if (obj === null || typeof obj !== "object") return null;
    const iterator = ITERATOR_SYMBOL && obj[ITERATOR_SYMBOL] || obj["@@iterator"];
    return typeof iterator === "function" ? iterator : null;
  }
  
  /**
   * Default updater object
   */
  const defaultUpdater = {
    isMounted: function() { return false; },
    enqueueForceUpdate: function() {},
    enqueueReplaceState: function() {},
    enqueueSetState: function() {}
  };
  
  /**
   * React Component class
   */
  function ReactComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater || defaultUpdater;
  }
  
  ReactComponent.prototype.isReactComponent = {};
  ReactComponent.prototype.setState = function(partialState, callback) {
    if (typeof partialState !== "object" && 
        typeof partialState !== "function" && 
        partialState != null) {
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    }
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  ReactComponent.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  
  /**
   * React PureComponent class
   */
  function ReactPureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater || defaultUpdater;
  }
  
  const pureComponentPrototype = ReactPureComponent.prototype = new ReactComponent();
  pureComponentPrototype.constructor = ReactPureComponent;
  Object.assign(pureComponentPrototype, ReactComponent.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  
  /**
   * Create React element
   */
  function createElement(type, config, children) {
    let propName;
    const props = {};
    let key = null;
    let ref = null;
    
    if (config != null) {
      if (config.ref !== undefined) {
        ref = config.ref;
      }
      if (config.key !== undefined) {
        key = "" + config.key;
      }
      
      for (propName in config) {
        if (Object.prototype.hasOwnProperty.call(config, propName) && 
            propName !== "key" && 
            propName !== "ref") {
          props[propName] = config[propName];
        }
      }
    }
    
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      const childArray = Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    
    return {
      $$typeof: REACT_ELEMENT_SYMBOL,
      type: type,
      key: key,
      ref: ref,
      props: props
    };
  }
  
  /**
   * Check if object is valid React element
   */
  function isValidElement(object) {
    return typeof object === "object" && 
           object !== null && 
           object.$$typeof === REACT_ELEMENT_SYMBOL;
  }
  
  /**
   * Create ref object
   */
  function createRef() {
    return { current: null };
  }
  
  /**
   * Forward ref component wrapper
   */
  function forwardRef(render) {
    return {
      $$typeof: REACT_FORWARD_REF_SYMBOL,
      render: render
    };
  }
  
  /**
   * Memo component wrapper
   */
  function memo(component, compare) {
    return {
      $$typeof: REACT_MEMO_SYMBOL,
      type: component,
      compare: compare === undefined ? null : compare
    };
  }
  
  /**
   * Lazy component wrapper
   */
  function lazy(loader) {
    return {
      $$typeof: REACT_LAZY_SYMBOL,
      _payload: {
        _status: -1,
        _result: loader
      },
      _init: lazyInitializer
    };
  }
  
  function lazyInitializer(payload) {
    // Lazy loading implementation
    return payload._result;
  }
  
  // Export React production functions
  ReactProductionExports.Component = ReactComponent;
  ReactProductionExports.PureComponent = ReactPureComponent;
  ReactProductionExports.createElement = createElement;
  ReactProductionExports.createRef = createRef;
  ReactProductionExports.forwardRef = forwardRef;
  ReactProductionExports.isValidElement = isValidElement;
  ReactProductionExports.lazy = lazy;
  ReactProductionExports.memo = memo;
  ReactProductionExports.Fragment = REACT_FRAGMENT_SYMBOL;
  ReactProductionExports.StrictMode = REACT_STRICT_MODE_SYMBOL;
  ReactProductionExports.Suspense = REACT_SUSPENSE_SYMBOL;
  ReactProductionExports.version = "19.1.1";
  
  // Hooks placeholders (implemented at runtime)
  ReactProductionExports.useCallback = function(callback, deps) { 
    return getCurrentDispatcher().useCallback(callback, deps); 
  };
  ReactProductionExports.useContext = function(context) { 
    return getCurrentDispatcher().useContext(context); 
  };
  ReactProductionExports.useEffect = function(effect, deps) {
    return getCurrentDispatcher().useEffect(effect, deps);
  };
  ReactProductionExports.useId = function() {
    return getCurrentDispatcher().useId();
  };
  ReactProductionExports.useLayoutEffect = function(effect, deps) {
    return getCurrentDispatcher().useLayoutEffect(effect, deps);
  };
  ReactProductionExports.useMemo = function(create, deps) {
    return getCurrentDispatcher().useMemo(create, deps);
  };
  ReactProductionExports.useReducer = function(reducer, initialArg, init) {
    return getCurrentDispatcher().useReducer(reducer, initialArg, init);
  };
  ReactProductionExports.useRef = function(initialValue) {
    return getCurrentDispatcher().useRef(initialValue);
  };
  ReactProductionExports.useState = function(initialState) {
    return getCurrentDispatcher().useState(initialState);
  };
  
  // Get current dispatcher (hook implementation)
  function getCurrentDispatcher() {
    // This would be set by React runtime
    return ReactProductionExports._currentDispatcher || {
      useCallback: () => {},
      useContext: () => {},
      useEffect: () => {},
      useId: () => "",
      useLayoutEffect: () => {},
      useMemo: () => {},
      useReducer: () => {},
      useRef: () => ({ current: null }),
      useState: () => [null, () => {}]
    };
  }
  
  return ReactProductionExports;
}

// ============================================
// SCHEDULER MODULE
// ============================================

/**
 * React Scheduler implementation
 * Handles task scheduling and prioritization
 */
const Scheduler = (function() {
  /**
   * Min heap implementation for priority queue
   */
  function pushToHeap(heap, node) {
    const index = heap.length;
    heap.push(node);
    siftUp(heap, node, index);
  }
  
  function peek(heap) {
    return heap.length === 0 ? null : heap[0];
  }
  
  function pop(heap) {
    if (heap.length === 0) return null;
    
    const first = heap[0];
    const last = heap.pop();
    
    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }
    
    return first;
  }
  
  function siftUp(heap, node, index) {
    while (index > 0) {
      const parentIndex = (index - 1) >>> 1;
      const parent = heap[parentIndex];
      
      if (compare(parent, node) > 0) {
        heap[parentIndex] = node;
        heap[index] = parent;
        index = parentIndex;
      } else {
        return;
      }
    }
  }
  
  function siftDown(heap, node, index) {
    const length = heap.length;
    const halfLength = length >>> 1;
    
    while (index < halfLength) {
      const leftIndex = (index + 1) * 2 - 1;
      const left = heap[leftIndex];
      const rightIndex = leftIndex + 1;
      const right = heap[rightIndex];
      
      if (compare(left, node) < 0) {
        if (rightIndex < length && compare(right, left) < 0) {
          heap[index] = right;
          heap[rightIndex] = node;
          index = rightIndex;
        } else {
          heap[index] = left;
          heap[leftIndex] = node;
          index = leftIndex;
        }
      } else if (rightIndex < length && compare(right, node) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        return;
      }
    }
  }
  
  function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  }
  
  // Performance timing
  const hasPerformanceNow = typeof performance === "object" && 
                           typeof performance.now === "function";
  
  const getCurrentTime = hasPerformanceNow
    ? () => performance.now()
    : () => Date.now();
  
  // Task queues
  const taskQueue = [];
  const timerQueue = [];
  
  // Task ID counter
  let taskIdCounter = 1;
  
  // Current task
  let currentTask = null;
  let currentPriorityLevel = 3; // Normal priority
  
  // Scheduler flags
  let isSchedulerPaused = false;
  let isPerformingWork = false;
  let isHostCallbackScheduled = false;
  let isHostTimeoutScheduled = false;
  
  // Timers
  let hostTimeout = null;
  let hostCallback = null;
  
  /**
   * Schedule callback with priority
   */
  function scheduleCallback(priorityLevel, callback, options) {
    const currentTime = getCurrentTime();
    const startTime = options?.delay != null 
      ? currentTime + options.delay 
      : currentTime;
    
    const timeout = getPriorityTimeout(priorityLevel);
    const expirationTime = startTime + timeout;
    
    const newTask = {
      id: taskIdCounter++,
      callback: callback,
      priorityLevel: priorityLevel,
      startTime: startTime,
      expirationTime: expirationTime,
      sortIndex: -1
    };
    
    if (startTime > currentTime) {
      // Delayed task
      newTask.sortIndex = startTime;
      pushToHeap(timerQueue, newTask);
      
      if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
        scheduleHostTimeout(startTime - currentTime);
      }
    } else {
      // Immediate task
      newTask.sortIndex = expirationTime;
      pushToHeap(taskQueue, newTask);
      
      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback();
      }
    }
    
    return newTask;
  }
  
  /**
   * Get timeout for priority level
   */
  function getPriorityTimeout(priorityLevel) {
    switch (priorityLevel) {
      case 1: return -1;      // Immediate
      case 2: return 250;     // User blocking
      case 3: return 5000;    // Normal
      case 4: return 10000;   // Low
      case 5: return 1073741823; // Idle
      default: return 5000;
    }
  }
  
  /**
   * Request host callback
   */
  function requestHostCallback() {
    if (typeof MessageChannel !== "undefined") {
      const channel = new MessageChannel();
      const port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;
      port.postMessage(null);
    } else {
      setTimeout(performWorkUntilDeadline, 0);
    }
  }
  
  /**
   * Schedule host timeout
   */
  function scheduleHostTimeout(delay) {
    hostTimeout = setTimeout(() => {
      handleTimeout(getCurrentTime());
    }, delay);
  }
  
  /**
   * Perform work until deadline
   */
  function performWorkUntilDeadline() {
    if (hostCallback !== null) {
      const currentTime = getCurrentTime();
      const hasMoreWork = hostCallback(currentTime);
      
      if (hasMoreWork) {
        requestHostCallback();
      } else {
        isHostCallbackScheduled = false;
      }
    }
  }
  
  /**
   * Handle timeout
   */
  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);
    
    if (!isHostCallbackScheduled) {
      if (peek(taskQueue) !== null) {
        isHostCallbackScheduled = true;
        requestHostCallback();
      } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer !== null) {
          scheduleHostTimeout(firstTimer.startTime - currentTime);
        }
      }
    }
  }
  
  /**
   * Advance timers
   */
  function advanceTimers(currentTime) {
    let timer = peek(timerQueue);
    
    while (timer !== null) {
      if (timer.callback === null) {
        pop(timerQueue);
      } else if (timer.startTime <= currentTime) {
        pop(timerQueue);
        timer.sortIndex = timer.expirationTime;
        pushToHeap(taskQueue, timer);
      } else {
        return;
      }
      
      timer = peek(timerQueue);
    }
  }
  
  return {
    scheduleCallback,
    getCurrentTime,
    // Priority levels
    ImmediatePriority: 1,
    UserBlockingPriority: 2,
    NormalPriority: 3,
    LowPriority: 4,
    IdlePriority: 5
  };
})();

// ============================================
// CONTENT EXTRACTION
// ============================================

/**
 * Extract content from the current page
 */
async function extractPageContent() {
  const content = {
    title: document.title,
    url: window.location.href,
    text: "",
    metadata: {},
    viewport: {}
  };
  
  // Extract visible text
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        const tagName = parent.tagName.toLowerCase();
        if (tagName === "script" || 
            tagName === "style" || 
            tagName === "noscript") {
          return NodeFilter.FILTER_REJECT;
        }
        
        const styles = window.getComputedStyle(parent);
        if (styles.display === "none" || 
            styles.visibility === "hidden") {
          return NodeFilter.FILTER_REJECT;
        }
        
        const text = node.textContent?.trim();
        return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  const textParts = [];
  let node;
  while (node = walker.nextNode()) {
    textParts.push(node.textContent.trim());
  }
  
  content.text = textParts.join(" ");
  
  // Extract metadata
  const metaTags = document.querySelectorAll("meta");
  metaTags.forEach(meta => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    const content_value = meta.getAttribute("content");
    if (name && content_value) {
      content.metadata[name] = content_value;
    }
  });
  
  // Get viewport content
  const viewportElements = document.querySelectorAll(`.${VIEWPORT_CLASS}`);
  const viewportText = Array.from(viewportElements)
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .join(" ");
  
  content.viewport = {
    text: viewportText,
    elementCount: viewportElements.length
  };
  
  return content;
}

// ============================================
// HIGHLIGHT FUNCTIONALITY
// ============================================

/**
 * Search and highlight text on the page
 * @param {Object} config - Search configuration
 * @param {string} config.text - Text to search for
 * @param {string} config.indexColor - Highlight color
 */
function searchAndHighlight({ text, indexColor = "#ff9813" }) {
  if (!text) return false;
  
  // Remove existing highlights
  clearHighlights();
  
  const searchText = text.toLowerCase();
  let found = false;
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        const tagName = parent.tagName.toLowerCase();
        if (tagName === "script" || 
            tagName === "style" || 
            tagName === "mark") {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const nodesToHighlight = [];
  let node;
  
  while (node = walker.nextNode()) {
    const nodeText = node.textContent.toLowerCase();
    if (nodeText.includes(searchText)) {
      nodesToHighlight.push(node);
      found = true;
    }
  }
  
  // Highlight matching nodes
  nodesToHighlight.forEach(node => {
    const parent = node.parentElement;
    const text = node.textContent;
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(searchText);
    
    if (index !== -1) {
      const before = text.substring(0, index);
      const match = text.substring(index, index + searchText.length);
      const after = text.substring(index + searchText.length);
      
      const mark = document.createElement("mark");
      mark.style.backgroundColor = indexColor;
      mark.style.color = "black";
      mark.textContent = match;
      
      const fragment = document.createDocumentFragment();
      if (before) fragment.appendChild(document.createTextNode(before));
      fragment.appendChild(mark);
      if (after) fragment.appendChild(document.createTextNode(after));
      
      parent.replaceChild(fragment, node);
    }
  });
  
  // Scroll to first highlight
  if (found) {
    const firstHighlight = document.querySelector("mark");
    if (firstHighlight) {
      firstHighlight.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }
  
  return found;
}

/**
 * Clear all highlights from the page
 */
function clearHighlights() {
  const highlights = document.querySelectorAll("mark");
  highlights.forEach(mark => {
    const parent = mark.parentNode;
    const text = mark.textContent;
    parent.replaceChild(document.createTextNode(text), mark);
  });
}

// ============================================
// MESSAGE HANDLING
// ============================================

/**
 * Content script message handler
 */
class ContentScriptHandler {
  constructor(scriptName, config) {
    this.scriptName = scriptName;
    this.config = config;
    this.isInitialized = false;
    this.messageListeners = new Map();
    
    this.initialize();
  }
  
  initialize() {
    if (this.isInitialized) return;
    
    // Set up message listener
    this.setupMessageListener();
    
    // Mark viewport content
    markViewportContent();
    
    // Observe DOM changes
    this.observePageChanges();
    
    this.isInitialized = true;
  }
  
  setupMessageListener() {
    // Listen for messages from extension
    if (getBrowserAPI?.runtime?.onMessage) {
      getBrowserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
        return this.handleMessage(message, sender, sendResponse);
      });
    }
    
    // Listen for window messages
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      
      const { type, payload } = event.data || {};
      
      switch (type) {
        case "dex-viewport-update":
          markViewportContent(payload?.buffer || 0);
          break;
          
        case "dex-extract-content":
          extractPageContent().then(content => {
            window.postMessage({
              type: "dex-content-extracted",
              payload: content
            }, "*");
          });
          break;
          
        case "dex-search-text":
          const found = searchAndHighlight(payload || {});
          window.postMessage({
            type: "dex-search-result",
            payload: { found }
          }, "*");
          break;
          
        case "dex-clear-highlights":
          clearHighlights();
          break;
      }
    });
  }
  
  handleMessage(message, sender, sendResponse) {
    const { type, payload } = message || {};
    
    switch (type) {
      case "mark_viewport":
        markViewportContent(payload?.buffer || 0);
        sendResponse({ success: true });
        return true;
        
      case "clear_viewport":
        clearViewportMarkers();
        sendResponse({ success: true });
        return true;
        
      case "search":
        try {
          const found = searchAndHighlight(payload || {});
          sendResponse({ success: true, found });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        return true;
        
      case "get_page_content":
        extractPageContent()
          .then(content => {
            sendResponse({ success: true, context: content });
          })
          .catch(error => {
            console.error("[content] get_page_content failed", error);
            sendResponse({ success: false });
          });
        return true;
        
      case "insert_text_at_cursor":
        const activeElement = document.activeElement;
        
        if (activeElement && "value" in activeElement) {
          // Handle input/textarea
          const start = activeElement.selectionStart || 0;
          const end = activeElement.selectionEnd || 0;
          const value = activeElement.value;
          const newValue = value.substring(0, start) + payload.text + value.substring(end);
          
          activeElement.value = newValue;
          activeElement.selectionStart = start + payload.text.length;
          activeElement.selectionEnd = start + payload.text.length;
        } else if (activeElement && activeElement.isContentEditable) {
          // Handle contenteditable
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(payload.text));
            range.collapse(false);
          }
        }
        
        sendResponse({ success: true });
        return true;
        
      case "toggle-launcher":
        window.dispatchEvent(new CustomEvent("toggle-launcher"));
        sendResponse({ success: true });
        return true;
        
      case "toggle-custom-sidebar":
        window.dispatchEvent(new CustomEvent("toggle-sidebar-visibility"));
        sendResponse({ success: true });
        return true;
        
      default:
        // Unknown message type
        return false;
    }
  }
  
  observePageChanges() {
    // Observe DOM mutations for dynamic content
    const observer = new MutationObserver((mutations) => {
      // Check if significant changes occurred
      let shouldUpdateViewport = false;
      
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldUpdateViewport = true;
          break;
        }
      }
      
      if (shouldUpdateViewport) {
        // Debounce viewport updates
        clearTimeout(this.viewportUpdateTimer);
        this.viewportUpdateTimer = setTimeout(() => {
          markViewportContent();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  sendMessage(type, payload) {
    if (getBrowserAPI?.runtime?.sendMessage) {
      try {
        getBrowserAPI.runtime.sendMessage({
          type: type,
          payload: payload
        });
      } catch (error) {
        console.error(`Failed to send message ${type}:`, error);
      }
    }
  }
}

// ============================================
// LOGGER
// ============================================

/**
 * Console logger with controlled output
 */
const logger = {
  debug: (...args) => {},  // No-op in production
  log: (...args) => {},    // No-op in production
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

// ============================================
// MAIN INITIALIZATION
// ============================================

/**
 * Initialize and run the content script
 */
async function initializeContentScript() {
  try {
    // Create handler instance
    const handler = new ContentScriptHandler("content", {
      enableViewportDetection: true,
      enableHighlighting: true,
      enableContentExtraction: true
    });
    
    // Notify that content script is ready
    handler.sendMessage("content-script-ready", {
      url: window.location.href,
      timestamp: Date.now()
    });
    
    return handler;
  } catch (error) {
    logger.error('The content script "content" crashed on startup!', error);
    throw error;
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentScript);
} else {
  initializeContentScript();
}
