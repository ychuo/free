import sys
import json
import os
from datetime import datetime

os.environ['TQDM_DISABLE'] = '1'
import akshare as ak

def main():
    try:
        df = ak.stock_board_industry_summary_ths()
        now = datetime.now().isoformat()
        result = []
        for _, row in df.iterrows():
            change_pct = float(row.get("涨跌幅", 0) or 0)
            inflow = float(row.get("净流入", 0) or 0)
            up_count = int(row.get("上涨家数", 0) or 0)
            down_count = int(row.get("下跌家数", 0) or 0)
            leading = str(row.get("领涨股", "") or "")
            leading_chg = float(row.get("领涨股-涨跌幅", 0) or 0)

            result.append({
                "sector": str(row.get("板块", "")),
                "changePercent": change_pct,
                "netInflow": inflow,
                "upCount": up_count,
                "downCount": down_count,
                "leadingStock": leading,
                "leadingStockChange": leading_chg,
                "updatedAt": now,
            })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
