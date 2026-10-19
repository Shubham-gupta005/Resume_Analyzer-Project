const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`[PDF Service] Reading file from disk: ${filePath}`);
    // 1. Read the file from the disk into a buffer
    const dataBuffer = fs.readFileSync(filePath);
    console.log("[PDF Service] File loaded into buffer.");

    // 2. Instantiate Mehmet Kozan's PDFParse class with options
    console.log("[PDF Service] Instantiating PDFParse engine...");
    const parserInstance = new pdfParse.PDFParse({
      data: dataBuffer
    });

    // 3. Extract text
    console.log("[PDF Service] Calling getText()...");
    const result = await parserInstance.getText();
    
    let text = result.text || "";
    console.log("[PDF Service] Text extraction complete. Sanitizing output string...");

    // 4. Clean and normalize the text
    text = text.replace(/\n+/g, " "); // Replace multiple newlines with a single space
    text = text.replace(/\s+/g, " "); // Replace multiple spaces with a single space
    text = text.trim(); // Remove leading and trailing whitespace

    console.log(`[PDF Service] Finished! Cleaned string size: ${text.length} characters.`);
    return text;
  } catch (error) {
    console.error("[PDF Service] ERROR parsing PDF binary data:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = { extractTextFromPDF };
