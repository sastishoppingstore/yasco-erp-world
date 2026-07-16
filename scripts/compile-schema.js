import fs from "fs";
import path from "path";

const migrationsDir = path.join(process.cwd(), "db", "migrations");
const outputFilePath = path.join(process.cwd(), "schema.sql");

function compileSchema() {
  try {
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found at: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Found ${sqlFiles.length} SQL migration files to consolidate...`);

    let combinedSql = `-- =====================================================\n`;
    combinedSql += `-- Rawafed Universal SaaS - Unified Database Schema\n`;
    combinedSql += `-- Generated on: ${new Date().toISOString()}\n`;
    combinedSql += `-- =====================================================\n\n`;
    combinedSql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const file of sqlFiles) {
      console.log(`Processing: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      
      combinedSql += `-- -----------------------------------------------------\n`;
      combinedSql += `-- Migration: ${file}\n`;
      combinedSql += `-- -----------------------------------------------------\n`;
      combinedSql += fileContent.trim() + "\n\n";
    }

    combinedSql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    fs.writeFileSync(outputFilePath, combinedSql, "utf-8");
    console.log(`\nSuccess! Consolidated SQL schema written to: ${outputFilePath}`);
  } catch (error) {
    console.error("Error compiling SQL schema:", error);
    process.exit(1);
  }
}

compileSchema();
