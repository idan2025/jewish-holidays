export type IsraelCity = {
  geonameid: number;
  name: string;
  lat: number;
  lon: number;
  tz: string;
};

export const ISRAEL_CITIES: IsraelCity[] = [
  {
    geonameid: 281184,
    name: "Jerusalem",
    lat: 31.778,
    lon: 35.235,
    tz: "Asia/Jerusalem",
  },
  {
    geonameid: 293397,
    name: "Tel Aviv",
    lat: 32.0853,
    lon: 34.7818,
    tz: "Asia/Jerusalem",
  },
  {
    geonameid: 294801,
    name: "Haifa",
    lat: 32.794,
    lon: 34.9896,
    tz: "Asia/Jerusalem",
  }
];
