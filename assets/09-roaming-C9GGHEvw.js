var e={id:`roaming`,h:{en:`Roaming: intra-controller, Layer 2 and Layer 3 inter-controller, anchor and foreign`,hi:`Roaming: intra-controller, Layer 2 aur Layer 3 inter-controller, anchor aur foreign`},body:{en:`
<p>In CCNA you learned that the client, not the AP, decides to roam, and that within one controller the client keeps its IP address. ENCOR asks for the full picture: what the controllers do when a client moves between APs on the same controller, between controllers in the same subnet (Layer 2 roam), and between controllers in different subnets (Layer 3 roam), plus the guest anchor use case.</p>

<h3>An analogy: moving between hotel branches</h3>
<p>You check in at a hotel and get room key and a mailbox (the IP address). Moving to another floor of the same hotel is easy: reception just updates the room number (<b>intra-controller</b>). Moving to a sister hotel on the same street that shares the same postal code, reception hands over your file and your mail follows naturally (<b>Layer 2 inter-controller</b>). Moving to a sister hotel in another city is different: your mail still arrives at the original hotel because that is your registered address, so the original hotel (the <b>anchor</b>) forwards it to the new one (the <b>foreign</b>) and sends your outgoing post back through itself.</p>

<h3>Why the client roams</h3>
<p>A client scans (actively with probe requests, or passively listening to beacons) and moves when the current AP's RSSI or SNR falls below its own threshold, often around −70 to −75 dBm, or when it sees retries and a better AP. Vendors differ, and some clients are "sticky". The network can only help:</p>
<ul><li><b>802.11k</b> (radio resource measurement): the AP gives the client a <b>neighbour report</b>, a short list of nearby APs and their channels, so the client scans only those instead of every channel.</li>
<li><b>802.11v</b> (BSS transition management): the AP can suggest, or with disassociation imminent, strongly ask the client to move to a better AP.</li>
<li><b>802.11r</b> (fast BSS transition) and key caching make the roam itself fast; they are about keys and are covered in chapter 11.</li></ul>

<h3>Intra-controller roaming</h3>
<p>Both APs are joined to the same controller. The client reassociates to the new AP; the controller updates its client database (new AP, same WLAN, same interface/VLAN) and the client keeps its IP address and sessions. With cached keys this takes a few tens of milliseconds. This is the roam you perform in the lab: AP1 goes to monitor mode, LAPTOP1 reassociates to AP2 and stays in 10.10.20.0/24.</p>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:43:a6:9a:00
AP          : <span class="hl">AP2</span>
Band/channel: 2.4 GHz / 1
Signal      : -65 dBm
IP address  : <span class="hl">10.10.20.11/24</span> (DHCP)</pre>

<h3>Mobility groups</h3>
<p>For roaming between controllers, the controllers must know each other. A <b>mobility group</b> is a set of controllers (up to 24) configured with the same group name, each listing the others as <b>mobility peers</b> (MAC and IP address). Peers exchange client context over the <b>mobility tunnel</b>: CAPWAP-based on current controllers, UDP 16666 for control and UDP 16667 for data (older AireOS releases used EtherIP, IP protocol 97, for data). Controllers in the same group share client keys, enabling fast secure roaming across them. The same WLAN (SSID, security, profile) and the same virtual interface address must exist on all of them. A controller can also know peers in other groups (a <b>mobility domain</b> or list); roaming works there too, but without key sharing, so the client re-authenticates.</p>

<h3>Layer 2 inter-controller roaming</h3>
<p>The client moves from an AP on WLC-A to an AP on WLC-B, and on both controllers the WLAN maps to the <b>same VLAN/subnet</b>. The new controller learns from its peer that the client exists, the client entry <b>moves</b> to WLC-B, and WLC-B now bridges the client's traffic onto the same VLAN. The client keeps its IP address; no tunnel between controllers is needed for data afterwards.</p>

<h3>Layer 3 inter-controller roaming: anchor and foreign</h3>
<p>If the WLAN maps to <b>different subnets</b> on the two controllers, the client would need a new address, breaking sessions. Instead:</p>
<ul><li>The original controller becomes the <b>anchor</b>: it keeps the client's point of attachment and IP address in its VLAN.</li>
<li>The new controller becomes the <b>foreign</b>: it handles the AP and the radio side.</li>
<li>Client traffic travels AP → foreign → mobility tunnel → anchor → anchor's VLAN, and the return traffic comes back the same way (<b>symmetric tunnelling</b>, the default, which keeps firewalls and uRPF happy).</li></ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Layer 3 roam with anchor and foreign">
<rect x="60" y="20" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="140" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC-A = anchor</text><text x="140" y="57" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20, 10.10.20.0/24</text>
<rect x="420" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="500" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC-B = foreign</text><text x="500" y="57" text-anchor="middle" class="svg-muted" font-size="12">VLAN 120, other subnet</text>
<line x1="220" y1="42" x2="420" y2="42" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">mobility tunnel UDP 16666/16667</text>
<rect x="80" y="140" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="140" y="163" text-anchor="middle" class="svg-ink" font-size="13">AP on WLC-A</text>
<rect x="440" y="140" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="500" y="163" text-anchor="middle" class="svg-ink" font-size="13">AP on WLC-B</text>
<line x1="140" y1="140" x2="140" y2="64" stroke="#64748b"/><line x1="500" y1="140" x2="500" y2="64" stroke="#64748b"/>
<rect x="250" y="190" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="213" text-anchor="middle" class="svg-ink" font-size="13">client 10.10.20.11</text>
<line x1="250" y1="200" x2="200" y2="170" stroke="#64748b" stroke-dasharray="4 4"/><line x1="390" y1="200" x2="440" y2="170" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">walks →</text>
</svg><p class="cap">After a Layer 3 roam the client keeps 10.10.20.11; its traffic is tunnelled from the foreign back to the anchor.</p></div>

<h3>Guest anchor (auto-anchor)</h3>
<p>The same machinery is used on purpose for guests. The guest WLAN on every campus controller (the foreign, "export foreign") is statically anchored to a controller in the DMZ (the "export anchor"). Every guest's traffic is tunnelled to the DMZ controller, which gives out guest addresses and handles web authentication, so guest VLANs never touch the internal network. The mobility tunnel ports must be open through the firewall.</p>

<table class="cmp"><tr><th>Roam type</th><th>Subnet</th><th>Client entry</th><th>Data path afterwards</th></tr>
<tr><td>Intra-controller</td><td>Same</td><td>Updated on the same WLC</td><td>Unchanged</td></tr>
<tr><td>L2 inter-controller</td><td>Same VLAN/subnet on both</td><td>Moved to the new WLC</td><td>New WLC bridges locally</td></tr>
<tr><td>L3 inter-controller</td><td>Different</td><td>Anchor keeps it, foreign serves the AP</td><td>Tunnelled foreign ↔ anchor</td></tr>
<tr><td>Guest auto-anchor</td><td>DMZ subnet</td><td>Always anchored in the DMZ</td><td>Always tunnelled to the anchor</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Building 1 uses WLC-A (NK-STAFF → VLAN 20, 10.10.20.0/24); building 2 uses WLC-B (NK-STAFF → VLAN 120, 10.20.20.0/24). Both are in mobility group NK-CAMPUS. A user on a video call walks from building 1 to building 2. The laptop roams to a WLC-B AP; WLC-B asks its peers, learns WLC-A owns the client, and becomes foreign. The laptop keeps 10.10.20.11 and the call continues. If the groups were different, the laptop would still keep its address but would need a full 802.1X authentication, and the call might freeze for a second.</p></div>

<pre class="code"><span class="c">! Lab 1, task 5: before AP1 goes to monitor mode (GUI: Monitoring &gt; Wireless &gt; Clients &gt; LAPTOP1)</span>
WLC1# show wireless client mac-address 0050.2fe9.9a01 detail</pre>
<pre class="out">Client MAC Address : 0050.2fe9.9a01
Client IPv4 Address: 10.10.20.11
AP Name            : <span class="hl">AP1</span>
WLAN Profile Name  : NK-STAFF
Policy Profile     : PP-STAFF
VLAN               : 20
Mobility:
  Move Count                  : <span class="hl">0</span>
  Mobility Role               : Local
  Mobility Roam Type          : None</pre>
<p>Run it again after the roam: the AP name changes to AP2 while the VLAN and the IP address stay the same, which is what a Layer 2 intra-controller roam looks like. (A Layer 3 roam would show a different role, anchor or foreign, and is practised in module wl-mobility (Roaming, mobility and anchoring); it is concept only in this lab.)</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Different virtual interface addresses or different WLAN security on peer controllers: mobility fails and clients re-DHCP. (2) Firewall blocking UDP 16666/16667 between controllers or to the guest anchor. (3) Expecting 802.11k/v to force a sticky client to roam: they are suggestions.</p></div>

<div class="exam"><p><b>Exam traps.</b> In an L3 roam the client <b>keeps</b> its IP address; the anchor is the original controller, the foreign is the new one. In an L2 inter-controller roam, the client entry moves and no data tunnel remains. Symmetric tunnelling returns traffic through the anchor. Mobility groups share keys; roaming between groups needs full re-authentication.</p></div>

<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 1, task 5 (roam). Monitoring &gt; Wireless &gt; Clients &gt; LAPTOP1: note the AP name and the VLAN. Put AP1 in monitor mode (Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General &gt; AP Mode) and open the same client page again: AP2, same VLAN 20, same IP. That is the intra-controller roam. Layer 3 roaming, anchors and mobility peers are concept only in this lab: practise them in wl-mobility (Roaming, mobility and anchoring).</p></div>

<div class="scn"><h4>The calls that dropped at the bridge</h4><p>A campus had two controllers, one per building, joined by a glass skywalk. Voice calls dropped every time someone crossed the skywalk. The client details on the second controller showed the phones getting a new DHCP address from building 2's subnet. The controllers were not mobility peers: someone had typed the group name as "NK-Campus" on one and "NK-CAMPUS" on the other. With matching group names and each controller added as a peer (mobility status "Up"), the next crossing showed the phone as "Foreign" on WLC-B with its old address, and calls survived.</p><p><b>Lesson:</b> seamless Layer 3 roaming depends on correct mobility peering; check mobility status before blaming RF.</p></div>

<div class="iv"><p class="q">"Explain Layer 2 versus Layer 3 roaming on controllers."</p><p>Strong answer: L2 roaming is when the new controller has the WLAN on the same subnet; the client entry simply moves and the client keeps its IP. L3 roaming is when the new controller's WLAN is on a different subnet; to avoid readdressing, the original controller stays anchor, the new one becomes foreign, and traffic is tunnelled symmetrically over the mobility tunnel (UDP 16666/16667). Mention mobility groups, key sharing for fast roaming, and guest auto-anchor as a planned use of the same mechanism.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The client decides to roam; 802.11k (neighbour reports) and 802.11v (transition requests) only assist.</li>
<li>Intra-controller: database update, same IP. L2 inter-controller: client entry moves, same subnet.</li>
<li>L3 inter-controller: anchor keeps the IP, foreign serves the AP, traffic tunnelled symmetrically.</li>
<li>Mobility group: same name, peers configured, same WLANs and virtual IP, UDP 16666/16667 open.</li>
<li>Guest auto-anchor tunnels guest WLAN traffic to a DMZ controller by design.</li>
</ul></div>
`,hi:`
<p>CCNA mein aapne seekha ki roam karne ka faisla client karta hai, AP nahi, aur ek controller ke andar client ka IP address same rehta hai. ENCOR poori picture maangta hai: jab client same controller ke APs ke beech, same subnet wale controllers ke beech (Layer 2 roam), aur alag subnets wale controllers ke beech (Layer 3 roam) move kare to controllers kya karte hain, plus guest anchor use case.</p>

<h3>Ek analogy: hotel branches ke beech shift hona</h3>
<p>Aap ek hotel mein check in karte ho aur room key aur mailbox (IP address) milta hai. Usi hotel ki doosri manzil par jaana aasaan hai: reception bas room number update karta hai (<b>intra-controller</b>). Usi sadak par same postal code wale sister hotel mein jaane par reception aapki file de deta hai aur aapki daak apne aap peeche aati hai (<b>Layer 2 inter-controller</b>). Doosre shehar ke sister hotel mein jaana alag hai: aapki daak ab bhi original hotel aati hai kyunki wahi aapka registered address hai, to original hotel (<b>anchor</b>) use naye hotel (<b>foreign</b>) ko forward karta hai aur aapki bhejne wali daak bhi apne through wapas bhejta hai.</p>

<h3>Client roam kyun karta hai</h3>
<p>Client scan karta hai (probe requests se actively, ya beacons sunkar passively) aur tab move karta hai jab current AP ka RSSI ya SNR uske apne threshold se neeche gire, aksar −70 se −75 dBm ke aas paas, ya jab retries dikhe aur behtar AP mile. Vendors alag hote hain, aur kuch clients "sticky" hote hain. Network sirf madad kar sakta hai:</p>
<ul><li><b>802.11k</b> (radio resource measurement): AP client ko <b>neighbour report</b> deta hai, paas ke APs aur unke channels ki chhoti list, taaki client har channel ki jagah sirf wahi scan kare.</li>
<li><b>802.11v</b> (BSS transition management): AP client ko behtar AP par jaane ka suggestion de sakta hai, ya disassociation imminent ke saath zor dekar keh sakta hai.</li>
<li><b>802.11r</b> (fast BSS transition) aur key caching roam ko tez banate hain; yeh keys ke baare mein hain aur chapter 11 mein hain.</li></ul>

<h3>Intra-controller roaming</h3>
<p>Dono APs same controller se joined hain. Client naye AP se reassociate karta hai; controller apna client database update karta hai (naya AP, same WLAN, same interface/VLAN) aur client ka IP address aur sessions same rehte hain. Cached keys ke saath isme kuch das milliseconds lagte hain. Yahi roam aap lab mein karte ho: AP1 monitor mode mein jaata hai, LAPTOP1 AP2 se reassociate karta hai aur 10.10.20.0/24 mein rehta hai.</p>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:43:a6:9a:00
AP          : <span class="hl">AP2</span>
Band/channel: 2.4 GHz / 1
Signal      : -65 dBm
IP address  : <span class="hl">10.10.20.11/24</span> (DHCP)</pre>

<h3>Mobility groups</h3>
<p>Controllers ke beech roaming ke liye controllers ko ek doosre ko jaanna padta hai. <b>Mobility group</b> controllers ka set hai (24 tak) jo same group name se configured hain, har ek baaki ko <b>mobility peers</b> (MAC aur IP address) ke roop mein list karta hai. Peers <b>mobility tunnel</b> par client context exchange karte hain: current controllers par CAPWAP-based, control ke liye UDP 16666 aur data ke liye UDP 16667 (purane AireOS releases data ke liye EtherIP, IP protocol 97, use karte the). Same group ke controllers client keys share karte hain, jisse unke beech fast secure roaming hoti hai. Sab par same WLAN (SSID, security, profile) aur same virtual interface address hona chahiye. Controller doosre groups ke peers ko bhi jaan sakta hai (<b>mobility domain</b> ya list); wahan bhi roaming hoti hai, par key sharing ke bina, isliye client dobara authenticate karta hai.</p>

<h3>Layer 2 inter-controller roaming</h3>
<p>Client WLC-A ke AP se WLC-B ke AP par jaata hai, aur dono controllers par WLAN <b>same VLAN/subnet</b> se mapped hai. Naya controller peer se seekhta hai ki client maujood hai, client entry WLC-B par <b>move</b> hoti hai, aur ab WLC-B client ka traffic same VLAN par bridge karta hai. Client ka IP address same rehta hai; baad mein data ke liye controllers ke beech tunnel ki zaroorat nahi.</p>

<h3>Layer 3 inter-controller roaming: anchor aur foreign</h3>
<p>Agar dono controllers par WLAN <b>alag subnets</b> se mapped hai, to client ko naya address chahiye hoga, jisse sessions toot jaayenge. Iske bajaaye:</p>
<ul><li>Original controller <b>anchor</b> banta hai: woh client ka point of attachment aur apne VLAN mein IP address rakhta hai.</li>
<li>Naya controller <b>foreign</b> banta hai: woh AP aur radio side sambhalta hai.</li>
<li>Client traffic AP → foreign → mobility tunnel → anchor → anchor ka VLAN jaata hai, aur return traffic usi raaste wapas aata hai (<b>symmetric tunnelling</b>, default, jo firewalls aur uRPF ko khush rakhta hai).</li></ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Anchor aur foreign ke saath Layer 3 roam">
<rect x="60" y="20" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="140" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC-A = anchor</text><text x="140" y="57" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20, 10.10.20.0/24</text>
<rect x="420" y="20" width="160" height="44" rx="8" fill="#bae6fd"/><text x="500" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC-B = foreign</text><text x="500" y="57" text-anchor="middle" class="svg-muted" font-size="12">VLAN 120, doosra subnet</text>
<line x1="220" y1="42" x2="420" y2="42" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">mobility tunnel UDP 16666/16667</text>
<rect x="80" y="140" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="140" y="163" text-anchor="middle" class="svg-ink" font-size="13">WLC-A ka AP</text>
<rect x="440" y="140" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="500" y="163" text-anchor="middle" class="svg-ink" font-size="13">WLC-B ka AP</text>
<line x1="140" y1="140" x2="140" y2="64" stroke="#64748b"/><line x1="500" y1="140" x2="500" y2="64" stroke="#64748b"/>
<rect x="250" y="190" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="213" text-anchor="middle" class="svg-ink" font-size="13">client 10.10.20.11</text>
<line x1="250" y1="200" x2="200" y2="170" stroke="#64748b" stroke-dasharray="4 4"/><line x1="390" y1="200" x2="440" y2="170" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">chalta hai →</text>
</svg><p class="cap">Layer 3 roam ke baad client 10.10.20.11 rakhta hai; uska traffic foreign se wapas anchor tak tunnel hota hai.</p></div>

<h3>Guest anchor (auto-anchor)</h3>
<p>Guests ke liye yahi machinery jaan-boojhkar use hoti hai. Har campus controller (foreign, "export foreign") par guest WLAN DMZ ke ek controller ("export anchor") se statically anchored hota hai. Har guest ka traffic DMZ controller tak tunnel hota hai, jo guest addresses deta hai aur web authentication sambhalta hai, isliye guest VLANs internal network ko chhoote hi nahi. Mobility tunnel ports firewall mein khule hone chahiye.</p>

<table class="cmp"><tr><th>Roam type</th><th>Subnet</th><th>Client entry</th><th>Baad ka data path</th></tr>
<tr><td>Intra-controller</td><td>Same</td><td>Same WLC par update</td><td>Wahi</td></tr>
<tr><td>L2 inter-controller</td><td>Dono par same VLAN/subnet</td><td>Naye WLC par move</td><td>Naya WLC locally bridge karta hai</td></tr>
<tr><td>L3 inter-controller</td><td>Alag</td><td>Anchor rakhta hai, foreign AP serve karta hai</td><td>Foreign ↔ anchor tunnel</td></tr>
<tr><td>Guest auto-anchor</td><td>DMZ subnet</td><td>Hamesha DMZ mein anchored</td><td>Hamesha anchor tak tunnel</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Building 1 WLC-A use karti hai (NK-STAFF → VLAN 20, 10.10.20.0/24); building 2 WLC-B (NK-STAFF → VLAN 120, 10.20.20.0/24). Dono mobility group NK-CAMPUS mein hain. Video call par ek user building 1 se building 2 chalta hai. Laptop WLC-B ke AP par roam karta hai; WLC-B apne peers se poochta hai, seekhta hai ki client WLC-A ka hai, aur foreign ban jaata hai. Laptop 10.10.20.11 rakhta hai aur call chalti rehti hai. Agar groups alag hote, laptop address to rakhta par use poora 802.1X authentication karna padta, aur call ek second ke liye atak sakti thi.</p></div>

<pre class="code"><span class="c">! Lab 1, task 5: AP1 ke monitor mode mein jaane se pehle (GUI: Monitoring &gt; Wireless &gt; Clients &gt; LAPTOP1)</span>
WLC1# show wireless client mac-address 0050.2fe9.9a01 detail</pre>
<pre class="out">Client MAC Address : 0050.2fe9.9a01
Client IPv4 Address: 10.10.20.11
AP Name            : <span class="hl">AP1</span>
WLAN Profile Name  : NK-STAFF
Policy Profile     : PP-STAFF
VLAN               : 20
Mobility:
  Move Count                  : <span class="hl">0</span>
  Mobility Role               : Local
  Mobility Roam Type          : None</pre>
<p>Roam ke baad ise dobara chalao: AP name AP2 ho jaata hai jabki VLAN aur IP address wahi rehte hain, yahi Layer 2 intra-controller roam ka roop hai. (Layer 3 roam mein alag role, anchor ya foreign, dikhta hai, aur woh module wl-mobility (Roaming, mobility and anchoring) mein practise hota hai; is lab mein concept only hai.)</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Peer controllers par alag virtual interface addresses ya alag WLAN security: mobility fail aur clients dobara DHCP karte hain. (2) Controllers ke beech ya guest anchor tak UDP 16666/16667 block karta firewall. (3) Expect karna ki 802.11k/v sticky client ko roam karne par majboor karenge: yeh sirf suggestions hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> L3 roam mein client apna IP address <b>rakhta</b> hai; anchor original controller hai, foreign naya. L2 inter-controller roam mein client entry move hoti hai aur koi data tunnel nahi bachta. Symmetric tunnelling traffic anchor ke through wapas bhejta hai. Mobility groups keys share karte hain; groups ke beech roaming mein poora re-authentication chahiye.</p></div>

<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 1, task 5 (roam). Monitoring &gt; Wireless &gt; Clients &gt; LAPTOP1: AP name aur VLAN note karo. AP1 ko monitor mode mein daalo (Configuration &gt; Wireless &gt; Access Points &gt; AP1 &gt; General &gt; AP Mode) aur wahi client page dobara kholo: AP2, wahi VLAN 20, wahi IP. Yahi intra-controller roam hai. Layer 3 roaming, anchors aur mobility peers is lab mein concept only hain: inhe wl-mobility (Roaming, mobility and anchoring) mein practise karo.</p></div>

<div class="scn"><h4>Pul par drop hoti calls</h4><p>Ek campus mein do controllers the, har building ke liye ek, jo glass skywalk se jude the. Jab bhi koi skywalk cross karta, voice calls drop hoti. Doosre controller par client details mein phones building 2 ke subnet se naya DHCP address lete dikhe. Controllers mobility peers nahi the: kisi ne ek par group name "NK-Campus" aur doosre par "NK-CAMPUS" type kiya tha. Matching group names aur har controller ko peer ke roop mein jodne ke baad (mobility status "Up"), agli crossing par phone WLC-B par apne purane address ke saath "Foreign" dikha, aur calls bach gayi.</p><p><b>Lesson:</b> seamless Layer 3 roaming sahi mobility peering par depend karti hai; RF ko blame karne se pehle mobility status check karo.</p></div>

<div class="iv"><p class="q">"Controllers par Layer 2 vs Layer 3 roaming samjhao."</p><p>Strong answer: L2 roaming tab hai jab naye controller par WLAN same subnet par ho; client entry bas move hoti hai aur client ka IP same rehta hai. L3 roaming tab hai jab naye controller ka WLAN alag subnet par ho; readdressing se bachne ke liye original controller anchor rehta hai, naya foreign banta hai, aur traffic mobility tunnel (UDP 16666/16667) par symmetrically tunnel hota hai. Mobility groups, fast roaming ke liye key sharing, aur guest auto-anchor ko usi mechanism ke planned use ke roop mein batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roam ka faisla client karta hai; 802.11k (neighbour reports) aur 802.11v (transition requests) sirf madad karte hain.</li>
<li>Intra-controller: database update, same IP. L2 inter-controller: client entry move, same subnet.</li>
<li>L3 inter-controller: anchor IP rakhta hai, foreign AP serve karta hai, traffic symmetrically tunnel.</li>
<li>Mobility group: same naam, peers configured, same WLANs aur virtual IP, UDP 16666/16667 khule.</li>
<li>Guest auto-anchor design se guest WLAN traffic ko DMZ controller tak tunnel karta hai.</li>
</ul></div>
`}};export{e as default};