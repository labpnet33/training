var e={id:`compute`,h:{en:`Compute: Intersight, UCS Manager XML API and UCS Director`,hi:`Compute: Intersight, UCS Manager XML API aur UCS Director`},body:{en:`
<p>Servers need management too: firmware, BIOS settings, boot order, network and storage identities. Cisco's server platform is <b>UCS (Unified Computing System)</b>, and three management tools appear in the blueprint at different levels: <b>Intersight</b> (cloud, the modern choice), <b>UCS Manager</b> (on the fabric interconnects) and <b>UCS Director</b> (an older orchestration tool). You met UCS ideas in the data center material: service profiles, pools and templates. Here we only ask how a program talks to each.</p>

<h3>Intersight: servers managed from the cloud</h3>
<p><b>Cisco Intersight</b> is a software-as-a-service platform. Your servers (UCS, HyperFlex and some third-party systems) connect out to the Intersight cloud through a <b>device connector</b>, and then you manage inventory, policies, profiles, firmware and alerts from one place. Because it is a cloud service, there is nothing to patch on your side. An appliance version exists for sites that cannot reach the internet.</p>
<ul>
<li><b>API style:</b> REST with JSON, a base path <code>/api/v1</code>, and <b>OData</b> query options.</li>
<li><b>Objects:</b> every object has a <b>Moid</b> (a unique identifier) and an <b>ObjectType</b>, such as <code>compute.PhysicalSummary</code> for a server. The object model is organised in groups (compute, equipment, server, policy, firmware ...).</li>
<li><b>Query options:</b> <code>$filter</code> (conditions), <code>$select</code> (only the fields you want), <code>$top</code> and <code>$skip</code> (paging), <code>$orderby</code>, <code>$count</code>.</li>
<li><b>Authentication:</b> not a password and not a simple token. In the portal you create an <b>API key</b>, which gives you a <b>key ID</b> and a <b>secret key</b> (a private key file). For every request your client builds a <b>signature</b> over some request headers (including a hash of the body and the date) with the private key, and sends it in the Authorization header. The server verifies it with the matching public key. This is why Intersight is almost always used through its SDK, which does the signing for you.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - Intersight Python SDK</span>
from intersight.api_client import ApiClient
from intersight.configuration import Configuration
from intersight.api import compute_api

cfg = Configuration(host="h&#116;tps://intersight.example",
                    signing_info=None)                  <span class="c"># real code passes the key id and key file here</span>
client = ApiClient(cfg)
servers = compute_api.ComputeApi(client).get_compute_physical_summary_list(
              filter="Model eq 'UCSC-C220-M6S'", select="Name,Serial,PowerState", top=10)
for s in servers.results:
    print(s.name, s.serial, s.power_state)</pre>
<p>The exact setup of the signing information differs by SDK version, so the important exam point is the idea: <b>signed requests with an API key pair</b>, not a login call.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Intersight versus UCS Manager">
<rect x="10" y="10" width="300" height="190" rx="8" fill="#ddd6fe"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Intersight (cloud)</text>
<text x="160" y="62" text-anchor="middle" class="svg-ink" font-size="12">Servers connect out (device connector)</text><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">REST + JSON + OData ($filter)</text><text x="160" y="106" text-anchor="middle" class="svg-ink" font-size="12">Objects have Moid and ObjectType</text><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="12">Auth: signed requests (API key pair)</text><text x="160" y="164" text-anchor="middle" class="svg-muted" font-size="12">Many domains, one portal</text>
<rect x="330" y="10" width="300" height="190" rx="8" fill="#bae6fd"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">UCS Manager (on-prem)</text>
<text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">Runs on the fabric interconnects</text><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">XML API: POST to /nuova</text><text x="480" y="106" text-anchor="middle" class="svg-ink" font-size="12">Objects have a DN (sys/chassis-1/blade-1)</text><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="12">Auth: aaaLogin returns a cookie</text><text x="480" y="164" text-anchor="middle" class="svg-muted" font-size="12">One UCS domain per instance</text>
</svg><p class="cap">Two ways to manage the same kind of server: cloud and on-premises.</p></div>

<h3>UCS Manager: the XML API</h3>
<p><b>UCS Manager (UCSM)</b> is embedded in the pair of fabric interconnects and manages one UCS domain. You used it in the simulator's UCS labs (service profiles, pools, boot policies). Its API is <b>XML over HTTP(S)</b>, sent as a POST to a single URL, <code>/nuova</code>. Every call is an XML element whose name is the method.</p>
<ol>
<li><b>Login:</b> <code>&lt;aaaLogin inName="admin" inPassword="..." /&gt;</code>. The reply holds an <code>outCookie</code>.</li>
<li><b>Use the cookie:</b> put it in the <code>cookie</code> attribute of every later call. It expires after a period of inactivity; <code>aaaRefresh</code> extends it.</li>
<li><b>Read:</b> <code>configResolveClass</code> (all objects of a class, for example <code>computeBlade</code>) or <code>configResolveDn</code> (one object by its DN).</li>
<li><b>Change:</b> <code>configConfMo</code> (create or modify one object).</li>
<li><b>Logout:</b> <code>aaaLogout</code>.</li>
</ol>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - request body for a class query</span>
&lt;configResolveClass cookie="1700000000/abcd-1234" classId="computeBlade" inHierarchical="false"/&gt;</pre>
<p>Does that remind you of ACI? It should. UCSM also has an object tree, <b>classes</b> and <b>DNs</b> (for example <code>sys/chassis-1/blade-1</code> for a blade, or <code>org-root/ls-ESX-01</code> for a service profile) and a login that returns a cookie. In Python you rarely write the XML: the <b>ucsmsdk</b> library gives you <code>handle = UcsHandle(...)</code>, <code>handle.login()</code> and <code>handle.query_classid("computeBlade")</code>.</p>

<h3>UCS Director: concept level</h3>
<p><b>UCS Director</b> is an on-premises <b>orchestration</b> product for converged and hyperconverged infrastructure. Its key ideas are <b>tasks</b> (single actions such as "create a VLAN"), <b>workflows</b> (tasks chained with decisions) and a <b>catalog</b> where users request ready-made services. It has a REST API in which a call names an operation and carries an API key in the header <code>X-Cloupia-Request-Key</code>. You are not expected to build calls for it; you should recognise it as an older workflow-orchestration tool, which Intersight and newer automation tools have largely replaced.</p>

<table class="cmp"><tr><th>Tool</th><th>Where it runs</th><th>API</th><th>Auth idea</th></tr>
<tr><td>Intersight</td><td>Cloud (or appliance)</td><td>REST, JSON, OData</td><td>Signed requests with an API key pair</td></tr>
<tr><td>UCS Manager</td><td>Fabric interconnects</td><td>XML API at /nuova</td><td>aaaLogin returns a cookie</td></tr>
<tr><td>UCS Director</td><td>On-prem VM</td><td>REST, operation-based</td><td>API key header</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Sending JSON to UCS Manager (it needs XML). Forgetting to log out and leaving sessions open until the limit is reached. Treating the Intersight API key like a password: it is a key pair, and the private key must never be committed to Git.</p></div>
<div class="exam"><p><b>Exam trap.</b> UCS Manager = XML API with aaaLogin and a cookie. Intersight = REST with signed requests. UCS Director = workflow orchestration. Match each to its data format.</p></div>

<div class="scn"><h4>Firmware report for 300 servers</h4><p>A healthcare company needed to prove that every server ran approved firmware before an audit. Opening 12 UCS Manager domains one by one would have taken days. They created one read-only Intersight API key, queried the physical summary list with a filter on the firmware version not equal to the approved one, and selected only name, serial and version. The query returned 23 servers that needed an update, and the list went straight into a ticket.</p><p><b>Lesson:</b> a cloud API with filtering answers fleet-wide questions in seconds.</p></div>

<div class="iv"><p class="q">"How is the UCS Manager API different from Intersight's?"</p><p>UCS Manager has an XML API at one URL per UCS domain; you log in with aaaLogin, get a cookie and use class or DN queries. Intersight is a cloud service with a REST/JSON API, OData filters and requests signed with an API key pair. Intersight spans many domains and sites; UCSM is per domain. Mention the SDKs: ucsmsdk and the Intersight SDK.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intersight is cloud server management: REST + JSON + OData, with signed-request authentication.</li>
<li>UCS Manager runs on the fabric interconnects and uses an XML API: aaaLogin, cookie, configResolveClass, configConfMo.</li>
<li>Both use object models with classes or types and unique identifiers (Moid or DN).</li>
<li>UCS Director is on-prem workflow orchestration with tasks and workflows (concept level).</li>
<li>Use ucsmsdk or the Intersight SDK instead of hand-writing XML or signatures.</li>
</ul></div>
`,hi:`
<p>Servers ko bhi management chahiye: firmware, BIOS settings, boot order, network aur storage identities. Cisco ka server platform <b>UCS (Unified Computing System)</b> hai, aur blueprint mein teen management tools alag-alag level par aate hain: <b>Intersight</b> (cloud, modern choice), <b>UCS Manager</b> (fabric interconnects par) aur <b>UCS Director</b> (purana orchestration tool). UCS ke idea aap data center material mein mil chuke ho: service profiles, pools aur templates. Yahan hum sirf poochte hain ki program inse baat kaise karta hai.</p>

<h3>Intersight: cloud se managed servers</h3>
<p><b>Cisco Intersight</b> software-as-a-service platform hai. Aapke servers (UCS, HyperFlex aur kuch third-party systems) ek <b>device connector</b> ke zariye Intersight cloud se bahar ki taraf connect hote hain, aur phir inventory, policies, profiles, firmware aur alerts ek jagah se manage karte ho. Cloud service hone ki wajah se aapki taraf patch karne ko kuch nahi. Jin sites se internet tak pahunch nahi hoti unke liye appliance version hai.</p>
<ul>
<li><b>API style:</b> JSON wali REST, base path <code>/api/v1</code>, aur <b>OData</b> query options.</li>
<li><b>Objects:</b> har object ka ek <b>Moid</b> (unique identifier) aur <b>ObjectType</b> hota hai, jaise server ke liye <code>compute.PhysicalSummary</code>. Object model groups mein organise hai (compute, equipment, server, policy, firmware ...).</li>
<li><b>Query options:</b> <code>$filter</code> (conditions), <code>$select</code> (sirf chahiye wale fields), <code>$top</code> aur <code>$skip</code> (paging), <code>$orderby</code>, <code>$count</code>.</li>
<li><b>Authentication:</b> password nahi aur simple token bhi nahi. Portal mein aap ek <b>API key</b> banate ho, jisse ek <b>key ID</b> aur ek <b>secret key</b> (private key file) milti hai. Har request ke liye aapka client kuch request headers par (body ka hash aur date shamil) private key se ek <b>signature</b> banata hai aur Authorization header mein bhejta hai. Server matching public key se verify karta hai. Isiliye Intersight lagbhag hamesha SDK se use hota hai, jo signing aapke liye karta hai.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - Intersight Python SDK</span>
from intersight.api_client import ApiClient
from intersight.configuration import Configuration
from intersight.api import compute_api

cfg = Configuration(host="h&#116;tps://intersight.example",
                    signing_info=None)                  <span class="c"># asli code yahan key id aur key file deta hai</span>
client = ApiClient(cfg)
servers = compute_api.ComputeApi(client).get_compute_physical_summary_list(
              filter="Model eq 'UCSC-C220-M6S'", select="Name,Serial,PowerState", top=10)
for s in servers.results:
    print(s.name, s.serial, s.power_state)</pre>
<p>Signing information ka exact setup SDK version ke hisaab se badalta hai, isliye exam ka zaroori point idea hai: <b>API key pair ke saath signed requests</b>, login call nahi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Intersight versus UCS Manager">
<rect x="10" y="10" width="300" height="190" rx="8" fill="#ddd6fe"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Intersight (cloud)</text>
<text x="160" y="62" text-anchor="middle" class="svg-ink" font-size="12">Servers bahar connect karte hain (device connector)</text><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="12">REST + JSON + OData ($filter)</text><text x="160" y="106" text-anchor="middle" class="svg-ink" font-size="12">Objects ke Moid aur ObjectType</text><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="12">Auth: signed requests (API key pair)</text><text x="160" y="164" text-anchor="middle" class="svg-muted" font-size="12">Bahut domains, ek portal</text>
<rect x="330" y="10" width="300" height="190" rx="8" fill="#bae6fd"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">UCS Manager (on-prem)</text>
<text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="12">Fabric interconnects par chalta hai</text><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">XML API: /nuova par POST</text><text x="480" y="106" text-anchor="middle" class="svg-ink" font-size="12">Objects ka DN (sys/chassis-1/blade-1)</text><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="12">Auth: aaaLogin cookie deta hai</text><text x="480" y="164" text-anchor="middle" class="svg-muted" font-size="12">Har instance mein ek UCS domain</text>
</svg><p class="cap">Ek hi kism ke server manage karne ke do tareeke: cloud aur on-premises.</p></div>

<h3>UCS Manager: XML API</h3>
<p><b>UCS Manager (UCSM)</b> fabric interconnects ki jodi mein embedded hota hai aur ek UCS domain manage karta hai. Aapne ise simulator ke UCS labs mein use kiya (service profiles, pools, boot policies). Iski API <b>HTTP(S) par XML</b> hai, ek hi URL <code>/nuova</code> par POST ki jaati hai. Har call ek XML element hai jiska naam method hai.</p>
<ol>
<li><b>Login:</b> <code>&lt;aaaLogin inName="admin" inPassword="..." /&gt;</code>. Reply mein <code>outCookie</code> hota hai.</li>
<li><b>Cookie use karo:</b> use har agli call ke <code>cookie</code> attribute mein daalo. Kuch der inactivity ke baad expire hoti hai; <code>aaaRefresh</code> ise badha deta hai.</li>
<li><b>Read:</b> <code>configResolveClass</code> (ek class ke saare objects, jaise <code>computeBlade</code>) ya <code>configResolveDn</code> (DN se ek object).</li>
<li><b>Change:</b> <code>configConfMo</code> (ek object banao ya badlo).</li>
<li><b>Logout:</b> <code>aaaLogout</code>.</li>
</ol>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - class query ki request body</span>
&lt;configResolveClass cookie="1700000000/abcd-1234" classId="computeBlade" inHierarchical="false"/&gt;</pre>
<p>Kya yeh ACI yaad dilata hai? Dilana chahiye. UCSM mein bhi object tree, <b>classes</b> aur <b>DNs</b> hain (jaise blade ke liye <code>sys/chassis-1/blade-1</code>, ya service profile ke liye <code>org-root/ls-ESX-01</code>) aur cookie lautane wala login. Python mein XML aap shayad hi likhte ho: <b>ucsmsdk</b> library <code>handle = UcsHandle(...)</code>, <code>handle.login()</code> aur <code>handle.query_classid("computeBlade")</code> deti hai.</p>

<h3>UCS Director: concept level</h3>
<p><b>UCS Director</b> converged aur hyperconverged infrastructure ke liye on-premises <b>orchestration</b> product hai. Iske key ideas hain <b>tasks</b> (ek action jaise "VLAN banao"), <b>workflows</b> (decisions ke saath jude tasks) aur ek <b>catalog</b> jahan users ready-made services maangte hain. Iski REST API mein call ek operation ka naam deti hai aur header <code>X-Cloupia-Request-Key</code> mein API key leti hai. Aapse iske calls banane ki ummeed nahi; ise purane workflow-orchestration tool ki tarah pehchano, jise Intersight aur nayi automation tools ne kaafi had tak replace kar diya hai.</p>

<table class="cmp"><tr><th>Tool</th><th>Kahan chalta hai</th><th>API</th><th>Auth idea</th></tr>
<tr><td>Intersight</td><td>Cloud (ya appliance)</td><td>REST, JSON, OData</td><td>API key pair ke saath signed requests</td></tr>
<tr><td>UCS Manager</td><td>Fabric interconnects</td><td>/nuova par XML API</td><td>aaaLogin cookie deta hai</td></tr>
<tr><td>UCS Director</td><td>On-prem VM</td><td>REST, operation-based</td><td>API key header</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> UCS Manager ko JSON bhejna (use XML chahiye). Logout bhool jana aur sessions limit tak khule chhod dena. Intersight API key ko password ki tarah treat karna: yeh key pair hai, aur private key kabhi Git mein commit nahi honi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> UCS Manager = aaaLogin aur cookie wali XML API. Intersight = signed requests wali REST. UCS Director = workflow orchestration. Har ek ko uske data format se match karo.</p></div>

<div class="scn"><h4>300 servers ki firmware report</h4><p>Ek healthcare company ko audit se pehle saabit karna tha ki har server approved firmware par hai. 12 UCS Manager domains ko ek-ek karke kholne mein din lag jaate. Unhone ek read-only Intersight API key banayi, physical summary list par ek query chalayi jismein firmware version approved wale se alag ho yeh filter tha, aur sirf name, serial aur version select kiye. Query ne 23 servers lautaye jinhe update chahiye tha, aur list seedha ticket mein gayi.</p><p><b>Lesson:</b> filtering wali cloud API poore fleet ke sawaalon ka jawab kuch second mein deti hai.</p></div>

<div class="iv"><p class="q">"UCS Manager ki API Intersight se kaise alag hai?"</p><p>UCS Manager ki XML API har UCS domain ke liye ek URL par hoti hai; aap aaaLogin se login karte ho, cookie lete ho aur class ya DN queries use karte ho. Intersight cloud service hai jismein REST/JSON API, OData filters aur API key pair se signed requests hain. Intersight kai domains aur sites cover karta hai; UCSM per domain hai. SDKs ka zikr karo: ucsmsdk aur Intersight SDK.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intersight cloud server management hai: REST + JSON + OData, signed-request authentication ke saath.</li>
<li>UCS Manager fabric interconnects par chalta hai aur XML API use karta hai: aaaLogin, cookie, configResolveClass, configConfMo.</li>
<li>Dono class ya type aur unique identifiers (Moid ya DN) wale object models use karte hain.</li>
<li>UCS Director on-prem workflow orchestration hai jismein tasks aur workflows hain (concept level).</li>
<li>XML ya signatures haath se likhne ki jagah ucsmsdk ya Intersight SDK use karo.</li>
</ul></div>
`}};export{e as default};