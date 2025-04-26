import fs from 'fs';
import path from 'path';

// Define the content directory path
const contentDirectory = path.join(process.cwd(), 'content');

// Create the content directory if it doesn't exist
try {
  if (!fs.existsSync(contentDirectory)) {
    fs.mkdirSync(contentDirectory, { recursive: true });
    console.log(`Created content directory at ${contentDirectory}`);
  }
} catch (error) {
  console.error('Error creating content directory:', error);
}

// Get markdown content from file
export async function getMarkdownContent(filename: string): Promise<string> {
  try {
    const filePath = path.join(contentDirectory, filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Markdown file not found: ${filePath}`);

      // Create a placeholder file with basic content
      const placeholderContent = `# ${filename.replace('.md', '')}\n\nThis is a placeholder for the ${filename} file. Please add content here.`;
      fs.writeFileSync(filePath, placeholderContent, 'utf8');
      console.log(`Created placeholder file: ${filePath}`);

      return placeholderContent;
    }

    // Read the file content
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error);
    throw new Error(`Markdown file ${filename} could not be read`);
  }
}

export async function getAllMarkdownFiles(): Promise<string[]> {
  try {
    // Check if the content directory exists
    if (!fs.existsSync(contentDirectory)) {
      console.warn(`Content directory not found: ${contentDirectory}`);
      return [];
    }

    // Read all files in the directory
    const files = await fs.promises.readdir(contentDirectory);
    return files.filter((file) => file.endsWith('.md'));
  } catch (error) {
    console.error('Error reading markdown directory:', error);
    return [];
  }
}
