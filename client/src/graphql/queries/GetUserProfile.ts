import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUserProfile (
    $username: String!
  ) {
    getUserProfile (
      username: $username
    ) {
      id
      username
      name
      surname
      email
      avatar
    }
  }
`