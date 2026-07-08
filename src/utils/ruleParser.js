/**
 * Parses a JSON string embedded in HTML.
 * Shopify product descriptions are often wrapped in HTML tags like <p>, <br>, etc.
 * @param {string} htmlString - The raw HTML description from Shopify
 * @returns {Object|null} - The parsed JSON configuration object or null if invalid
 */
export function parseRulesFromDescription(htmlString) {
  if (!htmlString) return null;

  try {
    // 1. Create a dummy DOM element to safely extract raw text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // 2. Get the text content, which strips out all HTML tags (<p>, <strong>, etc.)
    let textContent = tempDiv.textContent || tempDiv.innerText || '';

    // 3. Clean up zero-width spaces, non-breaking spaces, or weird formatting Shopify might inject
    textContent = textContent.replace(/[\u200B-\u200D\uFEFF]/g, ''); 
    textContent = textContent.trim();

    // 4. Find the first '{' and last '}' to ensure we only grab the JSON object
    // in case there is some stray text before or after the JSON block.
    const startIndex = textContent.indexOf('{');
    const endIndex = textContent.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.warn('No JSON object found in the product description.');
      return null;
    }

    const jsonString = textContent.substring(startIndex, endIndex + 1);

    // 5. Parse and return
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON configuration rules from description:', error);
    return null;
  }
}
