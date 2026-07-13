"use client";

import { SoundProvider } from "@web-kits/audio/react";
import { HomeAudioPlayer } from "@/components/audio/HomeAudioPlayer";
import { SoundCloudPlayerProvider } from "@/components/audio/SoundCloudPlayerContext";
import { SoundCloudPopup } from "@/components/audio/SoundCloudPopup";
import { Header } from "@/components/Header";
import { InitialLoaderProvider } from "@/components/initial-loader/InitialLoaderProvider";
import { PageCurtainsProvider } from "@/components/navigation/PageCurtainsProvider";

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <SoundProvider volume={0.85}>
            <InitialLoaderProvider>
            <PageCurtainsProvider>
                <SoundCloudPlayerProvider>
                    <Header />
                    <SoundCloudPopup />
                    <HomeAudioPlayer />
                    {children}
                </SoundCloudPlayerProvider>
            </PageCurtainsProvider>
            </InitialLoaderProvider>
        </SoundProvider>
    );
}
