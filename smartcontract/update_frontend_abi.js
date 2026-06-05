const fs = require('fs');

const routerArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/AutoSplitRouter.sol/AutoSplitRouter.json', 'utf8'));
const adapterArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/VaultAdapter.sol/VaultAdapter.json', 'utf8'));

const routerABI = JSON.stringify(routerArtifact.abi, null, 2);
const adapterABI = JSON.stringify(adapterArtifact.abi, null, 2);

const contractsFileContent = `// AutoSplitRouter ABI\nexport const AutoSplitRouterABI = ${routerABI} as const;\n\n// VaultAdapter ABI\nexport const VaultAdapterABI = ${adapterABI} as const;\n`;

fs.writeFileSync('../frontend/lib/contracts.ts', contractsFileContent);
console.log('Successfully updated lib/contracts.ts with latest ABI');
