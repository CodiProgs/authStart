import { gql } from "@apollo/client";

export const LOGIN = gql`
    mutation Login(
        $email: String!
        $password: String!
    ){
        login(
            loginInput: {
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