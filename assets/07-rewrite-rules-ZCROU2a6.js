var e={id:`rewrite-rules`,h:{en:`Rewrite rules, Layer 2 versus Layer 3 CoS and host traffic`,hi:`Rewrite rules, Layer 2 vs Layer 3 CoS aur host traffic`},body:{en:`
<p>The forwarding class and loss priority are internal labels. When the packet leaves the router they vanish, and the next hop sees only the header bits. A <b>rewrite rule</b> is the last step of the pipeline: on the egress logical interface it converts forwarding class and loss priority back into code points, so the next router's BA classifier can trust them. Without it the marking you worked so hard to build stops at the first hop.</p>

<h3>Writing a rewrite rule</h3>
<p>In the voice lab BR1 classifies softphone RTP with an MF filter, but the packet still leaves with DSCP 0 because nothing wrote it into the header. Add a rewrite rule on the WAN unit towards CORE1:</p>
<pre class="code"><span class="c"># config on BR1</span>
set class-of-service rewrite-rules dscp RW-WAN forwarding-class expedited-forwarding loss-priority low code-point ef
set class-of-service interfaces ge-0/0/0 unit 0 rewrite-rules dscp RW-WAN
commit</pre>
<pre class="out">lab@BR1&gt; show class-of-service rewrite-rule
Rewrite rule: RW-WAN, Code point type: dscp, Index: 31597
  Forwarding class                    Loss priority       Code point
  <span class="hl">expedited-forwarding                low                 101110</span>

lab@BR1&gt; show class-of-service interface ge-0/0/0
  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Rewrite                 RW-WAN                 dscp                    31597</span>
    Classifier              ipprec-compatibility   ip                      13</pre>
<p>(The first command's output also lists the built-in default rewrite rules; trimmed here to our rule.) Three details matter. The rule lists only the classes you want to rewrite. A class with no entry keeps whatever DSCP it arrived with. Second, the rule is bound to the <b>egress unit</b>. Third, it needs both forwarding class and loss priority, because the same class can map to different code points by loss priority (the defaults give AF11 for low and AF12 for high, for example).</p>

<h3>The whole path, end to end</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="End to end marking">
<rect x="10" y="50" width="110" height="56" rx="8" fill="#e2e8f0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">SOFTPH</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">DSCP 0</text>
<rect x="190" y="40" width="130" height="76" rx="8" fill="#bae6fd"/><text x="255" y="66" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="255" y="84" text-anchor="middle" class="svg-muted" font-size="11">MF filter: EF</text><text x="255" y="100" text-anchor="middle" class="svg-muted" font-size="11">rewrite: DSCP 46</text>
<rect x="390" y="40" width="130" height="76" rx="8" fill="#bbf7d0"/><text x="455" y="66" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text><text x="455" y="84" text-anchor="middle" class="svg-muted" font-size="11">BA classifier: EF</text><text x="455" y="100" text-anchor="middle" class="svg-muted" font-size="11">queue 1</text>
<line x1="120" y1="78" x2="190" y2="78" stroke="#64748b" stroke-width="2"/><line x1="320" y1="78" x2="390" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="355" y="68" text-anchor="middle" class="svg-accent" font-size="12">0xb8</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Each hop re-creates the internal labels from the header</text>
</svg><p class="cap">MF at the edge, rewrite on egress, BA in the core.</p></div>
<p>With the MF filter and rewrite rule on BR1 and the classifier <code>CL-CORE</code> from chapter 3 on CORE1, a test call (128 kbps UDP, 5 seconds) arrives marked and is served from queue 1:</p>
<pre class="out">lab@CORE1&gt; show interfaces queue ge-0/0/1
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                     0                     0 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    <span class="hl">Packets              :                   400                    16 pps</span>
  Transmitted:
    Packets              :                   400                    16 pps</pre>
<p>In a packet capture on the BR1 to CORE1 link, the IPv4 header shows the Differentiated Services Field as <code>0xb8</code> (DSCP 46, EF). That is DSCP times 4, as chapter 2 explained. The capture is the proof that the rewrite works; the queue counter on CORE1 is the proof that the classifier trusts it.</p>
<p>Now remove only the classifier on CORE1 (BR1 stays correct). The same call lands in the wrong queue:</p>
<pre class="out">lab@CORE1&gt; show interfaces queue ge-0/0/1
Queue: 0, Forwarding classes: best-effort
  Queued:
    <span class="hl">Packets              :                   400                    32 pps</span>
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                     0                     0 pps</pre>
<p>The packets are marked correctly, but without a BA classifier CORE1 uses <code>ipprec-compatibility</code> and puts EF into best-effort. Marking is useless unless the next hop trusts it.</p>

<h3>Layer 3 CoS versus Layer 2 CoS</h3>
<ul>
<li><b>Layer 3 (DSCP, precedence)</b> sits in the IP header and survives routing. Use it end to end across a routed network.</li>
<li><b>Layer 2 (802.1p)</b> sits in the VLAN tag and is rebuilt on every link, because a router strips the Layer 2 header. It exists only on tagged interfaces. To carry priority through a carrier or a switch you rewrite it on the tagged unit:</li>
</ul>
<pre class="code"><span class="c"># config: write 802.1p on a tagged unit towards a switch</span>
set class-of-service interfaces ge-0/0/2 unit 100 rewrite-rules ieee-802.1 default</pre>
<p>An untagged access port can be classified only by DSCP, a fixed class or an MF filter.</p>

<h3>Host outbound traffic</h3>
<p>Packets the Routing Engine itself creates (OSPF hellos, BGP, ping replies, SSH) skip ingress classification because they start inside the router. By default routing protocol packets go to network-control. You can steer and mark all host traffic with the <code>host-outbound-traffic</code> statement:</p>
<pre class="code"><span class="c"># config: send host-generated packets to network-control with DSCP CS6</span>
set class-of-service host-outbound-traffic forwarding-class network-control
set class-of-service host-outbound-traffic dscp-code-point cs6</pre>
<p>This statement is accepted by the lab devices, but the simulator has no dedicated show command for it, so no output is shown here.</p>

<div class="eg"><p><b>Worked example.</b> A packet is classified EF with loss priority low on BR1. The rewrite rule RW-WAN has one row: EF + low = 101110. The packet leaves as DSCP 46. A second packet is classified AF with loss priority high. RW-WAN has no row for AF, so it leaves unchanged with whatever DSCP it arrived with. If you wanted AF rewritten you would add a line for it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rewriting on the ingress unit; the rule works on egress. (2) A rule for loss-priority low only, while the PLP of the packet is high, so nothing matches. (3) Expecting 802.1p to survive a routed hop. (4) Forgetting that the next hop needs a classifier that trusts the new marking.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which operation turns forwarding class into DSCP bits?" A rewrite rule, on the egress logical interface. A classifier does the opposite direction and works on ingress. A second trap: rewrite rules need the forwarding class AND the loss priority to select a row.</p></div>

<div class="scn"><h4>Marked at the branch, best-effort at the core</h4><p>A bank branch marked voice correctly with a filter, and the traffic matrices still showed voice in the best-effort queue at head office. The branch router had a rewrite rule, and a capture showed DSCP 46 on the wire. The core router had never been given a classifier on that ingress interface, so it used the default table. One <code>classifiers dscp</code> binding at the core fixed it.</p><p><b>Lesson:</b> prove the marking on the wire first, then prove the queue at the next hop. The fault is on whichever side breaks the chain.</p></div>

<div class="iv"><p class="q">"Why do you need rewrite rules at all?"</p><p>Forwarding class and loss priority exist only inside the router. A rewrite rule writes them back into DSCP, precedence or 802.1p on egress, so the next hop's classifier can use them. I use it at trust boundaries, for example to set EF on traffic that an MF filter classified at the edge, and I verify with a capture and with queue counters on the next router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rewrite rules apply on the egress logical interface and use forwarding class plus loss priority.</li>
<li>Classes with no row in the rule keep their original marking.</li>
<li>DSCP survives routing; 802.1p is rebuilt per link and needs tagged interfaces.</li>
<li>The next hop must have a BA classifier that trusts the marking.</li>
<li>Host-generated traffic is steered with <code>host-outbound-traffic</code>.</li>
</ul></div>
`,hi:`
<p>Forwarding class aur loss priority internal labels hain. Packet router se bahar jaata hai to yeh gayab ho jaate hain, aur agla hop sirf header bits dekhta hai. <b>Rewrite rule</b> pipeline ka aakhri step hai: egress logical interface par yeh forwarding class aur loss priority ko wapas code points mein badalta hai, taaki agle router ka BA classifier un par bharosa kar sake. Iske bina jis marking par aapne itni mehnat ki woh pehle hop par hi ruk jaati hai.</p>

<h3>Rewrite rule likhna</h3>
<p>Voice lab mein BR1 softphone RTP ko MF filter se classify karta hai, lekin packet phir bhi DSCP 0 ke saath nikalta hai kyunki kisi ne use header mein likha nahi. CORE1 ki taraf WAN unit par rewrite rule jodo:</p>
<pre class="code"><span class="c"># config BR1 par</span>
set class-of-service rewrite-rules dscp RW-WAN forwarding-class expedited-forwarding loss-priority low code-point ef
set class-of-service interfaces ge-0/0/0 unit 0 rewrite-rules dscp RW-WAN
commit</pre>
<pre class="out">lab@BR1&gt; show class-of-service rewrite-rule
Rewrite rule: RW-WAN, Code point type: dscp, Index: 31597
  Forwarding class                    Loss priority       Code point
  <span class="hl">expedited-forwarding                low                 101110</span>

lab@BR1&gt; show class-of-service interface ge-0/0/0
  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    <span class="hl">Rewrite                 RW-WAN                 dscp                    31597</span>
    Classifier              ipprec-compatibility   ip                      13</pre>
<p>(Pehle command ke output mein built-in default rewrite rules bhi aate hain; yahan sirf hamara rule rakha gaya hai.) Teen baatein zaroori hain. Rule mein sirf woh classes hoti hain jinhe aap rewrite karna chahte ho. Jis class ki entry nahi, woh jis DSCP ke saath aayi thi wahi rakhti hai. Doosra, rule <b>egress unit</b> par bind hota hai. Teesra, ise forwarding class aur loss priority dono chahiye, kyunki ek hi class loss priority ke hisaab se alag code points par map ho sakti hai (defaults mein AF11 low ke liye aur AF12 high ke liye, jaise).</p>

<h3>Poora raasta, end to end</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="End to end marking">
<rect x="10" y="50" width="110" height="56" rx="8" fill="#e2e8f0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">SOFTPH</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">DSCP 0</text>
<rect x="190" y="40" width="130" height="76" rx="8" fill="#bae6fd"/><text x="255" y="66" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="255" y="84" text-anchor="middle" class="svg-muted" font-size="11">MF filter: EF</text><text x="255" y="100" text-anchor="middle" class="svg-muted" font-size="11">rewrite: DSCP 46</text>
<rect x="390" y="40" width="130" height="76" rx="8" fill="#bbf7d0"/><text x="455" y="66" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text><text x="455" y="84" text-anchor="middle" class="svg-muted" font-size="11">BA classifier: EF</text><text x="455" y="100" text-anchor="middle" class="svg-muted" font-size="11">queue 1</text>
<line x1="120" y1="78" x2="190" y2="78" stroke="#64748b" stroke-width="2"/><line x1="320" y1="78" x2="390" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="355" y="68" text-anchor="middle" class="svg-accent" font-size="12">0xb8</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Har hop header se internal labels dobara banata hai</text>
</svg><p class="cap">Edge par MF, egress par rewrite, core mein BA.</p></div>
<p>BR1 par MF filter aur rewrite rule, aur CORE1 par chapter 3 ka classifier <code>CL-CORE</code> ho to test call (128 kbps UDP, 5 second) marked hokar aati hai aur queue 1 se serve hoti hai:</p>
<pre class="out">lab@CORE1&gt; show interfaces queue ge-0/0/1
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                     0                     0 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    <span class="hl">Packets              :                   400                    16 pps</span>
  Transmitted:
    Packets              :                   400                    16 pps</pre>
<p>BR1 aur CORE1 ke beech link ke packet capture mein IPv4 header ka Differentiated Services Field <code>0xb8</code> (DSCP 46, EF) dikhata hai. Yeh DSCP ka 4 guna hai, jaisa chapter 2 mein bataya tha. Capture saabit karta hai ki rewrite kaam karta hai; CORE1 ka queue counter saabit karta hai ki classifier us par bharosa karta hai.</p>
<p>Ab sirf CORE1 ka classifier hata do (BR1 sahi rehta hai). Wahi call galat queue mein jaati hai:</p>
<pre class="out">lab@CORE1&gt; show interfaces queue ge-0/0/1
Queue: 0, Forwarding classes: best-effort
  Queued:
    <span class="hl">Packets              :                   400                    32 pps</span>
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                     0                     0 pps</pre>
<p>Packets sahi marked hain, lekin BA classifier ke bina CORE1 <code>ipprec-compatibility</code> use karta hai aur EF ko best-effort mein daal deta hai. Marking tab tak bekaar hai jab tak agla hop us par bharosa na kare.</p>

<h3>Layer 3 CoS vs Layer 2 CoS</h3>
<ul>
<li><b>Layer 3 (DSCP, precedence)</b> IP header mein hota hai aur routing ke paar bachta hai. Routed network mein end to end iska use karo.</li>
<li><b>Layer 2 (802.1p)</b> VLAN tag mein hota hai aur har link par dobara banta hai, kyunki router Layer 2 header hata deta hai. Yeh sirf tagged interfaces par hota hai. Carrier ya switch ke through priority le jaane ke liye aap ise tagged unit par rewrite karte ho:</li>
</ul>
<pre class="code"><span class="c"># config: switch ki taraf tagged unit par 802.1p likho</span>
set class-of-service interfaces ge-0/0/2 unit 100 rewrite-rules ieee-802.1 default</pre>
<p>Untagged access port ko sirf DSCP, fixed class ya MF filter se classify kiya ja sakta hai.</p>

<h3>Host outbound traffic</h3>
<p>Jo packets Routing Engine khud banata hai (OSPF hellos, BGP, ping replies, SSH) woh ingress classification skip karte hain kyunki woh router ke andar se hi shuru hote hain. Default mein routing protocol packets network-control mein jaate hain. Aap <code>host-outbound-traffic</code> statement se saare host traffic ko steer aur mark kar sakte ho:</p>
<pre class="code"><span class="c"># config: host ke banaye packets network-control mein, DSCP CS6 ke saath</span>
set class-of-service host-outbound-traffic forwarding-class network-control
set class-of-service host-outbound-traffic dscp-code-point cs6</pre>
<p>Lab devices yeh statement accept karte hain, lekin simulator mein iske liye alag show command nahi hai, isliye yahan koi output nahi dikhaya gaya.</p>

<div class="eg"><p><b>Worked example.</b> BR1 par ek packet EF aur loss priority low ke saath classify hua. Rewrite rule RW-WAN ki ek row hai: EF + low = 101110. Packet DSCP 46 ke saath nikalta hai. Doosra packet AF aur loss priority high ke saath classify hua. RW-WAN mein AF ki row nahi hai, isliye woh jis DSCP ke saath aaya tha wahi rehta hai. AF rewrite karna ho to uski line jodo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Ingress unit par rewrite lagana; rule egress par kaam karta hai. (2) Sirf loss-priority low ka rule, jabki packet ka PLP high hai, isliye kuch match nahi hota. (3) Routed hop ke paar 802.1p bachne ki umeed. (4) Yeh bhoolna ki agle hop ko naya marking maanne wala classifier chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Forwarding class ko DSCP bits mein kaun badalta hai?" Rewrite rule, egress logical interface par. Classifier ulti disha mein ingress par kaam karta hai. Doosra trap: rewrite rule ki row chunne ke liye forwarding class AUR loss priority dono chahiye.</p></div>

<div class="scn"><h4>Branch par marked, core par best-effort</h4><p>Ek bank branch ne filter se voice ko sahi mark kiya, phir bhi head office ke traffic matrices voice ko best-effort queue mein dikha rahe the. Branch router par rewrite rule tha aur capture ne wire par DSCP 46 dikhaya. Core router ko us ingress interface par kabhi classifier diya hi nahi gaya tha, isliye woh default table use kar raha tha. Core par ek <code>classifiers dscp</code> binding ne masla hal kiya.</p><p><b>Lesson:</b> pehle wire par marking saabit karo, phir agle hop par queue saabit karo. Fault wahan hai jahan chain tootti hai.</p></div>

<div class="iv"><p class="q">"Rewrite rules ki zaroorat hi kyun hai?"</p><p>Forwarding class aur loss priority sirf router ke andar hote hain. Rewrite rule unhe egress par DSCP, precedence ya 802.1p mein wapas likhta hai, taaki agle hop ka classifier use kar sake. Main trust boundaries par iska use karta hoon, jaise edge par MF filter se classify hue traffic par EF set karne ke liye, aur capture tatha agle router ke queue counters se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rewrite rules egress logical interface par lagte hain aur forwarding class tatha loss priority use karte hain.</li>
<li>Jis class ki rule mein row nahi, woh apni original marking rakhti hai.</li>
<li>DSCP routing ke paar bachta hai; 802.1p har link par dobara banta hai aur tagged interfaces chahiye.</li>
<li>Agle hop ko aisa BA classifier chahiye jo marking par bharosa kare.</li>
<li>Host ke banaye traffic ko <code>host-outbound-traffic</code> se steer karte hain.</li>
</ul></div>
`}};export{e as default};