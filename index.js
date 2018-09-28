#!/usr/bin/env node
const { writeFile, existsSync } = require('fs')
const { resolve } = require('path')
const { createSitemap } = require('sitemap')
const esm = require('esm')
const arg = require('arg')

let args

try {
  args = arg({
    'hostname': String,
    'changefreq': String,
    'cacheTime': String,
    'dest': String,

    '-h': 'hostname',
    '--hostname': 'hostname',
    '-f': 'changefreq',
    '--changefreq': 'changefreq',
    '-c': 'cacheTime',
    '--cache-time': 'cacheTime',
    '-d': 'dest',
    '--dest': 'dest'
  })
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

if (!args.hostname) {
  console.log('--hostname/-h is required')
  process.exit(1)
}

const requires = esm(module)

const tempData = resolve('node_modules/vuepress/lib/app/.temp/siteData')

const { siteData: { pages } } = requires(tempData)

const urls = pages.map(i => {
  const lastmodISO = i.lastUpdated ? new Date(i.lastUpdated).toISOString() : undefined

  return {
    url: i.path,
    lastmodISO,
    changefreq: args.changefreq || 'daily',
  }
})

const sitemap = createSitemap({
  hostname: args.hostname,
  cacheTime: (args.cacheTime || 600) * 1000, // 600 sec cache period
  urls,
})

const dest = resolve(args.dest || `${process.cwd()}/.vuepress/dist`)

if (!existsSync(dest)) {
  console.error('build dir does not exist:', dest)
  process.exit(1)
}

writeFile(resolve(dest, 'sitemap.xml'), sitemap.toString(), (err) => {
  if (!err) console.log(`sitemap generated in: "${dest}"`)
  else console.error(err)
})
