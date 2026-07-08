const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

/**
 * Fetches product details and 3D media from Shopify Storefront API
 * @param {string} handle - The product handle
 * @returns {Promise<Object>} - The parsed product data containing title, description, and glbUrl
 */
export async function fetchProductWith3DMedia(handle) {
  if (!domain || !storefrontAccessToken) {
    throw new Error('Shopify environment variables are missing.');
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  const query = `
    query getProduct3DMedia($handle: String!) {
      product(handle: $handle) {
        title
        descriptionHtml
        media(first: 10) {
          edges {
            node {
              mediaContentType
              ... on Model3d {
                id
                sources {
                  url
                  format
                  mimeType
                }
              }
              ... on GenericFile {
                id
                url
                mimeType
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors.map((e) => e.message).join(', '));
    }

    const product = json.data?.product;
    
    if (!product) {
      throw new Error('Product not found.');
    }

    let glbUrl = null;

    // Find the first available .glb media source
    for (const edge of product.media.edges) {
      const node = edge.node;
      if (node.mediaContentType === 'MODEL_3D' && node.sources) {
        // Shopify provides multiple formats for Model3d (e.g., usdz, glb)
        const glbSource = node.sources.find(s => s.format === 'glb' || s.url.endsWith('.glb'));
        if (glbSource) {
          glbUrl = glbSource.url;
          break;
        }
      } else if (node.mediaContentType === 'GENERIC_FILE') {
        // Sometimes 3D models are uploaded as generic files
        if (node.url && node.url.endsWith('.glb')) {
          glbUrl = node.url;
          break;
        }
      }
    }

    return {
      title: product.title,
      description: product.descriptionHtml,
      glbUrl: glbUrl,
    };
  } catch (error) {
    console.error('Error fetching product from Shopify:', error);
    throw error;
  }
}

/**
 * Fetches a list of all products from Shopify Storefront API
 * @returns {Promise<Array>} - The parsed list of products containing title, handle, and thumbnail
 */
export async function fetchAllProducts() {
  if (!domain || !storefrontAccessToken) {
    throw new Error('Shopify environment variables are missing.');
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  const query = `
    query getAllProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors.map((e) => e.message).join(', '));
    }

    const products = json.data?.products?.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      thumbnail: edge.node.featuredImage?.url || null,
    }));
    
    return products || [];
  } catch (error) {
    console.error('Error fetching all products from Shopify:', error);
    throw error;
  }
}
