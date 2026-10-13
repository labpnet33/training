var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking the three labs`,hi:`Troubleshooting workflow: teeno labs ke saath`},body:{en:`
<p>A good detective does not start by arresting people. He visits the victim, asks what changed, follows the evidence to a location, and only then acts, and afterwards checks that the problem is really gone. First-hop problems reward the same order, because the symptom (a user who cannot browse) is far away from the cause (a message on one switch port).</p>

<h3>The workflow</h3>
<ol>
<li><b>Host view.</b> What prefix, gateway, DNS does the host have? Which MAC is its router? (<code>show ipv6</code> on the lab PC; <code>ipconfig /all</code> or <code>ip -6 route</code> on real hosts.)</li>
<li><b>Locate the source.</b> Find that MAC in <code>show mac address-table</code>; follow it to the access port.</li>
<li><b>Policy view.</b> Which FHS policies are on that port and on the uplink? <code>show ipv6 snooping policies</code> / <code>show device-tracking policies</code>.</li>
<li><b>Evidence.</b> Drop counters (<code>show ipv6 snooping counters interface</code>), policy drop totals, <code>%SISF-4-PAK_DROP</code> and <code>%SISF-4-IP_THEFT</code> logs, and the binding table.</li>
<li><b>Fix</b> with the smallest change: attach the right role, correct the uplink role, add a static binding.</li>
<li><b>Refresh hosts</b> and <b>verify</b> end to end: correct prefix, correct gateway, ping works, drops only where expected.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Six-step workflow">
<g font-size="12">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="52" y="70" text-anchor="middle" class="svg-ink">1 Host view</text>
<rect x="112" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="159" y="70" text-anchor="middle" class="svg-ink">2 Find port</text>
<rect x="219" y="40" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="266" y="70" text-anchor="middle" class="svg-ink">3 Policies</text>
<rect x="326" y="40" width="95" height="50" rx="8" fill="#fde68a"/><text x="373" y="70" text-anchor="middle" class="svg-ink">4 Evidence</text>
<rect x="433" y="40" width="95" height="50" rx="8" fill="#fed7aa"/><text x="480" y="70" text-anchor="middle" class="svg-ink">5 Fix</text>
<rect x="540" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="587" y="70" text-anchor="middle" class="svg-ink">6 Refresh</text>
<line x1="100" y1="65" x2="112" y2="65" stroke="#64748b" stroke-width="2"/><line x1="207" y1="65" x2="219" y2="65" stroke="#64748b" stroke-width="2"/><line x1="314" y1="65" x2="326" y2="65" stroke="#64748b" stroke-width="2"/><line x1="421" y1="65" x2="433" y2="65" stroke="#64748b" stroke-width="2"/><line x1="528" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-muted">From the symptom on the host to the message on one port, and back</text>
</g></svg><p class="cap">The first-hop troubleshooting loop used in all three labs.</p></div>

<h3>Lab 1: RA guard stops a rogue router</h3>
<p><b>Ticket:</b> users on SW1 (VLAN 10) cannot reach anything outside the LAN.</p>
<pre class="out">PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : fe80::250:79ff:fe66:6801/64
<span class="hl">GLOBAL SCOPE      : 2001:db8:dead:10:250:79ff:fe66:6801/64 (SLAAC)</span>
<span class="hl">ROUTER LINK-LAYER : 52:54:00:ab:cd:03</span>
GATEWAY           : fe80::5054:ff:feab:cd03
MAC               : 00:50:79:66:68:01

SW1# show mac address-table
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6801    DYNAMIC     Gi0/1
  10    0050.7966.6802    DYNAMIC     Gi0/2
  10    5254.00ab.cd01    DYNAMIC     Gi0/0
