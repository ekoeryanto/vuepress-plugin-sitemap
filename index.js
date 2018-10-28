const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { createSitemap } = require("sitemap");

const log = (msg, color = "blue", label = "SITEMAP") =>
  console.log(`\n${chalk.reset.inverse.bold[color](` ${label} `)} ${msg}`);

module.exports = (options, context) => {
  const {
    hostname,
    outFile = "sitemap.xml",
    changefreq = "daily",
    cacheTime = 600,
    urls = [],
    ...others
  } = options;

  return {
    generated() {
      if (!hostname) {
        return log(
          `Not generating sitemap because required 'hostname' option doesn't exist`,
          "orange"
        );
      }

      log("Generating sitemap...");

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
        cacheTime: cacheTime * 1000,
        urls: _urls,
        ...others
      });

      const sitemapXML = path.resolve(context.outDir || options.dest, outFile);

      fs.writeFileSync(sitemapXML, sitemap.toString());
    }
  };
};
