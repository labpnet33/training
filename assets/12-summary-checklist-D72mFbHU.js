var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This module followed one client and one network from the first roam to a whole-controller failure. Use this chapter as your revision sheet. It lists what you must be able to do, the vocabulary, the facts that questions love, and the commands in one place. The skills here are the ones that professional-level wireless roles and exams test around mobility and high availability; this course teaches the skills, it does not replace the official exam material.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Client roams</text><text x="105" y="54" text-anchor="middle" class="svg-ink" font-size="11">r, k, v help the client</text>
<rect x="225" y="10" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Controllers cooperate</text><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="11">group, peers, tunnels</text>
<rect x="440" y="10" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="13">Address kept</text><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="11">L2 roam / L3 roam via anchor</text>
<rect x="10" y="110" width="190" height="60" rx="8" fill="#fde68a"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="13">Guest anchor</text><text x="105" y="154" text-anchor="middle" class="svg-ink" font-size="11">export anchor in a DMZ</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">AP failover</text><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="11">list, fallback, join priority</text>
<rect x="440" y="110" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="535" y="136" text-anchor="middle" class="svg-ink" font-size="13">HA SSO and N+1</text><text x="535" y="154" text-anchor="middle" class="svg-ink" font-size="11">RP, RMI, capacity, licences</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Foundation (peer Up) first; troubleshoot from the bottom up.</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each one only if you can do it without notes.</p>
<ul>
<li>Explain the difference between roaming (client) and mobility (controllers), and name the four roam outcomes.</li>
<li>Build a mobility group between two controllers (name, members, both sides) and prove Status Up.</li>
<li>Name the ports (UDP 16666 control, UDP 16667 data) and the five causes of a Down peer.</li>
<li>Tell an L2 from an L3 roam, name anchor and foreign, and prove them with client detail and statistics.</li>
<li>Configure a guest anchor on both controllers (policy profile, export anchor, matching names) and list the anchor checklist.</li>
<li>Give APs a primary and secondary controller, test a failover, and explain why the client address can change.</li>
<li>Describe 802.11r, k and v, OKC and PMK caching in one sentence each.</li>
<li>Explain HA SSO: Active, Standby-Hot, RP, RMI, what is synchronised, what is not.</li>
<li>Compare SSO, N+1 and AP lists, and size a backup controller.</li>
<li>Explain AireOS versus 9800 smart licensing in outline.</li>
<li>Troubleshoot in order: peer, client, anchor, AP list, log.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Anchor / foreign</dt><dd>Home controller of a client or guest / the controller whose AP the client uses now.</dd>
<dt>Export anchor</dt><dd>A policy profile on the anchor that accepts clients tunnelled from foreign controllers.</dd>
<dt>Mobility group / domain</dt><dd>Named set of trusted controllers / all controllers that know each other.</dd>
<dt>Mobility peer</dt><dd>A member controller, identified by its wireless management IP.</dd>
<dt>Control path / data path</dt><dd>UDP 16666 (DTLS) messages / UDP 16667 client traffic.</dd>
<dt>Hard roam</dt><dd>A roam without mobility: new association, new address.</dd>
<dt>FT (802.11r)</dt><dd>Fast BSS Transition with PMK-R0 and PMK-R1 keys.</dd>
<dt>802.11k / 802.11v</dt><dd>Neighbour reports / BSS transition suggestions.</dd>
<dt>OKC</dt><dd>Opportunistic key caching: PMK shared with other APs.</dd>
<dt>Primary / secondary / tertiary</dt><dd>The controller list of an AP, tried before normal discovery.</dd>
<dt>Fallback</dt><dd>AP returns to its primary when it is back.</dd>
<dt>AP priority 1 to 4</dt><dd>Which APs join first when a controller is full (4 is critical).</dd>
<dt>HA SSO</dt><dd>Stateful pair, Active plus Standby-Hot.</dd>
<dt>RP / RMI</dt><dd>State and heartbeat link / management IP and gateway check.</dd>
<dt>N+1</dt><dd>One spare controller for N primaries, no state sync.</dd>
<dt>Smart Licensing Using Policy</dt><dd>9800 licence model that reports usage by policy instead of staying connected.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>The client decides to roam; 802.11k gives information, 802.11v gives a suggestion, 802.11r speeds the keys.</li>
<li>Same controller roams need no mobility peer. Different controllers need an Up peer.</li>
<li>Same VLAN ID on both sides is treated as the same subnet (L2 roam); different VLAN IDs make an L3 roam with a tunnel to the anchor.</li>
<li>A peer is configured on <b>both</b> controllers, with matching group names, reachable both ways, with matching data-link-encryption.</li>
<li>The 9800 mobility ports are UDP 16666 and UDP 16667; legacy AireOS data used EoIP, IP protocol 97.</li>
<li>Guest anchor: foreign policy profile has <code>mobility anchor &lt;ip&gt;</code>; anchor policy profile has <code>mobility anchor</code> (export anchor); the profile names must match; up to three anchors with priorities.</li>
<li>Policy profiles and WLANs must be shut down before most edits.</li>
<li>AP failover list comes before option 43, DNS and broadcast; AP failover is not stateful.</li>
<li>HA SSO: RP carries state and heartbeat; RMI gives management and gateway check; one management IP and mobility MAC; no preemption; capacity of one controller.</li>
<li>N+1 backup must hold the largest primary, with config and tags staged and licences planned for the failure case.</li>
</ol>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! mobility group (both controllers)</span>
wireless mobility group name NK-CAMPUS
wireless mobility group member ip 10.20.99.10 public-ip 10.20.99.10 group NK-CAMPUS [data-link-encryption]
wireless mobility dscp 48
wireless mobility group keepalive interval 10
wireless mobility group keepalive count 3
<span class="c">! guest anchor (policy profile shut down while editing)</span>
wireless profile policy PP-GUEST
 mobility anchor 10.10.99.10        <span class="c">! foreign side</span>
 mobility anchor                    <span class="c">! anchor side (export anchor)</span>
