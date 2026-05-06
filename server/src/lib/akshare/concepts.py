import sys
import json
import akshare as ak

def fund_flow_direction(change: float) -> str:
    if change > 0:
        return "inflow"
    if change < 0:
        return "outflow"
    return "neutral"

def main():
    try:
        df = ak.stock_board_concept_name_em()
        result = []
        for _, row in df.iterrows():
            change = float(row.get("涨跌幅", 0) or 0)
            result.append({
                "name": row.get("板块名称", ""),
                "changePercent": change,
                "leadingStock": row.get("领涨股票", ""),
                "leadingStockChange": float(row.get("领涨股票-涨跌幅", 0) or 0),
                "turnover": float(row.get("换手率", 0) or 0),
                "fundFlowDirection": fund_flow_direction(change),
            })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
