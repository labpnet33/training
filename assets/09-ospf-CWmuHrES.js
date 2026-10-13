var e={id:`ospf`,h:{en:`OSPF over DMVPN: network types and the DR`,hi:`DMVPN par OSPF: network types aur DR`},body:{en:`
<p>Imagine a meeting where everyone must agree on the minutes, but the participants in the room can only hear the chairperson, not each other. If the chair is the one writing the minutes, it works. If someone at the back is elected to write them, half the room is left out. On a DMVPN cloud, spokes only hear the hub, so OSPF's "minutes writer", the <b>designated router (DR)</b>, must be the hub.</p>

<h3>The OSPF network types on a tunnel</h3>
<p>A GRE or mGRE tunnel defaults to OSPF network type <b>point-to-point</b>. That type allows only one neighbour, which is fine on a point-to-point tunnel and wrong on a multipoint hub. Pick the type from the phase:</p>
<table class="cmp"><tr><th>Network type</th><th>Hello / dead</th><th>DR</th><th>Next hop learned by spokes</th><th>Fits</th></tr>
<tr><td>point-to-point (tunnel default)</td><td>10 / 40</td><td>No</td><td>n/a (one neighbour only)</td><td>Never on an mGRE hub: adjacencies flap</td></tr>
<tr><td>broadcast</td><td>10 / 40</td><td>Yes, must be hub</td><td><b>Far spoke</b> (preserved)</td><td>Phase 2 (and 3)</td></tr>
<tr><td>non-broadcast</td><td>30 / 120</td><td>Yes, must be hub</td><td>Far spoke</td><td>Phase 2, but the hub needs a <code>neighbor</code> per spoke</td></tr>
<tr><td>point-to-multipoint</td><td>30 / 120</td><td>No</td><td><b>Hub</b></td><td>Phase 1 and 3</td></tr></table>
<p>Why does broadcast keep the far spoke as next hop? With a DR, the link is described by one <b>network LSA</b> listing all attached routers, and SPF computes next hops as "the router on the shared segment that leads there", which is SPOKE2's own interface address. Point-to-multipoint describes the cloud as a set of point-to-point links to the hub plus /32 host routes, so everything goes via the hub.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Why the hub must be the OSPF DR">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB = DR</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">priority 255</text>
<rect x="60" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="130" y="172" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text><text x="130" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 0, DROTHER</text>
<rect x="440" y="150" width="140" height="50" rx="8" fill="#fde68a"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text><text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 0, DROTHER</text>
<line x1="280" y1="70" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="105" class="svg-accent" font-size="12">hellos + FULL</text><text x="400" y="105" class="svg-accent" font-size="12">hellos + FULL</text>
<line x1="200" y1="175" x2="440" y2="175" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 5"/>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">no multicast between spokes</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">Only the hub hears everyone, so only the hub can be DR</text>
</svg><p class="cap">Spokes replicate multicast only to the hub; a spoke DR could never reach the other spokes.</p></div>

<h3>Phase 2 configuration (lab 1, task 3)</h3>
<pre class="code"><span class="c">! HUB</span>
interface Tunnel0
 ip ospf network broadcast
 ip ospf priority 255
<span class="c">! SPOKE1 and SPOKE2</span>
interface Tunnel0
 ip ospf network broadcast
 ip ospf priority 0
<span class="c">! all three routers</span>
router ospf 1
 network 172.16.100.0 0.0.0.255 area 0</pre>
<pre class="out">HUB# show ip ospf interface Tunnel0 | include Network|Designated|backup
<span class="hl">  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1000</span>
<span class="hl">  Designated Router (ID) 1.1.1.1, Interface address 172.16.100.1</span>
  No backup designated router on this network
HUB# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">2.2.2.2           0   FULL/DROTHER    00:00:35    172.16.100.2    Tunnel0</span>
3.3.3.3           0   FULL/DROTHER    00:00:33    172.16.100.3    Tunnel0</pre>
<p>No BDR is expected: every spoke has priority 0 and is ineligible. If the hub reloads, OSPF over the cloud goes down with it, which is acceptable because in a single-hub design nothing works without the hub anyway.</p>

<h3>What goes wrong if a spoke becomes DR</h3>
<p>Suppose SPOKE1 keeps the default priority 1 and the hub also has priority 1. The highest router ID wins the tie, so SPOKE1 (2.2.2.2) beats the hub (1.1.1.1). The hub becomes FULL with SPOKE1. SPOKE2 cannot hear SPOKE1 at all; its hellos reach only the hub. SPOKE1's network LSA lists only the routers adjacent to it, so SPOKE2 is missing from it and the SPF two-way check fails: SPOKE2's LAN vanishes from everyone's table and SPOKE2 learns nothing. This is the third fault of lab 2.</p>

<h3>Network type mismatch: FULL but no routes</h3>
<p>Point-to-point and broadcast use the same timers (10/40), so a broadcast hub and a point-to-point spoke still form a FULL adjacency. But the spoke's router LSA describes a point-to-point link while the hub's describes a transit network. The descriptions do not match, SPF discards the link, and the spoke sits FULL with no OSPF routes. That is the second fault of lab 2. Broadcast versus point-to-multipoint, on the other hand, never becomes neighbours because hello 10 does not match hello 30.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3 uses point-to-multipoint everywhere. SPOKE1's table then contains <code>O 172.16.100.1/32 [110/1000] via 172.16.100.1</code>, <code>O 172.16.100.3/32 [110/2000] via 172.16.100.1</code> and <code>O 10.3.3.0/24 [110/2001] via 172.16.100.1</code>. Every next hop is the hub, so phase 2 cannot work, but phase 3 (chapter 7) can. If you wanted small spoke tables with OSPF, you would put the DMVPN in a non-backbone area with the hub as ABR and make it totally stubby, so spokes receive only a default route; OSPF cannot summarise inside an area.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving the tunnel at the default point-to-point type on the hub: the hub keeps replacing one spoke neighbour with another and logs adjacency changes every few seconds. Setting <code>ip ospf priority 255</code> on the hub but forgetting priority 0 on spokes: a new election after a hub reload may pick a spoke, and the election is not preemptive when the hub returns.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which OSPF network type allows spoke-to-spoke tunnels in phase 2 without extra neighbour commands?" Broadcast, with the hub as DR and spokes at priority 0. Point-to-multipoint changes the next hop to the hub. A broadcast/point-to-point mismatch forms FULL adjacencies but installs no routes.</p></div>

<div class="scn"><h4>The branch that won the election</h4><p>A new branch router was installed with a higher OSPF router ID than the hub and priority left at default. After a hub maintenance reload, the branch won the DR election. Within a minute, half the branches lost all routes; <code>show ip ospf interface Tunnel0</code> on the hub showed the DR as the new branch's RID. Setting <code>ip ospf priority 0</code> on every spoke and <code>clear ip ospf process</code> on the hub put the DR back on the hub.</p><p><b>Lesson:</b> on DMVPN, priority 0 on spokes is mandatory, not a tuning option.</p></div>

<div class="iv"><p class="q">"Which OSPF network type would you use over DMVPN phase 2, and what else must you configure?"</p><p>Strong answer: broadcast (or non-broadcast with neighbour statements) because it preserves the far spoke as next hop, which triggers NHRP resolution. The hub must be DR, so spokes get priority 0 and the hub a high priority; spokes only exchange multicast with the hub, so a spoke DR would leave other spokes out of the network LSA. Mention that point-to-multipoint suits phase 1/3 and that a point-to-point/broadcast mismatch gives FULL adjacencies without routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels default to OSPF point-to-point, which breaks a multipoint hub.</li>
<li>Phase 2: broadcast, hub DR (priority 255), spokes priority 0; next hop = far spoke.</li>
<li>Point-to-multipoint: no DR, next hop = hub, /32 host routes; fits phase 1 and 3.</li>
<li>Broadcast vs point-to-point: FULL but no routes; broadcast vs point-to-multipoint: no adjacency (timers).</li>
<li>OSPF cannot summarise inside an area; use a stub area with the hub as ABR for small spoke tables.</li>
</ul></div>
`,hi:`
<p>Ek meeting socho jahan sabko minutes par agree karna hai, lekin room ke log sirf chairperson ko sun sakte hain, ek doosre ko nahi. Agar minutes chair likhe to kaam chalta hai. Agar peeche baitha koi likhne ke liye chuna jaaye, to aadha room bahar reh jaata hai. DMVPN cloud par spokes sirf hub ko sunte hain, isliye OSPF ka "minutes writer", yaani <b>designated router (DR)</b>, hub hi hona chahiye.</p>

<h3>Tunnel par OSPF network types</h3>
<p>GRE ya mGRE tunnel default mein OSPF network type <b>point-to-point</b> hota hai. Yeh type sirf ek neighbour allow karta hai, jo point-to-point tunnel par theek hai aur multipoint hub par galat. Phase ke hisaab se type chuno:</p>
<table class="cmp"><tr><th>Network type</th><th>Hello / dead</th><th>DR</th><th>Spokes ko milne wala next hop</th><th>Kahan fit</th></tr>
<tr><td>point-to-point (tunnel default)</td><td>10 / 40</td><td>Nahi</td><td>n/a (sirf ek neighbour)</td><td>mGRE hub par kabhi nahi: adjacencies flap</td></tr>
<tr><td>broadcast</td><td>10 / 40</td><td>Haan, hub hona chahiye</td><td><b>Door wala spoke</b> (preserved)</td><td>Phase 2 (aur 3)</td></tr>
<tr><td>non-broadcast</td><td>30 / 120</td><td>Haan, hub hona chahiye</td><td>Door wala spoke</td><td>Phase 2, lekin hub ko har spoke ke liye <code>neighbor</code> chahiye</td></tr>
<tr><td>point-to-multipoint</td><td>30 / 120</td><td>Nahi</td><td><b>Hub</b></td><td>Phase 1 aur 3</td></tr></table>
<p>Broadcast door wale spoke ko next hop kyun rakhta hai? DR ke saath link ek <b>network LSA</b> se describe hota hai jo saare attached routers list karta hai, aur SPF next hops aise nikalta hai "shared segment par woh router jo wahan le jaata hai", jo SPOKE2 ka apna interface address hai. Point-to-multipoint cloud ko hub tak ke point-to-point links aur /32 host routes ki tarah describe karta hai, isliye sab kuch hub se jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Hub hi OSPF DR kyun ho">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB = DR</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">priority 255</text>
<rect x="60" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="130" y="172" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text><text x="130" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 0, DROTHER</text>
<rect x="440" y="150" width="140" height="50" rx="8" fill="#fde68a"/><text x="510" y="172" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text><text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 0, DROTHER</text>
<line x1="280" y1="70" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="70" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="105" class="svg-accent" font-size="12">hellos + FULL</text><text x="400" y="105" class="svg-accent" font-size="12">hellos + FULL</text>
<line x1="200" y1="175" x2="440" y2="175" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 5"/>
<text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">spokes ke beech multicast nahi</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">Sirf hub sabko sunta hai, isliye sirf hub DR ho sakta hai</text>
</svg><p class="cap">Spokes multicast sirf hub ko replicate karte hain; spoke DR kabhi baaki spokes tak nahi pahunch paata.</p></div>

<h3>Phase 2 configuration (lab 1, task 3)</h3>
<pre class="code"><span class="c">! HUB</span>
interface Tunnel0
 ip ospf network broadcast
 ip ospf priority 255
<span class="c">! SPOKE1 aur SPOKE2</span>
interface Tunnel0
 ip ospf network broadcast
 ip ospf priority 0
<span class="c">! teeno routers</span>
router ospf 1
 network 172.16.100.0 0.0.0.255 area 0</pre>
<pre class="out">HUB# show ip ospf interface Tunnel0 | include Network|Designated|backup
<span class="hl">  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1000</span>
<span class="hl">  Designated Router (ID) 1.1.1.1, Interface address 172.16.100.1</span>
  No backup designated router on this network
HUB# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">2.2.2.2           0   FULL/DROTHER    00:00:35    172.16.100.2    Tunnel0</span>
3.3.3.3           0   FULL/DROTHER    00:00:33    172.16.100.3    Tunnel0</pre>
<p>BDR expected nahi hai: har spoke ki priority 0 hai aur woh ineligible hai. Hub reload ho to cloud par OSPF uske saath down ho jaata hai, jo acceptable hai kyunki single-hub design mein hub ke bina waise bhi kuch kaam nahi karta.</p>

<h3>Agar spoke DR ban jaaye to kya bigadta hai</h3>
<p>Maano SPOKE1 default priority 1 rakhta hai aur hub ki bhi priority 1 hai. Tie mein highest router ID jeetta hai, isliye SPOKE1 (2.2.2.2) hub (1.1.1.1) ko hara deta hai. Hub SPOKE1 ke saath FULL ho jaata hai. SPOKE2 SPOKE1 ko bilkul nahi sun sakta; uske hellos sirf hub tak pahunchte hain. SPOKE1 ka network LSA sirf un routers ko list karta hai jo uske adjacent hain, isliye SPOKE2 usme missing hai aur SPF two-way check fail hota hai: SPOKE2 ki LAN sabki table se gayab ho jaati hai aur SPOKE2 kuch nahi seekhta. Yeh lab 2 ka teesra fault hai.</p>

<h3>Network type mismatch: FULL lekin routes nahi</h3>
<p>Point-to-point aur broadcast same timers (10/40) use karte hain, isliye broadcast hub aur point-to-point spoke phir bhi FULL adjacency bana lete hain. Lekin spoke ka router LSA point-to-point link describe karta hai jabki hub ka transit network. Descriptions match nahi karte, SPF link hata deta hai, aur spoke FULL par baitha rehta hai bina kisi OSPF route ke. Yeh lab 2 ka doosra fault hai. Doosri taraf broadcast vs point-to-multipoint kabhi neighbours nahi bante kyunki hello 10 hello 30 se match nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3 har jagah point-to-multipoint use karti hai. Tab SPOKE1 ki table mein <code>O 172.16.100.1/32 [110/1000] via 172.16.100.1</code>, <code>O 172.16.100.3/32 [110/2000] via 172.16.100.1</code> aur <code>O 10.3.3.0/24 [110/2001] via 172.16.100.1</code> hote hain. Har next hop hub hai, isliye phase 2 kaam nahi kar sakta, lekin phase 3 (chapter 7) kar sakta hai. Agar OSPF ke saath chhoti spoke tables chahiye, to DMVPN ko non-backbone area mein rakho jahan hub ABR ho aur use totally stubby banao, taaki spokes ko sirf default route mile; OSPF area ke andar summarise nahi kar sakta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Hub par tunnel ko default point-to-point type par chhod dena: hub ek spoke neighbour ko doosre se replace karta rehta hai aur har kuch seconds mein adjacency changes log karta hai. Hub par <code>ip ospf priority 255</code> lagana lekin spokes par priority 0 bhool jaana: hub reload ke baad naya election kisi spoke ko chun sakta hai, aur hub wapas aane par election preemptive nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa OSPF network type bina extra neighbour commands ke phase 2 mein spoke-to-spoke tunnels allow karta hai?" Broadcast, hub DR aur spokes priority 0 ke saath. Point-to-multipoint next hop ko hub bana deta hai. Broadcast/point-to-point mismatch FULL adjacencies banata hai lekin koi route install nahi karta.</p></div>

<div class="scn"><h4>Branch jo election jeet gayi</h4><p>Ek naya branch router hub se zyada OSPF router ID aur default priority ke saath install hua. Hub maintenance reload ke baad branch ne DR election jeet liya. Ek minute ke andar aadhi branches ke saare routes chale gaye; hub par <code>show ip ospf interface Tunnel0</code> DR ko nayi branch ka RID dikha raha tha. Har spoke par <code>ip ospf priority 0</code> aur hub par <code>clear ip ospf process</code> se DR wapas hub par aa gaya.</p><p><b>Seekh:</b> DMVPN par spokes par priority 0 mandatory hai, tuning option nahi.</p></div>

<div class="iv"><p class="q">"DMVPN phase 2 par aap kaunsa OSPF network type use karoge, aur aur kya configure karna hoga?"</p><p>Strong answer: broadcast (ya neighbour statements ke saath non-broadcast) kyunki yeh door wale spoke ko next hop rakhta hai, jo NHRP resolution trigger karta hai. Hub DR hona chahiye, isliye spokes ko priority 0 aur hub ko high priority; spokes sirf hub ke saath multicast exchange karte hain, isliye spoke DR baaki spokes ko network LSA se bahar chhod deta. Batao ki point-to-multipoint phase 1/3 ke liye fit hai aur point-to-point/broadcast mismatch bina routes ke FULL adjacencies deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnels default mein OSPF point-to-point hote hain, jo multipoint hub ko tod deta hai.</li>
<li>Phase 2: broadcast, hub DR (priority 255), spokes priority 0; next hop = door wala spoke.</li>
<li>Point-to-multipoint: DR nahi, next hop = hub, /32 host routes; phase 1 aur 3 ke liye fit.</li>
<li>Broadcast vs point-to-point: FULL lekin routes nahi; broadcast vs point-to-multipoint: adjacency nahi (timers).</li>
<li>OSPF area ke andar summarise nahi kar sakta; chhoti spoke tables ke liye hub ABR wala stub area use karo.</li>
</ul></div>
`}};export{e as default};