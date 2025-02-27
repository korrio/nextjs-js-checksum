// scripts/generate-nextjs-integrity.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const glob = require('glob'); // You'll need to install this: npm install glob

// Function to generate SHA-512 integrity hash
function generateIntegrityHash(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const hash = crypto
            .createHash('sha512')
            .update(fileContent)
            .digest('base64');
        return `sha512-${hash}`;
    } catch (error) {
        console.error(`Error generating integrity hash for ${filePath}:`, error);
        return null;
    }
}

// Main function to process Next.js build output
async function processNextJsBuild() {
    // Path to Next.js build output
    const nextDir = path.join(process.cwd(), '.next');

    // Check if the .next directory exists
    if (!fs.existsSync(nextDir)) {
        console.error('Next.js build directory (.next) not found. Run next build first.');
        process.exit(1);
    }

    // Find all JS files in the build directory
    const jsFiles = glob.sync('**/*.js', {
        cwd: nextDir,
        ignore: ['**/node_modules/**']
    });

    // Generate integrity map
    const integrityMap = {};

    for (const file of jsFiles) {
        const filePath = path.join(nextDir, file);
        // Generate public path that would be used in the browser
        let publicPath = `/_next/${file.replace(/^\/?static\//, '')}`;

        // Generate integrity hash
        const integrity = generateIntegrityHash(filePath);
        if (integrity) {
            integrityMap[publicPath] = integrity;
        }
    }

    // Write integrity map to a JSON file
    const outputPath = path.join(process.cwd(), 'public/nextjs-integrity.json');
    fs.writeFileSync(outputPath, JSON.stringify(integrityMap, null, 2), 'utf8');

    console.log(`Generated integrity hashes for ${Object.keys(integrityMap).length} Next.js files.`);
    console.log(`Integrity map saved to ${outputPath}`);
}

// Run the script
processNextJsBuild().catch(err => {
    console.error('Error processing Next.js build:', err);
    process.exit(1);
});