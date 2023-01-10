/** @type {import('tailwindcss').Config} */

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
    },
    colors: {
      transparent: "transparent",
      white: "white",
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
      "th-searchText": "var(--searchText)",
      "th-searchBorder": withOpacity("--searchBorder"),
      "th-searchBorderFocus": withOpacity("--searchBorderFocus"),
      "th-searchButton": withOpacity("--searchButton"),
      "th-searchButtonBorder": withOpacity("--searchButtonBorder"),
      "th-searchButtonFocus": withOpacity("--searchButtonFocus"),
      "th-searchButtonHover": withOpacity("--searchButtonHover"),
      "th-searchButtonBorderHover": withOpacity("--searchButtonBorderHover"),

      "th-chipBackground": "var(--chipBackground)",
      "th-chipBackgroundHover": "var(--chipBackgroundHover)",
      "th-verifiedBadgeBackground": "var(--verifiedBadgeBackground)",
      "th-outline": "var(--outline)",
      "th-shadow": "var(--shadow)",
      "th-touchResponse": "var(--touchResponse)",
      "th-searchBackground": "var(--searchBackground)",
    },
  },
  plugins: [],
};