<span class="c">! AP controller list (exec)</span>
ap name AP1 controller primary WLC1 10.10.99.10
ap name AP1 controller secondary WLC2 10.20.99.10
<span class="c">! concept only</span>
redundancy / mode sso      chassis 1 priority 2      redun-management interface Vlan99 ...
ap name AP1 priority 4</pre>
<pre class="out">show wireless mobility summary
show wireless mobility peer [ip &lt;ip&gt;]
show wireless mobility statistics
show wireless mobility anchor
show wireless client mac-address &lt;mac&gt; detail
show wireless profile policy detailed &lt;name&gt;
show ap summary
show ap name &lt;ap&gt; config general
show logging | include MOBILITY
show redundancy        show chassis rmi        (concept only)</pre>

<div class="eg"><p><b>Worked example: revision drill.</b> Draw the two-city topology from memory. Mark the management IPs, the staff VLANs 20 and 120, the guest VLANs 50 and 150, the tunnel, and which controller is the anchor for staff and for guests. Then write the one command or setting that would break each of the six labs. If you can do that in five minutes, you know the module.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on test day.</b> Calling a client's current controller the anchor; saying the 9800 uses protocol 97; forgetting that the peer must be configured on both sides; assuming N+1 keeps sessions; assuming an SSO pair doubles AP capacity.</p></div>

<div class="exam"><p><b>Exam trap summary.</b> Read the verb: "no client interruption" means SSO; "lowest cost" means N+1; "client keeps IP in another subnet" means an L3 roam through an anchor; "guest must not touch the branch LAN" means a DMZ anchor; "which side has the export setting" means the anchor.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate was asked to design wireless for two campuses and 30 branches with guest access and no session loss at HQ. They drew SSO pairs at each campus, N+1 from campus to campus, a pair of DMZ anchors for guests, mobility groups per campus, AP controller lists with fallback and critical AP priority, and capacity numbers on the backup. They finished by describing how they would test each failover. The panel hired them on the spot.</p><p><b>Lesson:</b> this module is a design vocabulary; use all of it together.</p></div>

