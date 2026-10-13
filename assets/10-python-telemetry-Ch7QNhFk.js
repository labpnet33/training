var e={id:`python-telemetry`,h:{en:`Python against RESTCONF, and model-driven telemetry`,hi:`RESTCONF ke against Python, aur model-driven telemetry`},body:{en:`
<p>A TV remote lets you change the channel without walking to the TV. A Python script is a remote control for the controller: the same buttons (GET, PATCH) but pressed by a program, so it can press them 500 times without getting bored. This chapter covers lab 5, where a script hides an SSID, and then explains <b>model-driven telemetry</b>, where the controller pushes data to you instead of you asking for it. The script is hands-on in the lab (it runs in the lab interpreter against the simulated controller); streaming telemetry, gNMI and dial-out are concept only.</p>

<h3>The requests library in four lines</h3>
<p>Python's <code>requests</code> library sends web requests. For RESTCONF you need: the URL, the headers, the credentials, and for a write the body. The controller returns a <b>status code</b> and, for reads, JSON that <code>r.json()</code> turns into a Python dictionary.</p>
<pre class="code"><span class="c"># ssid.py - hide the NK-STAFF SSID through the RESTCONF API of WLC1</span>
import requests
requests.packages.urllib3.disable_warnings()     <span class="c"># lab controllers use self-signed certificates</span>

URL = "h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF"
HEADERS = {"Accept": "application/yang-data+json", "Content-Type": "application/yang-data+json"}
AUTH = ("netops", "wrong-password")              <span class="c"># (username, password)</span>
BODY = {"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry": {"profile-name": "NK-STAFF", "wlan-status": True, "broadcast-ssid": False}}

r = requests.patch(URL, auth=AUTH, headers=HEADERS, json=BODY, verify=False)
print("Status:", r.status_code)</pre>
<p>Read it line by line. <code>auth=AUTH</code> sends the username and password with every request. <code>json=BODY</code> converts the Python dictionary into JSON (and note Python writes <code>True</code> and <code>False</code>, JSON writes <code>true</code> and <code>false</code>; the library converts them). <code>verify=False</code> skips certificate checking because the lab uses a self-signed certificate. In production you should keep verification on and give <code>requests</code> your CA certificate, because skipping it lets someone in the middle impersonate the controller.</p>

<h3>Lab 5: run, read, fix, run</h3>
<ol>
<li>On ADMIN1 run <code>python3 ssid.py</code> as shipped and read the status code.</li>
<li>Fix the credentials line, using the edit command, then run again.</li>
<li>Prove the controller changed.</li>
</ol>
<pre class="out">ADMIN1$ python3 ssid.py
Status: <span class="hl">401</span>

ADMIN1$ edit ssid.py 7 AUTH = ("netops", "NkApi@2026")
ADMIN1$ python3 ssid.py
Status: <span class="hl">204</span>

WLC1# show running-config | section wlan NK-STAFF
wlan NK-STAFF 1 NK-STAFF
 no broadcast-ssid
 ...
 no shutdown</pre>
<p>WLC1 is already prepared for API access in this lab (user, secure server, local authentication, RESTCONF). The 401 comes from the wrong password, which matches chapter 11: 401 means "who are you" failed. The web UI shows the same value under <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF</b>. The service you call is the one switched on under <b>Administration &gt; Management &gt; RESTCONF</b>.</p>

<h3>Writing a script you can trust</h3>
<ul>
<li><b>Check the status code.</b> <code>r.raise_for_status()</code> turns 4xx and 5xx into exceptions so the script cannot ignore them.</li>
<li><b>Read back.</b> After a PATCH, GET the object and compare it with what you intended.</li>
<li><b>Do not hard-code passwords.</b> Read them from environment variables or a secret store, never commit them.</li>
<li><b>Be idempotent.</b> Running the script twice should give the same result; PATCH with the same values is safe.</li>
<li><b>Set a timeout</b> (<code>timeout=10</code>) so a dead controller does not hang the script.</li>
<li><b>Go one controller at a time</b> and stop on the first failure when changes are risky.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A 60-controller loop with a 10-second timeout and a stop-on-failure rule. The first 8 controllers answer 204 and the read-back matches. Controller 9 answers 409 because its WLAN was enabled by an older template and the body lacked wlan-status. The script stops, prints the controller name and status, and leaves 51 controllers untouched until you fix the body.</p></div>

<h3>Model-driven telemetry (concept only)</h3>
<p>Polling asks "what is your CPU?" every minute for every device, which is slow and wasteful. <b>Model-driven telemetry</b> lets the controller <b>push</b> chosen YANG data on a schedule (periodic) or when it changes (on-change). Two styles exist:</p>
<ul>
<li><b>Dial-in</b>: the collector connects to the controller (NETCONF or gNMI) and subscribes.</li>
<li><b>Dial-out</b>: the controller connects out to the collector, usually with gRPC, and streams. It copes better with firewalls and scale, and is the model used by platforms such as Catalyst Center.</li>
</ul>
<p><b>gNMI</b> is a gRPC-based protocol for config and telemetry with subscription support. A subscription says what to stream (an XPath into the YANG model), how often, how to encode it, and where to send it. On IOS XE the configuration looks like this (concept only; the lab has no telemetry engine and prints no subscription state):</p>
<pre class="code"><span class="c">! shape of a dial-out subscription, concept only</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /wireless-client-oper:client-oper-data/common-oper-data
 source-address 10.10.99.10
 stream yang-push
 update-policy periodic 6000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp</pre>
<p>The periodic update value is in hundredths of a second, so 6000 means every 60 seconds. Exact filters, module names and options vary by release, so check the current guide before using them. A collector (for example open-source tools or Catalyst Center) stores the stream in a time-series database so you can graph client counts, AP load and more, with far less delay than SNMP polling.</p>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>verify=False</code> and a hard-coded password in a script that goes into a shared repository. That is two security problems in one file.</p></div>

<div class="exam"><p><b>Exam trap.</b> Polling is pull; telemetry is push. Dial-out means the device initiates the connection. gNMI is not NETCONF. And a Python dictionary uses <code>True</code>, JSON uses <code>true</code>.</p></div>

<div class="scn"><h4>Fifty controllers, one weak password</h4><p>A script changed a WLAN on fifty controllers and worked for months. An audit found the script file held the admin password in plain text and had verify disabled. The team moved the secret to a vault, enabled certificate checking, restricted the script account to the API role, and added a read-back step to the script.</p><p><b>Lesson:</b> automation concentrates power, so protect the credentials it uses.</p></div>

<div class="iv"><p class="q">"How would you automate a WLAN change on many controllers safely?"</p><p>Use RESTCONF with a privilege-limited account, secrets from a vault, certificate verification on, a timeout, status checks and a read-back after each change, and stop on the first failure. Mention telemetry for monitoring afterwards and say which parts you practised in a lab.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests sends RESTCONF calls: URL, headers, auth, json body; read r.status_code.</li>
<li>Lab 5 reads 401 from a wrong password, then 204 after the credentials fix.</li>
<li>Safe scripts check status, read back, avoid hard-coded secrets and keep TLS verification in production.</li>
<li>Telemetry pushes data (periodic or on-change); dial-out starts from the device.</li>
<li>Streaming telemetry and gNMI are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>TV remote aapko TV tak chalkar jaye bina channel badalne deta hai. Python script controller ka remote control hai: wahi buttons (GET, PATCH) lekin program dabata hai, isliye woh unhe 500 baar bina bore hue daba sakta hai. Yeh chapter lab 5 cover karta hai, jahan script ek SSID hide karti hai, phir <b>model-driven telemetry</b> samjhata hai, jahan controller aapke poochhne ki jagah khud data push karta hai. Script lab mein hands-on hai (woh lab interpreter mein simulated controller ke against chalti hai); streaming telemetry, gNMI aur dial-out sirf concept hain.</p>

<h3>requests library chaar lines mein</h3>
<p>Python ki <code>requests</code> library web requests bhejti hai. RESTCONF ke liye aapko chahiye: URL, headers, credentials, aur write ke liye body. Controller ek <b>status code</b> lautata hai aur reads ke liye JSON, jise <code>r.json()</code> Python dictionary banata hai.</p>
<pre class="code"><span class="c"># ssid.py - WLC1 ke RESTCONF API se NK-STAFF SSID hide karo</span>
import requests
requests.packages.urllib3.disable_warnings()     <span class="c"># lab controllers self-signed certificates use karte hain</span>

URL = "h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF"
HEADERS = {"Accept": "application/yang-data+json", "Content-Type": "application/yang-data+json"}
AUTH = ("netops", "wrong-password")              <span class="c"># (username, password)</span>
BODY = {"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry": {"profile-name": "NK-STAFF", "wlan-status": True, "broadcast-ssid": False}}

r = requests.patch(URL, auth=AUTH, headers=HEADERS, json=BODY, verify=False)
print("Status:", r.status_code)</pre>
<p>Ise line by line padho. <code>auth=AUTH</code> har request ke saath username aur password bhejta hai. <code>json=BODY</code> Python dictionary ko JSON mein badalta hai (dhyan do Python <code>True</code> aur <code>False</code> likhta hai, JSON <code>true</code> aur <code>false</code>; library convert kar deti hai). <code>verify=False</code> certificate checking skip karta hai kyunki lab self-signed certificate use karta hai. Production mein verification on rakho aur <code>requests</code> ko apna CA certificate do, kyunki skip karne se beech wala koi bhi controller ban sakta hai.</p>

<h3>Lab 5: chalao, padho, fix karo, chalao</h3>
<ol>
<li>ADMIN1 par <code>python3 ssid.py</code> jaisi hai waisi chalao aur status code padho.</li>
<li>Edit command se credentials line theek karo, phir dobara chalao.</li>
<li>Prove karo controller badla.</li>
</ol>
<pre class="out">ADMIN1$ python3 ssid.py
Status: <span class="hl">401</span>

ADMIN1$ edit ssid.py 7 AUTH = ("netops", "NkApi@2026")
ADMIN1$ python3 ssid.py
Status: <span class="hl">204</span>

WLC1# show running-config | section wlan NK-STAFF
wlan NK-STAFF 1 NK-STAFF
 no broadcast-ssid
 ...
 no shutdown</pre>
<p>Is lab mein WLC1 API access ke liye pehle se ready hai (user, secure server, local authentication, RESTCONF). 401 galat password se aata hai, jo chapter 11 se match karta hai: 401 ka matlab "aap kaun ho" fail hua. Web UI wahi value <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF</b> ke neeche dikhata hai. Jis service ko aap call karte ho woh <b>Administration &gt; Management &gt; RESTCONF</b> ke neeche on hoti hai.</p>

<h3>Aisi script likho jis par bharosa ho</h3>
<ul>
<li><b>Status code check karo.</b> <code>r.raise_for_status()</code> 4xx aur 5xx ko exceptions bana deta hai taaki script unhe ignore na kar sake.</li>
<li><b>Read back.</b> PATCH ke baad object GET karo aur apne intention se compare karo.</li>
<li><b>Passwords hard-code mat karo.</b> Environment variables ya secret store se padho, kabhi commit mat karo.</li>
<li><b>Idempotent raho.</b> Script do baar chalane par same result aana chahiye; same values ke saath PATCH safe hai.</li>
<li><b>Timeout lagao</b> (<code>timeout=10</code>) taaki dead controller script ko hang na kare.</li>
<li><b>Ek ek controller karo</b> aur risky changes par pehli failure par ruk jao.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> 60 controllers ka loop, 10-second timeout aur stop-on-failure rule ke saath. Pehle 8 controllers 204 dete hain aur read-back match karta hai. Controller 9 409 deta hai kyunki uska WLAN purane template ne enabled kar diya tha aur body mein wlan-status nahi tha. Script ruk jaati hai, controller ka naam aur status print karti hai, aur body theek hone tak 51 controllers ko chhuti nahi.</p></div>

<h3>Model-driven telemetry (sirf concept)</h3>
<p>Polling har device se har minute "aapka CPU kitna hai?" poochhta hai, jo slow aur wasteful hai. <b>Model-driven telemetry</b> controller ko chuna hua YANG data schedule par (periodic) ya badalne par (on-change) <b>push</b> karne deti hai. Do styles hain:</p>
<ul>
<li><b>Dial-in</b>: collector controller se connect hota hai (NETCONF ya gNMI) aur subscribe karta hai.</li>
<li><b>Dial-out</b>: controller bahar collector se connect hota hai, aam taur par gRPC se, aur stream karta hai. Yeh firewalls aur scale ko behtar sambhalta hai, aur Catalyst Center jaise platforms ka model yahi hai.</li>
</ul>
<p><b>gNMI</b> config aur telemetry ke liye gRPC-based protocol hai jisme subscription support hai. Subscription batata hai kya stream karna hai (YANG model mein XPath), kitni baar, kaise encode karna hai, aur kahan bhejna hai. IOS XE par configuration aisi dikhti hai (sirf concept; lab mein telemetry engine nahi hai aur koi subscription state print nahi hoti):</p>
<pre class="code"><span class="c">! dial-out subscription ki shape, sirf concept</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /wireless-client-oper:client-oper-data/common-oper-data
 source-address 10.10.99.10
 stream yang-push
 update-policy periodic 6000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp</pre>
<p>Periodic update value second ke sauven hisse mein hoti hai, isliye 6000 ka matlab har 60 second. Exact filters, module names aur options release ke hisaab se badalte hain, isliye use karne se pehle current guide dekho. Collector (jaise open-source tools ya Catalyst Center) stream ko time-series database mein rakhta hai taaki aap client counts, AP load aur zyada graph kar sako, SNMP polling se kaafi kam delay ke saath.</p>

<div class="warn"><p><b>Common mistake.</b> Shared repository mein jaane wali script mein <code>verify=False</code> aur hard-coded password chhod dena. Yeh ek file mein do security problems hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Polling pull hai; telemetry push hai. Dial-out ka matlab device connection shuru karta hai. gNMI NETCONF nahi hai. Aur Python dictionary <code>True</code> use karti hai, JSON <code>true</code>.</p></div>

<div class="scn"><h4>Pachaas controllers, ek kamzor password</h4><p>Ek script ne pachaas controllers par WLAN badla aur mahino chali. Audit mein mila ki script file mein admin password plain text mein tha aur verify disabled tha. Team ne secret vault mein daala, certificate checking enable ki, script account ko API role tak restrict kiya, aur script mein read-back step joda.</p><p><b>Lesson:</b> automation power ek jagah jama karti hai, isliye jo credentials woh use karti hai unhe protect karo.</p></div>

<div class="iv"><p class="q">"Kai controllers par WLAN change safely kaise automate karoge?"</p><p>RESTCONF with privilege-limited account, vault se secrets, certificate verification on, timeout, status checks aur har change ke baad read-back, aur pehli failure par stop. Baad ki monitoring ke liye telemetry batao aur kehna ki kaun sa hissa lab mein practise kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests RESTCONF calls bhejta hai: URL, headers, auth, json body; r.status_code padho.</li>
<li>Lab 5 galat password se 401 padhta hai, credentials fix ke baad 204.</li>
<li>Safe scripts status check karti hain, read back karti hain, hard-coded secrets se bachti hain aur production mein TLS verification rakhti hain.</li>
<li>Telemetry data push karti hai (periodic ya on-change); dial-out device se shuru hota hai.</li>
<li>Streaming telemetry aur gNMI lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};