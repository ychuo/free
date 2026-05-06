import sys
import json
import os
from datetime import datetime

os.environ['TQDM_DISABLE'] = '1'

import akshare as ak

def main():
    try:
        # Use Sina index spot data (works without EastMoney push2)
        df = ak.stock_zh_index_spot_sina()
        now = datetime.now().isoformat()
        result = []
        for _, row in df.iterrows():
            name = str(row.get("名称", ""))
            # Filter to major indices for a manageable overview
            if any(k in name for k in ["上证", "深证", "沪深", "创业", "科创"]):
                result.append({
                    "sector": name,
                    "currentPE": float(row.get("最新价", 0) or 0),
                    "pePercentile": float(row.get("涨跌幅", 0) or 0),
                    "currentPB": float(row.get("昨收", 0) or 0),
                    "pbPercentile": float(row.get("今开", 0) or 0),
                    "sampleCount": int(row.get("成交量", 0) or 0),
                    "updatedAt": now,
                })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
