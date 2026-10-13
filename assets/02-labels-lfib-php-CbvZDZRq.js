var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Push swap pop"><rect x="20" y="40" width="90" height="46" rx="8" fill="#bae6fd"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">PE1 push</text><rect x="190" y="40" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="235" y="68" text-anchor="middle" class="svg-ink" font-size="13">P1 swap</text><rect x="360" y="40" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="405" y="68" text-anchor="middle" class="svg-ink" font-size="13">P2 pop (PHP)</text><rect x="530" y="40" width="90" height="46" rx="8" fill="#bae6fd"/><text x="575" y="68" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><line x1="110" y1="63" x2="190" y2="63" stroke="#64748b" stroke-width="2"/><line x1="280" y1="63" x2="360" y2="63" stroke="#64748b" stroke-width="2"/><line x1="450" y1="63" x2="530" y2="63" stroke="#64748b" stroke-width="2"/><text x="150" y="55" text-anchor="middle" class="svg-accent" font-size="12">label 21</text><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">label 19</text><text x="490" y="55" text-anchor="middle" class="svg-accent" font-size="12">no label</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Labels from the lab traceroute to 192.168.2.10; the last hop is IP</text></svg><p class="cap">`+e+`</p></div>`,t={id:`labels-lfib-php`,h:{en:`Labels, LIB, LFIB and penultimate hop popping`,hi:`Labels, LIB, LFIB aur penultimate hop popping`},body:{en:`
<p>Every labelled packet goes through three operations. Understanding them lets you read any label table. The outputs below were captured from the lab after LDP was configured.</p>

<h3>The three operations</h3>
<dl class="terms">
<dt>Push</dt><dd>The ingress router adds a label to an unlabelled packet (or adds one on top of an existing stack).</dd>
<dt>Swap</dt><dd>A transit router replaces the incoming label with the outgoing label chosen by its neighbour.</dd>
<dt>Pop</dt><dd>A router removes the top label. Done by the penultimate router in <b>PHP</b>, or by the egress router.</dd></dl>

@@D@@

<h3>FEC, LIB and LFIB</h3>
<p>A <b>Forwarding Equivalence Class (FEC)</b> is a group of packets treated the same way. In LDP each IGP prefix is a FEC, for example 10.0.255.4/32. Each router keeps two tables:</p>
<ul>
<li><b>LIB</b> (label information base), shown with <code>show mpls ldp bindings</code>: every label the router knows for each prefix, both its own (local binding) and every neighbour's (remote binding). With liberal retention it keeps them all.</li>
<li><b>LFIB</b> (label forwarding information base), shown with <code>show mpls forwarding-table</code>: the label actually used to forward, taken from the neighbour that is the IGP next hop for that prefix.</li>
</ul>
<pre class="out">PE1# show mpls ldp bindings
  lib entry: 10.0.255.4/32, rev 14
        local binding:  label: 21
        remote binding: lsr: 10.0.255.2:0, label: 18
  lib entry: 10.0.255.2/32, rev 10
        local binding:  label: 17
        remote binding: lsr: 10.0.255.2:0, <span class="hl">label: imp-null</span>

PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         <span class="hl">Pop Label</span>  10.0.255.2/32    0             Gi0/1      10.0.12.2
21         18         10.0.255.4/32    0             Gi0/1      10.0.12.2</pre>
<p>Read the second table. For PE2's loopback 10.0.255.4/32, PE1 advertises its own <i>local</i> label 21 to the neighbours (what they must use when they send PE1 traffic for that prefix) and sends traffic out with <i>outgoing</i> label 18, the label that P1 gave for it. For P1's loopback, P1 advertised <b>imp-null</b>, so PE1 shows Pop Label.</p>

<h3>Penultimate hop popping (PHP)</h3>
<p>The egress router would otherwise have to do two lookups: remove the label, then do an IP lookup. To save one, the <b>penultimate router</b> (second to last) pops the label before sending. The egress router asks for this by advertising the special label <b>implicit-null (3)</b>, shown as <code>imp-null</code> in the LIB and <code>Pop Label</code> in the LFIB. A router advertises imp-null for its own loopbacks and directly connected networks. <b>Explicit-null (0)</b> is the alternative, used when the egress needs the TC bits for QoS; the label stays and is removed at the egress.</p>
<p>Real traceroute from PE1 to the PC2 LAN:</p>
<pre class="out">PE1# traceroute 192.168.2.10
  1 10.0.12.2 <span class="hl">[MPLS: Label 21 Exp 0]</span> 1 msec 2 msec 1 msec
  2 10.0.23.3 <span class="hl">[MPLS: Label 19 Exp 0]</span> 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>PE1 pushes 21. P1 swaps 21 for 19 (compare the P1 table: local 21, out 19). P2 pops the label: the hop 10.0.34.4 (PE2) receives plain IP. P2 is the penultimate hop and does the pop.</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         Pop Label  10.0.255.4/32    0             Gi0/3      10.0.34.4
