var e={id:`layer2-protocol-tunneling`,h:{en:`Layer 2 protocol tunnelling: STP and LLDP across the provider`,hi:`Layer 2 protocol tunnelling: provider ke paar STP aur LLDP`},body:{en:`
<p>Q-in-Q carries customer <i>data</i> frames across the provider network. A customer, though, also runs control protocols such as spanning tree and LLDP between its two sites. Those protocols use <b>reserved link-local multicast addresses</b> (for example 01:80:c2:00:00:00 for STP and 01:80:c2:00:00:0e for LLDP). By standard, bridges never forward frames sent to these addresses: they either process or drop them. So by default the provider edge swallows the customer's BPDUs, the two customer switches never see each other, and each one believes it is alone. If a loop exists across the two sites, nothing blocks it. <b>Layer 2 protocol tunnelling (L2PT)</b> fixes this.</p>

<h3>How L2PT works</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="L2PT">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="55" y="100" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="160" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="215" y="88" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><text x="215" y="108" text-anchor="middle" class="svg-muted" font-size="11">rewrite dst MAC</text>
<rect x="370" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="425" y="88" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><text x="425" y="108" text-anchor="middle" class="svg-muted" font-size="11">restore dst MAC</text>
<rect x="540" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="585" y="100" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<line x1="100" y1="95" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="370" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="540" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="130" y="85" text-anchor="middle" class="svg-muted" font-size="10">BPDU</text><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="11">tunnel MAC (forwarded)</text><text x="510" y="85" text-anchor="middle" class="svg-muted" font-size="10">BPDU</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">The provider treats the frame as ordinary multicast, so it crosses the S-VLAN</text>
</svg><p class="cap">Rewrite on ingress, restore on egress: the customer sees one wire.</p></div>
<ul>
<li><b>Ingress PE</b> receives a customer control frame, rewrites its destination to a tunnel multicast MAC that bridges treat as normal, and forwards it in the S-VLAN.</li>
<li><b>Egress PE</b> recognises the tunnel MAC, restores the original destination address and sends the frame out to the customer.</li>
<li>Customer devices see each other as directly connected neighbours, as if one cable joined them.</li>
<li>Typical tunnelled protocols: STP (and RSTP and MSTP BPDUs), LLDP, CDP-style and VTP-style frames, and LACP/slow protocols where supported.</li>
</ul>

<h3>The lab: STP and LLDP through ACME's service</h3>
<p>Both PEs enable mac-rewrite on the ACME-facing interface for the protocols that should cross:</p>
<pre class="code">set protocols layer2-control mac-rewrite interface ge-0/0/1 protocol stp
set protocols layer2-control mac-rewrite interface ge-0/0/1 protocol lldp</pre>
<pre class="out">lab@PE1&gt; show configuration protocols layer2-control
mac-rewrite {
    interface ge-0/0/1 {
        protocol [ stp lldp ];
    }
}</pre>
<p>On the customer side, the two sites only run <code>rstp</code> and <code>lldp interface all</code>:</p>
<pre class="out">lab@CE2&gt; show configuration protocols
rstp;
lldp {
    interface all;
}</pre>
<p>Now CE2 sees CE1 as a neighbour, although the two are separated by two provider switches:</p>
<pre class="out">lab@CE2&gt; show lldp neighbors
Local Interface    Parent Interface    Chassis Id          Port info          System Name
ge-0/0/0           -                   52:54:1c:58:b9:00   ge-0/0/0           CE1</pre>
<p>And spanning tree sees across the provider too: CE2's port toward the provider is the root port, and the designated bridge ID is the CE1 bridge (its MAC part matches the LLDP chassis ID above):</p>
<pre class="out">lab@CE2&gt; show spanning-tree interface

Spanning tree interface parameters for instance 0

Interface                  Port ID    Designated         Designated         Port    State  Role
                                     port ID           bridge ID          Cost
ge-0/0/0                   128:1      128:1     4096.52541c58b900    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2    32768.52541f58be00    20000  FWD    DESG</pre>
<p>The PE counters confirm that the frames really are tunnelled:</p>
<pre class="out">lab@PE1&gt; show ethernet-switching layer2-protocol-tunneling statistics

Interface       Protocol  Encapsulated  Decapsulated  Dropped
ge-0/0/1        stp       6             6             0
ge-0/0/1        lldp      1             1             0</pre>
<p>Encapsulated counts frames the PE rewrote and sent into the provider; Decapsulated counts frames restored for the customer; Dropped should stay at zero. The simulator keeps the counters only for the interface and protocols that were enabled.</p>

<h3>Design points</h3>
<ul>
<li><b>Which protocols.</b> Tunnel what the customer needs. Many providers allow STP and LLDP only. Tunnelling more increases the risk that a customer's mistake spills into the provider network.</li>
<li><b>Loop prevention is now the customer's job.</b> Because the provider does not run the customer's STP, the customer's spanning tree must run end to end and block any loop. Provider and customer STP stay separate.</li>
<li><b>Rate limiting.</b> Control frames should be rate limited at the edge, because a misbehaving customer device could flood the S-VLAN with them.</li>
<li><b>Both ends.</b> Rewrite and restore must be configured on both PEs and for the same protocols.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer ACME wants RSTP between sites so that the two redundant links between its core switches do not loop. Without L2PT, each core switch sees no BPDU and forwards on both links, creating a loop. With mac-rewrite for stp on both PEs, the BPDUs cross, the customer root is elected once, and one link blocks.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring L2PT on one PE only. BPDUs are rewritten on the way in, but nobody restores them on the far side, which sees an unknown multicast and drops it. Also, enabling the feature on a provider-facing NNI link rather than the customer-facing interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> L2PT does not make the provider run the customer's STP, and it does not carry the customer's data. Data uses the Q-in-Q service VLAN. L2PT carries the control protocols. The question &quot;why can the customer not see its LLDP neighbour at the other site?&quot; has the answer: tunnelling is not enabled for LLDP on the customer-facing interface.</p></div>

<div class="scn"><h4>The loop nobody blocked</h4><p>A customer connected two offices through a provider with Q-in-Q, and a second backup link by a leased line. Within hours the office network crawled with broadcast traffic. The customer's switches had never seen each other's BPDUs through the provider, so no port was blocked on either link. After enabling STP tunnelling on both PEs, show spanning-tree on the customer switch showed one root and one blocked path.</p><p><b>Lesson:</b> a Layer 2 service is only transparent if the control protocols cross, too.</p></div>

<div class="iv"><p class="q">"Why do customers need L2PT over Q-in-Q?"</p><p>Control protocols such as STP and LLDP use reserved multicast addresses that bridges do not forward, so the provider drops them. L2PT rewrites the destination at the ingress PE to a forwardable tunnel address and restores it at the egress PE, so the customer sees one transparent link. I verify with show lldp neighbors, show spanning-tree and the L2PT statistics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reserved control multicast addresses are not forwarded by bridges, so STP and LLDP stop at the PE without L2PT.</li>
<li>mac-rewrite under layer2-control rewrites on ingress, and the far PE restores.</li>
<li>Enable it on both PEs for the same protocols, on the customer-facing interface.</li>
<li>Check show lldp neighbors, show spanning-tree interface and the L2PT statistics.</li>
</ul></div>
`,hi:`
<p>Q-in-Q customer ke <i>data</i> frames provider network se le jaata hai. Lekin customer apni do sites ke beech spanning tree aur LLDP jaise control protocols bhi chalata hai. Yeh protocols <b>reserved link-local multicast addresses</b> use karte hain (jaise STP ke liye 01:80:c2:00:00:00 aur LLDP ke liye 01:80:c2:00:00:0e). Standard ke hisaab se bridges in addresses par bheje frames kabhi forward nahi karte: ya process karte hain ya drop. Isliye default mein provider edge customer ke BPDUs nigal leta hai, dono customer switches ek doosre ko kabhi nahi dekhte, aur har ek sochta hai woh akela hai. Agar dono sites ke beech loop ho to use koi block nahi karta. <b>Layer 2 protocol tunnelling (L2PT)</b> yeh theek karta hai.</p>

<h3>L2PT kaise kaam karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="L2PT">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="55" y="100" text-anchor="middle" class="svg-ink" font-size="13">CE1</text>
<rect x="160" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="215" y="88" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><text x="215" y="108" text-anchor="middle" class="svg-muted" font-size="11">dst MAC rewrite</text>
<rect x="370" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="425" y="88" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><text x="425" y="108" text-anchor="middle" class="svg-muted" font-size="11">dst MAC restore</text>
<rect x="540" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="585" y="100" text-anchor="middle" class="svg-ink" font-size="13">CE2</text>
<line x1="100" y1="95" x2="160" y2="95" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="370" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="540" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="130" y="85" text-anchor="middle" class="svg-muted" font-size="10">BPDU</text><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="11">tunnel MAC (forward hota hai)</text><text x="510" y="85" text-anchor="middle" class="svg-muted" font-size="10">BPDU</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Provider frame ko aam multicast maanta hai, isliye woh S-VLAN paar kar jaata hai</text>
</svg><p class="cap">Ingress par rewrite, egress par restore: customer ko ek wire dikhta hai.</p></div>
<ul>
<li><b>Ingress PE</b> customer control frame receive karta hai, uska destination aise tunnel multicast MAC mein rewrite karta hai jise bridges normal maante hain, aur S-VLAN mein forward karta hai.</li>
<li><b>Egress PE</b> tunnel MAC pehchanta hai, original destination address restore karta hai aur frame customer ko bhejta hai.</li>
<li>Customer devices ek doosre ko seedhe jude padosi ki tarah dekhte hain, jaise ek cable ne jodha ho.</li>
<li>Aam tunnelled protocols: STP (aur RSTP, MSTP BPDUs), LLDP, CDP-style aur VTP-style frames, aur jahan supported ho LACP/slow protocols.</li>
</ul>

<h3>Lab: ACME ki service se STP aur LLDP</h3>
<p>Dono PEs ACME-facing interface par un protocols ke liye mac-rewrite enable karte hain jinhe paar jaana hai:</p>
<pre class="code">set protocols layer2-control mac-rewrite interface ge-0/0/1 protocol stp
set protocols layer2-control mac-rewrite interface ge-0/0/1 protocol lldp</pre>
<pre class="out">lab@PE1&gt; show configuration protocols layer2-control
mac-rewrite {
    interface ge-0/0/1 {
        protocol [ stp lldp ];
    }
}</pre>
<p>Customer side par dono sites sirf <code>rstp</code> aur <code>lldp interface all</code> chalate hain:</p>
<pre class="out">lab@CE2&gt; show configuration protocols
rstp;
lldp {
    interface all;
}</pre>
<p>Ab CE2 CE1 ko padosi ki tarah dekhta hai, jabki dono ke beech do provider switches hain:</p>
<pre class="out">lab@CE2&gt; show lldp neighbors
Local Interface    Parent Interface    Chassis Id          Port info          System Name
ge-0/0/0           -                   52:54:1c:58:b9:00   ge-0/0/0           CE1</pre>
<p>Aur spanning tree bhi provider ke paar dekhta hai: provider ki taraf CE2 ka port root port hai, aur designated bridge ID CE1 bridge hai (iska MAC part upar ke LLDP chassis ID se match karta hai):</p>
<pre class="out">lab@CE2&gt; show spanning-tree interface

Spanning tree interface parameters for instance 0

Interface                  Port ID    Designated         Designated         Port    State  Role
                                     port ID           bridge ID          Cost
ge-0/0/0                   128:1      128:1     4096.52541c58b900    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2    32768.52541f58be00    20000  FWD    DESG</pre>
<p>PE counters confirm karte hain ki frames asal mein tunnel ho rahe hain:</p>
<pre class="out">lab@PE1&gt; show ethernet-switching layer2-protocol-tunneling statistics

Interface       Protocol  Encapsulated  Decapsulated  Dropped
ge-0/0/1        stp       6             6             0
ge-0/0/1        lldp      1             1             0</pre>
<p>Encapsulated un frames ko ginta hai jo PE ne rewrite karke provider mein bheje; Decapsulated customer ke liye restore kiye gaye frames ko; Dropped zero rehna chahiye. Simulator counters sirf us interface aur un protocols ke liye rakhta hai jo enable kiye gaye.</p>

<h3>Design points</h3>
<ul>
<li><b>Kaunse protocols.</b> Wahi tunnel karo jo customer ko chahiye. Kai providers sirf STP aur LLDP allow karte hain. Zyaada tunnel karne se customer ki galti provider network mein failne ka risk badhta hai.</li>
<li><b>Loop prevention ab customer ka kaam hai.</b> Provider customer ka STP nahi chalata, isliye customer ka spanning tree end to end chalna chahiye aur kisi bhi loop ko block karna chahiye. Provider aur customer STP alag rehte hain.</li>
<li><b>Rate limiting.</b> Control frames edge par rate limit hone chahiye, kyunki galat behave karta customer device S-VLAN ko inse flood kar sakta hai.</li>
<li><b>Dono ends.</b> Rewrite aur restore dono PEs par aur same protocols ke liye configure hone chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer ACME sites ke beech RSTP chahta hai taaki uske core switches ke beech do redundant links loop na banayein. L2PT ke bina har core switch ko koi BPDU nahi milta aur woh dono links par forward karta hai, loop ban jaata hai. Dono PEs par stp ke liye mac-rewrite se BPDUs paar jaate hain, customer root ek baar elect hota hai, aur ek link block hota hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> L2PT sirf ek PE par configure karna. BPDUs andar aate waqt rewrite hote hain, par door side par koi restore nahi karta, woh unknown multicast dekhta hai aur drop kar deta hai. Aur: feature ko customer-facing interface ke bajaye provider-facing NNI link par enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> L2PT provider ko customer ka STP chalane nahi deta, aur customer ka data carry nahi karta. Data Q-in-Q service VLAN use karta hai. L2PT control protocols carry karta hai. Sawaal &quot;customer doosri site ke apne LLDP padosi ko kyun nahi dekh paata?&quot; ka jawab: customer-facing interface par LLDP ke liye tunnelling enable nahi hai.</p></div>

<div class="scn"><h4>Loop jise kisi ne block nahi kiya</h4><p>Ek customer ne do offices ko Q-in-Q wale provider se aur ek backup link leased line se jodha. Kuch ghanton mein office network broadcast traffic se rengne laga. Customer ke switches ne provider se hokar ek doosre ke BPDUs kabhi dekhe hi nahi the, isliye kisi link par koi port block nahi hua. Dono PEs par STP tunnelling enable karne ke baad customer switch par show spanning-tree ne ek root aur ek blocked path dikhaya.</p><p><b>Lesson:</b> Layer 2 service tabhi transparent hai jab control protocols bhi paar jaayein.</p></div>

<div class="iv"><p class="q">"Q-in-Q ke upar customers ko L2PT kyun chahiye?"</p><p>STP aur LLDP jaise control protocols reserved multicast addresses use karte hain jo bridges forward nahi karte, isliye provider unhe drop kar deta hai. L2PT ingress PE par destination ko forward hone layak tunnel address mein rewrite karta hai aur egress PE par restore karta hai, taaki customer ko ek transparent link dikhe. Main show lldp neighbors, show spanning-tree aur L2PT statistics se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reserved control multicast addresses bridges forward nahi karte, isliye L2PT ke bina STP aur LLDP PE par ruk jaate hain.</li>
<li>layer2-control ke neeche mac-rewrite ingress par rewrite karta hai, door wala PE restore karta hai.</li>
<li>Dono PEs par same protocols ke liye, customer-facing interface par enable karo.</li>
<li>show lldp neighbors, show spanning-tree interface aur L2PT statistics check karo.</li>
</ul></div>
`}};export{e as default};