// 定义拥堵数据类型
export interface CongestionData {
  ts: string;  // 时间戳
  [roadId: string]: string;  // 动态的路段ID和对应的拥堵指数
}

// 转换时间格式函数
function convertTimeFormat(timeStr: string): string {
  // 将 "2019/9/1 0:00" 转换为 "2019-09-01 00:00"
  const [date, time] = timeStr.split(' ');
  const [year, month, day] = date.split('/');
  const [hour, minute] = time.split(':');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

// 拥堵数据
export const congestionData: CongestionData[] = [
  {
    "ts": convertTimeFormat("2019/9/1 0:00"),
    "1000137": "1.186",
    "1001143": "1.244",
    "1001191": "1.157",
    "1001199": "1.218",
    "1001200": "1.079",
    "1001395": "1.387",
    "1001396": "1.013",
    "1001409": "1.019",
    "1001526": "1.231",
    "1001564": "1.353",
    "1001632": "1.162",
    "1001634": "1.128",
    "1001654": "3.257",
    "1002130": "1.273",
    "1002136": "1.249",
    "1002224": "1.204",
    "1002675": "1.816",
    "1003397": "1.05",
    "1003398": "1.087",
    "1006304": "1.057",
    "1007395": "1.193",
    "1007398": "1.129",
    "1008508": "1.295",
    "1008514": "1.272",
    "1008518": "1.256",
    "1008792": "1.14",
    "1008905": "1.15",
    "1009236": "1.329",
    "1010288": "1.231",
    "1010295": "1.351",
    "1010371": "1.04",
    "1013016": "1.707",
    "1013019": "1.355",
    "1013022": "1.287",
    "1013026": "1.026",
    "1014301": "1.227",
    "1014304": "1.398",
    "1014307": "1.213",
    "1015837": "1.037",
    "1015843": "1.265",
    "10288": "1.105",
    "10295": "1.224",
    "10371": "1.058",
    "1143": "1.342",
    "1191": "1.022",
    "1199": "1.14",
    "1200": "1.145",
    "13016": "1.352",
    "13019": "1.271",
    "13022": "1.061",
    "13026": "1.386",
    "137": "1.343",
    "1395": "1.022",
    "1396": "1.221",
    "1409": "1.125",
    "14301": "1.13",
    "14304": "1.136",
    "14307": "1.23",
    "1526": "1.222",
    "1564": "1.05",
    "15843": "1.151",
    "1632": "2.177",
    "1634": "1.243",
    "1654": "1.052",
    "16786": "1.019",
    "16788": "1.063",
    "16789": "1.876",
    "16790": "1.066",
    "16915": "1.043",
    "16916": "1.013",
    "20709": "1.011",
    "20711": "1.074",
    "20736": "1.139",
    "20751": "1.081",
    "20753": "1.199",
    "20787": "1.457",
    "2130": "1.347",
    "2134": "1.012",
    "2136": "1.151",
    "2224": "1.019",
    "25341": "1.39",
    "2675": "1.209",
    "27285": "1.035",
    "27286": "1.275",
    "32385": "1.202",
    "32402": "1.122",
    "32404": "1.232",
    "32409": "1.01",
    "32415": "1.394",
    "32416": "0.99",
    "3397": "1.141",
    "3398": "1.0",
    "6304": "1.064",
    "7395": "1.345",
    "7398": "1.143",
    "8508": "1.017",
    "8514": "1.029",
    "8518": "1.288",
    "8792": "1.239",
    "8905": "1.171",
    "9236": "2.026"
  },
  {
    "ts": convertTimeFormat("2019/9/1 0:10"),
    "1000137": "1.043",
    "1001143": "1.145",
    "1001191": "1.275",
    "1001199": "1.088",
    "1001200": "1.034",
    "1001395": "1.042",
    "1001396": "1.107",
    "1001409": "1.128",
    "1001526": "1.039",
    "1001564": "1.107",
    "1001632": "1.085",
    "1001634": "1.019",
    "1001654": "1.002",
    "1002130": "1.004",
    "1002136": "1.022",
    "1002224": "1.005",
    "1002675": "1.123",
    "1003397": "1.066",
    "1003398": "1.075",
    "1006304": "1.028",
    "1007395": "1.004",
    "1007398": "1.049",
    "1008508": "1.172",
    "1008514": "1.06",
    "1008518": "1.086",
    "1008792": "1.018",
    "1008905": "1.009",
    "1009236": "0.993",
    "1010288": "1.064",
    "1010295": "1.066",
    "1010371": "1.107",
    "1013016": "1.191",
    "1013019": "1.016",
    "1013022": "1.05",
    "1013026": "2.948",
    "1014301": "1.014",
    "1014304": "1.103",
    "1014307": "1.132",
    "1015837": "1.018",
    "1015843": "1.0241658075947724",
    "10288": "1.102",
    "10295": "1.048",
    "10371": "1.146",
    "1143": "1.056",
    "1191": "1.072",
    "1199": "1.094",
    "1200": "1.088",
    "13016": "1.243",
    "13019": "1.077",
    "13022": "1.01",
    "13026": "1.05",
    "137": "1.028",
    "1395": "1.179",
    "1396": "1.207",
    "1409": "1.013",
    "14301": "1.013",
    "14304": "1.228",
    "14307": "1.027",
    "1526": "1.06",
    "1564": "1.064",
    "15843": "1.002",
    "1632": "1.006",
    "1634": "1.09",
    "1654": "1.001",
    "16786": "0.993",
    "16788": "1.183",
    "16789": "1.315",
    "16790": "1.085",
    "16915": "1.157",
    "16916": "1.077",
    "20709": "1.061",
    "20711": "1.184",
    "20736": "1.162",
    "20751": "1.046",
    "20753": "1.18",
    "20787": "1.014",
    "2130": "1.046",
    "2134": "1.004",
    "2136": "1.012",
    "2224": "1.032",
    "25341": "0.999",
    "2675": "1.11",
    "27285": "1.213",
    "27286": "1.488",
    "32385": "1.221",
    "32402": "1.042",
    "32404": "1.0315",
    "32409": "1.0156926915799596",
    "32415": "1.367",
    "32416": "1.285",
    "3397": "1.077",
    "3398": "1.044",
    "6304": "1.02",
    "7395": "1.086",
    "7398": "1.194",
    "8508": "1.021",
    "8514": "1.139",
    "8518": "1.252",
    "8792": "1.021",
    "8905": "1.022",
    "9236": "1.005"
  }
];

// 添加调试信息
console.log('拥堵数据时间点:', congestionData.map(d => d.ts));
console.log('第一个时间点的路段ID示例:', Object.keys(congestionData[0]).slice(1, 5)); 