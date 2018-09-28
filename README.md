# vuepress-plugin-sitemap

Sitemap generator for vuepress.

## Install

```sh
npm add vuepress-plugin-sitemap
```

## Usage

Use it in postbuild script

```ts
{
  scripts: {
    build: "vuepress build docs -d dist",
    postbuild: "vuepress-sitemap -h https://yours.net.id -d dist",
  }
}
```
