require("tailwindcss/colors");
const {default: flattenColorPalette} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './public/*.{html,js}'
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
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-in-out",
                'spin-seconds': 'spin 60s infinite steps(60)',
                aurora: "aurora 60s linear infinite",
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