<span class="hl">  10    5254.00ab.cd03    DYNAMIC     Gi0/3</span></pre>
<p>The prefix 2001:db8:dead:10::/64 is not R1's (2001:db8:a10::/64), and the router MAC lives on Gi0/3, an access port. Evidence complete: a rogue RA source on Gi0/3.</p>
<pre class="code">SW1(config)# ipv6 nd raguard policy HOST-EDGE
SW1(config-ra-guard)# device-role host
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 nd raguard attach-policy HOST-EDGE
SW2(config)# ipv6 nd raguard policy ROUTER-UPLINK
SW2(config-ra-guard)# device-role router
SW2(config)# interface g0/0
SW2(config-if)# ipv6 nd raguard attach-policy ROUTER-UPLINK
PC1&gt; ip auto
PC2&gt; ip auto</pre>
<p>Refresh matters: without <code>ip auto</code> the PCs keep the rogue prefix. Then verify: PC1 has an address in 2001:db8:a10::/64, its gateway is R1's link-local, <code>ping 2001:db8:a10::1</code> works, and <code>show ipv6 nd raguard policy HOST-EDGE</code> shows drops only on Gi0/3.</p>

<h3>Lab 2: DHCPv6 guard stops a rogue server</h3>
<p><b>Ticket:</b> PCs in VLAN 20 get addresses from 2001:db8:bad:20::/64 and DNS 2001:db8:bad:20::53.</p>
<pre class="out">PC1&gt; show ipv6
<span class="hl">GLOBAL SCOPE      : 2001:db8:bad:20::a1c3/64</span>

R1# show ipv6 dhcp pool
DHCPv6 pool: LAN-V6
  Address allocation prefix: 2001:DB8:A20::/64 valid 172800 preferred 86400 (0 in use, 0 conflicts)
<span class="hl">  Active clients: 0</span></pre>
<p>Zero active clients on R1 while PCs have leases means another server answered. Two problems: R1's pool lacks DNS and domain, and the rogue on Gi0/3 must be filtered.</p>
<pre class="code">R1(config)# ipv6 dhcp pool LAN-V6
R1(config-dhcpv6)# dns-server 2001:db8:a20::53
R1(config-dhcpv6)# domain-name nwkings.lab
SW1(config)# ipv6 dhcp guard policy DHCP-CLIENTS
SW1(config-dhcp-guard)# device-role client
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 dhcp guard attach-policy DHCP-CLIENTS
SW2(config)# ipv6 dhcp guard policy DHCP-SERVER
SW2(config-dhcp-guard)# device-role server
SW2(config)# interface g0/0
SW2(config-if)# ipv6 dhcp guard attach-policy DHCP-SERVER
PC1&gt; ip dhcp -6
PC2&gt; ip dhcp -6</pre>
<p>Verify: both PCs lease from R1 (<code>show ipv6 dhcp binding</code> lists them), DNS is 2001:db8:a20::53, PC1 pings 2001:db8:a20::1, and <code>show ipv6 dhcp guard policy DHCP-CLIENTS</code> counts drops on Gi0/3.</p>

<h3>Lab 3: binding table and IPv6 source guard</h3>
<p><b>Ticket:</b> PC3 (Gi0/3) was caught using PC2's address 2001:db8:a30::12. Prove the switch now blocks it.</p>
<pre class="code">SW1(config)# ipv6 snooping policy EDGE-SNOOP
SW1(config-ipv6-snooping)# security-level guard
SW1(config-ipv6-snooping)# tracking enable
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 snooping attach-policy EDGE-SNOOP
<span class="c">! ping the gateway from PC1, PC2, PC3, then check the table</span>
SW1# show ipv6 neighbors binding
SW1(config)# ipv6 source-guard policy EDGE-SG
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 source-guard attach-policy EDGE-SG</pre>
<p>Order is everything: snooping first, pings to fill the table (::11 on Gi0/1, ::12 on Gi0/2, ::13 on Gi0/3), then source guard. Now repeat the spoof: <code>ip 2001:db8:a30::12/64 2001:db8:a30::1</code> on PC3 and ping. Expect <code>%SISF-4-IP_THEFT</code>, source-guard drops on Gi0/3 in <code>show ipv6 snooping counters interface g0/3</code>, the ::12 binding still on Gi0/2, and PC2 still pinging. Finally set PC3 back to ::13; its binding on Gi0/3 is valid, so it reaches the gateway again.</p>

