const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { createSitemap } = require('sitemap');

const log = (msg, color = 'blue', label = 'SITEMAP') =>
  console.log(`\n${chalk.reset.inverse.bold[color](` ${label} `)} ${msg}`);

module.exports = (options, context) => {
  const {
    hostname,
    outFile = 'sitemap.xml',
    changefreq = 'daily',
    cacheTime = 600,
    urls = [],
    ...others
  } = options;

  return {
    generated() {
      if (!hostname) {
        return log(
          `Not generating sitemap because required 'hostname' option doesn't exist`,
          'orange'
        );
      }

      log('Generating sitemap...');

      const { pages, locales } = context.getSiteData ? context.getSiteData() : context;

      const localeKeys = locales && Object.keys(locales);

      const pagesMap = new Map();

      pages.forEach(page => {
        const lastmodISO = page.lastUpdated
          ? new Date(page.lastUpdated).toISOString()
          : undefined;
        pagesMap.set(page.path, { changefreq, lastmodISO });
      });

      if (localeKeys && localeKeys.length > 1) {
        localeKeys.filter(x => x !== '/').forEach(locale => {
          pagesMap.forEach((page, url) => {
            if (!url.startsWith(locale)) return;

            const parentURL = url.replace(locale, '/');
            const parentPage = pagesMap.get(parentURL);
            if (parentPage) {
              if (!parentPage.links) {
                parentPage.links = [
                  {
                    lang: locales['/'].lang,
                    url: parentURL
                  }
                ];
              }

              parentPage.links.push({
                lang: locales[locale].lang,
                url
              });
            }

            pagesMap.set(parentURL, parentPage);
            pagesMap.delete(url);
          });
        });
      }

      const sitemap = createSitemap({
        hostname: hostname,
        cacheTime: cacheTime * 1000,
        ...others
      });

      pagesMap.forEach((page, url) => {
        sitemap.add({ url, ...page });
      });

      // add custom urls
      urls.forEach(url => sitemap.add(url));

      log(`found ${sitemap.urls.length} locations`);
      const sitemapXML = path.resolve(context.outDir || options.dest, outFile);

      fs.writeFileSync(sitemapXML, sitemap.toString());
      log(`${sitemap.urls.length} locations have been written.`);
    }
  };
};
