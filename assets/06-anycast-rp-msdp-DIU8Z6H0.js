var e={id:`anycast-rp-msdp`,h:{en:`Anycast RP and MSDP: two RPs, one address`,hi:`Anycast RP aur MSDP: do RPs, ek address`},body:{en:`
<p>A single RP is a single point of failure, and it can also be far from some sources and receivers. <b>Anycast RP</b> solves both. Two (or more) routers are configured with the <b>same RP address</b> on a loopback. Unicast routing sends every register and every join to the <b>nearest</b> owner of that address, and if one RP dies, the IGP converges and traffic goes to the other, with no change on any PIM router. The price is a new problem: a source may register with RP-A while the receivers joined RP-B. The RPs must <b>share source information</b>.</p>

<h3>Two ways to share sources</h3>
<ul>
<li><b>MSDP</b> (Multicast Source Discovery Protocol, RFC 3618): a TCP session (port 639) between RPs. When RP-A learns a new source through a Register, it sends a <b>Source-Active (SA)</b> message to its MSDP peers. An RP that has receivers for that group (a (*,G) entry) then sends an (S,G) join toward the source.</li>
<li><b>PIM anycast RP</b> (RFC 4610): each RP forwards received Registers to the other RPs in an <b>rp-set</b> of unique addresses. No MSDP session is needed.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Anycast RP with MSDP">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#fde68a"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text>
<rect x="150" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="20" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="355" y="43" text-anchor="middle" class="svg-ink" font-size="13">RP-A</text><text x="355" y="62" text-anchor="middle" class="svg-muted" font-size="11">.11 + anycast .100</text>
<rect x="290" y="145" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="355" y="168" text-anchor="middle" class="svg-ink" font-size="13">RP-B</text><text x="355" y="187" text-anchor="middle" class="svg-muted" font-size="11">.12 + anycast .100</text>
<rect x="470" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="580" y="85" width="50" height="50" rx="8" fill="#bbf7d0"/><text x="605" y="115" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="100" x2="290" y2="55" stroke="#64748b" stroke-width="2"/><line x1="230" y1="120" x2="290" y2="165" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="165" x2="470" y2="120" stroke="#64748b" stroke-width="2"/><line x1="550" y1="110" x2="580" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="355" y1="75" x2="355" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="440" y="116" text-anchor="middle" class="svg-accent" font-size="11">MSDP SA</text>
<text x="230" y="215" text-anchor="middle" class="svg-muted" font-size="12">R1 registers to nearest (RP-A); R4 joins nearest (RP-B)</text>
</svg><p class="cap">Registers and joins land on different RPs; MSDP bridges them.</p></div>

<h3>Lab: two RPs for the Pune streaming service</h3>
<p>In lab jmc-anycast-msdp the RPs are RP-A (unique 10.62.255.11) and RP-B (unique 10.62.255.12). R1 is closest to RP-A, R4 closest to RP-B. The anycast address 10.62.255.100/32 goes on both loopbacks, and the unique address stays <b>primary</b>.</p>
<pre class="code"><span class="c"># on RP-A and RP-B</span>
set interfaces lo0 unit 0 family inet address 10.62.255.100/32
set protocols pim rp local address 10.62.255.100
<span class="c"># every other router</span>
set protocols pim rp static address 10.62.255.100</pre>
<pre class="out">lab@R1&gt; show route 10.62.255.100
10.62.255.100/32   *[OSPF/10] 00:00:20, metric 10
                    &gt;  to 10.62.1.2 via ge-0/0/1.0</pre>
<p>R1 reaches the anycast address through ge-0/0/1, toward RP-A. Now PC1 is already a member and SRC sends three packets to 239.62.5.5. Nothing arrives, and the two RPs explain why:</p>
<pre class="out">lab@RP-A&gt; show pim rps extensive
RP: 10.62.255.100
Learned via: local configuration (this router is the RP)
Register State for RP:
Group           Source          FirstHop        RP Address      State       Timeout
<span class="hl">239.62.5.5      10.62.10.50     10.62.10.1      10.62.255.100   Receive     0</span>

lab@RP-B&gt; show pim join
Group: 239.62.5.5
    Source: *
    RP: 10.62.255.100
    Flags: sparse,rptree,wildcard
    <span class="hl">Upstream interface: Local</span></pre>
<p>RP-A holds the source's Register but has no receivers. RP-B holds the (*,G) from R4 but never saw the source. Neither can connect them. The fix is MSDP between the <b>unique</b> loopbacks, never between the anycast address:</p>
<pre class="code"><span class="c"># RP-A</span>
set protocols msdp local-address 10.62.255.11
set protocols msdp group ANYCAST mode mesh-group
set protocols msdp group ANYCAST peer 10.62.255.12
<span class="c"># RP-B: mirror image, local-address 10.62.255.12, peer 10.62.255.11</span></pre>
<p>A <b>mesh group</b> tells the RPs that all members peer with each other, so an SA received from one member is not re-flooded to the others (no peer-RPF check needed). After a new source starts, RP-B has the SA:</p>
<pre class="out">lab@RP-B&gt; show msdp
Peer address    Local address   State       Last up/down Peer-Group           SA Count
10.62.255.11    10.62.255.12    <span class="hl">Established</span>     00:00:20 ANYCAST              1/1

lab@RP-B&gt; show msdp source-active
Group address   Source address  Peer address    Originator      Flags
239.62.5.5      10.62.10.50     10.62.255.11    10.62.255.11    Accept</pre>
<p>PC1 now receives the channel: RP-B joined the source because it has a (*,G) and an SA, and the stream flows over the shortest path. The SA cache entry lists the peer that sent it and the originator RP.</p>

<h3>Failover test</h3>
<p>For maintenance the lab disables ge-0/0/0 and ge-0/0/1 on RP-A. OSPF removes RP-A's path to the anycast address, so R1's registers now go to RP-B, and PC1 still receives the stream:</p>
<pre class="out">lab@R1&gt; show pim join extensive
Group: 239.62.5.5
    Source: 10.62.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: Direct
    Upstream state: Local Source
    Downstream neighbors:
        Interface: ge-0/0/2.0
            <span class="hl">10.62.2.2</span> State: Join Flags: S</pre>
<p>R1's downstream neighbour is now 10.62.2.2, which is RP-B. Nothing was reconfigured on R1, R4 or the receivers.</p>

<h3>Design rules for anycast RP</h3>
<ul>
<li>The anycast address must <b>never</b> be the router ID or the MSDP local address. Keep the unique address as <code>primary</code> on lo0.</li>
<li>Each RP needs a peer entry for every other RP (a full mesh), or use the PIM anycast method.</li>
<li>Advertise both loopbacks in the IGP and run PIM on lo0.</li>
<li>MSDP also connects separate PIM domains; there a default peer or peer-RPF rules matter.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Three RPs share 10.62.255.100. A source registers with the nearest, RP-1. RP-1 sends SA messages to RP-2 and RP-3 over the mesh. Receivers joined RP-3 and RP-2 respectively. Both now send (S,G) joins to the source's first-hop router, and the stream reaches every receiver. Mesh-group mode prevents RP-2 from re-flooding the SA to RP-3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Peering MSDP between the anycast addresses (both routers own it, so it loops back to itself) or using the anycast address as router ID. Another mistake: building anycast RP with no MSDP and no PIM anycast; it works only when source and receivers happen to pick the same RP.</p></div>
<div class="exam"><p><b>Exam trap.</b> MSDP shares sources, not group membership. An RP sends an (S,G) join only if it has receivers for the group. MSDP runs over TCP 639 and uses the unique addresses.</p></div>

<div class="scn"><h4>The stream that depended on luck</h4><p>A media team deployed two RPs with the same address but forgot MSDP. For months streams worked, because most sources and viewers happened to reach the same RP. After an OSPF cost change, a source registered with the other RP and viewers saw nothing. Adding the MSDP mesh made the result independent of which RP was nearest.</p><p><b>Lesson:</b> anycast RP without source sharing works by accident only.</p></div>

<div class="iv"><p class="q">"Why does anycast RP need MSDP?"</p><p>Unicast sends the register to the nearest RP and the join to the nearest RP, which may be different routers. MSDP lets the RP that heard the source tell the RP that has the receivers. I would use the unique loopbacks for peering and mention PIM anycast RP as the alternative without MSDP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP gives RP redundancy and shortest-RP selection through unicast routing.</li>
<li>RPs must exchange sources with MSDP (TCP 639) or PIM anycast RP.</li>
<li>Peer between unique loopbacks; keep the unique address primary on lo0.</li>
<li>A mesh group stops SAs being re-flooded.</li>
<li>Verify with show msdp, show msdp source-active and show pim rps extensive.</li>
</ul></div>
`,hi:`
<p>Ek RP single point of failure hai, aur kuch sources aur receivers se door bhi ho sakta hai. <b>Anycast RP</b> dono solve karta hai. Do (ya zyada) routers par loopback par <b>same RP address</b> configure hota hai. Unicast routing har register aur har join ko us address ke <b>sabse paas wale</b> owner ke paas bhejti hai, aur ek RP mar jaye to IGP converge hota hai aur traffic doosre ke paas jaata hai, kisi PIM router par kuch badle bina. Iski keemat ek nayi problem hai: source RP-A ke paas register kar sakta hai jabki receivers ne RP-B ko join kiya. RPs ko <b>source information share</b> karni padti hai.</p>

<h3>Sources share karne ke do tareeke</h3>
<ul>
<li><b>MSDP</b> (Multicast Source Discovery Protocol, RFC 3618): RPs ke beech TCP session (port 639). Jab RP-A Register se naya source seekhta hai, woh apne MSDP peers ko <b>Source-Active (SA)</b> message bhejta hai. Jis RP ke paas us group ke receivers hain ((*,G) entry) woh source ki taraf (S,G) join bhejta hai.</li>
<li><b>PIM anycast RP</b> (RFC 4610): har RP mile Registers ko unique addresses ke <b>rp-set</b> ke doosre RPs ko forward karta hai. MSDP session ki zaroorat nahi.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MSDP ke saath Anycast RP">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#fde68a"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text>
<rect x="150" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="20" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="355" y="43" text-anchor="middle" class="svg-ink" font-size="13">RP-A</text><text x="355" y="62" text-anchor="middle" class="svg-muted" font-size="11">.11 + anycast .100</text>
<rect x="290" y="145" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="355" y="168" text-anchor="middle" class="svg-ink" font-size="13">RP-B</text><text x="355" y="187" text-anchor="middle" class="svg-muted" font-size="11">.12 + anycast .100</text>
<rect x="470" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<rect x="580" y="85" width="50" height="50" rx="8" fill="#bbf7d0"/><text x="605" y="115" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="230" y1="100" x2="290" y2="55" stroke="#64748b" stroke-width="2"/><line x1="230" y1="120" x2="290" y2="165" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="165" x2="470" y2="120" stroke="#64748b" stroke-width="2"/><line x1="550" y1="110" x2="580" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="355" y1="75" x2="355" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="440" y="116" text-anchor="middle" class="svg-accent" font-size="11">MSDP SA</text>
<text x="230" y="215" text-anchor="middle" class="svg-muted" font-size="12">R1 sabse paas wale (RP-A) ko register karta hai; R4 sabse paas wale (RP-B) ko join</text>
</svg><p class="cap">Registers aur joins alag RPs par pahunchte hain; MSDP unhe jodta hai.</p></div>

<h3>Lab: Pune streaming service ke liye do RPs</h3>
<p>Lab jmc-anycast-msdp mein RPs RP-A (unique 10.62.255.11) aur RP-B (unique 10.62.255.12) hain. R1 RP-A ke sabse paas hai, R4 RP-B ke. Anycast address 10.62.255.100/32 dono loopbacks par jaata hai, aur unique address <b>primary</b> rehta hai.</p>
<pre class="code"><span class="c"># RP-A aur RP-B par</span>
set interfaces lo0 unit 0 family inet address 10.62.255.100/32
set protocols pim rp local address 10.62.255.100
<span class="c"># baaki har router</span>
set protocols pim rp static address 10.62.255.100</pre>
<pre class="out">lab@R1&gt; show route 10.62.255.100
10.62.255.100/32   *[OSPF/10] 00:00:20, metric 10
                    &gt;  to 10.62.1.2 via ge-0/0/1.0</pre>
<p>R1 anycast address tak ge-0/0/1 se, yaani RP-A ki taraf, pahunchta hai. Ab PC1 pehle se member hai aur SRC 239.62.5.5 par teen packets bhejta hai. Kuch nahi pahunchta, aur dono RPs batate hain kyun:</p>
<pre class="out">lab@RP-A&gt; show pim rps extensive
RP: 10.62.255.100
Learned via: local configuration (this router is the RP)
Register State for RP:
Group           Source          FirstHop        RP Address      State       Timeout
<span class="hl">239.62.5.5      10.62.10.50     10.62.10.1      10.62.255.100   Receive     0</span>

lab@RP-B&gt; show pim join
Group: 239.62.5.5
    Source: *
    RP: 10.62.255.100
    Flags: sparse,rptree,wildcard
    <span class="hl">Upstream interface: Local</span></pre>
<p>RP-A ke paas source ka Register hai lekin receivers nahi. RP-B ke paas R4 ka (*,G) hai lekin usne source kabhi nahi dekha. Koi unhe jod nahi sakta. Fix <b>unique</b> loopbacks ke beech MSDP hai, anycast address ke beech kabhi nahi:</p>
<pre class="code"><span class="c"># RP-A</span>
set protocols msdp local-address 10.62.255.11
set protocols msdp group ANYCAST mode mesh-group
set protocols msdp group ANYCAST peer 10.62.255.12
<span class="c"># RP-B: mirror image, local-address 10.62.255.12, peer 10.62.255.11</span></pre>
<p><b>Mesh group</b> RPs ko batata hai ki saare members ek doosre se peer karte hain, isliye ek member se mila SA baaki ko dobara flood nahi hota (peer-RPF check ki zaroorat nahi). Naya source shuru hone ke baad RP-B ke paas SA hota hai:</p>
<pre class="out">lab@RP-B&gt; show msdp
Peer address    Local address   State       Last up/down Peer-Group           SA Count
10.62.255.11    10.62.255.12    <span class="hl">Established</span>     00:00:20 ANYCAST              1/1

lab@RP-B&gt; show msdp source-active
Group address   Source address  Peer address    Originator      Flags
239.62.5.5      10.62.10.50     10.62.255.11    10.62.255.11    Accept</pre>
<p>PC1 ko ab channel milta hai: RP-B ne source ko join kiya kyunki uske paas (*,G) aur SA dono hain, aur stream shortest path se bahti hai. SA cache entry us peer ko list karti hai jisne bheja aur originator RP ko.</p>

<h3>Failover test</h3>
<p>Maintenance ke liye lab RP-A ke ge-0/0/0 aur ge-0/0/1 disable karta hai. OSPF RP-A ka path anycast address tak hata deta hai, isliye R1 ke registers ab RP-B ke paas jaate hain, aur PC1 ko phir bhi stream milti hai:</p>
<pre class="out">lab@R1&gt; show pim join extensive
Group: 239.62.5.5
    Source: 10.62.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: Direct
    Upstream state: Local Source
    Downstream neighbors:
        Interface: ge-0/0/2.0
            <span class="hl">10.62.2.2</span> State: Join Flags: S</pre>
<p>R1 ka downstream neighbour ab 10.62.2.2 hai, jo RP-B hai. R1, R4 ya receivers par kuch dobara configure nahi karna pada.</p>

<h3>Anycast RP ke design rules</h3>
<ul>
<li>Anycast address kabhi router ID ya MSDP local address <b>nahi</b> hona chahiye. Unique address ko lo0 par <code>primary</code> rakho.</li>
<li>Har RP ko har doosre RP ke liye peer entry chahiye (full mesh), ya PIM anycast method use karo.</li>
<li>Dono loopbacks ko IGP mein advertise karo aur lo0 par PIM chalao.</li>
<li>MSDP alag PIM domains ko bhi jodta hai; wahan default peer ya peer-RPF rules matter karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Teen RPs 10.62.255.100 share karte hain. Source sabse paas wale RP-1 ko register karta hai. RP-1 mesh se RP-2 aur RP-3 ko SA messages bhejta hai. Receivers ne kramash RP-3 aur RP-2 ko join kiya tha. Dono ab source ke first-hop router ko (S,G) joins bhejte hain, aur stream har receiver tak pahunchti hai. Mesh-group mode RP-2 ko SA dobara RP-3 ko flood karne se rokta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> MSDP ko anycast addresses ke beech peer karna (dono ke paas woh hai, isliye woh khud ko hi loop ho jaata hai) ya anycast address ko router ID banana. Ek aur galti: bina MSDP aur bina PIM anycast ke anycast RP banana; woh tabhi chalta hai jab source aur receivers sanyog se same RP chunein.</p></div>
<div class="exam"><p><b>Exam trap.</b> MSDP sources share karta hai, group membership nahi. RP (S,G) join tabhi bhejta hai jab uske paas us group ke receivers hon. MSDP TCP 639 par chalta hai aur unique addresses use karta hai.</p></div>

<div class="scn"><h4>Stream jo kismat par chalti thi</h4><p>Ek media team ne same address wale do RPs lagaye lekin MSDP bhool gaye. Mahino stream chali, kyunki zyadatar sources aur viewers sanyog se same RP tak pahunchte the. OSPF cost change ke baad ek source ne doosre RP ko register kiya aur viewers ko kuch nahi dikha. MSDP mesh jodne se nateeja is par nirbhar nahi raha ki kaunsa RP sabse paas hai.</p><p><b>Lesson:</b> source sharing ke bina anycast RP sirf sanyog se chalta hai.</p></div>

<div class="iv"><p class="q">"Anycast RP ko MSDP kyun chahiye?"</p><p>Unicast register ko sabse paas wale RP ko bhejta hai aur join ko bhi sabse paas wale RP ko, jo alag routers ho sakte hain. MSDP source sunne wale RP ko receivers wale RP ko batane deta hai. Main peering ke liye unique loopbacks use karunga aur MSDP ke bina alternative ke roop mein PIM anycast RP batata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP unicast routing ke zariye RP redundancy aur sabse paas wale RP ka selection deta hai.</li>
<li>RPs ko sources MSDP (TCP 639) ya PIM anycast RP se exchange karne chahiye.</li>
<li>Unique loopbacks ke beech peer karo; unique address ko lo0 par primary rakho.</li>
<li>Mesh group SAs ko dobara flood hone se rokta hai.</li>
<li>show msdp, show msdp source-active aur show pim rps extensive se verify karo.</li>
</ul></div>
`}};export{e as default};