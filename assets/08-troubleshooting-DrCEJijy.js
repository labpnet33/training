var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the receiver does not get the stream`,hi:`Troubleshooting workflow: receiver ko stream nahi milti`},body:{en:`
<p>A user says "the video does not play". That is all you get. Multicast over UDP gives no error message anywhere, so you need a method. This chapter gives you one: start at the receiver and ask one question per layer, in a fixed order, and stop at the first layer that gives a wrong answer. It is the method you will use in the troubleshooting lab <b>Lab · Troubleshoot: the receiver gets no stream</b>.</p>

<h3>The principle</h3>
<p>The symptom is always at the receiver, but the cause can be anywhere between the receiver and the source. If you start at the source you may check ten correct things. If you start at the receiver, every question moves you one step upstream, and the first wrong answer is your fault. The IGMP side comes first because without membership the rest of the network has nothing to build.</p>

<div class="dia"><svg viewBox="0 0 640 400" role="img" aria-label="Receiver-first troubleshooting flow">
<rect x="170" y="8" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Receiver: is it joined? (host show mcast)</text>
<rect x="170" y="62" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. Router: IGMP enabled on this interface?</text>
<rect x="170" y="116" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">3. Group listed? version right? address valid?</text>
<rect x="170" y="170" width="300" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">4. Mroute: entry with this interface in OIL?</text>
<rect x="170" y="224" width="300" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="13">5. Upstream: PIM neighbours, RP, RPF (next modules)</text>
<rect x="170" y="278" width="300" height="42" rx="8" fill="#fde68a"/><text x="320" y="304" text-anchor="middle" class="svg-ink" font-size="13">6. Source: sending? TTL high enough?</text>
<rect x="170" y="332" width="300" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="358" text-anchor="middle" class="svg-ink" font-size="13">7. Switch: snooping groups, mrouter, querier</text>
<line x1="320" y1="50" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="104" x2="320" y2="116" stroke="#64748b" stroke-width="2"/><line x1="320" y1="158" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="320" y1="212" x2="320" y2="224" stroke="#64748b" stroke-width="2"/><line x1="320" y1="266" x2="320" y2="278" stroke="#64748b" stroke-width="2"/><line x1="320" y1="320" x2="320" y2="332" stroke="#64748b" stroke-width="2"/>
<text x="30" y="40" class="svg-accent" font-size="12">IGMP side</text><text x="30" y="205" class="svg-accent" font-size="12">Routing side</text><text x="30" y="345" class="svg-accent" font-size="12">Layer 2</text>
</svg><p class="cap">Work top to bottom. Fix the first wrong answer, then run the test again before moving on: one fault can hide the next.</p></div>

<h3>The seven questions and the clues</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th><th>A wrong answer looks like</th></tr>
<tr><td>1. Did the host really join?</td><td>Lab PC: <code>show mcast</code>. Real hosts: <code>ip maddr show</code> (Linux), <code>netsh interface ip show joins</code> (Windows)</td><td>Group missing from the host: the application is not asking</td></tr>
<tr><td>2. Is IGMP running on the receiver-facing interface?</td><td><code>show ip igmp interface &lt;intf&gt;</code></td><td>The text "IGMP is disabled on interface"</td></tr>
<tr><td>3a. Is the group in the table, on the right interface?</td><td><code>show ip igmp groups</code></td><td>Group missing, or listed on another interface</td></tr>
<tr><td>3b. Does the interface version fit the request?</td><td><code>show ip igmp interface</code>, line "Current IGMP host version"</td><td>Version 2 or 1 while a source-specific join is needed</td></tr>
<tr><td>3c. Is the group address a routable one?</td><td>Look at the address</td><td>An address in 224.0.0.0/24 (never routed, never listed), or outside your 239 plan</td></tr>
<tr><td>4. Does the mroute table forward to this LAN?</td><td><code>show ip mroute &lt;group&gt;</code></td><td>No entry, or the interface is missing from the outgoing list, or flags without the expected <b>s</b>/<b>I</b> for SSM</td></tr>
<tr><td>5. Is the tree complete upstream?</td><td><code>show ip pim neighbor</code>, <code>show ip rpf</code></td><td>Incoming interface Null, no PIM neighbour (modules 3 to 5)</td></tr>
<tr><td>6. Is the source really sending?</td><td>Source host, <code>show ip mroute</code> on its first-hop router</td><td>No (S,G) entry, or TTL 1 so the first router drops it</td></tr>
<tr><td>7. Does the switch forward to the port?</td><td><code>show ip igmp snooping groups</code>, <code>mrouter</code>, <code>querier</code></td><td>Port missing from the group's port list, no mrouter port, no querier</td></tr>
</table>

