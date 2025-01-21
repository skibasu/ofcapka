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
            keyframes: {
                animateIn: {
                    "0%": { opacity: "0", transform: "translateY(6px)" },
                    "80%": { opacity: "100%" },
                    "100%": { opacity: "100%", transform: "translateY(0)" },
                },
                animateOut: {
                    "0%": { opacity: "100%", transform: "translateY(0)" },
                    "100%": { opacity: "0", transform: "translateY(6px)" },
                },
            },
            animation: {
                animateIn: "animateIn .3s ease-in-out forwards",
                animateOut: "animateOut .3s ease-in-out forwards",
            },
        },
    },
    plugins: [],
}
