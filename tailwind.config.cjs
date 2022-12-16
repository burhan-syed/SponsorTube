/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "searchFocusShadow": "inset 0 1px 2px",
        "searchShadow": "inset 0 1px 2px"
      }
    },
    colors: {
      "transparent": "transparent",
      "white": "#FFFFFF",
      "th-textPrimary": "var(--textPrimary)",
      "th-textPrimaryInverse": "var(--textPrimaryInverse)",
      "th-textSecondary": "var(--textSecondary)",
      "th-textDisabled": "var(--textDisabled)",
      "th-baseBackground": "var(--baseBackground)",
      "th-raisedBackground": "var(--raisedBackground)",
      "th-menuBackground": "var(--menuBackground)",
      "th-generalBackgroundA": "var(--generalBackgroundA)",
      "th-generalBackgroundB": "var(--generalBackgroundB)",
      "th-generalBackgroundC": "var(--generalBackgroundC)",
      "th-errorBackground": "var(--errorBackground)",
      "th-invertedBackground": "var(--invertedBackground)",
      "th-additiveBackgroundA05": "var(--additiveBackgroundA05)",
      "th-additiveBackgroundA10": "var(--additiveBackgroundA10)",
      "th-chipBackground": "var(--chipBackground)",
      "th-chipBackgroundHover": "var(--chipBackgroundHover)",
      "th-verifiedBadgeBackground": "var(--verifiedBadgeBackground)",
      "th-outline": "var(--outline)",
      "th-shadow": "var(--shadow)",
      "th-touchResponse": "var(--touchResponse)",
      "th-searchBackground": "var(--searchBackground)", 
      "th-searchText": "var(--searchText)",
      "th-searchBorder": "var(--searchBorder)", 
      "th-searchBorderFocus": "var(--searchBorderFocus)",
      "th-searchButton": "var(--searchButton)",
      "th-searchButtonBorder": "var(--searchButtonBorder)",
      "th-searchButtonFocus": "var(--searchButtonFocus)",
      "th-searchButtonHover": "var(--searchButtonHover)",
      "th-searchButtonBorderHover": "var(--searchButtonBorderHover)",
    },
  },
  plugins: [],
};
