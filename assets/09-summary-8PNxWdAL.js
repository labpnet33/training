var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an access switch that trusts everyone. You now know how to make each port role safe: untrusted access ports, trusted uplinks, encrypted inter-switch links. This chapter gathers everything for revision before the JNCIS-ENT exam and before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Baseline per port role">
<rect x="30" y="20" width="280" height="190" rx="12" fill="#fed7aa"/><text x="170" y="45" text-anchor="middle" class="svg-ink" font-size="14">User / access port (untrusted)</text>
<text x="50" y="75" class="svg-ink" font-size="12">edge + bpdu-block-on-edge</text><text x="50" y="100" class="svg-ink" font-size="12">interface-mac-limit + action</text><text x="50" y="125" class="svg-ink" font-size="12">storm-control profile</text><text x="50" y="150" class="svg-ink" font-size="12">DHCP snooping, DAI, IPSG (VLAN)</text><text x="50" y="175" class="svg-ink" font-size="12">VLAN or port firewall filter</text>
<rect x="330" y="20" width="280" height="190" rx="12" fill="#bbf7d0"/><text x="470" y="45" text-anchor="middle" class="svg-ink" font-size="14">Uplink / trunk (trusted)</text>
<text x="350" y="75" class="svg-ink" font-size="12">loop protection (bpdu-timeout-action)</text><text x="350" y="100" class="svg-ink" font-size="12">no-root-port on downlinks / partners</text><text x="350" y="125" class="svg-ink" font-size="12">MACsec between switches</text><text x="350" y="150" class="svg-ink" font-size="12">DHCP trust by default</text>
</svg><p class="cap">The baseline you repeat on every access switch.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the attack behind each feature: rogue root, MAC flooding, rogue DHCP, ARP and IP spoofing, storms, link tapping.</li>
<li>Configure BPDU, root and loop protection and say which reacts to superior BPDUs, which to any BPDU, and which to missing BPDUs.</li>
<li>Set <code>interface-mac-limit</code> with each packet action and explain the LH and AD flags.</li>
<li>Build a storm-control profile and apply it to a port.</li>
<li>Enable DHCP snooping, trust a server port, and read the binding table.</li>
<li>Enable DAI and IP source guard and explain why they need the bindings.</li>
<li>Configure static CAK MACsec and diagnose a CAK mismatch from the MKA output.</li>
<li>Write an ethernet-switching filter, apply it to a port or a VLAN and read its counters.</li>
<li>Troubleshoot a hardening change layer by layer without removing a protection.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge Protocol Data Unit, the message STP switches exchange.</dd>
<dt>Edge port</dt><dd>A port facing a host that goes forwarding immediately and should never see BPDUs.</dd>
<dt>BUM</dt><dd>Broadcast, unknown-unicast and multicast traffic.</dd>
<dt>Binding table</dt><dd>The DHCP snooping database of IP, MAC, VLAN, port and lease.</dd>
<dt>Trusted port</dt><dd>A port from which DHCP server messages are accepted and ARP/IP are not inspected.</dd>
<dt>CAK / CKN / SAK</dt><dd>MACsec long-term key, its name, and the session key derived by MKA.</dd>
<dt>Implicit discard</dt><dd>The hidden final rule of every Junos filter.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Command for BPDU protection on edge ports</td><td><code>set protocols rstp bpdu-block-on-edge</code></td></tr>
<tr><td>Root protection</td><td><code>no-root-port</code>; blocks on superior BPDU; self-recovers</td></tr>
<tr><td>Loop protection</td><td><code>bpdu-timeout-action block</code>; for lost BPDUs</td></tr>
<tr><td>Re-enable a BPDU-disabled port</td><td><code>clear error bpdu</code> or <code>disable-timeout</code></td></tr>
<tr><td>MAC limit flag</td><td>LH (limit hit); AD (action drop)</td></tr>
<tr><td>DHCP trust default</td><td>access untrusted, trunk trusted</td></tr>
<tr><td>Where DAI and IPSG are enabled</td><td>per VLAN under <code>forwarding-options dhcp-security</code></td></tr>
<tr><td>What DAI inspects / what IPSG inspects</td><td>ARP / source IP and MAC of IP packets</td></tr>
<tr><td>MACsec standard and mode</td><td>802.1AE, static CAK with MKA</td></tr>
<tr><td>Empty MKA peer list</td><td>CAK mismatch or peer not configured</td></tr>
<tr><td>Packet that matches no filter term</td><td>discarded</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out">show spanning-tree bridge
show spanning-tree interface
show interfaces ge-0/0/3                     <i>BPDU Error: Detected</i>
clear error bpdu interface ge-0/0/3
show ethernet-switching interface [detail]
show ethernet-switching storm-control
show ethernet-switching table
show dhcp-security binding
show dhcp-security binding ip-source-guard
show dhcp-security arp inspection statistics
show security mka sessions
show security macsec connections
show firewall
show configuration firewall family ethernet-switching</pre>

