export interface AirQualityData {
  stationName: string;
  sidoName: string;
  pm10Value: string;
  pm25Value: string;
  o3Value: string;
  no2Value: string;
  coValue: string;
  so2Value: string;
  pm10Grade: string;
  pm25Grade: string;
  dataTime: string;
}

export type Grade = "1" | "2" | "3" | "4" | "-";

export function getGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    "1": "좋음",
    "2": "보통",
    "3": "나쁨",
    "4": "매우나쁨",
  };
  return labels[grade] || "정보없음";
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    "1": "bg-blue-100 text-blue-800 border-blue-200",
    "2": "bg-green-100 text-green-800 border-green-200",
    "3": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "4": "bg-red-100 text-red-800 border-red-200",
  };
  return colors[grade] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getGradeBg(grade: string): string {
  const colors: Record<string, string> = {
    "1": "#3B82F6",
    "2": "#22C55E",
    "3": "#EAB308",
    "4": "#EF4444",
  };
  return colors[grade] || "#9CA3AF";
}

export const SIDO_LIST = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종",
];

export async function fetchAirQualityBySido(sidoName: string): Promise<AirQualityData[]> {
  const apiKey = process.env.AIR_QUALITY_API_KEY;
  const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${apiKey}&returnType=json&numOfRows=100&pageNo=1&sidoName=${encodeURIComponent(sidoName)}&ver=1.0`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const json = await res.json();
  const items = json?.response?.body?.items;
  if (!Array.isArray(items)) return [];

  return items.map((item: Record<string, string>) => ({
    stationName: item.stationName || "-",
    sidoName: item.sidoName || sidoName,
    pm10Value: item.pm10Value || "-",
    pm25Value: item.pm25Value || "-",
    o3Value: item.o3Value || "-",
    no2Value: item.no2Value || "-",
    coValue: item.coValue || "-",
    so2Value: item.so2Value || "-",
    pm10Grade: item.pm10Grade || "-",
    pm25Grade: item.pm25Grade || "-",
    dataTime: item.dataTime || "-",
  }));
}

export async function fetchAllSidoSummary(): Promise<
  { sido: string; pm10Avg: number; pm25Avg: number; pm10Grade: string; pm25Grade: string }[]
> {
  const results = await Promise.all(
    SIDO_LIST.map(async (sido) => {
      const data = await fetchAirQualityBySido(sido);
      const valid10 = data.filter((d) => d.pm10Value !== "-" && !isNaN(Number(d.pm10Value)));
      const valid25 = data.filter((d) => d.pm25Value !== "-" && !isNaN(Number(d.pm25Value)));
      const pm10Avg = valid10.length
        ? Math.round(valid10.reduce((s, d) => s + Number(d.pm10Value), 0) / valid10.length)
        : 0;
      const pm25Avg = valid25.length
        ? Math.round(valid25.reduce((s, d) => s + Number(d.pm25Value), 0) / valid25.length)
        : 0;

      const gradeFor10 = pm10Avg <= 30 ? "1" : pm10Avg <= 80 ? "2" : pm10Avg <= 150 ? "3" : "4";
      const gradeFor25 = pm25Avg <= 15 ? "1" : pm25Avg <= 35 ? "2" : pm25Avg <= 75 ? "3" : "4";

      return { sido, pm10Avg, pm25Avg, pm10Grade: gradeFor10, pm25Grade: gradeFor25 };
    })
  );
  return results;
}