<h3>One fault can hide another</h3>
<p>The lab is built on this rule. It has several independent faults on the IGMP side, and each one blocks a different stream. When you fix the first, only one stream comes back; the others are still broken for different reasons. So after every fix, test <b>every channel separately</b>, then continue with the next layer for the ones that still fail. Do not stop when the first PC receives something.</p>
<div class="eg"><p><b>How to run it.</b> Before touching any configuration, write a three-line table: channel, receiver, expected source. For each row, walk questions 1 to 4 and write the first wrong answer next to it. You now have a to-do list. Fix, retest, tick off. An evidence habit like this is also what the interviewer wants to hear.</p></div>

<h3>A worked trace at Layer 2 (illustrative output)</h3>
<p>Chennai store: the router lists the group, and PC3 still shows no stream while PC1 and PC2 are fine. On the switch:</p>
<pre class="out">SW1#show ip igmp snooping groups vlan 20
Vlan      Group                  Type        Version     Port List
-----------------------------------------------------------------------
20        239.20.1.1             igmp        v2          Gi1/0/2, Gi1/0/3

SW1#show vlan id 30
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
30   STORE-PRINT                      active    <span class="hl">Gi1/0/4</span></pre>
<p>The group list in VLAN 20 has no Gi1/0/4, because the port belongs to VLAN 30. IGMP and snooping are fine: PC3 is plugged into the wrong VLAN, so its report is never heard by this router interface. The answer came from layer 1, 2 and 7 of the list, not from PIM.</p>

<h3>Tools worth knowing</h3>
<ul>
<li><b>Multicast ping.</b> From a router, <code>ping &lt;group&gt;</code> sends echo requests to the group; routers or hosts that joined it reply. With <code>ip igmp join-group</code> on a far interface you can prove the whole tree. Remove the join-group afterwards.</li>
<li><b>Packet capture.</b> A capture on the receiver port shows queries (to 224.0.0.1), reports and the stream itself. In the lab simulator you can capture IGMP and PIM packets and read the fields.</li>
<li><b>Debug.</b> <code>debug ip igmp</code> prints every query and report. On a busy router it can overload the CPU; prefer show commands and capture, and turn debug off at once.</li>
<li><b>Source TTL.</b> Many applications send multicast with TTL 1 by default. The first router decrements it to zero and drops the packet. Compare the source's TTL setting if the stream dies at the first hop.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Starting at the source or the RP and spending an hour on correct configuration. Fixing one fault and declaring victory. Using static-group or join-group to "make it work" without finding why IGMP did not. Forgetting that a host moved to another VLAN is invisible to the old interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IGMP is disabled on interface" means no PIM mode there. A group in 224.0.0.0/24 never appears in the table. A v2 interface cannot carry a source list. A static entry makes the table look healthy while the receiver may still be broken.</p></div>

<div class="scn"><h4>Three people, one ticket</h4><p>Bharat Retail got one ticket, "training video broken in the Pune store", and three engineers each found a different problem. The first saw that one PC did not appear in the router's group table and fixed that. The ticket stayed open. The second noticed that the source-specific channel still failed and traced it to the receiver-LAN IGMP version. The third saw that one custom app used a group that routers never forward. If they had followed the layered list, one engineer would have written down three findings in the first twenty minutes and fixed them all in one visit.</p><p><b>Lesson:</b> write down every channel, test each one separately and do not close until each passes.</p></div>

