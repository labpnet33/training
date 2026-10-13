var e={id:`type1-type4`,h:{en:`Route types 1 and 4: how leaves discover the segment`,hi:`Route types 1 aur 4: leaves segment ko kaise discover karte hain`},body:{en:`
<p>Suppose two security guards are assigned to the same building but have never met. They need two things: a way to find each other, and a way to tell every visitor desk in town "if guard A goes home, my colleague B covers all of A's visitors". Route type 4 is the <b>"I am a guard of this building" announcement</b> that lets the two guards find each other. Route type 1 is the <b>"here is who covers this building"</b> notice that tells every other leaf how to reach the segment and what to do when one guard disappears.</p>

<h3>Route type 4: Ethernet Segment route</h3>
<p>Each leaf attached to an ES originates one type-4 route per segment, carrying the <b>ESI</b> and the leaf's own IP (the originator). The route also holds the ES-Import route target, derived from the ESI, so only leaves that share the segment import it. The result: LEAF1 and LEAF2 discover that they are both members of ESI 0000.1122.3344.5566.7788, and they now know their <b>peer list</b> for the DF election. Leaves that are not members ignore the route.</p>

<h3>Route type 1: Ethernet Auto-Discovery (A-D) route</h3>
<p>Type 1 comes in two flavours.</p>
<ul>
<li><b>Per-ES A-D.</b> One route per segment, with Ethernet Tag MAX. It carries the ESI label (used for split-horizon filtering) and a flag saying single-active or all-active. Its withdrawal is the trigger for <b>mass withdraw</b>: when a leaf loses its link to the segment it withdraws this one route, and every remote leaf immediately removes that leaf as a next hop for <b>all</b> MACs behind the segment, without waiting for thousands of individual MAC withdrawals.</li>
<li><b>Per-EVI A-D.</b> One route per segment per EVPN instance (VLAN). It tells remote leaves "this leaf can reach this ESI for EVI 10", which builds the <b>aliasing</b> list: remote leaves may load-balance to this leaf even if they never saw a MAC from it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Type 1 and 4 flow">
<rect x="20" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="56" text-anchor="middle" class="svg-muted" font-size="12">member of ES 1</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="545" y="56" text-anchor="middle" class="svg-muted" font-size="12">member of ES 1</text>
<line x1="170" y1="43" x2="470" y2="43" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="36" text-anchor="middle" class="svg-accent" font-size="12">[4] ES route: "I am in ESI ...7788"</text>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">members discover each other, DF election starts</text>
<rect x="245" y="120" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">remote, not a member</text>
<line x1="95" y1="66" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><line x1="545" y1="66" x2="370" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="150" y="105" text-anchor="middle" class="svg-accent" font-size="12">[1] A-D</text><text x="495" y="105" text-anchor="middle" class="svg-accent" font-size="12">[1] A-D</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">LEAF3 learns: ES 1 reachable via .11 and .12 (aliasing)</text>
</svg><p class="cap">Type 4 is for the members; type 1 is for everyone else.</p></div>

<h3>What they look like</h3>
<pre class="out">LEAF3# show bgp l2vpn evpn route-type 4
Route Distinguisher: 65001:1
 *>i [4][65001:1][0000.1122.3344.5566.7788][32][10.255.1.11]/23
                    10.255.1.11              0    100      0 i
      Extended Community: RT:0011.2233.4455 ENCAP:8
Route Distinguisher: 65001:2
 *>i [4][65001:2][0000.1122.3344.5566.7788][32][10.255.1.12]/23
                    10.255.1.12              0    100      0 i

LEAF3# show bgp l2vpn evpn route-type 1
Route Distinguisher: 65001:10
 *>i [1][65001:10][0000.1122.3344.5566.7788][10]/23
                    10.255.1.11              0    100      0 i
      Extended Community: RT:65001:10 ENCAP:8 <span class="hl">ESI-label: all-active</span>
 *>i [1][65001:10][0000.1122.3344.5566.7788][10]/23
                    10.255.1.12              0    100      0 i</pre>
<p>Look for the same ESI in both routes and for <b>two different next hops</b>: this is the control-plane evidence that the segment is dual-homed and alias-capable. A single next hop means the second leaf is not announcing.</p>

<div class="eg"><p><b>Worked example: what happens when the link to LEAF1 fails.</b> H5's MACs (hundreds, from many VMs) are known on LEAF3 via LEAF1 and LEAF2. Cable cut at LEAF1. LEAF1 withdraws its per-ES type-1 route. LEAF3 reacts to this <b>one</b> withdrawal by removing LEAF1 as a next hop for every MAC of that ESI, leaving 10.255.1.12 only. Convergence is in tens of milliseconds, independent of the number of MACs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Searching for type 1 and type 4 on leaves that are not members and concluding "not received". Type 4 is filtered by the ES-Import RT, so non-member leaves discard it. Look at it on the member leaves, or on the spines.</p></div>

<div class="exam"><p><b>Exam trap.</b> Per-ES A-D drives mass withdraw; per-EVI A-D drives aliasing. Type 4 drives DF election. Type 2 with a non-zero ESI field tells the receiver that the MAC is behind a segment and may use both next hops.</p></div>

<div class="scn"><h4>The 40,000-MAC failover</h4><p>A virtualization cluster of 40,000 MACs sat behind a dual-homed pair. In the first design without per-ES A-D withdrawal, a leaf failure took 11 seconds, because every MAC had to be withdrawn individually. With mass withdraw enabled by design, the same failure was invisible to applications in under 100 ms.</p><p><b>Lesson:</b> type 1 per-ES is the reason EVPN multi-homing converges fast at scale.</p></div>

<div class="iv"><p class="q">"What do EVPN route types 1 and 4 do?"</p><p>Strong answer: type 4 (Ethernet Segment route) lets leaves on the same segment discover each other and drives DF election. Type 1 (Ethernet A-D) comes per-ES for fast convergence (mass withdraw) and split-horizon label, and per-EVI for aliasing so remote leaves can load-balance to all leaves of the segment. Together with ESI in type-2 routes, they implement multi-homing without a peer-link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 4: members find each other; ES-Import RT keeps it among members.</li>
<li>Type 1 per-ES: mass withdraw and split-horizon label.</li>
<li>Type 1 per-EVI: aliasing, load balancing by remote leaves.</li>
<li>Two next hops for the same ESI is the healthy picture.</li>
</ul></div>
`,hi:`
<p>Maano do security guards ek hi building ke liye assign hain lekin kabhi mile nahi. Unhe do cheezein chahiye: ek-doosre ko dhoondhne ka tareeka, aur shehar ke har visitor desk ko batane ka tareeka "agar guard A ghar jaata hai, mera colleague B A ke saare visitors cover karega". Route type 4 <b>"main is building ka guard hoon" announcement</b> hai jisse dono guards ek-doosre ko dhoondh lete hain. Route type 1 <b>"is building ko yeh cover karte hain" notice</b> hai jo baaki har leaf ko batata hai ki segment tak kaise pahunchna hai aur ek guard ke gayab hone par kya karna hai.</p>

<h3>Route type 4: Ethernet Segment route</h3>
<p>Segment se attached har leaf har segment ke liye ek type-4 route originate karta hai, jisme <b>ESI</b> aur leaf ka apna IP (originator) hota hai. Route mein ESI se derive hua ES-Import route target bhi hota hai, isliye sirf wahi leaves ise import karte hain jo segment share karte hain. Result: LEAF1 aur LEAF2 discover karte hain ki dono ESI 0000.1122.3344.5566.7788 ke members hain, aur ab DF election ke liye unhe apni <b>peer list</b> pata hai. Jo leaves members nahi hain woh route ignore karte hain.</p>

<h3>Route type 1: Ethernet Auto-Discovery (A-D) route</h3>
<p>Type 1 do roop mein aata hai.</p>
<ul>
<li><b>Per-ES A-D.</b> Har segment ke liye ek route, Ethernet Tag MAX ke saath. Isme ESI label (split-horizon filtering ke liye) aur single-active ya all-active batane wala flag hota hai. Iska withdrawal <b>mass withdraw</b> ka trigger hai: jab leaf segment se apna link kho deta hai to yeh ek route withdraw karta hai, aur har remote leaf turant us segment ke peeche ke <b>saare</b> MACs ke liye us leaf ko next hop se hata deta hai, hazaron individual MAC withdrawals ka intezaar kiye bina.</li>
<li><b>Per-EVI A-D.</b> Har segment per EVPN instance (VLAN) ek route. Yeh remote leaves ko batata hai "yeh leaf EVI 10 ke liye is ESI tak pahunch sakta hai", jisse <b>aliasing</b> list banti hai: remote leaves is leaf par load-balance kar sakte hain bhale hi unhone us se koi MAC kabhi na dekha ho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Type 1 and 4 flow">
<rect x="20" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="95" y="56" text-anchor="middle" class="svg-muted" font-size="12">ES 1 ka member</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="545" y="56" text-anchor="middle" class="svg-muted" font-size="12">ES 1 ka member</text>
<line x1="170" y1="43" x2="470" y2="43" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="36" text-anchor="middle" class="svg-accent" font-size="12">[4] ES route: "main ESI ...7788 mein hoon"</text>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">members ek-doosre ko dhoondhte hain, DF election shuru</text>
<rect x="245" y="120" width="150" height="46" rx="8" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">remote, member nahi</text>
<line x1="95" y1="66" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><line x1="545" y1="66" x2="370" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="150" y="105" text-anchor="middle" class="svg-accent" font-size="12">[1] A-D</text><text x="495" y="105" text-anchor="middle" class="svg-accent" font-size="12">[1] A-D</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">LEAF3 seekhta hai: ES 1 .11 aur .12 se reachable (aliasing)</text>
</svg><p class="cap">Type 4 members ke liye hai; type 1 baaki sabke liye.</p></div>

<h3>Yeh kaise dikhte hain</h3>
<pre class="out">LEAF3# show bgp l2vpn evpn route-type 4
Route Distinguisher: 65001:1
 *>i [4][65001:1][0000.1122.3344.5566.7788][32][10.255.1.11]/23
                    10.255.1.11              0    100      0 i
      Extended Community: RT:0011.2233.4455 ENCAP:8
Route Distinguisher: 65001:2
 *>i [4][65001:2][0000.1122.3344.5566.7788][32][10.255.1.12]/23
                    10.255.1.12              0    100      0 i

LEAF3# show bgp l2vpn evpn route-type 1
Route Distinguisher: 65001:10
 *>i [1][65001:10][0000.1122.3344.5566.7788][10]/23
                    10.255.1.11              0    100      0 i
      Extended Community: RT:65001:10 ENCAP:8 <span class="hl">ESI-label: all-active</span>
 *>i [1][65001:10][0000.1122.3344.5566.7788][10]/23
                    10.255.1.12              0    100      0 i</pre>
<p>Dono routes mein same ESI dhoondho aur <b>do alag next hops</b>: yeh control-plane saboot hai ki segment dual-homed aur alias-capable hai. Sirf ek next hop ka matlab hai doosra leaf announce nahi kar raha.</p>

<div class="eg"><p><b>Worked example: LEAF1 ka link fail ho to kya hota hai.</b> H5 ke MACs (kai VMs se, sainkdon) LEAF3 par LEAF1 aur LEAF2 dono se known hain. LEAF1 par cable cut. LEAF1 apna per-ES type-1 route withdraw karta hai. LEAF3 is <b>ek</b> withdrawal par us ESI ke har MAC ke liye LEAF1 ko next hop se hata deta hai, sirf 10.255.1.12 bachta hai. Convergence das-bees milliseconds mein, MACs ki sankhya se independent.</p></div>

<div class="warn"><p><b>Common galti.</b> Un leaves par type 1 aur type 4 dhoondhna jo members nahi hain aur nateeja nikalna "receive nahi hua". Type 4 ES-Import RT se filter hota hai, isliye non-member leaves use discard karte hain. Member leaves par dekho, ya spines par.</p></div>

<div class="exam"><p><b>Exam trap.</b> Per-ES A-D mass withdraw chalata hai; per-EVI A-D aliasing. Type 4 DF election chalata hai. Non-zero ESI field wala type 2 receiver ko batata hai ki MAC segment ke peeche hai aur dono next hops use ho sakte hain.</p></div>

<div class="scn"><h4>40,000-MAC failover</h4><p>40,000 MACs wala virtualization cluster ek dual-homed pair ke peeche tha. Per-ES A-D withdrawal ke bina pehle design mein leaf failure 11 second leta tha, kyunki har MAC individually withdraw hona padta tha. Design mein mass withdraw ke saath wahi failure applications ko 100 ms se kam mein invisible tha.</p><p><b>Seekh:</b> type 1 per-ES wajah hai ki EVPN multi-homing scale par fast converge karta hai.</p></div>

<div class="iv"><p class="q">"EVPN route types 1 aur 4 kya karte hain?"</p><p>Strong answer: type 4 (Ethernet Segment route) same segment ke leaves ko ek-doosre ko discover karne deta hai aur DF election chalata hai. Type 1 (Ethernet A-D) per-ES fast convergence (mass withdraw) aur split-horizon label ke liye, aur per-EVI aliasing ke liye hai taaki remote leaves segment ke saare leaves par load-balance kar saken. Type-2 routes mein ESI ke saath milkar yeh bina peer-link ke multi-homing implement karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 4: members ek-doosre ko dhoondhte hain; ES-Import RT ise members tak rakhta hai.</li>
<li>Type 1 per-ES: mass withdraw aur split-horizon label.</li>
<li>Type 1 per-EVI: aliasing, remote leaves ka load balancing.</li>
<li>Same ESI ke do next hops healthy picture hai.</li>
</ul></div>
`}};export{e as default};