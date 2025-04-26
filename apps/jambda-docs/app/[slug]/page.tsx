import { getMarkdownContent, getAllMarkdownFiles } from '@/lib/markdown';
import MarkdownRenderer from '@/components/markdown-renderer';
import ThemeToggle from '@/components/theme-toggle';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const files = await getAllMarkdownFiles();
  return files.map((file) => ({
    slug: file.replace('.md', ''),
  }));
}

export default async function MarkdownPage({ params }: { params: { slug: string } }) {
  try {
    const content = await getMarkdownContent(`${params.slug}.md`);

    const titleLine = content.split('\n')[0];
    const title = titleLine.replace(/^#\s+/, '');

    const contentWithoutTitle = content.replace(titleLine, '').trim();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">{title}</h1>
          <ThemeToggle />
        </div>
        <MarkdownRenderer content={contentWithoutTitle} />
      </div>
    );
  } catch (error) {
    console.error(`Error loading markdown for slug: ${params.slug}`, error);
    notFound();
  }
}
