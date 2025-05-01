import { getMarkdownContent } from '@/lib/markdown';
import MarkdownRenderer from '@/components/markdown-renderer';
import ThemeToggle from '@/components/theme-toggle';

export default async function Home() {
  try {
    const content = await getMarkdownContent('home.md');

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
    console.error('Error loading home markdown', error);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Jambda-Calc</h1>
          <ThemeToggle />
        </div>
        <div className="prose dark:prose-invert">
          <p>
            Welcome to Jambda-Calc documentation. Please add a home.md file to the content
            directory.
          </p>
        </div>
      </div>
    );
  }
}
