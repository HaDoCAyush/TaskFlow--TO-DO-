export const palette = {
  ink: "#101827",
  inkSoft: "#182338",
  purple: "#746BFF",
  purpleLight: "#ECEBFF",
  mint: "#35C9A5",
  canvas: "#F5F6FA",
  white: "#FFFFFF",
  text: "#192235",
  muted: "#7E8798",
  line: "#E8EAF0",
  red: "#E45C68",
  amber: "#E8A23A",
  green: "#2CA987"
};

export type Theme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
  danger: string;
  success: string;
  shadow: string;
};

export const lightTheme: Theme = {
  background: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F1F7",
  text: "#192235",
  muted: "#7E8798",
  border: "#E8EAF0",
  primary: "#746BFF",
  primarySoft: "#ECEBFF",
  danger: "#E45C68",
  success: "#2CA987",
  shadow: "rgba(23, 32, 54, 0.08)"
};

export const darkTheme: Theme = {
  background: "#101827",
  surface: "#182338",
  surfaceAlt: "#202D43",
  text: "#F4F6FC",
  muted: "#A2AEC2",
  border: "#2B3850",
  primary: "#938CFF",
  primarySoft: "#302E58",
  danger: "#FF7884",
  success: "#48D6B2",
  shadow: "rgba(0, 0, 0, 0.22)"
};
