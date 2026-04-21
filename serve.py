#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.request
import urllib.error

PORT = 8080

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add no-cache headers to all responses
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        return super().end_headers()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            # ข้าม Error ในกรณีที่เบราว์เซอร์ตัดการเชื่อมต่อก่อนที่เซิร์ฟเวอร์จะส่งไฟล์เสร็จ
            pass

    def proxy_request(self):
        # Forward Request ไปที่ API Gateway ที่พอร์ต 3000
        url = f"http://localhost:3000{self.path}"
        req = urllib.request.Request(url, method=self.command)
        for key, value in self.headers.items():
            if key.lower() not in ['host']:
                req.add_header(key, value)
        
        if self.command in ['POST', 'PUT', 'PATCH']:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                req.data = self.rfile.read(content_length)

        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for key, value in response.getheaders():
                    self.send_header(key, value)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, value in e.headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(e.read())
        except urllib.error.URLError as e:
            self.send_error(502, f"Bad Gateway: Unable to connect to API Gateway on port 3000. Error: {e.reason}")
        except Exception as e:
            self.send_error(500, f"Internal Server Error: {str(e)}")

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(501, "Unsupported method ('POST')")

    def do_GET(self):
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/public/login.html')
            self.end_headers()
        elif self.path.startswith('/api/'):
            self.proxy_request()
        else:
            super().do_GET()
            
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(501, "Unsupported method ('PUT')")

    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(501, "Unsupported method ('DELETE')")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    with ReusableTCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"✅ Server running: http://localhost:{PORT}")
        print(f"📱 Open: http://localhost:{PORT}/public/login.html")
        httpd.serve_forever()
