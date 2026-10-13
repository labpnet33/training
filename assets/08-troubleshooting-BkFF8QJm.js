var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when a hardening change locks everyone out`,hi:`Troubleshooting workflow: jab hardening change sabko bahar kar de`},body:{en:`
<p><b>Why this chapter matters.</b> Security features work by dropping traffic. When something drops traffic by design, a wrong value is indistinguishable from an attack. Most "Layer 2 security" tickets are not attacks at all; they are a legitimate user hit by a protection that is slightly too tight. A good engineer finds <i>which</i> protection dropped the traffic and tunes it without removing it.</p>

<h3>A repeatable workflow</h3>
<ol>
<li><b>Define the symptom and the scope.</b> One user, one VLAN, one switch, everyone? Scope points at the layer: one port means port-level control; the whole VLAN means a VLAN filter or the uplink.</li>
<li><b>Check the physical path first.</b> Interface up, right VLAN, trunk allowed. <code>show interfaces terse</code>, <code>show ethernet-switching interface</code>.</li>
<li><b>Walk the controls from the wire inward.</b> Link encryption (MACsec), STP state, port-level controls (MAC limit, storm control), VLAN-level controls (DHCP security, filters).</li>
<li><b>Read the counters and flags.</b> Flags such as <code>LH</code>, <code>AD</code>, counters in <code>show firewall</code>, DAI statistics, binding table.</li>
<li><b>Change one thing, commit with <code>commit confirmed</code>, test, repeat.</b></li>
<li><b>Keep every protection.</b> Fix the value, not the feature.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting order">
<rect x="10" y="40" width="105" height="50" rx="8" fill="#bae6fd"/><text x="62" y="70" text-anchor="middle" class="svg-ink" font-size="12">Link / MACsec</text>
<rect x="135" y="40" width="105" height="50" rx="8" fill="#bae6fd"/><text x="187" y="70" text-anchor="middle" class="svg-ink" font-size="12">STP state</text>
<rect x="260" y="40" width="105" height="50" rx="8" fill="#bbf7d0"/><text x="312" y="70" text-anchor="middle" class="svg-ink" font-size="12">Port: MAC limit</text>
<rect x="385" y="40" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="437" y="70" text-anchor="middle" class="svg-ink" font-size="12">VLAN: DHCP sec</text>
<rect x="510" y="40" width="105" height="50" rx="8" fill="#fde68a"/><text x="562" y="70" text-anchor="middle" class="svg-ink" font-size="12">Filters</text>
<line x1="115" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="365" y1="65" x2="385" y2="65" stroke="#64748b" stroke-width="2"/><line x1="490" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">wire first, then inward to the most specific rule</text>
</svg><p class="cap">Check from the cable inward.</p></div>

<h3>Walkthrough: the lab ticket</h3>
<p><b>Ticket.</b> The training lab switch ACC was hardened overnight with MACsec on the uplink to CORE, a VLAN filter that keeps a decommissioned camera (MAC 00:ca:fe:00:00:01) off VLAN LAB, and a MAC limit on the desk-switch port ge-0/0/3. Nobody in the lab can reach the gateway 10.60.0.1. Trainees TR1 and TR2 sit behind the desk switch. Keep every protection, make it work.</p>
<p><b>Step 1: the uplink.</b> Start at the wire. Two faults hide in the next output: no peer and blocked traffic.</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Peer list
    <span class="hl">(none: MKA packets from the peer fail the integrity check (ICV))</span>

lab@ACC&gt; show security macsec connections
          Secure channels: none (MKA packets from the peer fail the integrity check (ICV)), traffic blocked</pre>
<p>The CKN is the same, so the key <i>name</i> is right; the secret CAK differs. Compare <code>show configuration security macsec</code> on both switches and correct ACC to use CORE's CAK. Verify a live peer afterwards (chapter 6).</p>
<p><b>Step 2: ports and flags.</b></p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
ge-0/0/3.0                                       1       294912              <span class="hl">LH,AD</span>             untagged
                LAB                      60      294912  294912  Forwarding  LH,AD             untagged</pre>
<p>Port ge-0/0/3 has a MAC limit of 1 and has been hit (LH) with the drop action (AD). Behind the desk switch there are two trainees, so two MACs. Raise the limit to a realistic number, keeping the action:</p>
<pre class="code">set switch-options interface ge-0/0/3 interface-mac-limit 3 packet-action drop</pre>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/3 detail
  Interface flags          : AD
  <span class="hl">MAC limit                : 3 (packet action drop)</span>
  <span class="hl">MAC addresses learned    : 2</span>
  MAC limit hit            : no</pre>
