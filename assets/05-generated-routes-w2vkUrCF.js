var e={id:`generated-routes`,h:{en:`Generated routes: a default route that follows the ISP`,hi:`Generated routes: default route jo ISP ke saath chale`},body:{en:`
<p><b>The problem a static default cannot solve.</b> Your Nagpur office router R1 has one link to an ISP. Internal router R2 gets its default route from R1. If you configure a plain static <code>0.0.0.0/0</code> on R1 and export it into OSPF, the default exists all the time, <i>even when the ISP is down</i>. R2 keeps sending Internet traffic to R1, and R1 black-holes it. What you want is a default route that exists <b>only while the ISP is really there</b>.</p>
<p>A <b>generated route</b> gives exactly that. It looks like an aggregate: same preference 130, same <code>aggregate</code> protocol name in policies, contributing routes, and it is active only while at least one contributor is active. The difference is that it <b>forwards</b>. It copies the next hop of its <b>primary contributing route</b>, the contributor the router elects as primary (lowest preference first, then the numerically smallest prefix). So if the contributor is a BGP route from the ISP, the generated route points at the ISP.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Generated default depends on an ISP route">
<rect x="20" y="80" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="110" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="150" y="75" width="90" height="60" rx="8" fill="#bae6fd"/><text x="195" y="110" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="65" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="355" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="355" y="115" text-anchor="middle" class="svg-muted" font-size="12">generate 0/0</text><text x="355" y="132" text-anchor="middle" class="svg-muted" font-size="11">policy ISP-ALIVE</text>
<rect x="470" y="75" width="70" height="60" rx="8" fill="#ddd6fe"/><text x="505" y="110" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="570" y="80" width="60" height="50" rx="8" fill="#e2e8f0"/><text x="600" y="110" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="110" y1="105" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="240" y1="105" x2="290" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><line x1="540" y1="105" x2="570" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="265" y="95" text-anchor="middle" class="svg-accent" font-size="11">OSPF 0/0</text><text x="445" y="95" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">ISP route 203.0.113.0/24 present: default exists. Route gone: default gone.</text>
</svg><p class="cap">The default route is a consequence of the ISP's route, not a permanent entry.</p></div>

<h3>Aggregate versus generate</h3>
<table class="cmp"><tr><th></th><th>aggregate</th><th>generate</th></tr>
<tr><td>Preference</td><td>130</td><td>130</td></tr>
<tr><td>Active when</td><td>one contributor is active</td><td>one contributor is active</td></tr>
<tr><td>Next hop</td><td>reject or discard</td><td>next hop of the primary contributor</td></tr>
<tr><td>Forwards traffic?</td><td>no, only catches unowned addresses</td><td>yes</td></tr>
<tr><td>Typical use</td><td>summarise your own prefixes</td><td>conditional default route</td></tr></table>

<h3>Building the conditional default</h3>
<p>The policy that selects contributors must be precise. We want only the ISP's service network 203.0.113.0/24, learned by BGP, to count:</p>
<pre class="code">set policy-options policy-statement ISP-ALIVE term 1 from protocol bgp
set policy-options policy-statement ISP-ALIVE term 1 from route-filter 203.0.113.0/24 exact
set policy-options policy-statement ISP-ALIVE term 1 then accept
set policy-options policy-statement ISP-ALIVE term 2 then reject
set routing-options generate route 0.0.0.0/0 policy ISP-ALIVE
commit</pre>
<p>Term 2 rejects everything else. This is important: without a policy, <b>every</b> more specific route in the table (your own LANs, the OSPF routes) would be a contributor, and the default would stay active even with the ISP down.</p>
<p>Verify with <code>detail</code>. Real output from R1:</p>
<pre class="out">lab@R1&gt; show route 0.0.0.0/0 exact detail
0.0.0.0/0 (1 entry, 1 announced)
        *Aggregate Preference: 130
                Next hop type: Router
                Next hop: 100.64.10.2 via ge-0/0/0.0, selected
                State: &lt;Active Int Ext&gt;
                Age: 0:00 	Metric: 0
                Contributing Routes (1):
                        203.0.113.0/24 proto BGP
                Task: RT</pre>
<p>Notice <b>Next hop type: Router</b> with the ISP's address 100.64.10.2. A normal aggregate would say Reject. This is the generated route's forwarding ability.</p>

<h3>Exporting the default into OSPF</h3>
<p>A generated route is local until you export it. It is protocol <code>aggregate</code> in policy:</p>
<pre class="code">set policy-options policy-statement DEFAULT-OUT term 1 from protocol aggregate
set policy-options policy-statement DEFAULT-OUT term 1 from route-filter 0.0.0.0/0 exact
set policy-options policy-statement DEFAULT-OUT term 1 then accept
set protocols ospf export DEFAULT-OUT
commit</pre>
<pre class="out">lab@R2&gt; show route 0.0.0.0/0 exact
0.0.0.0/0          *[OSPF/150] 00:00:25, metric 0
                    &gt;  to 10.50.0.1 via ge-0/0/0.0</pre>
<p>R2 learned the default as an OSPF external route. PC1 reaches the ISP server 203.0.113.10 through R2 and R1.</p>

<h3>The failure test</h3>
<p>Prove it. Deactivate BGP on R1 and commit with a comment, so the change is traceable:</p>
<pre class="code">deactivate protocols bgp
commit comment "isp-down-test"</pre>
<pre class="out">lab@R1# show | compare rollback 1
[edit protocols]
-   bgp {
...
+   inactive: bgp {

lab@R1# run show system commit
0   2026-10-01 22:26:35 UTC by lab via cli
    isp-down-test

lab@R2&gt; show route 0.0.0.0/0 exact
inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)</pre>
<p>The BGP route to 203.0.113.0/24 is gone, so the generated route has no contributor and disappears. R1 withdraws the OSPF default and R2 now has <b>zero</b> routes to 0.0.0.0/0. R2 could now fail over to a second exit if there was one. After <code>activate protocols bgp</code> and a commit the session returns to Established and the default returns.</p>

<div class="eg"><p><b>Worked example.</b> A company has two Internet exits, R1 (ISP-A) and R3 (ISP-B). Each uses a generated default conditional on its own ISP's service prefix and exports it into OSPF, R3 with a worse metric. If ISP-A fails, R1's default disappears and OSPF automatically uses R3's default. No scripts, no human, no static route that lies.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>generate route 0.0.0.0/0</code> without a policy. With no policy, any active route inside 0/0 contributes, so the default is always there and the primary contributor may be your own LAN, giving a wrong next hop. Always add a precise contributor policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the pair: <b>aggregate</b> drops, <b>generate</b> forwards. Both are protocol <code>aggregate</code> in a routing policy and both have preference 130. The primary contributor is elected by the router (lowest preference, then smallest prefix), which is why the contributor policy must be tight.</p></div>

<div class="scn"><h4>The default that lied for two hours</h4><p>A retail branch had a static default route toward the ISP exported into OSPF. When the ISP link failed at night, the internal routers kept sending traffic to the edge router, which dropped it. Staff on the inside saw "network up, Internet down" and spent two hours on DNS and proxies. The company replaced the static default with a generated route conditional on a BGP route from the ISP. The next outage removed the default within seconds and the internal routers used the backup LTE exit.</p><p><b>Lesson:</b> a default should depend on a route that proves the upstream is alive.</p></div>
<div class="iv"><p class="q">"How do you make a default route appear only when the ISP is reachable?"</p><p>Use a generated route 0.0.0.0/0 with a policy that accepts one reliable route learned from the ISP (for example a service prefix over BGP) and rejects everything else. The generated route copies the next hop of its primary contributor and disappears when that contributor goes away. Export it into the IGP with a policy matching protocol aggregate.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A generated route forwards by copying the next hop of its primary contributing route.</li>
<li>Always use a contributor policy; end it with a reject term.</li>
<li>Policies see it as protocol <code>aggregate</code>; preference is 130.</li>
<li>When the contributor disappears, the generated default and the exported default disappear.</li>
<li>Test failure with deactivate and a commit comment; verify with <code>show route 0.0.0.0/0 exact</code>.</li>
</ul></div>
`,hi:`
<p><b>Woh problem jo static default solve nahi kar sakta.</b> Aapke Nagpur office router R1 ka ISP ke saath ek link hai. Internal router R2 ko default route R1 se milta hai. Agar aap R1 par plain static <code>0.0.0.0/0</code> lagao aur use OSPF mein export karo, to default hamesha rehta hai, <i>ISP ke down hone par bhi</i>. R2 Internet traffic R1 ko bhejta rehta hai aur R1 use black-hole kar deta hai. Aapko aisa default chahiye jo <b>sirf tab rahe jab ISP sach mein ho</b>.</p>
<p><b>Generated route</b> bilkul yahi deta hai. Yeh aggregate jaisa dikhta hai: wahi preference 130, policies mein wahi <code>aggregate</code> protocol naam, contributing routes, aur tabhi tak active jab tak kam se kam ek contributor active ho. Fark yeh hai ki yeh <b>forward karta hai</b>. Yeh apne <b>primary contributing route</b> ka next hop copy karta hai, yaani woh contributor jise router primary chunta hai (pehle sabse kam preference, phir numerically sabse chhota prefix). Isliye contributor ISP ka BGP route ho to generated route ISP ki taraf point karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Generated default ISP route par depend karta hai">
<rect x="20" y="80" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="110" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="150" y="75" width="90" height="60" rx="8" fill="#bae6fd"/><text x="195" y="110" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="290" y="65" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="355" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="355" y="115" text-anchor="middle" class="svg-muted" font-size="12">generate 0/0</text><text x="355" y="132" text-anchor="middle" class="svg-muted" font-size="11">policy ISP-ALIVE</text>
<rect x="470" y="75" width="70" height="60" rx="8" fill="#ddd6fe"/><text x="505" y="110" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="570" y="80" width="60" height="50" rx="8" fill="#e2e8f0"/><text x="600" y="110" text-anchor="middle" class="svg-ink" font-size="12">SRV</text>
<line x1="110" y1="105" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="240" y1="105" x2="290" y2="105" stroke="#64748b" stroke-width="2"/><line x1="420" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><line x1="540" y1="105" x2="570" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="265" y="95" text-anchor="middle" class="svg-accent" font-size="11">OSPF 0/0</text><text x="445" y="95" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">ISP route 203.0.113.0/24 hai: default hai. Route gayab: default gayab.</text>
</svg><p class="cap">Default route ISP ke route ka natija hai, permanent entry nahi.</p></div>

<h3>Aggregate versus generate</h3>
<table class="cmp"><tr><th></th><th>aggregate</th><th>generate</th></tr>
<tr><td>Preference</td><td>130</td><td>130</td></tr>
<tr><td>Kab active</td><td>ek contributor active ho</td><td>ek contributor active ho</td></tr>
<tr><td>Next hop</td><td>reject ya discard</td><td>primary contributor ka next hop</td></tr>
<tr><td>Traffic forward karta hai?</td><td>nahi, sirf bina maalik ke addresses pakadta hai</td><td>haan</td></tr>
<tr><td>Aam use</td><td>apne prefixes summarise karna</td><td>conditional default route</td></tr></table>

<h3>Conditional default banana</h3>
<p>Contributors chunne wali policy precise honi chahiye. Hum chahte hain sirf ISP ka service network 203.0.113.0/24, jo BGP se seekha gaya ho, count ho:</p>
<pre class="code">set policy-options policy-statement ISP-ALIVE term 1 from protocol bgp
set policy-options policy-statement ISP-ALIVE term 1 from route-filter 203.0.113.0/24 exact
set policy-options policy-statement ISP-ALIVE term 1 then accept
set policy-options policy-statement ISP-ALIVE term 2 then reject
set routing-options generate route 0.0.0.0/0 policy ISP-ALIVE
commit</pre>
<p>Term 2 baaki sab reject karta hai. Yeh zaroori hai: policy ke bina table ka <b>har</b> more specific route (aapke apne LANs, OSPF routes) contributor ban jaata, aur ISP down hone par bhi default active rehta.</p>
<p><code>detail</code> se verify karo. R1 ka real output:</p>
<pre class="out">lab@R1&gt; show route 0.0.0.0/0 exact detail
0.0.0.0/0 (1 entry, 1 announced)
        *Aggregate Preference: 130
                Next hop type: Router
                Next hop: 100.64.10.2 via ge-0/0/0.0, selected
                State: &lt;Active Int Ext&gt;
                Age: 0:00 	Metric: 0
                Contributing Routes (1):
                        203.0.113.0/24 proto BGP
                Task: RT</pre>
<p><b>Next hop type: Router</b> ISP ke address 100.64.10.2 ke saath dekho. Normal aggregate Reject kehta. Yahi generated route ki forwarding ability hai.</p>

<h3>Default ko OSPF mein export karna</h3>
<p>Export hone tak generated route local hai. Policy mein yeh protocol <code>aggregate</code> hai:</p>
<pre class="code">set policy-options policy-statement DEFAULT-OUT term 1 from protocol aggregate
set policy-options policy-statement DEFAULT-OUT term 1 from route-filter 0.0.0.0/0 exact
set policy-options policy-statement DEFAULT-OUT term 1 then accept
set protocols ospf export DEFAULT-OUT
commit</pre>
<pre class="out">lab@R2&gt; show route 0.0.0.0/0 exact
0.0.0.0/0          *[OSPF/150] 00:00:25, metric 0
                    &gt;  to 10.50.0.1 via ge-0/0/0.0</pre>
<p>R2 ne default ko OSPF external route ke roop mein seekha. PC1 ISP server 203.0.113.10 tak R2 aur R1 ke raaste pahunchta hai.</p>

<h3>Failure test</h3>
<p>Saabit karo. R1 par BGP deactivate karo aur comment ke saath commit karo, taaki change traceable ho:</p>
<pre class="code">deactivate protocols bgp
commit comment "isp-down-test"</pre>
<pre class="out">lab@R1# show | compare rollback 1
[edit protocols]
-   bgp {
...
+   inactive: bgp {

lab@R1# run show system commit
0   2026-10-01 22:26:35 UTC by lab via cli
    isp-down-test

lab@R2&gt; show route 0.0.0.0/0 exact
inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)</pre>
<p>203.0.113.0/24 ka BGP route chala gaya, isliye generated route ka koi contributor nahi bacha aur woh gayab ho gaya. R1 ne OSPF default withdraw kiya aur R2 ke paas ab 0.0.0.0/0 ke <b>zero</b> routes hain. Doosra exit hota to R2 ab us par fail over kar sakta tha. <code>activate protocols bgp</code> aur commit ke baad session Established ho jaata hai aur default wapas aa jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Company ke do Internet exits hain, R1 (ISP-A) aur R3 (ISP-B). Har ek apne ISP ke service prefix par conditional generated default use karta hai aur use OSPF mein export karta hai, R3 kharab metric ke saath. ISP-A fail ho to R1 ka default gayab ho jaata hai aur OSPF apne aap R3 ka default use karta hai. Na script, na insaan, na jhoot bolne wala static route.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy ke bina <code>generate route 0.0.0.0/0</code> configure karna. Policy na ho to 0/0 ke andar ka har active route contribute karta hai, isliye default hamesha rehta hai aur primary contributor aapka apna LAN ho sakta hai, jisse galat next hop milta hai. Hamesha precise contributor policy lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jodi yaad rakho: <b>aggregate</b> drop karta hai, <b>generate</b> forward karta hai. Dono routing policy mein protocol <code>aggregate</code> hain aur dono ki preference 130. Primary contributor router khud chunta hai (pehle sabse kam preference, phir numerically sabse chhota prefix); isi liye contributor policy tight rakho.</p></div>

<div class="scn"><h4>Default jo do ghante jhoot bolta raha</h4><p>Ek retail branch ke paas ISP ki taraf static default route tha jo OSPF mein export hota tha. Raat ko ISP link fail hua to internal routers traffic edge router ko bhejte rahe jo use drop karta raha. Andar ke staff ko "network up, Internet down" dikha aur do ghante DNS aur proxies par lage. Company ne static default ki jagah ISP ke BGP route par conditional generated route lagaya. Agle outage mein default kuch seconds mein hata aur internal routers ne backup LTE exit use kiya.</p><p><b>Lesson:</b> default ko aise route par depend karna chahiye jo saabit kare ki upstream zinda hai.</p></div>
<div class="iv"><p class="q">"Default route sirf tab kaise dikhao jab ISP reachable ho?"</p><p>Generated route 0.0.0.0/0 use karo jiski policy ISP se seekha ek bharosemand route (jaise BGP par service prefix) accept kare aur baaki sab reject kare. Generated route apne primary contributor ka next hop copy karta hai aur contributor jaane par gayab ho jaata hai. Use IGP mein protocol aggregate match karne wali policy se export karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Generated route primary contributing route ka next hop copy karke forward karta hai.</li>
<li>Hamesha contributor policy lagao; reject term par khatam karo.</li>
<li>Policies ise protocol <code>aggregate</code> maanti hain; preference 130.</li>
<li>Contributor gayab hone par generated default aur exported default dono gayab.</li>
<li>deactivate aur commit comment se failure test karo; <code>show route 0.0.0.0/0 exact</code> se verify.</li>
</ul></div>
`}};export{e as default};