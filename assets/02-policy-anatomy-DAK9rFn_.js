var e={id:`policy-anatomy`,h:{en:`Anatomy of a firewall policy: what it matches and what it does`,hi:`Firewall policy ki anatomy: kya match karti hai aur kya karti hai`},body:{en:`
<p>A firewall policy is one row in a decision table. The left side says <b>which sessions</b> the row is about. The right side says <b>what to do</b> with them. Learn the columns once and every policy you ever read becomes easy.</p>

<h3>The match side</h3>
<p>A session matches a policy only when <b>all six</b> attributes match at the same time:</p>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th><th>Example</th></tr>
<tr><td><code>srcintf</code></td><td>interface (or zone, or <code>any</code>) where the first packet <b>enters</b></td><td>port2</td></tr>
<tr><td><code>dstintf</code></td><td>interface where the packet <b>leaves</b>, decided by routing</td><td>port1</td></tr>
<tr><td><code>srcaddr</code></td><td>address objects for the source IP</td><td>LAN_NET</td></tr>
<tr><td><code>dstaddr</code></td><td>address objects for the destination IP</td><td>all</td></tr>
<tr><td><code>service</code></td><td>protocol and destination port</td><td>HTTPS</td></tr>
<tr><td><code>schedule</code></td><td>time window when the policy is active</td><td>always</td></tr></table>
<p>Two points trip up beginners. First, the egress interface comes from the <b>routing table</b>. FortiOS routes the packet first and then looks for a policy between the ingress interface and the chosen egress interface. If the route is wrong or missing, you will see "no policy matched" even though the policy is perfect. Second, a field with several values is an <b>OR</b> inside the field (any of the listed services), but the six fields together are an <b>AND</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six attributes AND">
<rect x="10" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="13">srcintf</text>
<rect x="115" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="13">dstintf</text>
<rect x="220" y="20" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="13">srcaddr</text>
<rect x="325" y="20" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="13">dstaddr</text>
<rect x="430" y="20" width="95" height="50" rx="8" fill="#fde68a"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="13">service</text>
<rect x="535" y="20" width="95" height="50" rx="8" fill="#fde68a"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="13">schedule</text>
<line x1="57" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="582" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="267" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="477" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="115" width="190" height="42" rx="10" fill="#ddd6fe"/><text x="320" y="141" text-anchor="middle" class="svg-ink" font-size="13">ALL six must match</text>
</svg><p class="cap">Six attributes joined by AND; values inside one attribute are joined by OR.</p></div>

<h3>The action side</h3>
<ul>
<li><code>action accept</code> lets the session through and creates a session entry. <code>action deny</code> drops it. The default for a new policy is <b>deny</b>, so forgetting <code>set action accept</code> gives a policy that blocks.</li>
<li><code>nat enable</code> translates the source address (next module).</li>
<li><code>logtraffic</code> controls logging: <code>disable</code>, <code>utm</code> (default) or <code>all</code> (chapter 5).</li>
<li><code>inspection-mode flow</code> (default) or <code>proxy</code> chooses how security profiles inspect. Profiles themselves belong to the UTM modules.</li>
<li><code>status enable|disable</code>, <code>name</code> and <code>comments</code> help operations.</li>
<li><code>send-deny-packet</code> makes a deny policy send a reset or ICMP unreachable instead of dropping silently.</li>
</ul>

<h3>Build one in the CLI</h3>
<p>The six mandatory attributes must be set before the entry can be saved. This is what FortiOS says when you forget:</p>
<pre class="out">FGT1 (policy) # edit 1
new entry '1' added
FGT1 (1) # end
<span class="hl">Attribute 'srcintf' MUST be set.</span>
Command fail. Return code 1</pre>
<p>Now the full policy from the lab, with objects from the next chapter. <code>edit 0</code> asks FortiOS to use the next free ID.</p>
<pre class="code"><span class="c">! LAN users to the internet: web, DNS and ping only</span>
config firewall policy
    edit 0
        set name LAN-to-WAN
        set srcintf port2
        set dstintf port1
        set srcaddr LAN_NET
        set dstaddr all
        set action accept
        set schedule always
        set service WEB-DNS-PING
        set nat enable
        set logtraffic all
    end</pre>
<pre class="out">FGT1 # get firewall policy 1
policyid            : 1
name                : LAN-to-WAN
srcintf             : "port2"
dstintf             : "port1"
<span class="hl">action              : accept</span>
srcaddr             : "LAN_NET"
dstaddr             : "all"
schedule            : always
service             : "WEB-DNS-PING"
inspection-mode     : flow
logtraffic          : all
ippool              : disable
nat                 : enable
match-vip           : disable
send-deny-packet    : disable
status              : enable</pre>
<p><code>show firewall policy</code> prints only what differs from the default, so you will not see <code>inspection-mode flow</code> there. <code>get</code> prints every attribute with its value. Use <code>show</code> to read a configuration and <code>get</code> to see the effective values.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) opens TCP 443 to 8.8.8.8. Routing says the egress is port1. The packet enters port2, so srcintf matches. LAN_NET contains 10.0.1.10, so srcaddr matches. 8.8.8.8 is in "all". Service group WEB-DNS-PING contains HTTPS, which is TCP 443. The schedule is always. All six match, action is accept, so the session is created and source NAT is applied.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Leaving <code>action</code> at its default deny; choosing the wrong <code>dstintf</code> (for example the DMZ port when the route goes out port1); using <code>service ALL</code> everywhere because it "just works"; forgetting that a policy for LAN to WAN does <b>not</b> allow the reverse direction. Return traffic is allowed by the session, but a new connection from the internet to the LAN needs its own policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which attribute is NOT part of the policy match?" The action, NAT and logging settings are not match criteria. Another favourite: the policy does not match on the <i>source port</i>. It matches on the destination port through the service object.</p></div>

<div class="scn"><h4>The policy that looked perfect</h4><p>An admin built "LAN-to-DMZ" with dstintf port3 and the web server at 10.0.2.10, yet connections failed. The lookup tool reported policy 0. The route to 10.0.2.0/24 was missing after a recent clean-up, so FortiOS chose port1 as the egress and no policy existed from port2 to port1 for that address. Restoring the connected route fixed it with no policy change.</p><p><b>Lesson:</b> the policy match depends on routing. Check <code>get router info routing-table all</code> when a perfect policy does not match.</p></div>

<div class="iv"><p class="q">"What does a FortiGate need to match before it applies a firewall policy?"</p><p>Ingress interface, egress interface, source address, destination address, service and schedule, all at once. Mention that the egress interface is found by the routing lookup, that new sessions are the only thing checked, and that action, NAT and logging are what the policy <i>does</i>, not what it matches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six attributes (srcintf, dstintf, srcaddr, dstaddr, service, schedule) must all match.</li>
<li>The egress interface comes from routing, so routes affect policy matching.</li>
<li>The default action of a new policy is deny; set <code>action accept</code> explicitly.</li>
<li>Mandatory attributes must be set before <code>next</code> or <code>end</code> will save the entry.</li>
<li>Use <code>show</code> for the configuration and <code>get</code> for all effective values.</li>
</ul></div>
`,hi:`
<p>Firewall policy ek decision table ki ek row hai. Left side batati hai ki row <b>kin sessions</b> ke baare mein hai. Right side batati hai ki unke saath <b>kya karna hai</b>. Columns ek baar seekh lo to har policy padhna aasaan ho jaata hai.</p>

<h3>Match side</h3>
<p>Session policy se tabhi match karta hai jab <b>chhe ke chhe</b> attributes ek saath match karein:</p>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th><th>Example</th></tr>
<tr><td><code>srcintf</code></td><td>woh interface (ya zone, ya <code>any</code>) jahan pehla packet <b>enter</b> karta hai</td><td>port2</td></tr>
<tr><td><code>dstintf</code></td><td>woh interface jahan se packet <b>nikalta</b> hai, routing decide karti hai</td><td>port1</td></tr>
<tr><td><code>srcaddr</code></td><td>source IP ke address objects</td><td>LAN_NET</td></tr>
<tr><td><code>dstaddr</code></td><td>destination IP ke address objects</td><td>all</td></tr>
<tr><td><code>service</code></td><td>protocol aur destination port</td><td>HTTPS</td></tr>
<tr><td><code>schedule</code></td><td>time window jab policy active hai</td><td>always</td></tr></table>
<p>Do baatein beginners ko uljhati hain. Pehli, egress interface <b>routing table</b> se aata hai. FortiOS pehle packet route karta hai aur phir ingress interface aur chune gaye egress interface ke beech policy dhoondta hai. Route galat ya missing ho to policy perfect hone par bhi "koi policy match nahi hui" dikhega. Doosri, ek field mein kai values <b>OR</b> hoti hain (listed services mein se koi bhi), lekin chhe fields saath mein <b>AND</b> hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six attributes AND">
<rect x="10" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="13">srcintf</text>
<rect x="115" y="20" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="13">dstintf</text>
<rect x="220" y="20" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="13">srcaddr</text>
<rect x="325" y="20" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="13">dstaddr</text>
<rect x="430" y="20" width="95" height="50" rx="8" fill="#fde68a"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="13">service</text>
<rect x="535" y="20" width="95" height="50" rx="8" fill="#fde68a"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="13">schedule</text>
<line x1="57" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="582" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="267" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/><line x1="477" y1="70" x2="320" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="115" width="190" height="42" rx="10" fill="#ddd6fe"/><text x="320" y="141" text-anchor="middle" class="svg-ink" font-size="13">Chhe ke chhe match</text>
</svg><p class="cap">Chhe attributes AND se jude hain; ek attribute ke andar values OR hoti hain.</p></div>

<h3>Action side</h3>
<ul>
<li><code>action accept</code> session ko pass karta hai aur session entry banata hai. <code>action deny</code> use drop karta hai. Nayi policy ka default <b>deny</b> hai, isliye <code>set action accept</code> bhoolne par policy block karti hai.</li>
<li><code>nat enable</code> source address translate karta hai (agla module).</li>
<li><code>logtraffic</code> logging control karta hai: <code>disable</code>, <code>utm</code> (default) ya <code>all</code> (chapter 5).</li>
<li><code>inspection-mode flow</code> (default) ya <code>proxy</code> tay karta hai ki security profiles kaise inspect karein. Profiles UTM modules ka hissa hain.</li>
<li><code>status enable|disable</code>, <code>name</code> aur <code>comments</code> operations mein madad karte hain.</li>
<li><code>send-deny-packet</code> deny policy ko chupchap drop karne ki jagah reset ya ICMP unreachable bhejne deta hai.</li>
</ul>

<h3>CLI mein ek policy banao</h3>
<p>Entry save hone se pehle chhe mandatory attributes set hone chahiye. Bhool jaane par FortiOS yeh kehta hai:</p>
<pre class="out">FGT1 (policy) # edit 1
new entry '1' added
FGT1 (1) # end
<span class="hl">Attribute 'srcintf' MUST be set.</span>
Command fail. Return code 1</pre>
<p>Ab lab ki poori policy, agle chapter ke objects ke saath. <code>edit 0</code> FortiOS se agla free ID use karne ko kehta hai.</p>
<pre class="code"><span class="c">! LAN users to the internet: web, DNS and ping only</span>
config firewall policy
    edit 0
        set name LAN-to-WAN
        set srcintf port2
        set dstintf port1
        set srcaddr LAN_NET
        set dstaddr all
        set action accept
        set schedule always
        set service WEB-DNS-PING
        set nat enable
        set logtraffic all
    end</pre>
<pre class="out">FGT1 # get firewall policy 1
policyid            : 1
name                : LAN-to-WAN
srcintf             : "port2"
dstintf             : "port1"
<span class="hl">action              : accept</span>
srcaddr             : "LAN_NET"
dstaddr             : "all"
schedule            : always
service             : "WEB-DNS-PING"
inspection-mode     : flow
logtraffic          : all
ippool              : disable
nat                 : enable
match-vip           : disable
send-deny-packet    : disable
status              : enable</pre>
<p><code>show firewall policy</code> sirf wahi print karta hai jo default se alag hai, isliye wahan <code>inspection-mode flow</code> nahi dikhega. <code>get</code> har attribute ko uski value ke saath print karta hai. Configuration padhne ke liye <code>show</code> aur effective values dekhne ke liye <code>get</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) 8.8.8.8 par TCP 443 kholta hai. Routing kehti hai egress port1 hai. Packet port2 par aaya, isliye srcintf match. LAN_NET mein 10.0.1.10 hai, isliye srcaddr match. 8.8.8.8 "all" mein hai. Service group WEB-DNS-PING mein HTTPS hai, yaani TCP 443. Schedule always hai. Chhe ke chhe match, action accept, isliye session ban jaata hai aur source NAT lagta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>action</code> ko default deny par chhod dena; galat <code>dstintf</code> chunna (jaise DMZ port jabki route port1 se jaata hai); har jagah <code>service ALL</code> lagana kyunki "chal jaata hai"; yeh bhoolna ki LAN se WAN ki policy ulti direction ko allow <b>nahi</b> karti. Return traffic session se allow hota hai, lekin internet se LAN ka naya connection apni policy maangta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa attribute policy match ka hissa NAHI hai?" Action, NAT aur logging settings match criteria nahi hain. Ek aur favourite: policy <i>source port</i> par match nahi karti. Woh service object ke through destination port par match karti hai.</p></div>

<div class="scn"><h4>Jo policy perfect dikhti thi</h4><p>Ek admin ne dstintf port3 aur web server 10.0.2.10 ke saath "LAN-to-DMZ" banayi, phir bhi connections fail huye. Lookup tool ne policy 0 bataya. Haal ki clean-up ke baad 10.0.2.0/24 ka route missing tha, isliye FortiOS ne egress port1 chuna aur us address ke liye port2 se port1 ki koi policy thi hi nahi. Connected route wapas laane se bina policy change ke theek ho gaya.</p><p><b>Lesson:</b> policy match routing par depend karta hai. Perfect policy match na kare to <code>get router info routing-table all</code> dekho.</p></div>

<div class="iv"><p class="q">"FortiGate firewall policy apply karne se pehle kya match karta hai?"</p><p>Ingress interface, egress interface, source address, destination address, service aur schedule, sab ek saath. Batao ki egress interface routing lookup se milta hai, sirf naye sessions check hote hain, aur action, NAT aur logging policy <i>kya karti hai</i> woh hain, match criteria nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe attributes (srcintf, dstintf, srcaddr, dstaddr, service, schedule) sab match hone chahiye.</li>
<li>Egress interface routing se aata hai, isliye routes policy matching ko affect karte hain.</li>
<li>Nayi policy ka default action deny hai; <code>action accept</code> explicitly set karo.</li>
<li>Mandatory attributes set hone ke baad hi <code>next</code> ya <code>end</code> entry save karta hai.</li>
<li>Configuration ke liye <code>show</code> aur saari effective values ke liye <code>get</code> use karo.</li>
</ul></div>
`}};export{e as default};