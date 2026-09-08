export const FILES_QUERY = `
  query GetFiles($first: Int!, $after: String) {
    files(first: $first, after: $after, query: "media_type:VIDEO") {
      edges {
        cursor
        node {
          ... on Video {
            id
            alt
            createdAt
            originalSource {
              url
              format
              mimeType
            }
            sources {
              url
              format
              mimeType
            }
          }
          ... on ExternalVideo {
            id
            alt
            createdAt
            embedUrl
            originUrl
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
