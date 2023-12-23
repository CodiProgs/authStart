import { gql } from "@apollo/client";

export const SET_USERNAME = gql`
  mutation SetUsername($username: String!) {
    setUsername(username: $username){
      username
    }
  }
`