<div class="iv"><p class="q">"Summarise in one minute how a Catalyst 9800 network keeps a user connected when they move or when a controller fails."</p><p>The client chooses to roam, helped by k, v and r. Controllers in a mobility group share client context over control and data tunnels, so a roam to another controller keeps the address (L2 if the VLAN matches, L3 through an anchor if not). Guests are anchored on purpose to a DMZ controller. For failures, APs carry controller lists and fall back; SSO pairs keep APs and clients; N+1 shares one backup. Always size and license for the failure case, and troubleshoot from peer state upwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming is the client; mobility is the controllers; the peer must be Up first.</li>
<li>L2 roam: same VLAN; L3 roam: different VLAN with a tunnel to the anchor; hard roam: new address.</li>
<li>Guest anchor: foreign anchor entry plus export-anchor profile, matching names, DMZ design.</li>
<li>AP lists give failover, SSO gives stateful failover, N+1 gives cheap failover; plan capacity and licences.</li>
<li>Troubleshoot bottom up and read the log.</li>
</ul></div>
`,hi:`
<p>Is module ne ek client aur ek network ko pehle roam se leke poore controller ke failure tak follow kiya. Is chapter ko apni revision sheet banao. Isme woh sab hai jo aapko aana chahiye: kya kar sakna hai, vocabulary, woh facts jo questions mein pasand kiye jaate hain, aur commands ek jagah. Yahan ki skills wahi hain jinhe professional-level wireless roles aur exams mobility aur high availability ke aas paas test karte hain; yeh course skills sikhata hai, official exam material ki jagah nahi leta.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Client roam karta hai</text><text x="105" y="54" text-anchor="middle" class="svg-ink" font-size="11">r, k, v client ki madad</text>
<rect x="225" y="10" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Controllers cooperate</text><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="11">group, peers, tunnels</text>
<rect x="440" y="10" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="13">Address kept</text><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="11">L2 roam / anchor se L3 roam</text>
<rect x="10" y="110" width="190" height="60" rx="8" fill="#fde68a"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="13">Guest anchor</text><text x="105" y="154" text-anchor="middle" class="svg-ink" font-size="11">DMZ mein export anchor</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">AP failover</text><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="11">list, fallback, join priority</text>
<rect x="440" y="110" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="535" y="136" text-anchor="middle" class="svg-ink" font-size="13">HA SSO aur N+1</text><text x="535" y="154" text-anchor="middle" class="svg-ink" font-size="11">RP, RMI, capacity, licences</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Pehle buniyad (peer Up); troubleshoot neeche se upar.</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<p>Har ek tabhi tick karo jab bina notes ke kar sako.</p>
<ul>
<li>Roaming (client) aur mobility (controllers) ka farak samjhao, aur chaar roam outcomes ke naam batao.</li>
<li>Do controllers ke beech mobility group banao (name, members, dono sides) aur Status Up prove karo.</li>
<li>Ports (UDP 16666 control, UDP 16667 data) aur Down peer ke paanch causes ke naam batao.</li>
<li>L2 aur L3 roam mein farak batao, anchor aur foreign ke naam lo, aur client detail aur statistics se prove karo.</li>
<li>Dono controllers par guest anchor configure karo (policy profile, export anchor, matching names) aur anchor checklist list karo.</li>
<li>APs ko primary aur secondary controller do, failover test karo, aur samjhao ki client address kyun badal sakta hai.</li>
<li>802.11r, k aur v, OKC aur PMK caching ko ek ek vaakya mein describe karo.</li>
<li>HA SSO samjhao: Active, Standby-Hot, RP, RMI, kya synchronise hota hai, kya nahi.</li>
<li>SSO, N+1 aur AP lists ko compare karo, aur backup controller size karo.</li>
<li>AireOS versus 9800 smart licensing outline mein samjhao.</li>
<li>Order mein troubleshoot karo: peer, client, anchor, AP list, log.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Anchor / foreign</dt><dd>Client ya guest ka home controller / woh controller jiske AP ko client abhi use kar raha hai.</dd>
<dt>Export anchor</dt><dd>Anchor par ek policy profile jo foreign controllers se tunnel hokar aaye clients accept karta hai.</dd>
<dt>Mobility group / domain</dt><dd>Trusted controllers ka named set / woh sab controllers jo ek doosre ko jaante hain.</dd>
<dt>Mobility peer</dt><dd>Ek member controller, jo uske wireless management IP se pehchana jata hai.</dd>
<dt>Control path / data path</dt><dd>UDP 16666 (DTLS) messages / UDP 16667 client traffic.</dd>
<dt>Hard roam</dt><dd>Mobility ke bina roam: naya association, naya address.</dd>
<dt>FT (802.11r)</dt><dd>PMK-R0 aur PMK-R1 keys ke saath Fast BSS Transition.</dd>
<dt>802.11k / 802.11v</dt><dd>Neighbour reports / BSS transition suggestions.</dd>
<dt>OKC</dt><dd>Opportunistic key caching: PMK doosre APs ke saath share hota hai.</dd>
<dt>Primary / secondary / tertiary</dt><dd>AP ki controller list, jo normal discovery se pehle try hoti hai.</dd>
<dt>Fallback</dt><dd>Primary wapas aane par AP use lauta jaata hai.</dd>
<dt>AP priority 1 se 4</dt><dd>Controller full ho to kaun se APs pehle join karein (4 critical hai).</dd>
<dt>HA SSO</dt><dd>Stateful pair, Active plus Standby-Hot.</dd>
<dt>RP / RMI</dt><dd>State aur heartbeat link / management IP aur gateway check.</dd>
<dt>N+1</dt><dd>N primaries ke liye ek spare controller, state sync nahi.</dd>
<dt>Smart Licensing Using Policy</dt><dd>9800 licence model jo connected rehne ki jagah policy se usage report karta hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>Client roam karne ka decision leta hai; 802.11k information deta hai, 802.11v suggestion deta hai, 802.11r keys tez karta hai.</li>
<li>Same controller roams ko mobility peer nahi chahiye. Alag controllers ko Up peer chahiye.</li>
<li>Dono sides par same VLAN ID ko same subnet maana jata hai (L2 roam); alag VLAN IDs anchor tak tunnel ke saath L3 roam banate hain.</li>
<li>Peer <b>dono</b> controllers par configured hota hai, matching group names ke saath, dono taraf reachable, matching data-link-encryption ke saath.</li>
<li>9800 mobility ports UDP 16666 aur UDP 16667 hain; legacy AireOS data EoIP, IP protocol 97 use karta tha.</li>
<li>Guest anchor: foreign policy profile mein <code>mobility anchor &lt;ip&gt;</code>; anchor policy profile mein <code>mobility anchor</code> (export anchor); profile names match hone chahiye; priorities ke saath teen tak anchors.</li>
<li>Zyada tar edits se pehle policy profiles aur WLANs shut honi chahiye.</li>
<li>AP failover list option 43, DNS aur broadcast se pehle aati hai; AP failover stateful nahi hai.</li>
<li>HA SSO: RP state aur heartbeat carry karta hai; RMI management aur gateway check deta hai; ek management IP aur mobility MAC; preemption nahi; ek controller ki capacity.</li>
<li>N+1 backup sabse bade primary ko hold kare, config aur tags staged ho, aur failure case ke licences planned.</li>
</ol>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! mobility group (dono controllers)</span>
wireless mobility group name NK-CAMPUS
wireless mobility group member ip 10.20.99.10 public-ip 10.20.99.10 group NK-CAMPUS [data-link-encryption]
wireless mobility dscp 48
wireless mobility group keepalive interval 10
wireless mobility group keepalive count 3
<span class="c">! guest anchor (edit ke dauran policy profile shut)</span>
wireless profile policy PP-GUEST
 mobility anchor 10.10.99.10        <span class="c">! foreign side</span>
 mobility anchor                    <span class="c">! anchor side (export anchor)</span>
