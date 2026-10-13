var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the Idle overlay ticket (lab vs-controller-typo)`,hi:`Troubleshooting workflow: Idle overlay ticket (lab vs-controller-typo)`},body:{en:`
<p>Configuring a branch is the easy half of the job. The other half is the phone call that says "the overlay is down" at 6 pm. This chapter gives you a four-step method and walks the lab <b>vs-controller-typo</b> from ticket to fix.</p>

<h3>Analogy: a doctor, not a guesser</h3>
<p>A good doctor does not prescribe medicine on hearing "I feel unwell". She takes temperature, listens to the chest, orders one test and then decides. In SD-WAN you collect evidence from the bottom layer upward, change the smallest thing that explains the evidence, and then check the result.</p>

<h3>The method: underlay, identity, tunnel, BGP</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four-step troubleshooting flow">
<rect x="10" y="40" width="140" height="80" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="11">interface, route,</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="11">ping Controller</text>
<rect x="175" y="40" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. Identity</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">org, site-id,</text><text x="245" y="104" text-anchor="middle" class="svg-muted" font-size="11">Controller, WAN map</text>
<rect x="340" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="410" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Tunnel</text><text x="410" y="88" text-anchor="middle" class="svg-muted" font-size="11">one per transport,</text><text x="410" y="104" text-anchor="middle" class="svg-muted" font-size="11">Reason column</text>
<rect x="505" y="40" width="125" height="80" rx="8" fill="#fde68a"/><text x="567" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. BGP</text><text x="567" y="88" text-anchor="middle" class="svg-muted" font-size="11">Established?</text><text x="567" y="104" text-anchor="middle" class="svg-muted" font-size="11">prefixes learned</text>
<line x1="150" y1="80" x2="175" y2="80" stroke="#64748b"/><line x1="315" y1="80" x2="340" y2="80" stroke="#64748b"/><line x1="480" y1="80" x2="505" y2="80" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Stop at the first layer that fails. Fix it. Re-test from there.</text>
</svg><p class="cap">Work bottom to top. A fault in layer 1 makes layers 2 to 4 look broken too.</p></div>
<ol>
<li><b>Underlay:</b> <code>show interfaces brief</code>, <code>show route</code>, <code>ping</code> the Controller. Fail means fix here first.</li>
<li><b>Identity:</b> <code>show orgs org Acme sd-wan brief</code> and <code>show configuration</code>. Check organization, site-id, Controller address and WAN mapping against the planning table.</li>
<li><b>Tunnel:</b> read each tunnel row and its Reason. <code>show orgs org Acme sd-wan wan-interfaces</code> adds interface state and circuit quality.</li>
<li><b>BGP:</b> <code>show bgp neighbor brief</code>. Established means the control plane is healthy; then check learned prefixes with <code>show orgs org Acme sd-wan sites</code>.</li>
</ol>
<p>Other habits: record the first evidence before changing anything; change one thing at a time; use <code>show | compare</code> before commit; and verify with the same command you used to find the problem.</p>

<h3>The ticket: lab vs-controller-typo</h3>
<div class="eg"><p><b>Ticket.</b> After a maintenance window the Delhi branch shows an Idle overlay although all three circuits look healthy. Collect evidence, find the faulty element, remove only the wrong statement and prove all three tunnels return.</p></div>

<h4>Step 1: underlay evidence</h4>
<pre class="code">show interfaces brief
ping 198.51.100.20</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24
admin@Branch1-cli&gt; ping 198.51.100.20
<span class="hl">4 packets transmitted, 4 received, 0% packet loss</span></pre>
<p>All three WAN ports are up with addresses, and the Controller answers. The underlay is exonerated. (Exact interface rows in your lab may differ in order or detail; the point is that nothing is down.)</p>

<h4>Step 2: read the overlay summary</h4>
<pre class="code">show orgs org Acme sd-wan brief</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.2   Overlay (MP-BGP): <span class="hl">Idle</span>  [<span class="hl">Controller address 198.51.100.2 does not belong to a Controller</span>]
Transport  Interface  Tunnel  Reason</pre>
<p>Two clues. First, the reason text names the address 198.51.100.2. The real Controller is 198.51.100.20, so a zero was lost. Second, the tunnel table has no rows: no tunnel is even attempted because the branch does not know a valid Controller. This explains why <b>all three</b> circuits look healthy yet the overlay is down: the fault is not in any circuit.</p>

