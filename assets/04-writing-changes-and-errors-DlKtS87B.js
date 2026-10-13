var e={id:`writing-changes-and-errors`,h:{en:`Writing changes and reading errors: PUT, POST and status codes`,hi:`Changes likhna aur errors padhna: PUT, POST aur status codes`},body:{en:`
<h3>From reading to changing</h3>
<p>Reading is safe. Writing is where automation becomes powerful and risky. A write sends a <b>JSON body</b> that describes the new settings. In this track <b>API changes apply immediately</b>: there is no candidate and no Save changes button. A wrong PUT is a live change on a live network, so go slowly and check every answer. This chapter matches lab <b>mk-api-2: change a VLAN and a firewall rule</b> and the errors of <b>mk-api-3</b>.</p>

<h3>Sending a JSON body</h3>
<p>With <code>requests</code> pass a Python dictionary to <code>json=</code>. The library converts it to JSON text and sets the right content type. Use PUT to update something that exists and POST to create something new.</p>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    HEADERS = {"Authorization": "Bearer " + f.read().strip()}

<span class="c"># change the name of Bengaluru VLAN 30 (an update, so PUT)</span>
url = BASE + "/networks/blr/appliance/vlans/30"
body = {"name": "Guest-WiFi"}
r = requests.put(url, headers=HEADERS, json=body)
print(r.status_code)
print(r.json())</pre>
<pre class="out">200
{'id': 30, 'name': <span class="hl">'Guest-WiFi'</span>, 'subnet': '10.2.30.0/24', 'applianceIp': '10.2.30.1'}</pre>
<p>The answer echoes the saved settings. The response confirms that the change is already live. (The field names in our lab examples are our own; print the real GET answer first and copy its field names.)</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Safe write loop">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 GET now</text>
<rect x="140" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Backup</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="325" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Build body</text>
<rect x="400" y="20" width="100" height="50" rx="8" fill="#fed7aa"/><text x="450" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 PUT</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 GET verify</text>
<line x1="120" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">Applies immediately: there is no Save step to undo a mistake</text>
<rect x="10" y="160" width="620" height="55" rx="8" fill="#fecaca"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Check status_code at step 4. If not 2xx, stop and read the error.</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">Keep the backup so you can PUT the old value back</text>
</svg><p class="cap">Read, back up, change, verify.</p></div>

<h3>A firewall rule example</h3>
<p>The L3 rule list is one resource. In this lab a PUT sends the <b>whole list</b>, so the safe pattern is: GET the current list, change it in Python, then PUT it back. If you PUT only your new rule, you would replace all the others.</p>
<pre class="code">url = BASE + "/networks/mum/appliance/firewall/l3Rules"

current = requests.get(url, headers=HEADERS).json()
rules = current["rules"]

<span class="c"># new rule goes FIRST: first match wins</span>
deny_guest = {
    "comment": "Guests must not reach servers",
    "policy": "deny",
    "protocol": "any",
    "srcCidr": "10.1.30.0/24",
    "destCidr": "10.1.20.0/24",
}
rules.insert(0, deny_guest)

r = requests.put(url, headers=HEADERS, json={"rules": rules})
print(r.status_code, len(r.json()["rules"]), "rules now")</pre>
<pre class="out">200 4 rules now</pre>
<p>Note <code>insert(0, ...)</code>: the order of the list is the policy (first match wins), so a deny that must act first goes at the top. Creating a new VLAN is a POST to <code>/networks/{networkId}/appliance/vlans</code> with a body that names the id, name and subnet.</p>

<h3>The error codes of this lab</h3>
<table class="cmp"><tr><th>Code</th><th>Name</th><th>Meaning here</th><th>What to check</th></tr>
<tr><td>400</td><td>Bad request</td><td>The body is wrong: bad subnet, missing field, wrong type</td><td>Read r.text; fix the JSON</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>Key missing or wrong</td><td>Header, key file, extra spaces</td></tr>
<tr><td>403</td><td>Forbidden</td><td>Known key, but API access is off or not allowed</td><td>Admins and API setting</td></tr>
<tr><td>404</td><td>Not found</td><td>Wrong path, network id or VLAN id</td><td>Ids from the GET lists, spelling</td></tr>
<tr><td>409</td><td>Conflict</td><td>The item is read-only, for example controlled by a template</td><td>Change it in the template or unbind</td></tr></table>

<pre class="out">PUT /networks/blr/appliance/vlans/10   (BLR is bound to a template)
409
{'error': 'VLAN list is controlled by the template'}</pre>

<h3>A small helper that handles errors</h3>
<pre class="code">def call(method, path, body=None):
    r = requests.request(method, BASE + path, headers=HEADERS, json=body)
    if r.status_code in (200, 201):
        return r.json()
    meaning = {400: "bad body", 401: "bad key", 403: "API access off",
               404: "wrong id or path", 409: "read-only (template?)"}
    print(method, path, "->", r.status_code, meaning.get(r.status_code, "other"))
    print(r.text)
    return None</pre>

<div class="eg"><p><b>Worked example.</b> The script PUTs a new name to <code>/networks/del/appliance/vlans/30</code> and gets 404. The engineer prints the network list and sees the id is <code>del</code>, but the script had <code>delhi</code>. Fixed spelling gives 200. Another run on a template-bound network returns 409: the engineer changes the template instead of fighting the lock.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> A VLAN PUT changes the VLAN's name, subnet or appliance address on the MX: it can renumber a LAN. A firewall PUT changes the policy list and the order in which rules are checked. Both are live at once. A 4xx answer means nothing was changed.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Sending only one rule when the PUT replaces the list; putting a deny below a broad allow; ignoring the status code; testing on production first; retrying a POST that did succeed and creating a duplicate.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 is about who you are, 403 about what you may do, 404 about what you asked for, 400 about how you asked it and 409 about the current state of the item.</p></div>

<div class="scn"><h4>The deleted rules</h4><p>An engineer wrote a script to add one deny rule and sent a PUT with just that rule. The call returned 200 and the firewall lost all other rules. Because the script had saved a backup of the GET answer, the old list was restored in a minute. The team then added "GET, backup, insert, PUT, verify" to the script template.</p><p><b>Lesson:</b> know whether a PUT replaces or merges, and keep a backup.</p></div>

<div class="iv"><p class="q">"What is the difference between 401, 403 and 404?"</p><p>Strong answer: 401 means the server does not know who you are (missing or wrong key); 403 means it knows you but you are not allowed (API disabled or no rights); 404 means the path or id does not exist. Add 400 (bad body) and 409 (conflict with current state, such as a read-only item).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pass a dictionary with json=; PUT updates, POST creates.</li>
<li>API changes apply immediately here, so back up first and verify after.</li>
<li>List-style PUT replaces the whole list: GET, edit, PUT.</li>
<li>400 body, 401 key, 403 not allowed, 404 not found, 409 conflict.</li>
<li>A 4xx answer means nothing changed; read r.text for the reason.</li>
</ul></div>
`,hi:`
<h3>Padhne se badalne tak</h3>
<p>Padhna safe hai. Likhna wahan hai jahan automation powerful aur risky dono ho jaati hai. Write ek <b>JSON body</b> bhejta hai jo nayi settings describe karti hai. Is track mein <b>API changes turant apply hote hain</b>: koi candidate nahi aur koi Save changes button nahi. Galat PUT live network par live change hai, isliye dheere chalo aur har jawab check karo. Yeh chapter lab <b>mk-api-2: VLAN aur firewall rule badlo</b> aur <b>mk-api-3</b> ke errors se match karta hai.</p>

<h3>JSON body bhejna</h3>
<p><code>requests</code> ke saath Python dictionary ko <code>json=</code> mein do. Library use JSON text mein badal deti hai aur sahi content type set karti hai. Jo maujood hai use update karne ke liye PUT use karo aur kuch naya banane ke liye POST.</p>
<pre class="code">import requests

BASE = "h&#116;tps://203.0.113.80/api/v1"
with open("key.txt") as f:
    HEADERS = {"Authorization": "Bearer " + f.read().strip()}

<span class="c"># Bengaluru VLAN 30 ka naam badlo (update hai, to PUT)</span>
url = BASE + "/networks/blr/appliance/vlans/30"
body = {"name": "Guest-WiFi"}
r = requests.put(url, headers=HEADERS, json=body)
print(r.status_code)
print(r.json())</pre>
<pre class="out">200
{'id': 30, 'name': <span class="hl">'Guest-WiFi'</span>, 'subnet': '10.2.30.0/24', 'applianceIp': '10.2.30.1'}</pre>
<p>Jawab saved settings ko echo karta hai. Response confirm karta hai ki change pehle se live hai. (Humare lab examples ke field names apne hain; pehle asli GET jawab print karo aur uske field names copy karo.)</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Safe write loop">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 GET now</text>
<rect x="140" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="195" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Backup</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="325" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Body banao</text>
<rect x="400" y="20" width="100" height="50" rx="8" fill="#fed7aa"/><text x="450" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 PUT</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 GET verify</text>
<line x1="120" y1="45" x2="140" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="100" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">Turant apply hota hai: galti undo karne ke liye Save step nahi</text>
<rect x="10" y="160" width="620" height="55" rx="8" fill="#fecaca"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Step 4 par status_code check karo. 2xx nahi to ruko aur error padho.</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">Backup rakho taaki purani value wapas PUT kar sako</text>
</svg><p class="cap">Padho, backup lo, badlo, verify karo.</p></div>

<h3>Firewall rule ka example</h3>
<p>L3 rule list ek hi resource hai. Is lab mein PUT <b>poori list</b> bhejta hai, isliye safe pattern yeh hai: current list GET karo, Python mein badlo, phir wapas PUT karo. Agar aap sirf apna naya rule PUT karoge to baaki sab replace ho jayenge.</p>
<pre class="code">url = BASE + "/networks/mum/appliance/firewall/l3Rules"

current = requests.get(url, headers=HEADERS).json()
rules = current["rules"]

<span class="c"># naya rule SABSE PEHLE: pehla match jeetta hai</span>
deny_guest = {
    "comment": "Guests must not reach servers",
    "policy": "deny",
    "protocol": "any",
    "srcCidr": "10.1.30.0/24",
    "destCidr": "10.1.20.0/24",
}
rules.insert(0, deny_guest)

r = requests.put(url, headers=HEADERS, json={"rules": rules})
print(r.status_code, len(r.json()["rules"]), "rules now")</pre>
<pre class="out">200 4 rules now</pre>
<p><code>insert(0, ...)</code> note karo: list ka order hi policy hai (pehla match jeetta hai), isliye jo deny pehle kaam kare use top par rakho. Naya VLAN banana <code>/networks/{networkId}/appliance/vlans</code> par POST hai, aisi body ke saath jo id, name aur subnet batati hai.</p>

<h3>Is lab ke error codes</h3>
<table class="cmp"><tr><th>Code</th><th>Naam</th><th>Yahan matlab</th><th>Kya check karo</th></tr>
<tr><td>400</td><td>Bad request</td><td>Body galat: bad subnet, field missing, galat type</td><td>r.text padho; JSON fix karo</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>Key missing ya galat</td><td>Header, key file, extra spaces</td></tr>
<tr><td>403</td><td>Forbidden</td><td>Key jaani-pehchani, lekin API access off ya allowed nahi</td><td>Admins and API setting</td></tr>
<tr><td>404</td><td>Not found</td><td>Galat path, network id ya VLAN id</td><td>GET lists ki ids, spelling</td></tr>
<tr><td>409</td><td>Conflict</td><td>Item read-only hai, jaise template se controlled</td><td>Template mein badlo ya unbind karo</td></tr></table>

<pre class="out">PUT /networks/blr/appliance/vlans/10   (BLR ek template se bound hai)
409
{'error': 'VLAN list is controlled by the template'}</pre>

<h3>Errors handle karne wala chhota helper</h3>
<pre class="code">def call(method, path, body=None):
    r = requests.request(method, BASE + path, headers=HEADERS, json=body)
    if r.status_code in (200, 201):
        return r.json()
    meaning = {400: "bad body", 401: "bad key", 403: "API access off",
               404: "wrong id or path", 409: "read-only (template?)"}
    print(method, path, "->", r.status_code, meaning.get(r.status_code, "other"))
    print(r.text)
    return None</pre>

<div class="eg"><p><b>Worked example.</b> Script <code>/networks/del/appliance/vlans/30</code> par naya naam PUT karti hai aur 404 paati hai. Engineer network list print karta hai aur dekhta hai ki id <code>del</code> hai, lekin script mein <code>delhi</code> tha. Spelling theek karne par 200 aata hai. Template-bound network par doosra run 409 deta hai: engineer lock se ladne ke bajay template badalta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> VLAN PUT MX par VLAN ka naam, subnet ya appliance address badalta hai: yeh LAN renumber kar sakta hai. Firewall PUT policy list aur rules check hone ka order badalta hai. Dono turant live. 4xx jawab ka matlab kuch nahi badla.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Jab PUT list replace karta hai tab sirf ek rule bhejna; deny ko broad allow ke neeche rakhna; status code ignore karna; pehle production par test karna; jo POST succeed ho gaya use retry karke duplicate banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 aap kaun ho uske baare mein hai, 403 aap kya kar sakte ho, 404 aapne kya maanga, 400 aapne kaise maanga aur 409 item ki current state ke baare mein.</p></div>

<div class="scn"><h4>Delete hue rules</h4><p>Ek engineer ne ek deny rule jodne ki script likhi aur sirf wahi rule PUT kiya. Call ne 200 diya aur firewall ke baaki saare rules chale gaye. Kyunki script ne GET jawab ka backup save kiya tha, purani list ek minute mein restore ho gayi. Phir team ne script template mein "GET, backup, insert, PUT, verify" jodh diya.</p><p><b>Seekh:</b> jaano ki PUT replace karta hai ya merge, aur backup rakho.</p></div>

<div class="iv"><p class="q">"401, 403 aur 404 mein kya fark hai?"</p><p>Strong answer: 401 ka matlab server nahi jaanta aap kaun ho (key missing ya galat); 403 ka matlab jaanta hai lekin aap allowed nahi (API disabled ya rights nahi); 404 ka matlab path ya id exist nahi karti. Saath mein 400 (bad body) aur 409 (current state se conflict, jaise read-only item) jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>json= ke saath dictionary do; PUT update karta hai, POST banata hai.</li>
<li>Yahan API changes turant apply hote hain, isliye pehle backup lo aur baad mein verify karo.</li>
<li>List-style PUT poori list replace karta hai: GET, edit, PUT.</li>
<li>400 body, 401 key, 403 not allowed, 404 not found, 409 conflict.</li>
<li>4xx jawab ka matlab kuch nahi badla; wajah ke liye r.text padho.</li>
</ul></div>
`}};export{e as default};