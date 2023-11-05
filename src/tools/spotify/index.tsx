import * as React from "react";
import {useSpotify} from "./tools";
import {Scopes} from "@spotify/web-api-ts-sdk";
import {useMemo} from "react";
import { PromiseContainer } from "@hilats/react-utils";


export const SpotifyPanel = () => {

    const sdk = useSpotify(
        '7ca9684301bc4f62ac837fa96c00c179',
        'https://localhost:8000/tools/spotify',
        Scopes.all
    );

    const recentTracks = useMemo( () => {
        return sdk?.player.getRecentlyPlayedTracks()
    }, [sdk])

    return <>
        <div style={{flex: 'none'}}>Spotify</div>
        {
            recentTracks ?
                <PromiseContainer promise={recentTracks}>
                    {(tracks) => <pre>{JSON.stringify(tracks, undefined, 4)}</pre>}
                </PromiseContainer> :
                <div>Spotify account not connected</div>
        }

    </>
}