var e={id:`lib-lfib-fib`,h:{en:`RIB, LIB, FIB and LFIB: the four tables`,hi:`RIB, LIB, FIB aur LFIB: chaar tables`},body:{en:`
<p>Think of a sorting hub again. The hub manager keeps a big <b>notebook</b> of every route sticker every neighbouring hub has ever offered, even offers he will never use. The workers on the belt do not read the notebook. They get a short <b>laminated card</b> that lists only the stickers actually in use: "R22 in, R17 out, belt 3". MPLS routers work the same way: a big table with every label they have learned, and a small, fast table built from it for forwarding.</p>

<h3>The four tables</h3>
<dl class="terms">
<dt>RIB (routing table)</dt><dd><code>show ip route</code>. Built by OSPF, static routes and so on. It chooses the best next hop for every prefix. MPLS changes nothing here.</dd>
<dt>LIB (Label Information Base)</dt><dd><code>show mpls ldp bindings</code>. The control-plane notebook. For every prefix it holds the <b>local binding</b> (the label this router chose and advertised) and every <b>remote binding</b> (the labels each LDP neighbour advertised for that prefix).</dd>
<dt>FIB (CEF table)</dt><dd><code>show ip cef</code>. The data-plane table for <b>unlabelled</b> IP packets. With MPLS, each entry can include an outgoing label, so the ingress router knows what to push.</dd>
<dt>LFIB (Label Forwarding Information Base)</dt><dd><code>show mpls forwarding-table</code>. The data-plane table for <b>labelled</b> packets: incoming local label → outgoing label, interface and next hop.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tables relationship">
<rect x="30" y="30" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="115" y="54" text-anchor="middle" class="svg-ink" font-size="13">RIB</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">OSPF best next hop</text>
<rect x="440" y="30" width="170" height="54" rx="8" fill="#ddd6fe"/><text x="525" y="54" text-anchor="middle" class="svg-ink" font-size="13">LIB</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="12">local + all remote labels</text>
<rect x="30" y="170" width="170" height="54" rx="8" fill="#bae6fd"/><text x="115" y="194" text-anchor="middle" class="svg-ink" font-size="13">FIB (CEF)</text><text x="115" y="212" text-anchor="middle" class="svg-muted" font-size="12">IP in → push label</text>
<rect x="440" y="170" width="170" height="54" rx="8" fill="#fde68a"/><text x="525" y="194" text-anchor="middle" class="svg-ink" font-size="13">LFIB</text><text x="525" y="212" text-anchor="middle" class="svg-muted" font-size="12">label in → swap/pop</text>
<rect x="245" y="100" width="150" height="54" rx="8" fill="#e2e8f0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">pick remote label</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">of IGP next hop</text>
<line x1="200" y1="57" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="57" x2="380" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="154" x2="200" y2="190" stroke="#64748b" stroke-width="2"/><line x1="370" y1="154" x2="440" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">control plane</text><text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">data plane</text>
</svg><p class="cap">The RIB says which neighbour is the next hop; the LIB says which label that neighbour wants; together they build the FIB and LFIB.</p></div>

<h3>How the tables are filled</h3>
<ol>
<li>OSPF installs 4.4.4.4/32 in the RIB of P1 with next hop 10.0.23.3 (P2).</li>
<li>P1 allocates a local label for 4.4.4.4/32, say <b>22</b>, stores it in the LIB and advertises it to all its LDP neighbours (PE1 and P2).</li>
<li>P1 receives label <b>17</b> from P2 (LDP ID 3.3.3.3:0) and label <b>19</b> from PE1 (1.1.1.1:0) for the same prefix. Both go into the LIB.</li>
<li>P1 asks: "who is my IGP next hop for 4.4.4.4?" P2, whose interface address 10.0.23.3 is bound to LDP ID 3.3.3.3. So P1 uses P2's label 17.</li>
<li>The LFIB entry becomes: in <b>22</b> → out <b>17</b> via Gi0/2 to 10.0.23.3. The FIB entry for IP packets P1 itself sends to 4.4.4.4 also gets label 17.</li>
</ol>

<pre class="out">P1# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 12
<span class="hl">        local binding:  label: 22</span>
        remote binding: lsr: 1.1.1.1:0, label: 19
<span class="hl">        remote binding: lsr: 3.3.3.3:0, label: 17</span>

P1# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">22         17         4.4.4.4/32       11960         Gi0/2      10.0.23.3</span>

PE1# show ip cef 4.4.4.4
4.4.4.4/32
<span class="hl">  nexthop 10.0.12.2 GigabitEthernet0/1 label 22</span></pre>
<p>Notice that PE1's label 19 sits in P1's LIB but is not used: PE1 is not P1's next hop toward 4.4.4.4. That is normal.</p>

<h3>The LDP label distribution modes (Cisco IOS defaults)</h3>
<table class="cmp"><tr><th>Question</th><th>Choice</th><th>IOS default for LDP</th></tr>
<tr><td>When are labels advertised?</td><td>Downstream Unsolicited vs Downstream on Demand</td><td><b>Unsolicited</b>: advertise to every neighbour without being asked</td></tr>
<tr><td>Which remote labels are kept?</td><td>Liberal vs Conservative retention</td><td><b>Liberal</b>: keep all, even from non-next-hops</td></tr>
<tr><td>When is a local label assigned?</td><td>Independent vs Ordered control</td><td><b>Independent</b>: as soon as the IGP route exists</td></tr></table>
<p>Liberal retention is why P1 keeps PE1's label 19. If the P1–P2 link fails and OSPF reroutes, the new next hop's label is already in the LIB, so the LFIB is updated immediately without waiting for new LDP messages. That speeds up convergence.</p>

<div class="eg"><p><b>Worked example.</b> P1 has two paths to 4.4.4.4 after a new link to PE2 is added: via P2 (label 17) and directly via PE2 (implicit-null). OSPF prefers the direct link. P1's LIB already holds both remote bindings, so the LFIB changes from "22 → 17 via Gi0/2" to "22 → Pop Label via the new interface" the moment OSPF converges. Local label 22 does not change; upstream PE1 sees nothing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading the LIB and assuming every remote label is used. Only the binding from the <b>IGP next hop</b> reaches the LFIB. To know which one, compare the next hop in <code>show ip route</code> with the addresses bound to each LDP neighbour in <code>show mpls ldp neighbor</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> LIB = control plane, all bindings. LFIB = data plane, only the used binding. FIB (CEF) handles unlabelled IP packets and holds the label to push. MPLS on IOS needs CEF enabled; without <code>ip cef</code>, no labels are imposed.</p></div>

<div class="scn"><h4>The label that "should" have been used</h4><p>A trainee opened a ticket: "P1 has label 19 from PE1 for 4.4.4.4, but it forwards with 17, so LDP is broken." The senior engineer showed that OSPF on P1 pointed at P2 for 4.4.4.4, and that 17 was P2's label. Label 19 was simply retained under liberal retention. No change was needed; the ticket was closed with a short lesson on the LIB.</p><p><b>Lesson:</b> the RIB picks the next hop; the LFIB uses that next hop's label and ignores the rest.</p></div>

<div class="iv"><p class="q">"What is the difference between the LIB and the LFIB?"</p><p>The LIB is the control-plane database of every label binding, local and remote, learned through LDP. The LFIB is the data-plane table actually used to switch labelled packets, built by combining the LIB with the RIB: for each prefix, my local label maps to the label advertised by my IGP next hop. Mention liberal retention and why it speeds convergence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RIB picks the next hop; LIB stores all label bindings; FIB pushes labels; LFIB swaps and pops.</li>
<li>The LFIB outgoing label is the one advertised by the IGP next hop for that prefix.</li>
<li>IOS LDP defaults: downstream unsolicited, liberal retention, independent control.</li>
<li>Liberal retention keeps unused labels so failover is fast.</li>
<li>Commands: show ip route, show mpls ldp bindings, show ip cef, show mpls forwarding-table.</li>
</ul></div>
`,hi:`
<p>Sorting hub ko phir se socho. Hub manager ek bada <b>notebook</b> rakhta hai jismein har padosi hub ka har route sticker offer likha hai, woh offers bhi jo woh kabhi use nahi karega. Belt par kaam karne wale workers notebook nahi padhte. Unhe ek chhota <b>laminated card</b> milta hai jismein sirf woh stickers hain jo sach mein use ho rahe hain: "R22 andar, R17 bahar, belt 3". MPLS routers bhi aise hi kaam karte hain: ek badi table jismein har seekha hua label hai, aur usse bani ek chhoti, tez table forwarding ke liye.</p>

<h3>Chaar tables</h3>
<dl class="terms">
<dt>RIB (routing table)</dt><dd><code>show ip route</code>. OSPF, static routes waghera se banti hai. Har prefix ke liye best next hop chunti hai. MPLS yahan kuch nahi badalta.</dd>
<dt>LIB (Label Information Base)</dt><dd><code>show mpls ldp bindings</code>. Control-plane ka notebook. Har prefix ke liye isme <b>local binding</b> (jo label is router ne chuna aur advertise kiya) aur har <b>remote binding</b> (jo labels har LDP neighbour ne us prefix ke liye advertise kiye) hoti hai.</dd>
<dt>FIB (CEF table)</dt><dd><code>show ip cef</code>. <b>Unlabelled</b> IP packets ke liye data-plane table. MPLS ke saath har entry mein outgoing label ho sakta hai, isliye ingress router ko pata hota hai kya push karna hai.</dd>
<dt>LFIB (Label Forwarding Information Base)</dt><dd><code>show mpls forwarding-table</code>. <b>Labelled</b> packets ke liye data-plane table: incoming local label → outgoing label, interface aur next hop.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tables relationship">
<rect x="30" y="30" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="115" y="54" text-anchor="middle" class="svg-ink" font-size="13">RIB</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="12">OSPF best next hop</text>
<rect x="440" y="30" width="170" height="54" rx="8" fill="#ddd6fe"/><text x="525" y="54" text-anchor="middle" class="svg-ink" font-size="13">LIB</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="12">local + saare remote labels</text>
<rect x="30" y="170" width="170" height="54" rx="8" fill="#bae6fd"/><text x="115" y="194" text-anchor="middle" class="svg-ink" font-size="13">FIB (CEF)</text><text x="115" y="212" text-anchor="middle" class="svg-muted" font-size="12">IP andar → label push</text>
<rect x="440" y="170" width="170" height="54" rx="8" fill="#fde68a"/><text x="525" y="194" text-anchor="middle" class="svg-ink" font-size="13">LFIB</text><text x="525" y="212" text-anchor="middle" class="svg-muted" font-size="12">label andar → swap/pop</text>
<rect x="245" y="100" width="150" height="54" rx="8" fill="#e2e8f0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">remote label chuno</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">IGP next hop ka</text>
<line x1="200" y1="57" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="57" x2="380" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="154" x2="200" y2="190" stroke="#64748b" stroke-width="2"/><line x1="370" y1="154" x2="440" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">control plane</text><text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">data plane</text>
</svg><p class="cap">RIB batati hai kaunsa neighbour next hop hai; LIB batati hai woh neighbour kaunsa label chahta hai; dono milkar FIB aur LFIB banati hain.</p></div>

<h3>Tables kaise bharti hain</h3>
<ol>
<li>OSPF P1 ki RIB mein 4.4.4.4/32 next hop 10.0.23.3 (P2) ke saath daalta hai.</li>
<li>P1 4.4.4.4/32 ke liye ek local label allocate karta hai, maan lo <b>22</b>, use LIB mein rakhta hai aur apne saare LDP neighbours (PE1 aur P2) ko advertise karta hai.</li>
<li>P1 ko same prefix ke liye P2 (LDP ID 3.3.3.3:0) se label <b>17</b> aur PE1 (1.1.1.1:0) se label <b>19</b> milta hai. Dono LIB mein jaate hain.</li>
<li>P1 poochta hai: "4.4.4.4 ke liye mera IGP next hop kaun hai?" P2, jiska interface address 10.0.23.3 LDP ID 3.3.3.3 se bound hai. To P1 P2 ka label 17 use karta hai.</li>
<li>LFIB entry banti hai: andar <b>22</b> → bahar <b>17</b>, Gi0/2 se 10.0.23.3 ki taraf. Jo IP packets P1 khud 4.4.4.4 ko bhejta hai unki FIB entry ko bhi label 17 milta hai.</li>
</ol>

<pre class="out">P1# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 12
<span class="hl">        local binding:  label: 22</span>
        remote binding: lsr: 1.1.1.1:0, label: 19
<span class="hl">        remote binding: lsr: 3.3.3.3:0, label: 17</span>

P1# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">22         17         4.4.4.4/32       11960         Gi0/2      10.0.23.3</span>

PE1# show ip cef 4.4.4.4
4.4.4.4/32
<span class="hl">  nexthop 10.0.12.2 GigabitEthernet0/1 label 22</span></pre>
<p>Dhyan do ki PE1 ka label 19 P1 ki LIB mein hai par use nahi hota: 4.4.4.4 ki taraf PE1 P1 ka next hop nahi hai. Yeh normal hai.</p>

<h3>LDP label distribution modes (Cisco IOS defaults)</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Choice</th><th>LDP ke liye IOS default</th></tr>
<tr><td>Labels kab advertise hote hain?</td><td>Downstream Unsolicited vs Downstream on Demand</td><td><b>Unsolicited</b>: bina maange har neighbour ko advertise</td></tr>
<tr><td>Kaunse remote labels rakhe jaate hain?</td><td>Liberal vs Conservative retention</td><td><b>Liberal</b>: sab rakho, non-next-hops ke bhi</td></tr>
<tr><td>Local label kab assign hota hai?</td><td>Independent vs Ordered control</td><td><b>Independent</b>: IGP route aate hi</td></tr></table>
<p>Liberal retention ki wajah se P1 PE1 ka label 19 rakhta hai. Agar P1–P2 link fail ho aur OSPF reroute kare, to naye next hop ka label pehle se LIB mein hai, isliye LFIB naye LDP messages ka intezaar kiye bina turant update ho jaati hai. Isse convergence tez hota hai.</p>

<div class="eg"><p><b>Worked example.</b> PE2 tak ek naya link jodne ke baad P1 ke paas 4.4.4.4 ke do paths hain: P2 ke through (label 17) aur seedha PE2 ke through (implicit-null). OSPF direct link prefer karta hai. P1 ki LIB mein dono remote bindings pehle se hain, isliye OSPF converge hote hi LFIB "22 → 17 via Gi0/2" se "22 → Pop Label via naya interface" ho jaati hai. Local label 22 nahi badalta; upstream PE1 ko kuch pata nahi chalta.</p></div>

<div class="warn"><p><b>Common galti.</b> LIB padhkar maan lena ki har remote label use hota hai. Sirf <b>IGP next hop</b> wali binding LFIB tak pahunchti hai. Kaunsi hai yeh jaanne ke liye <code>show ip route</code> ka next hop <code>show mpls ldp neighbor</code> mein har LDP neighbour se bound addresses se milao.</p></div>

<div class="exam"><p><b>Exam trap.</b> LIB = control plane, saari bindings. LFIB = data plane, sirf use hone wali binding. FIB (CEF) unlabelled IP packets handle karti hai aur push karne wala label rakhti hai. IOS par MPLS ko CEF enabled chahiye; <code>ip cef</code> ke bina koi label impose nahi hota.</p></div>

<div class="scn"><h4>Woh label jo "use hona chahiye tha"</h4><p>Ek trainee ne ticket khola: "P1 ke paas 4.4.4.4 ke liye PE1 se label 19 hai, par woh 17 se forward karta hai, matlab LDP toota hai." Senior engineer ne dikhaya ki P1 par OSPF 4.4.4.4 ke liye P2 ki taraf point karta tha, aur 17 P2 ka label tha. Label 19 bas liberal retention ki wajah se rakha gaya tha. Koi change nahi chahiye tha; ticket LIB par ek chhote lesson ke saath band hua.</p><p><b>Seekh:</b> RIB next hop chunti hai; LFIB us next hop ka label use karti hai aur baaki ko ignore karti hai.</p></div>

<div class="iv"><p class="q">"LIB aur LFIB mein kya farak hai?"</p><p>LIB control-plane database hai jismein LDP se seekhi har label binding, local aur remote, hoti hai. LFIB data-plane table hai jo sach mein labelled packets switch karne mein use hoti hai, LIB ko RIB ke saath jodkar banti hai: har prefix ke liye mera local label mere IGP next hop ke advertise kiye label par map hota hai. Liberal retention aur woh convergence kaise tez karta hai, iska zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RIB next hop chunti hai; LIB saari label bindings rakhti hai; FIB labels push karti hai; LFIB swap aur pop karti hai.</li>
<li>LFIB ka outgoing label woh hai jo us prefix ke liye IGP next hop ne advertise kiya.</li>
<li>IOS LDP defaults: downstream unsolicited, liberal retention, independent control.</li>
<li>Liberal retention unused labels rakhta hai taaki failover tez ho.</li>
<li>Commands: show ip route, show mpls ldp bindings, show ip cef, show mpls forwarding-table.</li>
</ul></div>
`}};export{e as default};