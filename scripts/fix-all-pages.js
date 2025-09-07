import fs from 'fs';
import path from 'path';

// List of all pages that need to be fixed
const pages = [
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/purchases/orders/page.tsx',
    type: 'purchase-orders',
    title: 'Purchase Orders',
    newButtonText: 'New PO',
    newRoute: '/purchases/orders/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/purchases/bills/page.tsx',
    type: 'bills',
    title: 'Bills',
    newButtonText: 'New Bill',
    newRoute: '/purchases/bills/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/inventory/items/page.tsx',
    type: 'items',
    title: 'Items',
    newButtonText: 'New Item',
    newRoute: '/inventory/items/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/banking/accounts/page.tsx',
    type: 'bank-accounts',
    title: 'Bank Accounts',
    newButtonText: 'New Account',
    newRoute: '/banking/accounts/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/gl/chart-of-accounts/page.tsx',
    type: 'chart-of-accounts',
    title: 'Chart of Accounts',
    newButtonText: 'New Account',
    newRoute: '/gl/chart-of-accounts/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/gl/journal-entries/page.tsx',
    type: 'journal-entries',
    title: 'Journal Entries',
    newButtonText: 'New Entry',
    newRoute: '/gl/journal-entries/new'
  },
  {
    path: '/Users/sanjaysharma1/FACEBOOKS/BOOKS-UI/src/app/(app)/reports/financial/page.tsx',
    type: 'reports',
    title: 'Financial Reports',
    newButtonText: 'Generate Report',
    newRoute: '/reports/financial/generate'
  }
];

// Function to add button handlers to a page
function addButtonHandlers(content, pageType, newRoute) {
  // Add useRouter import if not present
  if (!content.includes('useRouter')) {
    content = content.replace(
      'import { useState, useEffect } from "react";',
      'import { useState, useEffect } from "react";\nimport { useRouter } from "next/navigation";'
    );
  }

  // Add router declaration if not present
  if (!content.includes('const router = useRouter();')) {
    content = content.replace(
      'export default function',
      'const router = useRouter();\n\nexport default function'
    );
  }

  // Add button handlers
  const handlers = `
  const handleNew = () => {
    router.push("${newRoute}");
  };

  const handleImport = () => {
    toast("Import functionality coming soon");
  };

  const handleExport = () => {
    toast("Export functionality coming soon");
  };

  const handleFilter = () => {
    toast("Filter functionality coming soon");
  };

  const handleView = (id) => {
    router.push(\`${newRoute.replace('/new', '')}/\${id}\`);
  };

  const handleEdit = (id) => {
    router.push(\`${newRoute.replace('/new', '')}/\${id}/edit\`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      toast(\`Delete item \${id} - coming soon\`);
    }
  };
`;

  // Insert handlers before the columns definition
  content = content.replace(
    /const columns = \[/,
    handlers + '\n  const columns = ['
  );

  // Update action buttons
  content = content.replace(
    /<Button[^>]*onClick[^>]*>[\s\S]*?<\/Button>/g,
    (match) => {
      if (match.includes('New') || match.includes('Import') || match.includes('Export') || match.includes('Filter')) {
        if (match.includes('New')) {
          return match.replace('>', ' onClick={handleNew}>');
        } else if (match.includes('Import')) {
          return match.replace('>', ' onClick={handleImport}>');
        } else if (match.includes('Export')) {
          return match.replace('>', ' onClick={handleExport}>');
        } else if (match.includes('Filter')) {
          return match.replace('>', ' onClick={handleFilter}>');
        }
      }
      return match;
    }
  );

  // Update dropdown menu items
  content = content.replace(
    /<DropdownMenuItem[^>]*>[\s\S]*?View[\s\S]*?<\/DropdownMenuItem>/g,
    '<DropdownMenuItem onClick={() => handleView(row.original.id)}>\n              <Eye className="h-4 w-4 mr-2" />\n              View\n            </DropdownMenuItem>'
  );

  content = content.replace(
    /<DropdownMenuItem[^>]*>[\s\S]*?Edit[\s\S]*?<\/DropdownMenuItem>/g,
    '<DropdownMenuItem onClick={() => handleEdit(row.original.id)}>Edit</DropdownMenuItem>'
  );

  content = content.replace(
    /<DropdownMenuItem[^>]*>[\s\S]*?Delete[\s\S]*?<\/DropdownMenuItem>/g,
    '<DropdownMenuItem \n              className="text-red-600" \n              onClick={() => handleDelete(row.original.id)}\n            >\n              Delete\n            </DropdownMenuItem>'
  );

  return content;
}

// Process each page
pages.forEach(page => {
  try {
    if (fs.existsSync(page.path)) {
      let content = fs.readFileSync(page.path, 'utf8');
      content = addButtonHandlers(content, page.type, page.newRoute);
      fs.writeFileSync(page.path, content);
      console.log(`✅ Fixed ${page.title}`);
    } else {
      console.log(`❌ File not found: ${page.path}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${page.title}:`, error.message);
  }
});

console.log('🎉 All pages have been processed!');
