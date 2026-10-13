var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together. Use it the week before the exam and again after the two labs. If you can do each item without looking, you are ready for the Junos OS module.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Count collision and broadcast domains for any hub, switch, VLAN and router design.</li>
<li>Describe the Ethernet frame, the MAC table and how ARP resolves a next hop.</li>
<li>Convert between decimal and binary for an octet and read a prefix as a mask.</li>
<li>Find network, first usable, last usable and broadcast for any IPv4 subnet using the block size.</li>
<li>Plan VLSM for a given set of host counts, largest first.</li>
<li>Summarise contiguous networks into one prefix.</li>
<li>Shorten and expand IPv6 addresses and identify the address types.</li>
<li>Configure family inet and inet6 on a unit, build an IRB gateway, and add static and default routes.</li>
<li>Apply longest-prefix match to predict the next hop, and prove it with show route.</li>
<li>Compare TCP and UDP, name the common ports and list the four stages of CoS.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module flow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="12">Domains</text>
<rect x="135" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="190" y="48" text-anchor="middle" class="svg-ink" font-size="12">Ethernet, ARP</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="12">IPv4, binary</text>
<rect x="385" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="48" text-anchor="middle" class="svg-ink" font-size="12">VLSM</text>
<rect x="510" y="20" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="48" text-anchor="middle" class="svg-ink" font-size="12">Summaries</text>
<rect x="135" y="100" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="190" y="128" text-anchor="middle" class="svg-ink" font-size="12">IPv6</text>
<rect x="260" y="100" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="128" text-anchor="middle" class="svg-ink" font-size="12">Longest match</text>
<rect x="385" y="100" width="110" height="46" rx="8" fill="#fed7aa"/><text x="440" y="128" text-anchor="middle" class="svg-ink" font-size="12">TCP, UDP, CoS</text>
</svg><p class="cap">The module in one picture: from broadcast domains up to how a router chooses a route.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Collision domain</dt><dd>Devices sharing a half-duplex medium; one per switch port.</dd>
<dt>Broadcast domain</dt><dd>Devices that receive each other's broadcasts; one per VLAN or router interface.</dd>
<dt>ARP</dt><dd>Maps a next-hop IPv4 address to a MAC address.</dd>
<dt>Prefix length</dt><dd>Number of network bits in an address.</dd>
<dt>VLSM</dt><dd>Subnets of different sizes from one block.</dd>
<dt>Summary route</dt><dd>One shorter prefix covering many contiguous networks.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging interface: a VLAN gateway on an EX switch.</dd>
<dt>Link-local</dt><dd>IPv6 address fe80::/10, valid on one link.</dd>
<dt>Longest prefix match</dt><dd>The most specific matching route is used.</dd>
<dt>Preference</dt><dd>Junos route trust value; lower wins between identical prefixes.</dd>
<dt>Forwarding class</dt><dd>CoS label that selects an output queue.</dd></dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Domains</td><td>Switch: collision per port, broadcast per VLAN. Router: broadcast per interface.</td></tr>
<tr><td>Hosts per prefix</td><td>/24 254, /25 126, /26 62, /27 30, /28 14, /29 6, /30 2</td></tr>
<tr><td>Block size</td><td>256 minus mask octet (/26 gives 64)</td></tr>
<tr><td>Private IPv4</td><td>10/8, 172.16/12, 192.168/16</td></tr>
<tr><td>IPv6 types</td><td>2000::/3 global, fc00::/7 ULA, fe80::/10 link-local, ff00::/8 multicast</td></tr>
<tr><td>:: rule</td><td>Used once per address</td></tr>
<tr><td>Route choice</td><td>Longest prefix first, then preference (Static 5, OSPF 10, RIP 100, BGP 170)</td></tr>
<tr><td>Routes per interface</td><td>One Direct subnet route and one Local /32</td></tr>
<tr><td>CoS order</td><td>Classify, police, schedule, rewrite</td></tr>
<tr><td>Default queues</td><td>best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.193/30
set interfaces irb unit 10 family inet address 10.50.0.1/25
set vlans SALES l3-interface irb.10
set interfaces ge-0/0/1 unit 0 family inet6 address 2001:db8:50:10::1/64
set routing-options static route 0.0.0.0/0 next-hop 10.50.0.194
set routing-options static route 10.50.0.0/24 next-hop 10.50.0.193
show route 172.20.9.10
show route 172.20.0.0/16 orlonger
show arp no-resolve
show ethernet-switching table</pre>

