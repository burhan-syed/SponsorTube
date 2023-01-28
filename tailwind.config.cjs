/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */

// import defaultTheme from 'tailwindcss/defaultTheme'
const defaultTheme = require("tailwindcss/defaultTheme");

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        searchFocusShadow: "inset 0 1px 2px",
        searchShadow: "inset 0 1px 2px",
      },
      spacing: {
        0.5: "0.2rem",
        1: "0.4rem",
        1.5: "0.6rem",
        2: "0.8rem",
        2.5: "1.0rem",
        3: "1.2rem",
        3.5: "1.4rem",
        4: "1.6rem",
        5: "2rem",
        6: "2.4rem",
        7: "2.8rem",
        8: "3.2rem",
        9: "3.6rem",
        10: "4.0rem",
        11: "4.4rem",
        12: "4.8rem",
        14: "5.6rem",
        16: "6.4rem",
        20: "8.0rem",
        24: "9.6rem",
        28: "11.2rem",
        32: "12.8rem",
        36: "14.4rem",
        40: "16.0rem",
        44: "17.6rem",
        48: "19.2rem",
        52: "20.8rem",
        56: "22.4rem",
        60: "24.0rem",
        64: "25.6rem",
        72: "28.8rem",
        80: "32.0rem",
        96: "38.4rem",
      },
      fontFamily: {
        sans: ["Roboto", ...defaultTheme.fontFamily.sans],
        mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        "th-textPrimary": withOpacity("--textPrimary"),
        "th-textPrimaryInverse": withOpacity("--textPrimaryInverse"),
        "th-textSecondary": withOpacity("--textSecondary"),
        "th-textDisabled": withOpacity("--textDisabled"),
        "th-baseBackground": withOpacity("--baseBackground"),
        "th-raisedBackground": withOpacity("--raisedBackground"),
        "th-menuBackground": withOpacity("--menuBackground"),
        "th-generalBackgroundA": withOpacity("--generalBackgroundA"),
        "th-generalBackgroundB": withOpacity("--generalBackgroundB"),
        "th-generalBackgroundC": withOpacity("--generalBackgroundC"),
        "th-errorBackground": withOpacity("--errorBackground"),
        "th-invertedBackground": withOpacity("--invertedBackground"),
        "th-additiveBackground": withOpacity("--additiveBackground"),
        "th-tonalBackground": withOpacity("--tonalBackground"),
        "th-searchText": "var(--searchText)",
        "th-searchBorder": withOpacity("--searchBorder"),
        "th-searchBorderFocus": withOpacity("--searchBorderFocus"),
        "th-searchButton": withOpacity("--searchButton"),
        "th-searchButtonBorder": withOpacity("--searchButtonBorder"),
        "th-searchButtonFocus": withOpacity("--searchButtonFocus"),
        "th-searchButtonHover": withOpacity("--searchButtonHover"),
        "th-searchButtonBorderHover": withOpacity("--searchButtonBorderHover"),
        "th-callToAction": withOpacity("--callToAction"),
        "th-callToActionInverse": withOpacity("--callToActionInverse"),
        "th-tooltipBackground": withOpacity("--tooltipBackground"),
        "th-tooltipText": withOpacity("--tooltipText"),

        "th-chipBackground": "var(--chipBackground)",
        "th-chipBackgroundHover": "var(--chipBackgroundHover)",
        "th-verifiedBadgeBackground": "var(--verifiedBadgeBackground)",
        "th-outline": "var(--outline)",
        "th-shadow": "var(--shadow)",
        "th-touchResponse": "var(--touchResponse)",
        "th-searchBackground": "var(--searchBackground)",
        "th-searchBackgroundHover": "var(--searchHoverBackground)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
    fontSize: {
      xxs: ["1.0rem", { lineHeight: "1.4rem" }],
      xs: [
        "1.2rem",
        {
          lineHeight: "1.8rem",
          // letterSpacing: '-0.01em',
          // fontWeight: "400",
        },
      ],
      sm: ["1.4rem", { lineHeight: "1.4rem" }],
      base: [
        "1.4rem",
        {
          lineHeight: "2rem",
        },
      ],
      lg: ["1.6rem", { lineHeight: "2.2rem" }],
      xl: [
        "2.0rem",
        {
          lineHeight: "2.8rem",
        },
      ],
      "2xl": ["2.4rem", { lineHeight: "3.0rem" }],
      "3xl": ["4.8rem", { lineHeight: "5.7rem" }],
    },
  },
  plugins: [],
};
