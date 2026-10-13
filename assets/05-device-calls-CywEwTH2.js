var e={id:`device-calls`,h:{en:`A handler that talks to a router`,hi:`Router se baat karne wala handler`},body:{en:`
<p>Now the API does real work. A handler is an ordinary Python function, so it can do anything a script can do, including opening an SSH session to a router with the <code>ConnectHandler</code> you know from <code>adv-nkmiko</code>. This chapter is step 3 of Lab 1: <code>GET /devices/{name}/interfaces</code> returns live interface state as JSON.</p>

<h3>The inventory stays outside the route</h3>
<p><code>inventory.py</code> is already on AUTO01. It knows the devices and builds the keyword arguments for <code>ConnectHandler</code>:</p>
<pre class="code">"""inventory.py - the devices our API may talk to. The password comes from the environment, never from this file."""
import os

USER = os.environ.get("NET_USER", "netops")
PASSWORD = os.environ.get("NET_PASSWORD", "")

DEVICES = {
    "R1": {"host": "10.99.0.1", "device_type": "cisco_ios", "role": "core"},
    "R2": {"host": "10.99.0.2", "device_type": "cisco_ios", "role": "edge"},
    "R3": {"host": "10.99.0.3", "device_type": "cisco_ios", "role": "spare"},
}


def params(name):
    """Keyword arguments for ConnectHandler, built from the inventory and the environment."""
    d = DEVICES[name]
    return {"device_type": d["device_type"], "host": d["host"], "username": USER,
            "password": PASSWORD, "secret": PASSWORD}</pre>
<p>The user name and the password come from the <b>environment</b> (<code>py-secrets</code>), so this file can be shared and committed. The password variable is empty unless you export it; with an empty password the router refuses the login and netmiko raises an authentication exception. R3 is in the inventory but not racked; you will use it as the broken router in chapter 7.</p>

<h3>The handler</h3>
<pre class="code">"""api.py - our own automation API"""
from fastapi import FastAPI, HT&#84;PException
from netmiko import ConnectHandler

from inventory import DEVICES, params
from models import InterfaceOut

app = FastAPI(title="NK Network API", version="1.0")


def get_device(name: str) -&gt; dict:
    if name not in DEVICES:
        raise HT&#84;PException(status_code=404, detail="unknown device " + name)
    return params(name)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/devices/{name}/interfaces", response_model=list[InterfaceOut])
def interfaces(name: str):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        return conn.send_command("show ip interface brief", use_textfsm=True)</pre><div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="A handler that reads a router"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">get_device</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">inventory, 404</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">ConnectHandler</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">SSH session</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">send_command</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">use_textfsm</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">rows</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">list of dicts</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">response_model</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">InterfaceOut</text></svg></div>
<p>Read the route line first: <code>response_model=list[InterfaceOut]</code> says the answer is a list of the model you wrote in chapter 3. Then the function body, line by line:</p>
<ul>
<li><code>get_device(name)</code> looks the name up and raises <code>HT&#84;PException(404)</code> if it is unknown, before any network traffic. The path parameter <code>name</code> arrives as a string.</li>
<li><code>ConnectHandler(**dev)</code> unpacks the dictionary into keyword arguments; <code>with</code> closes the session when the block ends, even after an error.</li>
<li><code>send_command(..., use_textfsm=True)</code> parses the CLI text into a list of dictionaries with the keys <code>interface</code>, <code>ip_address</code>, <code>status</code>, <code>proto</code> (the TextFSM template of <code>py-textfsm</code>).</li>
<li>FastAPI validates every dictionary against <code>InterfaceOut</code> and sends the list as JSON.</li>
</ul>
<p>The function is a plain <code>def</code>, as chapter 2 explained: netmiko blocks, so FastAPI runs the handler in a worker thread and other requests keep flowing.</p>

<h3>Run it</h3>
<pre class="code"><span class="c"># password from the environment, then restart</span>
export NET_PASSWORD='NK@2026'
pkill -f uvicorn
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre><pre class="code">from apiclient import call

for name in ("R1", "R2"):
    r = call("GET", "/devices/%s/interfaces" % name)
    print(name, r.status_code)
    for row in r.json():
        print("  %-20s %-14s %s/%s" % (row["interface"], row["ip_address"], row["status"], row["proto"]))</pre><pre class="out">AUTO01$ python3 show.py
R1 200
  GigabitEthernet0/0   10.99.0.1      up/up
  GigabitEthernet0/1   172.16.10.1    down/down
  GigabitEthernet0/2   unassigned     administratively down/down
  GigabitEthernet0/3   unassigned     administratively down/down
R2 200
  GigabitEthernet0/0   10.99.0.2      up/up
<span class="hl">  GigabitEthernet0/1   172.16.20.1    down/down</span>
  GigabitEthernet0/2   unassigned     administratively down/down
  GigabitEthernet0/3   unassigned     administratively down/down</pre><pre class="out">AUTO01$ curl -s localhost:8000/devices/R9/interfaces
<span class="hl">{"detail":"unknown device R9"}</span></pre>
<p><code>show.py</code> uses the helper <code>apiclient.py</code> and calls the API for R1 and R2, which is exactly what a portal would do. The unknown name never reached a router: the 404 came from <code>get_device</code>. Notice that nothing in <code>show.py</code> knows an SSH password.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> The calls, the keys and the output are what real netmiko with ntc-templates returns for this command; on a real machine install <code>ntc-templates</code> and keep it current, because the key names depend on the template version. In the lab an SSH session is instant. On real routers a login takes a second or more, so for a busy API you would add <code>conn_timeout</code>, cache read-only answers for a few seconds, or keep one worker per device.</p></div>

<div class="warn"><p><b>Common mistake.</b> Opening the <code>ConnectHandler</code> at the top of <code>api.py</code>, at import time. The connection is created once, shared between threads and dead after the first idle timeout. Open the session <b>inside</b> the handler (one per request) and close it with <code>with</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Blocking code (netmiko, <code>requests</code>, <code>time.sleep</code>) belongs in a plain <code>def</code> handler. In an <code>async def</code> handler it freezes the event loop and every other request waits.</p></div>

<div class="scn"><h4>The API that froze</h4><p>A team wrote every route as <code>async def</code> because the tutorial did. One branch router answered slowly (twenty seconds per login). During those twenty seconds <code>/health</code> did not answer either, the load balancer marked the service dead and restarted it. Changing the handlers to plain <code>def</code> moved the SSH sessions to worker threads and the health check answered again.</p><p><b>Lesson:</b> one blocking call in an event loop stops the whole service.</p></div>

<div class="iv"><p class="q">"How do you call network devices from a FastAPI handler without blocking the API?"</p><p>Write the handler as a plain <code>def</code> so FastAPI runs it in its thread pool, open the SSH session inside the handler with a timeout, and map device failures to 502 instead of letting them become 500. For a heavy read load I would add a short cache or a background poller that the route reads from, so a request never waits for a router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A handler is an ordinary function: look the device up, open the session, run the command, return the rows.</li>
<li>Keep the inventory and the password outside the route; read the password from the environment.</li>
<li><code>use_textfsm=True</code> gives dictionaries that <code>response_model</code> can validate.</li>
<li>Use <code>with ConnectHandler(**dev)</code> inside the handler, one session per request.</li>
<li>Blocking libraries go in plain <code>def</code> handlers.</li>
</ul></div>
`,hi:`
<p>Ab API asli kaam karti hai. Handler ek normal Python function hai, isliye woh woh sab kar sakta hai jo script kar sakti hai, jisme router par SSH session kholna bhi hai, wahi <code>ConnectHandler</code> se jo aap <code>adv-nkmiko</code> se jaante ho. Yeh chapter Lab 1 ka step 3 hai: <code>GET /devices/{name}/interfaces</code> live interface state JSON mein lautata hai.</p>

<h3>Inventory route se bahar rehti hai</h3>
<p><code>inventory.py</code> AUTO01 par pehle se hai. Woh devices jaanti hai aur <code>ConnectHandler</code> ke keyword arguments banati hai:</p>
<pre class="code">"""inventory.py - the devices our API may talk to. The password comes from the environment, never from this file."""
import os

USER = os.environ.get("NET_USER", "netops")
PASSWORD = os.environ.get("NET_PASSWORD", "")

DEVICES = {
    "R1": {"host": "10.99.0.1", "device_type": "cisco_ios", "role": "core"},
    "R2": {"host": "10.99.0.2", "device_type": "cisco_ios", "role": "edge"},
    "R3": {"host": "10.99.0.3", "device_type": "cisco_ios", "role": "spare"},
}


def params(name):
    """Keyword arguments for ConnectHandler, built from the inventory and the environment."""
    d = DEVICES[name]
    return {"device_type": d["device_type"], "host": d["host"], "username": USER,
            "password": PASSWORD, "secret": PASSWORD}</pre>
<p>User name aur password <b>environment</b> se aate hain (<code>py-secrets</code>), isliye yeh file share ya commit ho sakti hai. Password variable khaali rehta hai jab tak aap use export na karo; khaali password par router login refuse karta hai aur netmiko authentication exception raise karta hai. R3 inventory mein hai par rack nahi hua; chapter 7 mein use kharab router ki tarah use karoge.</p>

<h3>Handler</h3>
<pre class="code">"""api.py - our own automation API"""
from fastapi import FastAPI, HT&#84;PException
from netmiko import ConnectHandler

from inventory import DEVICES, params
from models import InterfaceOut

app = FastAPI(title="NK Network API", version="1.0")


def get_device(name: str) -&gt; dict:
    if name not in DEVICES:
        raise HT&#84;PException(status_code=404, detail="unknown device " + name)
    return params(name)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/devices/{name}/interfaces", response_model=list[InterfaceOut])
def interfaces(name: str):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        return conn.send_command("show ip interface brief", use_textfsm=True)</pre><div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Router padhne wala handler"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">get_device</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">inventory, 404</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">ConnectHandler</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">SSH session</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">send_command</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">use_textfsm</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">rows</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">dicts ki list</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">response_model</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">InterfaceOut</text></svg></div>
<p>Pehle route line padho: <code>response_model=list[InterfaceOut]</code> kehta hai ki jawab us model ki list hai jo aapne chapter 3 mein likha. Phir function body, line by line:</p>
<ul>
<li><code>get_device(name)</code> naam dhoondhta hai aur unknown ho to koi network traffic se pehle <code>HT&#84;PException(404)</code> raise karta hai. Path parameter <code>name</code> string ki tarah aata hai.</li>
<li><code>ConnectHandler(**dev)</code> dictionary ko keyword arguments mein kholta hai; <code>with</code> block ke ant mein, error ke baad bhi, session band karta hai.</li>
<li><code>send_command(..., use_textfsm=True)</code> CLI text ko dictionaries ki list mein parse karta hai jiski keys <code>interface</code>, <code>ip_address</code>, <code>status</code>, <code>proto</code> hain (<code>py-textfsm</code> ka TextFSM template).</li>
<li>FastAPI har dictionary ko <code>InterfaceOut</code> se validate karta hai aur list ko JSON mein bhejta hai.</li>
</ul>
<p>Function plain <code>def</code> hai, jaisa chapter 2 ne samjhaya: netmiko block karta hai, isliye FastAPI handler ko worker thread mein chalata hai aur doosri requests chalti rehti hain.</p>

<h3>Chalao</h3>
<pre class="code"><span class="c"># password from the environment, then restart</span>
export NET_PASSWORD='NK@2026'
pkill -f uvicorn
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre><pre class="code">from apiclient import call

for name in ("R1", "R2"):
    r = call("GET", "/devices/%s/interfaces" % name)
    print(name, r.status_code)
    for row in r.json():
        print("  %-20s %-14s %s/%s" % (row["interface"], row["ip_address"], row["status"], row["proto"]))</pre><pre class="out">AUTO01$ python3 show.py
R1 200
  GigabitEthernet0/0   10.99.0.1      up/up
  GigabitEthernet0/1   172.16.10.1    down/down
  GigabitEthernet0/2   unassigned     administratively down/down
  GigabitEthernet0/3   unassigned     administratively down/down
R2 200
  GigabitEthernet0/0   10.99.0.2      up/up
<span class="hl">  GigabitEthernet0/1   172.16.20.1    down/down</span>
  GigabitEthernet0/2   unassigned     administratively down/down
  GigabitEthernet0/3   unassigned     administratively down/down</pre><pre class="out">AUTO01$ curl -s localhost:8000/devices/R9/interfaces
<span class="hl">{"detail":"unknown device R9"}</span></pre>
<p><code>show.py</code> helper <code>apiclient.py</code> use karti hai aur R1 aur R2 ke liye API bulati hai, bilkul jaise portal karta. Unknown naam kisi router tak nahi pahuncha: 404 <code>get_device</code> se aaya. Dhyan do ki <code>show.py</code> ko koi SSH password nahi pata.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Calls, keys aur output wahi hain jo asli netmiko aur ntc-templates is command ke liye lautate hain; asli machine par <code>ntc-templates</code> install karo aur updated rakho, kyunki key names template version par depend karte hain. Lab mein SSH session turant hota hai. Asli routers par login mein ek second ya zyada lagta hai, isliye busy API ke liye <code>conn_timeout</code> lagao, read-only jawab kuch seconds cache karo, ya har device ke liye ek worker rakho.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>ConnectHandler</code> ko <code>api.py</code> ke top par, import time par kholna. Connection ek baar banta hai, threads ke beech share hota hai aur pehle idle timeout ke baad mar jaata hai. Session handler ke <b>andar</b> kholo (har request ke liye ek) aur <code>with</code> se band karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Blocking code (netmiko, <code>requests</code>, <code>time.sleep</code>) plain <code>def</code> handler mein hota hai. <code>async def</code> handler mein woh event loop freeze kar deta hai aur baaki sab requests intezaar karti hain.</p></div>

<div class="scn"><h4>Woh API jo jam gayi</h4><p>Ek team ne har route <code>async def</code> likha kyunki tutorial mein tha. Ek branch router dheere jawab deta tha (login mein bees second). Un bees secondon mein <code>/health</code> bhi jawab nahi deta tha, load balancer ne service ko dead maana aur restart kar diya. Handlers ko plain <code>def</code> karne se SSH sessions worker threads mein chale gaye aur health check phir jawab dene laga.</p><p><b>Lesson:</b> event loop mein ek blocking call poori service rok deti hai.</p></div>

<div class="iv"><p class="q">"FastAPI handler se network devices ko API block kiye bina kaise bulate ho?"</p><p>Handler ko plain <code>def</code> likhta hoon taaki FastAPI use apne thread pool mein chalaye, SSH session handler ke andar timeout ke saath kholta hoon, aur device failures ko 500 banne dene ki jagah 502 mein map karta hoon. Bhaari read load ke liye chhota cache ya background poller lagaunga jisse route padhe, taaki request kabhi router ka intezaar na kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handler normal function hai: device dhoondho, session kholo, command chalao, rows lautao.</li>
<li>Inventory aur password route se bahar rakho; password environment se padho.</li>
<li><code>use_textfsm=True</code> aisi dictionaries deta hai jinhe <code>response_model</code> validate kar sake.</li>
<li>Handler ke andar <code>with ConnectHandler(**dev)</code> use karo, har request ke liye ek session.</li>
<li>Blocking libraries plain <code>def</code> handlers mein jaati hain.</li>
</ul></div>
`}};export{e as default};