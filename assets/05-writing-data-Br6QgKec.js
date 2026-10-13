var e={id:`writing-data`,h:{en:`Changing the router: PATCH, PUT, POST, DELETE`,hi:`Router badalna: PATCH, PUT, POST, DELETE`},body:{en:`

<p>So far we only read. To change a router you send a <b>body</b>. With requests you do not write JSON text. You write a Python dictionary and pass it as <code>json=</code>. The library converts it, so the typical JSON mistakes (single quotes, trailing commas) disappear.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="json= turns your dictionary into correct JSON, so you never type quotes by hand."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="95" y="77" text-anchor="middle" class="svg-ink" font-size="14">body = { ... }</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="12">Python dictionary</text><rect x="250" y="40" width="140" height="80" rx="10" fill="#fde68a"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="14">json=body</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">requests converts</text><rect x="460" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="545" y="77" text-anchor="middle" class="svg-ink" font-size="14">JSON text</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="12">{"a": true}</text><line x1="180" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="390" y1="80" x2="460" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="13">True -&gt; true     None -&gt; null     'text' -&gt; "text"</text></svg><p class="cap">json= turns your dictionary into correct JSON, so you never type quotes by hand.</p></div>

<h3>PATCH: change one value</h3>
<p>This script sets the description on GigabitEthernet0/1, then reads it back. Note <code>%2F</code> in the URL: the slash inside the interface name must be escaped, exactly as in the REST module.</p>
<pre class="code">import requests
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
A = ("netops", "NK@2026")
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description"
body = {"ietf-interfaces:description": "WAN to Pune"}
r = requests.patch(url, auth=A, headers=H, json=body)
print(r.status_code, repr(r.text))
g = requests.get(url, auth=A, headers=H)
print(g.json())
print(g.json()["ietf-interfaces:description"])</pre><pre class="out">AUTO&gt; python3 i.py
<span class="hl">204 ''</span>
<span class="hl">{'ietf-interfaces:description': 'WAN to Pune'}</span>
<span class="hl">WAN to Pune</span></pre>
<p>Line by line: <code>H</code> and <code>A</code> are the headers and the credentials, saved once so we can reuse them. <code>body</code> is a dictionary with one key. <code>requests.patch(...)</code> sends it. The router answers <b>204 No Content</b>, so <code>r.text</code> is empty, and <code>repr()</code> shows it as <code>''</code>. The second call is a GET: it proves the new value. We still verify on the router itself:</p>
<pre class="out">R1# show interfaces description
Interface                      Status         Protocol Description
Gi0/0                          up             up       MGMT
<span class="hl">Gi0/1                          down           down     WAN to Pune</span>
Gi0/2                          admin down     down     SPARE
Gi0/3                          down           down     WAN-AIRTEL
Lo0                            up             up       </pre>

<h3>PUT, POST and DELETE</h3>
<p>The same pattern works for every verb: <code>requests.put</code>, <code>requests.post</code>, <code>requests.delete</code>. Here is the full life of a loopback. Look at what each status tells you:</p>
<pre class="code">import requests
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
A = ("netops", "NK@2026")
base = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
body = {"ietf-interfaces:interface": {"name": "Loopback60", "type": "iana-if-type:softwareLoopback", "enabled": True, "ietf-ip:ipv4": {"address": [{"ip": "192.0.2.60", "netmask": "255.255.255.255"}]}}}
url = base + "/interface=Loopback60"
r = requests.put(url, auth=A, headers=H, json=body)
print("PUT  ", r.status_code)
r = requests.put(url, auth=A, headers=H, json=body)
print("PUT  ", r.status_code)
r = requests.post(base, auth=A, headers=H, json=body)
print("POST ", r.status_code)
r = requests.delete(url, auth=A, headers=H)
print("DELETE", r.status_code)
r = requests.delete(url, auth=A, headers=H)
print("DELETE", r.status_code)</pre><pre class="out">AUTO&gt; python3 n.py
<span class="hl">PUT   201</span>
<span class="hl">PUT   204</span>
<span class="hl">POST  409</span>
<span class="hl">DELETE 204</span>
<span class="hl">DELETE 404</span></pre>
<ul>
<li>First PUT: <b>201</b>, the interface was created. PUT goes to the full address of the object (<code>.../interface=Loopback60</code>).</li>
<li>Second PUT, same data: <b>204</b>, replaced with identical content. Safe to repeat: PUT is idempotent.</li>
<li>POST of the same object: <b>409 Conflict</b>. POST goes to the <i>parent</i> (<code>base</code>) and fails because the object exists.</li>
<li>First DELETE: <b>204</b>. Second DELETE: <b>404</b>, nothing left to remove.</li>
</ul>
<p>In the body we wrote <code>True</code> (Python style). The library sends <code>true</code> (JSON style). Also, <code>base + "/interface=Loopback60"</code> joins two strings with <code>+</code> to build the URL.</p>

<div class="eg"><p><b>Worked example.</b> Change request: "Create Loopback60 with 192.0.2.60, test it, and remove it." The script above does exactly that and reports each status. A senior colleague reading the output sees at once: create worked (201), repeat is harmless (204), the POST duplicate was refused (409) and the cleanup worked (204). The documentation address 192.0.2.60 is safe to use in examples.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Using <code>data=body</code> instead of <code>json=body</code>: <code>data</code> sends form-style data, not JSON. (2) Forgetting the Content-Type header: RESTCONF wants <code>application/yang-data+json</code>. (3) Using PUT with only part of the object, which replaces and may remove fields. (4) POSTing to the object's own address instead of its parent. (5) Stopping at 204 without a read-back.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json=</code> serialises a dict and sets JSON content; <code>data=</code> sends the body as given (form or raw text). PUT is idempotent; POST is not. 201 is created, 204 is success without a body, 409 is a conflict.</p></div>

<div class="scn"><h4>The PUT that was meant to be a PATCH</h4><p>A script set one description with <code>requests.put</code> and a body containing only that description. The router accepted it with 204. The interface lost its IP address, because PUT replaced the whole object. Changing <code>requests.put</code> to <code>requests.patch</code> (and pointing at the description leaf) fixed it.</p><p><b>Lesson:</b> PATCH to modify, PUT to replace. Read back after every write.</p></div>

<div class="iv"><p class="q">"How do you send a JSON body with requests?"</p><p>I build a Python dictionary and pass it with <code>json=body</code>; requests serialises it and I set the Content-Type header to the media type the API expects. Then I check the status code (201 or 204 for success) and read the data back with a GET to confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pass bodies as a dictionary with <code>json=</code>; requests writes the JSON.</li>
<li>requests.get, post, put, patch and delete mirror the HTTP verbs.</li>
<li>204 has an empty body: r.text is ''.</li>
<li>PUT repeated gives 204; POST repeated gives 409; DELETE repeated gives 404.</li>
<li>Always read back with GET and verify on the router.</li>
</ul></div>

`,hi:`

<p>Ab tak sirf padha. Router badalne ke liye aap <b>body</b> bhejte ho. requests mein aap JSON text nahi likhte. Aap Python dictionary likhte ho aur use <code>json=</code> se dete ho. Library ise badal deti hai, isliye aam JSON galtiyan (single quotes, trailing commas) gayab ho jaati hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="json= aapki dictionary ko sahi JSON bana deta hai, quotes haath se nahi likhne padte."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="95" y="77" text-anchor="middle" class="svg-ink" font-size="14">body = { ... }</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="12">Python dictionary</text><rect x="250" y="40" width="140" height="80" rx="10" fill="#fde68a"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="14">json=body</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">requests badalta hai</text><rect x="460" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="545" y="77" text-anchor="middle" class="svg-ink" font-size="14">JSON text</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="12">{"a": true}</text><line x1="180" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="390" y1="80" x2="460" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="13">True -&gt; true     None -&gt; null     'text' -&gt; "text"</text></svg><p class="cap">json= aapki dictionary ko sahi JSON bana deta hai, quotes haath se nahi likhne padte.</p></div>

<h3>PATCH: ek value badlo</h3>
<p>Yeh script GigabitEthernet0/1 ka description set karti hai, phir wapas padhti hai. URL mein <code>%2F</code> dekho: interface naam ke andar ke slash ko escape karna padta hai, bilkul REST module ki tarah.</p>
<pre class="code">import requests
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
A = ("netops", "NK@2026")
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description"
body = {"ietf-interfaces:description": "WAN to Pune"}
r = requests.patch(url, auth=A, headers=H, json=body)
print(r.status_code, repr(r.text))
g = requests.get(url, auth=A, headers=H)
print(g.json())
print(g.json()["ietf-interfaces:description"])</pre><pre class="out">AUTO&gt; python3 i.py
<span class="hl">204 ''</span>
<span class="hl">{'ietf-interfaces:description': 'WAN to Pune'}</span>
<span class="hl">WAN to Pune</span></pre>
<p>Line by line: <code>H</code> aur <code>A</code> headers aur credentials hain, ek baar save kiye taaki dobara use ho sakein. <code>body</code> ek key wali dictionary hai. <code>requests.patch(...)</code> use bhejta hai. Router <b>204 No Content</b> deta hai, isliye <code>r.text</code> khaali hai, aur <code>repr()</code> use <code>''</code> dikhata hai. Doosri call GET hai: nayi value ka saboot. Phir bhi router par khud verify karte hain:</p>
<pre class="out">R1# show interfaces description
Interface                      Status         Protocol Description
Gi0/0                          up             up       MGMT
<span class="hl">Gi0/1                          down           down     WAN to Pune</span>
Gi0/2                          admin down     down     SPARE
Gi0/3                          down           down     WAN-AIRTEL
Lo0                            up             up       </pre>

<h3>PUT, POST aur DELETE</h3>
<p>Wahi pattern har verb ke liye: <code>requests.put</code>, <code>requests.post</code>, <code>requests.delete</code>. Yeh loopback ki poori zindagi hai. Dekho har status kya batata hai:</p>
<pre class="code">import requests
H = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
A = ("netops", "NK@2026")
base = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
body = {"ietf-interfaces:interface": {"name": "Loopback60", "type": "iana-if-type:softwareLoopback", "enabled": True, "ietf-ip:ipv4": {"address": [{"ip": "192.0.2.60", "netmask": "255.255.255.255"}]}}}
url = base + "/interface=Loopback60"
r = requests.put(url, auth=A, headers=H, json=body)
print("PUT  ", r.status_code)
r = requests.put(url, auth=A, headers=H, json=body)
print("PUT  ", r.status_code)
r = requests.post(base, auth=A, headers=H, json=body)
print("POST ", r.status_code)
r = requests.delete(url, auth=A, headers=H)
print("DELETE", r.status_code)
r = requests.delete(url, auth=A, headers=H)
print("DELETE", r.status_code)</pre><pre class="out">AUTO&gt; python3 n.py
<span class="hl">PUT   201</span>
<span class="hl">PUT   204</span>
<span class="hl">POST  409</span>
<span class="hl">DELETE 204</span>
<span class="hl">DELETE 404</span></pre>
<ul>
<li>Pehla PUT: <b>201</b>, interface ban gaya. PUT object ke poore address par jaata hai (<code>.../interface=Loopback60</code>).</li>
<li>Doosra PUT, wahi data: <b>204</b>, ek jaisa content se replace hua. Dohrana safe: PUT idempotent hai.</li>
<li>Usi object ka POST: <b>409 Conflict</b>. POST <i>parent</i> (<code>base</code>) par jaata hai aur fail hota hai kyunki object hai.</li>
<li>Pehla DELETE: <b>204</b>. Doosra DELETE: <b>404</b>, hatane ko kuch nahi bacha.</li>
</ul>
<p>Body mein humne <code>True</code> (Python style) likha. Library <code>true</code> (JSON style) bhejti hai. Aur <code>base + "/interface=Loopback60"</code> do strings ko <code>+</code> se jodkar URL banata hai.</p>

<div class="eg"><p><b>Worked example.</b> Change request: "Loopback60 192.0.2.60 ke saath banao, test karo, aur hata do." Upar ki script yahi karti hai aur har status report karti hai. Output padhne wala senior ek nazar mein dekhta hai: create chala (201), dohrana harmless (204), POST duplicate refuse hua (409) aur cleanup chala (204). Documentation address 192.0.2.60 examples mein safe hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>json=body</code> ki jagah <code>data=body</code> use karna: <code>data</code> form-style data bhejta hai, JSON nahi. (2) Content-Type header bhool jaana: RESTCONF ko <code>application/yang-data+json</code> chahiye. (3) Adhoore object ke saath PUT, jo replace karta hai aur fields hata sakta hai. (4) Object ke apne address par POST, parent par nahi. (5) 204 par ruk jaana, read-back ke bina.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>json=</code> dict ko serialise karta hai aur JSON content set karta hai; <code>data=</code> body jaisi hai waisi bhejta hai (form ya raw text). PUT idempotent hai; POST nahi. 201 created, 204 bina body ke success, 409 conflict.</p></div>

<div class="scn"><h4>Woh PUT jo PATCH hona tha</h4><p>Ek script ne <code>requests.put</code> se sirf ek description wali body ke saath description set kiya. Router ne 204 ke saath accept kiya. Interface ka IP address chala gaya, kyunki PUT ne poora object replace kar diya. <code>requests.put</code> ko <code>requests.patch</code> (aur description leaf par point) karne se theek hua.</p><p><b>Lesson:</b> badalne ke liye PATCH, replace ke liye PUT. Har write ke baad read-back karo.</p></div>

<div class="iv"><p class="q">"requests se JSON body kaise bhejte ho?"</p><p>Main Python dictionary banata hoon aur <code>json=body</code> se deta hoon; requests serialise karta hai aur main Content-Type header API ke maange media type par set karta hoon. Phir status code (success ke liye 201 ya 204) dekhta hoon aur GET se data wapas padhkar confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Body dictionary ki tarah <code>json=</code> se do; requests JSON likhta hai.</li>
<li>requests.get, post, put, patch aur delete HTTP verbs ko mirror karte hain.</li>
<li>204 ki body khaali: r.text ''.</li>
<li>PUT dohrane par 204; POST dohrane par 409; DELETE dohrane par 404.</li>
<li>Hamesha GET se read-back karo aur router par verify karo.</li>
</ul></div>

`}};export{e as default};