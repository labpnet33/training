var e={id:`build-both-ends`,h:{en:`Building both ends of the tunnel`,hi:`Tunnel ke dono ends banana`},body:{en:`
<p>You now know each object. This chapter builds both ends of the example tunnel from start to finish, and shows which values must be identical and which must be mirror images. A VPN fails at the seams between the two ends, so a clear comparison table is the best tool you can have.</p>

<h3>Build order (same on both firewalls)</h3>
<ol>
<li>Confirm the Internet-facing interface, zone, address and default route work. Test with ping from the firewall.</li>
<li>Create the IKE crypto profile and the IPsec crypto profile.</li>
<li>Create the IKE gateway.</li>
<li>Create the tunnel interface, zone and virtual router membership.</li>
<li>Create the IPsec tunnel object.</li>
<li>Add the route to the remote subnet through the tunnel interface.</li>
<li>Add security policy and the NAT exemption.</li>
<li>Commit, then initiate traffic and verify (chapter 7).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="6" y="50" width="96" height="60" rx="10" fill="#fde68a"/><text x="54" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay ok</text>
<rect x="110" y="50" width="96" height="60" rx="10" fill="#ddd6fe"/><text x="158" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 Profiles</text>
<rect x="214" y="50" width="96" height="60" rx="10" fill="#bae6fd"/><text x="262" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Gateway</text>
<rect x="318" y="50" width="96" height="60" rx="10" fill="#bbf7d0"/><text x="366" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 tunnel.11</text>
<rect x="422" y="50" width="96" height="60" rx="10" fill="#fed7aa"/><text x="470" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 IPsec tunnel</text>
<rect x="526" y="50" width="108" height="60" rx="10" fill="#e2e8f0"/><text x="580" y="78" text-anchor="middle" class="svg-ink" font-size="12">6 Route + policy</text><text x="580" y="94" text-anchor="middle" class="svg-ink" font-size="12">+ no-NAT</text>
</svg><p class="cap">Build bottom-up: underlay first, traffic rules last.</p></div>

<h3>What must match and what must mirror</h3>
<table class="cmp"><tr><th>Item</th><th>HQ-FW</th><th>BR-FW</th><th>Rule</th></tr>
<tr><td>IKE version, DH group, encryption, hash</td><td>IKEv2, group14, AES-256, SHA-256</td><td>same</td><td>Identical (at least one common proposal)</td></tr>
<tr><td>IPsec encryption and PFS group</td><td>AES-256-GCM, group14</td><td>same</td><td>Identical</td></tr>
<tr><td>Pre-shared key</td><td>placeholder secret</td><td>same secret</td><td>Identical</td></tr>
<tr><td>Peer address</td><td>203.0.113.1</td><td>198.51.100.1</td><td>Mirrored</td></tr>
<tr><td>Tunnel interface address</td><td>10.255.11.1/30</td><td>10.255.11.2/30</td><td>Same subnet, different host</td></tr>
<tr><td>Route to remote LAN</td><td>10.20.0.0/16 via tunnel.11</td><td>10.10.0.0/16 via tunnel.11</td><td>Mirrored</td></tr>
<tr><td>Policy</td><td>trust to VPN and VPN to trust</td><td>same</td><td>Both directions allowed</td></tr>
</table>

<h3>Reference configuration (not run in the simulator): BR-FW</h3>
<p>The HQ side was shown in chapters 2 and 3. The branch uses the same profiles with mirrored peer and tunnel address values.</p>
<pre class="code"><span class="c"># Profiles identical to HQ-FW (NK-IKE, NK-IPSEC)</span>
set network ike gateway NK-GW1 protocol ikev2 ike-crypto-profile NK-IKE
set network ike gateway NK-GW1 local-address interface ethernet1/1
set network ike gateway NK-GW1 peer-address ip 198.51.100.1
set network ike gateway NK-GW1 authentication pre-shared-key key REPLACE-WITH-LONG-RANDOM-SECRET
set network interface tunnel units tunnel.11 ip 10.255.11.2/30
set zone VPN network layer3 tunnel.11
set network virtual-router default interface tunnel.11
set network tunnel ipsec NK-TUN1 auto-key ike-gateway NK-GW1
set network tunnel ipsec NK-TUN1 auto-key ipsec-crypto-profile NK-IPSEC
set network tunnel ipsec NK-TUN1 tunnel-interface tunnel.11
<span class="c"># Route to the HQ LAN through the tunnel</span>
set network virtual-router default routing-table ip static-route TO-HQ destination 10.10.0.0/16 interface tunnel.11
commit</pre>
<p>On HQ-FW the matching route is <code>destination 10.20.0.0/16 interface tunnel.11</code>. Routes and policy are explained in chapter 5. Syntax is for reference; verify with <code>?</code>.</p>

<h3>Initiating the tunnel</h3>
<p>With a static peer, IKE negotiation starts when interesting traffic arrives or when you manually test it. Many engineers start the negotiation from the CLI with <code>test vpn ike-sa gateway NK-GW1</code> and then <code>test vpn ipsec-sa tunnel NK-TUN1</code>. If one side is set to passive mode, start from the other side. A pair of firewalls both trying to initiate at the same moment is harmless, because they resolve the collision.</p>

<div class="eg"><p><b>Worked example.</b> At HQ the engineer fills in the table above first, then enters the HQ side. She sends the table to the branch engineer, who enters the mirrored side. Both commit. At HQ she runs the two test commands, then pings 10.20.1.5 from a host. Because each field was checked against the table, the first attempt worked.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Setting the same tunnel interface address on both ends (for example both 10.255.11.1/30). Each end needs its own host address in the shared /30, or tunnel monitoring and dynamic routing will fail.</p></div>
<div class="exam"><p><b>Exam trap.</b> Things that mirror: peer IP, local and peer identification, tunnel interface host address, remote subnet routes. Things that are identical: crypto choices, version and pre-shared key.</p></div>

<div class="scn"><h4>The copy-paste that doubled an address</h4><p>An engineer pasted the HQ configuration onto the branch and forgot to change the peer address, so the branch tried to negotiate with itself and logged nothing useful. Walking down the comparison table found the error in two minutes.</p><p><b>Lesson:</b> keep a one-page value table for every VPN and tick it off for both ends.</p></div>

<div class="iv"><p class="q">"Walk me through building a site-to-site VPN on a Palo Alto firewall."</p><p>Prepare the underlay, create the IKE and IPsec crypto profiles, the IKE gateway and the tunnel interface in a VPN zone, then the IPsec tunnel object. Add a route to the remote subnet via the tunnel interface, security policy in both directions and a NAT exemption. Commit, start the tunnel, and verify phases 1 and 2 and traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build bottom-up: underlay, profiles, gateway, tunnel interface, tunnel, then route, policy and NAT.</li>
<li>Crypto choices and key are identical; peer address and tunnel host address mirror.</li>
<li>Use a one-page comparison table for both ends.</li>
<li>Start negotiation from the CLI or with interesting traffic.</li>
<li>Do not paste a configuration without changing the mirrored values.</li>
</ul></div>
`,hi:`
<p>Ab aap har object jaante ho. Yeh chapter example tunnel ke dono ends ko shuru se aakhir tak banata hai, aur dikhata hai ki kaun si values identical aur kaun si mirror image honi chahiye. VPN dono ends ke beech ki seam par fail hota hai, isliye ek saaf comparison table sabse achha tool hai jo aapke paas ho sakta hai.</p>

<h3>Build order (dono firewalls par same)</h3>
<ol>
<li>Confirm karo ki Internet-facing interface, zone, address aur default route kaam karte hain. Firewall se ping karke test karo.</li>
<li>IKE crypto profile aur IPsec crypto profile banao.</li>
<li>IKE gateway banao.</li>
<li>Tunnel interface, zone aur virtual router membership banao.</li>
<li>IPsec tunnel object banao.</li>
<li>Tunnel interface ke through remote subnet ka route jodo.</li>
<li>Security policy aur NAT exemption jodo.</li>
<li>Commit karo, phir traffic initiate karo aur verify karo (chapter 7).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="6" y="50" width="96" height="60" rx="10" fill="#fde68a"/><text x="54" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay ok</text>
<rect x="110" y="50" width="96" height="60" rx="10" fill="#ddd6fe"/><text x="158" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 Profiles</text>
<rect x="214" y="50" width="96" height="60" rx="10" fill="#bae6fd"/><text x="262" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Gateway</text>
<rect x="318" y="50" width="96" height="60" rx="10" fill="#bbf7d0"/><text x="366" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 tunnel.11</text>
<rect x="422" y="50" width="96" height="60" rx="10" fill="#fed7aa"/><text x="470" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 IPsec tunnel</text>
<rect x="526" y="50" width="108" height="60" rx="10" fill="#e2e8f0"/><text x="580" y="78" text-anchor="middle" class="svg-ink" font-size="12">6 Route + policy</text><text x="580" y="94" text-anchor="middle" class="svg-ink" font-size="12">+ no-NAT</text>
</svg><p class="cap">Neeche se upar banao: pehle underlay, traffic rules sabse aakhir mein.</p></div>

<h3>Kya match hona chahiye aur kya mirror</h3>
<table class="cmp"><tr><th>Item</th><th>HQ-FW</th><th>BR-FW</th><th>Rule</th></tr>
<tr><td>IKE version, DH group, encryption, hash</td><td>IKEv2, group14, AES-256, SHA-256</td><td>same</td><td>Identical (kam se kam ek common proposal)</td></tr>
<tr><td>IPsec encryption aur PFS group</td><td>AES-256-GCM, group14</td><td>same</td><td>Identical</td></tr>
<tr><td>Pre-shared key</td><td>placeholder secret</td><td>same secret</td><td>Identical</td></tr>
<tr><td>Peer address</td><td>203.0.113.1</td><td>198.51.100.1</td><td>Mirrored</td></tr>
<tr><td>Tunnel interface address</td><td>10.255.11.1/30</td><td>10.255.11.2/30</td><td>Same subnet, alag host</td></tr>
<tr><td>Remote LAN ka route</td><td>10.20.0.0/16 via tunnel.11</td><td>10.10.0.0/16 via tunnel.11</td><td>Mirrored</td></tr>
<tr><td>Policy</td><td>trust to VPN aur VPN to trust</td><td>same</td><td>Dono directions allowed</td></tr>
</table>

<h3>Reference configuration (not run in the simulator): BR-FW</h3>
<p>HQ side chapters 2 aur 3 mein dikhayi gayi thi. Branch wahi profiles use karta hai, mirrored peer aur tunnel address values ke saath.</p>
<pre class="code"><span class="c"># HQ-FW jaise hi profiles (NK-IKE, NK-IPSEC)</span>
set network ike gateway NK-GW1 protocol ikev2 ike-crypto-profile NK-IKE
set network ike gateway NK-GW1 local-address interface ethernet1/1
set network ike gateway NK-GW1 peer-address ip 198.51.100.1
set network ike gateway NK-GW1 authentication pre-shared-key key REPLACE-WITH-LONG-RANDOM-SECRET
set network interface tunnel units tunnel.11 ip 10.255.11.2/30
set zone VPN network layer3 tunnel.11
set network virtual-router default interface tunnel.11
set network tunnel ipsec NK-TUN1 auto-key ike-gateway NK-GW1
set network tunnel ipsec NK-TUN1 auto-key ipsec-crypto-profile NK-IPSEC
set network tunnel ipsec NK-TUN1 tunnel-interface tunnel.11
<span class="c"># Tunnel ke through HQ LAN ka route</span>
set network virtual-router default routing-table ip static-route TO-HQ destination 10.10.0.0/16 interface tunnel.11
commit</pre>
<p>HQ-FW par matching route <code>destination 10.20.0.0/16 interface tunnel.11</code> hai. Routes aur policy chapter 5 mein samjhaye gaye hain. Syntax reference ke liye hai; <code>?</code> se verify karo.</p>

<h3>Tunnel ko initiate karna</h3>
<p>Static peer ke saath IKE negotiation tab shuru hota hai jab interesting traffic aata hai ya jab aap use manually test karte ho. Kai engineers CLI se <code>test vpn ike-sa gateway NK-GW1</code> aur phir <code>test vpn ipsec-sa tunnel NK-TUN1</code> chalakar negotiation shuru karte hain. Ek side passive mode par ho to doosri side se shuru karo. Dono firewalls ek hi pal initiate karein to koi nuksaan nahi, kyunki woh collision resolve kar lete hain.</p>

<div class="eg"><p><b>Worked example.</b> HQ par engineer pehle upar ki table bharti hai, phir HQ side enter karti hai. Woh table branch engineer ko bhejti hai, jo mirrored side enter karta hai. Dono commit karte hain. HQ par woh do test commands chalati hai, phir ek host se 10.20.1.5 ko ping karti hai. Kyunki har field table se check hui thi, pehli koshish mein kaam kar gaya.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Dono ends par same tunnel interface address set karna (jaise dono 10.255.11.1/30). Shared /30 mein har end ko apna host address chahiye, nahi to tunnel monitoring aur dynamic routing fail hongi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo mirror hota hai: peer IP, local aur peer identification, tunnel interface host address, remote subnet routes. Jo identical hota hai: crypto choices, version aur pre-shared key.</p></div>

<div class="scn"><h4>Copy-paste jisne address double kar diya</h4><p>Ek engineer ne HQ configuration branch par paste kar di aur peer address badalna bhool gaya, isliye branch khud se negotiate karne ki koshish karta raha aur koi kaam ka log nahi aaya. Comparison table mein neeche jaane par do minute mein galti mil gayi.</p><p><b>Lesson:</b> har VPN ke liye ek-page value table rakho aur dono ends ke liye tick karo.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par site-to-site VPN banane ka process batao."</p><p>Underlay taiyaar karo, IKE aur IPsec crypto profiles, IKE gateway aur VPN zone mein tunnel interface banao, phir IPsec tunnel object. Tunnel interface ke through remote subnet ka route, dono directions mein security policy aur NAT exemption jodo. Commit karo, tunnel start karo, aur phase 1, phase 2 aur traffic verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar banao: underlay, profiles, gateway, tunnel interface, tunnel, phir route, policy aur NAT.</li>
<li>Crypto choices aur key identical hain; peer address aur tunnel host address mirror.</li>
<li>Dono ends ke liye ek-page comparison table use karo.</li>
<li>Negotiation CLI se ya interesting traffic se shuru karo.</li>
<li>Mirrored values badle bina configuration paste mat karo.</li>
</ul></div>
`}};export{e as default};