<span class="c">! AP controller list (exec)</span>
ap name AP1 controller primary WLC1 10.10.99.10
ap name AP1 controller secondary WLC2 10.20.99.10
<span class="c">! concept only</span>
redundancy / mode sso      chassis 1 priority 2      redun-management interface Vlan99 ...
ap name AP1 priority 4</pre>
<pre class="out">show wireless mobility summary
show wireless mobility peer [ip &lt;ip&gt;]
show wireless mobility statistics
show wireless mobility anchor
show wireless client mac-address &lt;mac&gt; detail
show wireless profile policy detailed &lt;name&gt;
show ap summary
show ap name &lt;ap&gt; config general
show logging | include MOBILITY
show redundancy        show chassis rmi        (concept only)</pre>

<div class="eg"><p><b>Worked example: revision drill.</b> Do shehar wali topology yaad se draw karo. Management IPs, staff VLANs 20 aur 120, guest VLANs 50 aur 150, tunnel mark karo, aur batao ki staff aur guests ke liye kaun sa controller anchor hai. Phir woh ek command ya setting likho jo chhe labs mein se har ek ko tod de. Agar yeh paanch minute mein kar lo, to module aa gaya.</p></div>

<div class="warn"><p><b>Test day par bachne wali common mistakes.</b> Client ke current controller ko anchor kehna; 9800 ke liye protocol 97 bolna; yeh bhoolna ki peer dono sides par configure hota hai; N+1 se sessions bachne ka maan lena; SSO pair se AP capacity double hone ka maan lena.</p></div>

