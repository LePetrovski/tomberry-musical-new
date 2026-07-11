"use client";

import { HomeAudioPlayer } from "@/components/audio/HomeAudioPlayer";
import { SoundCloudPlayerProvider } from "@/components/audio/SoundCloudPlayerContext";
import { SoundCloudPopup } from "@/components/audio/SoundCloudPopup";

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <SoundCloudPlayerProvider>
            <SoundCloudPopup />
            <HomeAudioPlayer />
            {children}
        </SoundCloudPlayerProvider>
    );
}
