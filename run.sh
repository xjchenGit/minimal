#!/usr/bin/env bash
# Local dev preview. GitHub Pages builds the site natively on push to master.
#
# Ruby + Jekyll live in a dedicated conda env ("jekyll", Ruby 4 / Jekyll 4) so
# they don't pollute conda base or need sudo. Recreate with:
#   conda create -n jekyll -c conda-forge "ruby>=3.1" -y
#   ~/miniconda3/envs/jekyll/bin/gem install jekyll --no-document
#
# We hide Gemfile during the run so bundler doesn't auto-activate the
# github-pages gem (pinned to Jekyll 3.x) and conflict with this Jekyll 4.

if [ -f Gemfile ]; then
  mv Gemfile Gemfile.bak
  trap 'mv Gemfile.bak Gemfile' EXIT
fi

# conda run sets GEM_HOME/PATH for the env; --no-capture-output streams the
# serve logs live instead of buffering them until the process exits.
conda run --no-capture-output -n jekyll jekyll serve --livereload