<div class="exam"><p><b>Exam trap summary.</b> Verb padho: "no client interruption" matlab SSO; "lowest cost" matlab N+1; "client doosre subnet mein IP rakhta hai" matlab anchor ke zariye L3 roam; "guest branch LAN ko na chhue" matlab DMZ anchor; "export setting kis side par hai" matlab anchor.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>Ek candidate se do campuses aur 30 branches ke liye guest access ke saath wireless design karne ko kaha gaya, HQ par session loss ke bina. Unhone har campus par SSO pairs, campus se campus N+1, guests ke liye DMZ anchors ki pair, har campus ke liye mobility groups, fallback ke saath AP controller lists aur critical AP priority, aur backup par capacity numbers draw kiye. End mein unhone describe kiya ki har failover kaise test karenge. Panel ne unhe wahin hire kar liya.</p><p><b>Lesson:</b> yeh module ek design vocabulary hai; sab ko saath use karo.</p></div>

<div class="iv"><p class="q">"Ek minute mein samjhao ki Catalyst 9800 network user ko kaise connected rakhta hai jab woh move kare ya controller fail ho."</p><p>Client roam karne ka decision leta hai, k, v aur r ki madad se. Mobility group ke controllers control aur data tunnels par client context share karte hain, isliye doosre controller par roam address rakhta hai (VLAN match ho to L2, warna anchor ke zariye L3). Guests jaan boojh kar DMZ controller par anchor hote hain. Failures ke liye APs ke paas controller lists aur fallback hote hain; SSO pairs APs aur clients ko bachate hain; N+1 ek backup share karta hai. Hamesha failure case ke liye size aur license karo, aur peer state se upar ki taraf troubleshoot karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming client hai; mobility controllers hain; pehle peer Up hona chahiye.</li>
<li>L2 roam: same VLAN; L3 roam: alag VLAN, anchor tak tunnel ke saath; hard roam: naya address.</li>
<li>Guest anchor: foreign anchor entry plus export-anchor profile, matching names, DMZ design.</li>
<li>AP lists failover deti hain, SSO stateful failover deta hai, N+1 sasta failover deta hai; capacity aur licences plan karo.</li>
<li>Neeche se upar troubleshoot karo aur log padho.</li>
</ul></div>
`}};export{e as default};