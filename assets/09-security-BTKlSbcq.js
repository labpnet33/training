var e={id:`security`,h:{en:`Security platforms: XDR, FMC, Secure Endpoint, ISE, Malware Analytics and Umbrella`,hi:`Security platforms: XDR, FMC, Secure Endpoint, ISE, Malware Analytics aur Umbrella`},body:{en:`
<p>Security teams drown in tools: a firewall console, an endpoint console, a DNS filter, an identity server. Automation helps in two ways: <b>enrich</b> (given a suspicious IP or file hash, ask every tool what it knows) and <b>respond</b> (block a domain, isolate a host, quarantine a user). This chapter covers the security products in the blueprint, always in a defensive voice: what each does, how to authenticate, and the typical read or response call.</p>

<h3>The big picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security platforms and their jobs">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">XDR: correlate and respond across the tools below</text>
<rect x="10" y="62" width="196" height="64" rx="8" fill="#bae6fd"/><text x="108" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secure Firewall</text><text x="108" y="106" text-anchor="middle" class="svg-muted" font-size="12">FMC: policies, objects</text>
<rect x="222" y="62" width="196" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">hosts, events, isolation</text>
<rect x="434" y="62" width="196" height="64" rx="8" fill="#ddd6fe"/><text x="532" y="86" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="532" y="106" text-anchor="middle" class="svg-muted" font-size="12">identity, endpoints, ERS</text>
<rect x="10" y="142" width="300" height="64" rx="8" fill="#fed7aa"/><text x="160" y="166" text-anchor="middle" class="svg-ink" font-size="13">Umbrella / Secure Access</text><text x="160" y="186" text-anchor="middle" class="svg-muted" font-size="12">DNS and web: block lists, reports</text>
<rect x="330" y="142" width="300" height="64" rx="8" fill="#e2e8f0"/><text x="480" y="166" text-anchor="middle" class="svg-ink" font-size="13">Secure Malware Analytics</text><text x="480" y="186" text-anchor="middle" class="svg-muted" font-size="12">detonate files, threat score</text>
</svg><p class="cap">Each tool has its own API; XDR sits on top to correlate.</p></div>

<h3>Cisco XDR</h3>
<p><b>XDR (extended detection and response)</b> pulls signals from endpoint, network, email and identity tools into one place and lets you investigate and respond. Its API is built around <b>observables</b>: a piece of evidence with a <b>type</b> (ip, domain, sha256, url, email) and a <b>value</b>. The workflow is: authenticate, <b>enrich</b> (ask the integrated tools for verdicts and sightings on the observables) and <b>respond</b> (run response actions such as blocking). Authentication uses <b>OAuth 2.0 client credentials</b>: you create an API client in the portal (client ID and password) and exchange them for a short-lived access token that you then send as a Bearer token.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - enrichment idea</span>
observables = [{"type": "domain", "value": "bad-site.example"},
               {"type": "ip", "value": "203.0.113.50"}]
<span class="c"># POST the list to the enrich endpoint with Authorization: Bearer ACCESS_TOKEN</span>
<span class="c"># The answer groups verdicts (malicious, suspicious, clean, unknown) per tool</span></pre>

<h3>Secure Firewall Management Center (FMC) REST API</h3>
<p>FMC manages Secure Firewall (FTD) devices. Its REST API lets you create network objects, edit access policies and <b>deploy</b> changes. Login is a <b>POST with basic auth</b> to the token endpoint <code>/api/fmc_platform/v1/auth/generatetoken</code>. The reply has no useful body; the token is in the <b>response headers</b>: <code>X-auth-access-token</code>, <code>X-auth-refresh-token</code> and <code>DOMAIN_UUID</code>. You send the access token in the header <code>X-auth-access-token</code> and put the <b>domain UUID in the URL</b> of configuration calls, for example <code>/api/fmc_config/v1/domain/{domainUUID}/object/networks</code>. The token lasts about 30 minutes and can be refreshed a limited number of times. Lists are paged with <code>limit</code> and <code>offset</code>, and <code>expanded=true</code> returns full objects. A change made through the API is <b>not active</b> until you request a <b>deployment</b> to the devices.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
r = requests.post(BASE + "/api/fmc_platform/v1/auth/generatetoken", auth=("api-user", "PASSWORD"), verify=False)
tok = r.headers["X-auth-access-token"]
dom = r.headers["DOMAIN_UUID"]
H = {"X-auth-access-token": tok, "Content-Type": "application/json"}
obj = {"name": "block-host-1", "type": "Host", "value": "203.0.113.50"}
requests.post(BASE + "/api/fmc_config/v1/domain/" + dom + "/object/hosts", headers=H, json=obj, verify=False)</pre>

<h3>Secure Endpoint</h3>
<p><b>Secure Endpoint</b> (formerly AMP for Endpoints) protects laptops and servers. Its API (version 3) uses <b>HTTP basic authentication</b> with an API client ID as the username and an API key as the password. Useful resources: <code>/v3/computers</code> (hosts), <code>/v3/events</code> (detections and activity), file lists (allow and block lists) and an isolation action for a computer, so you can cut a suspected host off the network from a script.</p>

<h3>ISE and the ERS API</h3>
<p><b>Identity Services Engine (ISE)</b> decides who and what may join the network (802.1X, MAB, guest, posture). The <b>ERS (External RESTful Services) API</b> manages ISE objects: endpoints, endpoint identity groups, network devices, internal users. ERS must be <b>enabled</b> and the account needs an ERS admin role; it uses <b>basic authentication</b>, historically on port 9060. Paths look like <code>/ers/config/endpoint</code> and <code>/ers/config/networkdevice</code>, and you must send both <code>Accept</code> and <code>Content-Type</code> as JSON (or XML). A successful create returns <b>201</b> with the new object's address in the <code>Location</code> header. Lists are paged with <code>size</code> and <code>page</code>. Newer ISE versions add an OpenAPI-style interface on the normal HTTPS port.</p>

<h3>Secure Malware Analytics</h3>
<p><b>Secure Malware Analytics</b> (formerly Threat Grid) runs a suspicious file or URL in a sandbox and reports what it did, with a <b>threat score</b>. The API is REST: you authenticate with an <b>API key</b>, submit a sample (a multipart file upload), and then fetch the analysis, behaviours and indicators. Many other tools call it automatically.</p>

<h3>Umbrella and Secure Access</h3>
<p><b>Umbrella</b> (DNS-layer security) and its successor family <b>Secure Access</b> filter DNS and web traffic in the cloud. Their APIs use <b>OAuth 2.0 client credentials</b>: create an API key and secret, request a token from the token endpoint with basic authentication, then send Bearer on every call. Typical jobs: <b>reports</b> (which domains were blocked), <b>destination lists</b> (add or remove a domain on a block list), <b>policies</b> and an <b>investigation</b> service that returns what is known about a domain.</p>

<table class="cmp"><tr><th>Product</th><th>Authentication</th><th>Where the credential goes</th></tr>
<tr><td>XDR</td><td>OAuth 2.0 client credentials</td><td>Bearer access token</td></tr>
<tr><td>FMC</td><td>POST basic auth to generatetoken</td><td>X-auth-access-token header, domain UUID in URL</td></tr>
<tr><td>Secure Endpoint</td><td>Basic auth, client ID plus API key</td><td>Authorization header on each call</td></tr>
<tr><td>ISE ERS</td><td>Basic auth, ERS admin account</td><td>Authorization header, JSON Accept and Content-Type</td></tr>
<tr><td>Malware Analytics</td><td>API key</td><td>Authorization or key parameter</td></tr>
<tr><td>Umbrella / Secure Access</td><td>OAuth 2.0 client credentials</td><td>Bearer access token</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to deploy after an FMC API change, so nothing happens on the firewall. Looking for the FMC token in the JSON body instead of the headers. Leaving ERS disabled and getting connection errors. Storing an API client secret in a script. Automating a block without a review step or an expiry, so a mistyped domain blocks the business.</p></div>
<div class="exam"><p><b>Exam trap.</b> FMC: token in <b>response headers</b>, domain UUID in the <b>URL</b>, and changes need a <b>deployment</b>. ISE: the API is <b>ERS</b>. Secure Endpoint: basic auth with client ID and API key.</p></div>

<div class="scn"><h4>From phishing report to blocked domain</h4><p>An employee reported a phishing email. The analyst ran a small script: it took the sender's domain, asked XDR to enrich it (verdict malicious in two sources), added the domain to the Umbrella block list through the API, listed Secure Endpoint events to see which laptops had connected to it and isolated one infected laptop. Total time: four minutes. The script asked for a confirmation before the isolation step and logged every call.</p><p><b>Lesson:</b> enrich first, respond with a human check, log everything.</p></div>

<div class="iv"><p class="q">"How do you authenticate to the FMC API and push a change live?"</p><p>POST with basic auth to /api/fmc_platform/v1/auth/generatetoken; read X-auth-access-token and DOMAIN_UUID from the response headers; send the token in the X-auth-access-token header and use the domain UUID in the URL of config calls; create or edit objects and policies; then POST a deployment request to push them to the devices. Refresh the token before it expires.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security automation = enrich (ask tools about an observable) and respond (block, isolate, quarantine).</li>
<li>XDR and Umbrella / Secure Access use OAuth 2.0 client credentials and Bearer tokens.</li>
<li>FMC: token in response headers, domain UUID in the URL, deployment needed to apply changes.</li>
<li>Secure Endpoint uses basic auth with client ID and key; ISE uses the ERS API with basic auth.</li>
<li>Secure Malware Analytics detonates files and returns a threat score through an API-key REST API.</li>
</ul></div>
`,hi:`
<p>Security teams tools mein doobi rehti hain: firewall console, endpoint console, DNS filter, identity server. Automation do tareeke se madad karta hai: <b>enrich</b> (koi suspicious IP ya file hash do to har tool se poocho woh kya jaanta hai) aur <b>respond</b> (domain block karo, host isolate karo, user quarantine karo). Yeh chapter blueprint ke security products ko cover karta hai, hamesha defensive nazariye se: har ek kya karta hai, authenticate kaise karte hain, aur aam read ya response call kaunsi hai.</p>

<h3>Badi tasveer</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security platforms and their jobs">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">XDR: neeche ke tools ko correlate karo aur respond karo</text>
<rect x="10" y="62" width="196" height="64" rx="8" fill="#bae6fd"/><text x="108" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secure Firewall</text><text x="108" y="106" text-anchor="middle" class="svg-muted" font-size="12">FMC: policies, objects</text>
<rect x="222" y="62" width="196" height="64" rx="8" fill="#bbf7d0"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">hosts, events, isolation</text>
<rect x="434" y="62" width="196" height="64" rx="8" fill="#ddd6fe"/><text x="532" y="86" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="532" y="106" text-anchor="middle" class="svg-muted" font-size="12">identity, endpoints, ERS</text>
<rect x="10" y="142" width="300" height="64" rx="8" fill="#fed7aa"/><text x="160" y="166" text-anchor="middle" class="svg-ink" font-size="13">Umbrella / Secure Access</text><text x="160" y="186" text-anchor="middle" class="svg-muted" font-size="12">DNS aur web: block lists, reports</text>
<rect x="330" y="142" width="300" height="64" rx="8" fill="#e2e8f0"/><text x="480" y="166" text-anchor="middle" class="svg-ink" font-size="13">Secure Malware Analytics</text><text x="480" y="186" text-anchor="middle" class="svg-muted" font-size="12">files detonate karo, threat score</text>
</svg><p class="cap">Har tool ki apni API hai; XDR upar baithkar correlate karta hai.</p></div>

<h3>Cisco XDR</h3>
<p><b>XDR (extended detection and response)</b> endpoint, network, email aur identity tools ke signals ko ek jagah laata hai aur aapko investigate aur respond karne deta hai. Iski API <b>observables</b> ke ird-gird bani hai: evidence ka ek tukda jiska ek <b>type</b> (ip, domain, sha256, url, email) aur ek <b>value</b> hoti hai. Workflow: authenticate, <b>enrich</b> (integrated tools se observables par verdicts aur sightings poochho) aur <b>respond</b> (blocking jaise response actions chalao). Authentication <b>OAuth 2.0 client credentials</b> se hota hai: portal mein API client banate ho (client ID aur password) aur unhe chhote-time ke access token se badalte ho jo phir Bearer token ki tarah bhejte ho.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - enrichment ka idea</span>
observables = [{"type": "domain", "value": "bad-site.example"},
               {"type": "ip", "value": "203.0.113.50"}]
<span class="c"># List ko enrich endpoint par Authorization: Bearer ACCESS_TOKEN ke saath POST karo</span>
<span class="c"># Jawab har tool ke hisaab se verdicts (malicious, suspicious, clean, unknown) group karta hai</span></pre>

<h3>Secure Firewall Management Center (FMC) REST API</h3>
<p>FMC Secure Firewall (FTD) devices manage karta hai. Iski REST API se network objects banate hain, access policies edit karte hain aur changes <b>deploy</b> karte hain. Login token endpoint <code>/api/fmc_platform/v1/auth/generatetoken</code> par <b>basic auth ke saath POST</b> hai. Reply ki body mein kaam ki cheez nahi hoti; token <b>response headers</b> mein hota hai: <code>X-auth-access-token</code>, <code>X-auth-refresh-token</code> aur <code>DOMAIN_UUID</code>. Access token ko header <code>X-auth-access-token</code> mein bhejte ho aur configuration calls ke <b>URL mein domain UUID</b> daalte ho, jaise <code>/api/fmc_config/v1/domain/{domainUUID}/object/networks</code>. Token lagbhag 30 minute chalta hai aur limited baar refresh ho sakta hai. Lists <code>limit</code> aur <code>offset</code> se page hoti hain, aur <code>expanded=true</code> poore objects deta hai. API se kiya gaya change tab tak <b>active nahi</b> hota jab tak aap devices par <b>deployment</b> request na karo.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
r = requests.post(BASE + "/api/fmc_platform/v1/auth/generatetoken", auth=("api-user", "PASSWORD"), verify=False)
tok = r.headers["X-auth-access-token"]
dom = r.headers["DOMAIN_UUID"]
H = {"X-auth-access-token": tok, "Content-Type": "application/json"}
obj = {"name": "block-host-1", "type": "Host", "value": "203.0.113.50"}
requests.post(BASE + "/api/fmc_config/v1/domain/" + dom + "/object/hosts", headers=H, json=obj, verify=False)</pre>

<h3>Secure Endpoint</h3>
<p><b>Secure Endpoint</b> (pehle AMP for Endpoints) laptops aur servers ko protect karta hai. Iski API (version 3) <b>HTTP basic authentication</b> use karti hai, jismein API client ID username hai aur API key password. Kaam ke resources: <code>/v3/computers</code> (hosts), <code>/v3/events</code> (detections aur activity), file lists (allow aur block lists) aur computer ke liye isolation action, taaki aap script se shak wale host ko network se kaat sako.</p>

<h3>ISE aur ERS API</h3>
<p><b>Identity Services Engine (ISE)</b> tay karta hai ki network par kaun aur kya aa sakta hai (802.1X, MAB, guest, posture). <b>ERS (External RESTful Services) API</b> ISE objects manage karti hai: endpoints, endpoint identity groups, network devices, internal users. ERS ko <b>enable</b> karna padta hai aur account ko ERS admin role chahiye; yeh <b>basic authentication</b> use karti hai, itihaas mein port 9060 par. Paths <code>/ers/config/endpoint</code> aur <code>/ers/config/networkdevice</code> jaise dikhte hain, aur <code>Accept</code> aur <code>Content-Type</code> dono JSON (ya XML) bhejne padte hain. Successful create <b>201</b> lautata hai aur naye object ka address <code>Location</code> header mein hota hai. Lists <code>size</code> aur <code>page</code> se page hoti hain. Naye ISE versions normal HTTPS port par OpenAPI-style interface bhi jodte hain.</p>

<h3>Secure Malware Analytics</h3>
<p><b>Secure Malware Analytics</b> (pehle Threat Grid) suspicious file ya URL ko sandbox mein chalata hai aur batata hai usne kya kiya, ek <b>threat score</b> ke saath. API REST hai: <b>API key</b> se authenticate karte ho, ek sample submit karte ho (multipart file upload), aur phir analysis, behaviours aur indicators fetch karte ho. Bahut se doosre tools ise khud call karte hain.</p>

<h3>Umbrella aur Secure Access</h3>
<p><b>Umbrella</b> (DNS-layer security) aur uska successor family <b>Secure Access</b> cloud mein DNS aur web traffic filter karte hain. Inki APIs <b>OAuth 2.0 client credentials</b> use karti hain: API key aur secret banao, token endpoint se basic authentication ke saath token maango, phir har call par Bearer bhejo. Aam kaam: <b>reports</b> (kaunse domains block hue), <b>destination lists</b> (block list mein domain jodo ya hatao), <b>policies</b> aur ek <b>investigation</b> service jo domain ke baare mein jo pata hai woh lautati hai.</p>

<table class="cmp"><tr><th>Product</th><th>Authentication</th><th>Credential kahan jaata hai</th></tr>
<tr><td>XDR</td><td>OAuth 2.0 client credentials</td><td>Bearer access token</td></tr>
<tr><td>FMC</td><td>generatetoken par basic auth POST</td><td>X-auth-access-token header, URL mein domain UUID</td></tr>
<tr><td>Secure Endpoint</td><td>Basic auth, client ID plus API key</td><td>Har call par Authorization header</td></tr>
<tr><td>ISE ERS</td><td>Basic auth, ERS admin account</td><td>Authorization header, JSON Accept aur Content-Type</td></tr>
<tr><td>Malware Analytics</td><td>API key</td><td>Authorization ya key parameter</td></tr>
<tr><td>Umbrella / Secure Access</td><td>OAuth 2.0 client credentials</td><td>Bearer access token</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> FMC API change ke baad deploy karna bhool jana, jisse firewall par kuch nahi hota. FMC token ko JSON body mein dhoondhna jabki woh headers mein hai. ERS disabled chhodna aur connection errors lena. API client secret ko script mein store karna. Review step ya expiry ke bina block automate karna, jisse galat type kiya domain business ko block kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> FMC: token <b>response headers</b> mein, domain UUID <b>URL</b> mein, aur changes ko <b>deployment</b> chahiye. ISE: API ka naam <b>ERS</b> hai. Secure Endpoint: client ID aur API key ke saath basic auth.</p></div>

<div class="scn"><h4>Phishing report se blocked domain tak</h4><p>Ek employee ne phishing email report ki. Analyst ne chhoti script chalayi: usne sender ka domain liya, XDR se enrich karwaya (do sources mein verdict malicious), API se domain ko Umbrella block list mein jodha, Secure Endpoint events list kiye ki kaunse laptops us tak connect hue the, aur ek infected laptop ko isolate kiya. Kul time: chaar minute. Script ne isolation step se pehle confirmation maanga aur har call log ki.</p><p><b>Lesson:</b> pehle enrich karo, human check ke saath respond karo, sab kuch log karo.</p></div>

<div class="iv"><p class="q">"FMC API se authenticate karke change live kaise karoge?"</p><p>/api/fmc_platform/v1/auth/generatetoken par basic auth ke saath POST karo; response headers se X-auth-access-token aur DOMAIN_UUID padho; token ko X-auth-access-token header mein bhejo aur config calls ke URL mein domain UUID use karo; objects aur policies banao ya edit karo; phir unhe devices par push karne ke liye deployment request POST karo. Token expire hone se pehle refresh karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security automation = enrich (observable ke baare mein tools se poochho) aur respond (block, isolate, quarantine).</li>
<li>XDR aur Umbrella / Secure Access OAuth 2.0 client credentials aur Bearer tokens use karte hain.</li>
<li>FMC: token response headers mein, domain UUID URL mein, changes apply karne ko deployment.</li>
<li>Secure Endpoint client ID aur key ke saath basic auth use karta hai; ISE basic auth ke saath ERS API.</li>
<li>Secure Malware Analytics files detonate karta hai aur API-key REST API se threat score deta hai.</li>
</ul></div>
`}};export{e as default};