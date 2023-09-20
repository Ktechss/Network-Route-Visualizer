from flask import Flask, render_template, request
import subprocess
import socket
import re  

app = Flask(__name__, static_url_path='/static')

def traceroute_with_details(host):
    try:
        public_ip=subprocess.check_output(["curl", "ipinfo.io/ip"],text=True)
        result = subprocess.check_output(['traceroute', '-q', '1', '-w', '1', host])
        hops = result.decode('utf-8').splitlines()
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        my_ip = s.getsockname()[0]
        hop_details = [my_ip]
        for hop in hops:
            match = re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', hop)
            if match:
                hop_details.append(match.group(0))  
        hop_details.append(socket.gethostbyname(host))
        unique_hop=[]
        for hop in hop_details:
            if hop not in unique_hop:
                unique_hop.append(hop)
        unique_hop=list(unique_hop)
        unique_hop.insert(2,public_ip)
        return unique_hop
    except subprocess.CalledProcessError as e:
        return [] 

@app.route('/', methods=['GET', 'POST'])
def index():
    hop_details = None

    if request.method == 'POST':
        host = request.form['host']
        hop_details = traceroute_with_details(host)

    return render_template('index.html', hop_details=hop_details)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=43344, debug=True)
