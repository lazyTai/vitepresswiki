const fs = require('fs');
const path = require('path');

function generateIndexFile(folderPath) {
  const docsFolderPath = path.join(folderPath, 'docs');
  const indexPath = path.join(docsFolderPath, 'index.md');


  // 读取 docs 文件夹下的所有文件
  fs.readdir(docsFolderPath, (err, files) => {
    if (err) {
      console.error('无法读取文件夹:', err);
      return;
    }

    // 过滤出所有的 .md 文件
    const mdFiles = files.filter(file => path.extname(file) === '.md');

    // 根据日期和文件名称生成文件链接
    const fileLinks = mdFiles.map(file => {
      const filePath = path.join('docs', file);
      console.log('filePath',filePath)
      if(filePath=='docs\index.md'){
          return '## 首页'
      }
      const stats = fs.statSync(path.join(docsFolderPath, file));
      const date = stats.mtime.toISOString().split('T')[0];
      return `[${date}-${file}](./${file})<br/>`;
    });

    // 将文件链接写入 index.md 文件
    const content = fileLinks.join('\n');
    fs.writeFile(indexPath, content, err => {
      if (err) {
        console.error('无法写入 index.md 文件:', err);
        return;
      }
      console.log('index.md 文件已更新');
    });
  });
}

// 使用示例
generateIndexFile('./');