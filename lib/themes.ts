export type Theme = {
  id: string
  name: string
  colors: {
    gradientStart: string
    gradientEnd: string
    glassTint: string
    overlayOpacity: string
  }
}

export const themes: Theme[] = [
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      gradientStart: "35, 35, 38",
      gradientEnd: "20, 20, 24",
      glassTint: "255, 255, 255",
      overlayOpacity: "0.08"
    }
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      gradientStart: "25, 40, 30",
      gradientEnd: "16, 38, 26",
      glassTint: "167, 243, 208", // Emerald 200
      overlayOpacity: "0.08"
    }
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      gradientStart: "20, 30, 45",
      gradientEnd: "14, 28, 50",
      glassTint: "186, 230, 253", // Sky 200
      overlayOpacity: "0.08"
    }
  },
  {
    id: "aurora",
    name: "Aurora",
    colors: {
      gradientStart: "40, 25, 45",
      gradientEnd: "32, 18, 42",
      glassTint: "233, 213, 255", // Purple 200
      overlayOpacity: "0.08"
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      gradientStart: "45, 30, 25",
      gradientEnd: "35, 18, 12",
      glassTint: "254, 215, 170", // Orange 200
      overlayOpacity: "0.08"
    }
  },
  {
    id: "graphite",
    name: "Graphite",
    colors: {
      gradientStart: "40, 40, 40",
      gradientEnd: "22, 22, 22",
      glassTint: "229, 231, 235", // Gray 200
      overlayOpacity: "0.05"
    }
  }
]

export const defaultTheme = themes[0]