<h4>Step 3: confirm in the configuration</h4>
<pre class="code">show configuration</pre>
<pre class="out"><span class="c">...</span>
set orgs org Acme sd-wan site-id 101
set orgs org Acme sd-wan <span class="hl">controllers 198.51.100.2</span>
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan wan-interfaces vni-0/2 transport LTE</pre>

<h4>Step 4: remove the wrong statement, keep the right one</h4>
<pre class="code">configure
delete orgs org Acme sd-wan controllers 198.51.100.2
set orgs org Acme sd-wan controllers 198.51.100.20
show | compare
commit
exit</pre>
<pre class="out">admin@Branch1-cli% show | compare
<span class="hl">- set orgs org Acme sd-wan controllers 198.51.100.2</span>
<span class="hl">+ set orgs org Acme sd-wan controllers 198.51.100.20</span>
admin@Branch1-cli% commit
Commit complete.</pre>
<p>The diff has exactly one removal and one addition: the smallest correct change. Do not delete the whole sd-wan section, do not touch the interfaces and do not restart anything.</p>

<h4>Step 5: prove it</h4>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -</pre>
<p>Three tunnels up and BGP Established: the ticket is solved. Close it with the evidence: before and after outputs, the single statement changed, and the cause (typing error in the Controller address during the change).</p>

<h3>A quick reference of Reason messages</h3>
<table class="cmp"><tr><th>Reason text (course model)</th><th>Layer</th><th>Usual fix</th></tr>
<tr><td>site-id is not configured</td><td>Identity</td><td>set ... sd-wan site-id</td></tr>
<tr><td>no Controller address is configured</td><td>Identity</td><td>set ... sd-wan controllers</td></tr>
<tr><td>Controller address ... does not belong to a Controller</td><td>Identity</td><td>Correct the typo</td></tr>
<tr><td>Controller organization is X, branch uses Acme</td><td>Identity</td><td>Align organization name</td></tr>
<tr><td>interface down / no IP address on the WAN interface</td><td>Underlay</td><td>Enable port, add address</td></tr>
<tr><td>circuit down (provider fault)</td><td>Underlay</td><td>Carrier ticket</td></tr>
<tr><td>Controller has no X WAN interface / transport domain X is missing</td><td>Controller side</td><td>Add on the Controller</td></tr>
<tr><td>Controller ... address is unreachable</td><td>Underlay</td><td>Routes, carrier, filters</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting with the Controller or the carrier before reading the Reason text. (2) Fixing by rebuilding the whole configuration: you may delete working parts and you cannot explain the root cause. (3) Leaving both the wrong and the right Controller address in place; keep the configuration clean. (4) Closing the ticket without a "after" output.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom "overlay Idle, all circuits fine" points to identity or Controller-side configuration, not to circuits. Symptom "one tunnel down, BGP Established" points to that one transport.</p></div>

<div class="scn"><h4>The silent typo</h4><p>A change request replaced the Controller address on forty branches with a script. One address was entered by hand for an urgent branch and lost a digit. The NOC saw one Idle branch and thirty-nine healthy ones. Because the engineer read the Reason text first, the fix took three minutes. A colleague who had started by calling the carrier spent an hour.</p><p><b>Lesson:</b> the device often tells you the answer. Read it before you escalate.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot an SD-WAN branch that is offline."</p><p>Strong answer: bottom to top. Underlay (interface, route, ping to Controller), identity (org, site-id, Controller address, transport mapping), tunnels (per-transport state and reasons), then BGP and learned prefixes. Collect evidence, change one thing, use show | compare, commit, and verify with the same command. Mention closing the ticket with before and after evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: underlay, identity, tunnel, BGP; stop at the first failing layer.</li>
<li>The overlay summary and its Reason text usually name the fault.</li>
<li>In the ticket the Controller address 198.51.100.2 lacked a digit; the right value is 198.51.100.20.</li>
<li>Delete only the wrong statement, set the right one, compare, commit.</li>
<li>Prove the fix: three tunnels up (Internet, MPLS, LTE) and BGP Established.</li>
</ul></div>
`,hi:`
<p>Branch configure karna kaam ka aasan aadha hissa hai. Doosra aadha woh phone call hai jo shaam 6 baje kehta hai "overlay down hai". Yeh chapter aapko chaar-step method deta hai aur lab <b>vs-controller-typo</b> ko ticket se fix tak walk karata hai.</p>

<h3>Analogy: doctor, andaaza lagane wala nahi</h3>
<p>Achha doctor "mujhe theek nahi lag raha" sunkar dawai nahi likhta. Woh temperature leti hai, chest sunti hai, ek test order karti hai aur phir decide karti hai. SD-WAN mein aap neeche ki layer se upar ki taraf evidence collect karte ho, sabse chhoti cheez badalte ho jo evidence explain kare, aur phir result check karte ho.</p>

