import { gql } from "@apollo/client";

export const SHOW_SESSION = gql`
    query ShowSession (
        $userId: String!
    ){
        showSession(
            userId: $userId
        )
    }
`