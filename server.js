const SpotifyAuthToken = require( './spotify-auth-token' );
const express = require( 'express' );

const origin = process.env.ORIGIN;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const url = process.env.URL;
const port = process.env.PORT;

const sat = new SpotifyAuthToken( clientId, clientSecret );

const app = express();

app.use( express.json() );

app.post( "/getSpotifyToken", async ( _, res ) => {
    res.header( "Access-Control-Allow-Origin", origin );

    try {
        const token = await sat.getToken();

        res.json( { token: token.access_token } );
    } catch ( err ) {
        console.error( err );

        res.json( { error: "Cannot get token!" } );
    }
} );

app.listen( port, () => {
    console.log( "ds-spotify-api-proxy server running on %s:%s", url, port );
} );