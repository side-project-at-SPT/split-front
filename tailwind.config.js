export default {
  content: [ './index.html', './src/**/*.{vue,js,ts,jsx,tsx}' ],
  safelist: [ 
  ],
  theme: {
    extend: {
      colors: {
        // Configure your color palette here
        text: '#006989',
        red: '#AE0000',
        'red-dark': '#730000',
        pink: '#EC7DD3',
        purple: '#8962F8',
        skyblue: '#7195F2',
        grassgreen: '#68C907',
        yellow: '#EACA24',
        'yellow-other': '#FFE55A',
        'yellow-bright': '#FEE718',
        orange: '#FF8D4D',
        white: '#F7F7F7',
        grey: '#8C8C8C',
        grey50: 'rgba(140, 140, 140, 0.5)',
        grey70: 'rgba(140, 140, 140, 0.7)',
        'grey-deep': '#575757',
        skin: '#FFFFFF',
        white20: 'rgba(255, 255, 255, 0.20)',
        oldBook: '#C8B59F',
        'active-pasture': '#83FFDC',
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(180deg, #FFFFFF 0%, #DAFFFF 100%)'
      },
      boxShadow: {
        message: '0px 4px 0px 0px #27B8E0',
        confirm: '0px 4px 0px 0px #FF9200',
        cancel: '0px 4px 0px 0px #919A9C',
        button: '0px 4px 0px 0px #27B8E0',
        buttonOff: '0px 4px 0px 0px #ADADAD',
      }

    },
  },
  plugins: [],
}