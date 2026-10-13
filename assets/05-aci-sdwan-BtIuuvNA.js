var e={id:`aci-sdwan`,h:{en:`ACI (APIC REST) and Catalyst SD-WAN (vManage API)`,hi:`ACI (APIC REST) aur Catalyst SD-WAN (vManage API)`},body:{en:`
<p>Two more controllers, two more login styles. <b>ACI</b> is the data center fabric you may have met in the CCNP Data Center material; its controller is the <b>APIC</b>. <b>Catalyst SD-WAN</b> (formerly Viptela) connects branches over any transport; its management controller is <b>SD-WAN Manager</b>, still widely called <b>vManage</b>. Both have a REST API, but they feel very different.</p>

<h3>Part 1: ACI and the APIC REST API</h3>
<h3>Everything is a managed object</h3>
<p>The APIC keeps all configuration and state as <b>managed objects (MOs)</b> in one tree called the <b>Management Information Tree (MIT)</b>. The root is <code>uni</code> (the universe). Every object has a <b>class</b> (its type, for example <code>fvTenant</code>) and a <b>DN, distinguished name</b> (its unique full path, for example <code>uni/tn-Prod</code>). Common classes you should recognise:</p>
<table class="cmp"><tr><th>Class</th><th>Meaning</th><th>Example DN</th></tr>
<tr><td>fvTenant</td><td>Tenant, the top policy container</td><td>uni/tn-Prod</td></tr>
<tr><td>fvCtx</td><td>VRF (private network)</td><td>uni/tn-Prod/ctx-Main</td></tr>
<tr><td>fvBD</td><td>Bridge domain</td><td>uni/tn-Prod/BD-Web</td></tr>
<tr><td>fvAp</td><td>Application profile</td><td>uni/tn-Prod/ap-Shop</td></tr>
<tr><td>fvAEPg</td><td>Endpoint group (EPG)</td><td>uni/tn-Prod/ap-Shop/epg-Web</td></tr></table>
<p>A DN is built from prefixes: <code>tn-</code> for a tenant, <code>ap-</code> for an application profile, <code>epg-</code> for an EPG. The class tells you what kind of thing it is, the DN tells you exactly which one.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ACI managed object tree">
<rect x="270" y="10" width="100" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">uni (root)</text>
<rect x="270" y="64" width="100" height="34" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">tn-Prod</text>
<rect x="110" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="170" y="146" text-anchor="middle" class="svg-ink" font-size="13">ctx-Main</text>
<rect x="260" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">ap-Shop</text>
<rect x="410" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="470" y="146" text-anchor="middle" class="svg-ink" font-size="13">BD-Web</text>
<rect x="260" y="172" width="120" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">epg-Web</text>
<line x1="320" y1="44" x2="320" y2="64" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="170" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="470" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="158" x2="320" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The MIT is a tree. A DN is the path from uni down to one object.</p></div>

<h3>Login: aaaLogin and a cookie</h3>
<p>You POST a small JSON document to the login URL. The reply sets a session <b>cookie</b> (named <code>APIC-cookie</code>) and also returns a token in the body. With the requests library a <code>Session</code> object stores the cookie for you, so later calls are authenticated without extra work.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
requests.packages.urllib3.disable_warnings()
BASE = "h&#116;tps://apic.example"
s = requests.Session()
login = {"aaaUser": {"attributes": {"name": "admin", "pwd": "YOUR_PASSWORD"}}}
r = s.post(BASE + "/api/aaaLogin.json", json=login, verify=False)
r.raise_for_status()                                  <span class="c"># cookie is now stored in the session</span></pre>

<h3>Class query and DN query</h3>
<p>This is the pair of ideas the exam loves.</p>
<ul>
<li><b>Class query:</b> "give me all objects of this class". <code>GET /api/class/fvTenant.json</code> returns every tenant.</li>
<li><b>DN query:</b> "give me this one object". <code>GET /api/mo/uni/tn-Prod.json</code> returns just tenant Prod.</li>
</ul>
<p>Query options go after a question mark, for example <code>?query-target=children</code> (the children of the DN), <code>?rsp-subtree=full</code> (return the whole subtree below), or a filter such as <code>?query-target-filter=eq(fvTenant.name,"Prod")</code>. To <b>create</b> an object you POST a JSON body for it to the DN of its parent, for example a new <code>fvTenant</code> to <code>/api/mo/uni.json</code>. Every object in the reply is wrapped as <code>{"fvTenant": {"attributes": {...}, "children": [...]}}</code>, so the class name is the outer key.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
r = s.get(BASE + "/api/class/fvTenant.json", verify=False)
for item in r.json()["imdata"]:
    a = item["fvTenant"]["attributes"]
    print(a["name"], a["dn"])</pre>
<pre class="out">Prod  uni/tn-Prod
Dev   uni/tn-Dev
common  uni/tn-common</pre>
<p>Results are in a list called <code>imdata</code>. On the APIC command line the same class query is <code>moquery -c fvTenant</code>, and the GUI's "Save as" and API Inspector show the JSON behind every click, which is the fastest way to learn a body.</p>

<h3>Part 2: Catalyst SD-WAN and the vManage API</h3>
<p>SD-WAN has a controller plane (SD-WAN Manager, Controller, Validator) and edge routers at the sites. SD-WAN Manager is where you see devices, templates, alarms and statistics, and its REST API lives under the path <code>/dataservice</code>.</p>
<h3>Login: session cookie, then a token</h3>
<ol>
<li><b>Session:</b> POST form fields <code>j_username</code> and <code>j_password</code> to <code>/j_security_check</code>. A successful login sets a <code>JSESSIONID</code> cookie. (A failed login returns an HTML page with status 200, so check that a cookie was actually set.)</li>
<li><b>Token:</b> GET <code>/dataservice/client/token</code>. The reply is plain text, the <b>XSRF token</b>.</li>
<li>Send the cookie on every call. For POST, PUT and DELETE also send the header <code>X-XSRF-TOKEN: &lt;token&gt;</code>. GET requests need only the cookie.</li>
</ol>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
s = requests.Session()
s.post("h&#116;tps://vmanage.example/j_security_check",
       data={"j_username": "admin", "j_password": "YOUR_PASSWORD"}, verify=False)
tok = s.get("h&#116;tps://vmanage.example/dataservice/client/token", verify=False).text
s.headers["X-XSRF-TOKEN"] = tok
devs = s.get("h&#116;tps://vmanage.example/dataservice/device", verify=False).json()["data"]
for d in devs:
    print(d["host-name"], d["system-ip"], d["reachability"])</pre>
<p>Useful reads: <code>/dataservice/device</code> (all devices and reachability), <code>/dataservice/alarms</code> (alarms) and the device monitoring resources such as BFD session summaries. SD-WAN replies keep the list in a key called <code>data</code>. Newer releases add token-based login options, so check your version's reference.</p>

<h3>Side by side</h3>
<table class="cmp"><tr><th></th><th>ACI APIC</th><th>SD-WAN Manager</th></tr>
<tr><td>Login</td><td>POST JSON to /api/aaaLogin.json</td><td>POST form to /j_security_check, then GET a token</td></tr>
<tr><td>Session carrier</td><td>APIC-cookie</td><td>JSESSIONID cookie plus X-XSRF-TOKEN for changes</td></tr>
<tr><td>Data root</td><td>Managed objects, imdata list</td><td>/dataservice, data list</td></tr>
<tr><td>Key idea</td><td>Class query versus DN query</td><td>Session plus XSRF token</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> In ACI, using <code>/api/mo/</code> with a class name (it needs a DN) or <code>/api/class/</code> with a DN. In SD-WAN, forgetting the XSRF token on a POST and getting 403, or assuming a wrong password gives a 401 (the login page just returns 200 without a cookie).</p></div>
<div class="exam"><p><b>Exam trap.</b> Class query = <code>/api/class/&lt;class&gt;.json</code>; DN query = <code>/api/mo/&lt;dn&gt;.json</code>. And the ACI login URL contains <code>aaaLogin</code>.</p></div>

<div class="scn"><h4>Finding a tenant's EPGs in seconds</h4><p>A bank's data center team had 40 tenants and an audit asked for every EPG name and its bridge domain. In the GUI this was clicking through hundreds of pages. An engineer logged in with aaaLogin, ran one class query for fvAEPg with a filter on the tenant prefix, and printed the name and the bridge-domain relation of each result. The CSV was ready in a minute, and the same script ran again the next quarter.</p><p><b>Lesson:</b> class queries answer "show me all of a kind" faster than any screen.</p></div>

<div class="iv"><p class="q">"What is the difference between a class query and a DN query in ACI?"</p><p>A class query asks for all objects of one class, for example all fvTenant objects, through /api/class. A DN query asks for one specific object by its distinguished name, through /api/mo, optionally with its children or subtree. The MIT is a tree rooted at uni; the class gives the type and the DN gives the exact location.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACI: everything is a managed object in the MIT; know class (type) and DN (path).</li>
<li>APIC login is POST to aaaLogin.json and returns a cookie; use a requests Session.</li>
<li>Class query uses /api/class/..., DN query uses /api/mo/...; results are in imdata.</li>
<li>SD-WAN Manager login: session cookie from j_security_check, then an XSRF token for changes.</li>
<li>SD-WAN data lives under /dataservice; useful reads are device and alarms.</li>
</ul></div>
`,hi:`
<p>Do aur controllers, do aur login styles. <b>ACI</b> data center fabric hai jo aap CCNP Data Center material mein mil chuke ho sakte ho; uska controller <b>APIC</b> hai. <b>Catalyst SD-WAN</b> (pehle Viptela) kisi bhi transport par branches ko jodta hai; uska management controller <b>SD-WAN Manager</b> hai, jise ab bhi sab <b>vManage</b> kehte hain. Dono ki REST API hai, par dono ka feel bahut alag hai.</p>

<h3>Part 1: ACI aur APIC REST API</h3>
<h3>Sab kuch ek managed object hai</h3>
<p>APIC saari configuration aur state ko <b>managed objects (MOs)</b> ke roop mein ek tree mein rakhta hai jise <b>Management Information Tree (MIT)</b> kehte hain. Root <code>uni</code> (universe) hai. Har object ki ek <b>class</b> hoti hai (uska type, jaise <code>fvTenant</code>) aur ek <b>DN, distinguished name</b> (uska unique poora path, jaise <code>uni/tn-Prod</code>). Common classes jo pehchanni chahiye:</p>
<table class="cmp"><tr><th>Class</th><th>Matlab</th><th>Example DN</th></tr>
<tr><td>fvTenant</td><td>Tenant, sabse upar ka policy container</td><td>uni/tn-Prod</td></tr>
<tr><td>fvCtx</td><td>VRF (private network)</td><td>uni/tn-Prod/ctx-Main</td></tr>
<tr><td>fvBD</td><td>Bridge domain</td><td>uni/tn-Prod/BD-Web</td></tr>
<tr><td>fvAp</td><td>Application profile</td><td>uni/tn-Prod/ap-Shop</td></tr>
<tr><td>fvAEPg</td><td>Endpoint group (EPG)</td><td>uni/tn-Prod/ap-Shop/epg-Web</td></tr></table>
<p>DN prefixes se banta hai: tenant ke liye <code>tn-</code>, application profile ke liye <code>ap-</code>, EPG ke liye <code>epg-</code>. Class batati hai ki kis kism ki cheez hai, DN batata hai ki exactly kaunsi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ACI managed object tree">
<rect x="270" y="10" width="100" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">uni (root)</text>
<rect x="270" y="64" width="100" height="34" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">tn-Prod</text>
<rect x="110" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="170" y="146" text-anchor="middle" class="svg-ink" font-size="13">ctx-Main</text>
<rect x="260" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">ap-Shop</text>
<rect x="410" y="124" width="120" height="34" rx="8" fill="#bae6fd"/><text x="470" y="146" text-anchor="middle" class="svg-ink" font-size="13">BD-Web</text>
<rect x="260" y="172" width="120" height="30" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">epg-Web</text>
<line x1="320" y1="44" x2="320" y2="64" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="170" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="470" y2="124" stroke="#64748b" stroke-width="2"/><line x1="320" y1="158" x2="320" y2="172" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">MIT ek tree hai. DN uni se ek object tak ka path hai.</p></div>

<h3>Login: aaaLogin aur ek cookie</h3>
<p>Aap login URL par ek chhota JSON document POST karte ho. Reply ek session <b>cookie</b> set karta hai (naam <code>APIC-cookie</code>) aur body mein token bhi deta hai. requests library mein <code>Session</code> object cookie aapke liye store kar leta hai, isliye agli calls bina extra kaam ke authenticated hoti hain.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import requests
requests.packages.urllib3.disable_warnings()
BASE = "h&#116;tps://apic.example"
s = requests.Session()
login = {"aaaUser": {"attributes": {"name": "admin", "pwd": "YOUR_PASSWORD"}}}
r = s.post(BASE + "/api/aaaLogin.json", json=login, verify=False)
r.raise_for_status()                                  <span class="c"># cookie ab session mein store ho gayi</span></pre>

<h3>Class query aur DN query</h3>
<p>Yeh woh jodi hai jo exam ko bahut pasand hai.</p>
<ul>
<li><b>Class query:</b> "is class ke saare objects do". <code>GET /api/class/fvTenant.json</code> har tenant lautata hai.</li>
<li><b>DN query:</b> "yeh ek object do". <code>GET /api/mo/uni/tn-Prod.json</code> sirf tenant Prod lautata hai.</li>
</ul>
<p>Query options question mark ke baad aate hain, jaise <code>?query-target=children</code> (DN ke children), <code>?rsp-subtree=full</code> (neeche ka poora subtree), ya filter jaise <code>?query-target-filter=eq(fvTenant.name,"Prod")</code>. Object <b>banane</b> ke liye uski JSON body uske parent ke DN par POST karte hain, jaise naya <code>fvTenant</code> <code>/api/mo/uni.json</code> par. Reply mein har object <code>{"fvTenant": {"attributes": {...}, "children": [...]}}</code> ki tarah wrap hota hai, yaani class ka naam bahar wali key hai.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
r = s.get(BASE + "/api/class/fvTenant.json", verify=False)
for item in r.json()["imdata"]:
    a = item["fvTenant"]["attributes"]
    print(a["name"], a["dn"])</pre>
<pre class="out">Prod  uni/tn-Prod
Dev   uni/tn-Dev
common  uni/tn-common</pre>
<p>Results <code>imdata</code> naam ki list mein hote hain. APIC command line par wahi class query <code>moquery -c fvTenant</code> hai, aur GUI ka "Save as" aur API Inspector har click ke peeche ka JSON dikhate hain, jo body seekhne ka sabse tez tareeka hai.</p>

<h3>Part 2: Catalyst SD-WAN aur vManage API</h3>
<p>SD-WAN mein controller plane (SD-WAN Manager, Controller, Validator) aur sites par edge routers hote hain. SD-WAN Manager mein devices, templates, alarms aur statistics dikhte hain, aur uski REST API <code>/dataservice</code> path ke neeche hai.</p>
<h3>Login: session cookie, phir token</h3>
<ol>
<li><b>Session:</b> <code>/j_security_check</code> par form fields <code>j_username</code> aur <code>j_password</code> POST karo. Successful login <code>JSESSIONID</code> cookie set karta hai. (Failed login status 200 ke saath HTML page lautata hai, isliye check karo ki cookie sach mein set hui.)</li>
<li><b>Token:</b> <code>/dataservice/client/token</code> par GET. Reply plain text hota hai, yaani <b>XSRF token</b>.</li>
<li>Har call mein cookie bhejo. POST, PUT aur DELETE ke liye header <code>X-XSRF-TOKEN: &lt;token&gt;</code> bhi bhejo. GET ke liye sirf cookie kaafi hai.</li>
</ol>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
s = requests.Session()
s.post("h&#116;tps://vmanage.example/j_security_check",
       data={"j_username": "admin", "j_password": "YOUR_PASSWORD"}, verify=False)
tok = s.get("h&#116;tps://vmanage.example/dataservice/client/token", verify=False).text
s.headers["X-XSRF-TOKEN"] = tok
devs = s.get("h&#116;tps://vmanage.example/dataservice/device", verify=False).json()["data"]
for d in devs:
    print(d["host-name"], d["system-ip"], d["reachability"])</pre>
<p>Kaam ki reads: <code>/dataservice/device</code> (saare devices aur reachability), <code>/dataservice/alarms</code> (alarms) aur device monitoring resources jaise BFD session summaries. SD-WAN replies list ko <code>data</code> naam ki key mein rakhte hain. Naye releases token-based login options jodte hain, isliye apne version ka reference dekho.</p>

<h3>Saath-saath</h3>
<table class="cmp"><tr><th></th><th>ACI APIC</th><th>SD-WAN Manager</th></tr>
<tr><td>Login</td><td>/api/aaaLogin.json par JSON POST</td><td>/j_security_check par form POST, phir token GET</td></tr>
<tr><td>Session carrier</td><td>APIC-cookie</td><td>JSESSIONID cookie plus changes ke liye X-XSRF-TOKEN</td></tr>
<tr><td>Data root</td><td>Managed objects, imdata list</td><td>/dataservice, data list</td></tr>
<tr><td>Key idea</td><td>Class query versus DN query</td><td>Session plus XSRF token</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> ACI mein <code>/api/mo/</code> ke saath class naam use karna (use DN chahiye) ya <code>/api/class/</code> ke saath DN. SD-WAN mein POST par XSRF token bhool kar 403 lena, ya yeh maan lena ki galat password 401 dega (login page cookie ke bina bas 200 lautata hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> Class query = <code>/api/class/&lt;class&gt;.json</code>; DN query = <code>/api/mo/&lt;dn&gt;.json</code>. Aur ACI login URL mein <code>aaaLogin</code> hota hai.</p></div>

<div class="scn"><h4>Tenant ke EPGs kuch second mein</h4><p>Ek bank ki data center team ke paas 40 tenants the aur audit ne har EPG ka naam aur uska bridge domain maanga. GUI mein yeh saikdon pages par click karna tha. Ek engineer ne aaaLogin se login kiya, tenant prefix par filter ke saath fvAEPg ki ek class query chalayi, aur har result ka naam aur bridge-domain relation print kiya. CSV ek minute mein taiyaar thi, aur wahi script agli quarter phir chali.</p><p><b>Lesson:</b> "ek kism ke saare dikhao" ka jawab class query kisi bhi screen se tez deti hai.</p></div>

<div class="iv"><p class="q">"ACI mein class query aur DN query mein kya farak hai?"</p><p>Class query ek class ke saare objects maangti hai, jaise saare fvTenant objects, /api/class se. DN query ek specific object uske distinguished name se maangti hai, /api/mo se, chaho to uske children ya subtree ke saath. MIT uni se shuru hone wala tree hai; class type batati hai aur DN exact location.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACI: sab kuch MIT mein managed object hai; class (type) aur DN (path) jaano.</li>
<li>APIC login aaaLogin.json par POST hai aur cookie lautata hai; requests Session use karo.</li>
<li>Class query /api/class/... se, DN query /api/mo/... se; results imdata mein.</li>
<li>SD-WAN Manager login: j_security_check se session cookie, phir changes ke liye XSRF token.</li>
<li>SD-WAN data /dataservice ke neeche hai; kaam ki reads device aur alarms hain.</li>
</ul></div>
`}};export{e as default};