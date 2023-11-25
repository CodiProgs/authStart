import { CodegenConfig } from "@graphql-codegen/cli";


const config: CodegenConfig = {
    schema: 'http://localhost:5000/graphql',
    documents: ['src/graphql/**/*.ts'],
    generates: {
        './src/gql/graphql.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ]
        }
    }
}

export default config