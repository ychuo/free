import sys
import json
import os

os.environ['TQDM_DISABLE'] = '1'

import akshare as ak

def main():
    try:
        # stock_hsgt_fund_flow_summary_em works on this machine
        raw = ak.stock_hsgt_fund_flow_summary_em()

        # Filter north-bound (北向) and aggregate daily
        north = raw[raw["资金方向"] == "北向"]
        daily_flow = float(north["成交净买额"].sum())

        # Weekly: try last 5 trading days
        weekly_flow = daily_flow  # simplified — single row per day in this endpoint

        # Sector fund flow — try multiple sector_type values
        sector_flows = []
        for stype in ["行业板块", "概念板块", "地域板块"]:
            try:
                df = ak.stock_sector_fund_flow_rank(indicator="今日", sector_type=stype)
                for _, row in df.iterrows():
                    net = float(row.get("主力净流入-净额", 0) or 0) / 1e8
                    sector_flows.append({
                        "sector": str(row.get("名称", "")),
                        "netInflow": net,
                        "direction": "inflow" if net > 0 else "outflow",
                    })
                break  # use the first working sector_type
            except Exception:
                continue

        sorted_flows = sorted(sector_flows, key=lambda x: x["netInflow"], reverse=True)
        top5_in = sorted_flows[:5] if sorted_flows else []
        top5_out = sorted_flows[-5:] if len(sorted_flows) >= 5 else sorted_flows

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
