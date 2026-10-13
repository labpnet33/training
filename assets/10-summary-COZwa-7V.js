var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a flight, pilots walk around the aircraft with a checklist even though they have done it a thousand times. This chapter is your walk-around for CDP and LLDP: what you must be able to do, the words you must know, the numbers the exam loves, and every command on one page.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CDP and LLDP at a glance">
<rect x="230" y="100" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="14">Layer 2 discovery</text>
<rect x="20" y="20" width="200" height="66" rx="8" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">CDP</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">Cisco, on by default</text><text x="120" y="76" text-anchor="middle" class="svg-muted" font-size="12">60 / 180 s, v2</text>
<rect x="420" y="20" width="200" height="66" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">LLDP</text><text x="520" y="60" text-anchor="middle" class="svg-muted" font-size="12">802.1AB, off on IOS</text><text x="520" y="76" text-anchor="middle" class="svg-muted" font-size="12">30 / 120 / 2 s</text>
<rect x="20" y="166" width="200" height="66" rx="8" fill="#ddd6fe"/><text x="120" y="190" text-anchor="middle" class="svg-ink" font-size="13">Uses</text><text x="120" y="208" text-anchor="middle" class="svg-muted" font-size="12">map, troubleshoot,</text><text x="120" y="224" text-anchor="middle" class="svg-muted" font-size="12">voice VLAN, PoE</text>
<rect x="420" y="166" width="200" height="66" rx="8" fill="#fed7aa"/><text x="520" y="190" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="520" y="208" text-anchor="middle" class="svg-muted" font-size="12">off on untrusted ports,</text><text x="520" y="224" text-anchor="middle" class="svg-muted" font-size="12">off on internet edge</text>
<line x1="220" y1="60" x2="260" y2="100" stroke="#64748b"/><line x1="420" y1="60" x2="380" y2="100" stroke="#64748b"/><line x1="220" y1="190" x2="260" y2="150" stroke="#64748b"/><line x1="420" y1="190" x2="380" y2="150" stroke="#64748b"/>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why discovery protocols exist: documentation, troubleshooting, voice VLAN and PoE negotiation.</li>
<li>State that CDP and LLDP are Layer 2, one-hop, never forwarded, and work before IP is configured.</li>
<li>Read <code>show cdp neighbors</code> and <code>show lldp neighbors</code> and name Local Intrfce/Local Intf (yours) and Port ID (theirs) without hesitation.</li>
<li>Find a neighbour's IP, model, version, native VLAN and duplex with <code>show cdp neighbors detail</code> or <code>show cdp entry</code>, and the management address with <code>show lldp neighbors detail</code>.</li>
<li>Enable and disable CDP globally (<code>cdp run</code>) and per interface (<code>cdp enable</code>).</li>
<li>Enable LLDP globally (<code>lldp run</code>) and control each direction per interface (<code>lldp transmit</code>, <code>lldp receive</code>).</li>
<li>Explain how phones learn the voice VLAN via CDP or LLDP-MED and how PoE is negotiated.</li>
<li>Apply a security policy: on for infrastructure and phones, off for users, guests and the internet edge.</li>
<li>Draw an unknown topology hop by hop and diagnose native VLAN and duplex mismatches from CDP logs.</li>
<li>Troubleshoot a missing neighbour in order: link, global, interface, far end, path, counters.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CDP</dt><dd>Cisco Discovery Protocol, proprietary, SNAP to 0100.0ccc.cccc.</dd>
<dt>LLDP</dt><dd>Link Layer Discovery Protocol, IEEE 802.1AB, EtherType 0x88CC to 0180.c200.000e.</dd>
<dt>LLDP-MED</dt><dd>Media Endpoint Discovery extension of LLDP for phones and other endpoints: network policy, location, power, inventory.</dd>
<dt>TLV</dt><dd>Type-Length-Value field carrying one fact in a discovery frame.</dd>
<dt>Holdtime / TTL</dt><dd>How long the receiver keeps an entry without a new advertisement; set by the sender.</dd>
<dt>Reinit delay</dt><dd>LLDP wait (2 s) before restarting on a port.</dd>
<dt>Device ID</dt><dd>The neighbour's name (or chassis MAC in LLDP if no name is sent).</dd>
<dt>Port ID</dt><dd>The neighbour's port that sent the frame.</dd>
<dt>Voice VLAN</dt><dd>The VLAN a phone tags voice with, advertised by CDP or LLDP-MED.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>IEEE 802.1AB</td></tr>
<tr><td>IOS default</td><td>Enabled</td><td>Disabled</td></tr>
<tr><td>Timer / holdtime</td><td>60 s / 180 s</td><td>30 s / 120 s (reinit 2 s)</td></tr>
<tr><td>Global on</td><td><code>cdp run</code></td><td><code>lldp run</code></td></tr>
<tr><td>Interface off</td><td><code>no cdp enable</code></td><td><code>no lldp transmit</code>, <code>no lldp receive</code></td></tr>
<tr><td>Switch letter</td><td>S</td><td>B</td></tr>
<tr><td>Phone letter</td><td>P</td><td>T</td></tr>
<tr><td>Mismatch syslogs</td><td>Native VLAN, duplex</td><td>Not the CCNA source</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! CDP</span>
cdp run | no cdp run                  <span class="c">! global</span>
cdp enable | no cdp enable            <span class="c">! interface</span>
cdp timer 60 / cdp holdtime 180       <span class="c">! global timers</span>
show cdp                              <span class="c">! global status and timers</span>
show cdp neighbors [detail]
show cdp entry NAME | * [protocol | version]
show cdp interface [intf]
show cdp traffic
clear cdp table
<span class="c">! LLDP</span>
lldp run | no lldp run                <span class="c">! global</span>
lldp transmit | lldp receive          <span class="c">! interface, each with no</span>
lldp timer 30 / lldp holdtime 120 / lldp reinit 2
show lldp
show lldp neighbors [detail]
show lldp entry NAME
show lldp interface [intf]
show lldp traffic
clear lldp table</pre>

