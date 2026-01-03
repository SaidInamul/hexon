const AdmZip = require("adm-zip");

const parseLocationFile = (buffer) => {
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // 1. Filter: Find only valid .txt files (ignoring macOS junk)
    const textFiles = zipEntries.filter((entry) => {
      const name = entry.entryName;

      // Ignore directories
      if (entry.isDirectory) return false;

      // Ignore macOS hidden folders/files
      if (name.startsWith("__MACOSX/") || name.includes("/.DS_Store"))
        return false;

      // Must end with .txt
      return name.toLowerCase().endsWith(".txt");
    });

    // 2. Validation: Check the count of ACTUAL text files
    if (textFiles.length === 0) {
      throw new Error("ZIP must contain a .txt file");
    }

    if (textFiles.length > 1) {
      throw new Error(
        `ZIP must contain exactly one .txt file (found ${textFiles.length}: ${textFiles.map((e) => e.name).join(", ")})`,
      );
    }

    // 3. Process the single valid file
    const textEntry = textFiles[0];
    const fileContent = textEntry.getData().toString("utf8");

    // Parse the CSV content
    const lines = fileContent.split(/\r?\n/);
    const locations = [];

    // Start from index 1 to skip header row (assuming header exists)
    // If no header, change to let i = 0
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const parts = line.split(",");
      if (parts.length >= 3) {
        const name = parts[0].trim();
        const lat = parseFloat(parts[1].trim());
        const lng = parseFloat(parts[2].trim());

        if (name && !isNaN(lat) && !isNaN(lng)) {
          locations.push({
            name: name,
            latitude: lat,
            longitude: lng,
          });
        }
      }
    }

    return locations;
  } catch (error) {
    // Pass clean error messages back to the controller
    if (error.message.includes("ZIP")) {
      throw error;
    }
    throw new Error("Failed to parse ZIP file: " + error.message);
  }
};

module.exports = { parseLocationFile };
