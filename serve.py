#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080
os.chdir('/home/labadmin/project-moblie-finance')

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add no-cache headers to all responses
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        return super().end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"✅ Server running: http://localhost:{PORT}")
        print(f"📱 Open: http://localhost:{PORT}/public/login.html")
        httpd.serve_forever()