<div class="iv"><p class="q">"A user says the multicast video does not play. How do you troubleshoot it?"</p><p>Strong answer: start at the receiver, not the source. Check the host joined, then the router interface: IGMP enabled, version, querier. Then the group table, then the mroute entry and its outgoing list, and only then PIM, RPF and the source. Include Layer 2: snooping group list, mrouter port, querier. Test each channel separately after each fix, because several faults can coexist. Name the commands as you go.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot from the receiver upward, one question per layer, and stop at the first wrong answer.</li>
<li>IGMP side first: host joined, interface enabled, group listed, version fits, address valid.</li>
<li>Then mroute and OIL, upstream PIM and RPF, source and TTL, and finally switch snooping.</li>
<li>Faults hide each other: retest every channel after every fix.</li>
<li>Remove test join-groups and debug when done; keep a written list of findings.</li>
</ul></div>
`,hi:`
<p>User kehta hai "video play nahi ho rahi". Bas yahi milta hai. UDP par multicast kahin koi error message nahi deta, isliye aapko ek method chahiye. Yeh chapter ek method deta hai: receiver se shuru karo aur har layer par ek sawaal poochho, fixed order mein, aur pehli layer par ruk jao jo galat jawab de. Yahi method aap troubleshooting lab <b>Lab · Troubleshoot: receiver ko stream nahi milti</b> mein use karoge.</p>

<h3>Principle</h3>
<p>Symptom hamesha receiver par hota hai, par wajah receiver aur source ke beech kahin bhi ho sakti hai. Agar source se shuru karoge to das sahi cheezein check kar loge. Receiver se shuru karoge to har sawaal aapko ek kadam upstream le jaata hai, aur pehla galat jawab hi aapka fault hai. IGMP side pehle isliye kyunki membership ke bina baaki network ke paas banane ko kuch nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 400" role="img" aria-label="Receiver-first troubleshooting flow">
<rect x="170" y="8" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Receiver: join kiya? (host show mcast)</text>
<rect x="170" y="62" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. Router: is interface par IGMP enabled?</text>
<rect x="170" y="116" width="300" height="42" rx="8" fill="#bae6fd"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">3. Group listed? version sahi? address valid?</text>
<rect x="170" y="170" width="300" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">4. Mroute: entry jiske OIL mein yeh interface?</text>
<rect x="170" y="224" width="300" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="250" text-anchor="middle" class="svg-ink" font-size="13">5. Upstream: PIM neighbours, RP, RPF (agle modules)</text>
<rect x="170" y="278" width="300" height="42" rx="8" fill="#fde68a"/><text x="320" y="304" text-anchor="middle" class="svg-ink" font-size="13">6. Source: bhej raha hai? TTL kaafi hai?</text>
<rect x="170" y="332" width="300" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="358" text-anchor="middle" class="svg-ink" font-size="13">7. Switch: snooping groups, mrouter, querier</text>
<line x1="320" y1="50" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="104" x2="320" y2="116" stroke="#64748b" stroke-width="2"/><line x1="320" y1="158" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="320" y1="212" x2="320" y2="224" stroke="#64748b" stroke-width="2"/><line x1="320" y1="266" x2="320" y2="278" stroke="#64748b" stroke-width="2"/><line x1="320" y1="320" x2="320" y2="332" stroke="#64748b" stroke-width="2"/>
<text x="30" y="40" class="svg-accent" font-size="12">IGMP side</text><text x="30" y="205" class="svg-accent" font-size="12">Routing side</text><text x="30" y="345" class="svg-accent" font-size="12">Layer 2</text>
</svg><p class="cap">Upar se neeche chalo. Pehla galat jawab theek karo, phir aage badhne se pehle test dobara chalao: ek fault doosre ko chhupa sakta hai.</p></div>

