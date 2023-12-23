import { gql } from "@apollo/client";

export const GET_REFRESH_TOKENS = gql`
  query GetRefreshTokens {
    getRefreshTokens {
      id
      ip
      device
      createdAt
    }
  }
`