const fs = require('fs');

const schemaPath = 'd:\\MY PROJECT\\antigravity-erp\\backend\\prisma\\schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

const models = schema.split(/^model /m);
for (let i = 1; i < models.length; i++) {
  let modelStr = models[i];
  
  // Find all relation fields: @relation(fields: [someId]
  const relationRegex = /@relation\(fields:\s*\[([a-zA-Z0-9_]+)\]/g;
  let match;
  const fieldsToIndex = new Set();
  
  while ((match = relationRegex.exec(modelStr)) !== null) {
    fieldsToIndex.add(match[1]);
  }
  
  // Add indexes before the closing brace
  let addedIndexes = '';
  fieldsToIndex.forEach(field => {
    // Check if index already exists
    const indexRegex = new RegExp(`@@index\\(\\[${field}\\]\\)`);
    // Also check for @@unique([field, ...]) or @@unique([..., field]) or @unique on the field itself
    // Let's just avoid adding @@index if @@index([field]) is already there
    if (!indexRegex.test(modelStr)) {
      // Also check if field has @unique
      const fieldUniqueRegex = new RegExp(`${field}\\s+String\\s+@unique`);
      if (!fieldUniqueRegex.test(modelStr)) {
        addedIndexes += `  @@index([${field}])\n`;
      }
    }
  });
  
  if (addedIndexes) {
    // Replace the last closing brace with the indexes and then the closing brace
    modelStr = modelStr.replace(/\}\s*$/, `\n${addedIndexes}}\n`);
    models[i] = modelStr;
  }
}

const newSchema = models.join('model ');
fs.writeFileSync(schemaPath, newSchema);
console.log('Added missing indexes to schema.prisma');
