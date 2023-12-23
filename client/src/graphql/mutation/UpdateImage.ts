import { gql } from "@apollo/client";

export const UPDATE_IMAGE = gql`
    mutation UpdateImage(
        $id: String!
        $image: Upload!
    ){
        updateImage(
            image: $image
        ){
            avatar
        }
    }
`