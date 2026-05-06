import { spawn } from 'node:child_process';
import { join } from 'node:path';
import type { ConceptItem, FundFlowData, ValuationItem } from '@free/shared';

const SCRIPTS_DIR = join(import.meta.dirname, '..', 'akshare');

async function runPython(script: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const proc = spawn('python3.12', [script], {
          cwd: SCRIPTS_DIR,
          timeout: 30000,
        });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (chunk: Buffer) => {
          stdout += chunk.toString();
        });
        proc.stderr.on('data', (chunk: Buffer) => {
          stderr += chunk.toString();
        });
        proc.on('close', (code: number | null) => {
          if (code === 0) resolve(stdout.trim());
          else reject(new Error(stderr || `Python exit code ${code}`));
        });
        proc.on('error', reject);
      });
      // Validate JSON before returning
      JSON.parse(result);
      return result;
    } catch (e) {
      if (attempt === retries) throw e;
      // Wait before retry: 1s, then 3s
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('unreachable');
}

export class AStockMarketAdapter {
  readonly name = 'AStockMarket';
  readonly market = 'A_STOCK';

  async isAvailable(): Promise<boolean> {
    try {
      await runPython(join(SCRIPTS_DIR, 'valuation.py'));
      return true;
    } catch {
      return false;
    }
  }

  async fetchValuation(): Promise<ValuationItem[]> {
    const raw = await runPython(join(SCRIPTS_DIR, 'valuation.py'));
    return JSON.parse(raw);
  }

  async fetchConcepts(): Promise<ConceptItem[]> {
    const raw = await runPython(join(SCRIPTS_DIR, 'concepts.py'));
    return JSON.parse(raw);
  }

  async fetchFundFlow(): Promise<FundFlowData> {
    const raw = await runPython(join(SCRIPTS_DIR, 'fund_flow.py'));
    return JSON.parse(raw);
  }
}

export const aStockMarketAdapter = new AStockMarketAdapter();
