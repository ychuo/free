import sys
import json
from datetime import datetime
import akshare as ak

def main():
    try:
        df = ak.stock_board_industry_pe_em()
        now = datetime.now().isoformat()
        result = []
        for _, row in df.iterrows():
            result.append({
                "sector": row.get("板块名称", ""),
                "currentPE": float(row.get("市盈率", 0) or 0),
                "pePercentile": float(row.get("市盈率分位", 0) or 0),
                "currentPB": float(row.get("市净率", 0) or 0),
                "pbPercentile": float(row.get("市净率分位", 0) or 0),
                "sampleCount": int(row.get("公司数量", 0) or 0),
                "updatedAt": now,
            })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
