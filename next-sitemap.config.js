const { config }  = require('./lib/server/config')
const fs = require('fs')
const path = require('path')

module.exports = {
  siteUrl: config.link,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  additionalPaths: async sitemapConfig => {
    // Search was generated from the same published data used by article pages.
    const snapshot = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.next/server/pages/search.json'), 'utf8'))
    return Promise.all(snapshot.pageProps.sitemapSlugs.map(slug =>
      sitemapConfig.transform(sitemapConfig, `${config.path || ''}/${slug}`)
    ))
  }
  // ...other options
  // https://github.com/iamvishnusankar/next-sitemap#configuration-options
}
