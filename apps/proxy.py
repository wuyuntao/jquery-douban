# -*- coding: UTF-8 -*-
import logging
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

re_douban = re.compile(r'^http:\/\/(\w+\.douban\.com)(\/.*)$', re.I)

def proxy(handler):
    url = handler.request.get('url')
    # If URL is not douban, throw a 403 error
    if not re_douban.match(url):
        return handler.error(403)

    # Set correct headers
    headers = {
        'Authorization': handler.request.headers.get('Authorization', ''),
        'Content-Type': handler.request.headers.get('Content-Type', ''),
    }

    # Set upload data
    payload = handler.request.body

    try:
        # Fetch result
        response = urlfetch.fetch(payload=payload, url=url, method=handler.request.method, headers=headers)

        # Set status code and return the response
        handler.response.set_status(response.status_code)
        return handler.response.out.write(response.content)
    except:
        logging.error("Failed to %s url: %s" % (handler.request.method, url))
        # If failed to get response from douban, throw a 400 error
        return handler.error(400)

# URL patterns
urls = (
    ('/proxy', DoubanProxy),
)

def main():
    application = webapp.WSGIApplication(urls, debug=DEBUG)
    run_wsgi_app(application)

if __name__ == '__main__':
    main()