<h3>The two labs at a glance</h3>
<table class="cmp"><tr><th>Lab</th><th>Key facts</th></tr>
<tr><td>Address the Nashik office</td><td>/25 Sales, /26 Eng, /30 uplink; gateways .1 and .129; SW1 .193, R1 .194; default on SW1; summary 10.50.0.0/24 on R1; broadcast of Eng is 10.50.0.191; R1 uses /30 for 10.50.0.193.</td></tr>
<tr><td>Longest match wins</td><td>Stale 172.20.9.0/24 via R4 overrides the /16 via R3; payroll used 10.0.14.2; delete the /24; verify with show route and ping.</td></tr></table>

<div class="warn"><p><b>Most common mistakes.</b> Counting network and broadcast as usable; using :: twice; choosing a route by preference instead of prefix length; forgetting the return route.</p></div>

<div class="exam"><p><b>Exam trap.</b> Preference never beats prefix length. A switch has one collision domain per port, not one broadcast domain per port.</p></div>

<div class="scn"><h4>Putting it all together</h4><p>A new branch needed addressing for 60, 28 and 10 hosts and two router links. The engineer chose /26, /27, /28 and two /30s from one /24, summarised them in one static route toward headquarters, added IPv6 /64 per VLAN, and confirmed with show route that the branch summary was used and not shadowed by an old specific route. The whole design went live in one commit confirmed window.</p><p><b>Lesson:</b> addressing, summarisation, and longest-match verification are one skill.</p></div>

<div class="iv"><p class="q">"Design the addressing for a branch with 60, 28 and 10 hosts."</p><p>60 hosts needs 6 bits: /26 (62). 28 hosts needs 5 bits: /27 (30). 10 hosts needs 4 bits: /28 (14). Allocate largest first from a /24 on block boundaries (.0, .64, .96), use /30 for links, leave room to grow, summarise toward the core, and verify with show route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domains, framing and ARP explain how a local hop works.</li>
<li>Binary and block size make subnetting and summarisation mechanical.</li>
<li>IPv6: 128 bits, /64 LANs, no broadcast, family inet6 on Junos.</li>
<li>Longest prefix match, then preference, picks the route; always verify with show route.</li>
<li>Next: the Junos OS module on how the Routing Engine and Packet Forwarding Engine use these tables.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek saath jodta hai. Ise exam se ek hafte pehle aur dono labs ke baad use karo. Agar aap har item bina dekhe kar sakte ho, to Junos OS module ke liye taiyar ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Kisi bhi hub, switch, VLAN aur router design ke liye collision aur broadcast domains gino.</li>
<li>Ethernet frame, MAC table aur ARP next hop kaise resolve karta hai, describe karo.</li>
<li>Ek octet ke liye decimal aur binary ke beech convert karo aur prefix ko mask ki tarah padho.</li>
<li>Block size se kisi bhi IPv4 subnet ka network, first usable, last usable aur broadcast nikaalo.</li>
<li>Diye gaye host counts ke liye VLSM plan karo, sabse bada pehle.</li>
<li>Contiguous networks ko ek prefix mein summarise karo.</li>
<li>IPv6 addresses chhote aur poore likho aur address types pehchano.</li>
<li>Unit par family inet aur inet6 configure karo, IRB gateway banao, aur static aur default routes jodo.</li>
<li>Longest-prefix match se next hop predict karo, aur show route se saabit karo.</li>
<li>TCP aur UDP compare karo, common ports batao aur CoS ke chaar stages ginao.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module flow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="12">Domains</text>
<rect x="135" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="190" y="48" text-anchor="middle" class="svg-ink" font-size="12">Ethernet, ARP</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="12">IPv4, binary</text>
<rect x="385" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="48" text-anchor="middle" class="svg-ink" font-size="12">VLSM</text>
<rect x="510" y="20" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="48" text-anchor="middle" class="svg-ink" font-size="12">Summaries</text>
<rect x="135" y="100" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="190" y="128" text-anchor="middle" class="svg-ink" font-size="12">IPv6</text>
<rect x="260" y="100" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="128" text-anchor="middle" class="svg-ink" font-size="12">Longest match</text>
<rect x="385" y="100" width="110" height="46" rx="8" fill="#fed7aa"/><text x="440" y="128" text-anchor="middle" class="svg-ink" font-size="12">TCP, UDP, CoS</text>
</svg><p class="cap">Module ek tasveer mein: broadcast domains se lekar router route kaise chunta hai tak.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Collision domain</dt><dd>Half-duplex medium share karne wale devices; har switch port ka ek.</dd>
<dt>Broadcast domain</dt><dd>Devices jo ek-dusre ke broadcasts receive karte hain; har VLAN ya router interface ka ek.</dd>
<dt>ARP</dt><dd>Next-hop IPv4 address ko MAC address se jodta hai.</dd>
<dt>Prefix length</dt><dd>Address mein network bits ki ginti.</dd>
<dt>VLSM</dt><dd>Ek block se alag-alag size ke subnets.</dd>
<dt>Summary route</dt><dd>Ek chhota prefix jo kai contiguous networks cover karta hai.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging interface: EX switch par VLAN gateway.</dd>
<dt>Link-local</dt><dd>IPv6 address fe80::/10, ek link par valid.</dd>
<dt>Longest prefix match</dt><dd>Sabse specific matching route use hota hai.</dd>
<dt>Preference</dt><dd>Junos route trust value; identical prefixes ke beech kam jeetta hai.</dd>
<dt>Forwarding class</dt><dd>CoS label jo output queue chunta hai.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Domains</td><td>Switch: collision har port ka, broadcast har VLAN ka. Router: broadcast har interface ka.</td></tr>
<tr><td>Hosts per prefix</td><td>/24 254, /25 126, /26 62, /27 30, /28 14, /29 6, /30 2</td></tr>
<tr><td>Block size</td><td>256 minus mask octet (/26 par 64)</td></tr>
<tr><td>Private IPv4</td><td>10/8, 172.16/12, 192.168/16</td></tr>
<tr><td>IPv6 types</td><td>2000::/3 global, fc00::/7 ULA, fe80::/10 link-local, ff00::/8 multicast</td></tr>
<tr><td>:: rule</td><td>Ek address mein ek baar</td></tr>
<tr><td>Route choice</td><td>Pehle longest prefix, phir preference (Static 5, OSPF 10, RIP 100, BGP 170)</td></tr>
<tr><td>Routes per interface</td><td>Ek Direct subnet route aur ek Local /32</td></tr>
<tr><td>CoS order</td><td>Classify, police, schedule, rewrite</td></tr>
<tr><td>Default queues</td><td>best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.193/30
set interfaces irb unit 10 family inet address 10.50.0.1/25
set vlans SALES l3-interface irb.10
set interfaces ge-0/0/1 unit 0 family inet6 address 2001:db8:50:10::1/64
set routing-options static route 0.0.0.0/0 next-hop 10.50.0.194
set routing-options static route 10.50.0.0/24 next-hop 10.50.0.193
show route 172.20.9.10
show route 172.20.0.0/16 orlonger
show arp no-resolve
show ethernet-switching table</pre>

