#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import os
from optparse import OptionParser

""" python build.py [-acemnrRstu] [-AgGMj] [-h|--help] """

src_dir = 'src'
build_dir = 'build'
dist_dir = 'dist'

douban_js = '%s/jquery.douban.js' % dist_dir
min_js = '%s/jquery.douban.min.js' % dist_dir
version = 'VERSION'

core = ['core', 'utils', 'parser', 'client']

services = ['collection', 'event', 'miniblog', 'note', 'recommendation', \
            'review', 'subject', 'tag', 'user']

handlers = ['jquery', 'gears', 'gadget', 'greasemonkey']


options = (
    ('-a', '--all',             'include all services'),
    ('-c', '--collection',      'include collection service'),
    ('-e', '--event',           'include event service'),
    ('-m', '--miniblog',        'include miniblog service'),
    ('-n', '--note',            'include note service'),
    ('-r', '--recommendation',  'include recommendation service'),
    ('-R', '--review',          'include review service'),
    ('-s', '--subject',         'include subject service'),
    ('-t', '--tag',             'include tag service'),
    ('-u', '--user',            'include user service'),

    ('-A', '--all-handlers',    'include all handlers'),
    ('-g', '--gadget',          'include gadget handler'),
    ('-G', '--gears',           'include gears handler'),
    ('-M', '--greasemonkey',    'include greasemonkey handler'),
    ('-j', '--jquery',          'include jquery handler'),
)

def main():
    my_services = []
    my_handlers = []
    my_files = []

    parser = OptionParser()
    for short, long, help in options:
        parser.add_option(long, short, action='store_true',
            default=False, help=help)
    opts, args = parser.parse_args()

    if opts.all:
        my_services = services
    else:
        for service in services:
            if getattr(opts, service):
                my_services.append(service)
        if not my_services:
            my_services = services

    if opts.all_handlers:
        my_handlers = handlers
    else:
        for handler in handlers:
            if getattr(opts, handler):
                my_handlers.append(handler)
        if not my_handlers:
            my_handlers = handlers
    my_handlers = ['%s_handler' % handler for handler in my_handlers]
    
    my_files = ['intro'] + core + my_services + my_handlers + ['outro']

    print "Files need to build...\n%s" % ", ".join(my_files)

    my_path = ['%s/%s.js' % (src_dir, file) for file in my_files]

    try:
        os.mkdir(dist_dir)
    except OSError:
        # Directory exists
        pass

    # Build js
    print "\nBuilding..."
    try:
        os.system("cat %s | sed s/@VERSION/`cat %s`/ > %s" % \
                  (" ".join(my_path), version, douban_js))
        print "Built: %s" % douban_js

        print "\nMinifying..."
        try:
            os.system("java -jar %s/js.jar %s/build/min.js %s %s" % \
                      (build_dir, build_dir, douban_js, min_js))
            print "Minified: %s" % min_js
        except:
            print "Failed to minifiy: %s" % min_js
    except:
        print "Failed to build: %s" % douban_js

if __name__ == '__main__':
    main()