<p><b>Step 3: the filter.</b> Show the configured filter and look at what it allows.</p>
<pre class="out">lab@ACC&gt; show configuration firewall family ethernet-switching
filter PROTECT {
    term block-cam { from { source-mac-address 00:ca:fe:00:00:01; } then { discard; count cam-drops; } }
    term allow-ip  { from { ether-type ipv4; } then { accept; } }
}</pre>
<p>(The braces are shown on one line here for readability; the real output spreads them over several lines.) Only IPv4 is accepted. ARP, which every host needs to find 10.60.0.1, falls into the implicit discard. Add the missing term:</p>
<pre class="code">set firewall family ethernet-switching filter PROTECT term allow-ip from ether-type arp</pre>
<p>That statement adds a second <code>from</code> condition to the same term. Multiple values of the same match type are alternatives (ARP <i>or</i> IPv4), so the term now accepts both. Commit, and check the result.</p>
<pre class="out">lab@ACC&gt; show firewall
Filter: PROTECT
Counters:
Name                                                Bytes              Packets
<span class="hl">cam-drops                                             384                    6</span></pre>
<p>The camera counter climbs as the camera keeps trying, proving the block still works while TR1 and TR2 now reach the gateway. Every protection is still in place.</p>

<table class="cmp"><tr><th>Symptom</th><th>First check</th><th>Likely cause</th></tr>
<tr><td>Uplink up, no traffic</td><td><code>show security macsec connections</code></td><td>CAK mismatch</td></tr>
<tr><td>One port: some devices die</td><td>flags <code>LH</code></td><td>MAC limit too low</td></tr>
<tr><td>Port goes down by itself</td><td><code>show interfaces</code> for BPDU error</td><td>BPDU protection, rogue switch</td></tr>
<tr><td>VLAN has no addresses</td><td><code>show dhcp-security binding</code></td><td>real server port not trusted</td></tr>
<tr><td>Static host cannot talk</td><td>DAI statistics, binding table</td><td>no binding for static IP</td></tr>
<tr><td>Ping fails, IP allowed</td><td><code>show firewall</code></td><td>ARP hits implicit discard</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Fixing a ticket by deleting the protection ("remove the filter, it works"). Users are happy for a week, then the camera or a rogue DHCP server returns. Tune the value and note the reason in the commit comment (<code>commit comment "raise LB limit to 3"</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions show two or three small faults in one output (a CAK difference, an LH flag, a missing ARP term). Fix each independently; do not assume one cause explains everything.</p></div>

<div class="scn"><h4>Three faults, one morning</h4><p>The lab ticket looked like one outage but had three independent causes, each introduced by a well-meant protection. The engineer restored service in about twenty minutes by walking from the cable inward, and wrote a one-line note for each fix in the change record. The security team re-ran their compliance scan and every control was still present.</p><p><b>Lesson:</b> a methodical order beats guessing; protections should be tuned, never removed.</p></div>
<div class="iv"><p class="q">"A security change broke connectivity. How do you isolate which feature is responsible?"</p><p>Establish scope, then test layer by layer from the wire inward: MACsec session, STP state, MAC limit flags and counters, DHCP security bindings and DAI counters, firewall filter counters. Change one thing at a time with <code>commit confirmed</code>, and keep the control by correcting its parameters.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most security tickets are legitimate users hit by a too-tight control.</li>
<li>Walk from the cable inward: MACsec, STP, port limits, VLAN controls, filters.</li>
<li>Read flags and counters: <code>LH</code>, <code>AD</code>, <code>show firewall</code>, binding table, MKA peer list.</li>
<li>Fix values, not features; use <code>commit confirmed</code> and comments.</li>
<li>Several independent faults can coexist.</li>
</ul></div>
`,hi:`
<p><b>Yeh chapter kyun zaroori hai.</b> Security features traffic drop karke kaam karte hain. Jab kuch design se traffic drop karta hai to galat value aur attack mein farak nahi dikhta. Zyaadatar "Layer 2 security" tickets attack nahi hote; woh legitimate user hote hain jo thodi zyada kasi hui protection se takra gaye. Achha engineer pata lagata hai <i>kaunsi</i> protection ne traffic drop kiya aur use hataye bina tune karta hai.</p>

<h3>Dohraya ja sakne wala workflow</h3>
<ol>
<li><b>Symptom aur scope tay karo.</b> Ek user, ek VLAN, ek switch, sab? Scope layer batata hai: ek port matlab port-level control; poora VLAN matlab VLAN filter ya uplink.</li>
<li><b>Pehle physical path dekho.</b> Interface up, sahi VLAN, trunk allowed. <code>show interfaces terse</code>, <code>show ethernet-switching interface</code>.</li>
<li><b>Wire se andar ki taraf controls dekho.</b> Link encryption (MACsec), STP state, port-level controls (MAC limit, storm control), VLAN-level controls (DHCP security, filters).</li>
<li><b>Counters aur flags padho.</b> <code>LH</code>, <code>AD</code> jaise flags, <code>show firewall</code> ke counters, DAI statistics, binding table.</li>
<li><b>Ek cheez badlo, <code>commit confirmed</code> se commit karo, test karo, dohrao.</b></li>
<li><b>Har protection rakho.</b> Value theek karo, feature nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting ka order">
<rect x="10" y="40" width="105" height="50" rx="8" fill="#bae6fd"/><text x="62" y="70" text-anchor="middle" class="svg-ink" font-size="12">Link / MACsec</text>
<rect x="135" y="40" width="105" height="50" rx="8" fill="#bae6fd"/><text x="187" y="70" text-anchor="middle" class="svg-ink" font-size="12">STP state</text>
<rect x="260" y="40" width="105" height="50" rx="8" fill="#bbf7d0"/><text x="312" y="70" text-anchor="middle" class="svg-ink" font-size="12">Port: MAC limit</text>
<rect x="385" y="40" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="437" y="70" text-anchor="middle" class="svg-ink" font-size="12">VLAN: DHCP sec</text>
<rect x="510" y="40" width="105" height="50" rx="8" fill="#fde68a"/><text x="562" y="70" text-anchor="middle" class="svg-ink" font-size="12">Filters</text>
<line x1="115" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="365" y1="65" x2="385" y2="65" stroke="#64748b" stroke-width="2"/><line x1="490" y1="65" x2="510" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">pehle wire, phir andar sabse specific rule tak</text>
</svg><p class="cap">Cable se andar ki taraf check karo.</p></div>

<h3>Walkthrough: lab ticket</h3>
<p><b>Ticket.</b> Training lab switch ACC ko raat bhar mein harden kiya gaya: CORE ke uplink par MACsec, VLAN filter jo band kiye camera (MAC 00:ca:fe:00:00:01) ko VLAN LAB se bahar rakhe, aur desk-switch wale port ge-0/0/3 par MAC limit. Lab mein koi gateway 10.60.0.1 tak nahi pahunch pa raha. Trainees TR1 aur TR2 desk switch ke peeche hain. Har protection rakho, kaam karwao.</p>
<p><b>Step 1: uplink.</b> Wire se shuru karo. Agle output mein do faults chhupe hain: koi peer nahi aur blocked traffic.</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Peer list
    <span class="hl">(none: MKA packets from the peer fail the integrity check (ICV))</span>

lab@ACC&gt; show security macsec connections
          Secure channels: none (MKA packets from the peer fail the integrity check (ICV)), traffic blocked</pre>
<p>CKN same hai, to key ka <i>naam</i> sahi hai; secret CAK alag hai. Dono switches par <code>show configuration security macsec</code> compare karo aur ACC ko CORE ka CAK do. Baad mein live peer verify karo (chapter 6).</p>
<p><b>Step 2: ports aur flags.</b></p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface
ge-0/0/3.0                                       1       294912              <span class="hl">LH,AD</span>             untagged
                LAB                      60      294912  294912  Forwarding  LH,AD             untagged</pre>
<p>Port ge-0/0/3 par MAC limit 1 hai aur wo hit ho chuki hai (LH) drop action ke saath (AD). Desk switch ke peeche do trainees hain, yaani do MACs. Action rakhte hue limit realistic karo:</p>
<pre class="code">set switch-options interface ge-0/0/3 interface-mac-limit 3 packet-action drop</pre>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/3 detail
  Interface flags          : AD
  <span class="hl">MAC limit                : 3 (packet action drop)</span>
  <span class="hl">MAC addresses learned    : 2</span>
  MAC limit hit            : no</pre>
<p><b>Step 3: filter.</b> Configured filter dikhao aur dekho woh kya allow karta hai.</p>
<pre class="out">lab@ACC&gt; show configuration firewall family ethernet-switching
filter PROTECT {
    term block-cam { from { source-mac-address 00:ca:fe:00:00:01; } then { discard; count cam-drops; } }
    term allow-ip  { from { ether-type ipv4; } then { accept; } }
}</pre>
<p>(Padhne mein aasani ke liye braces ek line mein dikhaye hain; asli output kai lines mein hota hai.) Sirf IPv4 accept hota hai. ARP, jo har host ko 10.60.0.1 dhoondhne ke liye chahiye, implicit discard mein gir jaata hai. Missing term jodo:</p>
<pre class="code">set firewall family ethernet-switching filter PROTECT term allow-ip from ether-type arp</pre>
<p>Yeh statement usi term mein doosri <code>from</code> condition jodta hai. Ek hi match type ki kai values alternatives hoti hain (ARP <i>ya</i> IPv4), isliye ab term dono accept karta hai. Commit karo aur result dekho.</p>
<pre class="out">lab@ACC&gt; show firewall
Filter: PROTECT
Counters:
Name                                                Bytes              Packets
<span class="hl">cam-drops                                             384                    6</span></pre>
<p>Camera ka counter badhta rehta hai kyunki camera koshish karta rehta hai, jisse saabit hota hai ki block ab bhi kaam karta hai jabki TR1 aur TR2 ab gateway tak pahunchte hain. Har protection abhi bhi maujood hai.</p>

<table class="cmp"><tr><th>Symptom</th><th>Pehla check</th><th>Sambhav wajah</th></tr>
<tr><td>Uplink up, traffic nahi</td><td><code>show security macsec connections</code></td><td>CAK mismatch</td></tr>
<tr><td>Ek port: kuch devices mar jaate hain</td><td>flags <code>LH</code></td><td>MAC limit bahut kam</td></tr>
<tr><td>Port apne aap down</td><td>BPDU error ke liye <code>show interfaces</code></td><td>BPDU protection, rogue switch</td></tr>
<tr><td>VLAN ko addresses nahi</td><td><code>show dhcp-security binding</code></td><td>asli server port trusted nahi</td></tr>
<tr><td>Static host baat nahi kar paata</td><td>DAI statistics, binding table</td><td>static IP ka binding nahi</td></tr>
<tr><td>Ping fail, IP allowed</td><td><code>show firewall</code></td><td>ARP implicit discard mein</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Ticket protection delete karke theek karna ("filter hata do, chal raha hai"). Users ek hafta khush rehte hain, phir camera ya rogue DHCP server wapas aa jaata hai. Value tune karo aur commit comment mein wajah likho (<code>commit comment "raise LB limit to 3"</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions ek hi output mein do-teen chhote faults dikhate hain (CAK ka farak, LH flag, missing ARP term). Har ek ko alag theek karo; maan mat lo ki ek wajah sab kuch explain karti hai.</p></div>

<div class="scn"><h4>Ek subah, teen faults</h4><p>Lab ticket ek outage jaisa dikhta tha lekin uske teen alag causes the, har ek achhi niyat se lagayi protection se aaya. Engineer ne cable se andar ki taraf chalte hue lagbhag bees minute mein service wapas kar di, aur change record mein har fix ke liye ek line likhi. Security team ne compliance scan dobara chalaya aur har control maujood tha.</p><p><b>Lesson:</b> tareeke se order andaze se behtar hai; protections tune karo, hatao mat.</p></div>
<div class="iv"><p class="q">"Security change ne connectivity tod di. Kaunsa feature zimmedar hai yeh kaise alag karoge?"</p><p>Scope tay karo, phir wire se andar layer-by-layer test karo: MACsec session, STP state, MAC limit flags aur counters, DHCP security bindings aur DAI counters, firewall filter counters. <code>commit confirmed</code> ke saath ek-ek cheez badlo, aur parameters theek karke control rakho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyaadatar security tickets legitimate users hote hain jo zyada kasi hui control se takraye.</li>
<li>Cable se andar chalo: MACsec, STP, port limits, VLAN controls, filters.</li>
<li>Flags aur counters padho: <code>LH</code>, <code>AD</code>, <code>show firewall</code>, binding table, MKA peer list.</li>
<li>Values theek karo, features nahi; <code>commit confirmed</code> aur comments use karo.</li>
<li>Kai independent faults ek saath ho sakte hain.</li>
</ul></div>
`}};export{e as default};