import { gql } from "@apollo/client";

export const REGISTER = gql`
    mutation Register(
        $fullname: String!
        $email: String!
        $password: String!
    ) {
        register(
            registerInput: {
                fullname: $fullname
                email: $email
                password: $password
            }
        ){
            id
            fullname
            email
            image
        }
    }
`