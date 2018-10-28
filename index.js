const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { createSitemap } = require("sitemap");

const log = (msg, color = "blue") =>
  console.log(chalk.reset.inverse.bold[color](msg));

module.exports = (options, context) => {
  const {
    hostname,
    outFile = "sitemap.xml",
    changefreq = "daily",
    cacheTime = 600000,
    urls = [],
    ...others
  } = options;

  return {
    generated() {
      if (!hostname) {
        return log(
          `\nNot generating sitemap because required 'hostname' option doesn't exist `,
          "orange"
        );
      }

      log("\nGenerating sitemap...");

      const { pages } = context;
      const _urls = pages
        .map(i => {
          const lastmodISO = i.lastUpdated
            ? new Date(i.lastUpdated).toISOString()
            : undefined;

          return {
            url: i.path,
            lastmodISO,
            changefreq
          };
        })
        .concat(urls);

      const sitemap = createSitemap({
        hostname: hostname,
        cacheTime: cacheTime,
        urls: _urls,
        ...others
      });

      const sitemapXML = path.resolve(context.outDir, outFile);

      fs.writeFileSync(sitemapXML, sitemap.toString());
    }
  };
};
