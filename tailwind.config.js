/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                antonio: ["Antonio", "sans-serif"],
                lato: ["Lato", "sans-serif"],
                handscript: ["Shadows Into Light", "cursive"],
            },
            fontSize: {
                "2xs": "0.7rem",
            },
            colors: {
                "pale-pink": "#f78da7",
            },
        },
    },
    plugins: [],
}
