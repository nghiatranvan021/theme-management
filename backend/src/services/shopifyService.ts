import axios from 'axios';

interface ThemeFile {
  filename: string;
  checksumMd5: string;
  contentType: string;
  createdAt: string;
  size: number;
  updatedAt: string;
  body?: {
    content?: string;
  };
}

interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
}

interface ThemeFilesResponse {
  theme: {
    id: string;
    name: string;
    role: string;
    files: {
      pageInfo: PageInfo;
      nodes: ThemeFile[];
    };
  };
}

interface ThemeFilesUpsertResponse {
  themeFilesUpsert: {
    upsertedThemeFiles: { filename: string }[];
    userErrors: { field: string; message: string }[];
  };
}

// interface list themes
export interface ListThemesResponse {
  themes: Themes
}

export interface Themes {
  edges: Edge[]
}

export interface Edge {
  node: Node
}

export interface Node {
  createdAt: string
  id: string
  name: string
  prefix: string
  processing: boolean
  processingFailed: boolean
  role: string
  themeStoreId?: number
  updatedAt: string
}


export const createThemeService = (shopDomain: string, accessToken: string) => {
  const GID_THEME = 'gid://shopify/OnlineStoreTheme/';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken
  });

  const graphqlRequest = async <T>(query: string, variables: Record<string, any>): Promise<T> => {
    try {
      const response = await axios.post(
        `https://${shopDomain}/admin/api/2024-10/graphql.json`,
        {
          query,
          variables
        },
        { headers: getHeaders() }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('GraphQL request failed');
    }
  };

  const getFiles = async (themeId: number, limit: number, filePatterns: string[], cursor?: string) => {
    const query = `
      query($id: ID!, $first: Int, $after: String, $filename: [String!]) {
        theme(id: $id) {
          id
          name
          role
          files(first: $first, after: $after, filenames: $filename) {
            pageInfo {
              endCursor
              hasNextPage
              hasPreviousPage
              startCursor
            }
            nodes {
              filename
              checksumMd5
              contentType
              createdAt
              size
              updatedAt
            }
          }
        }
      }
    `;

    return graphqlRequest<ThemeFilesResponse>(query, {
      id: `${GID_THEME}${themeId}`,
      first: limit,
      after: cursor,
      filename: filePatterns
    });
  };

  const getAssets = async (themeId: number): Promise<ThemeFile[]> => {
    const limit = 50;
    const filePatterns = [
      'layout/*',
      'templates/*',
      'sections/*',
      'blocks/*',
      'snippets/*',
      'config/*',
      'assets/*',
      'locales/*'
    ];

    const fetchAllFiles = async (pattern: string): Promise<ThemeFile[]> => {
      let allFiles: ThemeFile[] = [];
      let cursor: string | undefined;

      while (true) {
        const response = await getFiles(themeId, limit, [pattern], cursor);
        allFiles = [...allFiles, ...response.theme.files.nodes];

        if (!response.theme.files.pageInfo.hasNextPage) {
          break;
        }
        cursor = response.theme.files.pageInfo.endCursor;
      }

      return allFiles;
    };

    const filePromises = filePatterns.map(pattern => fetchAllFiles(pattern));
    const results = await Promise.all(filePromises);
    return results.flat();
  };

  const getAsset = async (themeId: number, filename: string): Promise<ThemeFile> => {
    const query = `
      query($id: ID!, $filename: [String!]) {
        theme(id: $id) {
          id
          name
          role
          files(filenames: $filename, first: 1) {
            nodes {
              filename
              checksumMd5
              contentType
              createdAt
              size
              updatedAt
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
            }
          }
        }
      }
    `;

    const response = await graphqlRequest<ThemeFilesResponse>(query, {
      id: `${GID_THEME}${themeId}`,
      filename: [filename]
    });

    if (!response.theme.files.nodes.length) {
      throw new Error('No content found');
    }

    return response.theme.files.nodes[0];
  };

  const findContent = async (themeId: number, key: string): Promise<string> => {
    const file = await getAsset(themeId, key);
    return file.body?.content || '';
  };

  const updateContent = async (themeId: number, key: string, content: string): Promise<void> => {
    const mutation = `
      mutation themeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
        themeFilesUpsert(files: $files, themeId: $themeId) {
          upsertedThemeFiles {
            filename
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await graphqlRequest<ThemeFilesUpsertResponse>(mutation, {
      themeId: `${GID_THEME}${themeId}`,
      files: [{
        filename: key,
        body: {
          type: "TEXT",
          value: content
        }
      }]
    });

    if (response.themeFilesUpsert.userErrors.length > 0) {
      throw new Error(response.themeFilesUpsert.userErrors[0].message);
    }
  };
  const getThemes = async () => {
    const query = `query ThemeList {
      themes(first: 20) {
        edges {
          node {
            createdAt
            id
            name
            prefix
            processing
            processingFailed
            role
            themeStoreId
            updatedAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }`

    const response = await graphqlRequest<ListThemesResponse>(query, {});

    if (!response.themes.edges.length) {
      throw new Error('No themes found');
    }

    return response.themes.edges;
  }

  return {
    getAssets,
    getAsset,
    findContent,
    updateContent,
    getThemes
  };
};

