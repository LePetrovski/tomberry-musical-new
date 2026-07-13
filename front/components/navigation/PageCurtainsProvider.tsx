"use client";

import { useCurtains } from "motion-plus/react";
import { wipe, blinds, staggerWipe } from "motion-plus/curtains";
import { usePathname, useRouter } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    type ReactNode,
} from "react";

const PAGE_CURTAINS_OPTIONS = {
    effect: staggerWipe({ size: 300}),
    transition: { duration: 0.42 },
} as const;

type NavigateOptions = {
    replace?: boolean;
    scroll?: boolean;
};

type PageCurtainsContextValue = {
    navigate: (href: string, options?: NavigateOptions) => Promise<void>;
    isPending: boolean;
};

const PageCurtainsContext = createContext<PageCurtainsContextValue | null>(null);

function resolveTargetUrl(href: string) {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
}

export function PageCurtainsProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [curtains, isPending] = useCurtains();

    const navigate = useCallback(
        async (href: string, options?: NavigateOptions) => {
        if (typeof window === "undefined") {
            if (options?.replace) {
            router.replace(href, { scroll: options.scroll });
            } else {
            router.push(href, { scroll: options?.scroll });
            }
            return;
        }

        const targetUrl = resolveTargetUrl(href);
        const currentUrl = `${pathname}${window.location.search}${window.location.hash}`;

        if (targetUrl === currentUrl) {
            return;
        }

        await curtains(() => {
            if (options?.replace) {
            router.replace(href, { scroll: options.scroll });
            return;
            }
            router.push(href, { scroll: options?.scroll });
        }, PAGE_CURTAINS_OPTIONS);
        },
        [curtains, pathname, router],
    );

    const value = useMemo(
        () => ({
        navigate,
        isPending,
        }),
        [isPending, navigate],
    );

    return (
        <PageCurtainsContext.Provider value={value}>
        {children}
        </PageCurtainsContext.Provider>
    );
}

export function usePageCurtains() {
    const context = useContext(PageCurtainsContext);
    if (!context) {
        throw new Error("usePageCurtains must be used within PageCurtainsProvider");
    }
    return context;
}