<h3>Method: underlay, identity, tunnel, BGP</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Chaar step troubleshooting flow">
<rect x="10" y="40" width="140" height="80" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="11">interface, route,</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="11">ping Controller</text>
<rect x="175" y="40" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. Identity</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">org, site-id,</text><text x="245" y="104" text-anchor="middle" class="svg-muted" font-size="11">Controller, WAN map</text>
<rect x="340" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="410" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Tunnel</text><text x="410" y="88" text-anchor="middle" class="svg-muted" font-size="11">har transport ka ek,</text><text x="410" y="104" text-anchor="middle" class="svg-muted" font-size="11">Reason column</text>
<rect x="505" y="40" width="125" height="80" rx="8" fill="#fde68a"/><text x="567" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. BGP</text><text x="567" y="88" text-anchor="middle" class="svg-muted" font-size="11">Established?</text><text x="567" y="104" text-anchor="middle" class="svg-muted" font-size="11">prefixes learned</text>
<line x1="150" y1="80" x2="175" y2="80" stroke="#64748b"/><line x1="315" y1="80" x2="340" y2="80" stroke="#64748b"/><line x1="480" y1="80" x2="505" y2="80" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Pehli failing layer par ruko. Fix karo. Wahin se dobara test karo.</text>
</svg><p class="cap">Neeche se upar kaam karo. Layer 1 ka fault layer 2 se 4 ko bhi broken dikhata hai.</p></div>
<ol>
<li><b>Underlay:</b> <code>show interfaces brief</code>, <code>show route</code>, Controller ko <code>ping</code>. Fail ho to pehle yahin fix karo.</li>
<li><b>Identity:</b> <code>show orgs org Acme sd-wan brief</code> aur <code>show configuration</code>. Organization, site-id, Controller address aur WAN mapping ko planning table se match karo.</li>
<li><b>Tunnel:</b> har tunnel row aur uska Reason padho. <code>show orgs org Acme sd-wan wan-interfaces</code> interface state aur circuit quality jodta hai.</li>
<li><b>BGP:</b> <code>show bgp neighbor brief</code>. Established matlab control plane healthy; phir <code>show orgs org Acme sd-wan sites</code> se learned prefixes check karo.</li>
</ol>
<p>Aur aadatein: kuch badalne se pehle pehla evidence record karo; ek samay mein ek hi cheez badlo; commit se pehle <code>show | compare</code> use karo; aur problem dhundhne wale usi command se verify karo.</p>

<h3>Ticket: lab vs-controller-typo</h3>
<div class="eg"><p><b>Ticket.</b> Maintenance window ke baad Delhi branch ka overlay Idle hai, jabki teeno circuits theek dikhte hain. Evidence collect karo, faulty element dhundo, sirf wrong statement hatao aur prove karo ki teeno tunnels wapas aaye.</p></div>

<h4>Step 1: underlay evidence</h4>
<pre class="code">show interfaces brief
ping 198.51.100.20</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24
admin@Branch1-cli&gt; ping 198.51.100.20
<span class="hl">4 packets transmitted, 4 received, 0% packet loss</span></pre>
<p>Teeno WAN ports up hain addresses ke saath, aur Controller jawab deta hai. Underlay clear hai. (Aapke lab mein interface rows ka order ya detail alag ho sakta hai; point yeh hai ki kuch down nahi hai.)</p>

<h4>Step 2: overlay summary padho</h4>
<pre class="code">show orgs org Acme sd-wan brief</pre>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.2   Overlay (MP-BGP): <span class="hl">Idle</span>  [<span class="hl">Controller address 198.51.100.2 does not belong to a Controller</span>]
Transport  Interface  Tunnel  Reason</pre>
<p>Do clues. Pehla, reason text address 198.51.100.2 ka naam leta hai. Asli Controller 198.51.100.20 hai, yani ek zero gum ho gaya. Doosra, tunnel table mein koi row nahi hai: koi tunnel try bhi nahi hota kyunki branch ko valid Controller pata hi nahi. Isliye <b>teeno</b> circuits healthy dikhte hain phir bhi overlay down hai: fault kisi circuit mein nahi hai.</p>

