"use client";

import { useLayoutEffect } from "react";

import { getHtmlLang, translateInterfaceText, type AppLocale } from "@/lib/i18n";

const ATTRIBUTE_NAMES = ["aria-label", "placeholder", "title"] as const;

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;

  if (!parent) {
    return true;
  }

  if (parent.closest("[data-localization='skip']")) {
    return true;
  }

  return ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "PRE", "CODE"].includes(parent.tagName);
}

function translateElementAttributes(element: Element, locale: AppLocale) {
  for (const attributeName of ATTRIBUTE_NAMES) {
    const currentValue = element.getAttribute(attributeName);

    if (!currentValue) {
      continue;
    }

    const translatedValue = translateInterfaceText(currentValue, locale);

    if (translatedValue !== currentValue) {
      element.setAttribute(attributeName, translatedValue);
    }
  }

  if (element instanceof HTMLInputElement && ["button", "submit", "reset"].includes(element.type)) {
    const translatedValue = translateInterfaceText(element.value, locale);

    if (translatedValue !== element.value) {
      element.value = translatedValue;
    }
  }
}

function translateNode(node: Node, locale: AppLocale) {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNode = node as Text;

    if (shouldSkipTextNode(textNode) || !textNode.nodeValue) {
      return;
    }

    const translatedValue = translateInterfaceText(textNode.nodeValue, locale);

    if (translatedValue !== textNode.nodeValue) {
      textNode.nodeValue = translatedValue;
    }

    return;
  }

  if (!(node instanceof Element)) {
    return;
  }

  translateElementAttributes(node, locale);

  const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let currentNode: Node | null = walker.currentNode;

  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textNode = currentNode as Text;

      if (!shouldSkipTextNode(textNode) && textNode.nodeValue) {
        const translatedValue = translateInterfaceText(textNode.nodeValue, locale);

        if (translatedValue !== textNode.nodeValue) {
          textNode.nodeValue = translatedValue;
        }
      }
    } else if (currentNode instanceof Element) {
      translateElementAttributes(currentNode, locale);
    }

    currentNode = walker.nextNode();
  }
}

export function LocaleRuntime({ locale }: { locale: AppLocale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
    document.documentElement.dataset.locale = locale;

    translateNode(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateNode(mutation.target, locale);
          continue;
        }

        for (const addedNode of mutation.addedNodes) {
          translateNode(addedNode, locale);
        }
      }
    });

    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
