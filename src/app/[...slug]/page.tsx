import { notFound } from "next/navigation";

import { AiVisibilityPageTemplate } from "@/components/ai-visibility-page";
import { buildPageMetadata, getAiVisibilityPage, aiVisibilityPages } from "@/content/ai-visibility";

type PageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return aiVisibilityPages.map((page) => ({
    slug: page.pathname.split("/").filter(Boolean),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const pathname = `/${resolvedParams.slug.join("/")}`;
  const page = getAiVisibilityPage(pathname);

  if (!page) {
    return {};
  }

  return buildPageMetadata(page);
}

export default async function AiVisibilityContentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const pathname = `/${resolvedParams.slug.join("/")}`;
  const page = getAiVisibilityPage(pathname);

  if (!page) {
    notFound();
  }

  return <AiVisibilityPageTemplate page={page} />;
}
