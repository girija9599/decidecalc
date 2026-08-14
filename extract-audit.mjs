import { PDFParse } from 'pdf-parse';
import * as fs from 'fs';

async function extract() {
  const data = fs.readFileSync('C:/Users/LENOVO/Downloads/decidecalc-seo-audit-final.pdf');
  const parser = new PDFParse({ data: data.buffer });
  const result = await parser.getText();
  fs.writeFileSync('C:/Users/LENOVO/Desktop/DecideCal/audit-final-text.txt', result.text, 'utf-8');
  console.log('PDF extracted successfully. Characters:', result.text.length);
}

extract().catch(console.error);
