#!/usr/bin/env sh
set -e
npm run build
cd dist
git init
git checkout -b main
git add -A
git commit -m 'deploy'
git push -f git@github.com:YOUR_USERNAME/nzxt-btc-rub.git main:gh-pages
cd -
rm -rf dist
