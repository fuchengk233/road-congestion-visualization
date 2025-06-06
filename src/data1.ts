// 定义拥堵数据类型
export interface CongestionData {
  ts: string;
  [key: string]: string;  // 动态路段ID作为key，拥堵指数作为value
}

// 导出拥堵数据
export const congestionData: CongestionData[] = [
  {
    ts: "2019/9/1 00:00",
    "1000137": "1.186",
    "1001143": "1.244",
    "1001191": "1.157",
    "1001199": "1.218"
  },
  {
    ts: "2019/9/1 00:10",
    "1000137": "1.245",
    "1001143": "1.312",
    "1001191": "1.198",
    "1001199": "1.267"
  },
  {
    ts: "2019/9/1 00:20",
    "1000137": "1.324",
    "1001143": "1.389",
    "1001191": "1.256",
    "1001199": "1.345"
  },
  {
    ts: "2019/9/1 00:30",
    "1000137": "1.412",
    "1001143": "1.467",
    "1001191": "1.345",
    "1001199": "1.423"
  },
  {
    ts: "2019/9/1 00:40",
    "1000137": "1.523",
    "1001143": "1.578",
    "1001191": "1.456",
    "1001199": "1.534"
  },
  {
    ts: "2019/9/1 00:50",
    "1000137": "1.645",
    "1001143": "1.689",
    "1001191": "1.567",
    "1001199": "1.645"
  },
  {
    ts: "2019/9/1 01:00",
    "1000137": "1.756",
    "1001143": "1.789",
    "1001191": "1.678",
    "1001199": "1.756"
  },
  {
    ts: "2019/9/1 01:10",
    "1000137": "1.867",
    "1001143": "1.890",
    "1001191": "1.789",
    "1001199": "1.867"
  },
  {
    ts: "2019/9/1 01:20",
    "1000137": "1.978",
    "1001143": "1.991",
    "1001191": "1.890",
    "1001199": "1.978"
  },
  {
    ts: "2019/9/1 01:30",
    "1000137": "2.089",
    "1001143": "2.092",
    "1001191": "2.001",
    "1001199": "2.089"
  },
  {
    ts: "2019/9/1 01:40",
    "1000137": "2.190",
    "1001143": "2.193",
    "1001191": "2.112",
    "1001199": "2.190"
  },
  {
    ts: "2019/9/1 01:50",
    "1000137": "2.291",
    "1001143": "2.294",
    "1001191": "2.223",
    "1001199": "2.291"
  },
  {
    ts: "2019/9/1 02:00",
    "1000137": "2.392",
    "1001143": "2.395",
    "1001191": "2.334",
    "1001199": "2.392"
  }
]; 