# -*- coding: UTF-8 -*-

import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

DEBUG = True

class BookList(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'templates/book_list.html')
        self.response.out.write(template.render(path, {}))

urls = [
    ('/example/book_list/', BookList),
]

def main():
    application = webapp.WSGIApplication(urls, debug=DEBUG)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
