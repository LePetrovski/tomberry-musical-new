"use client";

import Link, { type LinkProps } from "next/link";
import { useCallback, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { usePageCurtains } from "./PageCurtainsProvider";

type CurtainLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps>;

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function isExternalHref(href: LinkProps["href"]) {
  if (typeof href !== "string") {
    return false;
  }

  return /^(https?:|mailto:|tel:)/.test(href);
}

function hrefToString(href: LinkProps["href"]) {
  if (typeof href === "string") {
    return href;
  }

  const pathname = href.pathname ?? "";
  const search = href.search ?? "";
  const hash = href.hash ?? "";
  return `${pathname}${search}${hash}`;
}

export function CurtainLink({
  href,
  onClick,
  prefetch = true,
  replace,
  scroll,
  ...rest
}: CurtainLinkProps) {
  const { navigate, isPending } = usePageCurtains();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isModifiedClick(event) || isExternalHref(href)) {
        return;
      }

      event.preventDefault();
      void navigate(hrefToString(href), { replace, scroll });
    },
    [href, navigate, onClick, replace, scroll],
  );

  return (
    <Link
      href={href}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
      aria-busy={isPending || undefined}
      {...rest}
    />
  );
}
