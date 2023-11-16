import { SdkOptions, SpotifyApi } from "@spotify/web-api-ts-sdk";
export declare function useSpotify(clientId: string, redirectUrl: string, scopes: string[], config?: SdkOptions): SpotifyApi | null;
