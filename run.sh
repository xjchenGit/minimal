#!/usr/bin/env bash
# Local dev preview. GitHub Pages builds the site natively on push to master.
#
# System Ruby 2.6 can't install the latest github-pages gem (needs >= 2.7),
# so we run a directly-installed Jekyll 3.10 and hide Gemfile during the run
# so bundler doesn't auto-activate and break kramdown's load path.
#
# Long-term fix: `brew install ruby`, then `bundle install` and switch the
# command back to `bundle exec jekyll serve --livereload`.

JEKYLL=~/.gem/ruby/2.6.0/bin/jekyll

if [ -f Gemfile ]; then
  mv Gemfile Gemfile.bak
  trap 'mv Gemfile.bak Gemfile' EXIT
fi

"$JEKYLL" serve --livereload