<div class="eg"><p><b>Worked example for revision.</b> New access switch ACC2 serves VLAN STAFF (30) and has an uplink to CORE. You configure: edge + bpdu-block-on-edge on user ports; mac-limit 3 and drop; storm-control 5 percent; dhcp-security on STAFF with the server group trusted; DAI and IPSG after verifying bindings; MACsec on the uplink with the same CKN and CAK as CORE. Verify each with the commands above, one by one.</p></div>

<div class="warn"><p><b>Common mistakes to recall.</b> Root protection toward the real root; forgetting to trust the access-port DHCP server; MAC limit lower than the devices behind the port; a filter that forgets ARP; changing a MACsec CAK on one end only.</p></div>
<div class="exam"><p><b>Last exam traps.</b> Do not mix up BPDU/root/loop protection; DAI and IPSG need snooping; MACsec is hop by hop; filter terms are first match with implicit discard; <code>packet-action none</code> does not stop forwarding.</p></div>

<div class="scn"><h4>The audit that passed</h4><p>An external auditor asked a college IT team to show how its access layer resisted rogue devices. The team demonstrated a visitor switch disabled by BPDU protection, a flood tool stopped by a MAC limit, a home router whose DHCP offers were dropped, and an encrypted uplink with a live MKA peer. Each demo took one command to prove. The auditor asked only for the baseline template.</p><p><b>Lesson:</b> a documented baseline per port role is both a defence and a proof.</p></div>
<div class="iv"><p class="q">"Give me a secure baseline for an access switch in two minutes."</p><p>Untrusted user ports: edge, BPDU protection, MAC limit with drop or shutdown, storm control, DHCP snooping with trusted server ports, DAI and IP source guard on user VLANs, and a filter for known bad MACs. Uplinks: loop protection, root protection toward downstream partners, MACsec between switches. Mention staged rollout and <code>commit confirmed</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline by port role: untrusted access, trusted uplink.</li>
<li>Know what each feature reacts to and how it recovers.</li>
<li>Snooping first; DAI and IPSG depend on it.</li>
<li>MACsec is hop by hop; read the MKA peer list.</li>
<li>Tune values, never remove protections, and verify with counters.</li>
</ul></div>
`,hi:`
<p>Aapne ek aise access switch se shuruaat ki jo sab par bharosa karta hai. Ab aap jaante ho har port role ko safe kaise banate hain: untrusted access ports, trusted uplinks, encrypted inter-switch links. Yeh chapter JNCIS-ENT exam aur interview se pehle revision ke liye sab kuch ek jagah jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Port role ke hisaab se baseline">
<rect x="30" y="20" width="280" height="190" rx="12" fill="#fed7aa"/><text x="170" y="45" text-anchor="middle" class="svg-ink" font-size="14">User / access port (untrusted)</text>
<text x="50" y="75" class="svg-ink" font-size="12">edge + bpdu-block-on-edge</text><text x="50" y="100" class="svg-ink" font-size="12">interface-mac-limit + action</text><text x="50" y="125" class="svg-ink" font-size="12">storm-control profile</text><text x="50" y="150" class="svg-ink" font-size="12">DHCP snooping, DAI, IPSG (VLAN)</text><text x="50" y="175" class="svg-ink" font-size="12">VLAN ya port firewall filter</text>
<rect x="330" y="20" width="280" height="190" rx="12" fill="#bbf7d0"/><text x="470" y="45" text-anchor="middle" class="svg-ink" font-size="14">Uplink / trunk (trusted)</text>
<text x="350" y="75" class="svg-ink" font-size="12">loop protection (bpdu-timeout-action)</text><text x="350" y="100" class="svg-ink" font-size="12">downlinks / partners par no-root-port</text><text x="350" y="125" class="svg-ink" font-size="12">switches ke beech MACsec</text><text x="350" y="150" class="svg-ink" font-size="12">DHCP trust default se</text>
</svg><p class="cap">Wo baseline jo aap har access switch par dohrate ho.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Har feature ke peeche ka attack samjha sako: rogue root, MAC flooding, rogue DHCP, ARP aur IP spoofing, storms, link tapping.</li>
<li>BPDU, root aur loop protection configure karo aur batao kaun superior BPDUs par, kaun kisi bhi BPDU par, aur kaun missing BPDUs par react karti hai.</li>
<li>Har packet action ke saath <code>interface-mac-limit</code> set karo aur LH tatha AD flags samjhao.</li>
<li>Storm-control profile banao aur port par lagao.</li>
<li>DHCP snooping on karo, server port trust karo, aur binding table padho.</li>
<li>DAI aur IP source guard on karo aur samjhao unhe bindings kyun chahiye.</li>
<li>Static CAK MACsec configure karo aur MKA output se CAK mismatch diagnose karo.</li>
<li>Ethernet-switching filter likho, port ya VLAN par lagao aur counters padho.</li>
<li>Protection hataye bina hardening change ka layer-by-layer troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge Protocol Data Unit, STP switches ke beech ka message.</dd>
<dt>Edge port</dt><dd>Host ki taraf ka port jo turant forwarding mein jaata hai aur jise kabhi BPDUs nahi dikhne chahiye.</dd>
<dt>BUM</dt><dd>Broadcast, unknown-unicast aur multicast traffic.</dd>
<dt>Binding table</dt><dd>IP, MAC, VLAN, port aur lease ka DHCP snooping database.</dd>
<dt>Trusted port</dt><dd>Woh port jahan se DHCP server messages accept hote hain aur ARP/IP inspect nahi hote.</dd>
<dt>CAK / CKN / SAK</dt><dd>MACsec ki lambe samay ki key, uska naam, aur MKA se nikla session key.</dd>
<dt>Implicit discard</dt><dd>Har Junos filter ka chhupa aakhri rule.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Edge ports par BPDU protection ka command</td><td><code>set protocols rstp bpdu-block-on-edge</code></td></tr>
<tr><td>Root protection</td><td><code>no-root-port</code>; superior BPDU par block; khud recover</td></tr>
<tr><td>Loop protection</td><td><code>bpdu-timeout-action block</code>; lost BPDUs ke liye</td></tr>
<tr><td>BPDU se disable port dobara enable</td><td><code>clear error bpdu</code> ya <code>disable-timeout</code></td></tr>
<tr><td>MAC limit flag</td><td>LH (limit hit); AD (action drop)</td></tr>
<tr><td>DHCP trust default</td><td>access untrusted, trunk trusted</td></tr>
<tr><td>DAI aur IPSG kahan enable hote hain</td><td>VLAN ke hisaab se <code>forwarding-options dhcp-security</code> ke neeche</td></tr>
<tr><td>DAI kya inspect karta hai / IPSG kya</td><td>ARP / IP packets ka source IP aur MAC</td></tr>
<tr><td>MACsec standard aur mode</td><td>802.1AE, MKA ke saath static CAK</td></tr>
<tr><td>Khaali MKA peer list</td><td>CAK mismatch ya peer configured nahi</td></tr>
<tr><td>Jo packet kisi filter term se match na ho</td><td>discard hota hai</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out">show spanning-tree bridge
show spanning-tree interface
show interfaces ge-0/0/3                     <i>BPDU Error: Detected</i>
clear error bpdu interface ge-0/0/3
show ethernet-switching interface [detail]
show ethernet-switching storm-control
show ethernet-switching table
show dhcp-security binding
show dhcp-security binding ip-source-guard
show dhcp-security arp inspection statistics
show security mka sessions
show security macsec connections
show firewall
show configuration firewall family ethernet-switching</pre>

