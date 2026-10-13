var e={id:`neighbor-discovery`,h:{en:`Neighbor Discovery: how IPv6 replaces ARP`,hi:`Neighbor Discovery: IPv6 ARP ki jagah kaise leta hai`},body:{en:`
<p>In an IPv4 office, finding a neighbour's MAC address is like shouting across the whole floor: "Who is 10.0.10.1?" Everybody stops work to listen, even though only one person has the answer. That shout is an <b>ARP broadcast</b>. IPv6 replaces the shout with a quiet phone call to a small group that contains the right person. The protocol that does this, and much more, is <b>Neighbor Discovery Protocol (NDP)</b>.</p>

<h3>What NDP does</h3>
<p>NDP is part of <b>ICMPv6</b> (IPv6 Next Header value 58). It uses five message types and handles jobs that IPv4 spreads over ARP, ICMP router discovery and ICMP redirects:</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Sent to</th><th>Job</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td>ff02::2 (all routers)</td><td>Host at boot: "Any routers here? Send me your details now."</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td>ff02::1 (all nodes) or the asking host</td><td>Router: "I am a router. Here are the prefix, prefix length, my link-local as your gateway, MTU, flags."</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>Solicited-node group of the target</td><td>"Who has this IPv6 address? Tell me your MAC." Also used for DAD.</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>The asking host (or all nodes)</td><td>"That address is mine, here is my MAC."</td></tr>
<tr><td>Redirect</td><td>137</td><td>The sending host</td><td>Router: "There is a better first hop for that destination."</td></tr>
</table>

<h3>Address resolution: NS and NA instead of ARP</h3>
<p>PC1 wants to send to its gateway. It knows the gateway's IPv6 address but needs the MAC to build the Ethernet frame.</p>
<ol>
<li>PC1 computes the target's <b>solicited-node multicast</b> address from the last 24 bits (for <code>fe80::5054:cff:fe04:4b01</code> that is <code>ff02::1:ff04:4b01</code>) and maps it to a multicast MAC (<code>33:33:ff:04:4b:01</code>).</li>
<li>It sends a <b>Neighbor Solicitation</b> to that group. Only devices whose addresses end in <code>04:4b01</code> have joined it, so normally only the router's network card passes the frame up.</li>
<li>The router answers with a <b>Neighbor Advertisement</b> containing its MAC.</li>
<li>Both sides store the result in the <b>neighbor cache</b>, the IPv6 equivalent of the ARP table.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NS and NA exchange">
<rect x="20" y="20" width="130" height="190" rx="10" fill="#e2e8f0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="14">PC1</text>
<rect x="490" y="20" width="130" height="190" rx="10" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="14">R1 G0/0</text>
<line x1="150" y1="80" x2="490" y2="80" stroke="#64748b"/><polygon points="490,80 478,74 478,86" fill="#64748b"/>
<text x="320" y="56" text-anchor="middle" class="svg-accent" font-size="12">NS to ff02::1:ff04:4b01</text><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">"who has fe80::5054:cff:fe04:4b01?"</text>
<line x1="490" y1="130" x2="150" y2="130" stroke="#64748b"/><polygon points="150,130 162,124 162,136" fill="#64748b"/>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">NA "it is me, MAC 5254.0c04.4b01"</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Both sides add the entry to the neighbor cache</text>
</svg><p class="cap">IPv6 address resolution uses a targeted multicast, not a broadcast.</p></div>

<h3>Router discovery: RS and RA</h3>
<p>A host does not need a configured default gateway. Routers send <b>RAs</b> every few minutes, and a booting host sends an <b>RS</b> to get one immediately. The RA is always sourced from the router's <b>link-local</b> address, and that is the address the host installs as its default gateway. The RA also carries the <b>prefix</b> for SLAAC and the <b>M and O flags</b> that tell hosts whether to use DHCPv6 (chapter 6). The <b>router lifetime</b> in the RA tells hosts how long to keep this router as a default gateway; a lifetime of 0 means "do not use me as a gateway".</p>

<h3>Duplicate Address Detection</h3>
<p>DAD reuses NS/NA. Before using a new address, the host sends an NS for that address with source <code>::</code>. If a Neighbor Advertisement comes back, somebody already owns it and the host marks it <b>duplicate</b>. On network devices you would see a log message such as <code>%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:10::1 on GigabitEthernet0/0</code> and <code>[DUP]</code> next to the address.</p>

<h3>Reading the neighbor cache</h3>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01         0 0050.7f06.6d01 REACH Gi0/0</span>
2001:DB8:ACAD:12::2                         0 5254.0f04.5001 REACH Gi0/1</pre>
<p>The state column comes from Neighbor Unreachability Detection. <b>REACH</b> (reachable) means recently confirmed; <b>STALE</b> means not confirmed recently but still usable; <b>DELAY</b> and <b>PROBE</b> mean the device is checking again; <b>INCMP</b> (incomplete) means an NS was sent and nothing answered, the IPv6 version of an ARP entry that never resolved.</p>
<p>On hosts: Windows <code>netsh interface ipv6 show neighbors</code>, Linux <code>ip -6 neigh</code>.</p>

<div class="eg"><p><b>Worked example.</b> A server at <code>2001:db8:acad:20::10</code> has solicited-node group <code>ff02::1:ff00:10</code> (last 24 bits <code>00:0010</code>) and the multicast MAC <code>33:33:ff:00:00:10</code>. Every IPv6 multicast MAC starts with <code>33:33</code> followed by the last 32 bits of the group address.</p></div>

<h3>Security: why RAs are dangerous</h3>
<p>Any device can send an RA. A misconfigured home router plugged into an office port, or an attacker, can advertise itself as the default gateway and a bogus prefix, pulling traffic through itself. Switches protect against this with <b>RA Guard</b> (drop RAs arriving on host ports), and DHCPv6 Guard does the same for rogue DHCPv6 servers. These first-hop security features are covered in the security module.</p>

<div class="warn"><p><b>Common mistakes.</b> Blocking all ICMPv6 at a firewall "because ping is dangerous": NS, NA, RS, RA and Packet Too Big are ICMPv6, and IPv6 simply stops working without them. Allow the ND types on the local link and Packet Too Big everywhere. Also, looking for an "ARP table" on an IPv6-only problem: check the neighbor cache.</p></div>

<div class="exam"><p><b>Exam traps.</b> ARP is replaced by <b>NS/NA</b>, not RS/RA. RS/RA are for finding routers and prefixes. ND runs over <b>ICMPv6</b>, not UDP. The default gateway learned from an RA is a <b>link-local</b> address. There is no broadcast; address resolution uses the <b>solicited-node multicast</b> group.</p></div>

<div class="scn"><h4>The rogue gateway in the meeting room</h4><p>Staff on the third floor suddenly lost IPv6 access to internal servers, while IPv4 worked. On an affected laptop the engineer found two IPv6 default gateways and an unexpected global prefix. On the access switch, the MAC of the second gateway was learned on a meeting-room port. A visitor had plugged in a small travel router that was sending Router Advertisements. The port was shut down, the laptops dropped the bogus prefix after its lifetime, and the team enabled RA Guard on all access ports.</p><p><b>Lesson:</b> any device can claim to be a router in IPv6. Protect host ports against rogue RAs.</p></div>

<div class="iv"><p class="q">"How does IPv6 find the MAC address of a neighbour without ARP?"</p><p>Strong answer: with Neighbor Discovery over ICMPv6. The host sends a Neighbor Solicitation (type 135) to the target's solicited-node multicast group, ff02::1:ff plus the last 24 bits, mapped to a 33:33 multicast MAC; the owner replies with a Neighbor Advertisement (type 136) containing its MAC, and both cache it. Add that RS/RA (133/134) handle router and prefix discovery, NS/NA also do DAD, and that ICMPv6 must not be blocked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP runs over ICMPv6: RS 133, RA 134, NS 135, NA 136, Redirect 137.</li>
<li>NS/NA replace ARP, using solicited-node multicast instead of broadcast.</li>
<li>RAs advertise the prefix, the flags and the router's link-local address as default gateway.</li>
<li>DAD uses NS from :: to make sure a new address is unique.</li>
<li>Never block ND messages; protect against rogue RAs with RA Guard.</li>
</ul></div>
`,hi:`
<p>IPv4 office mein padosi ka MAC address dhoondhna aisa hai jaise poore floor par chillana: "10.0.10.1 kaun hai?" Sab log kaam rok kar sunte hain, jabki jawab sirf ek ke paas hai. Yahi chillana <b>ARP broadcast</b> hai. IPv6 is chillane ki jagah ek chhote group ko shaant phone call karta hai jisme sahi insaan hai. Jo protocol yeh aur bahut kuch karta hai, woh hai <b>Neighbor Discovery Protocol (NDP)</b>.</p>

<h3>NDP kya karta hai</h3>
<p>NDP <b>ICMPv6</b> ka hissa hai (IPv6 Next Header value 58). Yeh paanch message types use karta hai aur woh kaam sambhalta hai jo IPv4 mein ARP, ICMP router discovery aur ICMP redirects mein bate hue the:</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Kise jata hai</th><th>Kaam</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td>ff02::2 (saare routers)</td><td>Boot par host: "Koi router hai? Abhi apni details bhejo."</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td>ff02::1 (saare nodes) ya poochne wala host</td><td>Router: "Main router hoon. Yeh raha prefix, prefix length, tumhare gateway ke liye mera link-local, MTU, flags."</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>Target ka solicited-node group</td><td>"Yeh IPv6 address kiska hai? Apna MAC batao." DAD mein bhi use hota hai.</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>Poochne wala host (ya saare nodes)</td><td>"Woh address mera hai, yeh raha mera MAC."</td></tr>
<tr><td>Redirect</td><td>137</td><td>Bhejne wala host</td><td>Router: "Us destination ke liye isse behtar first hop hai."</td></tr>
</table>

<h3>Address resolution: ARP ki jagah NS aur NA</h3>
<p>PC1 apne gateway ko bhejna chahta hai. Use gateway ka IPv6 address pata hai lekin Ethernet frame banane ke liye MAC chahiye.</p>
<ol>
<li>PC1 target ke aakhri 24 bits se uska <b>solicited-node multicast</b> address nikalta hai (<code>fe80::5054:cff:fe04:4b01</code> ke liye <code>ff02::1:ff04:4b01</code>) aur use multicast MAC (<code>33:33:ff:04:4b:01</code>) par map karta hai.</li>
<li>Woh us group ko <b>Neighbor Solicitation</b> bhejta hai. Sirf woh devices use join karte hain jinke addresses <code>04:4b01</code> par khatam hote hain, isliye aam taur par sirf router ka network card frame upar bhejta hai.</li>
<li>Router apne MAC ke saath <b>Neighbor Advertisement</b> se jawab deta hai.</li>
<li>Dono side result ko <b>neighbor cache</b> mein rakhte hain, jo ARP table ka IPv6 version hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NS aur NA exchange">
<rect x="20" y="20" width="130" height="190" rx="10" fill="#e2e8f0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="14">PC1</text>
<rect x="490" y="20" width="130" height="190" rx="10" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="14">R1 G0/0</text>
<line x1="150" y1="80" x2="490" y2="80" stroke="#64748b"/><polygon points="490,80 478,74 478,86" fill="#64748b"/>
<text x="320" y="56" text-anchor="middle" class="svg-accent" font-size="12">NS ff02::1:ff04:4b01 ko</text><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">"fe80::5054:cff:fe04:4b01 kiska hai?"</text>
<line x1="490" y1="130" x2="150" y2="130" stroke="#64748b"/><polygon points="150,130 162,124 162,136" fill="#64748b"/>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">NA "mera hai, MAC 5254.0c04.4b01"</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Dono side entry neighbor cache mein jodte hain</text>
</svg><p class="cap">IPv6 address resolution targeted multicast use karta hai, broadcast nahi.</p></div>

<h3>Router discovery: RS aur RA</h3>
<p>Host ko configured default gateway ki zaroorat nahi. Routers har kuch minute mein <b>RAs</b> bhejte hain, aur boot hota host turant ek paane ke liye <b>RS</b> bhejta hai. RA hamesha router ke <b>link-local</b> address se aata hai, aur host wahi address apne default gateway ke roop mein install karta hai. RA mein SLAAC ke liye <b>prefix</b> aur woh <b>M aur O flags</b> bhi hote hain jo hosts ko batate hain ki DHCPv6 use karna hai ya nahi (chapter 6). RA ka <b>router lifetime</b> hosts ko batata hai ki is router ko kitni der default gateway rakhna hai; lifetime 0 ka matlab hai "mujhe gateway mat banao".</p>

<h3>Duplicate Address Detection</h3>
<p>DAD NS/NA ko hi dobara use karta hai. Naya address use karne se pehle host us address ke liye source <code>::</code> se NS bhejta hai. Agar Neighbor Advertisement wapas aaye, to koi aur uska maalik hai aur host use <b>duplicate</b> mark karta hai. Network devices par aapko <code>%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:10::1 on GigabitEthernet0/0</code> jaisa log message aur address ke saath <code>[DUP]</code> dikhega.</p>

<h3>Neighbor cache padhna</h3>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01         0 0050.7f06.6d01 REACH Gi0/0</span>
2001:DB8:ACAD:12::2                         0 5254.0f04.5001 REACH Gi0/1</pre>
<p>State column Neighbor Unreachability Detection se aata hai. <b>REACH</b> (reachable) matlab haal hi mein confirm hua; <b>STALE</b> matlab haal mein confirm nahi hua par ab bhi use ho sakta hai; <b>DELAY</b> aur <b>PROBE</b> matlab device dobara check kar raha hai; <b>INCMP</b> (incomplete) matlab NS bheja gaya aur kisi ne jawab nahi diya, yeh us ARP entry ka IPv6 version hai jo kabhi resolve nahi hui.</p>
<p>Hosts par: Windows <code>netsh interface ipv6 show neighbors</code>, Linux <code>ip -6 neigh</code>.</p>

<div class="eg"><p><b>Worked example.</b> <code>2001:db8:acad:20::10</code> wale server ka solicited-node group <code>ff02::1:ff00:10</code> hai (aakhri 24 bits <code>00:0010</code>) aur multicast MAC <code>33:33:ff:00:00:10</code>. Har IPv6 multicast MAC <code>33:33</code> se shuru hota hai aur uske baad group address ke aakhri 32 bits aate hain.</p></div>

<h3>Security: RAs khatarnak kyun hain</h3>
<p>Koi bhi device RA bhej sakta hai. Office port mein laga galat configured home router, ya koi attacker, khud ko default gateway aur ek nakli prefix advertise karke traffic apne through kheench sakta hai. Switches isse <b>RA Guard</b> se bachate hain (host ports par aane wale RAs drop karna), aur DHCPv6 Guard rogue DHCPv6 servers ke liye yahi karta hai. Yeh first-hop security features security module mein cover hote hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Firewall par saara ICMPv6 block kar dena "kyunki ping khatarnak hai": NS, NA, RS, RA aur Packet Too Big sab ICMPv6 hain, aur unke bina IPv6 seedha kaam karna band kar deta hai. Local link par ND types aur har jagah Packet Too Big allow karo. Aur IPv6-only problem par "ARP table" dhoondhna: neighbor cache check karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> ARP ki jagah <b>NS/NA</b> leta hai, RS/RA nahi. RS/RA routers aur prefixes dhoondhne ke liye hain. ND <b>ICMPv6</b> par chalta hai, UDP par nahi. RA se seekha gaya default gateway <b>link-local</b> address hota hai. Broadcast nahi hai; address resolution <b>solicited-node multicast</b> group use karta hai.</p></div>

<div class="scn"><h4>Meeting room ka rogue gateway</h4><p>Teesre floor ke staff ka internal servers tak IPv6 access achanak chala gaya, jabki IPv4 chal raha tha. Affected laptop par engineer ko do IPv6 default gateways aur ek anjaana global prefix mila. Access switch par doosre gateway ka MAC ek meeting-room port par seekha gaya tha. Ek visitor ne chhota travel router laga diya tha jo Router Advertisements bhej raha tha. Port shut kiya gaya, laptops ne lifetime ke baad nakli prefix chhod diya, aur team ne saare access ports par RA Guard enable kiya.</p><p><b>Seekh:</b> IPv6 mein koi bhi device router hone ka daava kar sakta hai. Host ports ko rogue RAs se bachao.</p></div>

<div class="iv"><p class="q">"IPv6 bina ARP ke padosi ka MAC address kaise dhoondhta hai?"</p><p>Strong answer: ICMPv6 par Neighbor Discovery se. Host target ke solicited-node multicast group ko, yaani ff02::1:ff plus aakhri 24 bits, jo 33:33 multicast MAC par map hota hai, Neighbor Solicitation (type 135) bhejta hai; maalik apne MAC ke saath Neighbor Advertisement (type 136) se jawab deta hai, aur dono use cache karte hain. Jodo ki RS/RA (133/134) router aur prefix discovery sambhalte hain, NS/NA DAD bhi karte hain, aur ICMPv6 block nahi karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP ICMPv6 par chalta hai: RS 133, RA 134, NS 135, NA 136, Redirect 137.</li>
<li>NS/NA ARP ki jagah lete hain, broadcast ki jagah solicited-node multicast use karke.</li>
<li>RAs prefix, flags aur default gateway ke roop mein router ka link-local address advertise karte hain.</li>
<li>DAD :: se NS bhej kar pakka karta hai ki naya address unique hai.</li>
<li>ND messages kabhi block mat karo; rogue RAs se RA Guard se bachao.</li>
</ul></div>
`}};export{e as default};