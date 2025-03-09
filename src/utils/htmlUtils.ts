import DOMPurify from 'dompurify';

/**
 * Utility functions for safely handling HTML content
 */

/**
 * Configuration for DOMPurify
 */
const defaultSanitizeConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
    'blockquote', 'code', 'pre', 'hr', 'br', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id', 'style',
    'width', 'height', 'align', 'valign', 'colspan', 'rowspan'
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  FORCE_HTTPS: true,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  WHOLE_DOCUMENT: false,
  SANITIZE_NAMED_PROPS: true
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @param config Optional configuration for DOMPurify
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (html: string, config = {}): string => {
  if (!html) return '';
  
  const sanitizeConfig = {
    ...defaultSanitizeConfig,
    ...config
  };
  
  return DOMPurify.sanitize(html, sanitizeConfig);
};

/**
 * Creates a safe props object for dangerouslySetInnerHTML
 * @param html The HTML content to sanitize
 * @param config Optional configuration for DOMPurify
 * @returns Props object for dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string, config = {}): { dangerouslySetInnerHTML: { __html: string } } => {
  return {
    dangerouslySetInnerHTML: {
      __html: sanitizeHtml(html, config)
    }
  };
};

/**
 * Strips all HTML tags from a string
 * @param html The HTML content to strip
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = sanitizeHtml(html, { ALLOWED_TAGS: [] });
  
  // Return the text content
  return tempElement.textContent || tempElement.innerText || '';
};

/**
 * Truncates HTML content to a specified length while preserving HTML structure
 * @param html The HTML content to truncate
 * @param maxLength The maximum length of the text content
 * @param suffix The suffix to add to truncated content (default: '...')
 * @returns Truncated HTML content
 */
export const truncateHtml = (html: string, maxLength: number, suffix = '...'): string => {
  if (!html) return '';
  
  // Sanitize the HTML first
  const sanitized = sanitizeHtml(html);
  
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = sanitized;
  
  // Get the text content
  const textContent = tempElement.textContent || tempElement.innerText || '';
  
  // If the text content is already shorter than maxLength, return the sanitized HTML
  if (textContent.length <= maxLength) {
    return sanitized;
  }
  
  // Otherwise, truncate the text content
  let truncated = '';
  let currentLength = 0;
  
  // Function to process a node and its children
  const processNode = (node: Node): boolean => {
    if (currentLength >= maxLength) {
      return false;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const remainingLength = maxLength - currentLength;
      
      if (text.length <= remainingLength) {
        truncated += text;
        currentLength += text.length;
        return true;
      } else {
        truncated += text.substring(0, remainingLength) + suffix;
        currentLength = maxLength;
        return false;
      }
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Skip non-content elements
      if (['script', 'style', 'meta', 'link'].includes(tagName)) {
        return true;
      }
      
      // Start tag
      truncated += `<${tagName}`;
      
      // Add attributes
      Array.from(element.attributes).forEach(attr => {
        truncated += ` ${attr.name}="${attr.value}"`;
      });
      
      truncated += '>';
      
      // Process children
      let continueProcessing = true;
      Array.from(element.childNodes).forEach(child => {
        if (continueProcessing) {
          continueProcessing = processNode(child);
        }
      });
      
      // End tag
      truncated += `</${tagName}>`;
      
      return continueProcessing;
    }
    
    return true;
  };
  
  // Process the root element's children
  Array.from(tempElement.childNodes).forEach(child => {
    if (currentLength < maxLength) {
      processNode(child);
    }
  });
  
  return truncated;
};

export default {
  sanitizeHtml,
  createSafeHtml,
  stripHtml,
  truncateHtml
}; 