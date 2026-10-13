var e={id:`compare`,h:{en:`Comparing the designs and choosing one`,hi:`Designs ka comparison aur sahi choice`},body:{en:`
<p>A family car, a delivery van and a bus can all move people from A to B. Which one you buy depends on how many people, how far and how often. The three inter-VLAN designs are the same: all of them work, and a good engineer chooses by size, traffic pattern, budget and growth, not by habit.</p>

<h3>Side by side</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Legacy, router-on-a-stick and Layer 3 switch designs side by side">
<rect x="10" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Legacy</text>
<rect x="60" y="44" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="110" y="64" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="90" y1="74" x2="90" y2="120" stroke="#64748b" stroke-width="2"/><line x1="130" y1="74" x2="130" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="120" width="100" height="30" rx="6" fill="#bae6fd"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<text x="110" y="175" text-anchor="middle" class="svg-muted" font-size="12">1 cable per VLAN</text>
<rect x="220" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Router-on-a-stick</text>
<rect x="270" y="44" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">Router .10 .20</text>
<line x1="320" y1="74" x2="320" y2="120" stroke="#64748b" stroke-width="5"/>
<rect x="270" y="120" width="100" height="30" rx="6" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">1 trunk, hairpin</text>
<rect x="430" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Layer 3 switch</text>
<rect x="470" y="44" width="120" height="106" rx="6" fill="#bae6fd"/><text x="530" y="66" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="485" y="80" width="90" height="24" rx="4" fill="#bbf7d0"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="12">Vlan10 SVI</text>
<rect x="485" y="112" width="90" height="24" rx="4" fill="#fde68a"/><text x="530" y="129" text-anchor="middle" class="svg-ink" font-size="12">Vlan20 SVI</text>
<text x="530" y="175" text-anchor="middle" class="svg-muted" font-size="12">routed inside, in hardware</text>
</svg><p class="cap">Same job, three places for the gateway: separate router ports, router subinterfaces, or SVIs inside the switch.</p></div>

<table class="cmp"><tr><th>Criterion</th><th>Legacy</th><th>Router-on-a-stick</th><th>Layer 3 switch</th></tr>
<tr><td>Gateway lives on</td><td>Physical router port</td><td>Router subinterface</td><td>SVI</td></tr>
<tr><td>Ports used</td><td>1 router + 1 switch port per VLAN</td><td>1 router port + 1 trunk for all VLANs</td><td>No extra ports</td></tr>
<tr><td>Link to the switch</td><td>Access links</td><td>802.1Q trunk</td><td>None (internal)</td></tr>
<tr><td>Performance</td><td>Per-port speed, router CPU</td><td>One link and router CPU shared by all VLANs</td><td>Hardware, wire speed</td></tr>
<tr><td>Scale</td><td>A handful of VLANs</td><td>Dozens, limited by bandwidth</td><td>Hundreds of VLANs</td></tr>
<tr><td>Cost</td><td>Many router ports</td><td>Cheapest: one router you already own</td><td>Layer 3 capable switch</td></tr>
<tr><td>Typical place</td><td>Old or tiny sites</td><td>Branches, labs, small offices</td><td>Campus distribution and core</td></tr>
<tr><td>Extra router features</td><td>Yes (NAT, VPN, firewall)</td><td>Yes (NAT, VPN, firewall)</td><td>Limited; usually routing only</td></tr>
</table>

<h3>How to choose</h3>
<ul>
<li><b>Small branch, few VLANs, light east-west traffic, router already needed for WAN, NAT or VPN:</b> router-on-a-stick. One box does it all and costs nothing extra.</li>
<li><b>Campus or building with many VLANs and heavy traffic between them</b> (users to servers, printers, storage): Layer 3 switch SVIs at the distribution layer, with a routed uplink to the WAN or internet edge.</li>
<li><b>Legacy:</b> only when a router has plenty of spare ports and you need two or three VLANs, or when a security policy requires physically separate links.</li>
</ul>
<p>Real networks mix them. A typical company runs SVIs on the head-office distribution switches, a routed port to the edge router, and router-on-a-stick at each small branch. Larger campuses go further and use two distribution switches with the same SVIs plus a <b>first hop redundancy protocol</b> such as HSRP or VRRP, so the gateway survives a switch failure; that is covered in the FHRP module.</p>

<h3>Migrating from router-on-a-stick to SVIs</h3>
<p>The SVI lab tells exactly this story: the campus replaced its router-on-a-stick with DSW1. The key idea is to <b>move the gateway addresses, not change them</b>, so no host needs reconfiguring.</p>
<pre class="code"><span class="c">! Maintenance window. 1: remove the old gateway (on the router)</span>
R1(config)# no interface GigabitEthernet0/0.10
<span class="c">! 2: bring up the same address as an SVI on the Layer 3 switch</span>
DSW1(config)# ip routing
DSW1(config)# interface Vlan10
DSW1(config-if)# ip address 10.1.10.1 255.255.255.0
DSW1(config-if)# no shutdown
<span class="c">! 3: repeat per VLAN, then point the default route at the edge</span>
DSW1(config)# ip route 0.0.0.0 0.0.0.0 10.1.99.2</pre>
<p>Hosts keep their gateway 10.1.10.1, but its MAC address changes from the router's to DSW1's. Hosts learn the new MAC when their ARP entry ages out, or immediately because an SVI sends a gratuitous ARP when it comes up. After the change, a trace from PC1 shows DSW1 as the first hop:</p>
<pre class="out">PC1&gt; trace 203.0.113.1
trace to 203.0.113.1, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   10.1.10.1   0.912 ms  0.604 ms  0.588 ms</span>
 2   *10.1.99.2   1.230 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<div class="eg"><p><b>Worked example.</b> A hospital branch: 4 VLANs (staff, medical devices, guest Wi-Fi, voice), 60 users, a 100 Mbps WAN link and a firewall on the router. Inter-VLAN traffic is small. Router-on-a-stick fits. The same hospital's main campus: 40 VLANs, 2,000 users, PACS imaging servers moving gigabytes between VLANs. That needs SVIs on a pair of Layer 3 distribution switches.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving the old gateway active on the router while adding the SVI, so two devices answer ARP for the same IP (a duplicate address). Forgetting to remove VLANs from the old trunk to the router. Forgetting the return route on the edge router for any new subnet.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which design removes the single router link as a bottleneck for inter-VLAN traffic?" The Layer 3 switch. "Which uses one physical router interface for many VLANs?" Router-on-a-stick. Do not confuse "one physical interface" with "no physical interface".</p></div>

<div class="scn"><h4>The duplicate gateway</h4><p>During a migration, an engineer brought up SVI 10.8.10.1 on a new core switch but left subinterface Gi0/0.10 with the same address on the old router "just in case". Half the users worked and half did not, and the router logged <code>%IP-4-DUPADDR: Duplicate address 10.8.10.1</code>. Hosts had cached whichever MAC answered ARP first. Removing the router subinterface and clearing ARP on the core fixed it.</p><p><b>Lesson:</b> a gateway IP must live in exactly one place (or be shared deliberately with an FHRP).</p></div>

<div class="iv"><p class="q">"When would you still use router-on-a-stick instead of a Layer 3 switch?"</p><p>Strong answer: small sites with few VLANs and little traffic between them, where a router is already needed for WAN, NAT, VPN or firewalling and a Layer 3 switch would add cost. Name the trade-off: the single trunk and router CPU are a bottleneck and a single point of failure. For campuses with heavy east-west traffic, SVIs at the distribution layer, ideally with an FHRP, are the standard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Legacy: one port per VLAN, simple but unscalable.</li>
<li>Router-on-a-stick: one trunk, cheap, fits branches; the link and router CPU are the limits.</li>
<li>Layer 3 switch: SVIs routed in hardware, the campus standard.</li>
<li>Mixed designs are normal: SVIs in the campus, ROAS in branches, routed ports to the edge.</li>
<li>When migrating, move gateway IPs instead of renumbering, and never leave one IP on two devices.</li>
</ul></div>
`,hi:`
<p>Family car, delivery van aur bus, teeno logon ko A se B tak le jaa sakti hain. Aap kaunsi khareedte ho yeh is par depend karta hai ki kitne log, kitni door aur kitni baar. Teen inter-VLAN designs bhi aise hi hain: teeno kaam karte hain, aur achha engineer aadat se nahi, size, traffic pattern, budget aur growth dekh kar chunta hai.</p>

<h3>Saath saath</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Legacy, router-on-a-stick aur Layer 3 switch designs saath saath">
<rect x="10" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Legacy</text>
<rect x="60" y="44" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="110" y="64" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="90" y1="74" x2="90" y2="120" stroke="#64748b" stroke-width="2"/><line x1="130" y1="74" x2="130" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="120" width="100" height="30" rx="6" fill="#bae6fd"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<text x="110" y="175" text-anchor="middle" class="svg-muted" font-size="12">har VLAN ki 1 cable</text>
<rect x="220" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Router-on-a-stick</text>
<rect x="270" y="44" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">Router .10 .20</text>
<line x1="320" y1="74" x2="320" y2="120" stroke="#64748b" stroke-width="5"/>
<rect x="270" y="120" width="100" height="30" rx="6" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">1 trunk, hairpin</text>
<rect x="430" y="10" width="200" height="190" rx="10" fill="#e2e8f0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Layer 3 switch</text>
<rect x="470" y="44" width="120" height="106" rx="6" fill="#bae6fd"/><text x="530" y="66" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="485" y="80" width="90" height="24" rx="4" fill="#bbf7d0"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="12">Vlan10 SVI</text>
<rect x="485" y="112" width="90" height="24" rx="4" fill="#fde68a"/><text x="530" y="129" text-anchor="middle" class="svg-ink" font-size="12">Vlan20 SVI</text>
<text x="530" y="175" text-anchor="middle" class="svg-muted" font-size="12">andar hi, hardware mein route</text>
</svg><p class="cap">Kaam same, gateway ki teen jagah: alag router ports, router subinterfaces, ya switch ke andar SVIs.</p></div>

<table class="cmp"><tr><th>Criterion</th><th>Legacy</th><th>Router-on-a-stick</th><th>Layer 3 switch</th></tr>
<tr><td>Gateway kahan rehta hai</td><td>Physical router port</td><td>Router subinterface</td><td>SVI</td></tr>
<tr><td>Ports kitne lagte hain</td><td>Har VLAN par 1 router + 1 switch port</td><td>Saare VLANs ke liye 1 router port + 1 trunk</td><td>Koi extra port nahi</td></tr>
<tr><td>Switch tak link</td><td>Access links</td><td>802.1Q trunk</td><td>Koi nahi (internal)</td></tr>
<tr><td>Performance</td><td>Per-port speed, router CPU</td><td>Ek link aur router CPU saare VLANs mein shared</td><td>Hardware, wire speed</td></tr>
<tr><td>Scale</td><td>Gine chune VLANs</td><td>Darjanon, bandwidth se limited</td><td>Sainkdon VLANs</td></tr>
<tr><td>Cost</td><td>Bahut saare router ports</td><td>Sabse sasta: jo router pehle se hai</td><td>Layer 3 capable switch</td></tr>
<tr><td>Typical jagah</td><td>Purani ya bahut chhoti sites</td><td>Branches, labs, chhote offices</td><td>Campus distribution aur core</td></tr>
<tr><td>Extra router features</td><td>Haan (NAT, VPN, firewall)</td><td>Haan (NAT, VPN, firewall)</td><td>Limited; aam taur par sirf routing</td></tr>
</table>

<h3>Kaise chunein</h3>
<ul>
<li><b>Chhoti branch, kam VLANs, halka east-west traffic, WAN, NAT ya VPN ke liye router pehle se chahiye:</b> router-on-a-stick. Ek box sab karta hai aur kuch extra kharcha nahi.</li>
<li><b>Campus ya building jahan bahut VLANs hain aur unke beech bhaari traffic hai</b> (users se servers, printers, storage): distribution layer par Layer 3 switch SVIs, WAN ya internet edge tak routed uplink ke saath.</li>
<li><b>Legacy:</b> sirf tab jab router ke paas bahut spare ports hon aur do teen VLANs chahiye, ya security policy physically alag links maangti ho.</li>
</ul>
<p>Real networks inhe mila kar chalate hain. Typical company head office ke distribution switches par SVIs, edge router tak routed port, aur har chhoti branch par router-on-a-stick chalati hai. Bade campuses aur aage jaate hain aur same SVIs wale do distribution switches ke saath HSRP ya VRRP jaisa <b>first hop redundancy protocol</b> use karte hain, taaki switch fail hone par bhi gateway bacha rahe; yeh FHRP module mein cover hai.</p>

<h3>Router-on-a-stick se SVIs par migration</h3>
<p>SVI lab bilkul yahi kahani sunata hai: campus ne apna router-on-a-stick DSW1 se replace kiya. Main idea hai <b>gateway addresses ko move karo, badlo nahi</b>, taaki kisi host ko reconfigure na karna pade.</p>
<pre class="code"><span class="c">! Maintenance window. 1: purana gateway hatao (router par)</span>
R1(config)# no interface GigabitEthernet0/0.10
<span class="c">! 2: wahi address Layer 3 switch par SVI ke roop mein up karo</span>
DSW1(config)# ip routing
DSW1(config)# interface Vlan10
DSW1(config-if)# ip address 10.1.10.1 255.255.255.0
DSW1(config-if)# no shutdown
<span class="c">! 3: har VLAN ke liye dohrao, phir default route edge ki taraf karo</span>
DSW1(config)# ip route 0.0.0.0 0.0.0.0 10.1.99.2</pre>
<p>Hosts apna gateway 10.1.10.1 rakhte hain, lekin uska MAC address router ke MAC se DSW1 ke MAC mein badal jaata hai. Hosts naya MAC tab seekhte hain jab unki ARP entry age out hoti hai, ya turant, kyunki SVI up hote waqt gratuitous ARP bhejta hai. Change ke baad PC1 se trace pehle hop par DSW1 dikhata hai:</p>
<pre class="out">PC1&gt; trace 203.0.113.1
trace to 203.0.113.1, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   10.1.10.1   0.912 ms  0.604 ms  0.588 ms</span>
 2   *10.1.99.2   1.230 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<div class="eg"><p><b>Worked example.</b> Ek hospital branch: 4 VLANs (staff, medical devices, guest Wi-Fi, voice), 60 users, 100 Mbps WAN link aur router par firewall. Inter-VLAN traffic kam hai. Router-on-a-stick fit hota hai. Usi hospital ka main campus: 40 VLANs, 2,000 users, PACS imaging servers jo VLANs ke beech gigabytes move karte hain. Wahan Layer 3 distribution switches ke pair par SVIs chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> SVI jodte waqt router par purana gateway active chhod dena, jisse same IP ke liye do devices ARP ka jawab dete hain (duplicate address). Router tak purane trunk se VLANs hatana bhool jaana. Kisi bhi naye subnet ke liye edge router par return route bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa design inter-VLAN traffic ke liye single router link ko bottleneck se hatata hai?" Layer 3 switch. "Kaunsa kai VLANs ke liye ek physical router interface use karta hai?" Router-on-a-stick. "Ek physical interface" ko "koi physical interface nahi" se confuse mat karo.</p></div>

<div class="scn"><h4>Duplicate gateway</h4><p>Migration ke dauraan ek engineer ne naye core switch par SVI 10.8.10.1 up kiya lekin purane router par same address wala subinterface Gi0/0.10 "just in case" chhod diya. Aadhe users chal rahe the aur aadhe nahi, aur router ne <code>%IP-4-DUPADDR: Duplicate address 10.8.10.1</code> log kiya. Hosts ne jo MAC pehle ARP ka jawab de gaya use cache kar liya tha. Router subinterface hatane aur core par ARP clear karne se problem theek ho gayi.</p><p><b>Seekh:</b> gateway IP bilkul ek jagah rehna chahiye (ya FHRP ke saath jaan boojh kar share hona chahiye).</p></div>

<div class="iv"><p class="q">"Aap Layer 3 switch ki jagah ab bhi router-on-a-stick kab use karoge?"</p><p>Strong answer: chhoti sites jahan kam VLANs hain aur unke beech kam traffic hai, jahan WAN, NAT, VPN ya firewalling ke liye router pehle se chahiye aur Layer 3 switch kharcha badhayega. Trade-off batao: single trunk aur router CPU bottleneck aur single point of failure hain. Bhaari east-west traffic wale campuses ke liye distribution layer par SVIs, ideally FHRP ke saath, standard hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Legacy: har VLAN ka ek port, simple lekin scale nahi karta.</li>
<li>Router-on-a-stick: ek trunk, sasta, branches ke liye fit; link aur router CPU limits hain.</li>
<li>Layer 3 switch: hardware mein routed SVIs, campus standard.</li>
<li>Mixed designs normal hain: campus mein SVIs, branches mein ROAS, edge tak routed ports.</li>
<li>Migration mein renumber karne ki jagah gateway IPs move karo, aur ek IP kabhi do devices par mat chhodo.</li>
</ul></div>
`}};export{e as default};