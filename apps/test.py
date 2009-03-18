# -*- coding: UTF-8 -*-

import os
import cgi
import logging
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

testcases = (
    'basic',
    'collection',
    'event',
    'miniblog',
    'note',
    'oauth',
    'recommendation'
    'review',
    'subject',
    'tag',
    'user',
    'gears',
)

class TestHandler(webapp.RequestHandler):
    def get(self):
        self.response.out.write(self.build_json())

    def post(self):
        self.response.out.write(self.build_json())

    def put(self):
        self.response.out.write(self.build_json())

    def delete(self):
        self.response.out.write(self.build_json())

    def build_json(self):
        return json.dumps({
            'url': self.request.url,
            'params': dict(cgi.parse_qsl(self.request.query_string)),
            'headers': {
                'h1': self.request.headers.get('H1'),
                'h2': self.request.headers.get('H2'),
            },
            'data': self.request.body,
        })

class TestcasePage(webapp.RequestHandler):
    def get(self, testcase_name):
        if testcase_name not in testcases:
            return self.error(404)

        template_path = 'templates/tests/%s.html' % testcase_name
        template_values = {
            'testcase_name': testcase_name,
        }
        path = os.path.join(os.path.dirname(__file__), template_path)
        return self.response.out.write(template.render(path, template_values))

urls = (
    (r'/test/handler/', TestHandler),
    (r'/test/(.*)/', TestcasePage),
)

def main():
    application = webapp.WSGIApplication(urls, debug=True)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
