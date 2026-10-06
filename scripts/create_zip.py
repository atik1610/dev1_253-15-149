import os
import zipfile

def create_project_zip():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    zip_path = os.path.join(public_dir, 'tender-builder.zip')

    ignore_dirs = {'.git', 'node_modules', 'dist', '.idea', '.vscode', '__pycache__'}
    ignore_files = {'.DS_Store', 'tender-builder.zip'}

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
            for file in files:
                if file in ignore_files or file.endswith('.pyc') or file.endswith('.log'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, base_dir)
                if rel_path.startswith('public/tender-builder.zip'):
                    continue
                zipf.write(file_path, arcname=rel_path)
                print(f"Added: {rel_path}")

    print(f"\nZIP file successfully created at: {zip_path}")
    print(f"Size: {os.path.getsize(zip_path)} bytes")

if __name__ == '__main__':
    create_project_zip()
