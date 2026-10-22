/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: (() => {
        const customSpacing = {};
        for (let i = 0; i <= 200; i++) {
          customSpacing[i] = `${i * 0.25}rem`; // i × 4px (default Tailwind scale)
        }
        return customSpacing;

        
      })(),
 screens: {
  'tab-md': { min: '636px', max: '767px' },
  'mobile': '450px',
  'big': '2000px',
},

      fontSize: {
        'size-xs': '.75rem',
        'size-sm': '.875rem',
        'size-base': '1rem',
        'size-lg': '1.125rem',
        'size-xl': '1.25rem',
        'size-2xl': '1.5rem',
        'size-3xl': '1.875rem',
        'size-4xl': '2.25rem',
        'size-5xl': '3rem',
        'size-6xl': '4rem',
        'size-7xl': '5rem',
      },

      colors: {
        primary: {
          golden: "#DCCA87",
          black: "#1C1A18",
          gray: "#545454",
          crimson: "#F5EFDB",
          gray2: "#AAAAAA",
          white: "#FFFFFF",
          terracotta: "#C04E24",
        },
        terracotta: {
          50: '#FDF6F0',
          100: '#F9E8DE',
          200: '#F3D0BD',
          300: '#E9B195',
          400: '#DE8A66',
          500: '#D3693E',
          600: '#C04E24',
          700: '#A43D1A',
          800: '#843217',
          900: '#6C2A15',
        },
        charcoal: {
          950: '#121110',
          900: '#1C1A18',
          800: '#262320',
          700: '#332F2B',
          600: '#45403C',
          500: '#5C5752',
        },
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#EFE9DF',
          300: '#E5DED2',
          400: '#D5CBC0',
        },
        warmgrey: {
          50: '#F7F5F2',
          100: '#EDE9E3',
          200: '#E0DAD1',
          300: '#C8BFB3',
        },
        // Safety Aliases: Maps legacy navy utility classes to elegant charcoal
        navy: {
          950: '#121110',
          900: '#1C1A18',
          800: '#262320',
          700: '#332F2B',
          600: '#45403C',
          500: '#C04E24',
        },
        brand: {
          terracotta: '#C04E24',
          charcoal: '#1C1A18',
          canvas: '#FAF8F5',
          border: '#E0DAD1',
          navy: '#1C1A18', // Aliased
          teal: '#C04E24', // Aliased
        },
      },

      transitionTimingFunction: {
        'slideBottomCubic': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      keyframes: {
        slideBottom: {
          '0%': { transform: 'translateY(-25%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },

      animation: {
        slideBottomAnimation: 'slideBottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
      },

      // fontFamily: {
      //   slab: ['Roboto Slab', 'serif'],
      // },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
      },

      zIndex: {
        '-1': -1,
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'nav': 999,
      },

      flex: {
        'one': 1,
      },

      height: {
        '10vh': '10vh',
        '20vh': '20vh',
        '30vh': '30vh',
        '40vh': '40vh',
        '50vh': '50vh',
        '60vh': '60vh',
        '70vh': '70vh',
        '80vh': '80vh',
        '90vh': '90vh',

        '10vwh': '10vw',
        '20vwh': '20vw',
        '30vwh': '30vw',
        '40vwh': '40vw',
        '50vwh': '50vw',
        '60vwh': '60vw',
        '70vwh': '70vw',
        '80vwh': '80vw',
        '90vwh': '90vw',
      },

      width: {
        '10vw': '10vw',
        '20vw': '20vw',
        '30vw': '30vw',
        '40vw': '40vw',
        '50vw': '50vw',
        '60vw': '60vw',
        '70vw': '70vw',
        '80vw': '80vw',
        '90vw': '90vw',
      },

      screens: {
        'mobile': '450px',
        'big': '2000px',
      },
    },
  },
  plugins: [],
}
