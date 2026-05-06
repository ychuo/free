import sys
import json
import os

os.environ['TQDM_DISABLE'] = '1'
import akshare as ak

def main():
    try:
        # North-bound data from EastMoney (works via THS fallback path)
        north_raw = ak.stock_hsgt_fund_flow_summary_em()
        north_data = north_raw[north_raw["资金方向"] == "北向"]
        daily_north = float(north_data["成交净买额"].sum())
        weekly_north = daily_north  # single day in this endpoint

        # Market-level fund flow from 同花顺
        market_flow = ak.stock_market_fund_flow()
        latest = market_flow.iloc[-1]  # most recent row
        main_net = float(latest.get("主力净流入-净额", 0) or 0)
        main_pct = float(latest.get("主力净流入-净占比", 0) or 0)
        super_large = float(latest.get("超大单净流入-净额", 0) or 0)
        large = float(latest.get("大单净流入-净额", 0) or 0)
        medium = float(latest.get("中单净流入-净额", 0) or 0)
        small = float(latest.get("小单净流入-净额", 0) or 0)
        sh_close = float(latest.get("上证-收盘价", 0) or 0)
        sh_change = float(latest.get("上证-涨跌幅", 0) or 0)
        sz_close = float(latest.get("深证-收盘价", 0) or 0)
        sz_change = float(latest.get("深证-涨跌幅", 0) or 0)

        result = {
            "northBound": {
                "daily": round(daily_north, 2),
                "weekly": round(weekly_north, 2),
            },
            "marketFlow": {
                "mainNetInflow": round(main_net / 1e8, 2),
                "mainNetPct": round(main_pct, 2),
                "superLarge": round(super_large / 1e8, 2),
                "large": round(large / 1e8, 2),
                "medium": round(medium / 1e8, 2),
                "small": round(small / 1e8, 2),
                "shIndex": round(sh_close, 2),
                "shChange": round(sh_change, 2),
                "szIndex": round(sz_close, 2),
                "szChange": round(sz_change, 2),
            },
            "sectorFlow": [],  # requires EastMoney push2, unavailable
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
