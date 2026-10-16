var e={id:`casb-fw`,h:{en:`CASB, tenant controls, destination lists, cloud firewall, IPS and browser isolation`,hi:`CASB, tenant controls, destination lists, cloud firewall, IPS aur browser isolation`},body:{en:`
<p>Imagine an office where staff are allowed to use the company locker room, but some people quietly rent their own private lockers across the road and keep company files there. A good security manager first finds out which lockers people are using, then says "company lockers only, and only the company's own section". That is what a <b>CASB</b> does for cloud apps: it discovers <b>shadow IT</b>, rates each app's risk and enforces which apps, and which tenant of an app, may be used.</p>

<h3>CASB: discover, assess, control</h3>
<ul>
<li><b>Discover.</b> Because every DNS and web request passes through Secure Access, it can list every cloud app in use, by whom and how much data moved. Unknown apps that IT never approved are shadow IT.</li>
<li><b>Assess.</b> Each app in the catalog carries a <b>risk</b> rating built from factors such as data handling, compliance certifications, encryption and vendor security history. In the lab, <b>Resources, Applications</b> shows SalesFlow CRM (SaaS and B2B, Low), Friendbook (Social Networking, Medium), ClipShare (Streaming Video, Low), Cloudbox (Cloud Storage, Medium), ChatAI (Generative AI, High) and DevHub (Software/Technology, Low).</li>
<li><b>Control inline.</b> Use applications and categories as destinations in internet rules: allow the sanctioned app, warn or block the rest.</li>
<li><b>Control out of band.</b> API-based CASB connects to sanctioned SaaS (for example the corporate file-sharing tenant) through the vendor's API and scans data <b>already stored</b> there, for example for publicly shared files or sensitive data at rest (SaaS API DLP, chapter 8).</li>
</ul>

<h3>Tenant controls: the company's section only</h3>
<p>Blocking Cloud Storage entirely is often impossible: the business uses Cloudbox every day. The risk is a user uploading to a <b>personal</b> Cloudbox account. <b>Tenant controls</b> allow only named corporate tenants of an app. Real products do this by inserting a tenant-restriction header into decrypted requests, so <b>decryption is required</b>. In the lab rule dialog the field is <b>Tenant controls (Cloudbox)</b>, "Allowed tenants, e.g. nwkings".</p>
<pre class="out">ROAM1&gt; upload team-offsite.pdf personal.cloudbox.example/upload
&lt;h1&gt;This site is blocked&lt;/h1&gt;...
&lt;p&gt;Reason: <span class="hl">Tenant Controls: Cloudbox tenant "personal" is not allowed</span> · Rule: Allow Cloudbox&lt;/p&gt;

ROAM1&gt; upload team-offsite.pdf nwkings.cloudbox.example/upload
{"status":"uploaded","workspace":"<span class="hl">nwkings</span>","file":"team-offsite.pdf","bytes":115}</pre>

<h3>Destination lists: reusable and automatable</h3>
<p><b>Resources, Destination Lists</b> holds named lists of domains and IPs, each with an intended action (Block or Allow), referenced by rules. Two global lists exist by default. Lists are the right tool for incident response: one list such as IR-Blocklist, referenced once by a block rule at the top, and every new indicator becomes a one-line addition, by hand or through the Destination Lists API from a SOAR playbook. You will do exactly this in the NOC lab.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Inline and API CASB">
<rect x="10" y="85" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="180" y="75" width="150" height="64" rx="8" fill="#ddd6fe"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="255" y="120" text-anchor="middle" class="svg-muted" font-size="11">inline: rules, tenants</text>
<rect x="420" y="30" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="57" text-anchor="middle" class="svg-ink" font-size="12">Cloudbox: nwkings tenant</text>
<rect x="420" y="140" width="200" height="44" rx="8" fill="#fed7aa"/><text x="520" y="167" text-anchor="middle" class="svg-ink" font-size="12">Cloudbox: personal tenant</text>
<line x1="120" y1="107" x2="180" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="95" x2="420" y2="55" stroke="#64748b" stroke-width="2"/><text x="375" y="66" text-anchor="middle" class="svg-muted" font-size="11">allowed</text>
<line x1="330" y1="120" x2="420" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="375" y="160" text-anchor="middle" class="svg-muted" font-size="11">blocked</text>
<path d="M255 75 Q 340 0 430 30" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/><text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="11">API CASB: scans data at rest</text>
</svg><p class="cap">Inline CASB decides on live traffic; API CASB inspects what is already stored in the sanctioned tenant.</p></div>

<h3>Cloud firewall (FWaaS) and IPS</h3>
<p>Not all traffic is web. A branch behind a network tunnel also sends SSH, SMTP, NTP, VoIP and custom ports. The <b>cloud firewall</b> applies Layer 3/4 rules (source, destination, protocol, port) and application identification to that traffic, and an <b>intrusion prevention system</b> (Snort-based, like the IPS you studied on Threat Defense) inspects it for exploit signatures. Typical uses: block outbound SMB and RDP to the internet from branches, allow only the mail relay to send SMTP, and let IPS protect private apps reached through Secure Access. The roaming module steers DNS and web; non-web traffic from a roaming laptop is covered when it travels over ZTNA or RAVPN.</p>

<h3>File inspection and remote browser isolation</h3>
<p>With <b>File inspection</b> on (and decryption for HTTPS), downloads are checked against Secure Endpoint file reputation and unknown files can be sandboxed. Try it from a protected laptop:</p>
<pre class="out">ROAM1&gt; download cdn.freeware.example/tools/keygen.exe
...Reason: <span class="hl">File Inspection: W32.Trojan.KeyStealer</span> (SHA-256 9f1c0d6e…a41b, Secure Endpoint disposition: Malicious)</pre>
<p><b>Remote browser isolation (RBI)</b> is the <b>Isolate</b> action: the page runs in a disposable cloud browser and the user receives a safe rendering. Use it for uncategorised or newly seen sites that you do not want to block outright, and to make risky sites read-only (no uploads, no typing passwords).</p>

<div class="eg"><p><b>Worked example.</b> App Discovery for MyPnetLab shows 41 cloud apps in a month: 9 sanctioned, 32 not. Three unsanctioned file-sharing apps moved 2.4 GB of uploads. Policy: allow Cloudbox with tenant control nwkings, block the Cloud Storage category for everyone else with a Warn exception for Marketing to one partner app, and put the three apps into a destination list referenced by a block rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring tenant controls with decryption off, so the header is never inserted. Blocking a whole category that the business depends on instead of using tenant controls. Creating a new rule per incident instead of one rule plus a destination list.</p></div>

<div class="exam"><p><b>Exam traps.</b> CASB modes: <b>inline/proxy</b> (real-time control) and <b>API</b> (out-of-band, data at rest). Shadow IT discovery comes from traffic logs. Tenant controls need decryption. RBI = Isolate. The cloud firewall handles non-web ports and protocols; IPS is part of it.</p></div>

<div class="scn"><h4>The contractor's personal drive</h4><p>An auditor noticed that a contractor's laptop had uploaded 600 MB to Cloudbox in one evening. Activity Search showed the uploads went to personal.cloudbox.example, not the corporate tenant. The engineer enabled decryption for the profile used by the Cloudbox rule and set tenant control to nwkings. The next attempt was blocked with "Tenant Controls: Cloudbox tenant personal is not allowed", while uploads to nwkings.cloudbox.example continued.</p><p><b>Lesson:</b> allow the app, restrict the tenant; do not choose between blocking the business and leaking data.</p></div>

<div class="iv"><p class="q">"What is a CASB and what are its two deployment modes?"</p><p>Strong answer: a CASB gives visibility and control over cloud apps: shadow IT discovery, app risk scoring, inline controls (allow, block, tenant restrictions, activity controls, DLP) through the proxy, and API-based scanning of data at rest in sanctioned SaaS. Inline needs traffic steering and decryption; API needs admin consent to the SaaS tenant. Give a tenant-control example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CASB discovers shadow IT, rates app risk and controls apps inline or through APIs.</li>
<li>Tenant controls allow only the corporate tenant of a SaaS app and need decryption.</li>
<li>Destination lists make incident blocking reusable and API-driven.</li>
<li>The cloud firewall and IPS cover non-web traffic from tunnels, ZTNA and VPN.</li>
<li>File inspection checks downloads; RBI (Isolate) renders risky sites safely.</li>
</ul></div>
`,hi:`
<p>Ek office socho jahan staff ko company ka locker room use karne ki permission hai, par kuch log chupke se sadak paar apne private lockers kiraye par lekar company files wahan rakhte hain. Achha security manager pehle pata karta hai ki log kaunse lockers use kar rahe hain, phir kehta hai "sirf company lockers, aur sirf company ka apna section". Cloud apps ke liye <b>CASB</b> yahi karta hai: <b>shadow IT</b> dhoondhta hai, har app ka risk rate karta hai aur enforce karta hai ki kaunse apps, aur app ka kaunsa tenant, use ho sakta hai.</p>

<h3>CASB: discover, assess, control</h3>
<ul>
<li><b>Discover.</b> Kyunki har DNS aur web request Secure Access se guzarti hai, yeh use ho rahe har cloud app ki list bana sakta hai, kisne use kiya aur kitna data gaya. IT ne jo unknown apps kabhi approve nahi kiye woh shadow IT hain.</li>
<li><b>Assess.</b> Catalog mein har app ki ek <b>risk</b> rating hoti hai jo data handling, compliance certifications, encryption aur vendor security history jaise factors se banti hai. Lab mein <b>Resources, Applications</b> dikhata hai SalesFlow CRM (SaaS and B2B, Low), Friendbook (Social Networking, Medium), ClipShare (Streaming Video, Low), Cloudbox (Cloud Storage, Medium), ChatAI (Generative AI, High) aur DevHub (Software/Technology, Low).</li>
<li><b>Inline control.</b> Internet rules mein applications aur categories ko destinations ki tarah use karo: sanctioned app allow, baaki warn ya block.</li>
<li><b>Out of band control.</b> API-based CASB sanctioned SaaS (jaise corporate file-sharing tenant) se vendor ke API ke through judta hai aur wahan <b>pehle se stored</b> data scan karta hai, jaise publicly shared files ya data at rest mein sensitive data (SaaS API DLP, chapter 8).</li>
</ul>

<h3>Tenant controls: sirf company ka section</h3>
<p>Cloud Storage ko poori tarah block karna aksar possible nahi hota: business roz Cloudbox use karta hai. Risk hai ki user <b>personal</b> Cloudbox account par upload kare. <b>Tenant controls</b> app ke sirf named corporate tenants allow karte hain. Real products yeh decrypted requests mein tenant-restriction header daal kar karte hain, isliye <b>decryption zaroori hai</b>. Lab rule dialog mein field hai <b>Tenant controls (Cloudbox)</b>, "Allowed tenants, e.g. nwkings".</p>
<pre class="out">ROAM1&gt; upload team-offsite.pdf personal.cloudbox.example/upload
&lt;h1&gt;This site is blocked&lt;/h1&gt;...
&lt;p&gt;Reason: <span class="hl">Tenant Controls: Cloudbox tenant "personal" is not allowed</span> · Rule: Allow Cloudbox&lt;/p&gt;

ROAM1&gt; upload team-offsite.pdf nwkings.cloudbox.example/upload
{"status":"uploaded","workspace":"<span class="hl">nwkings</span>","file":"team-offsite.pdf","bytes":115}</pre>

<h3>Destination lists: reusable aur automatable</h3>
<p><b>Resources, Destination Lists</b> mein domains aur IPs ki named lists hoti hain, har ek ka intended action (Block ya Allow), jo rules se referenced hoti hain. Default mein do global lists hoti hain. Incident response ke liye lists sahi tool hain: IR-Blocklist jaisi ek list, top par ek block rule se ek baar referenced, aur har naya indicator ek line ka addition ban jaata hai, haath se ya SOAR playbook se Destination Lists API ke through. NOC lab mein aap bilkul yahi karoge.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Inline and API CASB">
<rect x="10" y="85" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="12">User</text>
<rect x="180" y="75" width="150" height="64" rx="8" fill="#ddd6fe"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="255" y="120" text-anchor="middle" class="svg-muted" font-size="11">inline: rules, tenants</text>
<rect x="420" y="30" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="57" text-anchor="middle" class="svg-ink" font-size="12">Cloudbox: nwkings tenant</text>
<rect x="420" y="140" width="200" height="44" rx="8" fill="#fed7aa"/><text x="520" y="167" text-anchor="middle" class="svg-ink" font-size="12">Cloudbox: personal tenant</text>
<line x1="120" y1="107" x2="180" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="95" x2="420" y2="55" stroke="#64748b" stroke-width="2"/><text x="375" y="66" text-anchor="middle" class="svg-muted" font-size="11">allowed</text>
<line x1="330" y1="120" x2="420" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="375" y="160" text-anchor="middle" class="svg-muted" font-size="11">blocked</text>
<path d="M255 75 Q 340 0 430 30" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/><text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="11">API CASB: data at rest scan</text>
</svg><p class="cap">Inline CASB live traffic par decide karta hai; API CASB sanctioned tenant mein pehle se stored cheezein inspect karta hai.</p></div>

<h3>Cloud firewall (FWaaS) aur IPS</h3>
<p>Saara traffic web nahi hota. Network tunnel ke peeche branch SSH, SMTP, NTP, VoIP aur custom ports bhi bhejti hai. <b>Cloud firewall</b> us traffic par Layer 3/4 rules (source, destination, protocol, port) aur application identification lagata hai, aur ek <b>intrusion prevention system</b> (Snort-based, waisa hi IPS jo aapne Threat Defense par padha) use exploit signatures ke liye inspect karta hai. Typical uses: branches se internet tak outbound SMB aur RDP block karo, sirf mail relay ko SMTP bhejne do, aur IPS ko Secure Access se pahunche private apps protect karne do. Roaming module DNS aur web steer karta hai; roaming laptop ka non-web traffic tab cover hota hai jab woh ZTNA ya RAVPN se jaata hai.</p>

<h3>File inspection aur remote browser isolation</h3>
<p><b>File inspection</b> on hone par (aur HTTPS ke liye decryption ke saath), downloads Secure Endpoint file reputation ke against check hote hain aur unknown files sandbox ho sakti hain. Protected laptop se try karo:</p>
<pre class="out">ROAM1&gt; download cdn.freeware.example/tools/keygen.exe
...Reason: <span class="hl">File Inspection: W32.Trojan.KeyStealer</span> (SHA-256 9f1c0d6e…a41b, Secure Endpoint disposition: Malicious)</pre>
<p><b>Remote browser isolation (RBI)</b> <b>Isolate</b> action hai: page ek disposable cloud browser mein chalta hai aur user ko safe rendering milti hai. Ise uncategorised ya newly seen sites ke liye use karo jinhe aap seedha block nahi karna chahte, aur risky sites ko read-only banane ke liye (koi upload nahi, password type karna nahi).</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab ka App Discovery ek mahine mein 41 cloud apps dikhata hai: 9 sanctioned, 32 nahi. Teen unsanctioned file-sharing apps ne 2.4 GB uploads kiye. Policy: Cloudbox ko tenant control nwkings ke saath allow karo, baaki sabke liye Cloud Storage category block karo aur Marketing ke liye ek partner app par Warn exception do, aur teen apps ko ek destination list mein daalo jo block rule se referenced ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Decryption off rakh kar tenant controls configure karna, jisse header kabhi insert nahi hota. Tenant controls use karne ki jagah poori category block karna jis par business depend karta hai. Ek rule plus destination list ki jagah har incident ke liye naya rule banana.</p></div>

<div class="exam"><p><b>Exam traps.</b> CASB modes: <b>inline/proxy</b> (real-time control) aur <b>API</b> (out-of-band, data at rest). Shadow IT discovery traffic logs se aati hai. Tenant controls ko decryption chahiye. RBI = Isolate. Cloud firewall non-web ports aur protocols handle karta hai; IPS uska hissa hai.</p></div>

<div class="scn"><h4>Contractor ki personal drive</h4><p>Ek auditor ne dekha ki ek contractor ke laptop ne ek shaam mein Cloudbox par 600 MB upload kiya. Activity Search ne dikhaya ki uploads personal.cloudbox.example par gaye, corporate tenant par nahi. Engineer ne Cloudbox rule ke profile mein decryption enable kiya aur tenant control nwkings set kiya. Agli koshish "Tenant Controls: Cloudbox tenant personal is not allowed" ke saath block hui, jabki nwkings.cloudbox.example par uploads chalte rahe.</p><p><b>Seekh:</b> app allow karo, tenant restrict karo; business block karne aur data leak hone mein se ek chunne ki zaroorat nahi.</p></div>

<div class="iv"><p class="q">"CASB kya hai aur iske do deployment modes kaunse hain?"</p><p>Strong answer: CASB cloud apps par visibility aur control deta hai: shadow IT discovery, app risk scoring, proxy ke through inline controls (allow, block, tenant restrictions, activity controls, DLP), aur sanctioned SaaS mein data at rest ka API-based scanning. Inline ko traffic steering aur decryption chahiye; API ko SaaS tenant par admin consent chahiye. Ek tenant-control example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CASB shadow IT dhoondhta hai, app risk rate karta hai aur apps ko inline ya APIs se control karta hai.</li>
<li>Tenant controls SaaS app ka sirf corporate tenant allow karte hain aur unhe decryption chahiye.</li>
<li>Destination lists incident blocking ko reusable aur API-driven banati hain.</li>
<li>Cloud firewall aur IPS tunnels, ZTNA aur VPN ka non-web traffic cover karte hain.</li>
<li>File inspection downloads check karta hai; RBI (Isolate) risky sites ko safely render karta hai.</li>
</ul></div>
`}};export{e as default};