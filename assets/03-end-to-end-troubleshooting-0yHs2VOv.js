var e={id:`end-to-end`,h:{en:`End-to-end troubleshooting: forwarding, identity, policy, destination`,hi:`End-to-end troubleshooting: forwarding, identity, policy, destination`},body:{en:`
<h3>One method for every ticket</h3>
<p>"The internet is not working" can hide twenty different faults. A new engineer jumps to the policy page because it is familiar. A good engineer walks the request <b>in the order it travels</b>, using four layers. At each layer you ask one question and prove the answer before moving on.</p>
<ol>
<li><b>Forwarding:</b> did the request reach the cloud at all, and by which path (tunnel, proxy, client, direct)?</li>
<li><b>Identity:</b> does the cloud know the user, and which groups?</li>
<li><b>Policy:</b> which rule decided, and is it the intended one?</li>
<li><b>Destination:</b> is the site or application itself reachable and healthy from the cloud?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four layer method">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="14">1 Forwarding</text><text x="80" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel up? PAC?</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="14">2 Identity</text><text x="240" y="92" text-anchor="middle" class="svg-muted" font-size="12">user, groups?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="14">3 Policy</text><text x="400" y="92" text-anchor="middle" class="svg-muted" font-size="12">which rule?</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="14">4 Destination</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">site healthy?</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">stop at the first layer that fails; fix it; then re-test from layer 1</text>
</svg><p class="cap">Follow the packet, not your habits.</p></div>

<h3>Evidence at each layer</h3>
<table class="cmp"><tr><th>Layer</th><th>Where you look</th><th>Failure looks like</th></tr>
<tr><td>Forwarding</td><td>Locations page, tunnel status, client commands, tester path line</td><td>Tunnel down, wrong destination, PAC URL differs, bypass hit</td></tr>
<tr><td>Identity</td><td>Identity page, tester identity line</td><td>401, unknown user, no groups</td></tr>
<tr><td>Policy</td><td>Tester rule line, logs</td><td>403 from a rule, default allow instead of block</td></tr>
<tr><td>Destination</td><td>Tester result, other users, digital experience hops</td><td>Application slow or down for everyone</td></tr>
</table>
<p>Two habits make this fast: <b>test from the user's seat</b> (client commands such as <code>zapp status</code>, <code>pac show</code>, <code>curl</code>) and <b>change one thing at a time</b>, re-testing after each change so you know which change worked.</p>

<h3>Multi-site outage method</h3>
<p>When two or more sites fail together, resist treating each as a separate mystery. First ask <b>what do they have in common?</b> A recent change, the same cloud node, the same identity, the same ISP. If the sites use different methods (one GRE, one PAC), a common cloud cause is less likely and <b>two independent faults</b> from one change window is more likely. Fix them one at a time and verify each.</p>

<div class="eg"><p><b>Worked example, ticket 321090 and lab zs-ops-2.</b> After a weekend change, Chennai and Jaipur are both down; Pune works.</p></div>
<pre class="out">Locations
Site     Method  Status
Pune     IPsec   up
Chennai  GRE     <span class="hl">DOWN</span>   destination 203.0.113.10 is not a cloud node
Jaipur   PAC     (traffic goes direct and is blocked by the edge)

PC-JPR   pac show
Browser PAC: pac2.sahyadri.example/proxy.pac
<span class="hl">Portal PAC differs from the browser PAC</span></pre>
<p><b>Layer 1 for Chennai:</b> the GRE destination must be a cloud node address; the primary node is 203.0.113.101. The weekend change typed a wrong address. Correct it, activate, confirm the tunnel is up. <b>Layer 1 for Jaipur:</b> the browser points to a different PAC address than the portal, so the browser falls back to direct, and the edge firewall blocks direct internet. Set the PAC on the PCs back to the portal value (or update both consistently), then confirm a request is proxied. After both fixes, run layers 2 to 4 for a test user at each site: identity known, intended rule, destination reachable. Last, check logs show requests from both sites.</p>

<h3>When the destination is the problem</h3>
<p>If forwarding, identity and policy are right and one site is slow or down for everyone, the fault is at the destination. Say so with evidence (tester result allowed, others also failing, hop table) and hand it to the application owner. Not every ticket is yours.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Each fix here changes a different thing: the GRE destination changes where tunnel packets go; the PAC URL changes which proxy the browser uses; identity and policy fixes change who is known and which rule fires. Naming the effect before you click keeps you from fixing the wrong layer.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting at policy. (2) Fixing two things at once and not knowing which helped. (3) Declaring victory after one test user. (4) Forgetting that a direct path produces no logs.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matters: a policy tweak cannot fix a down tunnel. If the path line says tunnel down or direct, nothing after it can be trusted.</p></div>

<div class="scn"><h4>Two sites, two causes</h4><p>A manager insisted the cloud service was down. The engineer found a wrong GRE destination in Chennai and a different PAC URL in Jaipur, both typed during the same change window. Two small fixes, verified one by one, and Pune users never noticed.</p><p><b>Lesson:</b> a common event, not a common component, can explain a multi-site outage.</p></div>

<div class="iv"><p class="q">"Describe your troubleshooting method for a web access problem."</p><p>Four layers in order: forwarding, identity, policy, destination. Prove each with the portal and a test from the user's seat, change one thing at a time, and verify before closing. For multi-site issues, look for the common change first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the request in order: forwarding, identity, policy, destination.</li>
<li>Test from the user's seat; change one thing at a time.</li>
<li>Multi-site outage: find the common change; there may be two faults.</li>
<li>Direct traffic means no policy and no logs.</li>
<li>Always verify at every site you touched.</li>
</ul></div>
`,hi:`
<h3>Har ticket ke liye ek method</h3>
<p>"Internet kaam nahi kar raha" ke peeche bees alag faults ho sakte hain. Naya engineer policy page par kood jaata hai kyunki woh jaana-pehchaana hai. Achha engineer request ko <b>usi order mein chalta hai jisme woh travel karti hai</b>, chaar layers se. Har layer par ek sawaal poochho aur aage badhne se pehle jawab prove karo.</p>
<ol>
<li><b>Forwarding:</b> kya request cloud tak pahunchi, aur kis path se (tunnel, proxy, client, direct)?</li>
<li><b>Identity:</b> kya cloud user ko jaanta hai, aur kaun se groups?</li>
<li><b>Policy:</b> kaun se rule ne decide kiya, aur kya woh intended hai?</li>
<li><b>Destination:</b> kya site ya application khud cloud se reachable aur healthy hai?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four layer method">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="14">1 Forwarding</text><text x="80" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel up? PAC?</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="14">2 Identity</text><text x="240" y="92" text-anchor="middle" class="svg-muted" font-size="12">user, groups?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="14">3 Policy</text><text x="400" y="92" text-anchor="middle" class="svg-muted" font-size="12">kaun sa rule?</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="14">4 Destination</text><text x="560" y="92" text-anchor="middle" class="svg-muted" font-size="12">site healthy?</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">pehli failing layer par ruko; fix karo; phir layer 1 se re-test</text>
</svg><p class="cap">Packet ko follow karo, apni aadat ko nahi.</p></div>

<h3>Har layer par evidence</h3>
<table class="cmp"><tr><th>Layer</th><th>Kahan dekhna hai</th><th>Failure kaisa dikhta hai</th></tr>
<tr><td>Forwarding</td><td>Locations page, tunnel status, client commands, tester ki path line</td><td>Tunnel down, galat destination, PAC URL alag, bypass hit</td></tr>
<tr><td>Identity</td><td>Identity page, tester ki identity line</td><td>401, unknown user, no groups</td></tr>
<tr><td>Policy</td><td>Tester ki rule line, logs</td><td>Rule se 403, block ki jagah default allow</td></tr>
<tr><td>Destination</td><td>Tester result, dusre users, digital experience hops</td><td>Application sabke liye slow ya down</td></tr>
</table>
<p>Do aadatein ise tez banati hain: <b>user ki seat se test karo</b> (client commands jaise <code>zapp status</code>, <code>pac show</code>, <code>curl</code>) aur <b>ek baar mein ek cheez badlo</b>, har change ke baad re-test karo taaki pata chale kaun sa change kaam aaya.</p>

<h3>Multi-site outage method</h3>
<p>Jab do ya zyada sites saath fail hon, har ek ko alag mystery maanne se bacho. Pehle poochho <b>inme common kya hai?</b> Haal ka change, same cloud node, same identity, same ISP. Sites alag methods use karti hon (ek GRE, ek PAC), to common cloud cause kam likely hai aur ek hi change window se <b>do independent faults</b> zyada likely hain. Unhe ek ek karke fix karo aur har ek verify karo.</p>

<div class="eg"><p><b>Worked example, ticket 321090 aur lab zs-ops-2.</b> Weekend change ke baad Chennai aur Jaipur dono down hain; Pune chal raha hai.</p></div>
<pre class="out">Locations
Site     Method  Status
Pune     IPsec   up
Chennai  GRE     <span class="hl">DOWN</span>   destination 203.0.113.10 is not a cloud node
Jaipur   PAC     (traffic direct jaata hai aur edge use block karta hai)

PC-JPR   pac show
Browser PAC: pac2.sahyadri.example/proxy.pac
<span class="hl">Portal PAC browser PAC se alag hai</span></pre>
<p><b>Chennai ke liye layer 1:</b> GRE destination cloud node address hona chahiye; primary node 203.0.113.101 hai. Weekend change mein galat address type ho gaya. Sahi karo, activate karo, confirm karo ki tunnel up hai. <b>Jaipur ke liye layer 1:</b> browser portal se alag PAC address par point kar raha hai, to browser direct par fall back karta hai, aur edge firewall direct internet block karta hai. PCs ka PAC portal value par wapas set karo (ya dono ko consistently update karo), phir confirm karo ki request proxy hui. Dono fixes ke baad har site ke test user ke liye layers 2 se 4 chalao: identity known, intended rule, destination reachable. Aakhir mein check karo ki logs dono sites ki requests dikhate hain.</p>

<h3>Jab destination hi problem ho</h3>
<p>Forwarding, identity aur policy sahi hon aur ek site sabke liye slow ya down ho, to fault destination par hai. Evidence ke saath kaho (tester result allowed, dusre bhi fail, hop table) aur application owner ko do. Har ticket aapka nahi hota.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Yahan har fix alag cheez badalta hai: GRE destination badalta hai ki tunnel packets kahan jaate hain; PAC URL badalta hai ki browser kaun sa proxy use karta hai; identity aur policy fixes badalte hain ki kaun known hai aur kaun sa rule fire hota hai. Click karne se pehle effect ka naam lena aapko galat layer fix karne se bachata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Policy se shuru karna. (2) Do cheezein ek saath fix karna aur pata na chalna kisne madad ki. (3) Ek test user ke baad jeet declare karna. (4) Bhool jaana ki direct path ka log nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matter karta hai: policy tweak down tunnel fix nahi kar sakta. Path line tunnel down ya direct kahe to uske baad kuch bhi trust nahi kar sakte.</p></div>

<div class="scn"><h4>Do sites, do causes</h4><p>Ek manager ne zid ki ki cloud service down hai. Engineer ko Chennai mein galat GRE destination aur Jaipur mein alag PAC URL mila, dono ek hi change window mein type hue. Do chhote fixes, ek ek karke verify, aur Pune users ko pata bhi nahi chala.</p><p><b>Seekh:</b> multi-site outage ko common component nahi, common event explain kar sakta hai.</p></div>

<div class="iv"><p class="q">"Web access problem ke liye apna troubleshooting method describe karo."</p><p>Chaar layers order mein: forwarding, identity, policy, destination. Har ek ko portal aur user ki seat se test karke prove karo, ek baar mein ek cheez badlo, aur close karne se pehle verify karo. Multi-site issues mein pehle common change dhundo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Request ko order mein chalo: forwarding, identity, policy, destination.</li>
<li>User ki seat se test karo; ek baar mein ek cheez badlo.</li>
<li>Multi-site outage: common change dhundo; do faults ho sakte hain.</li>
<li>Direct traffic matlab no policy aur no logs.</li>
<li>Har touched site par hamesha verify karo.</li>
</ul></div>
`}};export{e as default};