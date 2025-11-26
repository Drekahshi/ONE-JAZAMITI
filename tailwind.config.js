/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                vegetation: {
                    light: '#e6f4ea',
                    medium: '#34a853',
                    dark: '#137333',
                },
                earth: {
                    brown: '#5f6368',
                }
            },
        },
    },
    plugins: [],
}