<h3>Quick symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Whole VLAN loses IPv6 gateway after change</td><td>Host role on uplink / router port</td><td>Policy drops on the uplink</td></tr>
<tr><td>Hosts still show rogue prefix after fix</td><td>Old host state</td><td>Re-solicit / renew on hosts</td></tr>
<tr><td>No leases after DHCPv6 guard</td><td>Client role on the server/relay side</td><td>DHCP guard drops on uplink</td></tr>
<tr><td>One host blocked after source guard</td><td>Not in binding table (silent)</td><td>Binding table, static binding</td></tr>
<tr><td>IP_THEFT for a host that moved</td><td>Old entry still alive / probe pending</td><td>Binding state, probe result</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> After lab 3, <code>show ipv6 snooping counters interface g0/3</code> shows <code>Drops by feature: ... Snooping[1] Source guard[5]</code>. One NS claiming ::12 was stopped by snooping; five data packets sourced from ::12 were stopped by source guard. Gi0/2's counters show zero drops: PC2 was never affected.</p></div>

<div class="warn"><p><b>Common mistake.</b> Declaring victory when the configuration looks right. FHS problems are proven by counters and host state. Always finish with the host view again and the drop counters on the exact port.</p></div>

<div class="exam"><p><b>Exam trap.</b> A troubleshooting item may show a correct RA guard policy with drops on the uplink. The answer is not "RA guard is broken"; it is "wrong role on the uplink".</p></div>

<div class="scn"><h4>The rogue that came back every Monday</h4><p>A school fixed a rogue RA on a lab port, but every Monday the problem returned on a different port. <code>show logging | include SISF</code> showed no drops because RA guard had been applied only to the one port found the first time. The engineer attached HOST-EDGE to every access port with a VLAN-level attach, kept a router policy on the uplink, and set up alerts for %SISF-4-PAK_DROP. The following Monday the log showed the drop on port 17, and nobody noticed an outage.</p><p><b>Lesson:</b> fix the class of problem, not just the port where you found it.</p></div>

