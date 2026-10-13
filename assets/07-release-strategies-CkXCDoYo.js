var e={id:`release-strategies`,h:{en:`Releasing safely: blue/green, canary, rolling updates and rollback`,hi:`Safe release: blue/green, canary, rolling updates aur rollback`},body:{en:`
<p>Changing the engine of a bus while it is running on the highway sounds crazy, yet that is what updating a live service feels like. Smart operators have a few safe tricks. They keep a second bus ready and switch passengers over in one move (blue/green). They let one bus with the new engine carry a few passengers first (canary). They replace one bus at a time on the route (rolling). And they always keep the old bus on standby in case the new one stumbles (rollback).</p>

<h3>The four release strategies</h3>
<dl class="terms">
<dt>Recreate</dt><dd>Stop the old version, start the new one. Simple, but there is <b>downtime</b>. Fine for a dev environment or an overnight window.</dd>
<dt>Rolling update</dt><dd>Replace instances a few at a time. Old and new versions run side by side for a while, so they must be compatible. No downtime, little extra capacity needed.</dd>
<dt>Blue/green</dt><dd>Keep <b>two identical environments</b>. Blue is live with version 1. You deploy version 2 to green, test it with no users on it, then <b>flip the router or load balancer</b> to green in one step. Blue stays idle and untouched as an instant rollback target. Cost: double capacity during the switch.</dd>
<dt>Canary</dt><dd>Send a <b>small share of real traffic</b> (say 5%) to the new version, watch error rates and latency, then grow to 25%, 50% and 100%. If metrics worsen, send everything back. The name comes from the canary bird that warned miners of bad air.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Blue green and canary traffic">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Blue/green</text>
<rect x="90" y="30" width="140" height="34" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="20" y="130" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="153" text-anchor="middle" class="svg-ink" font-size="12">Blue v1</text><text x="80" y="170" text-anchor="middle" class="svg-muted" font-size="11">idle, ready to return</text>
<rect x="180" y="130" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="153" text-anchor="middle" class="svg-ink" font-size="12">Green v2</text><text x="240" y="170" text-anchor="middle" class="svg-muted" font-size="11">100% after flip</text>
<line x1="150" y1="64" x2="80" y2="130" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="170" y1="64" x2="240" y2="130" stroke="#64748b" stroke-width="3"/>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Canary</text>
<rect x="410" y="30" width="140" height="34" rx="8" fill="#bae6fd"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="350" y="130" width="120" height="50" rx="8" fill="#bae6fd"/><text x="410" y="153" text-anchor="middle" class="svg-ink" font-size="12">Stable v1</text><text x="410" y="170" text-anchor="middle" class="svg-muted" font-size="11">95% of traffic</text>
<rect x="510" y="130" width="120" height="50" rx="8" fill="#fde68a"/><text x="570" y="153" text-anchor="middle" class="svg-ink" font-size="12">Canary v2</text><text x="570" y="170" text-anchor="middle" class="svg-muted" font-size="11">5% of traffic</text>
<line x1="470" y1="64" x2="410" y2="130" stroke="#64748b" stroke-width="3"/><line x1="490" y1="64" x2="570" y2="130" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="214" text-anchor="middle" class="svg-accent" font-size="12">Rollback = point the balancer back at the old version</text>
</svg><p class="cap">Blue/green flips everything at once; canary shifts gradually.</p></div>

<h3>Rollback</h3>
<p>A <b>rollback</b> returns to the last known good version. It is only fast if you prepared for it: keep the previous artifact (image tag) in the registry, keep database changes backward compatible (add a column first, remove the old one in a later release), and practise the procedure. With immutable images, rollback is simply "deploy tag 1.4 again". Decide <b>before</b> the release what signals mean roll back, for example an error rate above 2% for five minutes, instead of arguing during an incident.</p>

<h3>Reference code (not run in the simulator)</h3>
<p>A blue/green switch on a reverse proxy is a one-line change. The proxy sends traffic to whichever pool is named in the upstream:</p>
<pre class="code"><span class="c"># nginx: two pools, one active</span>
upstream blue  { server 10.20.0.11:8080; server 10.20.0.12:8080; }
upstream green { server 10.20.0.21:8080; server 10.20.0.22:8080; }

server {
    listen 80;
    location / {
        proxy_pass h&#116;tp://green;     <span class="c"># change blue to green and reload to flip</span>
    }
}</pre>
<p>A canary can be a weighted pool:</p>
<pre class="code">upstream app {
    server 10.20.0.11:8080 weight=19;   <span class="c"># stable, about 95%</span>
    server 10.20.0.21:8080 weight=1;    <span class="c"># canary, about 5%</span>
}</pre>
<p><b>Serverless</b> uses the same ideas: you upload a function and the cloud runs it per event. A minimal Python function in the style of a cloud function looks like this:</p>
<pre class="code">def handler(event, context):
    <span class="c"># event holds the trigger data, for example a device name from an alert</span>
    device = event.get("device", "unknown")
    print("received alert for", device)           <span class="c"># goes to the platform log</span>
    return {"status": "ok", "device": device}</pre>
<p>Versions and aliases in a serverless platform give you blue/green and canary for free: an alias can point 90% at version 4 and 10% at version 5.</p>

<div class="eg"><p><b>Worked example.</b> Release 2.0 of the inventory API. Green gets 2.0 while blue serves users. QA tests green through a private address and sees no errors. At 22:00 the team switches the balancer to green; users notice nothing. At 22:07 the error rate climbs to 6%. The team flips back to blue in under 30 seconds. Total user impact: seven minutes of a few errors, no emergency rebuild.</p></div>

<div class="warn"><p><b>Common mistakes:</b> a database change that breaks the old version (rollback impossible); deleting blue right after the flip; sending canary traffic without monitoring, which is just a slow full release.</p></div>
<div class="exam"><p><b>Exam trap:</b> blue/green = two full environments and an instant switch; canary = a <b>percentage</b> of users first. Rolling = replace gradually in place. "Zero downtime" applies to blue/green, canary and rolling, not recreate.</p></div>

<div class="scn"><h4>Friday canary</h4><p>A Mumbai ISP pushed a new customer-portal build as a 5% canary. Dashboards showed login latency tripling for canary users only. The team routed 100% back to the stable pool within a minute, and only 5% of customers had a slow login for ten minutes. The bug was a missing index on a new query.</p><p><b>Lesson:</b> a canary limits the blast radius; the rollback you pre-planned makes it cheap.</p></div>

<div class="iv"><p class="q">"Explain blue/green and canary, and when you would choose each."</p><p>Blue/green: two environments, instant switch and instant rollback, costs double capacity. Canary: gradual exposure with real metrics, best when you cannot fully test with synthetic traffic. Mention rollback criteria and database compatibility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recreate has downtime; rolling, blue/green and canary do not.</li>
<li>Blue/green flips traffic between two identical environments; canary shifts a small percentage first.</li>
<li>Fast rollback needs the previous artifact kept and backward-compatible data changes.</li>
<li>Decide rollback triggers before the release.</li>
</ul></div>
`,hi:`
<p>Highway par chalti bus ka engine badalna pagalpan lagta hai, lekin live service update karna kuch waisa hi lagta hai. Smart operators ke paas kuch safe tareeke hain. Woh doosri bus taiyaar rakhte hain aur passengers ko ek jhatke mein switch karte hain (blue/green). Naye engine wali ek bus pehle kuch passengers ko le jaati hai (canary). Route par ek-ek bus badalte jaate hain (rolling). Aur purani bus hamesha standby rakhte hain agar nayi lade-khade (rollback).</p>

<h3>Chaar release strategies</h3>
<dl class="terms">
<dt>Recreate</dt><dd>Purana version band karo, naya start karo. Simple, lekin <b>downtime</b> hota hai. Dev environment ya raat ki window ke liye theek.</dd>
<dt>Rolling update</dt><dd>Instances ek-ek karke badlo. Kuch der purana aur naya version saath chalte hain, isliye compatible hone chahiye. Downtime nahi, extra capacity kam.</dd>
<dt>Blue/green</dt><dd><b>Do identical environments</b> rakho. Blue version 1 ke saath live hai. Version 2 green par deploy karo, bina users ke test karo, phir <b>router ya load balancer ko ek step mein</b> green par flip karo. Blue idle aur untouched rehta hai, instant rollback target ki tarah. Cost: switch ke dauran double capacity.</dd>
<dt>Canary</dt><dd>Asli traffic ka <b>chhota hissa</b> (maan lo 5%) naye version ko bhejo, error rates aur latency dekho, phir 25%, 50%, 100% tak badhao. Metrics bigdein to sab wapas bhej do. Naam us canary chidiya se aaya jo khadan mein khatarnaak hawa ki chetawani deti thi.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Blue green aur canary traffic">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Blue/green</text>
<rect x="90" y="30" width="140" height="34" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="20" y="130" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="153" text-anchor="middle" class="svg-ink" font-size="12">Blue v1</text><text x="80" y="170" text-anchor="middle" class="svg-muted" font-size="11">idle, wapas ke liye taiyaar</text>
<rect x="180" y="130" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="153" text-anchor="middle" class="svg-ink" font-size="12">Green v2</text><text x="240" y="170" text-anchor="middle" class="svg-muted" font-size="11">flip ke baad 100%</text>
<line x1="150" y1="64" x2="80" y2="130" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="170" y1="64" x2="240" y2="130" stroke="#64748b" stroke-width="3"/>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Canary</text>
<rect x="410" y="30" width="140" height="34" rx="8" fill="#bae6fd"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="12">Load balancer</text>
<rect x="350" y="130" width="120" height="50" rx="8" fill="#bae6fd"/><text x="410" y="153" text-anchor="middle" class="svg-ink" font-size="12">Stable v1</text><text x="410" y="170" text-anchor="middle" class="svg-muted" font-size="11">95% traffic</text>
<rect x="510" y="130" width="120" height="50" rx="8" fill="#fde68a"/><text x="570" y="153" text-anchor="middle" class="svg-ink" font-size="12">Canary v2</text><text x="570" y="170" text-anchor="middle" class="svg-muted" font-size="11">5% traffic</text>
<line x1="470" y1="64" x2="410" y2="130" stroke="#64748b" stroke-width="3"/><line x1="490" y1="64" x2="570" y2="130" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="214" text-anchor="middle" class="svg-accent" font-size="12">Rollback = balancer ko wapas purane version par point karo</text>
</svg><p class="cap">Blue/green sab kuch ek saath flip karta hai; canary dheere dheere shift karta hai.</p></div>

<h3>Rollback</h3>
<p><b>Rollback</b> last known good version par lautna hai. Yeh tabhi tez hai jab pehle se taiyaari ho: pichla artifact (image tag) registry mein rakho, database changes backward compatible rakho (pehle column jodo, purana agli release mein hatao), aur procedure ki practice karo. Immutable images ke saath rollback bas "tag 1.4 dobara deploy karo" hai. <b>Release se pehle</b> tay karo ki kaunse signals ka matlab rollback hai, jaise paanch minute tak error rate 2% se upar, taaki incident ke dauran bahas na ho.</p>

<h3>Reference code (simulator mein nahi chalta)</h3>
<p>Reverse proxy par blue/green switch ek line ka change hai. Proxy traffic usi pool ko bhejta hai jiska naam upstream mein hai:</p>
<pre class="code"><span class="c"># nginx: do pools, ek active</span>
upstream blue  { server 10.20.0.11:8080; server 10.20.0.12:8080; }
upstream green { server 10.20.0.21:8080; server 10.20.0.22:8080; }

server {
    listen 80;
    location / {
        proxy_pass h&#116;tp://green;     <span class="c"># blue ko green karo aur reload karo to flip</span>
    }
}</pre>
<p>Canary weighted pool ho sakta hai:</p>
<pre class="code">upstream app {
    server 10.20.0.11:8080 weight=19;   <span class="c"># stable, lagbhag 95%</span>
    server 10.20.0.21:8080 weight=1;    <span class="c"># canary, lagbhag 5%</span>
}</pre>
<p><b>Serverless</b> mein wahi ideas hain: aap function upload karte ho aur cloud use har event par chalata hai. Cloud function ke style mein minimal Python function aisa dikhta hai:</p>
<pre class="code">def handler(event, context):
    <span class="c"># event mein trigger ka data hota hai, jaise alert se device ka naam</span>
    device = event.get("device", "unknown")
    print("received alert for", device)           <span class="c"># platform log mein jaata hai</span>
    return {"status": "ok", "device": device}</pre>
<p>Serverless platform ke versions aur aliases blue/green aur canary free mein dete hain: ek alias 90% version 4 par aur 10% version 5 par point kar sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Inventory API ki release 2.0. Green par 2.0 hai jabki blue users ko serve kar raha hai. QA green ko private address se test karta hai, koi error nahi. Raat 22:00 team balancer ko green par switch karti hai; users ko pata nahi chalta. 22:07 par error rate 6% tak chadh jaata hai. Team 30 second se kam mein blue par wapas flip karti hai. Total user impact: saat minute thode errors, koi emergency rebuild nahi.</p></div>

<div class="warn"><p><b>Common mistakes:</b> aisa database change jo purane version ko tod de (rollback impossible); flip ke turant baad blue delete kar dena; bina monitoring ke canary traffic bhejna, jo bas dheemi full release hai.</p></div>
<div class="exam"><p><b>Exam trap:</b> blue/green = do poore environments aur instant switch; canary = pehle users ka <b>percentage</b>. Rolling = jagah par dheere dheere replace. "Zero downtime" blue/green, canary aur rolling par lagu hai, recreate par nahi.</p></div>

<div class="scn"><h4>Friday canary</h4><p>Mumbai ke ek ISP ne naya customer-portal build 5% canary ki tarah push kiya. Dashboards mein sirf canary users ke liye login latency teen guna dikhi. Team ne ek minute ke andar 100% wapas stable pool par route kiya, aur sirf 5% customers ko das minute dheema login mila. Bug naye query par missing index ka tha.</p><p><b>Lesson:</b> canary blast radius chhota rakhta hai; pehle se planned rollback use sasta bana deta hai.</p></div>

<div class="iv"><p class="q">"Blue/green aur canary samjhao, aur kab kaunsa chunoge."</p><p>Blue/green: do environments, instant switch aur instant rollback, double capacity ka cost. Canary: asli metrics ke saath gradual exposure, jab synthetic traffic se poora test nahi ho sakta tab best. Rollback criteria aur database compatibility ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recreate mein downtime; rolling, blue/green aur canary mein nahi.</li>
<li>Blue/green do identical environments ke beech traffic flip karta hai; canary pehle chhota percentage shift karta hai.</li>
<li>Tez rollback ke liye pichla artifact aur backward-compatible data changes chahiye.</li>
<li>Rollback triggers release se pehle tay karo.</li>
</ul></div>
`}};export{e as default};