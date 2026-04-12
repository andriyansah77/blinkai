import fs from 'fs';
import path from 'path';

export default function HealthPage() {
  const htmlPath = path.join(process.cwd(), 'public', 'health', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
