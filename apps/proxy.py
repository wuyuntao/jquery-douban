# -*- coding: UTF-8 -*-
import re
import cgi
import logging
from datetime import datetime

from google.appengine.api import urlfetch
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

DEBUG = True

class DoubanProxy(webapp.RequestHandler):
    """Proxy for Gears calls to douban"""
    def get(self):
        proxy(self, 'GET')
    def post(self):
        proxy(self, 'POST')
    def put(self):
        proxy(self, 'PUT')
    def delete(self):
        proxy(self, 'DELETE')

re_douban = re.compile(r'^http:\/\/(api|www)+\.douban\.com\/.*')

def proxy(handler, type):
    url = handler.request.get('url')
    if re_douban.match(url):
        # Set correct headers
        headers = {
            'Authorization': handler.request.headers.get('Authorization', ''),
            'Content-Type': handler.request.headers.get('Content-Type', '')
        }

        # Get upload data for POST and PUT
        payload = None
        if type == 'POST' or type == 'PUT':
            payload = handler.request.body

        # Fetch result
        response = urlfetch.fetch(payload=payload, url=url, method=type, headers=headers)
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
