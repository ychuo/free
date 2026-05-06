import sys
import json
import os

os.environ['TQDM_DISABLE'] = '1'
import akshare as ak

def main():
    try:
        df = ak.stock_board_concept_summary_ths()
        result = []
        for _, row in df.iterrows():
            result.append({
                "name": str(row.get("概念名称", "")),
                "driverEvent": str(row.get("驱动事件", "")),
                "leadingStock": str(row.get("龙头股", "") or ""),
                "stockCount": int(row.get("成分股数量", 0) or 0),
            })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
