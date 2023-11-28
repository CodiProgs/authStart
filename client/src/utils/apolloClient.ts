import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    gql,
    Observable,
    ApolloLink,
} from "@apollo/client"

import { createUploadLink } from "apollo-upload-client"
import { onError } from "@apollo/client/link/error"
import { URL_SERVER } from "./variables"

async function RefreshTokens(client: ApolloClient<NormalizedCacheObject>) {
    const { data } = await client.mutate({
        mutation: gql`
            mutation RefreshTokens {
                refreshTokens
            }
        `,
    })
    const newAccessToken = data?.refreshTokens
    return `Bearer ${newAccessToken}`
}

let retryCount = 0
const maxRetry = 3

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    if (graphQLErrors) {
        for (const err of graphQLErrors) {
            if (err.extensions.code === "UNAUTHENTICATED" && retryCount < maxRetry) {
                retryCount++

                return new Observable((observer) => {
                    RefreshTokens(client)
                        .then((token) => {
                            console.log("token", token)
                            operation.setContext((previousContext: any) => ({
                                headers: {
                                    ...previousContext.headers,
                                    authorization: token,
                                },
                            }))
                            const forward$ = forward(operation)
                            forward$.subscribe(observer)
                        })
                        .catch((error) => observer.error(error))
                })
            }else if (err.extensions?.invalidSession){
                
                return new Observable((observer) => {
                    window.dispatchEvent(new Event("Unauthorized"));
                    observer.error(err)
                })
            }
        }
    }
})

const uploadLink = createUploadLink({
    uri: `${URL_SERVER}/graphql`,
    credentials: "include",
    headers: {
        "apollo-require-preflight": "true",
    },
})

export const client = new ApolloClient({
    uri: `${URL_SERVER}/graphql`,
    cache: new InMemoryCache({}),
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
    },
    link: ApolloLink.from([errorLink, uploadLink]),
})