<div class="iv"><p class="q">"Users say IPv6 Internet is broken but IPv4 works. Walk me through your troubleshooting."</p><p>Start at the host: check prefix, gateway and DNS, and note the router MAC. If the prefix or gateway is unexpected, find that MAC in the switch MAC table to locate the port. Check which FHS policies are on that port and the uplink, then read drop counters and SISF logs. Apply RA guard host role on edge ports and router role on the real router port, refresh the hosts, and verify gateway, reachability and drop counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: host view, locate port by MAC, policies, evidence, fix, refresh and verify.</li>
<li>Lab 1: ROUTER LINK-LAYER on the PC points to the rogue's port; RA guard host role fixes it.</li>
<li>Lab 2: zero active clients on the real server means someone else answered; DHCPv6 guard fixes it.</li>
<li>Lab 3: snooping, fill the table, then source guard; IP_THEFT and source-guard drops prove it.</li>
<li>Always refresh host state and read the per-port counters before closing the ticket.</li>
</ul></div>
`,hi:`
<p>Achha detective shuruaat logon ko giraftaar karke nahi karta. Woh victim se milta hai, puchhta hai kya badla, saboot ke peeche ek jagah tak jaata hai, aur tabhi action leta hai, aur baad mein check karta hai ki problem sach mein chali gayi. First-hop problems mein bhi yahi order kaam aata hai, kyunki symptom (user jo browse nahi kar pa raha) cause (ek switch port par ek message) se bahut door hota hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Host view.</b> Host ke paas kaunsa prefix, gateway, DNS hai? Uska router kaunsa MAC hai? (Lab PC par <code>show ipv6</code>; asli hosts par <code>ipconfig /all</code> ya <code>ip -6 route</code>.)</li>
<li><b>Source dhoondho.</b> Woh MAC <code>show mac address-table</code> mein dhoondho; uske peeche access port tak jao.</li>
<li><b>Policy view.</b> Us port aur uplink par kaunsi FHS policies hain? <code>show ipv6 snooping policies</code> / <code>show device-tracking policies</code>.</li>
<li><b>Saboot.</b> Drop counters (<code>show ipv6 snooping counters interface</code>), policy drop totals, <code>%SISF-4-PAK_DROP</code> aur <code>%SISF-4-IP_THEFT</code> logs, aur binding table.</li>
<li><b>Fix</b> sabse chhote change se: sahi role attach karo, uplink ka role theek karo, static binding jodo.</li>
<li><b>Hosts refresh karo</b> aur end to end <b>verify</b> karo: sahi prefix, sahi gateway, ping chalta hai, drops sirf wahin jahan expected.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Chhe step ka workflow">
<g font-size="12">
<rect x="5" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="52" y="70" text-anchor="middle" class="svg-ink">1 Host view</text>
<rect x="112" y="40" width="95" height="50" rx="8" fill="#bae6fd"/><text x="159" y="70" text-anchor="middle" class="svg-ink">2 Port dhoondho</text>
<rect x="219" y="40" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="266" y="70" text-anchor="middle" class="svg-ink">3 Policies</text>
<rect x="326" y="40" width="95" height="50" rx="8" fill="#fde68a"/><text x="373" y="70" text-anchor="middle" class="svg-ink">4 Saboot</text>
<rect x="433" y="40" width="95" height="50" rx="8" fill="#fed7aa"/><text x="480" y="70" text-anchor="middle" class="svg-ink">5 Fix</text>
<rect x="540" y="40" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="587" y="70" text-anchor="middle" class="svg-ink">6 Refresh</text>
<line x1="100" y1="65" x2="112" y2="65" stroke="#64748b" stroke-width="2"/><line x1="207" y1="65" x2="219" y2="65" stroke="#64748b" stroke-width="2"/><line x1="314" y1="65" x2="326" y2="65" stroke="#64748b" stroke-width="2"/><line x1="421" y1="65" x2="433" y2="65" stroke="#64748b" stroke-width="2"/><line x1="528" y1="65" x2="540" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-muted">Host ke symptom se ek port ke message tak, aur wapas</text>
</g></svg><p class="cap">Teeno labs mein use hone wala first-hop troubleshooting loop.</p></div>

<h3>Lab 1: RA guard se rogue router roko</h3>
<p><b>Ticket:</b> SW1 (VLAN 10) ke users LAN ke bahar kuch nahi pahunch pa rahe.</p>
<pre class="out">PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : fe80::250:79ff:fe66:6801/64
<span class="hl">GLOBAL SCOPE      : 2001:db8:dead:10:250:79ff:fe66:6801/64 (SLAAC)</span>
<span class="hl">ROUTER LINK-LAYER : 52:54:00:ab:cd:03</span>
GATEWAY           : fe80::5054:ff:feab:cd03
MAC               : 00:50:79:66:68:01

SW1# show mac address-table
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6801    DYNAMIC     Gi0/1
  10    0050.7966.6802    DYNAMIC     Gi0/2
  10    5254.00ab.cd01    DYNAMIC     Gi0/0
<span class="hl">  10    5254.00ab.cd03    DYNAMIC     Gi0/3</span></pre>
<p>Prefix 2001:db8:dead:10::/64 R1 ka (2001:db8:a10::/64) nahi hai, aur router MAC Gi0/3 par hai, jo access port hai. Saboot poora: Gi0/3 par rogue RA source.</p>
<pre class="code">SW1(config)# ipv6 nd raguard policy HOST-EDGE
SW1(config-ra-guard)# device-role host
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 nd raguard attach-policy HOST-EDGE
SW2(config)# ipv6 nd raguard policy ROUTER-UPLINK
SW2(config-ra-guard)# device-role router
SW2(config)# interface g0/0
SW2(config-if)# ipv6 nd raguard attach-policy ROUTER-UPLINK
PC1&gt; ip auto
PC2&gt; ip auto</pre>
<p>Refresh zaroori hai: <code>ip auto</code> ke bina PCs rogue prefix rakhte hain. Phir verify karo: PC1 ka address 2001:db8:a10::/64 mein hai, uska gateway R1 ka link-local hai, <code>ping 2001:db8:a10::1</code> chalta hai, aur <code>show ipv6 nd raguard policy HOST-EDGE</code> sirf Gi0/3 par drops dikhata hai.</p>