<h3>Saat sawaal aur clues</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th><th>Galat jawab aisa dikhta hai</th></tr>
<tr><td>1. Kya host ne sach mein join kiya?</td><td>Lab PC: <code>show mcast</code>. Real hosts: <code>ip maddr show</code> (Linux), <code>netsh interface ip show joins</code> (Windows)</td><td>Host par group missing: application maang hi nahi rahi</td></tr>
<tr><td>2. Kya receiver-facing interface par IGMP chal raha hai?</td><td><code>show ip igmp interface &lt;intf&gt;</code></td><td>Text "IGMP is disabled on interface"</td></tr>
<tr><td>3a. Kya group table mein sahi interface par hai?</td><td><code>show ip igmp groups</code></td><td>Group missing, ya kisi aur interface par listed</td></tr>
<tr><td>3b. Kya interface version request se match karta hai?</td><td><code>show ip igmp interface</code>, line "Current IGMP host version"</td><td>Source-specific join chahiye par version 2 ya 1</td></tr>
<tr><td>3c. Kya group address routable hai?</td><td>Address dekho</td><td>224.0.0.0/24 ka address (kabhi routed nahi, kabhi listed nahi), ya aapke 239 plan se bahar</td></tr>
<tr><td>4. Kya mroute table is LAN par forward karti hai?</td><td><code>show ip mroute &lt;group&gt;</code></td><td>Entry nahi, ya interface outgoing list mein nahi, ya SSM ke liye expected <b>s</b>/<b>I</b> flags nahi</td></tr>
<tr><td>5. Kya tree upstream poora hai?</td><td><code>show ip pim neighbor</code>, <code>show ip rpf</code></td><td>Incoming interface Null, PIM neighbour nahi (modules 3 se 5)</td></tr>
<tr><td>6. Kya source sach mein bhej raha hai?</td><td>Source host, uske first-hop router par <code>show ip mroute</code></td><td>(S,G) entry nahi, ya TTL 1 jisse pehla router drop kar deta hai</td></tr>
<tr><td>7. Kya switch port par forward karta hai?</td><td><code>show ip igmp snooping groups</code>, <code>mrouter</code>, <code>querier</code></td><td>Group ki port list mein port nahi, mrouter port nahi, querier nahi</td></tr>
</table>

<h3>Ek fault doosre ko chhupa sakta hai</h3>
<p>Lab isi rule par bana hai. Isme IGMP side par kai independent faults hain, aur har ek alag stream ko rokta hai. Pehla fix karne par sirf ek stream wapas aati hai; baaki alag wajahon se abhi bhi toot-ti hain. Isliye har fix ke baad <b>har channel ko alag se</b> test karo, phir jo abhi bhi fail hon unke liye agli layer par jao. Jab pehla PC kuch receive kar le to ruko mat.</p>
<div class="eg"><p><b>Kaise chalana hai.</b> Configuration chhune se pehle teen line ki table likho: channel, receiver, expected source. Har row ke liye sawaal 1 se 4 chalo aur pehla galat jawab uske saamne likho. Ab aapke paas to-do list hai. Fix karo, retest karo, tick karo. Aisi evidence ki aadat interviewer bhi sunna chahta hai.</p></div>

<h3>Layer 2 par ek worked trace (illustrative output)</h3>
<p>Chennai store: router group list karta hai, aur PC1 tatha PC2 theek hain par PC3 ko abhi bhi stream nahi. Switch par:</p>
<pre class="out">SW1#show ip igmp snooping groups vlan 20
Vlan      Group                  Type        Version     Port List
-----------------------------------------------------------------------
20        239.20.1.1             igmp        v2          Gi1/0/2, Gi1/0/3

SW1#show vlan id 30
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
30   STORE-PRINT                      active    <span class="hl">Gi1/0/4</span></pre>
<p>VLAN 20 ki group list mein Gi1/0/4 nahi hai, kyunki woh port VLAN 30 ka hai. IGMP aur snooping theek hain: PC3 galat VLAN mein laga hai, isliye uska report is router interface ko kabhi sunai hi nahi deta. Jawab list ki layer 1, 2 aur 7 se aaya, PIM se nahi.</p>

