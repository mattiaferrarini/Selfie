require("tailwindcss/colors");
const {default: flattenColorPalette} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './public/*.html'
    ],
    theme: {
        extend: {
            keyframes: {
                "fade-in": {
                    "0%": {opacity: "0%"},
                    "100%": {opacity: "100%"},
                },
                aurora: {
                    from: {
                        backgroundPosition: "50% 50%, 50% 50%",
                    },
                    to: {
                        backgroundPosition: "350% 50%, 350% 50%",
                    },
                },
                "slide-in-right": {
                    "0%": {transform: "translateX(100%)"},
                    "100%": {transform: "translateX(0)"},
                },
                "slide-in-bottom": {
                    "0%": {transform: "translateY(100%)"},
                    "100%": {transform: "translateY(0)"},
                },
                "appear-in-order": {
                    "0%": {opacity: "0", transform: "translateY(20px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-in-out",
                'spin-seconds': 'spin 60s infinite steps(60)',
                aurora: "aurora 60s linear infinite",
                "slide-in-right": "slide-in-right 0.5s ease-in-out",
                "slide-in-bottom": "slide-in-bottom 0.5s ease-in-out",
                "appear-in-order": "appear-in-order 0.5s ease-in-out",
            },
        },
    },
    plugins: [
        addVariablesForColors,
        require('@tailwindcss/typography')
    ],
}

function addVariablesForColors({addBase, theme}) {
    let allColors = flattenColorPalette(theme("colors"));
    let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
    );

    addBase({
        ":root": newVars,
    });
}