var e={id:`phase3`,h:{en:`Phase 3: NHRP redirect and shortcut`,hi:`Phase 3: NHRP redirect aur shortcut`},body:{en:`
<p>In phase 3 the branches no longer carry the full list of delivery areas. They send everything to head office. Head office notices "this parcel came from Pune and is going straight back out to Kochi; why am I in the middle?" and phones Pune: "for Kochi, drive direct". Pune asks for Kochi's exact address and remembers it. That phone call is an <b>NHRP redirect</b>; remembering the address is an <b>NHRP shortcut</b>.</p>

<h3>The starting point (lab 3)</h3>
<p>Lab 3 runs OSPF <b>point-to-multipoint</b> on all tunnels. Point-to-multipoint makes every router advertise the link as a set of host routes and every remote prefix is reached <b>via the hub</b>. Phase 2 therefore never triggers:</p>
<pre class="out">SPOKE1# show ip route ospf | include 10.3.3
<span class="hl">O        10.3.3.0/24 [110/2001] via 172.16.100.1, 00:08:44, Tunnel0</span>
PC1&gt; trace 10.3.3.10
 1   10.2.2.1       1.101 ms
<span class="hl"> 2   172.16.100.1   8.992 ms</span>
 3   172.16.100.3  17.335 ms
 4   10.3.3.10     18.020 ms</pre>
<p>Task 1 asks for the hop between the two branch routers: <b>172.16.100.1</b>, the hub. Cost 2001 = 1000 (SPOKE1 to hub) + 1000 (hub to SPOKE2) + 1 (Kochi LAN).</p>

<h3>The two commands</h3>
<pre class="code"><span class="c">! HUB: send Traffic Indications when traffic hairpins on Tunnel0</span>
interface Tunnel0
 ip nhrp redirect
<span class="c">! SPOKE1 and SPOKE2: act on redirects and install shortcuts</span>
interface Tunnel0
 ip nhrp shortcut</pre>
<p>That is the entire migration from phase 2 (or from a phase 1 cloud with mGRE spokes) to phase 3. The routing protocol does not change.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Phase 3 redirect and shortcut sequence">
<defs><marker id="p7e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text>
<rect x="260" y="10" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">HUB</text>
<rect x="480" y="10" width="120" height="30" rx="6" fill="#fde68a"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text>
<line x1="100" y1="40" x2="100" y2="270" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="40" x2="320" y2="270" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="40" x2="540" y2="270" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="65" x2="316" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7e)"/><line x1="320" y1="65" x2="536" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7e)"/><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">1 data via hub (route points to hub)</text>
<line x1="320" y1="100" x2="104" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7e)"/><text x="208" y="93" text-anchor="middle" class="svg-accent" font-size="12">2 Traffic Indication</text>
<line x1="100" y1="140" x2="316" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7e)"/><line x1="320" y1="140" x2="536" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7e)"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3 Resolution Req for 10.3.3.10 (routed)</text>
<line x1="540" y1="185" x2="104" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#p7e)"/><text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">4 Reply direct: 10.3.3.0/24 at 100.64.30.2</text>
<line x1="100" y1="235" x2="536" y2="235" stroke="#64748b" stroke-width="3" marker-end="url(#p7e)"/><text x="320" y="227" text-anchor="middle" class="svg-accent" font-size="12">5 shortcut: data spoke to spoke</text>
</svg><p class="cap">The hub starts the process; the spoke resolves the destination prefix, not the next hop.</p></div>

<h3>Step by step</h3>
<ol>
<li>PC1 pings 10.3.3.10. SPOKE1 follows its OSPF route to the hub.</li>
<li>The hub routes the packet back out of <b>Tunnel0</b>, the interface it arrived on (strictly: an interface with the same NHRP network-id). Because of <code>ip nhrp redirect</code>, it forwards the packet <b>and</b> sends an NHRP <b>Traffic Indication</b> to SPOKE1 containing the original packet header. Redirects are rate-limited so a busy flow does not flood the spoke.</li>
<li>SPOKE1, because of <code>ip nhrp shortcut</code>, sends a Resolution Request for the <b>destination</b> 10.3.3.10. The request follows the routed path (through the hub) to SPOKE2, the router that owns the destination.</li>
<li>SPOKE2 replies <b>directly</b> with the matching prefix from its routing table, 10.3.3.0/24, and its NBMA address 100.64.30.2.</li>
<li>SPOKE1 installs the shortcut. The same happens in the reverse direction, because SPOKE2's echo replies also hairpin on the hub.</li>
</ol>

<h3>How the shortcut appears in the routing table</h3>
<ul>
<li><b>No IGP route for that exact prefix</b> (the hub only sent a summary or a default): NHRP installs its own route with code <b>H</b>, administrative distance 250. Longest match wins, so the /24 beats the summary.</li>
<li><b>An IGP route for the exact prefix already exists</b> (lab 3, because OSPF advertises 10.3.3.0/24): NHRP cannot beat AD 110, so it <b>overrides the next hop</b> of that route in CEF. <code>show ip route</code> marks it with <b>%</b>.</li>
</ul>
<pre class="out">SPOKE1# show ip route | include 10.3.3|%
       + - replicated route, % - next hop override, p - overrides from PfR
<span class="hl">O   %    10.3.3.0/24 [110/2001] via 172.16.100.1, 00:12:05, Tunnel0</span>
SPOKE1# show ip nhrp
10.3.3.0/24 via 172.16.100.3
   Tunnel0 created 00:00:21, expire 00:04:38
<span class="hl">   Type: dynamic, Flags: router rib nho</span>
   NBMA address: 100.64.30.2
SPOKE1# show dmvpn detail
 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb    Target Network
 ----- --------------- --------------- ----- -------- ----- -----------------
     1 100.64.10.2        172.16.100.1    UP 00:31:02     S    172.16.100.1/32
<span class="hl">     2 100.64.30.2        172.16.100.3    UP 00:00:21   DT2       10.3.3.0/24</span>
                          172.16.100.3    UP 00:00:21   DT2   172.16.100.3/32
     1 100.64.20.2        172.16.100.2    UP 00:00:21   DLX       10.2.2.0/24</pre>
<p><b>nho</b> = next-hop override. <b>DT2</b> = dynamic entry with next-hop override (T1 would mean an NHRP route was installed). The <b>DLX</b> line is SPOKE1's own local LAN, which it handed to SPOKE2 in the reverse resolution (L = local, X = no socket).</p>

<div class="eg"><p><b>Worked example.</b> Change the design so the hub sends only a default route to the spokes (OSPF area design or EIGRP summary). SPOKE1's table now shows <code>O*E2 0.0.0.0/0 via 172.16.100.1</code>. After a ping to 10.3.3.10 you would see <code>H 10.3.3.0/24 [250/255] via 172.16.100.3, 00:00:05, Tunnel0</code> and <b>DT1</b> in <code>show dmvpn detail</code>: the /24 wins over the /0 by longest match, even with AD 250.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>ip nhrp redirect</code> on the spokes and <code>ip nhrp shortcut</code> only on the hub (reversed), or enabling shortcut on only one spoke: then only one direction shortcuts and the return traffic still hairpins. Also expecting the H route to replace an OSPF route of the same length; it cannot, it overrides the next hop instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> The phase 3 Resolution Request asks for the <b>destination address</b> and the reply carries a <b>prefix</b> with its mask. The Traffic Indication is sent by the <b>hub</b> to the <b>source spoke</b>. NHRP routes have AD <b>250</b> and code <b>H</b>; the next-hop override flag is <b>%</b>.</p></div>

<div class="scn"><h4>Half a shortcut</h4><p>After a phase 3 migration, a video call between two stores had one-way jitter. <code>show ip nhrp</code> on store A had a shortcut to store B, but store B had none: its template still lacked <code>ip nhrp shortcut</code>, so B ignored the hub's redirects and its return traffic kept hairpinning through the DC. Adding the command to every spoke template fixed the asymmetric path.</p><p><b>Lesson:</b> redirect on the hub, shortcut on every spoke; verify both directions.</p></div>

<div class="iv"><p class="q">"How does DMVPN phase 3 build a spoke-to-spoke tunnel when the spoke's route points to the hub?"</p><p>Strong answer: the hub sees the packet enter and leave the same NHRP network and, with <code>ip nhrp redirect</code>, sends a Traffic Indication to the source. The spoke, with <code>ip nhrp shortcut</code>, sends a Resolution Request for the destination, routed to the egress spoke, which replies directly with its prefix and NBMA address. The spoke installs an H route (AD 250) or, if the IGP has the same prefix, overrides the next hop (shown as %). This allows summarisation on the hub.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 3 = <code>ip nhrp redirect</code> on the hub + <code>ip nhrp shortcut</code> on every spoke.</li>
<li>The hub sends a Traffic Indication when a packet hairpins on the same NHRP network.</li>
<li>The spoke resolves the destination; the far spoke returns its prefix and NBMA address.</li>
<li>Result: H route (AD 250, DT1) or next-hop override (%, nho, DT2).</li>
<li>Routing can stay summarised or default-only; direct paths still form.</li>
</ul></div>
`,hi:`
<p>Phase 3 mein branches ab delivery areas ki poori list nahi rakhtin. Woh sab kuch head office bhejti hain. Head office notice karta hai "yeh parcel Pune se aaya aur seedha Kochi ke liye wapas bahar ja raha hai; main beech mein kyun hoon?" aur Pune ko phone karta hai: "Kochi ke liye seedhe jao". Pune Kochi ka exact address poochta hai aur yaad rakhta hai. Woh phone call <b>NHRP redirect</b> hai; address yaad rakhna <b>NHRP shortcut</b> hai.</p>

<h3>Starting point (lab 3)</h3>
<p>Lab 3 saare tunnels par OSPF <b>point-to-multipoint</b> chalati hai. Point-to-multipoint har router se link ko host routes ke set ki tarah advertise karwata hai aur har remote prefix <b>hub ke through</b> pahunchta hai. Isliye phase 2 kabhi trigger nahi hota:</p>
<pre class="out">SPOKE1# show ip route ospf | include 10.3.3
<span class="hl">O        10.3.3.0/24 [110/2001] via 172.16.100.1, 00:08:44, Tunnel0</span>
PC1&gt; trace 10.3.3.10
 1   10.2.2.1       1.101 ms
<span class="hl"> 2   172.16.100.1   8.992 ms</span>
 3   172.16.100.3  17.335 ms
 4   10.3.3.10     18.020 ms</pre>
<p>Task 1 dono branch routers ke beech ka hop poochta hai: <b>172.16.100.1</b>, yaani hub. Cost 2001 = 1000 (SPOKE1 se hub) + 1000 (hub se SPOKE2) + 1 (Kochi LAN).</p>

<h3>Do commands</h3>
<pre class="code"><span class="c">! HUB: Tunnel0 par traffic hairpin ho to Traffic Indications bhejo</span>
interface Tunnel0
 ip nhrp redirect
<span class="c">! SPOKE1 aur SPOKE2: redirects par action lo aur shortcuts install karo</span>
interface Tunnel0
 ip nhrp shortcut</pre>
<p>Phase 2 se (ya mGRE spokes wale phase 1 cloud se) phase 3 tak ka poora migration bas itna hai. Routing protocol nahi badalta.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Phase 3 redirect aur shortcut sequence">
<defs><marker id="p7h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="100" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1</text>
<rect x="260" y="10" width="120" height="30" rx="6" fill="#bae6fd"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">HUB</text>
<rect x="480" y="10" width="120" height="30" rx="6" fill="#fde68a"/><text x="540" y="30" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2</text>
<line x1="100" y1="40" x2="100" y2="270" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="40" x2="320" y2="270" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="40" x2="540" y2="270" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="65" x2="316" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7h)"/><line x1="320" y1="65" x2="536" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7h)"/><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">1 data hub se (route hub ki taraf)</text>
<line x1="320" y1="100" x2="104" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7h)"/><text x="208" y="93" text-anchor="middle" class="svg-accent" font-size="12">2 Traffic Indication</text>
<line x1="100" y1="140" x2="316" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7h)"/><line x1="320" y1="140" x2="536" y2="140" stroke="#64748b" stroke-width="1.5" marker-end="url(#p7h)"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3 10.3.3.10 ke liye Resolution Req (routed)</text>
<line x1="540" y1="185" x2="104" y2="185" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#p7h)"/><text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">4 Reply seedha: 10.3.3.0/24 = 100.64.30.2</text>
<line x1="100" y1="235" x2="536" y2="235" stroke="#64748b" stroke-width="3" marker-end="url(#p7h)"/><text x="320" y="227" text-anchor="middle" class="svg-accent" font-size="12">5 shortcut: data spoke se spoke</text>
</svg><p class="cap">Process hub shuru karta hai; spoke destination prefix resolve karta hai, next hop nahi.</p></div>

<h3>Step by step</h3>
<ol>
<li>PC1 10.3.3.10 ping karta hai. SPOKE1 apna OSPF route follow karke hub ki taraf bhejta hai.</li>
<li>Hub packet ko wapas <b>Tunnel0</b> se route karta hai, usi interface se jahan se aaya tha (strictly: same NHRP network-id wala interface). <code>ip nhrp redirect</code> ki wajah se woh packet forward <b>bhi</b> karta hai aur SPOKE1 ko original packet header ke saath NHRP <b>Traffic Indication</b> bhi bhejta hai. Redirects rate-limited hote hain taaki busy flow spoke ko flood na kare.</li>
<li>SPOKE1, <code>ip nhrp shortcut</code> ki wajah se, <b>destination</b> 10.3.3.10 ke liye Resolution Request bhejta hai. Request routed path (hub ke through) follow karke SPOKE2 tak jaati hai, jo destination ka owner router hai.</li>
<li>SPOKE2 apni routing table se matching prefix, 10.3.3.0/24, aur apne NBMA address 100.64.30.2 ke saath <b>seedha</b> reply karta hai.</li>
<li>SPOKE1 shortcut install karta hai. Ulti direction mein bhi yahi hota hai, kyunki SPOKE2 ke echo replies bhi hub par hairpin hote hain.</li>
</ol>

<h3>Routing table mein shortcut kaise dikhta hai</h3>
<ul>
<li><b>Us exact prefix ka koi IGP route nahi</b> (hub ne sirf summary ya default bheja): NHRP apna route code <b>H</b> ke saath install karta hai, administrative distance 250. Longest match jeetta hai, isliye /24 summary ko hara deta hai.</li>
<li><b>Exact prefix ka IGP route pehle se hai</b> (lab 3, kyunki OSPF 10.3.3.0/24 advertise karta hai): NHRP AD 110 ko hara nahi sakta, isliye woh CEF mein us route ka <b>next hop override</b> karta hai. <code>show ip route</code> use <b>%</b> se mark karta hai.</li>
</ul>
<pre class="out">SPOKE1# show ip route | include 10.3.3|%
       + - replicated route, % - next hop override, p - overrides from PfR
<span class="hl">O   %    10.3.3.0/24 [110/2001] via 172.16.100.1, 00:12:05, Tunnel0</span>
SPOKE1# show ip nhrp
10.3.3.0/24 via 172.16.100.3
   Tunnel0 created 00:00:21, expire 00:04:38
<span class="hl">   Type: dynamic, Flags: router rib nho</span>
   NBMA address: 100.64.30.2
SPOKE1# show dmvpn detail
 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb    Target Network
 ----- --------------- --------------- ----- -------- ----- -----------------
     1 100.64.10.2        172.16.100.1    UP 00:31:02     S    172.16.100.1/32
<span class="hl">     2 100.64.30.2        172.16.100.3    UP 00:00:21   DT2       10.3.3.0/24</span>
                          172.16.100.3    UP 00:00:21   DT2   172.16.100.3/32
     1 100.64.20.2        172.16.100.2    UP 00:00:21   DLX       10.2.2.0/24</pre>
<p><b>nho</b> = next-hop override. <b>DT2</b> = next-hop override wali dynamic entry (T1 ka matlab hota ki NHRP route install hua). <b>DLX</b> line SPOKE1 ki apni local LAN hai, jo usne ulti resolution mein SPOKE2 ko di (L = local, X = no socket).</p>

<div class="eg"><p><b>Worked example.</b> Design badlo taaki hub spokes ko sirf default route bheje (OSPF area design ya EIGRP summary). SPOKE1 ki table ab <code>O*E2 0.0.0.0/0 via 172.16.100.1</code> dikhati hai. 10.3.3.10 ping karne ke baad aapko <code>H 10.3.3.0/24 [250/255] via 172.16.100.3, 00:00:05, Tunnel0</code> aur <code>show dmvpn detail</code> mein <b>DT1</b> dikhega: AD 250 hone ke bawajood longest match se /24 /0 ko hara deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip nhrp redirect</code> spokes par aur <code>ip nhrp shortcut</code> sirf hub par lagana (ulta), ya shortcut sirf ek spoke par enable karna: tab sirf ek direction shortcut leti hai aur return traffic ab bhi hairpin hota hai. Aur yeh expect karna ki H route same length ke OSPF route ko replace karega; woh nahi kar sakta, woh next hop override karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Phase 3 Resolution Request <b>destination address</b> ke liye poochti hai aur reply mask ke saath <b>prefix</b> laata hai. Traffic Indication <b>hub</b> se <b>source spoke</b> ko jaata hai. NHRP routes ka AD <b>250</b> aur code <b>H</b> hai; next-hop override flag <b>%</b> hai.</p></div>

<div class="scn"><h4>Aadha shortcut</h4><p>Phase 3 migration ke baad do stores ke beech video call mein one-way jitter tha. Store A par <code>show ip nhrp</code> mein store B ka shortcut tha, lekin store B par koi nahi: uske template mein ab bhi <code>ip nhrp shortcut</code> missing tha, isliye B hub ke redirects ignore kar raha tha aur uska return traffic DC se hairpin hota raha. Har spoke template mein command jodne se asymmetric path theek hua.</p><p><b>Seekh:</b> hub par redirect, har spoke par shortcut; dono directions verify karo.</p></div>

<div class="iv"><p class="q">"Jab spoke ka route hub ki taraf point karta hai, to DMVPN phase 3 spoke-to-spoke tunnel kaise banata hai?"</p><p>Strong answer: hub dekhta hai ki packet same NHRP network mein aaya aur gaya aur <code>ip nhrp redirect</code> ke saath source ko Traffic Indication bhejta hai. Spoke, <code>ip nhrp shortcut</code> ke saath, destination ke liye Resolution Request bhejta hai, jo egress spoke tak route hoti hai, aur woh apne prefix aur NBMA address ke saath seedha reply karta hai. Spoke H route (AD 250) install karta hai ya, agar IGP ke paas same prefix hai, next hop override karta hai (% ki tarah dikhta hai). Isse hub par summarisation possible hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 3 = hub par <code>ip nhrp redirect</code> + har spoke par <code>ip nhrp shortcut</code>.</li>
<li>Jab packet same NHRP network par hairpin hota hai, hub Traffic Indication bhejta hai.</li>
<li>Spoke destination resolve karta hai; door wala spoke apna prefix aur NBMA address lautata hai.</li>
<li>Nateeja: H route (AD 250, DT1) ya next-hop override (%, nho, DT2).</li>
<li>Routing summarised ya sirf default reh sakti hai; direct paths phir bhi bante hain.</li>
</ul></div>
`}};export{e as default};