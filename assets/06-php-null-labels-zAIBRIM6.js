var e={id:`php-null-labels`,h:{en:`Penultimate hop popping: implicit-null and explicit-null`,hi:`Penultimate hop popping: implicit-null aur explicit-null`},body:{en:`
<p>Imagine you live at the end of a courier route. Every parcel reaches you with a route sticker that says "this parcel is for you". You peel it off, throw it away, and then read the real address anyway. The sticker told you nothing new; it only cost you time. It would be smarter if the <b>last hub before you</b> peeled the sticker off and handed you the bare parcel. That simple idea is <b>penultimate hop popping</b> (PHP).</p>

<h3>The problem PHP solves</h3>
<p>The egress router owns the FEC: it is PE2's own loopback 4.4.4.4 or its connected LAN 192.168.2.0/24. If PE2 received a labelled packet it would need <b>two lookups</b>: first in the LFIB, only to discover "this label means me, remove it", and then in the FIB to forward the IP packet. On old software-based routers this double lookup cost real performance. Even today it is pointless work.</p>
<p>So the egress tells its upstream neighbour, through LDP, "for this prefix, do not send me a label at all". It does that by advertising a reserved label value: <b>3, implicit-null</b>. The upstream router, the <b>penultimate hop</b>, sees label 3 in its LIB and programs its LFIB with <b>Pop Label</b> instead of a swap. The egress then receives a plain IP packet and does one lookup.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PHP and implicit null">
<rect x="40" y="40" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="100" y="67" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="260" y="40" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="480" y="40" width="120" height="44" rx="8" fill="#bae6fd"/><text x="540" y="67" text-anchor="middle" class="svg-ink" font-size="13">PE2 4.4.4.4</text>
<line x1="160" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="380" y1="62" x2="480" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#a6)"/>
<text x="430" y="130" text-anchor="middle" class="svg-accent" font-size="12">4.4.4.4 → label 3</text>
<line x1="260" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#a6)"/>
<text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="12">4.4.4.4 → label 17</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">LDP advertisements flow right to left</text>
<text x="210" y="210" text-anchor="middle" class="svg-ink" font-size="12">data: label 17 →</text>
<text x="430" y="210" text-anchor="middle" class="svg-ink" font-size="12">data: plain IP →</text>
<defs><marker id="a6" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">PE2 advertises implicit-null (3) for its own prefix, so P2 pops and PE2 receives unlabelled IP.</p></div>

<h3>What you see in the CLI</h3>
<pre class="out">PE2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 4
<span class="hl">        local binding:  label: imp-null</span>
        remote binding: lsr: 3.3.3.3:0, label: 17

P2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 9
        local binding:  label: 17
        remote binding: lsr: 2.2.2.2:0, label: 22
<span class="hl">        remote binding: lsr: 4.4.4.4:0, label: imp-null</span>

P2# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">17         Pop Label  4.4.4.4/32       2860          Gi0/3      10.0.34.4</span></pre>
<p>Three places, three spellings of the same idea: <code>imp-null</code> in the LIB, <b>Pop Label</b> in the upstream LFIB, and <b>no label</b> on the last hop of a traceroute. In the lab, the answer to "which label does PE2 advertise for its own loopback?" is <b>imp-null</b> (implicit-null, value 3), and the answer to "which router pops?" is <b>P2</b>.</p>
<p>Why "implicit"? Because label 3 is <b>never put on a packet</b>. It exists only as a signal in LDP. If you capture on the P2–PE2 link you will never see label 3 on the wire; you see a normal IPv4 frame with EtherType 0x0800.</p>

<h3>Explicit-null: when you want to keep the label</h3>
<p>PHP has one side effect. When P2 pops the only label, the <b>TC/EXP bits disappear</b> with it. If the provider uses the MPLS TC field for QoS and wants to classify on it at PE2's egress queue (for example in pipe or short-pipe QoS models), it needs the label to reach PE2. The solution is <b>explicit-null</b>, label <b>0</b> for IPv4 (2 for IPv6).</p>
<pre class="code"><span class="c">! on the egress router (PE2), global configuration</span>
mpls ldp explicit-null
<span class="c">! optional: only for prefixes matching an ACL, or only toward certain peers</span>
<span class="c">! mpls ldp explicit-null for ACL-NAME to PEER-ACL</span></pre>
<p>Now PE2 advertises label 0 instead of 3. P2 swaps 17 → <b>0</b>, and PE2 receives a packet with label 0 that still carries the TC bits. Label 0 always means "pop me and do an IP lookup", so the egress still does not need a real LFIB lookup for it. In <code>show mpls ldp bindings</code> it appears as <code>exp-null</code>, and in the upstream LFIB as <code>explicit-n</code>.</p>

<table class="cmp"><tr><th></th><th>Implicit-null</th><th>Explicit-null</th></tr>
<tr><td>Value</td><td>3</td><td>0 (IPv4), 2 (IPv6)</td></tr>
<tr><td>On the wire?</td><td>Never</td><td>Yes, on the last link</td></tr>
<tr><td>Who pops?</td><td>Penultimate hop</td><td>Egress</td></tr>
<tr><td>TC/EXP preserved to egress?</td><td>No</td><td>Yes</td></tr>
<tr><td>IOS default?</td><td>Yes</td><td>Needs <code>mpls ldp explicit-null</code></td></tr></table>

<div class="eg"><p><b>Worked example: PHP with two labels.</b> In an MPLS L3VPN (chapter 11) the stack is [transport 17 | VPN 28]. P2 is the penultimate hop for PE2's loopback, so it pops only the <b>top</b> label, the transport label. The VPN label 28 stays and is now the top label. PE2 receives a packet with one label, 28, looks it up, and knows which VRF and customer next hop to use. PHP never removes more than one label.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading "Pop Label" as an error. It is normal and expected on the router one hop before the egress. The problem value is <b>No Label</b>, which means the next hop sent no binding at all.</p></div>

<div class="exam"><p><b>Exam trap.</b> Implicit-null = 3 and is used for PHP by default; explicit-null = 0 and preserves the EXP/TC bits. The penultimate router, not the egress, pops with implicit-null. In an L3VPN, PHP removes only the transport label.</p></div>

<div class="scn"><h4>Voice class lost on the last link</h4><p>A provider marked voice traffic with MPLS EXP 5 at the ingress PE and queued on EXP everywhere in the core. On the egress PE, the outbound policy toward the customer also matched on EXP, but it never classified anything as voice, so calls broke up at busy hours on that last link. The reason was PHP: the transport label, and its EXP value, was popped at the penultimate P router. The team configured <code>mpls ldp explicit-null</code> on the egress PEs and changed the policy to match the preserved marking; voice quality recovered.</p><p><b>Lesson:</b> PHP removes the top label and its TC bits; use explicit-null when the egress needs them.</p></div>

<div class="iv"><p class="q">"What is penultimate hop popping and why is it used?"</p><p>The egress router advertises implicit-null, label 3, for prefixes it owns. The router one hop before it sees that and pops the label instead of swapping, so the egress receives an IP packet (or the inner VPN label) and needs only one lookup. Mention that label 3 never appears on the wire, that the LFIB shows Pop Label, and that explicit-null, label 0, is used when the EXP bits must reach the egress.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PHP avoids a double lookup on the egress by popping one hop earlier.</li>
<li>The egress signals PHP with implicit-null (label 3), shown as imp-null; the upstream LFIB shows Pop Label.</li>
<li>Label 3 is never on the wire; the last hop of a traceroute shows no label.</li>
<li>Explicit-null (label 0) keeps a label to the egress so TC/EXP survives; configure mpls ldp explicit-null.</li>
<li>PHP removes only the top label; in L3VPN the VPN label reaches the egress PE.</li>
</ul></div>
`,hi:`
<p>Socho aap ek courier route ke aakhri ghar mein rehte ho. Har parcel aap tak ek route sticker ke saath pahunchta hai jis par likha hai "yeh parcel aapke liye hai". Aap use utaarte ho, phenk dete ho, aur phir bhi asli address padhte ho. Sticker ne kuch naya nahi bataya; sirf aapka time liya. Behtar hota ki <b>aapse pehle wala aakhri hub</b> sticker utaar deta aur aapko seedha parcel de deta. Yahi simple idea <b>penultimate hop popping</b> (PHP) hai.</p>

<h3>PHP kaunsi problem solve karta hai</h3>
<p>Egress router FEC ka maalik hai: yeh PE2 ka apna loopback 4.4.4.4 ya uska connected LAN 192.168.2.0/24 hai. Agar PE2 ko labelled packet mile to use <b>do lookups</b> karne padenge: pehle LFIB mein, sirf yeh jaanne ke liye ki "is label ka matlab main hoon, ise hatao", aur phir FIB mein IP packet forward karne ke liye. Purane software-based routers par yeh double lookup sach mein performance khaata tha. Aaj bhi yeh bekaar ka kaam hai.</p>
<p>Isliye egress LDP ke through apne upstream neighbour ko kehta hai, "is prefix ke liye mujhe label bilkul mat bhejo". Yeh woh ek reserved label value advertise karke karta hai: <b>3, implicit-null</b>. Upstream router, yaani <b>penultimate hop</b>, apni LIB mein label 3 dekhta hai aur apni LFIB mein swap ki jagah <b>Pop Label</b> program karta hai. Phir egress ko plain IP packet milta hai aur woh ek hi lookup karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PHP and implicit null">
<rect x="40" y="40" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="100" y="67" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="260" y="40" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="480" y="40" width="120" height="44" rx="8" fill="#bae6fd"/><text x="540" y="67" text-anchor="middle" class="svg-ink" font-size="13">PE2 4.4.4.4</text>
<line x1="160" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="380" y1="62" x2="480" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#b6)"/>
<text x="430" y="130" text-anchor="middle" class="svg-accent" font-size="12">4.4.4.4 → label 3</text>
<line x1="260" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#b6)"/>
<text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="12">4.4.4.4 → label 17</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">LDP advertisements right se left jaate hain</text>
<text x="210" y="210" text-anchor="middle" class="svg-ink" font-size="12">data: label 17 →</text>
<text x="430" y="210" text-anchor="middle" class="svg-ink" font-size="12">data: plain IP →</text>
<defs><marker id="b6" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">PE2 apne prefix ke liye implicit-null (3) advertise karta hai, isliye P2 pop karta hai aur PE2 ko unlabelled IP milta hai.</p></div>

<h3>CLI mein kya dikhta hai</h3>
<pre class="out">PE2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 4
<span class="hl">        local binding:  label: imp-null</span>
        remote binding: lsr: 3.3.3.3:0, label: 17

P2# show mpls ldp bindings 4.4.4.4 32
  lib entry: 4.4.4.4/32, rev 9
        local binding:  label: 17
        remote binding: lsr: 2.2.2.2:0, label: 22
<span class="hl">        remote binding: lsr: 4.4.4.4:0, label: imp-null</span>

P2# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">17         Pop Label  4.4.4.4/32       2860          Gi0/3      10.0.34.4</span></pre>
<p>Teen jagah, ek hi idea ki teen spellings: LIB mein <code>imp-null</code>, upstream LFIB mein <b>Pop Label</b>, aur traceroute ke aakhri hop par <b>koi label nahi</b>. Lab mein "PE2 apne loopback ke liye kaunsa label advertise karta hai?" ka jawab <b>imp-null</b> (implicit-null, value 3) hai, aur "kaunsa router pop karta hai?" ka jawab <b>P2</b> hai.</p>
<p>"Implicit" kyun? Kyunki label 3 <b>kabhi packet par nahi lagta</b>. Yeh sirf LDP mein ek signal ki tarah exist karta hai. Agar aap P2–PE2 link par capture karo to wire par label 3 kabhi nahi dikhega; aapko EtherType 0x0800 wala normal IPv4 frame dikhega.</p>

<h3>Explicit-null: jab label rakhna ho</h3>
<p>PHP ka ek side effect hai. Jab P2 akele label ko pop karta hai, to <b>TC/EXP bits bhi uske saath gayab</b> ho jaate hain. Agar provider QoS ke liye MPLS TC field use karta hai aur PE2 ki egress queue par us par classify karna chahta hai (jaise pipe ya short-pipe QoS models mein), to label ko PE2 tak pahunchna chahiye. Solution hai <b>explicit-null</b>, IPv4 ke liye label <b>0</b> (IPv6 ke liye 2).</p>
<pre class="code"><span class="c">! egress router (PE2) par, global configuration</span>
mpls ldp explicit-null
<span class="c">! optional: sirf ACL se match hone wale prefixes, ya sirf kuch peers ke liye</span>
<span class="c">! mpls ldp explicit-null for ACL-NAME to PEER-ACL</span></pre>
<p>Ab PE2 3 ki jagah label 0 advertise karta hai. P2 17 → <b>0</b> swap karta hai, aur PE2 ko label 0 wala packet milta hai jo TC bits ab bhi le jaata hai. Label 0 ka matlab hamesha "mujhe pop karo aur IP lookup karo" hai, isliye egress ko iske liye asli LFIB lookup ki zaroorat nahi. <code>show mpls ldp bindings</code> mein yeh <code>exp-null</code> dikhta hai, aur upstream LFIB mein <code>explicit-n</code>.</p>

<table class="cmp"><tr><th></th><th>Implicit-null</th><th>Explicit-null</th></tr>
<tr><td>Value</td><td>3</td><td>0 (IPv4), 2 (IPv6)</td></tr>
<tr><td>Wire par?</td><td>Kabhi nahi</td><td>Haan, aakhri link par</td></tr>
<tr><td>Pop kaun karta hai?</td><td>Penultimate hop</td><td>Egress</td></tr>
<tr><td>TC/EXP egress tak bache?</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>IOS default?</td><td>Haan</td><td><code>mpls ldp explicit-null</code> chahiye</td></tr></table>

<div class="eg"><p><b>Worked example: do labels ke saath PHP.</b> MPLS L3VPN (chapter 11) mein stack [transport 17 | VPN 28] hai. PE2 ke loopback ke liye P2 penultimate hop hai, isliye woh sirf <b>top</b> label, yaani transport label, pop karta hai. VPN label 28 bacha rehta hai aur ab top label hai. PE2 ko ek label, 28, wala packet milta hai, woh use lookup karta hai, aur jaan jaata hai ki kaunsa VRF aur customer next hop use karna hai. PHP kabhi ek se zyada label nahi hataata.</p></div>

<div class="warn"><p><b>Common galti.</b> "Pop Label" ko error samajhna. Egress se ek hop pehle wale router par yeh normal aur expected hai. Problem wali value <b>No Label</b> hai, jiska matlab hai next hop ne koi binding bheji hi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Implicit-null = 3 aur default mein PHP ke liye use hota hai; explicit-null = 0 aur EXP/TC bits bachata hai. Implicit-null ke saath penultimate router pop karta hai, egress nahi. L3VPN mein PHP sirf transport label hataata hai.</p></div>

<div class="scn"><h4>Aakhri link par voice class kho gayi</h4><p>Ek provider ingress PE par voice traffic ko MPLS EXP 5 se mark karta tha aur poore core mein EXP par queue karta tha. Egress PE par customer ki taraf outbound policy bhi EXP par match karti thi, par woh kabhi kuch bhi voice classify nahi karti thi, isliye busy hours mein us aakhri link par calls toot'ti thi. Wajah PHP thi: transport label, aur uski EXP value, penultimate P router par pop ho jaata tha. Team ne egress PEs par <code>mpls ldp explicit-null</code> configure kiya aur policy ko bachi hui marking par match karne ke liye badla; voice quality wapas aa gayi.</p><p><b>Seekh:</b> PHP top label aur uske TC bits hata deta hai; jab egress ko unki zaroorat ho to explicit-null use karo.</p></div>

<div class="iv"><p class="q">"Penultimate hop popping kya hai aur kyun use hota hai?"</p><p>Egress router apne prefixes ke liye implicit-null, label 3, advertise karta hai. Usse ek hop pehle wala router yeh dekhkar swap ki jagah label pop karta hai, isliye egress ko IP packet (ya inner VPN label) milta hai aur sirf ek lookup chahiye. Bolo ki label 3 kabhi wire par nahi dikhta, LFIB Pop Label dikhati hai, aur jab EXP bits egress tak pahunchne chahiye to explicit-null, label 0, use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PHP ek hop pehle pop karke egress par double lookup bachata hai.</li>
<li>Egress implicit-null (label 3) se PHP signal karta hai, imp-null dikhta hai; upstream LFIB Pop Label dikhati hai.</li>
<li>Label 3 kabhi wire par nahi hota; traceroute ke aakhri hop par koi label nahi dikhta.</li>
<li>Explicit-null (label 0) egress tak label rakhta hai taaki TC/EXP bache; mpls ldp explicit-null configure karo.</li>
<li>PHP sirf top label hataata hai; L3VPN mein VPN label egress PE tak pahunchta hai.</li>
</ul></div>
`}};export{e as default};