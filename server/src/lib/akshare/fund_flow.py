import sys
import json
import akshare as ak

def main():
    try:
        north = ak.stock_hsgt_north_net_flow_in_em(symbol="北上")
        daily_flow = float(north.iloc[-1].get("净流入", 0) or 0) if len(north) > 0 else 0
        weekly_flow = float(north.tail(5)["净流入"].sum() or 0) if len(north) >= 5 else 0

        sector = ak.stock_sector_fund_flow_rank(indicator="今日", sector_type="行业板块")
        flows = []
        for _, row in sector.iterrows():
            flows.append({
                "sector": row.get("名称", ""),
                "netInflow": float(row.get("主力净流入-净额", 0) or 0) / 1e8,
                "direction": "inflow" if float(row.get("主力净流入-净额", 0) or 0) > 0 else "outflow",
            })

        sorted_flows = sorted(flows, key=lambda x: x["netInflow"], reverse=True)
        top5_in = sorted_flows[:5]
        top5_out = sorted_flows[-5:]

        result = {
            "northBound": {
                "daily": daily_flow,
                "weekly": weekly_flow,
            },
            "sectorFlow": top5_in + top5_out,
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
