import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileContracts() {
  try {
    console.log('Compiling contracts using Hardhat...');
    
    // Run hardhat compile
    execSync('npx hardhat compile', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('Contracts compiled successfully!');
    console.log('Artifacts are available in the artifacts/ directory');
  } catch (error) {
    console.error('Error compiling contracts:', error);
    process.exit(1);
  }
}

compileContracts(); 