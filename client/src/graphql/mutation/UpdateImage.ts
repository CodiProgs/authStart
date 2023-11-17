import { gql } from "@apollo/client";

export const UPDATE_IMAGE = gql`
    mutation UpdateImage(
        $id: Float!
        $image: Upload!
    ){
        updateImage(
            id: $id
            image: $image
        )
    }
`