<h3>Lab 2: DHCPv6 guard se rogue server roko</h3>
<p><b>Ticket:</b> VLAN 20 ke PCs ko 2001:db8:bad:20::/64 se addresses aur DNS 2001:db8:bad:20::53 mil raha hai.</p>
<pre class="out">PC1&gt; show ipv6
<span class="hl">GLOBAL SCOPE      : 2001:db8:bad:20::a1c3/64</span>

R1# show ipv6 dhcp pool
DHCPv6 pool: LAN-V6
  Address allocation prefix: 2001:DB8:A20::/64 valid 172800 preferred 86400 (0 in use, 0 conflicts)
<span class="hl">  Active clients: 0</span></pre>
<p>R1 par zero active clients jabki PCs ke paas leases hain, matlab kisi aur server ne jawab diya. Do problems: R1 ke pool mein DNS aur domain nahi hai, aur Gi0/3 wale rogue ko filter karna hai.</p>
<pre class="code">R1(config)# ipv6 dhcp pool LAN-V6
R1(config-dhcpv6)# dns-server 2001:db8:a20::53
R1(config-dhcpv6)# domain-name nwkings.lab
SW1(config)# ipv6 dhcp guard policy DHCP-CLIENTS
SW1(config-dhcp-guard)# device-role client
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 dhcp guard attach-policy DHCP-CLIENTS
SW2(config)# ipv6 dhcp guard policy DHCP-SERVER
SW2(config-dhcp-guard)# device-role server
SW2(config)# interface g0/0
SW2(config-if)# ipv6 dhcp guard attach-policy DHCP-SERVER
PC1&gt; ip dhcp -6
PC2&gt; ip dhcp -6</pre>
<p>Verify: dono PCs R1 se lease lete hain (<code>show ipv6 dhcp binding</code> unhe list karta hai), DNS 2001:db8:a20::53 hai, PC1 2001:db8:a20::1 ping karta hai, aur <code>show ipv6 dhcp guard policy DHCP-CLIENTS</code> Gi0/3 par drops ginta hai.</p>

<h3>Lab 3: binding table aur IPv6 source guard</h3>
<p><b>Ticket:</b> PC3 (Gi0/3) ko PC2 ka address 2001:db8:a30::12 use karte pakda gaya. Prove karo ki switch ab ise block karta hai.</p>
<pre class="code">SW1(config)# ipv6 snooping policy EDGE-SNOOP
SW1(config-ipv6-snooping)# security-level guard
SW1(config-ipv6-snooping)# tracking enable
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 snooping attach-policy EDGE-SNOOP
<span class="c">! PC1, PC2, PC3 se gateway ping karo, phir table check karo</span>
SW1# show ipv6 neighbors binding
SW1(config)# ipv6 source-guard policy EDGE-SG
SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# ipv6 source-guard attach-policy EDGE-SG</pre>
<p>Order hi sab kuch hai: pehle snooping, table bharne ke liye pings (::11 Gi0/1 par, ::12 Gi0/2 par, ::13 Gi0/3 par), phir source guard. Ab spoof dohrao: PC3 par <code>ip 2001:db8:a30::12/64 2001:db8:a30::1</code> aur ping. Expect karo <code>%SISF-4-IP_THEFT</code>, <code>show ipv6 snooping counters interface g0/3</code> mein Gi0/3 par source-guard drops, ::12 binding abhi bhi Gi0/2 par, aur PC2 abhi bhi ping karta hua. Aakhir mein PC3 ko wapas ::13 par set karo; Gi0/3 par uski binding valid hai, isliye woh phir gateway tak pahunchta hai.</p>

