import { gql } from "@apollo/client";

export const VALIDATE_USERNAME = gql`
  query ValidateUsername($username: String!) {
    validateUsername(username: $username)
  }
`