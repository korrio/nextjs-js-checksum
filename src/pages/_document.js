// import { Html, Head, Main, NextScript } from "next/document";

// export default function Document() {
//   return (
//     <Html lang="en">
//       <Head />
//       <body className="antialiased">
//         <Main />
//         <NextScript />
//       </body>
//     </Html>
//   );
// }

// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';
import fs from 'fs';
import path from 'path';

// Create a custom NextScript component that adds integrity attributes
class CustomNextScript extends NextScript {
    getScripts() {
        const scripts = super.getScripts();

        // Try to load the integrity map
        let integrityMap = {};
        try {
            const integrityPath = path.join(process.cwd(), 'public/nextjs-integrity.json');
            const integrityData = fs.readFileSync(integrityPath, 'utf8');
            integrityMap = JSON.parse(integrityData);
        } catch (error) {
            console.warn('Could not load integrity map:', error.message);
        }

        // Add integrity attributes to scripts if available
        return scripts.map(script => {
            // Skip if not a script tag or no src
            if (script.type !== 'script' || !script.props.src) {
                return script;
            }

            const src = script.props.src;
            // Find integrity hash for this script
            const integrity = integrityMap[src];

            if (integrity) {
                // Return a new script element with integrity attribute
                return {
                    ...script,
                    props: {
                        ...script.props,
                        integrity,
                        crossOrigin: 'anonymous'
                    }
                };
            }

            // Return original script if no integrity available
            return script;
        });
    }
}

class MyDocument extends Document {
    render() {
        return (
            <Html>
        <Head />
        <body>
          <Main />
          <CustomNextScript />
        </body>
      </Html>
        );
    }
}

export default MyDocument;