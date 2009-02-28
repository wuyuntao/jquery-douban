# -*- coding: UTF-8 -*-
import os
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
)

class TestcasePage(webapp.RequestHandler):
    def get(self, testcase_name):
        if testcase_name not in testcases:
            return self.error(404)

        template_path = 'templates/tests.html'
        template_values = {
            'testcase_name': testcase_name,
        }
        path = os.path.join(os.path.dirname(__file__), template_path)
        return self.response.out.write(template.render(path, template_values))

urls = (
    (r'/test/(.*)/', TestcasePage),
)

def main():
    application = webapp.WSGIApplication(urls, debug=True)
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
