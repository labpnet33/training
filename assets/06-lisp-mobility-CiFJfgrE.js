var e={id:`lisp-mobility`,h:{en:`LISP use cases: host mobility, multihoming and non-LISP sites`,hi:`LISP use cases: host mobility, multihoming aur non-LISP sites`},body:{en:`
<p>When you move house in India you file a change of address with the post office. Letters still carry your old street for a while, but the old post office forwards them and tells the senders your new address. LISP host mobility does exactly this: the host keeps its IP (identity), the mapping system learns the new location, and the old site redirects anyone who still has stale information.</p>

<h3>Use case 1: host mobility (the one interviewers ask about)</h3>
<p>A VM with IP 10.9.9.50 runs in DC1 behind xTR-A (RLOC 100.64.1.2). It is migrated to DC2 behind xTR-B (RLOC 100.64.2.2) without changing its IP. The subnet 10.9.9.0/24 is configured as a <b>dynamic-EID</b> range on both xTRs, and the map-server accepts more-specific host registrations inside it.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="LISP host mobility">
<rect x="250" y="14" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">MS/MR</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.9.9.50/32 → B</text>
<rect x="40" y="110" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="132" text-anchor="middle" class="svg-ink" font-size="13">xTR-A (DC1)</text><text x="115" y="148" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.2, away entry</text>
<rect x="450" y="110" width="150" height="46" rx="8" fill="#bae6fd"/><text x="525" y="132" text-anchor="middle" class="svg-ink" font-size="13">xTR-B (DC2)</text><text x="525" y="148" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.2</text>
<rect x="250" y="210" width="140" height="46" rx="8" fill="#fde68a"/><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Remote ITR</text><text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">stale cache → A</text>
<rect x="470" y="200" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="12">VM 10.9.9.50</text>
<line x1="525" y1="156" x2="525" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="525" y1="110" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><text x="490" y="74" class="svg-accent" font-size="12">1 register /32</text>
<line x1="250" y1="50" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><text x="110" y="76" class="svg-accent" font-size="12">2 Map-Notify</text>
<line x1="250" y1="230" x2="115" y2="156" stroke="#64748b" stroke-width="2"/><text x="120" y="205" class="svg-accent" font-size="12">3 data to A, 4 SMR back</text>
<line x1="390" y1="230" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="400" y="185" class="svg-accent" font-size="12">5 re-resolve → B</text>
</svg><p class="cap">After the move: register, notify the old site, redirect stale ITRs, re-resolve.</p></div>
<ol>
<li><b>Detect.</b> xTR-B sees traffic or an ARP from 10.9.9.50 on its interface configured with <code>lisp mobility</code>. It recognises the address as inside its dynamic-EID range.</li>
<li><b>Register.</b> xTR-B sends a Map-Register for the host route 10.9.9.50/32 with RLOC 100.64.2.2.</li>
<li><b>Notify.</b> The map-server sees that this /32 was previously registered by xTR-A and sends a <b>Map-Notify</b> to xTR-A. xTR-A removes the host from its local database and installs an "away" entry: 10.9.9.50 is now elsewhere.</li>
<li><b>Redirect.</b> A remote ITR still has 10.9.9.50 cached with RLOC 100.64.1.2 and keeps sending to xTR-A. xTR-A answers with a <b>Solicit-Map-Request (SMR)</b>: "your cache is stale".</li>
<li><b>Re-resolve.</b> The remote ITR sends a fresh Map-Request, receives RLOC 100.64.2.2 and updates its map-cache. Sessions survive because the VM's IP never changed.</li>
</ol>
<pre class="code"><span class="c">! on both data center xTRs (classic syntax, concept level)</span>
router lisp
 eid-table default instance-id 0
  dynamic-eid VM-MOVE
   database-mapping 10.9.9.0/24 100.64.1.2 priority 1 weight 100
   exit
interface Vlan99
 lisp mobility VM-MOVE
<span class="c">! on the map-server: allow /32s inside the range</span>
router lisp
 site DC-SITES
  authentication-key NK-LISP
  eid-prefix 10.9.9.0/24 accept-more-specifics</pre>
<pre class="out">MSMR# show lisp site
Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
DC-SITES       never     no     --                            10.9.9.0/24
<span class="hl">               00:00:12  yes    100.64.2.2:40122              10.9.9.50/32</span></pre>
<p>Two flavours exist. In <b>Across Subnet Mode</b> the subnet exists only in a routed way on each side, so no Layer 2 extension is needed. In <b>Extended Subnet Mode</b> the subnet is also stretched at Layer 2 (for example with VXLAN or OTV) and LISP only optimises the inbound path.</p>

<h3>Use case 2: multihoming and ingress traffic engineering</h3>
<p>A site with two ISPs registers one EID prefix with two RLOCs. Remote ITRs obey the priorities and weights that the <b>destination</b> site published, so the destination controls how traffic comes in. No AS-path prepending, no de-aggregation, and the global table does not grow.</p>

<h3>Use case 3: talking to non-LISP sites</h3>
<ul>
<li><b>LISP site to Internet</b>: the ITR gets a Negative Map-Reply, then sends traffic natively, or encapsulates it to a <b>PETR</b> configured with <code>use-petr 100.64.9.1</code>, so the ISP never sees an unexpected EID source.</li>
<li><b>Internet to LISP site</b>: a <b>PITR</b> advertises an aggregate of the EID space into BGP, attracts the traffic, looks up the mapping and encapsulates toward the right ETR.</li>
</ul>

<h3>Use case 4: IPv6 and multitenancy</h3>
<p>EIDs and RLOCs can be different address families: IPv6 EIDs can cross an IPv4-only core, which makes LISP an IPv6 transition tool. With <b>instance IDs</b>, many VRFs share one mapping system and one core while keeping overlapping EIDs apart, which is the basis of SD-Access Virtual Networks.</p>

<div class="eg"><p><b>Worked example.</b> A remote ITR cached 10.9.9.50 at 100.64.1.2 with a 24-hour TTL. Without SMR it would keep sending to DC1 for up to 24 hours. With SMR, the first data packet that reaches xTR-A after the move triggers the SMR, and the ITR converges within about one round trip to the map-resolver, typically well under a second.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>accept-more-specifics</code> on the map-server. The /32 Map-Registers from the new site are rejected because only the /24 is allowed, so the move is never learned and traffic keeps going to the old data center.</p></div>

<div class="exam"><p><b>Exam trap.</b> In mobility, the <b>Map-Notify</b> goes from the MS to the <b>old</b> xTR, and the <b>SMR</b> goes from the old xTR to remote ITRs. Also, LISP mobility keeps the host's IP address; it is not DHCP renumbering.</p></div>

<div class="scn"><h4>Disaster recovery without readdressing</h4><p>A bank tested moving its payment VMs from the primary data center to the DR site. Previously the DR plan included changing IPs and DNS, which took hours. After deploying LISP mobility with dynamic-EIDs on both sites, the VMs kept 10.9.9.0/24 addresses. During the test, branch ITRs showed the /32s flipping to the DR RLOC within seconds, and card transactions resumed without any DNS change.</p><p><b>Lesson:</b> separating identity from location turns a readdressing project into a routing update.</p></div>

<div class="iv"><p class="q">"How does LISP support VM mobility between data centers?"</p><p>Strong answer: configure the subnet as a dynamic-EID on the xTRs and allow more-specifics on the map-server. When the VM appears at the new site, that xTR registers a /32 for it. The MS sends a Map-Notify to the old xTR, which marks the host away. Remote ITRs with stale caches that still send to the old xTR get an SMR and re-resolve to the new RLOC. The VM keeps its IP, so sessions and firewall rules survive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mobility: dynamic-EID + accept-more-specifics; the new xTR registers a /32.</li>
<li>Map-Notify tells the old xTR; SMR tells stale ITRs to ask again.</li>
<li>Multihoming: the destination controls inbound traffic via priority and weight.</li>
<li>PITR attracts non-LISP traffic to EIDs; PETR carries LISP traffic to non-LISP destinations.</li>
<li>Instance IDs give multitenancy; EIDs and RLOCs can be different address families.</li>
</ul></div>
`,hi:`
<p>India mein ghar badalte ho to post office mein change of address file karte ho. Kuch samay tak chitthiyon par purani gali likhi aati hai, lekin purana post office unhe aage bhej deta hai aur bhejne walon ko naya pata bata deta hai. LISP host mobility bilkul yahi karta hai: host apna IP (identity) rakhta hai, mapping system nayi location seekhta hai, aur purani site har us insaan ko redirect karti hai jiske paas abhi bhi purani jaankari hai.</p>

<h3>Use case 1: host mobility (jiske baare mein interviewers poochte hain)</h3>
<p>IP 10.9.9.50 wala ek VM DC1 mein xTR-A (RLOC 100.64.1.2) ke peeche chalta hai. Use bina IP badle DC2 mein xTR-B (RLOC 100.64.2.2) ke peeche migrate kiya jaata hai. Subnet 10.9.9.0/24 dono xTRs par <b>dynamic-EID</b> range ki tarah configured hai, aur map-server uske andar more-specific host registrations accept karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="LISP host mobility">
<rect x="250" y="14" width="140" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">MS/MR</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.9.9.50/32 → B</text>
<rect x="40" y="110" width="150" height="46" rx="8" fill="#bae6fd"/><text x="115" y="132" text-anchor="middle" class="svg-ink" font-size="13">xTR-A (DC1)</text><text x="115" y="148" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.2, away entry</text>
<rect x="450" y="110" width="150" height="46" rx="8" fill="#bae6fd"/><text x="525" y="132" text-anchor="middle" class="svg-ink" font-size="13">xTR-B (DC2)</text><text x="525" y="148" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.2</text>
<rect x="250" y="210" width="140" height="46" rx="8" fill="#fde68a"/><text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Remote ITR</text><text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">purana cache → A</text>
<rect x="470" y="200" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="225" text-anchor="middle" class="svg-ink" font-size="12">VM 10.9.9.50</text>
<line x1="525" y1="156" x2="525" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="525" y1="110" x2="390" y2="50" stroke="#64748b" stroke-width="2"/><text x="490" y="74" class="svg-accent" font-size="12">1 /32 register</text>
<line x1="250" y1="50" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><text x="110" y="76" class="svg-accent" font-size="12">2 Map-Notify</text>
<line x1="250" y1="230" x2="115" y2="156" stroke="#64748b" stroke-width="2"/><text x="120" y="205" class="svg-accent" font-size="12">3 data A ko, 4 SMR wapas</text>
<line x1="390" y1="230" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="400" y="185" class="svg-accent" font-size="12">5 dobara resolve → B</text>
</svg><p class="cap">Move ke baad: register, purani site ko notify, purane ITRs ko redirect, dobara resolve.</p></div>
<ol>
<li><b>Detect.</b> xTR-B apne <code>lisp mobility</code> wale interface par 10.9.9.50 se traffic ya ARP dekhta hai. Woh pehchanta hai ki address uski dynamic-EID range ke andar hai.</li>
<li><b>Register.</b> xTR-B host route 10.9.9.50/32 ke liye RLOC 100.64.2.2 ke saath Map-Register bhejta hai.</li>
<li><b>Notify.</b> Map-server dekhta hai ki yeh /32 pehle xTR-A ne register kiya tha aur xTR-A ko <b>Map-Notify</b> bhejta hai. xTR-A host ko apne local database se hatata hai aur "away" entry lagata hai: 10.9.9.50 ab kahin aur hai.</li>
<li><b>Redirect.</b> Ek remote ITR ke paas abhi bhi 10.9.9.50 RLOC 100.64.1.2 ke saath cached hai aur woh xTR-A ko bhejta rehta hai. xTR-A <b>Solicit-Map-Request (SMR)</b> se jawab deta hai: "tumhara cache purana hai".</li>
<li><b>Re-resolve.</b> Remote ITR naya Map-Request bhejta hai, RLOC 100.64.2.2 paata hai aur map-cache update karta hai. Sessions bach jaate hain kyunki VM ka IP kabhi nahi badla.</li>
</ol>
<pre class="code"><span class="c">! dono data center xTRs par (classic syntax, concept level)</span>
router lisp
 eid-table default instance-id 0
  dynamic-eid VM-MOVE
   database-mapping 10.9.9.0/24 100.64.1.2 priority 1 weight 100
   exit
interface Vlan99
 lisp mobility VM-MOVE
<span class="c">! map-server par: range ke andar /32s allow karo</span>
router lisp
 site DC-SITES
  authentication-key NK-LISP
  eid-prefix 10.9.9.0/24 accept-more-specifics</pre>
<pre class="out">MSMR# show lisp site
Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
DC-SITES       never     no     --                            10.9.9.0/24
<span class="hl">               00:00:12  yes    100.64.2.2:40122              10.9.9.50/32</span></pre>
<p>Iske do flavours hain. <b>Across Subnet Mode</b> mein subnet har side par sirf routed tarike se exist karta hai, isliye Layer 2 extension ki zaroorat nahi. <b>Extended Subnet Mode</b> mein subnet Layer 2 par bhi stretched hota hai (jaise VXLAN ya OTV se) aur LISP sirf inbound path optimise karta hai.</p>

<h3>Use case 2: multihoming aur ingress traffic engineering</h3>
<p>Do ISPs wali site ek EID prefix ko do RLOCs ke saath register karti hai. Remote ITRs <b>destination</b> site ki publish ki hui priorities aur weights maante hain, isliye destination tay karta hai ki traffic andar kaise aaye. Na AS-path prepending, na de-aggregation, aur global table bhi nahi badhti.</p>

<h3>Use case 3: non-LISP sites se baat karna</h3>
<ul>
<li><b>LISP site se Internet</b>: ITR ko Negative Map-Reply milta hai, phir woh traffic natively bhejta hai, ya <code>use-petr 100.64.9.1</code> ke saath configured <b>PETR</b> ki taraf encapsulate karta hai, taaki ISP ko kabhi unexpected EID source na dikhe.</li>
<li><b>Internet se LISP site</b>: <b>PITR</b> EID space ka aggregate BGP mein advertise karta hai, traffic kheenchta hai, mapping dhoondta hai aur sahi ETR ki taraf encapsulate karta hai.</li>
</ul>

<h3>Use case 4: IPv6 aur multitenancy</h3>
<p>EIDs aur RLOCs alag address families ke ho sakte hain: IPv6 EIDs IPv4-only core paar kar sakte hain, jisse LISP IPv6 transition tool ban jaata hai. <b>Instance IDs</b> ke saath kai VRFs ek mapping system aur ek core share karte hain aur overlapping EIDs alag rehte hain, yahi SD-Access Virtual Networks ka aadhar hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek remote ITR ne 10.9.9.50 ko 100.64.1.2 par 24-ghante ke TTL ke saath cache kiya. SMR ke bina woh 24 ghante tak DC1 ko bhejta rehta. SMR ke saath, move ke baad xTR-A tak pahunchne wala pehla data packet SMR trigger karta hai, aur ITR map-resolver tak lagbhag ek round trip mein converge ho jaata hai, aam taur par ek second se kaafi kam.</p></div>

<div class="warn"><p><b>Common galti.</b> Map-server par <code>accept-more-specifics</code> bhool jaana. Nayi site ke /32 Map-Registers reject ho jaate hain kyunki sirf /24 allowed hai, isliye move kabhi seekha nahi jaata aur traffic purane data center jaata rehta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Mobility mein <b>Map-Notify</b> MS se <b>purane</b> xTR ko jaata hai, aur <b>SMR</b> purane xTR se remote ITRs ko. Aur LISP mobility host ka IP address rakhta hai; yeh DHCP renumbering nahi hai.</p></div>

<div class="scn"><h4>Bina readdressing ke disaster recovery</h4><p>Ek bank ne apne payment VMs ko primary data center se DR site par le jaane ka test kiya. Pehle DR plan mein IPs aur DNS badalna shaamil tha, jisme ghante lagte the. Dono sites par dynamic-EIDs ke saath LISP mobility lagane ke baad VMs ne 10.9.9.0/24 addresses rakhe. Test ke dauraan branch ITRs mein /32s kuch seconds mein DR RLOC par palat gaye, aur card transactions bina kisi DNS change ke wapas chalu ho gaye.</p><p><b>Seekh:</b> identity ko location se alag karna readdressing project ko ek routing update mein badal deta hai.</p></div>

<div class="iv"><p class="q">"LISP data centers ke beech VM mobility kaise support karta hai?"</p><p>Strong answer: xTRs par subnet ko dynamic-EID ki tarah configure karo aur map-server par more-specifics allow karo. Jab VM nayi site par dikhta hai, woh xTR uske liye /32 register karta hai. MS purane xTR ko Map-Notify bhejta hai, jo host ko away mark karta hai. Purane caches wale remote ITRs jo abhi bhi purane xTR ko bhejte hain unhe SMR milta hai aur woh naye RLOC par re-resolve karte hain. VM apna IP rakhta hai, isliye sessions aur firewall rules bach jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mobility: dynamic-EID + accept-more-specifics; naya xTR /32 register karta hai.</li>
<li>Map-Notify purane xTR ko batata hai; SMR purane ITRs ko dobara poochne ko kehta hai.</li>
<li>Multihoming: destination priority aur weight se inbound traffic control karta hai.</li>
<li>PITR non-LISP traffic ko EIDs ki taraf kheenchta hai; PETR LISP traffic ko non-LISP destinations tak le jaata hai.</li>
<li>Instance IDs multitenancy dete hain; EIDs aur RLOCs alag address families ke ho sakte hain.</li>
</ul></div>
`}};export{e as default};