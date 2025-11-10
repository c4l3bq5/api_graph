import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import connectDB from './config/database.js';
import typeDefs from './schema/typeDefs.js';
import resolvers from './schema/resolvers.js';

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

async function startServer(){
    await connectDB();

    const { url} = await startStandaloneServer(server, {
        listen: { port: process.env.PORT || 4000 },
    });

    console.log(`servidor listo en : ${url}`);

}

startServer().catch(console.error);