<div class="eg"><p><b>Worked example: a five-minute exam drill.</b> Question: "SW1 must learn about a third-party access point on Gi0/12, must not advertise itself on Gi0/5, and must keep CDP towards the Cisco router on Gi0/0." Answer: <code>lldp run</code> globally (LLDP is off by default); on Gi0/5 <code>no lldp transmit</code> and <code>no cdp enable</code>; leave Gi0/0 and Gi0/12 at defaults. Verify with <code>show lldp neighbors</code>, <code>show lldp interface g0/5</code> and <code>show cdp neighbors</code>.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Swapping 60/180 with 30/120; reading Port ID as your port; using <code>no cdp run</code> or <code>no lldp run</code> when only one interface should change; forgetting that LLDP needs <code>lldp run</code> before anything else works; expecting discovery to cross more than one hop.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> <code>show cdp</code> shows timers, not neighbours; the summary table has no IPs; S means switch in CDP but station in LLDP; LLDP-MED extends LLDP, not CDP; the mismatch messages come from CDP; timer mismatches never break either protocol.</p></div>

<div class="scn"><h4>The first-day audit</h4><p>A newly hired engineer at a logistics company was asked to "tell us what we have" across three branch sites. Using only SSH to each core switch, she ran <code>show cdp neighbors detail</code> and <code>show lldp neighbors detail</code>, followed each management address outward, and within a day produced a diagram with every switch, router, access point and model number. Along the way she found two native VLAN mismatch logs, one half-duplex uplink and LLDP transmitting to a guest lobby port, and fixed all four with change approval.</p><p><b>Lesson:</b> everything in this module comes together in one routine task that impresses on day one.</p></div>

