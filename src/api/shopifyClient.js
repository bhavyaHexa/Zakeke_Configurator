import { API_ROUTES } from './apiRoutes';

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

  const endpoint = API_ROUTES.GRAPHQL;

  const query = `
    query getProduct3DMedia($handle: String!) {
      product(handle: $handle) {
        title
        descriptionHtml
        env_metafield: metafield(namespace: "custom", key: "environment") {
          value
        }
        hdr_metafield: metafield(namespace: "custom", key: "hdr") {
          reference {
            ... on GenericFile {
              url
            }
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
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
    console.log("Product with 3D Media Response:", json);

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
      }
    }

    let envMetafield = null;
    if (product.env_metafield && product.env_metafield.value) {
      try {
        envMetafield = JSON.parse(product.env_metafield.value);
      } catch (err) {
        console.error("Failed to parse env_metafield value:", err);
      }
    }

    const hdrUrl = product.hdr_metafield?.reference?.url || product.hdr_metafield?.reference?.image?.url || null;

    return {
      title: product.title,
      description: product.descriptionHtml,
      glbUrl: glbUrl,
      envMetafield: envMetafield,
      hdrUrl: hdrUrl
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

  const endpoint = API_ROUTES.GRAPHQL;

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
    console.log("All Products Response:", json);

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