<h3>Dono labs ek nazar mein</h3>
<table class="cmp"><tr><th>Lab</th><th>Key facts</th></tr>
<tr><td>Address the Nashik office</td><td>/25 Sales, /26 Eng, /30 uplink; gateways .1 aur .129; SW1 .193, R1 .194; SW1 par default; R1 par summary 10.50.0.0/24; Eng ka broadcast 10.50.0.191; R1 10.50.0.193 ke liye /30 use karta hai.</td></tr>
<tr><td>Longest match wins</td><td>R4 wala stale 172.20.9.0/24, R3 wale /16 ko override karta hai; payroll 10.0.14.2 use karta tha; /24 delete karo; show route aur ping se verify.</td></tr></table>

<div class="warn"><p><b>Sabse common galtiyan.</b> Network aur broadcast ko usable ginna; :: do baar use karna; route ko prefix length ki jagah preference se chunna; return route bhoolna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Preference kabhi prefix length ko nahi harati. Switch mein har port ka ek collision domain hota hai, har port ka ek broadcast domain nahi.</p></div>

<div class="scn"><h4>Sab kuch saath mein</h4><p>Ek naye branch ko 60, 28 aur 10 hosts aur do router links ke liye addressing chahiye thi. Engineer ne ek /24 se /26, /27, /28 aur do /30 chune, headquarters ki taraf ek static route mein summarise kiya, har VLAN ke liye IPv6 /64 jodi, aur show route se confirm kiya ki branch summary use ho rahi hai aur kisi purane specific route se dab nahi rahi. Poora design ek commit confirmed window mein live ho gaya.</p><p><b>Lesson:</b> addressing, summarisation aur longest-match verification ek hi skill hain.</p></div>

<div class="iv"><p class="q">"60, 28 aur 10 hosts wale branch ki addressing design karo."</p><p>60 hosts ko 6 bits chahiye: /26 (62). 28 hosts ko 5 bits: /27 (30). 10 hosts ko 4 bits: /28 (14). Ek /24 se sabse bada pehle, block boundaries par (.0, .64, .96) allocate karo, links ke liye /30, growth ke liye jagah chhodo, core ki taraf summarise karo, aur show route se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domains, framing aur ARP samjhate hain ki local hop kaise kaam karta hai.</li>
<li>Binary aur block size subnetting aur summarisation ko mechanical bana dete hain.</li>
<li>IPv6: 128 bits, /64 LANs, broadcast nahi, Junos par family inet6.</li>
<li>Longest prefix match, phir preference, route chunte hain; hamesha show route se verify karo.</li>
<li>Aage: Junos OS module jahan Routing Engine aur Packet Forwarding Engine in tables ko use karte hain.</li>
</ul></div>
`}};export{e as default};