<div class="iv"><p class="q">"Summarise CDP and LLDP in one minute."</p><p>Both are Layer 2, one-hop discovery protocols that advertise identity, port, capabilities and a management address. CDP is Cisco proprietary, on by default, 60/180 seconds, and adds native VLAN and duplex mismatch detection. LLDP is IEEE 802.1AB, off by default on IOS, 30/120 seconds, with separate transmit and receive per interface and LLDP-MED for phones. Use them for mapping, troubleshooting, voice VLAN and PoE; disable them on untrusted ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDP: proprietary, on by default, 60/180, <code>cdp run</code> and <code>cdp enable</code>.</li>
<li>LLDP: 802.1AB, off by default, 30/120/2, <code>lldp run</code>, <code>lldp transmit</code>, <code>lldp receive</code>.</li>
<li>Local Intrfce is yours; Port ID is the neighbour's; use detail for IPs.</li>
<li>Discovery delivers voice VLANs and PoE requests, and exposes native VLAN and duplex mismatches.</li>
<li>Keep it on trusted links, off on untrusted ports and internet edges.</li>
</ul></div>
`,hi:`
<p>Flight se pehle pilots checklist ke saath aircraft ke chaaron taraf ghoomte hain, chahe unhone yeh hazaar baar kiya ho. Yeh chapter CDP aur LLDP ke liye aapka walk-around hai: aapko kya kar paana chahiye, kaunse shabd pata hone chahiye, exam ko kaunse numbers pasand hain, aur har command ek page par.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CDP aur LLDP ek nazar mein">
<rect x="230" y="100" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="14">Layer 2 discovery</text>
<rect x="20" y="20" width="200" height="66" rx="8" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">CDP</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">Cisco, default on</text><text x="120" y="76" text-anchor="middle" class="svg-muted" font-size="12">60 / 180 s, v2</text>
<rect x="420" y="20" width="200" height="66" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">LLDP</text><text x="520" y="60" text-anchor="middle" class="svg-muted" font-size="12">802.1AB, IOS par off</text><text x="520" y="76" text-anchor="middle" class="svg-muted" font-size="12">30 / 120 / 2 s</text>
<rect x="20" y="166" width="200" height="66" rx="8" fill="#ddd6fe"/><text x="120" y="190" text-anchor="middle" class="svg-ink" font-size="13">Uses</text><text x="120" y="208" text-anchor="middle" class="svg-muted" font-size="12">map, troubleshoot,</text><text x="120" y="224" text-anchor="middle" class="svg-muted" font-size="12">voice VLAN, PoE</text>
<rect x="420" y="166" width="200" height="66" rx="8" fill="#fed7aa"/><text x="520" y="190" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="520" y="208" text-anchor="middle" class="svg-muted" font-size="12">untrusted ports par off,</text><text x="520" y="224" text-anchor="middle" class="svg-muted" font-size="12">internet edge par off</text>
<line x1="220" y1="60" x2="260" y2="100" stroke="#64748b"/><line x1="420" y1="60" x2="380" y2="100" stroke="#64748b"/><line x1="220" y1="190" x2="260" y2="150" stroke="#64748b"/><line x1="420" y1="190" x2="380" y2="150" stroke="#64748b"/>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki discovery protocols kyun hote hain: documentation, troubleshooting, voice VLAN aur PoE negotiation.</li>
<li>Batao ki CDP aur LLDP Layer 2, one-hop hain, kabhi forward nahi hote, aur IP configure hone se pehle kaam karte hain.</li>
<li><code>show cdp neighbors</code> aur <code>show lldp neighbors</code> padho aur bina hichkichaye Local Intrfce/Local Intf (aapka) aur Port ID (unka) batao.</li>
<li><code>show cdp neighbors detail</code> ya <code>show cdp entry</code> se neighbour ka IP, model, version, native VLAN aur duplex nikalo, aur <code>show lldp neighbors detail</code> se management address.</li>
<li>CDP ko globally (<code>cdp run</code>) aur per interface (<code>cdp enable</code>) enable aur disable karo.</li>
<li>LLDP ko globally enable karo (<code>lldp run</code>) aur per interface har direction control karo (<code>lldp transmit</code>, <code>lldp receive</code>).</li>
<li>Samjhao ki phones CDP ya LLDP-MED se voice VLAN kaise seekhte hain aur PoE kaise negotiate hota hai.</li>
<li>Security policy lagao: infrastructure aur phones ke liye on, users, guests aur internet edge ke liye off.</li>
<li>Anjaan topology ko hop by hop draw karo aur CDP logs se native VLAN aur duplex mismatch diagnose karo.</li>
<li>Missing neighbour ko order mein troubleshoot karo: link, global, interface, far end, path, counters.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CDP</dt><dd>Cisco Discovery Protocol, proprietary, SNAP se 0100.0ccc.cccc par.</dd>
<dt>LLDP</dt><dd>Link Layer Discovery Protocol, IEEE 802.1AB, EtherType 0x88CC se 0180.c200.000e par.</dd>
<dt>LLDP-MED</dt><dd>Phones aur doosre endpoints ke liye LLDP ka Media Endpoint Discovery extension: network policy, location, power, inventory.</dd>
<dt>TLV</dt><dd>Type-Length-Value field jo discovery frame mein ek fact carry karta hai.</dd>
<dt>Holdtime / TTL</dt><dd>Naya advertisement na aaye to receiver entry kitni der rakhta hai; sender set karta hai.</dd>
<dt>Reinit delay</dt><dd>Port par LLDP restart karne se pehle ka wait (2 s).</dd>
<dt>Device ID</dt><dd>Neighbour ka naam (LLDP mein naam na bheja jaaye to chassis MAC).</dd>
<dt>Port ID</dt><dd>Neighbour ka woh port jisne frame bheja.</dd>
<dt>Voice VLAN</dt><dd>Woh VLAN jisse phone voice ko tag karta hai, CDP ya LLDP-MED se advertise hota hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>IEEE 802.1AB</td></tr>
<tr><td>IOS default</td><td>Enabled</td><td>Disabled</td></tr>
<tr><td>Timer / holdtime</td><td>60 s / 180 s</td><td>30 s / 120 s (reinit 2 s)</td></tr>
<tr><td>Global on</td><td><code>cdp run</code></td><td><code>lldp run</code></td></tr>
<tr><td>Interface off</td><td><code>no cdp enable</code></td><td><code>no lldp transmit</code>, <code>no lldp receive</code></td></tr>
<tr><td>Switch letter</td><td>S</td><td>B</td></tr>
<tr><td>Phone letter</td><td>P</td><td>T</td></tr>
<tr><td>Mismatch syslogs</td><td>Native VLAN, duplex</td><td>CCNA ka source nahi</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! CDP</span>
cdp run | no cdp run                  <span class="c">! global</span>
cdp enable | no cdp enable            <span class="c">! interface</span>
cdp timer 60 / cdp holdtime 180       <span class="c">! global timers</span>
show cdp                              <span class="c">! global status aur timers</span>
show cdp neighbors [detail]
show cdp entry NAME | * [protocol | version]
show cdp interface [intf]
show cdp traffic
clear cdp table
<span class="c">! LLDP</span>
lldp run | no lldp run                <span class="c">! global</span>
lldp transmit | lldp receive          <span class="c">! interface, har ek no ke saath</span>
lldp timer 30 / lldp holdtime 120 / lldp reinit 2
show lldp
show lldp neighbors [detail]
show lldp entry NAME
show lldp interface [intf]
show lldp traffic
clear lldp table</pre>