<h3>Quick symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhav cause</th><th>Check</th></tr>
<tr><td>Change ke baad poora VLAN IPv6 gateway kho deta hai</td><td>Uplink / router port par host role</td><td>Uplink par policy drops</td></tr>
<tr><td>Fix ke baad bhi hosts rogue prefix dikhate hain</td><td>Host ki purani state</td><td>Hosts par re-solicit / renew</td></tr>
<tr><td>DHCPv6 guard ke baad leases nahi</td><td>Server/relay side par client role</td><td>Uplink par DHCP guard drops</td></tr>
<tr><td>Source guard ke baad ek host block</td><td>Binding table mein nahi (silent)</td><td>Binding table, static binding</td></tr>
<tr><td>Move hue host ke liye IP_THEFT</td><td>Purani entry zinda / probe pending</td><td>Binding state, probe result</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Lab 3 ke baad <code>show ipv6 snooping counters interface g0/3</code> <code>Drops by feature: ... Snooping[1] Source guard[5]</code> dikhata hai. ::12 claim karne wala ek NS snooping ne roka; ::12 se aaye paanch data packets source guard ne roke. Gi0/2 ke counters zero drops dikhate hain: PC2 par kabhi asar nahi hua.</p></div>

<div class="warn"><p><b>Common galti.</b> Configuration sahi dikhne par jeet ka elaan kar dena. FHS problems counters aur host state se prove hote hain. Hamesha dobara host view aur exact port ke drop counters se khatam karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting item mein sahi RA guard policy uplink par drops ke saath dikh sakti hai. Jawab "RA guard kharab hai" nahi; jawab hai "uplink par galat role".</p></div>

<div class="scn"><h4>Rogue jo har Monday wapas aata tha</h4><p>Ek school ne ek lab port par rogue RA fix kiya, par har Monday problem ek alag port par wapas aa jaati thi. <code>show logging | include SISF</code> mein koi drops nahi the kyunki RA guard sirf usi ek port par laga tha jo pehli baar mila tha. Engineer ne VLAN-level attach se HOST-EDGE har access port par lagaya, uplink par router policy rakhi, aur %SISF-4-PAK_DROP ke liye alerts set kiye. Agle Monday log ne port 17 par drop dikhaya, aur kisi ko outage mehsoos nahi hua.</p><p><b>Seekh:</b> problem ki poori class fix karo, sirf woh port nahi jahan mili.</p></div>

<div class="iv"><p class="q">"Users keh rahe hain IPv6 Internet toota hai par IPv4 chal raha hai. Apna troubleshooting batao."</p><p>Host se shuru karo: prefix, gateway aur DNS check karo, aur router MAC note karo. Agar prefix ya gateway unexpected hai, to port dhoondhne ke liye woh MAC switch MAC table mein dekho. Us port aur uplink par kaunsi FHS policies hain check karo, phir drop counters aur SISF logs padho. Edge ports par RA guard host role aur asli router port par router role lagao, hosts refresh karo, aur gateway, reachability aur drop counters verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: host view, MAC se port dhoondho, policies, saboot, fix, refresh aur verify.</li>
<li>Lab 1: PC par ROUTER LINK-LAYER rogue ke port ki taraf ishara karta hai; RA guard host role fix karta hai.</li>
<li>Lab 2: asli server par zero active clients matlab kisi aur ne jawab diya; DHCPv6 guard fix karta hai.</li>
<li>Lab 3: snooping, table bharo, phir source guard; IP_THEFT aur source-guard drops saboot hain.</li>
<li>Ticket band karne se pehle hamesha host state refresh karo aur per-port counters padho.</li>
</ul></div>
`}};export{e as default};