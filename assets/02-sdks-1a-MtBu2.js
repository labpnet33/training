var e={id:`sdks`,h:{en:`SDKs: what they give you, and what they cost`,hi:`SDKs: yeh kya dete hain, aur inki keemat kya hai`},body:{en:`
<p>In module auto-requests you called an API by hand with <code>requests.get</code>: you built the URL, added the header, checked the status code and parsed the JSON. That works everywhere, but you repeat the same boring work for every platform. An <b>SDK</b> removes much of it.</p>

<h3>What an SDK is</h3>
<p>An <b>SDK (software development kit)</b> is a package a vendor or the community publishes so that you can use an API from your own language without writing the HTTP plumbing yourself. For Python it is a library you install with <code>pip</code>. It usually contains the library code, documentation, sample scripts and sometimes command-line tools. The SDK does not replace the API: under the hood it still sends the same HTTP requests you learned about.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SDK sits between your code and the REST API">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Your Python code</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">get_devices()</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">SDK library</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">auth, retry, paging</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Platform REST API</text><text x="545" y="66" text-anchor="middle" class="svg-muted" font-size="12">GET /network-device</text>
<line x1="180" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="460" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Without an SDK you write the middle box yourself, for every platform.</text>
<text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">With an SDK you call a method and get Python objects back.</text>
</svg><p class="cap">The SDK is a helper layer. The REST API underneath is unchanged.</p></div>

<h3>What an SDK gives you</h3>
<ul>
<li><b>Authentication handled for you.</b> You pass the API key or username and password once. A good SDK fetches and refreshes tokens when they expire.</li>
<li><b>Methods that match the platform's objects.</b> Instead of building <code>/api/v1/organizations/{id}/networks</code> by hand you call a method such as <code>getOrganizationNetworks</code>.</li>
<li><b>Pagination and rate limits.</b> Many APIs return results in pages and reject too many calls per second (HTTP 429). SDKs often page automatically and wait and retry.</li>
<li><b>Typed errors.</b> Instead of reading a raw status code you catch an exception class that names the problem.</li>
<li><b>Less code and fewer typos.</b> Fewer hand-written URLs means fewer wrong-path bugs.</li>
</ul>

<h3>What an SDK costs</h3>
<ul>
<li><b>An extra dependency</b> that you must install, pin to a version and keep updated.</li>
<li><b>Version lag.</b> A brand-new API endpoint may not be in the SDK yet. Then you fall back to raw requests.</li>
<li><b>Hidden detail.</b> If something fails, you still need to understand the raw HTTP request and response to debug it. This is why we learned HTTP first.</li>
</ul>

<h3>The SDKs you should recognise</h3>
<table class="cmp"><tr><th>Platform</th><th>Python SDK (common name)</th><th>What it wraps</th></tr>
<tr><td>Meraki</td><td>meraki (DashboardAPI)</td><td>Dashboard API, with automatic retries on 429</td></tr>
<tr><td>Catalyst Center</td><td>dnacentersdk</td><td>Intent API, handles the token</td></tr>
<tr><td>ACI</td><td>Cobra SDK (acicobra), plus Ansible modules</td><td>The managed object tree</td></tr>
<tr><td>Catalyst SD-WAN</td><td>catalystwan</td><td>vManage / SD-WAN Manager API</td></tr>
<tr><td>NSO</td><td>ncs Python API (runs inside NSO)</td><td>Maapi and service code</td></tr>
<tr><td>Intersight</td><td>intersight</td><td>Signed requests and the object model</td></tr>
<tr><td>UCS Manager</td><td>ucsmsdk</td><td>The XML API as Python calls</td></tr>
<tr><td>Webex</td><td>Webex Python SDKs</td><td>Rooms, messages, people, webhooks</td></tr></table>

<h3>Raw requests and an SDK, side by side</h3>
<p>Both blocks do the same thing: list the organizations your Meraki key can see.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - raw requests</span>
import requests
URL = "h&#116;tps://api.meraki.example/api/v1/organizations"
HEADERS = {"Authorization": "Bearer YOUR_API_KEY", "Accept": "application/json"}
r = requests.get(URL, headers=HEADERS)
r.raise_for_status()
for org in r.json():
    print(org["id"], org["name"])</pre>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - with the Meraki SDK</span>
import meraki
dashboard = meraki.DashboardAPI("YOUR_API_KEY", output_log=False)
for org in dashboard.organizations.getOrganizations():
    print(org["id"], org["name"])</pre>
<p>The SDK version is shorter, and it also retries if the platform answers 429 Too Many Requests. The data you get back is the same list of dictionaries.</p>

<h3>Do not hard-code secrets</h3>
<p>An API key or password inside the script ends up in Git and on a colleague's laptop. Read secrets from environment variables, a vault, or a file that is listed in <code>.gitignore</code>. SDK documentation almost always shows an environment variable for the key.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import os
API_KEY = os.environ["MERAKI_DASHBOARD_API_KEY"]</pre>

<h3>Reading an API reference quickly</h3>
<p>Every platform publishes a reference. When you open one, find these five things in this order: the <b>base URL</b>, the <b>authentication</b> section, the <b>endpoint</b> for your job (method and path), the <b>request parameters and body</b> (which are required) and an <b>example response</b>. Chapter 10 turns this into a checklist and Lab 2 practises it.</p>

<div class="warn"><p><b>Common mistake.</b> Copying an SDK example from a blog written for an older version. Method names change between versions. Check the version of the package you installed and read the docs for that version.</p></div>
<div class="exam"><p><b>Exam trap.</b> "An SDK replaces the REST API." False: the SDK calls the API. If a platform has no SDK method for a new endpoint, you can still use plain requests.</p></div>

<div class="scn"><h4>The 429 storm</h4><p>A script looped over 600 Meraki devices and asked for each device's status in a tight loop. After a few seconds half the calls failed with 429 Too Many Requests. The engineer first added sleep calls by hand, which made the job slow and still unreliable. Switching to the Meraki Python SDK (which backs off and retries automatically) and asking for the organization-wide device list in one call instead of 600 calls fixed it, and the run took seconds.</p><p><b>Lesson:</b> an SDK helps with rate limits, but the best fix is also to choose the right endpoint.</p></div>

<div class="iv"><p class="q">"When would you use an SDK and when raw requests?"</p><p>Use an SDK for production scripts on a platform it covers: less boilerplate, token and retry logic, readable code. Use raw requests when the endpoint is new and missing from the SDK, when you want zero extra dependencies, or while debugging, because the raw request shows exactly what is sent. Mention that the SDK is still just HTTP underneath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SDK is a library that wraps an API so you write methods instead of HTTP plumbing.</li>
<li>It gives you auth handling, pagination, retry on rate limits, typed errors and less code.</li>
<li>It costs a dependency, can lag behind new endpoints and can hide the raw request.</li>
<li>Know the common SDK names: meraki, dnacentersdk, Cobra, catalystwan, intersight, ucsmsdk, Webex SDKs.</li>
<li>Keep secrets out of source code. Read an API reference in the order: base URL, auth, endpoint, body, example.</li>
</ul></div>
`,hi:`
<p>Module auto-requests mein aapne <code>requests.get</code> se API haath se call ki thi: URL banaya, header jodha, status code check kiya aur JSON parse kiya. Yeh har jagah chalta hai, par har platform ke liye wahi boring kaam baar-baar karna padta hai. <b>SDK</b> us kaam ka bada hissa hata deta hai.</p>

<h3>SDK kya hota hai</h3>
<p><b>SDK (software development kit)</b> ek package hai jo vendor ya community publish karti hai taaki aap apni language se API use kar sako bina HTTP ka plumbing khud likhe. Python ke liye yeh ek library hoti hai jise <code>pip</code> se install karte hain. Ismein aam taur par library code, documentation, sample scripts aur kabhi-kabhi command-line tools hote hain. SDK API ki jagah nahi leta: andar se woh wahi HTTP requests bhejta hai jo aapne seekhi hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SDK sits between your code and the REST API">
<rect x="10" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">Aapka Python code</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">get_devices()</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">SDK library</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">auth, retry, paging</text>
<rect x="460" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">Platform REST API</text><text x="545" y="66" text-anchor="middle" class="svg-muted" font-size="12">GET /network-device</text>
<line x1="180" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="460" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">SDK ke bina beech wala box aap khud likhte ho, har platform ke liye.</text>
<text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">SDK ke saath aap ek method call karte ho aur Python objects wapas milte hain.</text>
</svg><p class="cap">SDK ek helper layer hai. Neeche wali REST API waisi hi rehti hai.</p></div>

<h3>SDK aapko kya deta hai</h3>
<ul>
<li><b>Authentication aapke liye handle hota hai.</b> API key ya username-password ek baar do. Achha SDK token expire hone par use dobara le leta hai.</li>
<li><b>Platform ke objects se milte methods.</b> <code>/api/v1/organizations/{id}/networks</code> haath se banane ki jagah <code>getOrganizationNetworks</code> jaisa method call karte ho.</li>
<li><b>Pagination aur rate limits.</b> Bahut APIs results pages mein deti hain aur ek second mein zyada calls par reject karti hain (HTTP 429). SDKs aksar khud page karte hain aur ruk kar dobara try karte hain.</li>
<li><b>Typed errors.</b> Raw status code padhne ki jagah aap ek exception class pakadte ho jo problem ka naam batati hai.</li>
<li><b>Kam code aur kam typos.</b> Haath se likhe URLs kam, to wrong-path bugs kam.</li>
</ul>

<h3>SDK ki keemat</h3>
<ul>
<li><b>Ek extra dependency</b> jise install karna, version pin karna aur update rakhna padta hai.</li>
<li><b>Version lag.</b> Bilkul nayi API endpoint SDK mein abhi nahi ho sakti. Tab raw requests par wapas aana padta hai.</li>
<li><b>Chhupa hua detail.</b> Kuch fail ho jaye to debug karne ke liye raw HTTP request aur response samajhna padta hai. Isiliye humne pehle HTTP seekha.</li>
</ul>

<h3>Jin SDKs ko pehchanna hai</h3>
<table class="cmp"><tr><th>Platform</th><th>Python SDK (common naam)</th><th>Kya wrap karta hai</th></tr>
<tr><td>Meraki</td><td>meraki (DashboardAPI)</td><td>Dashboard API, 429 par automatic retry ke saath</td></tr>
<tr><td>Catalyst Center</td><td>dnacentersdk</td><td>Intent API, token khud handle</td></tr>
<tr><td>ACI</td><td>Cobra SDK (acicobra), plus Ansible modules</td><td>Managed object tree</td></tr>
<tr><td>Catalyst SD-WAN</td><td>catalystwan</td><td>vManage / SD-WAN Manager API</td></tr>
<tr><td>NSO</td><td>ncs Python API (NSO ke andar chalti hai)</td><td>Maapi aur service code</td></tr>
<tr><td>Intersight</td><td>intersight</td><td>Signed requests aur object model</td></tr>
<tr><td>UCS Manager</td><td>ucsmsdk</td><td>XML API ko Python calls ki tarah</td></tr>
<tr><td>Webex</td><td>Webex Python SDKs</td><td>Rooms, messages, people, webhooks</td></tr></table>

<h3>Raw requests aur SDK, saath-saath</h3>
<p>Dono blocks wahi kaam karte hain: aapki Meraki key jin organizations ko dekh sakti hai unki list.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - raw requests</span>
import requests
URL = "h&#116;tps://api.meraki.example/api/v1/organizations"
HEADERS = {"Authorization": "Bearer YOUR_API_KEY", "Accept": "application/json"}
r = requests.get(URL, headers=HEADERS)
r.raise_for_status()
for org in r.json():
    print(org["id"], org["name"])</pre>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - with the Meraki SDK</span>
import meraki
dashboard = meraki.DashboardAPI("YOUR_API_KEY", output_log=False)
for org in dashboard.organizations.getOrganizations():
    print(org["id"], org["name"])</pre>
<p>SDK wala version chhota hai, aur agar platform 429 Too Many Requests de to woh retry bhi karta hai. Wapas milne wala data wahi dictionaries ki list hai.</p>

<h3>Secrets hard-code mat karo</h3>
<p>Script ke andar API key ya password Git mein aur saathi ke laptop par pahunch jata hai. Secrets environment variables, vault ya aisi file se padho jo <code>.gitignore</code> mein ho. SDK documentation lagbhag hamesha key ke liye environment variable dikhati hai.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import os
API_KEY = os.environ["MERAKI_DASHBOARD_API_KEY"]</pre>

<h3>API reference jaldi kaise padhein</h3>
<p>Har platform ek reference publish karta hai. Use kholo to yeh paanch cheezein is order mein dhoondo: <b>base URL</b>, <b>authentication</b> section, aapke kaam ki <b>endpoint</b> (method aur path), <b>request parameters aur body</b> (kaunse required hain) aur ek <b>example response</b>. Chapter 10 isse checklist banata hai aur Lab 2 isi ki practice karata hai.</p>

<div class="warn"><p><b>Common mistake.</b> Purane version ke liye likhe blog se SDK example copy karna. Versions ke beech method ke naam badal jaate hain. Jo package version install kiya hai uski docs padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "SDK REST API ki jagah le leta hai." Galat: SDK API ko hi call karta hai. Agar kisi nayi endpoint ka SDK method nahi hai, to plain requests tab bhi use ho sakte hain.</p></div>

<div class="scn"><h4>429 ka toofan</h4><p>Ek script 600 Meraki devices par loop chala rahi thi aur har device ka status tight loop mein maang rahi thi. Kuch second baad aadhi calls 429 Too Many Requests ke saath fail ho gayi. Engineer ne pehle haath se sleep lagaya, jisse job dheemi hui aur phir bhi bharosemand nahi thi. Meraki Python SDK par jaane se (jo khud back off karke retry karta hai) aur 600 calls ki jagah ek hi call mein poore organization ki device list maangne se problem theek hui, aur run kuch second mein poora hua.</p><p><b>Lesson:</b> SDK rate limits mein madad karta hai, par sabse achha fix sahi endpoint chunna bhi hai.</p></div>

<div class="iv"><p class="q">"SDK kab use karoge aur raw requests kab?"</p><p>Jis platform ko SDK cover karta hai uski production scripts ke liye SDK use karo: kam boilerplate, token aur retry logic, readable code. Raw requests tab jab endpoint nayi ho aur SDK mein na ho, jab zero extra dependency chahiye, ya debug karte waqt, kyunki raw request dikhati hai ki exactly kya bheja ja raha hai. Yeh zaroor kaho ki SDK bhi andar se HTTP hi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDK ek library hai jo API ko wrap karti hai taaki HTTP plumbing ki jagah methods likho.</li>
<li>Yeh auth handling, pagination, rate limit par retry, typed errors aur kam code deta hai.</li>
<li>Keemat: dependency, nayi endpoints se peeche reh sakta hai aur raw request chhupa sakta hai.</li>
<li>Common SDK naam yaad rakho: meraki, dnacentersdk, Cobra, catalystwan, intersight, ucsmsdk, Webex SDKs.</li>
<li>Secrets source code se bahar rakho. API reference is order mein padho: base URL, auth, endpoint, body, example.</li>
</ul></div>
`}};export{e as default};