var e={id:`confederations-multipath`,h:{en:`Confederations, multipath and load balancing`,hi:`Confederations, multipath aur load balancing`},body:{en:`
<p>Route reflection is not the only way to escape the IBGP full mesh. A <b>confederation</b> (RFC 5065) splits one large AS into several smaller <b>member ASes</b> (sub-ASes). Inside each member AS you run a normal IBGP full mesh (or route reflectors); <b>between</b> member ASes you run a special kind of EBGP, called <b>confederation EBGP</b>. To the outside world the whole group still looks like one AS. This chapter also covers how BGP can use more than one path at the same time, which is the other big scaling topic of the exam.</p>

<h3>Confederation basics</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Confederation">
<rect x="20" y="20" width="440" height="170" rx="14" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="240" y="40" text-anchor="middle" class="svg-muted" font-size="12">Confederation identifier AS 65100 (what the world sees)</text>
<rect x="45" y="60" width="170" height="110" rx="10" fill="#bae6fd"/><text x="130" y="82" text-anchor="middle" class="svg-ink" font-size="13">Member AS 65101</text><text x="130" y="108" text-anchor="middle" class="svg-muted" font-size="12">IBGP mesh / RR</text><text x="130" y="130" text-anchor="middle" class="svg-muted" font-size="12">R1  R2  R3</text>
<rect x="265" y="60" width="170" height="110" rx="10" fill="#bbf7d0"/><text x="350" y="82" text-anchor="middle" class="svg-ink" font-size="13">Member AS 65102</text><text x="350" y="108" text-anchor="middle" class="svg-muted" font-size="12">IBGP mesh / RR</text><text x="350" y="130" text-anchor="middle" class="svg-muted" font-size="12">R4  R5  R6</text>
<line x1="215" y1="115" x2="265" y2="115" stroke="#64748b" stroke-width="2"/><text x="240" y="108" text-anchor="middle" class="svg-accent" font-size="11">conf-EBGP</text>
<rect x="520" y="85" width="100" height="50" rx="10" fill="#fde68a"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">Outside</text><text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="12">AS 64496</text>
<line x1="435" y1="115" x2="520" y2="110" stroke="#64748b" stroke-width="2"/><text x="480" y="102" text-anchor="middle" class="svg-accent" font-size="11">real EBGP</text>
</svg><p class="cap">Two member ASes inside one confederation AS 65100.</p></div>
<ul>
<li>Each router runs in its <b>member AS</b> (<code>autonomous-system 65101</code>) and knows the <b>confederation AS</b> (<code>confederation 65100 members [ 65101 65102 ]</code>).</li>
<li>Member ASes are usually private numbers; they are never seen outside.</li>
<li>Sessions between member ASes are EBGP-like, but local preference, next hop and MED are <b>preserved</b>, so the whole confederation behaves like one AS for path selection.</li>
<li>The AS path carries <b>confederation segments</b> (AS_CONFED_SEQUENCE and AS_CONFED_SET) that prevent loops between members. They are removed when the route leaves the confederation, and they are <b>not counted</b> in AS-path length.</li>
</ul>
<pre class="code"><span class="c"># R1, member AS 65101, confederation AS 65100</span>
set routing-options autonomous-system 65101
set routing-options confederation 65100 members [ 65101 65102 ]
set protocols bgp group MEMBER-IBGP type internal local-address 10.65.255.1
set protocols bgp group MEMBER-IBGP neighbor 10.65.255.2
set protocols bgp group CONF-EBGP type external peer-as 65102 neighbor 10.65.12.2</pre>
<p>This is configuration only; the simulator labs for this module use route reflection. On a real device <code>show route detail</code> would show the confederation segment in the AS path in parentheses, for example <code>(65102)</code>, and <code>show bgp neighbor</code> would show the peer type as <code>External</code> with the member AS.</p>

<table class="cmp"><tr><th></th><th>Route reflector</th><th>Confederation</th></tr>
<tr><td>Idea</td><td>Hub reflects IBGP routes</td><td>Split the AS into sub-ASes</td></tr>
<tr><td>Loop prevention</td><td>ORIGINATOR_ID, CLUSTER_LIST</td><td>Confederation AS path segments</td></tr>
<tr><td>Migration</td><td>Easy: add RR, remove sessions</td><td>Hard: renumber routers into member ASes</td></tr>
<tr><td>Policy</td><td>One AS, one policy domain</td><td>Each member AS may have its own IGP and policy</td></tr>
<tr><td>Typical use</td><td>Most networks</td><td>Mergers, very large networks; can be combined with RRs inside members</td></tr></table>

<h3>BGP multipath</h3>
<p>By default BGP installs <b>one</b> best path. With <code>multipath</code> Junos treats paths as equal and installs all of them if they tie on every step up to, but not including, the router-ID comparison: same local preference, AS-path length, origin, MED, EBGP/IBGP type and IGP cost to the next hop.</p>
<pre class="code">set protocols bgp group ISP multipath                    <span class="c"># paths must come from the same neighbouring AS</span>
set protocols bgp group ISP multipath multiple-as        <span class="c"># paths from different ASes may be combined</span>

set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB            <span class="c"># push all next hops to the forwarding table</span></pre>
<p>Despite its name, <code>per-packet</code> on Junos actually balances <b>per flow</b> (a hash over the packet header), so one conversation is not reordered. Without the forwarding-table export policy the control plane has several next hops, but the packet forwarding engine still uses just one. In <code>show route</code> the multipath prefix lists several next hops, and in detail output it is marked as multipath.</p>
<p>Three related ideas:</p>
<ul>
<li><b>Loopback peering with EBGP multihop.</b> Two routers with two parallel links can peer between loopbacks (<code>multihop</code>, <code>local-address</code>) and use two equal static routes to reach each other, so one session uses both links.</li>
<li><b>IBGP multipath</b> needs equal IGP cost to the different next hops; unequal-cost choice is made by the IGP metric step.</li>
<li><b>Add-path</b> (RFC 7911) lets a router, including a route reflector, advertise more than its best path so clients can see alternatives. This helps load balancing and fast re-route; it is a configuration option under the family.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A company has two links to the same ISP (AS 64501) and the ISP announces 198.51.100.0/24 on both with identical attributes. Without multipath the router picks the neighbour with the lowest router ID and the second link idles. With <code>multipath</code> on the group and <code>load-balance per-packet</code> exported to the forwarding table, both next hops are installed and traffic is spread by flow hash.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>multipath</code> and forgetting the forwarding-table export policy. The route table looks perfect but the PFE sends everything down one link. The other mistake is expecting multipath across two different ISPs without <code>multiple-as</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Confederation AS segments are not counted in the AS-path length, and local preference is kept across conf-EBGP sessions. Multipath ignores the router-ID tie-breaker; it needs all earlier attributes equal.</p></div>

<div class="scn"><h4>The merger that kept two ASes alive</h4><p>Two utilities merged. Both had grown their own full meshes and neither team wanted to renumber. The architects built one confederation: each old network became a member AS, and a single conf-EBGP link joined them. The outside world saw one AS number, and over the next year each side moved to route reflectors inside its member AS.</p><p><b>Lesson:</b> confederations are a migration and scaling tool when you cannot easily merge two routing domains.</p></div>

<div class="iv"><p class="q">"Route reflectors or confederations: which would you choose?"</p><p>For a normal growing network I choose route reflectors because they are simple to add. I would choose confederations for mergers or when separate administrative groups need their own sub-ASes. They can be combined. Mention that confederation segments are removed at the edge and not counted in the AS-path length.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A confederation splits an AS into member ASes with conf-EBGP between them.</li>
<li>Local preference, next hop and MED are preserved across conf-EBGP; confed segments prevent loops.</li>
<li>Multipath installs equal paths; same-AS only unless multiple-as is set.</li>
<li>Add a forwarding-table load-balance policy or the PFE will still use one path.</li>
<li>Add-path lets a reflector advertise more than one path to clients.</li>
</ul></div>
`,hi:`
<p>IBGP full mesh se bachne ka Route reflection akela tareeka nahi hai. <b>Confederation</b> (RFC 5065) ek bade AS ko kai chhote <b>member ASes</b> (sub-ASes) mein baant deta hai. Har member AS ke andar normal IBGP full mesh (ya route reflectors) chalta hai; member ASes ke <b>beech</b> ek khaas tarah ka EBGP chalta hai jise <b>confederation EBGP</b> kehte hain. Bahar ki duniya ko poora group ab bhi ek AS dikhta hai. Is chapter mein yeh bhi hai ki BGP ek saath ek se zyada paths kaise use kar sakta hai, jo exam ka doosra bada scaling topic hai.</p>

<h3>Confederation basics</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Confederation">
<rect x="20" y="20" width="440" height="170" rx="14" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="240" y="40" text-anchor="middle" class="svg-muted" font-size="12">Confederation identifier AS 65100 (duniya ko yahi dikhta hai)</text>
<rect x="45" y="60" width="170" height="110" rx="10" fill="#bae6fd"/><text x="130" y="82" text-anchor="middle" class="svg-ink" font-size="13">Member AS 65101</text><text x="130" y="108" text-anchor="middle" class="svg-muted" font-size="12">IBGP mesh / RR</text><text x="130" y="130" text-anchor="middle" class="svg-muted" font-size="12">R1  R2  R3</text>
<rect x="265" y="60" width="170" height="110" rx="10" fill="#bbf7d0"/><text x="350" y="82" text-anchor="middle" class="svg-ink" font-size="13">Member AS 65102</text><text x="350" y="108" text-anchor="middle" class="svg-muted" font-size="12">IBGP mesh / RR</text><text x="350" y="130" text-anchor="middle" class="svg-muted" font-size="12">R4  R5  R6</text>
<line x1="215" y1="115" x2="265" y2="115" stroke="#64748b" stroke-width="2"/><text x="240" y="108" text-anchor="middle" class="svg-accent" font-size="11">conf-EBGP</text>
<rect x="520" y="85" width="100" height="50" rx="10" fill="#fde68a"/><text x="570" y="108" text-anchor="middle" class="svg-ink" font-size="13">Bahar</text><text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="12">AS 64496</text>
<line x1="435" y1="115" x2="520" y2="110" stroke="#64748b" stroke-width="2"/><text x="480" y="102" text-anchor="middle" class="svg-accent" font-size="11">real EBGP</text>
</svg><p class="cap">Confederation AS 65100 ke andar do member ASes.</p></div>
<ul>
<li>Har router apne <b>member AS</b> mein chalta hai (<code>autonomous-system 65101</code>) aur <b>confederation AS</b> jaanta hai (<code>confederation 65100 members [ 65101 65102 ]</code>).</li>
<li>Member ASes aam taur par private numbers hote hain; woh bahar kabhi nahi dikhte.</li>
<li>Member ASes ke beech sessions EBGP jaise hain, lekin local preference, next hop aur MED <b>preserve</b> hote hain, isliye path selection ke liye poori confederation ek AS jaisi behave karti hai.</li>
<li>AS path mein <b>confederation segments</b> (AS_CONFED_SEQUENCE aur AS_CONFED_SET) hote hain jo members ke beech loops rokte hain. Route confederation chhodte hi hata diye jaate hain, aur AS-path length mein <b>gine nahi jaate</b>.</li>
</ul>
<pre class="code"><span class="c"># R1, member AS 65101, confederation AS 65100</span>
set routing-options autonomous-system 65101
set routing-options confederation 65100 members [ 65101 65102 ]
set protocols bgp group MEMBER-IBGP type internal local-address 10.65.255.1
set protocols bgp group MEMBER-IBGP neighbor 10.65.255.2
set protocols bgp group CONF-EBGP type external peer-as 65102 neighbor 10.65.12.2</pre>
<p>Yeh sirf configuration hai; is module ke simulator labs route reflection use karte hain. Real device par <code>show route detail</code> AS path mein confederation segment bracket mein dikhata, jaise <code>(65102)</code>, aur <code>show bgp neighbor</code> peer type <code>External</code> member AS ke saath dikhata.</p>

<table class="cmp"><tr><th></th><th>Route reflector</th><th>Confederation</th></tr>
<tr><td>Idea</td><td>Hub IBGP routes reflect karta hai</td><td>AS ko sub-ASes mein todo</td></tr>
<tr><td>Loop prevention</td><td>ORIGINATOR_ID, CLUSTER_LIST</td><td>Confederation AS path segments</td></tr>
<tr><td>Migration</td><td>Aasan: RR jodo, sessions hatao</td><td>Mushkil: routers ko member ASes mein renumber karo</td></tr>
<tr><td>Policy</td><td>Ek AS, ek policy domain</td><td>Har member AS ka apna IGP aur policy ho sakti hai</td></tr>
<tr><td>Typical use</td><td>Zyadatar networks</td><td>Mergers, bahut bade networks; members ke andar RRs ke saath mil sakta hai</td></tr></table>

<h3>BGP multipath</h3>
<p>Default mein BGP <b>ek</b> best path install karta hai. <code>multipath</code> ke saath Junos paths ko barabar maanta hai aur sabko install karta hai agar woh router-ID comparison se pehle tak har step par tie karein: same local preference, AS-path length, origin, MED, EBGP/IBGP type aur next hop tak IGP cost.</p>
<pre class="code">set protocols bgp group ISP multipath                    <span class="c"># paths same neighbouring AS se hone chahiye</span>
set protocols bgp group ISP multipath multiple-as        <span class="c"># alag ASes ke paths bhi mil sakte hain</span>

set policy-options policy-statement LB then load-balance per-packet
set routing-options forwarding-table export LB            <span class="c"># saare next hops forwarding table mein push karo</span></pre>
<p>Naam ke bawajood Junos par <code>per-packet</code> asal mein <b>per flow</b> balance karta hai (packet header par hash), isliye ek conversation reorder nahi hoti. Forwarding-table export policy ke bina control plane ke paas kai next hops hote hain, lekin packet forwarding engine phir bhi sirf ek use karta hai. <code>show route</code> mein multipath prefix kai next hops list karta hai, aur detail output mein multipath ke roop mein mark hota hai.</p>
<p>Teen related ideas:</p>
<ul>
<li><b>Loopback peering EBGP multihop ke saath.</b> Do parallel links wale do routers loopbacks ke beech peer kar sakte hain (<code>multihop</code>, <code>local-address</code>) aur ek doosre tak pahunchne ke liye do equal static routes use karte hain, isliye ek session dono links use karta hai.</li>
<li><b>IBGP multipath</b> ko alag next hops tak equal IGP cost chahiye; unequal-cost ka choice IGP metric step karta hai.</li>
<li><b>Add-path</b> (RFC 7911) router ko, route reflector samet, best path se zyada advertise karne deta hai taaki clients ko alternatives dikhein. Yeh load balancing aur fast re-route mein madad karta hai; yeh family ke andar configuration option hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek company ke ek hi ISP (AS 64501) ke do links hain aur ISP 198.51.100.0/24 dono par identical attributes ke saath announce karta hai. Multipath ke bina router lowest router ID wala neighbour chunta hai aur doosra link idle rehta hai. Group par <code>multipath</code> aur forwarding table mein <code>load-balance per-packet</code> export karne par dono next hops install hote hain aur traffic flow hash se baant jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>multipath</code> configure karke forwarding-table export policy bhool jaana. Route table perfect dikhta hai lekin PFE sab kuch ek link par bhejta hai. Doosri galti: <code>multiple-as</code> ke bina do alag ISPs ke beech multipath ki umeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Confederation AS segments AS-path length mein nahi gine jaate, aur conf-EBGP sessions par local preference bana rehta hai. Multipath router-ID tie-breaker ko ignore karta hai; ise pehle ke saare attributes equal chahiye.</p></div>

<div class="scn"><h4>Merger jisne do ASes zinda rakhe</h4><p>Do utilities merge hui. Dono ne apne full mesh bana rakhe the aur koi team renumber nahi karna chahti thi. Architects ne ek confederation banayi: har purana network ek member AS bana, aur ek conf-EBGP link ne dono jode. Bahar ki duniya ko ek AS number dikha, aur agle saal har taraf apne member AS ke andar route reflectors par chali gayi.</p><p><b>Lesson:</b> jab do routing domains ko aasani se merge na kar sako to confederation migration aur scaling tool hai.</p></div>

<div class="iv"><p class="q">"Route reflectors ya confederations: kaunsa chunoge?"</p><p>Normal badhte network ke liye route reflectors, kyunki jodna aasan hai. Mergers ya jab alag administrative groups ko apne sub-ASes chahiye hon tab confederations. Dono mil sakte hain. Batao ki confederation segments edge par hata diye jaate hain aur AS-path length mein nahi gine jaate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Confederation AS ko member ASes mein todti hai, beech mein conf-EBGP.</li>
<li>conf-EBGP par local preference, next hop aur MED preserve hote hain; confed segments loops rokte hain.</li>
<li>Multipath equal paths install karta hai; same-AS only jab tak multiple-as set na ho.</li>
<li>Forwarding-table load-balance policy jodo warna PFE ek hi path use karega.</li>
<li>Add-path reflector ko clients ko ek se zyada path advertise karne deta hai.</li>
</ul></div>
`}};export{e as default};