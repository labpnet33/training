var e={id:`isis-sr-config`,h:{en:`SR-MPLS on IS-IS: configuration and coexistence with LDP`,hi:`IS-IS par SR-MPLS: configuration aur LDP ke saath coexistence`},body:{en:`
<p>Turning on segment routing in an IS-IS core is like putting street names on a map that already exists. The roads (IGP adjacencies and shortest paths) are already there. You only add a name (prefix-SID) to each important place (loopback), tell the IGP to advertise the names, and tell the routers to install labels for them. This chapter shows the minimum configuration on IOS XR and IOS XE, how to verify it, and how SR and LDP live together during migration.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Four steps to a working SR-MPLS core on IS-IS."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. SRGB</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">label block</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. IS-IS</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">segment-routing mpls</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Loopback</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prefix-SID index</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">label table, FIB</text></svg><p class="cap">Four steps to a working SR-MPLS core on IS-IS.</p></div>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> This is teaching configuration with documentation addresses. No device output is shown because the simulator has no SR lab yet. To rehearse the IS-IS part, use <code>spcor-isis</code> and <code>spcor-isis-design</code>; for label forwarding, <code>spcor-mpls-ldp</code>.</p></div>
<h3>IOS XR</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
segment-routing
 global-block 16000 23999
<span class="c">!</span>
router isis CORE
 is-type level-2-only
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
  metric-style wide
  segment-routing mpls
<span class="c"> !</span>
 interface Loopback0
  passive
  address-family ipv4 unicast
   prefix-sid index 1
<span class="c">  !</span>
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  point-to-point
  address-family ipv4 unicast
<span class="c"> !</span></pre>
<p>Reading it: <code>global-block</code> defines the SRGB. <code>metric-style wide</code> is required because SR information rides in extended TLVs. <code>segment-routing mpls</code> under the address family enables SR for IS-IS, and <code>prefix-sid index 1</code> on the loopback gives it label 16001. Adjacency-SIDs are allocated automatically once SR is on.</p>
<h3>IOS XE</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
segment-routing mpls
<span class="c"> !</span>
 set-attributes
  address-family ipv4
   sr-label-preferred
  exit-address-family
<span class="c"> !</span>
 global-block 16000 23999
<span class="c"> !</span>
 connected-prefix-sid-map
  address-family ipv4
   192.0.2.1/32 index 1 range 1
  exit-address-family
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 segment-routing mpls</pre>
<p>On IOS XE the prefix-SID is attached through the <b>connected-prefix-sid-map</b>, a table of local prefixes and indexes, rather than under the loopback interface. The <code>sr-label-preferred</code> attribute makes the router prefer the SR label over an LDP label when both exist.</p>
<h3>What to verify</h3>
<ul>
<li>The SRGB matches on all routers (look at the advertised SRGB in the IS-IS database).</li>
<li>Each loopback is advertised with its prefix-SID and the N-flag. On XR: <code>show isis database verbose</code>; on both: look for the SID and the SRGB sub-TLVs.</li>
<li>The label table: <code>show isis segment-routing label table</code> (XR) and <code>show segment-routing mpls connected-prefix-sid-map ipv4</code> (XE).</li>
<li>The forwarding table: <code>show mpls forwarding</code> (XR) or <code>show mpls forwarding-table</code> (XE) should have an entry for each prefix-SID label with an outgoing interface, and adjacency-SID entries per link.</li>
<li>A ping or traceroute with MPLS options towards a prefix-SID verifies the path: <code>ping sr-mpls</code> and <code>traceroute sr-mpls</code> on XR use the FEC of a prefix-SID.</li>
</ul>
<h3>Coexistence and migration with LDP</h3>
<p>Most networks migrate step by step, so SR and LDP run together. Both allocate labels for the same loopback: an LDP label and a prefix-SID label. A router must choose which to install. In general the rule is: <b>if the prefix has an SR label and the next hop supports SR, use SR; otherwise use LDP.</b> You can control preference with <code>sr-prefer</code> (XR, under the IS-IS address family: <code>segment-routing mpls sr-prefer</code>) or <code>sr-label-preferred</code> (XE). Then LDP can be removed gradually from the core and left only where needed.</p>
<p>A device that supports LDP but not SR is a problem: the SR label chain breaks at it. The <b>segment routing mapping server (SRMS)</b> solves the reverse case. A router configured as mapping server advertises prefix-SIDs <i>on behalf of</i> prefixes that are LDP-only or non-SR, so SR-capable routers can still build an SR path to them. The <b>mapping client</b> receives and uses these mappings. At the boundary, an <b>SR-LDP interworking</b> node swaps between an SR label and an LDP label, using the SRMS entries, so a label-switched path crosses both domains.</p>
<table class="cmp"><tr><th>Situation</th><th>Solution</th></tr><tr><td>All routers support SR</td><td>SR only, remove LDP when stable</td></tr><tr><td>Some routers are LDP-only</td><td>SRMS advertises SIDs for them; interworking node swaps SR and LDP</td></tr><tr><td>Prefer SR when both labels exist</td><td>sr-prefer (XR) or sr-label-preferred (XE)</td></tr><tr><td>Different SRGB on a vendor</td><td>Use matching SRGB if possible; otherwise rely on per-neighbour label computation</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Eight routers P1 to P8 form the core. You move the core to SR first. Step 1: define SRGB 16000 to 23999 everywhere. Step 2: enable segment-routing mpls in IS-IS and give the loopbacks indexes 1 to 8. Step 3: check that labels 16001 to 16008 are in the forwarding table with the expected next hops. Step 4: enable sr-prefer so SR labels are used. Step 5: after a monitoring period, remove LDP from the core interfaces. At each step ping sr-mpls to a far loopback.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>metric-style wide</code>, or configuring the prefix-SID on a loopback that is not advertised into IS-IS (for example without <code>passive</code> or not in the IS-IS process). Also, giving two different routers the same index. A third mistake: not checking the SRGB on every router and ending up with one platform using a different range.</p></div>
<div class="exam"><p><b>Exam trap.</b> The mapping server advertises SIDs for <i>prefixes that are not SR-enabled</i>; it does not turn LDP routers into SR routers. The default SRGB is 16000 to 23999. Preference between SR and LDP is a local choice and must be set consciously.</p></div>
<div class="scn"><h4>LDP-only edge in an SR core</h4><p>During a staged migration an older aggregation router supported only LDP. Traffic through it lost its labels at the boundary, breaking a customer VPN. The team configured a mapping server at the core to advertise prefix-SIDs for the aggregation router loopbacks and enabled SR-LDP interworking on the border router. Traffic then crossed both label domains with no outage.</p><p><b>Lesson:</b> plan the boundary between SR and LDP; a mapping server and an interworking node bridge it.</p></div>
<div class="iv"><p class="q">"How do SR and LDP coexist during migration?"</p><p>Both can run together. A router with both labels for a prefix prefers SR when configured so (sr-prefer on XR, sr-label-preferred on XE). For LDP-only or non-SR routers, a segment routing mapping server advertises prefix-SIDs on their behalf, and an interworking node swaps between SR and LDP labels. Once everything is verified, LDP is removed from the core. I check the SRGB, SID uniqueness and the label table before each step.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum SR on IS-IS: SRGB, segment-routing mpls, prefix-SID index on Loopback0, metric-style wide.</li>
<li>IOS XR sets the SID under the loopback in IS-IS; IOS XE uses connected-prefix-sid-map.</li>
<li>Verify the SRGB, the SIDs in the IS-IS database, the label table and the FIB.</li>
<li>SR and LDP coexist; sr-prefer or sr-label-preferred sets the choice.</li>
<li>A mapping server advertises SIDs for non-SR prefixes; interworking swaps labels at the boundary.</li>
</ul></div>
`,hi:`
<p>IS-IS core mein segment routing on karna us map par street names lagane jaisa hai jo pehle se maujood hai. Roads (IGP adjacencies aur shortest paths) pehle se hain. Aap bas har important jagah (loopback) ko naam (prefix-SID) dete ho, IGP ko naam advertise karne ko kehte ho, aur routers ko unke liye labels install karne ko. Yeh chapter IOS XR aur IOS XE par minimum configuration, usse verify karna, aur migration ke dauran SR aur LDP ka saath rehna dikhata hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="IS-IS par kaam karte SR-MPLS core ke chaar steps."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. SRGB</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">label block</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. IS-IS</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">segment-routing mpls</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Loopback</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">prefix-SID index</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">label table, FIB</text></svg><p class="cap">IS-IS par kaam karte SR-MPLS core ke chaar steps.</p></div>
<div class="note"><p><b>Reference configuration (simulator mein run nahi hoti).</b> Yeh documentation addresses ke saath teaching configuration hai. Koi device output nahi dikhaya kyunki simulator mein abhi SR lab nahi hai. IS-IS hissa rehearse karne ke liye <code>spcor-isis</code> aur <code>spcor-isis-design</code>; label forwarding ke liye <code>spcor-mpls-ldp</code> use karo.</p></div>
<h3>IOS XR</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
segment-routing
 global-block 16000 23999
<span class="c">!</span>
router isis CORE
 is-type level-2-only
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
  metric-style wide
  segment-routing mpls
<span class="c"> !</span>
 interface Loopback0
  passive
  address-family ipv4 unicast
   prefix-sid index 1
<span class="c">  !</span>
<span class="c"> !</span>
 interface TenGigE0/0/0/1
  point-to-point
  address-family ipv4 unicast
<span class="c"> !</span></pre>
<p>Padhna: <code>global-block</code> SRGB define karta hai. <code>metric-style wide</code> zaroori hai kyunki SR information extended TLVs mein chalti hai. Address family ke neeche <code>segment-routing mpls</code> IS-IS ke liye SR enable karta hai, aur loopback par <code>prefix-sid index 1</code> use label 16001 deta hai. SR on hote hi adjacency-SIDs automatically allocate hote hain.</p>
<h3>IOS XE</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
segment-routing mpls
<span class="c"> !</span>
 set-attributes
  address-family ipv4
   sr-label-preferred
  exit-address-family
<span class="c"> !</span>
 global-block 16000 23999
<span class="c"> !</span>
 connected-prefix-sid-map
  address-family ipv4
   192.0.2.1/32 index 1 range 1
  exit-address-family
<span class="c">!</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 metric-style wide
 segment-routing mpls</pre>
<p>IOS XE par prefix-SID loopback interface ke neeche nahi, <b>connected-prefix-sid-map</b> se lagta hai, jo local prefixes aur indexes ki table hai. <code>sr-label-preferred</code> attribute router ko dono maujood hone par SR label ko LDP label par prefer karwata hai.</p>
<h3>Kya verify karna hai</h3>
<ul>
<li>SRGB saare routers par match karta hai (IS-IS database mein advertised SRGB dekho).</li>
<li>Har loopback apne prefix-SID aur N-flag ke saath advertised hai. XR par: <code>show isis database verbose</code>; dono par SID aur SRGB sub-TLVs dhoondo.</li>
<li>Label table: <code>show isis segment-routing label table</code> (XR) aur <code>show segment-routing mpls connected-prefix-sid-map ipv4</code> (XE).</li>
<li>Forwarding table: <code>show mpls forwarding</code> (XR) ya <code>show mpls forwarding-table</code> (XE) mein har prefix-SID label ki entry outgoing interface ke saath honi chahiye, aur har link ke adjacency-SID entries.</li>
<li>Prefix-SID ki taraf MPLS options ke saath ping ya traceroute path verify karta hai: XR par <code>ping sr-mpls</code> aur <code>traceroute sr-mpls</code> prefix-SID ka FEC use karte hain.</li>
</ul>
<h3>LDP ke saath coexistence aur migration</h3>
<p>Zyadatar networks step by step migrate karte hain, isliye SR aur LDP saath chalte hain. Dono same loopback ke liye labels allocate karte hain: ek LDP label aur ek prefix-SID label. Router ko chunna padta hai ki kaunsa install kare. Aam rule: <b>prefix ka SR label ho aur next hop SR support kare to SR use karo; warna LDP.</b> Preference <code>sr-prefer</code> (XR, IS-IS address family ke neeche: <code>segment-routing mpls sr-prefer</code>) ya <code>sr-label-preferred</code> (XE) se control karte hain. Phir LDP ko core se dheere-dheere hata sakte hain aur sirf jahan zaroori ho wahan rakh sakte hain.</p>
<p>Jo device LDP support karta hai lekin SR nahi, woh problem hai: SR label chain wahan toot jaati hai. <b>Segment routing mapping server (SRMS)</b> ulte case ko solve karta hai. Mapping server ke roop mein configured router LDP-only ya non-SR prefixes ki <i>taraf se</i> prefix-SIDs advertise karta hai, taaki SR-capable routers unke tak bhi SR path bana sakein. <b>Mapping client</b> in mappings ko receive karke use karta hai. Boundary par <b>SR-LDP interworking</b> node SRMS entries use karke SR label aur LDP label ke beech swap karta hai, taaki label-switched path dono domains cross kare.</p>
<table class="cmp"><tr><th>Situation</th><th>Solution</th></tr><tr><td>Saare routers SR support karte hain</td><td>Sirf SR, stable hone par LDP hatao</td></tr><tr><td>Kuch routers LDP-only hain</td><td>SRMS unke liye SIDs advertise karta hai; interworking node SR aur LDP swap karta hai</td></tr><tr><td>Dono labels hon to SR prefer karo</td><td>sr-prefer (XR) ya sr-label-preferred (XE)</td></tr><tr><td>Vendor par alag SRGB</td><td>Ho sake to matching SRGB; nahi to per-neighbour label computation par bharosa</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Aath routers P1 se P8 core banate hain. Aap pehle core ko SR par le jaate ho. Step 1: har jagah SRGB 16000 se 23999 define karo. Step 2: IS-IS mein segment-routing mpls enable karo aur loopbacks ko index 1 se 8 do. Step 3: check karo ki labels 16001 se 16008 forwarding table mein expected next hops ke saath hain. Step 4: sr-prefer enable karo taaki SR labels use hon. Step 5: monitoring period ke baad core interfaces se LDP hatao. Har step par door ke loopback ko ping sr-mpls karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>metric-style wide</code> bhoolna, ya aise loopback par prefix-SID lagana jo IS-IS mein advertise nahi hota (jaise <code>passive</code> ke bina ya IS-IS process mein nahi). Do alag routers ko same index dena bhi galti hai. Teesri galti: har router par SRGB check na karna aur ek platform ka alag range use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mapping server un <i>prefixes ke SIDs advertise karta hai jo SR-enabled nahi hain</i>; woh LDP routers ko SR routers nahi banata. Default SRGB 16000 se 23999 hai. SR aur LDP ke beech preference local choice hai aur soch-samajh kar set karni chahiye.</p></div>
<div class="scn"><h4>SR core mein LDP-only edge</h4><p>Staged migration ke dauran ek purana aggregation router sirf LDP support karta tha. Uske through traffic ne boundary par labels kho diye aur customer VPN toot gaya. Team ne core par mapping server configure kiya jo aggregation router loopbacks ke prefix-SIDs advertise kare, aur border router par SR-LDP interworking enable ki. Phir traffic bina outage ke dono label domains cross kar gaya.</p><p><b>Lesson:</b> SR aur LDP ke beech boundary plan karo; mapping server aur interworking node use bridge karte hain.</p></div>
<div class="iv"><p class="q">"Migration ke dauran SR aur LDP saath kaise rehte hain?"</p><p>Dono saath chal sakte hain. Prefix ke dono labels hon to router SR ko prefer karta hai jab aisa configured ho (XR par sr-prefer, XE par sr-label-preferred). LDP-only ya non-SR routers ke liye segment routing mapping server unki taraf se prefix-SIDs advertise karta hai, aur interworking node SR aur LDP labels ke beech swap karta hai. Sab verify hone ke baad core se LDP hata dete hain. Har step se pehle SRGB, SID uniqueness aur label table check karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS par minimum SR: SRGB, segment-routing mpls, Loopback0 par prefix-SID index, metric-style wide.</li>
<li>IOS XR SID ko IS-IS mein loopback ke neeche set karta hai; IOS XE connected-prefix-sid-map use karta hai.</li>
<li>SRGB, IS-IS database ke SIDs, label table aur FIB verify karo.</li>
<li>SR aur LDP coexist karte hain; sr-prefer ya sr-label-preferred choice set karta hai.</li>
<li>Mapping server non-SR prefixes ke SIDs advertise karta hai; interworking boundary par labels swap karta hai.</li>
</ul></div>
`}};export{e as default};