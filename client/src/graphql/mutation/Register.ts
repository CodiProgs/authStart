import { gql } from "@apollo/client";

export const REGISTER = gql`
    mutation Register(
        $name: String!
        $surname: String!
        $email: String!
        $password: String!
    ) {
        register(
            registerInput: {
                name: $name
                surname: $surname
                email: $email
                password: $password
            }
        ){
            id
            name
            surname
            username
            email
            avatar
        }
    }
`