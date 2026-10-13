var e={id:`dense-vs-sparse`,h:{en:`Dense mode versus sparse mode`,hi:`Dense mode versus sparse mode`},body:{en:`
<p>There are two basic ways to deliver mail to a town. One: the postman drops a leaflet in every letterbox, and people who do not want it phone the post office to say "stop". Two: the post office delivers only to people who first signed up. PIM has both ways. The first is <b>dense mode</b>, the second <b>sparse mode</b>. Enterprises use sparse mode almost everywhere, and this chapter shows why.</p>

<h3>Dense mode: flood and prune</h3>
<p>Dense mode assumes that every router has a receiver. When a source starts sending, the first router floods the packets out of <b>every</b> PIM interface. Each router that receives it floods onward. A router that has no receivers behind it and no neighbours that want the stream sends a <b>Prune</b> upstream: "stop sending this group to me". After about three minutes the prune expires and the flood happens again. The tree is built by the data itself, then trimmed.</p>
<p>That is a <b>push</b> model. It is simple to understand, needs no rendezvous point, and works when almost every part of the network has a receiver (for example a single building where everyone watches the same channel). It is a poor fit anywhere else: every router, even one with no interest, holds state for the source, and the flood-prune cycle repeats forever.</p>

<h3>Sparse mode: ask first, then receive</h3>
<p>Sparse mode assumes <b>nobody</b> wants the stream until a router explicitly asks. A receiver's router sends a Join toward a meeting point, the rendezvous point (RP), and only the routers on that path hold state. Data flows only on branches that someone joined. That is a <b>pull</b> model. Sparse mode needs an RP (or SSM, chapter 6), but traffic and state grow with the number of receivers, not with the size of the network.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Dense versus sparse">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Dense: flood, then prune</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Sparse: join first</text>
<circle cx="60" cy="130" r="22" fill="#fde68a"/><text x="60" y="134" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<circle cx="150" cy="70" r="20" fill="#bae6fd"/><circle cx="150" cy="130" r="20" fill="#bae6fd"/><circle cx="150" cy="190" r="20" fill="#bae6fd"/>
<circle cx="250" cy="70" r="20" fill="#e2e8f0"/><circle cx="250" cy="130" r="20" fill="#e2e8f0"/><circle cx="250" cy="190" r="20" fill="#bbf7d0"/>
<line x1="82" y1="130" x2="130" y2="75" stroke="#64748b"/><line x1="82" y1="130" x2="130" y2="130" stroke="#64748b"/><line x1="82" y1="130" x2="130" y2="185" stroke="#64748b"/>
<line x1="170" y1="70" x2="230" y2="70" stroke="#ef4444" stroke-dasharray="4 3"/><line x1="170" y1="130" x2="230" y2="130" stroke="#ef4444" stroke-dasharray="4 3"/><line x1="170" y1="190" x2="230" y2="190" stroke="#64748b"/>
<text x="160" y="232" text-anchor="middle" class="svg-muted" font-size="12">red dashes: wasted flood, later pruned</text>
<circle cx="380" cy="130" r="22" fill="#fde68a"/><text x="380" y="134" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<circle cx="470" cy="70" r="20" fill="#e2e8f0"/><circle cx="470" cy="130" r="20" fill="#e2e8f0"/><circle cx="470" cy="190" r="20" fill="#ddd6fe"/><text x="470" y="194" text-anchor="middle" class="svg-ink" font-size="11">RP</text>
<circle cx="570" cy="70" r="20" fill="#e2e8f0"/><circle cx="570" cy="130" r="20" fill="#e2e8f0"/><circle cx="570" cy="190" r="20" fill="#bbf7d0"/>
<line x1="402" y1="130" x2="450" y2="185" stroke="#64748b"/><line x1="490" y1="190" x2="550" y2="190" stroke="#64748b"/>
<text x="480" y="232" text-anchor="middle" class="svg-muted" font-size="12">only the joined path carries data</text>
</svg><p class="cap">Dense floods first and trims later. Sparse sends nothing until a receiver asks.</p></div>

<h3>Comparing the modes</h3>
<table class="cmp"><tr><th></th><th>Dense mode</th><th>Sparse mode</th></tr>
<tr><td>Model</td><td>Push: flood and prune</td><td>Pull: explicit join</td></tr>
<tr><td>Needs an RP</td><td>No</td><td>Yes (or SSM)</td></tr>
<tr><td>State in routers</td><td>(S,G) in every router that saw the flood</td><td>Only routers on the joined paths</td></tr>
<tr><td>Bandwidth</td><td>Floods every few minutes</td><td>Only where receivers are</td></tr>
<tr><td>Fits</td><td>Small networks where almost everyone listens</td><td>Campus, WAN, data centre, nearly everything</td></tr>
<tr><td>Interface command</td><td><code>ip pim dense-mode</code></td><td><code>ip pim sparse-mode</code></td></tr></table>

<h3>Sparse-dense mode, and why you rarely meet it</h3>
<p><code>ip pim sparse-dense-mode</code> lets the router decide per group: if it knows an RP for the group it works in sparse mode, otherwise it falls back to dense. It was invented so that the two groups used to learn an RP dynamically (Auto-RP, the next module) could be flooded in dense mode before any RP is known. Today the command <code>ip pim autorp listener</code> solves that without touching your data groups, so sparse-dense is only a legacy design. The danger: if the RP is lost, groups silently turn into floods.</p>
<pre class="code"><span class="c">! the normal choice, on every router interface that carries multicast</span>
interface GigabitEthernet0/1
 ip pim sparse-mode</pre>
<pre class="out">R4#show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.20.4.1        GigabitEthernet0/0       v2/D   0      30     1          10.20.4.1</span>
10.0.14.4        GigabitEthernet0/2       v2/S   1      30     1          10.0.14.4
10.0.24.4        GigabitEthernet0/3       v2/S   1      30     1          10.0.24.4</pre>
<p>That output is R4 after somebody typed <code>ip pim dense-mode</code> on its LAN interface: the highlighted line shows <b>v2/D</b>, while the others show <b>v2/S</b>. When you audit a network, scan the Mode column; one D among S entries is a mistake waiting to flood.</p>

<div class="eg"><p><b>Worked example.</b> A network has 60 router links. One source sends 8 Mbps. Only 5 branch routers have viewers. In dense mode, the first flood puts 8 Mbps on all 60 links (480 Mbps of total link load) until prunes arrive, and again after each prune timeout. In sparse mode, the stream appears only on the roughly 5 to 8 links that lead to the 5 branches. That is under 70 Mbps of total link load, and it does not repeat.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>ip pim dense-mode</code> on one interface because "it was quicker" or because a lab guide did. A dense interface floods everything it hears into that LAN, and on a WAN link it can fill a slow circuit every few minutes. Use <code>sparse-mode</code> unless you have a documented reason.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dense mode has no RP, so it works without any RP configuration. Sparse mode with no RP and no SSM range has no tree to build for ASM groups. Both are "PIM"; the interface mode decides which behaviour you get, and one router may have both modes on different interfaces.</p></div>

<div class="scn"><h4>The WAN that filled up every three minutes</h4><p>A branch in Indore complained that video calls broke in short bursts, regularly, every three minutes or so. The WAN graph showed a sawtooth: 2 Mbps of extra traffic that rose and vanished. Somebody had put <code>ip pim dense-mode</code> on the branch uplink while testing. The IPTV stream was flooded to the branch, pruned, and flooded again when the prune expired. Switching the interface to sparse mode removed the sawtooth.</p><p><b>Lesson:</b> a periodic pattern in a link graph with a 3-minute period is the signature of dense-mode flood and prune.</p></div>

<div class="iv"><p class="q">"Why do enterprises prefer sparse mode over dense mode?"</p><p>Strong answer: dense floods to every PIM router and prunes back, repeating on a timer; state exists everywhere. Sparse builds the tree only toward receivers that joined, so bandwidth and state scale with receivers, not network size. Add that sparse needs an RP or SSM, and that dense is acceptable only for tiny networks where nearly everyone listens.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dense mode = push, flood and prune, no RP. Sparse mode = pull, explicit join, RP or SSM.</li>
<li>Use <code>ip pim sparse-mode</code> as the default on every multicast interface.</li>
<li>Sparse-dense falls back to flooding when no RP is known: a legacy design.</li>
<li>Scan the Mode column of <code>show ip pim interface</code> for a stray D.</li>
<li>A 3-minute sawtooth on a link graph points to dense-mode flood and prune.</li>
</ul></div>
`,hi:`
<p>Ek town mein dak pahunchane ke do basic tareeke hain. Ek: postman har letterbox mein pamphlet daal deta hai, aur jinhe nahi chahiye woh post office ko phone karke kehte hain "band karo". Do: post office sirf unhe deliver karta hai jinhone pehle sign up kiya. PIM mein dono tareeke hain. Pehla <b>dense mode</b>, doosra <b>sparse mode</b>. Enterprises lagbhag har jagah sparse mode use karte hain, aur yeh chapter batata hai kyun.</p>

<h3>Dense mode: flood aur prune</h3>
<p>Dense mode maanta hai ki har router ke paas receiver hai. Jab source bhejna shuru karta hai, pehla router packets ko <b>har</b> PIM interface se flood kar deta hai. Jo router use receive karta hai woh aage flood karta hai. Jis router ke peeche koi receiver nahi aur koi neighbour bhi stream nahi chahta, woh upstream ko <b>Prune</b> bhejta hai: "yeh group mujhe bhejna band karo". Lagbhag teen minute baad prune expire ho jaata hai aur flood dobara hota hai. Tree data se khud banta hai, phir chhanta jaata hai.</p>
<p>Yeh <b>push</b> model hai. Samajhna aasan hai, rendezvous point nahi chahiye, aur tab chalta hai jab network ke lagbhag har hisse mein receiver ho (jaise ek building jahan sab ek hi channel dekhte hain). Baaki jagah yeh bura fit hai: har router, bina interest ke bhi, source ki state rakhta hai, aur flood-prune cycle hamesha chalta rehta hai.</p>

<h3>Sparse mode: pehle maango, phir pao</h3>
<p>Sparse mode maanta hai ki <b>koi nahi</b> chahta jab tak router explicitly na maange. Receiver ka router milne ki jagah, rendezvous point (RP), ki taraf Join bhejta hai, aur sirf us path ke routers state rakhte hain. Data sirf un branches par jaata hai jinhone join kiya. Yeh <b>pull</b> model hai. Sparse mode ko RP (ya SSM, chapter 6) chahiye, lekin traffic aur state receivers ki sankhya ke saath badhte hain, network ke size ke saath nahi.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Dense aur sparse">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Dense: flood, phir prune</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Sparse: pehle join</text>
<circle cx="60" cy="130" r="22" fill="#fde68a"/><text x="60" y="134" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<circle cx="150" cy="70" r="20" fill="#bae6fd"/><circle cx="150" cy="130" r="20" fill="#bae6fd"/><circle cx="150" cy="190" r="20" fill="#bae6fd"/>
<circle cx="250" cy="70" r="20" fill="#e2e8f0"/><circle cx="250" cy="130" r="20" fill="#e2e8f0"/><circle cx="250" cy="190" r="20" fill="#bbf7d0"/>
<line x1="82" y1="130" x2="130" y2="75" stroke="#64748b"/><line x1="82" y1="130" x2="130" y2="130" stroke="#64748b"/><line x1="82" y1="130" x2="130" y2="185" stroke="#64748b"/>
<line x1="170" y1="70" x2="230" y2="70" stroke="#ef4444" stroke-dasharray="4 3"/><line x1="170" y1="130" x2="230" y2="130" stroke="#ef4444" stroke-dasharray="4 3"/><line x1="170" y1="190" x2="230" y2="190" stroke="#64748b"/>
<text x="160" y="232" text-anchor="middle" class="svg-muted" font-size="12">laal dashes: bekaar flood, baad mein prune</text>
<circle cx="380" cy="130" r="22" fill="#fde68a"/><text x="380" y="134" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<circle cx="470" cy="70" r="20" fill="#e2e8f0"/><circle cx="470" cy="130" r="20" fill="#e2e8f0"/><circle cx="470" cy="190" r="20" fill="#ddd6fe"/><text x="470" y="194" text-anchor="middle" class="svg-ink" font-size="11">RP</text>
<circle cx="570" cy="70" r="20" fill="#e2e8f0"/><circle cx="570" cy="130" r="20" fill="#e2e8f0"/><circle cx="570" cy="190" r="20" fill="#bbf7d0"/>
<line x1="402" y1="130" x2="450" y2="185" stroke="#64748b"/><line x1="490" y1="190" x2="550" y2="190" stroke="#64748b"/>
<text x="480" y="232" text-anchor="middle" class="svg-muted" font-size="12">sirf joined path par data jaata hai</text>
</svg><p class="cap">Dense pehle flood karta hai aur baad mein chhaanta hai. Sparse tab tak kuch nahi bhejta jab tak receiver na maange.</p></div>

<h3>Dono modes ki tulna</h3>
<table class="cmp"><tr><th></th><th>Dense mode</th><th>Sparse mode</th></tr>
<tr><td>Model</td><td>Push: flood aur prune</td><td>Pull: explicit join</td></tr>
<tr><td>RP chahiye</td><td>Nahi</td><td>Haan (ya SSM)</td></tr>
<tr><td>Routers mein state</td><td>Har us router mein (S,G) jisne flood dekha</td><td>Sirf joined paths ke routers mein</td></tr>
<tr><td>Bandwidth</td><td>Har kuch minute mein flood</td><td>Sirf wahan jahan receivers hain</td></tr>
<tr><td>Kahan fit</td><td>Chhote networks jahan lagbhag sab sunte hain</td><td>Campus, WAN, data centre, lagbhag sab kuch</td></tr>
<tr><td>Interface command</td><td><code>ip pim dense-mode</code></td><td><code>ip pim sparse-mode</code></td></tr></table>

<h3>Sparse-dense mode, aur yeh kam kyun milta hai</h3>
<p><code>ip pim sparse-dense-mode</code> router ko har group ke hisaab se tay karne deta hai: agar group ka RP pata hai to sparse mode mein kaam karta hai, warna dense par laut jaata hai. Ise isliye banaya gaya tha ki RP dynamically seekhne wale do groups (Auto-RP, agla module) kisi RP ke pata chalne se pehle dense mode mein flood ho sakein. Aaj <code>ip pim autorp listener</code> command aapke data groups ko chhue bina yeh problem hal karta hai, isliye sparse-dense sirf legacy design hai. Khatra: agar RP kho jaaye to groups chupchaap flood ban jaate hain.</p>
<pre class="code"><span class="c">! normal choice, har us router interface par jo multicast carry karta hai</span>
interface GigabitEthernet0/1
 ip pim sparse-mode</pre>
<pre class="out">R4#show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.20.4.1        GigabitEthernet0/0       v2/D   0      30     1          10.20.4.1</span>
10.0.14.4        GigabitEthernet0/2       v2/S   1      30     1          10.0.14.4
10.0.24.4        GigabitEthernet0/3       v2/S   1      30     1          10.0.24.4</pre>
<p>Yeh output R4 ka hai jab kisi ne uske LAN interface par <code>ip pim dense-mode</code> type kar diya: highlighted line <b>v2/D</b> dikhati hai, baaki <b>v2/S</b>. Network audit karte waqt Mode column scan karo; S ke beech ek D flood hone ka intezaar kar rahi galti hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek network mein 60 router links hain. Ek source 8 Mbps bhejta hai. Sirf 5 branch routers ke paas viewers hain. Dense mode mein pehla flood 8 Mbps ko saare 60 links par daal deta hai (kul link load 480 Mbps) jab tak prunes na aa jayein, aur har prune timeout ke baad phir. Sparse mode mein stream sirf un lagbhag 5 se 8 links par dikhti hai jo 5 branches tak jaate hain. Yeh kul link load 70 Mbps se kam hai, aur dohrata nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek interface par <code>ip pim dense-mode</code> lagana kyunki "jaldi tha" ya kisi lab guide ne aisa kiya. Dense interface jo bhi sunta hai use us LAN mein flood kar deta hai, aur WAN link par yeh slow circuit ko har kuch minute mein bhar sakta hai. Jab tak koi documented wajah na ho, <code>sparse-mode</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dense mode mein RP nahi hota, isliye woh bina kisi RP configuration ke chalta hai. Sparse mode mein agar RP nahi aur SSM range nahi, to ASM groups ke liye banane ko tree hi nahi. Dono "PIM" hain; interface mode tay karta hai ki aapko kaunsa behaviour milega, aur ek router ke alag interfaces par dono modes ho sakte hain.</p></div>

<div class="scn"><h4>WAN jo har teen minute mein bhar jaati thi</h4><p>Indore ki ek branch ne shikayat ki ki video calls chhote bursts mein toot-te hain, regularly, lagbhag har teen minute. WAN graph mein sawtooth dikha: 2 Mbps extra traffic jo uthta aur gayab ho jaata. Kisi ne testing ke dauraan branch uplink par <code>ip pim dense-mode</code> laga diya tha. IPTV stream branch tak flood hoti, prune hoti, aur prune expire hone par phir flood hoti. Interface ko sparse mode mein badalte hi sawtooth chala gaya.</p><p><b>Seekh:</b> link graph mein 3 minute ke period wala periodic pattern dense-mode flood aur prune ki pehchaan hai.</p></div>

<div class="iv"><p class="q">"Enterprises dense mode ki jagah sparse mode kyun pasand karte hain?"</p><p>Strong answer: dense har PIM router tak flood karta hai aur timer par prune hokar wapas aata hai; state har jagah hoti hai. Sparse tree sirf un receivers ki taraf banata hai jinhone join kiya, isliye bandwidth aur state receivers ke saath scale hote hain, network size ke saath nahi. Jodo ki sparse ko RP ya SSM chahiye, aur dense sirf chhote networks ke liye theek hai jahan lagbhag sab sunte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dense mode = push, flood aur prune, RP nahi. Sparse mode = pull, explicit join, RP ya SSM.</li>
<li>Har multicast interface par default ke roop mein <code>ip pim sparse-mode</code> use karo.</li>
<li>Sparse-dense jab RP pata na ho to flooding par laut jaata hai: legacy design.</li>
<li><code>show ip pim interface</code> ke Mode column mein bhatke hue D ko dhoondho.</li>
<li>Link graph par 3 minute ka sawtooth dense-mode flood aur prune ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};