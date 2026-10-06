import JSZip from 'jszip';

export async function downloadProjectZip(onProgress?: (msg: string) => void) {
  try {
    if (onProgress) onProgress('Downloading tender-builder.zip package...');
    
    // First attempt to fetch the pre-packaged static ZIP from /tender-builder.zip
    const response = await fetch('/tender-builder.zip');
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tender-builder.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      if (onProgress) onProgress('Download initiated successfully!');
      return;
    }
  } catch (err) {
    console.warn('Direct fetch of static zip failed, fallback to client-side packaging', err);
  }

  // Fallback: package dynamically using JSZip
  if (onProgress) onProgress('Compiling project files into ZIP archive...');
  const zip = new JSZip();

  const savedTenders = localStorage.getItem('tb_tenders_data');

  zip.file('README.md', `# TenderBuilder - B2B Bid & Tender Proposal Management Suite
Run \`npm install\` and \`npm run dev\` to start.`);

  if (savedTenders) {
    zip.file('exported_tenders_backup.json', savedTenders);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tender-builder.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
