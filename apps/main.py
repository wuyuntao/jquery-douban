# -*- coding: UTF-8 -*-

import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

DEBUG = True

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'templates/base.html')
        self.redirect('http://code.google.com/p/jquery-douban/')

# URL patterns
urls = [
    ('/', MainPage),
]

def main():
    application = webapp.WSGIApplication(urls, debug=DEBUG)
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