<div class="eg"><p><b>Revision ke liye worked example.</b> Naya access switch ACC2 VLAN STAFF (30) serve karta hai aur CORE ki taraf uplink hai. Aap configure karte ho: user ports par edge + bpdu-block-on-edge; mac-limit 3 aur drop; storm-control 5 percent; STAFF par dhcp-security aur server group trusted; bindings verify karne ke baad DAI aur IPSG; uplink par CORE jaise hi CKN aur CAK ke saath MACsec. Upar ke commands se ek-ek karke verify karo.</p></div>

<div class="warn"><p><b>Yaad rakhne wali galtiyan.</b> Asli root ki taraf root protection; access-port DHCP server ko trust karna bhoolna; port ke peeche ke devices se kam MAC limit; ARP bhoolne wala filter; MACsec CAK ek hi end par badalna.</p></div>
<div class="exam"><p><b>Aakhri exam traps.</b> BPDU/root/loop protection ko mix mat karo; DAI aur IPSG ko snooping chahiye; MACsec hop by hop hai; filter terms first match hain aur implicit discard hai; <code>packet-action none</code> forwarding nahi rokta.</p></div>

<div class="scn"><h4>Audit jo pass hua</h4><p>Ek external auditor ne college IT team se poocha ki unka access layer rogue devices se kaise bachta hai. Team ne dikhaya: visitor switch BPDU protection se disable, flood tool MAC limit se roka hua, home router ke DHCP offers drop, aur live MKA peer wala encrypted uplink. Har demo ek command mein saabit hua. Auditor ne sirf baseline template maanga.</p><p><b>Lesson:</b> port role ke hisaab se documented baseline defence bhi hai aur saboot bhi.</p></div>
<div class="iv"><p class="q">"Access switch ka secure baseline do minute mein batao."</p><p>Untrusted user ports: edge, BPDU protection, drop ya shutdown ke saath MAC limit, storm control, trusted server ports ke saath DHCP snooping, user VLANs par DAI aur IP source guard, aur known bad MACs ke liye filter. Uplinks: loop protection, downstream partners ki taraf root protection, switches ke beech MACsec. Staged rollout aur <code>commit confirmed</code> ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port role ke hisaab se baseline: untrusted access, trusted uplink.</li>
<li>Jaano har feature kis par react karta hai aur kaise recover hota hai.</li>
<li>Pehle snooping; DAI aur IPSG usi par depend karte hain.</li>
<li>MACsec hop by hop hai; MKA peer list padho.</li>
<li>Values tune karo, protections kabhi mat hatao, aur counters se verify karo.</li>
</ul></div>
`}};export{e as default};