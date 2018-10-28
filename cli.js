#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const esm = require("esm");
const { resolve } = require("path");
const pkg = require("./package.json");
const make = require(".");

program
  .version(pkg.version)
  .option("-H, --hostname <hostname>", "website hostname")
  .option(
    "-F, --changefreq [daily|weekly|monthly]",
    "page change frequency, defaults to daily"
  )
  .option("-c, --cache-time [n]", "cache time in second", parseInt)
  .option("-u, --urls [urls]", "list of urls to be merged", val =>
    val.split(",")
  )
  .option("-d, --dest <dest>", "vuepress dest dir")
  .option(
    "-t, --temp [temp]",
    "vuepress temporary dir",
    "node_modules/vuepress/lib/app/.temp/siteData"
  )
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp(chalk.green);
  process.exit(-1);
}

try {
  const tempData = resolve(program.temp);
  const requires = esm(module);
  const { siteData } = requires(tempData);

  make(program, siteData).generated();
} catch (error) {
  console.error(chalk.bold.red(error.message || error.msg || error));
  process.exit(1);
}
