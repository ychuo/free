import sys
import json
import akshare as ak

def main():
    try:
        df = ak.stock_board_concept_name_em()
        result = []
        for _, row in df.iterrows():
            result.append({
                "name": row.get("板块名称", ""),
                "changePercent": float(row.get("涨跌幅", 0) or 0),
                "leadingStock": row.get("领涨股票", ""),
                "leadingStockChange": float(row.get("领涨股票-涨跌幅", 0) or 0),
                "turnover": float(row.get("换手率", 0) or 0),
            })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