<h3>Kaam ke tools</h3>
<ul>
<li><b>Multicast ping.</b> Router se <code>ping &lt;group&gt;</code> group ko echo requests bhejta hai; jin routers ya hosts ne join kiya hai woh reply karte hain. Door ke interface par <code>ip igmp join-group</code> lagakar poora tree prove kar sakte ho. Baad mein join-group hata do.</li>
<li><b>Packet capture.</b> Receiver port ka capture queries (224.0.0.1 par), reports aur stream khud dikhata hai. Lab simulator mein IGMP aur PIM packets capture karke fields padh sakte ho.</li>
<li><b>Debug.</b> <code>debug ip igmp</code> har query aur report print karta hai. Busy router par CPU overload ho sakta hai; show commands aur capture prefer karo, aur debug turant band karo.</li>
<li><b>Source TTL.</b> Kai applications default mein TTL 1 par multicast bhejti hain. Pehla router use zero kar deta hai aur packet drop ho jaata hai. Agar stream pehle hop par marti hai to source ki TTL setting dekho.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Source ya RP se shuru karna aur sahi configuration par ek ghanta lagana. Ek fault theek karke jeet ghoshit kar dena. Static-group ya join-group se "chalane" ki koshish karna bina yeh jaane ki IGMP kyun nahi chala. Yeh bhoolna ki doosre VLAN mein gaya host purane interface ko dikhta hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IGMP is disabled on interface" ka matlab wahan PIM mode nahi hai. 224.0.0.0/24 ka group table mein kabhi nahi aata. v2 interface source list carry nahi kar sakta. Static entry table ko healthy dikhati hai jabki receiver phir bhi toota ho sakta hai.</p></div>

<div class="scn"><h4>Teen log, ek ticket</h4><p>Bharat Retail ko ek ticket mila, "Pune store mein training video toot gayi", aur teen engineers ko alag-alag problem mili. Pehle ne dekha ki ek PC router ki group table mein nahi dikha aur use theek kiya. Ticket khula raha. Doosre ne dekha ki source-specific channel abhi bhi fail hai aur use receiver-LAN IGMP version tak trace kiya. Teesre ne dekha ki ek custom app aisa group use karti hai jo routers kabhi forward nahi karte. Agar woh layered list follow karte, to ek engineer pehle bees minute mein teen findings likh leta aur ek visit mein sab theek kar deta.</p><p><b>Lesson:</b> har channel likho, har ek ko alag test karo aur jab tak har ek pass na ho band mat karo.</p></div>

<div class="iv"><p class="q">"User kehta hai multicast video play nahi ho rahi. Aap troubleshoot kaise karoge?"</p><p>Strong answer: receiver se shuru karunga, source se nahi. Pehle host ne join kiya ya nahi, phir router interface: IGMP enabled, version, querier. Phir group table, phir mroute entry aur uski outgoing list, aur tab jaakar PIM, RPF aur source. Layer 2 bhi shamil karunga: snooping group list, mrouter port, querier. Har fix ke baad har channel ko alag se test karunga, kyunki kai faults ek saath ho sakte hain. Chalte-chalte commands ke naam bataunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Receiver se upar ki taraf troubleshoot karo, har layer par ek sawaal, aur pehle galat jawab par ruko.</li>
<li>Pehle IGMP side: host joined, interface enabled, group listed, version fit, address valid.</li>
<li>Phir mroute aur OIL, upstream PIM aur RPF, source aur TTL, aur aakhir mein switch snooping.</li>
<li>Faults ek-doosre ko chhupate hain: har fix ke baad har channel retest karo.</li>
<li>Kaam hone par test join-groups aur debug hata do; findings ki likhi hui list rakho.</li>
</ul></div>
`}};export{e as default};