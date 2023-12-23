import { gql } from "@apollo/client";

export const DELETE_REFRESH_TOKEN = gql`
  mutation DeleteRefreshToken($id: Float!) {
    deleteRefreshToken(id: $id)
  }
`