"use client";

import { HomeAudioPlayer } from "@/components/audio/HomeAudioPlayer";
import { SoundCloudPlayerProvider } from "@/components/audio/SoundCloudPlayerContext";
import { SoundCloudPopup } from "@/components/audio/SoundCloudPopup";
import { Header } from "@/components/Header";

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <SoundCloudPlayerProvider>
            <Header />
            <SoundCloudPopup />
            <HomeAudioPlayer />
            {children}
        </SoundCloudPlayerProvider>
    );
}
