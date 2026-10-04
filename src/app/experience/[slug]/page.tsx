import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experiences, leadership } from "@/data/portfolio";
import DetailView from "@/components/detail-view";

const entries = [...experiences, ...leadership];
export function generateStaticParams() { return entries.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experience = entries.find(item => item.slug === slug);
  return { title: experience?.title ?? "Experience not found", description: experience?.summary };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = entries.find(item => item.slug === slug);
  if (!entry) notFound();
  return <DetailView entry={entry} kind="experience" />;
}