<div class="eg"><p><b>Worked example: paanch minute ki exam drill.</b> Question: "SW1 ko Gi0/12 par ek third-party access point ke baare mein seekhna hai, Gi0/5 par khud ko advertise nahi karna, aur Gi0/0 par Cisco router ki taraf CDP rakhna hai." Jawab: globally <code>lldp run</code> (LLDP default off hai); Gi0/5 par <code>no lldp transmit</code> aur <code>no cdp enable</code>; Gi0/0 aur Gi0/12 defaults par chhodo. <code>show lldp neighbors</code>, <code>show lldp interface g0/5</code> aur <code>show cdp neighbors</code> se verify karo.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyon se bacho.</b> 60/180 ko 30/120 se badal dena; Port ID ko apna port padhna; jab sirf ek interface badalna ho tab <code>no cdp run</code> ya <code>no lldp run</code> use karna; bhool jaana ki kuch bhi kaam karne se pehle LLDP ko <code>lldp run</code> chahiye; discovery se ek hop se zyada cross karne ki umeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> <code>show cdp</code> timers dikhata hai, neighbours nahi; summary table mein IPs nahi hote; CDP mein S ka matlab switch lekin LLDP mein station; LLDP-MED LLDP ko extend karta hai, CDP ko nahi; mismatch messages CDP se aate hain; timer mismatch kisi bhi protocol ko nahi todta.</p></div>

<div class="scn"><h4>Pehle din ka audit</h4><p>Ek logistics company mein nayi hire hui engineer ko teen branch sites mein "batao hamare paas kya hai" kaha gaya. Sirf har core switch ke SSH se usne <code>show cdp neighbors detail</code> aur <code>show lldp neighbors detail</code> chalaye, har management address ko bahar ki taraf follow kiya, aur ek din mein har switch, router, access point aur model number ke saath diagram bana diya. Raaste mein use do native VLAN mismatch logs, ek half-duplex uplink aur guest lobby port par transmit karta LLDP mila, aur usne change approval ke saath chaaron theek kiye.</p><p><b>Seekh:</b> is module ki har cheez ek routine task mein ek saath aati hai jo pehle hi din impress karta hai.</p></div>

<div class="iv"><p class="q">"CDP aur LLDP ko ek minute mein summarise karo."</p><p>Dono Layer 2, one-hop discovery protocols hain jo identity, port, capabilities aur management address advertise karte hain. CDP Cisco proprietary hai, default on, 60/180 seconds, aur native VLAN aur duplex mismatch detection jodta hai. LLDP IEEE 802.1AB hai, IOS par default off, 30/120 seconds, per interface alag transmit aur receive ke saath aur phones ke liye LLDP-MED. Inhe mapping, troubleshooting, voice VLAN aur PoE ke liye use karo; untrusted ports par disable karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDP: proprietary, default on, 60/180, <code>cdp run</code> aur <code>cdp enable</code>.</li>
<li>LLDP: 802.1AB, default off, 30/120/2, <code>lldp run</code>, <code>lldp transmit</code>, <code>lldp receive</code>.</li>
<li>Local Intrfce aapka hai; Port ID neighbour ka; IPs ke liye detail use karo.</li>
<li>Discovery voice VLANs aur PoE requests deliver karti hai, aur native VLAN aur duplex mismatch dikhati hai.</li>
<li>Trusted links par on rakho, untrusted ports aur internet edges par off.</li>
</ul></div>
`}};export{e as default};