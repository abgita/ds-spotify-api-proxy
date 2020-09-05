"use strict";

const fetch = require( "node-fetch" );

const ENCODING = "base64";
const EXPIRE_TIME_IN_MS = 3600 * 1000; // See https://developer.spotify.com/documentation/general/guides/authorization-guide/

class SpotifyAuthToken {
    #opts;
    #cachedResponse;
    #lastRequest = 0;

    constructor( clientId, clientSecret ) {
        const basicAuthEncoded = "Basic " + Buffer.from( `${clientId}:${clientSecret}` ).toString( ENCODING );

        this.#opts = {
            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": basicAuthEncoded
            },

            body: "grant_type=client_credentials"
        };

        this.requestNewToken().catch( err => console.error( err ) );
    }

    getToken() {
        if ( !this.#cachedResponse ) return this.requestNewToken();

        const time = Date.now() - this.#lastRequest;

        if ( time < EXPIRE_TIME_IN_MS ) {
            this.#cachedResponse.expires_in = Math.round( (EXPIRE_TIME_IN_MS - time) / 1000 );

            return Promise.resolve( this.#cachedResponse );
        }

        return this.requestNewToken();
    }

    requestNewToken() {
        return new Promise( ( resolve, reject ) => {
            fetch( "https://accounts.spotify.com/api/token/", this.#opts ).then( ( response ) => {
                if ( !response.ok ) {
                    this.#lastRequest = 0;

                    throw new Error( `Cannot request access token: ${response.error}` );
                }

                this.#lastRequest = Date.now();

                return response.json();
            } ).then( ( json ) => {
                this.#cachedResponse = json;

                resolve( this.#cachedResponse );
            } ).catch( err => {
                reject( err );
            } );
        } );
    }
}

module.exports = SpotifyAuthToken