# -*- coding: UTF-8 -*-
import re

from google.appengine.api import urlfetch
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

DEBUG = True

class DoubanProxy(webapp.RequestHandler):
    """ Simple cross-origin proxy for Gears requests to douban """
    def get(self):
        proxy(self)
    def post(self):
        proxy(self)
    def put(self):
        proxy(self)
    def delete(self):
        proxy(self)

re_douban = re.compile(r'^http:\/\/(api|www)\.douban\.com\/.*')

def proxy(handler):
    url = handler.request.get('url')
    if re_douban.match(url):
        # Set correct headers
        headers = {
            'Authorization': handler.request.headers.get('Authorization', ''),
            'Content-Type': handler.request.headers.get('Content-Type', '')
        }

        # Set upload data
        payload = handler.request.body

        # Fetch result
        response = urlfetch.fetch(payload=payload, url=url, method=handler.request.method, headers=headers)
        handler.response.out.write(response.content)
    else:
        handler.response.out.write("Invalid URL")

# URL patterns
urls = [
    ('/proxy', DoubanProxy),
]

def main():
    application = webapp.WSGIApplication(urls, debug=DEBUG)
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
