import { API_ROUTES } from './apiRoutes';

/**
 * Fetches product details and 3D configuration from the backend API
 * @param {string} id - The product ID
 * @returns {Promise<Object>} - The parsed product details data
 */
export async function fetchProductWith3DMedia(id) {
  const endpoint = API_ROUTES.PRODUCT_DETAILS(id);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();
    console.log("Fetch Product Details Response:", json);

    if (!response.ok) {
      throw new Error(json.message || `Failed to fetch product with status ${response.status}`);
    }

    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`Error fetching product details for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches a list of all products from the backend API
 * @returns {Promise<Array>} - The list of products containing id, title, handle, and thumbnail
 */
export async function fetchAllProducts() {
  const endpoint = API_ROUTES.PRODUCTS;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();
    console.log("Fetch All Products Response:", json);

    if (!response.ok) {
      throw new Error(`Failed to fetch products with status ${response.status}`);
    }

    return json.data?.products ?? json.products ?? (Array.isArray(json) ? json : []);
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
}
