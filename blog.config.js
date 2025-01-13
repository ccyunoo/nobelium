const BLOG = {
  title: '看云设计 Xiaoyun´s Weblog',
  author: 'Xiaoyun',
  email: 'ccyunoo@gmail.com',
  link: 'http://www.ccyun.com',
  description: 'Ccyun.com',
  lang: 'zh-CN', // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES']
  timezone: 'Asia/shanghai', // Your Notion posts' date will be interpreted as this timezone. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for all options.
  appearance: 'auto', // ['light', 'dark', 'auto'],
  font: 'sans-serif', // ['sans-serif', 'serif']
  lightBackground: '#ffffff', // use hex value, don't forget '#' e.g #fffefc
  darkBackground: '#18181B', // use hex value, don't forget '#'
  path: '', // leave this empty unless you want to deploy Nobelium in a folder
  since: 2003, // If leave this empty, current year will be used.
  postsPerPage: 10,
  sortByDate: false,
  showAbout: true,
  showArchive: true,
  autoCollapsedNavBar: false, // The automatically collapsed navigation bar
  ogImageGenerateURL: 'https://og-image-craigary.vercel.app', // The link to generate OG image, don't end with a slash
  socialLink: 'https://twitter.com/ccyunoo',
  seo: {
    keywords: ['看云设计','杭州产品设计顾问','杭州移动互联网解决方案','互联网创业', '杭州创业','互联网金融社交社区','大型政务系统建设', '产品设计专家', '资深产品经理' ,'杭州品牌标识设计','青少年编程教育少儿编程教育', 'Xiaoyun´s Weblog','小云的网站','NGO CHINA','Notion','看云卷云舒 莫舍己道不扰他心'],
    googleSiteVerification: 'NOlwfQXgdc5qNPRjvccuGjnTu6Gl-d9e1_m-a8-RdMY' // Remove the value or replace it with your own google site verification code   https://search.google.com/search-console/not-verified?original_url=/search-console/ownership&original_resource_id
  },
  notionPageId: process.env.NOTION_PAGE_ID, // DO NOT CHANGE THIS！！！
  notionAccessToken: process.env.NOTION_ACCESS_TOKEN, // Useful if you prefer not to make your database public
  analytics: {
    provider: 'ga', // Currently we support Google Analytics and Ackee, please fill with 'ga' or 'ackee', leave it empty to disable it.
    ackeeConfig: {
      tracker: '', // e.g 'https://ackee.craigary.net/tracker.js'
      dataAckeeServer: '', // e.g https://ackee.craigary.net , don't end with a slash
      domainId: '' // e.g '0e2257a8-54d4-4847-91a1-0311ea48cc7b'
    },
    gaConfig: {
      measurementId: 'G-QKWM2V23VN' // e.g: G-XXXXXXXXXX    https://analytics.google.com/
    }
  },
  comment: {
    // support provider: gitalk, utterances, cusdis
    provider: 'cusdis', // leave it empty if you don't need any comment plugin
    gitalkConfig: {
      repo: '', // The repository of store comments
      owner: '',
      admin: [],
      clientID: '',
      clientSecret: '',
      distractionFreeMode: false
    },
    utterancesConfig: {
      repo: ''
    },
    cusdisConfig: {
      appId: 'cac352df-8365-4f22-a01f-7dd823b5253c', // data-app-id
      host: 'https://cusdis.com', // data-host, change this if you're using self-hosted version
      scriptSrc: 'https://cusdis.com/js/cusdis.es.js' // change this if you're using self-hosted version
    }
  },
  isProd: process.env.VERCEL_ENV === 'production' // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
}
// export default BLOG
module.exports = BLOG