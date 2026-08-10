const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(srcDir);

const replacements = [
  { regex: /@\/components\/ui/g, replacement: '@/shared/components/ui' },
  { regex: /@\/components\/layout/g, replacement: '@/shared/components/layout' },
  { regex: /@\/components\/admin/g, replacement: '@/features/admin/components' },
  { regex: /@\/components\/dashboard/g, replacement: '@/features/client/components' },
  { regex: /@\/components\/marketing/g, replacement: '@/features/marketing/components' },
  { regex: /@\/layouts/g, replacement: '@/shared/components/layout' },
  { regex: /@\/lib/g, replacement: '@/shared/lib' },
  { regex: /@\/data\/mockData/g, replacement: '@/shared/data/mockData' },
  { regex: /@\/data\/admin-/g, replacement: '@/features/admin/data/admin-' },
  { regex: /@\/data\/client-/g, replacement: '@/features/client/data/client-' },
  { regex: /@\/data\/marketing/g, replacement: '@/features/marketing/data/marketing' },
  { regex: /@\/pages\/admin-([a-z-]+)-page/g, replacement: '@/features/admin/pages/admin--page' },
  { regex: /@\/pages\/client-([a-z-]+)-page/g, replacement: '@/features/client/pages/client--page' },
  { regex: /@\/pages\/booking-page/g, replacement: '@/features/booking/pages/booking-page' },
  { regex: /@\/pages\/auth-page/g, replacement: '@/features/auth/pages/auth-page' },
  { regex: /@\/pages\/otp-page/g, replacement: '@/features/auth/pages/otp-page' },
  { regex: /@\/pages\/home-page/g, replacement: '@/features/marketing/pages/home-page' },
  { regex: /@\/pages\/loyalty-page/g, replacement: '@/features/marketing/pages/loyalty-page' },
  { regex: /@\/pages\/test-routes-page/g, replacement: '@/features/test/pages/test-routes-page' },
  { regex: /@\/assets/g, replacement: '@/shared/assets' },
  { regex: /\.\.\/\.\.\/lib\/utils/g, replacement: '@/shared/lib/utils' },
  { regex: /\.\.\/lib\/utils/g, replacement: '@/shared/lib/utils' },
  { regex: /\.\.\/ui/g, replacement: '@/shared/components/ui' },
  { regex: /\.\.\/data\/mockData/g, replacement: '@/shared/data/mockData' },
  { regex: /\.\.\/\.\.\/\.\.\/lib\/utils/g, replacement: '@/shared/lib/utils' }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  replacements.forEach(rep => {
    newContent = newContent.replace(rep.regex, rep.replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
  }
});
