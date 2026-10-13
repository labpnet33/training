var e={id:`underlay-overlay`,h:{en:`Underlay and overlay: two networks, one packet`,hi:`Underlay aur overlay: do networks, ek packet`},body:{en:`
<p>This is the most important idea in the whole module. Every Versa lab, every ticket and every interview question comes back to it: <b>there are two networks, and the second one depends on the first.</b></p>

<h3>Analogy: a letter inside a letter</h3>
<p>You want to send a confidential letter from Delhi to Kolkata, but you only trust the public post for delivery, not for privacy. So you put your confidential letter inside a locked box, then put the box in an ordinary parcel addressed to the Kolkata post office box number of your own branch. The postal service sees only the outer address and delivers the parcel. In Kolkata your colleague opens the parcel, unlocks the box and reads the letter addressed to the real recipient.</p>
<p>The outer parcel is the <b>underlay</b>. The locked box with the inner letter is the <b>overlay</b>. The postal service does not know or care what is inside.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay and overlay">
<rect x="10" y="10" width="620" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">OVERLAY: Branch1 LAN 10.1.1.0/24  to  Branch3 LAN 10.1.3.0/24</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">IPsec tunnels, MP-BGP routes, site-ids, policy (Versa Controller)</text>
<rect x="10" y="85" width="620" height="60" rx="8" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">UNDERLAY: 203.0.113.6 (branch)  to  198.51.100.20 (Controller)</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Interfaces, IP addresses, default routes, carrier circuits</text>
<rect x="10" y="160" width="620" height="80" rx="8" fill="#e2e8f0"/>
<rect x="40" y="180" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch1 VOS</text>
<ellipse cx="320" cy="198" rx="90" ry="26" fill="#fed7aa"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Carrier Internet</text>
<rect x="500" y="180" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="203" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<line x1="130" y1="198" x2="230" y2="198" stroke="#64748b"/><line x1="410" y1="198" x2="500" y2="198" stroke="#64748b"/>
</svg><p class="cap">The physical path is the bottom row. The underlay addresses ride on it; the overlay rides on the underlay.</p></div>

<h3>Definitions</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The ordinary IP network that delivers packets between the WAN interface addresses of VOS devices: carrier circuits, interface IP addresses and routes. It knows nothing about tenants, sites or applications.</dd>
<dt>Overlay</dt><dd>The logical SD-WAN network built on top: IPsec tunnels between sites, plus the routing information (MP-BGP in Versa) that says which LAN prefix lives behind which site.</dd>
<dt>WAN interface</dt><dd>The branch port facing a transport. In this course vni-0/0 is Internet, vni-0/1 is MPLS and vni-0/2 is LTE. <code>vni</code> stands for VOS network interface; the real product also uses names like vni-0/0.</dd>
<dt>LAN interface</dt><dd>The branch port facing local users. In the course lab vni-0/3 with 10.1.k.0/24, gateway .1.</dd>
<dt>Transport (transport domain)</dt><dd>A label for a class of circuit: Internet, MPLS, LTE. Controllers group branches that can reach each other over the same transport domain.</dd>
<dt>Control, data and management planes</dt><dd>Management configures devices, control exchanges routes and keys, data carries user packets. Overlay and underlay are about the data path; the planes are about who does what.</dd>
</dl>

<h3>What the packet looks like</h3>
<p>PC1 in Delhi (10.1.1.10) sends a packet to PC3 in Kolkata (10.1.3.10). The Delhi branch looks up the destination, finds that 10.1.3.0/24 was learned over the overlay from site 103, and encapsulates the original packet inside an IPsec packet. The <b>outer</b> IP header has source 203.0.113.6 (Delhi WAN) and destination the remote WAN address. The underlay routers in the carrier network look only at the outer header. At the far end VOS removes the outer header and delivers the original packet.</p>

<table class="cmp"><tr><th></th><th>Underlay</th><th>Overlay</th></tr>
<tr><td>Owner</td><td>Carriers and your interface config</td><td>The SD-WAN solution (Versa)</td></tr>
<tr><td>Addresses used</td><td>WAN interface addresses, e.g. 203.0.113.6</td><td>LAN prefixes, e.g. 10.1.1.0/24</td></tr>
<tr><td>Routing</td><td>Static default route or carrier routing</td><td>MP-BGP between VOS and Controller</td></tr>
<tr><td>Failure looks like</td><td>Ping to the Controller fails</td><td>Ping works but the session is Idle</td></tr>
<tr><td>Proof command</td><td>ping, show route, show interfaces brief</td><td>show orgs org Acme sd-wan brief, show bgp neighbor brief</td></tr>
</table>

<h3>Why separating them makes you faster</h3>
<p>The strongest troubleshooting habit in SD-WAN is asking <b>which layer is broken</b> before touching anything. If the branch cannot ping the Controller, nothing in the overlay can work, so you fix the underlay. If the ping works and the overlay is down, the underlay is exonerated and you look at identity, tunnels and BGP. This halves the search space with a single ping.</p>

<div class="eg"><p><b>Worked example.</b> Delhi shows the overlay Idle. You run <code>ping 198.51.100.20</code> and get four replies. Conclusion: the carrier circuit, the WAN address and the default route are fine. You now only check site-id, organization, Controller address and transport mapping. In the other case, ping shows <code>Destination Host Unreachable</code>; you check the interface state and default route first and never open the SD-WAN configuration.</p></div>

<pre class="out">admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
<span class="hl">64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms</span>
64 bytes from 198.51.100.20: icmp_seq=2 ttl=63 time=1.6 ms
64 bytes from 198.51.100.20: icmp_seq=3 ttl=63 time=1.7 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=63 time=1.8 ms
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Using LAN addresses to test the underlay: the underlay uses WAN addresses. (2) Assuming a green "up" interface means the circuit works: link up only proves the cable and the carrier port, not that the carrier routes your traffic. (3) Forgetting that MTU is smaller on the overlay because the IPsec header costs bytes.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The overlay is down, so the carrier is at fault" is the wrong reflex. The overlay can be down while the underlay is perfect (wrong site-id, wrong Controller address). The reverse never holds: an overlay cannot be up over a dead underlay.</p></div>

<div class="scn"><h4>Green icons, dead branch</h4><p>A new Pune branch showed link up on its Internet port and the field technician reported success. The NOC saw no overlay. Ping to the Controller failed with Destination Host Unreachable. The branch had an address but no default route in the Internet transport router, so replies and requests had nowhere to go. One static route fixed it, and the overlay came up on its own within a minute.</p><p><b>Lesson:</b> link up, address and route are three different facts. Prove reachability with ping before anything else.</p></div>

<div class="iv"><p class="q">"How do you tell an underlay problem from an overlay problem?"</p><p>Strong answer: ping the Controller (or the remote WAN address) from the branch WAN transport. If it fails, it is the underlay: interface, address, default route or carrier. If it succeeds but the overlay session is down, inspect identity (organization, site-id, Controller address), WAN-to-transport mapping, then tunnels and BGP. Mention that you collect evidence at each layer before changing anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay is plain IP between WAN interface addresses; overlay is the tunnelled, routed SD-WAN network on top.</li>
<li>Overlay always depends on the underlay; the reverse is false.</li>
<li>Overlay packets are encapsulated, so the outer header carries WAN addresses.</li>
<li>One ping to the Controller splits "underlay" from "overlay" problems.</li>
<li>Link up, IP address and default route are separate proofs.</li>
</ul></div>
`,hi:`
<p>Yeh poore module ka sabse important idea hai. Har Versa lab, har ticket aur har interview question isi par wapas aata hai: <b>do networks hain, aur doosra pehle par depend karta hai.</b></p>

<h3>Analogy: letter ke andar letter</h3>
<p>Aap Delhi se Kolkata ek confidential letter bhejna chahte ho, lekin aap public post par delivery ke liye bharosa karte ho, privacy ke liye nahi. To aap confidential letter ko ek locked box mein rakhte ho, phir box ko ek ordinary parcel mein rakhte ho jis par aapki apni Kolkata branch ke post office box ka address likha hai. Postal service sirf bahar ka address dekhti hai aur parcel deliver kar deti hai. Kolkata mein aapka colleague parcel kholta hai, box unlock karta hai aur asli recipient ke naam wala letter padhta hai.</p>
<p>Bahar ka parcel <b>underlay</b> hai. Andar ke letter wala locked box <b>overlay</b> hai. Postal service ko andar kya hai, na pata hota hai na parwah.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay aur overlay">
<rect x="10" y="10" width="620" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">OVERLAY: Branch1 LAN 10.1.1.0/24  se  Branch3 LAN 10.1.3.0/24</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">IPsec tunnels, MP-BGP routes, site-ids, policy (Versa Controller)</text>
<rect x="10" y="85" width="620" height="60" rx="8" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">UNDERLAY: 203.0.113.6 (branch)  se  198.51.100.20 (Controller)</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Interfaces, IP addresses, default routes, carrier circuits</text>
<rect x="10" y="160" width="620" height="80" rx="8" fill="#e2e8f0"/>
<rect x="40" y="180" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch1 VOS</text>
<ellipse cx="320" cy="198" rx="90" ry="26" fill="#fed7aa"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Carrier Internet</text>
<rect x="500" y="180" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="203" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<line x1="130" y1="198" x2="230" y2="198" stroke="#64748b"/><line x1="410" y1="198" x2="500" y2="198" stroke="#64748b"/>
</svg><p class="cap">Physical path neeche wali row hai. Underlay addresses uspar chalte hain; overlay underlay par chalta hai.</p></div>

<h3>Definitions</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Ordinary IP network jo VOS devices ke WAN interface addresses ke beech packets deliver karta hai: carrier circuits, interface IP addresses aur routes. Ise tenants, sites ya applications ke baare mein kuch nahi pata.</dd>
<dt>Overlay</dt><dd>Upar bana logical SD-WAN network: sites ke beech IPsec tunnels, plus routing information (Versa mein MP-BGP) jo batati hai ki kaunsa LAN prefix kis site ke peeche hai.</dd>
<dt>WAN interface</dt><dd>Branch ka port jo transport ki taraf dekhta hai. Is course mein vni-0/0 Internet hai, vni-0/1 MPLS hai aur vni-0/2 LTE hai. <code>vni</code> ka matlab VOS network interface; real product mein bhi vni-0/0 jaise names hote hain.</dd>
<dt>LAN interface</dt><dd>Branch ka port jo local users ki taraf dekhta hai. Course lab mein vni-0/3 with 10.1.k.0/24, gateway .1.</dd>
<dt>Transport (transport domain)</dt><dd>Circuit ki class ka label: Internet, MPLS, LTE. Controller un branches ko group karta hai jo same transport domain par ek dusre tak pahunch sakti hain.</dd>
<dt>Control, data aur management planes</dt><dd>Management devices configure karta hai, control routes aur keys exchange karta hai, data user packets le jaata hai. Overlay aur underlay data path ke baare mein hain; planes yeh batate hain ki kaun kya karta hai.</dd>
</dl>

<h3>Packet kaisa dikhta hai</h3>
<p>Delhi ka PC1 (10.1.1.10) Kolkata ke PC3 (10.1.3.10) ko packet bhejta hai. Delhi branch destination lookup karti hai, dekhti hai ki 10.1.3.0/24 site 103 se overlay par learn hua hai, aur original packet ko ek IPsec packet ke andar encapsulate karti hai. <b>Outer</b> IP header ka source 203.0.113.6 (Delhi WAN) aur destination remote WAN address hota hai. Carrier network ke underlay routers sirf outer header dekhte hain. Door ke end par VOS outer header hata deta hai aur original packet deliver karta hai.</p>

<table class="cmp"><tr><th></th><th>Underlay</th><th>Overlay</th></tr>
<tr><td>Owner</td><td>Carriers aur aapki interface config</td><td>SD-WAN solution (Versa)</td></tr>
<tr><td>Addresses</td><td>WAN interface addresses, jaise 203.0.113.6</td><td>LAN prefixes, jaise 10.1.1.0/24</td></tr>
<tr><td>Routing</td><td>Static default route ya carrier routing</td><td>VOS aur Controller ke beech MP-BGP</td></tr>
<tr><td>Failure aisa dikhta hai</td><td>Controller ko ping fail</td><td>Ping chalta hai lekin session Idle</td></tr>
<tr><td>Proof command</td><td>ping, show route, show interfaces brief</td><td>show orgs org Acme sd-wan brief, show bgp neighbor brief</td></tr>
</table>

<h3>Alag karne se aap tez kyun hote ho</h3>
<p>SD-WAN troubleshooting ki sabse strong aadat hai kuch bhi chhune se pehle poochna ki <b>kaunsi layer toot gayi hai</b>. Agar branch Controller ko ping nahi kar sakti, to overlay mein kuch kaam nahi kar sakta, isliye underlay fix karte ho. Agar ping chalta hai aur overlay down hai, to underlay clear ho gaya aur aap identity, tunnels aur BGP dekhte ho. Ek ping se search space aadha ho jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Delhi overlay Idle dikhata hai. Aap <code>ping 198.51.100.20</code> chalate ho aur chaar replies aate hain. Conclusion: carrier circuit, WAN address aur default route theek hain. Ab sirf site-id, organization, Controller address aur transport mapping check karte ho. Doosre case mein ping <code>Destination Host Unreachable</code> dikhata hai; aap pehle interface state aur default route check karte ho aur SD-WAN configuration kholte hi nahi.</p></div>

<pre class="out">admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
<span class="hl">64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms</span>
64 bytes from 198.51.100.20: icmp_seq=2 ttl=63 time=1.6 ms
64 bytes from 198.51.100.20: icmp_seq=3 ttl=63 time=1.7 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=63 time=1.8 ms
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Underlay test karne ke liye LAN addresses use karna: underlay WAN addresses use karta hai. (2) Maan lena ki green "up" interface ka matlab circuit chal raha hai: link up sirf cable aur carrier port prove karta hai, yeh nahi ki carrier aapka traffic route karta hai. (3) Bhool jaana ki overlay par MTU chhota hota hai kyunki IPsec header bytes khata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Overlay down hai, isliye carrier ki galti hai" galat reflex hai. Overlay down ho sakta hai jabki underlay perfect hai (galat site-id, galat Controller address). Ulta kabhi sach nahi: dead underlay par overlay up nahi ho sakta.</p></div>

<div class="scn"><h4>Green icons, dead branch</h4><p>Pune ki ek nayi branch ke Internet port par link up dikha aur field technician ne success report kiya. NOC ko koi overlay nahi dikha. Controller ko ping Destination Host Unreachable ke saath fail hua. Branch ke paas address tha lekin Internet transport router mein default route nahi thi, isliye requests aur replies ke paas jaane ki jagah nahi thi. Ek static route ne fix kar diya, aur overlay ek minute ke andar apne aap up aa gaya.</p><p><b>Seekh:</b> link up, address aur route teen alag facts hain. Kuch aur karne se pehle ping se reachability prove karo.</p></div>

<div class="iv"><p class="q">"Underlay problem aur overlay problem mein farak kaise karte ho?"</p><p>Strong answer: branch se Controller (ya remote WAN address) ko ping karo. Fail ho to underlay hai: interface, address, default route ya carrier. Succeed ho lekin overlay session down ho, to identity (organization, site-id, Controller address), WAN-to-transport mapping, phir tunnels aur BGP inspect karo. Bolo ki kuch badalne se pehle har layer par evidence collect karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay WAN interface addresses ke beech plain IP hai; overlay upar ka tunnelled, routed SD-WAN network hai.</li>
<li>Overlay hamesha underlay par depend karta hai; ulta galat hai.</li>
<li>Overlay packets encapsulate hote hain, isliye outer header mein WAN addresses hote hain.</li>
<li>Controller ko ek ping "underlay" aur "overlay" problems ko alag kar deta hai.</li>
<li>Link up, IP address aur default route alag alag proofs hain.</li>
</ul></div>
`}};export{e as default};