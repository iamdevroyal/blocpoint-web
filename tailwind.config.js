/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5', // Indigo 600
                'primary-soft': '#6366F1',
                accent: '#22D3EE', // Cyan 400
                dark: '#020617', // Near-black background
                surface: '#020617',
                muted: '#64748B',
            },
            borderRadius: {
                '2xl': '1.25rem',
            },
        },
    },
    plugins: [],
}