19         Pop Label  192.168.2.0/24   820           Gi0/3      10.0.34.4</pre>

<div class="eg"><p><b>Worked example: follow label 21.</b> PC1 sends to 192.168.2.10. PE1 looks up the prefix and finds outgoing label 21 on Gi0/1. P1 receives label 21 in its LFIB: local 21, outgoing 19, next hop 10.0.23.3. P2 receives 19: Pop Label out Gi0/3 to 10.0.34.4. PE2 receives plain IP and delivers to 192.168.2.10.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Confusing local and outgoing label columns: <i>Local</i> is what this router advertised and expects to receive; <i>Outgoing</i> is what it puts on the packet. Expecting to see imp-null on the wire: it is never carried in a packet, only signalled.</p></div>
<div class="exam"><p><b>Exam trap.</b> Implicit-null is label 3 and means "pop", explicit-null is label 0. PHP is done by the <i>penultimate</i> router, not the egress. Reserved labels are 0 to 15; dynamic labels start at 16.</p></div>

<div class="scn"><h4>Where did the label go?</h4><p>A junior ran a packet capture on the last core link and saw no MPLS header, and concluded MPLS was broken. The traceroute showed labels on the first two hops only. It was PHP: P2, the penultimate router, removes the label, so the P2-PE2 link carries plain IP.</p><p><b>Lesson:</b> do not look for the label on the last link; capture one hop earlier.</p></div>

<div class="iv"><p class="q">"What is penultimate hop popping and why is it used?"</p><p>The router before the egress removes the top label so the egress does only one lookup. The egress signals this by advertising implicit-null (label 3). The LFIB then shows Pop Label toward the egress. Explicit-null (label 0) keeps a label so TC bits survive to the egress.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push at ingress, swap in transit, pop at the penultimate hop.</li>
<li>LIB holds all bindings; LFIB holds what is used to forward.</li>
<li>imp-null (3) signals PHP; shows as Pop Label in the LFIB.</li>
<li>Labels have local significance per link.</li>
<li>Reserved labels 0 to 15; dynamic labels start at 16.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 pushes 21, P1 swaps to 19, P2 pops, PE2 receives plain IP.`)),hi:`
<p>Har labelled packet teen operations se guzarta hai. Unhe samajhne se aap koi bhi label table padh sakte ho. Neeche ke outputs LDP configure hone ke baad lab se capture kiye gaye hain.</p>

<h3>Teen operations</h3>
<dl class="terms">
<dt>Push</dt><dd>Ingress router unlabelled packet par label jodta hai (ya existing stack ke upar ek aur).</dd>
<dt>Swap</dt><dd>Transit router incoming label ko us outgoing label se badalta hai jo uske neighbour ne chuna hai.</dd>
<dt>Pop</dt><dd>Router top label hata deta hai. <b>PHP</b> mein penultimate router karta hai, ya egress router.</dd></dl>

@@D@@

<h3>FEC, LIB aur LFIB</h3>
<p><b>Forwarding Equivalence Class (FEC)</b> un packets ka group hai jinke saath ek jaisa bartaav hota hai. LDP mein har IGP prefix ek FEC hai, jaise 10.0.255.4/32. Har router do tables rakhta hai:</p>
<ul>
<li><b>LIB</b> (label information base), <code>show mpls ldp bindings</code> se dikhti hai: har prefix ke liye router jitne labels jaanta hai, apne (local binding) aur har neighbour ke (remote binding). Liberal retention mein woh sab rakhta hai.</li>
<li><b>LFIB</b> (label forwarding information base), <code>show mpls forwarding-table</code> se: forward karne ke liye asal mein use hone wala label, us neighbour se jo us prefix ka IGP next hop hai.</li>
</ul>
<pre class="out">PE1# show mpls ldp bindings
  lib entry: 10.0.255.4/32, rev 14
        local binding:  label: 21
        remote binding: lsr: 10.0.255.2:0, label: 18
  lib entry: 10.0.255.2/32, rev 10
        local binding:  label: 17
        remote binding: lsr: 10.0.255.2:0, <span class="hl">label: imp-null</span>

PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         <span class="hl">Pop Label</span>  10.0.255.2/32    0             Gi0/1      10.0.12.2
21         18         10.0.255.4/32    0             Gi0/1      10.0.12.2</pre>
<p>Doosri table padho. PE2 ke loopback 10.0.255.4/32 ke liye PE1 apna <i>local</i> label 21 neighbours ko advertise karta hai (jo woh PE1 ko us prefix ka traffic bhejte waqt use karenge) aur traffic <i>outgoing</i> label 18 ke saath bhejta hai, jo P1 ne uske liye diya. P1 ke loopback ke liye P1 ne <b>imp-null</b> advertise kiya, isliye PE1 Pop Label dikhata hai.</p>

<h3>Penultimate hop popping (PHP)</h3>
<p>Egress router ko warna do lookups karne padte: label hatao, phir IP lookup. Ek bachane ke liye <b>penultimate router</b> (aakhri se pehla) bhejne se pehle label pop kar deta hai. Egress router yeh special label <b>implicit-null (3)</b> advertise karke maangta hai, jo LIB mein <code>imp-null</code> aur LFIB mein <code>Pop Label</code> dikhta hai. Router apne loopbacks aur directly connected networks ke liye imp-null advertise karta hai. <b>Explicit-null (0)</b> alternative hai, jab egress ko QoS ke liye TC bits chahiye; label rehta hai aur egress par hatta hai.</p>
<p>PE1 se PC2 LAN tak real traceroute:</p>
<pre class="out">PE1# traceroute 192.168.2.10
  1 10.0.12.2 <span class="hl">[MPLS: Label 21 Exp 0]</span> 1 msec 2 msec 1 msec
  2 10.0.23.3 <span class="hl">[MPLS: Label 19 Exp 0]</span> 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>PE1 21 push karta hai. P1 21 ko 19 se swap karta hai (P1 table dekho: local 21, out 19). P2 label pop karta hai: hop 10.0.34.4 (PE2) ko plain IP milta hai. P2 penultimate hop hai aur pop karta hai.</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         Pop Label  10.0.255.4/32    0             Gi0/3      10.0.34.4
19         Pop Label  192.168.2.0/24   820           Gi0/3      10.0.34.4</pre>

<div class="eg"><p><b>Worked example: label 21 ko follow karo.</b> PC1 192.168.2.10 ko bhejta hai. PE1 prefix lookup karke Gi0/1 par outgoing label 21 paata hai. P1 ko label 21 milta hai uski LFIB mein: local 21, outgoing 19, next hop 10.0.23.3. P2 ko 19 milta hai: Pop Label Gi0/3 se 10.0.34.4 ko. PE2 ko plain IP milta hai aur 192.168.2.10 ko deliver karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Local aur outgoing label columns mix karna: <i>Local</i> woh hai jo is router ne advertise kiya aur receive karne ki ummeed rakhta hai; <i>Outgoing</i> woh hai jo woh packet par lagata hai. Wire par imp-null dekhne ki ummeed: woh kabhi packet mein nahi jaata, sirf signal hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Implicit-null label 3 hai aur matlab "pop", explicit-null label 0 hai. PHP <i>penultimate</i> router karta hai, egress nahi. Reserved labels 0 se 15; dynamic labels 16 se shuru.</p></div>

<div class="scn"><h4>Label kahan gaya?</h4><p>Ek junior ne aakhri core link par packet capture chalaya aur MPLS header nahi dikha, aur maan liya ki MPLS toota hua hai. Traceroute ne labels sirf pehle do hops par dikhaye. Yeh PHP tha: P2, penultimate router, label hata deta hai, isliye P2-PE2 link plain IP le jaata hai.</p><p><b>Lesson:</b> label aakhri link par mat dhundo; ek hop pehle capture karo.</p></div>

<div class="iv"><p class="q">"Penultimate hop popping kya hai aur kyun use hota hai?"</p><p>Egress se pehle wala router top label hata deta hai taaki egress ko sirf ek lookup karna pade. Egress implicit-null (label 3) advertise karke yeh signal karta hai. Tab LFIB egress ki taraf Pop Label dikhata hai. Explicit-null (label 0) label rakhta hai taaki TC bits egress tak bachein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ingress par push, transit mein swap, penultimate hop par pop.</li>
<li>LIB saare bindings rakhti hai; LFIB woh jo forward karne mein use hota hai.</li>
<li>imp-null (3) PHP signal karta hai; LFIB mein Pop Label dikhta hai.</li>
<li>Labels ka significance har link par local hota hai.</li>
<li>Reserved labels 0 se 15; dynamic labels 16 se shuru.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 21 push karta hai, P1 19 se swap, P2 pop, PE2 ko plain IP milta hai.`))}};export{t as default};