<h4>Step 3: configuration mein confirm karo</h4>
<pre class="code">show configuration</pre>
<pre class="out"><span class="c">...</span>
set orgs org Acme sd-wan site-id 101
set orgs org Acme sd-wan <span class="hl">controllers 198.51.100.2</span>
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan wan-interfaces vni-0/2 transport LTE</pre>

<h4>Step 4: galat statement hatao, sahi rakho</h4>
<pre class="code">configure
delete orgs org Acme sd-wan controllers 198.51.100.2
set orgs org Acme sd-wan controllers 198.51.100.20
show | compare
commit
exit</pre>
<pre class="out">admin@Branch1-cli% show | compare
<span class="hl">- set orgs org Acme sd-wan controllers 198.51.100.2</span>
<span class="hl">+ set orgs org Acme sd-wan controllers 198.51.100.20</span>
admin@Branch1-cli% commit
Commit complete.</pre>
<p>Diff mein bilkul ek removal aur ek addition hai: sabse chhota sahi change. Poora sd-wan section delete mat karo, interfaces ko mat chhuo aur kuch restart mat karo.</p>

<h4>Step 5: prove karo</h4>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -</pre>
<p>Teen tunnels up aur BGP Established: ticket solve ho gaya. Ise evidence ke saath close karo: before aur after outputs, badla hua ek statement, aur cause (change ke dauraan Controller address mein typing error).</p>

<h3>Reason messages ka quick reference</h3>
<table class="cmp"><tr><th>Reason text (course model)</th><th>Layer</th><th>Usual fix</th></tr>
<tr><td>site-id is not configured</td><td>Identity</td><td>set ... sd-wan site-id</td></tr>
<tr><td>no Controller address is configured</td><td>Identity</td><td>set ... sd-wan controllers</td></tr>
<tr><td>Controller address ... does not belong to a Controller</td><td>Identity</td><td>Typo correct karo</td></tr>
<tr><td>Controller organization is X, branch uses Acme</td><td>Identity</td><td>Organization name align karo</td></tr>
<tr><td>interface down / no IP address on the WAN interface</td><td>Underlay</td><td>Port enable karo, address do</td></tr>
<tr><td>circuit down (provider fault)</td><td>Underlay</td><td>Carrier ticket</td></tr>
<tr><td>Controller has no X WAN interface / transport domain X is missing</td><td>Controller side</td><td>Controller par add karo</td></tr>
<tr><td>Controller ... address is unreachable</td><td>Underlay</td><td>Routes, carrier, filters</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> (1) Reason text padhne se pehle Controller ya carrier se shuru karna. (2) Poori configuration rebuild karke fix karna: aap working parts delete kar sakte ho aur root cause explain nahi kar sakte. (3) Galat aur sahi dono Controller address chhod dena; configuration clean rakho. (4) "After" output ke bina ticket close kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom "overlay Idle, saare circuits theek" identity ya Controller-side configuration ki taraf point karta hai, circuits ki taraf nahi. Symptom "ek tunnel down, BGP Established" us ek transport ki taraf point karta hai.</p></div>

<div class="scn"><h4>Khamosh typo</h4><p>Ek change request ne script se chalees branches par Controller address badla. Ek urgent branch ka address haath se enter hua aur ek digit gir gaya. NOC ko ek Idle branch aur untalis healthy branches dikhin. Kyunki engineer ne pehle Reason text padha, fix mein teen minute lage. Jis colleague ne carrier ko call karke shuru kiya, usne ek ghanta lagaya.</p><p><b>Seekh:</b> device aksar jawab khud bata deta hai. Escalate karne se pehle use padho.</p></div>

<div class="iv"><p class="q">"Offline SD-WAN branch ko tum kaise troubleshoot karte ho, samjhao."</p><p>Strong answer: neeche se upar. Underlay (interface, route, Controller ko ping), identity (org, site-id, Controller address, transport mapping), tunnels (per-transport state aur reasons), phir BGP aur learned prefixes. Evidence collect karo, ek cheez badlo, show | compare use karo, commit karo, aur usi command se verify karo. Ticket ko before aur after evidence ke saath close karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: underlay, identity, tunnel, BGP; pehli failing layer par ruko.</li>
<li>Overlay summary aur uska Reason text aksar fault ka naam bata deta hai.</li>
<li>Ticket mein Controller address 198.51.100.2 mein ek digit kam tha; sahi value 198.51.100.20 hai.</li>
<li>Sirf wrong statement delete karo, sahi set karo, compare karo, commit karo.</li>
<li>Fix prove karo: teen tunnels up (Internet, MPLS, LTE) aur BGP Established.</li>
</ul></div>
`}};export{e as default};