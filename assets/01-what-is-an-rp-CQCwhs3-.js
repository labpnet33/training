var e={id:`what-is-an-rp`,h:{en:`What an RP is and four ways routers learn it`,hi:`RP kya hota hai aur routers ise chaar tareekon se kaise seekhte hain`},body:{en:`
<p><b>What you will learn in this module.</b> You will be able to explain what a rendezvous point (RP) does, choose between static RP, Auto-RP, BSR and anycast RP, predict which RP a router picks when group ranges overlap, build a redundant RP with MSDP, and troubleshoot an RP that is wrong, missing or unreachable. <b>Prerequisites:</b> you should know what a multicast group address is, how a host joins with IGMP, and the basic PIM sparse mode steps (neighbours, <code>(*,G)</code>, <code>(S,G)</code>). Those come from the earlier modules <b>Multicast addressing, IGMP and IGMP snooping</b> and <b>PIM sparse mode and SSM</b>. We will only recap what we need.</p>

<h3>Start with an analogy: the meeting point</h3>
<p>Imagine a large college fest in Pune. Students from many departments want to watch a live concert, and the organisers (the sources) do not know who is interested. Instead of every organiser searching the whole campus, the college announces one meeting point: "the main gate notice board". Interested students leave their name there. Organisers send the concert details there. The notice board connects the two sides. Later, once they know each other, they can talk directly.</p>
<p>In PIM sparse mode that notice board is the <b>rendezvous point (RP)</b>: one router that receivers send their <code>(*,G)</code> joins to, and that sources register with. Without an RP, a sparse-mode router has no idea where to send a join, so the shared tree never forms.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Receivers and sources meet at the RP">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Source (S)</text>
<rect x="265" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">RP 2.2.2.2</text>
<rect x="510" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="115" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text>
<line x1="130" y1="100" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><text x="170" y="62" class="svg-muted" font-size="12">1 register</text>
<line x1="510" y1="100" x2="375" y2="55" stroke="#64748b" stroke-width="2"/><text x="440" y="62" class="svg-muted" font-size="12">2 (*,G) join</text>
<line x1="130" y1="125" x2="510" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">3 later: direct path (S,G) after SPT switchover</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">Every router must agree on the same RP for the same group.</text>
</svg><p class="cap">The RP is where sources and receivers first find each other. All routers must know its address.</p></div>

<h3>The one rule that matters</h3>
<p>Every router in the multicast domain must map a given group to the <b>same</b> RP. If the first-hop router registers with RP A and the last-hop router joins towards RP B, the two never meet, and the receiver sees nothing even though every link is healthy. Everything in this module is a different answer to the question: <i>how do all routers end up with the same group-to-RP mapping?</i></p>

<h3>Four ways to learn the RP</h3>
<table class="cmp"><tr><th>Method</th><th>How the mapping spreads</th><th>Good for</th></tr>
<tr><td><b>Static RP</b></td><td>You type <code>ip pim rp-address</code> on every router</td><td>Small networks, simple, no moving parts</td></tr>
<tr><td><b>Auto-RP</b></td><td>Candidate RPs announce, a mapping agent decides and floods the result (Cisco-originated)</td><td>Existing Cisco networks, dynamic</td></tr>
<tr><td><b>BSR</b></td><td>An elected bootstrap router collects candidate RPs and floods the RP-set (open standard)</td><td>Mixed vendors, dynamic</td></tr>
<tr><td><b>Anycast RP</b></td><td>Two or more RPs share one address; MSDP shares source information between them</td><td>RP redundancy and load sharing, usually with static RP</td></tr>
</table>
<p>Notice that anycast RP is not a competitor of the first three. It solves a different problem (redundancy) and normally sits on top of a static RP configuration. You will build all four in the labs of this module.</p>

<h3>Where you look first</h3>
<p>On a Cisco IOS XE router the command that shows the answer is <code>show ip pim rp mapping</code>. Here is the output on a router that has a static RP:</p>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 10.255.255.100 (?)</span></pre>
<p>It lists the group range and the RP for it. Later, with Auto-RP and BSR, you will see extra lines telling you <i>who told this router</i> ("Info source") and how.</p>

<div class="eg"><p><b>Worked example.</b> Sahyadri University streams live classes from its studio in Pune. The network has 12 routers. With a static RP the engineer types one line on each router, 12 lines in total. If the RP loopback address changes, those 12 lines must change. With BSR the engineer types two lines on the candidate RPs and two on the candidate BSRs, and the rest learn everything alone. Static is simplest to understand; dynamic methods save typing and reduce human error as the network grows.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the RP on only some routers, usually the RP itself and the first-hop router. The last-hop router then has no RP and the receiver gets nothing. A <code>(*, G)</code> entry with <code>RP 0.0.0.0</code> is the classic sign.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RP is not on the data path forever. After the switchover to the shortest-path tree, traffic may no longer pass through it. A failed RP therefore stops <i>new</i> trees from forming, but existing <code>(S,G)</code> flows can keep running until their state expires.</p></div>

<div class="scn"><h4>The stream that never arrived</h4><p>Deccan Broadcast launched a new channel on 239.10.1.1. The head-end engineer enabled PIM everywhere and configured <code>ip pim rp-address 2.2.2.2</code> on the routers he could reach, but he missed the Delhi edge router. The Delhi viewers' set-top boxes joined the group and the edge router showed <code>(*, 239.10.1.1), RP 0.0.0.0</code>. Nothing arrived. He added the same RP line on the edge router and the stream appeared in seconds.</p><p><b>Lesson:</b> check <code>show ip pim rp mapping</code> on the router closest to the receiver first; it must name the same RP as everyone else.</p></div>

<div class="iv"><p class="q">"What is a rendezvous point and why does PIM sparse mode need one?"</p><p>Strong answer: sparse mode builds trees only where receivers ask. The RP is the common root for shared trees: receivers send <code>(*,G)</code> joins towards it and first-hop routers register sources with it, so receivers and sources can find each other without flooding. Mention that all routers must agree on one RP per group, and name the four ways to learn it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The RP is the meeting point of PIM sparse mode: receivers join towards it, sources register with it.</li>
<li>All routers must map a group to the same RP; disagreement means no delivery.</li>
<li>Four methods: static, Auto-RP, BSR and anycast RP (the last one is about redundancy).</li>
<li><code>show ip pim rp mapping</code> is the first command to run.</li>
<li><code>RP 0.0.0.0</code> in a <code>(*,G)</code> entry means the router has no RP for that group.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap samjha paoge ki rendezvous point (RP) kya kaam karta hai, static RP, Auto-RP, BSR aur anycast RP mein se kaunsa chunna hai, jab group ranges overlap karein to router kaunsa RP chunta hai yeh predict kar paoge, MSDP ke saath redundant RP bana paoge, aur galat, missing ya unreachable RP ko troubleshoot kar paoge. <b>Prerequisites:</b> aapko pata hona chahiye ki multicast group address kya hai, host IGMP se join kaise karta hai, aur PIM sparse mode ke basic steps (neighbours, <code>(*,G)</code>, <code>(S,G)</code>). Yeh pichhle modules <b>Multicast addressing, IGMP and IGMP snooping</b> aur <b>PIM sparse mode and SSM</b> mein aate hain. Hum sirf utna recap karenge jitna chahiye.</p>

<h3>Ek analogy se shuru karo: milne ki jagah</h3>
<p>Pune ke ek bade college fest ki kalpana karo. Alag alag departments ke students live concert dekhna chahte hain, aur organisers (sources) ko pata nahi ki kaun interested hai. Har organiser poora campus khojne ki jagah, college ek milne ki jagah announce karta hai: "main gate ka notice board". Interested students wahan apna naam likh dete hain. Organisers concert ki details wahin bhejte hain. Notice board dono taraf ko jodta hai. Baad mein, jab woh ek dusre ko jaan jaate hain, to seedhe baat kar sakte hain.</p>
<p>PIM sparse mode mein woh notice board <b>rendezvous point (RP)</b> hai: ek router jiske taraf receivers apne <code>(*,G)</code> joins bhejte hain aur jiske paas sources register karte hain. RP ke bina sparse-mode router ko pata hi nahi ki join kahan bhejna hai, isliye shared tree banta hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Receivers aur sources RP par milte hain">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Source (S)</text>
<rect x="265" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">RP 2.2.2.2</text>
<rect x="510" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="115" text-anchor="middle" class="svg-ink" font-size="13">Receiver</text>
<line x1="130" y1="100" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><text x="170" y="62" class="svg-muted" font-size="12">1 register</text>
<line x1="510" y1="100" x2="375" y2="55" stroke="#64748b" stroke-width="2"/><text x="440" y="62" class="svg-muted" font-size="12">2 (*,G) join</text>
<line x1="130" y1="125" x2="510" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">3 baad mein: SPT switchover ke baad seedha path (S,G)</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">Har router ko same group ke liye same RP pata hona chahiye.</text>
</svg><p class="cap">RP woh jagah hai jahan sources aur receivers pehli baar ek dusre ko milte hain. Saare routers ko iska address pata hona chahiye.</p></div>

<h3>Ek rule jo sabse zaroori hai</h3>
<p>Multicast domain ke har router ko diye gaye group ko <b>same</b> RP se map karna hona chahiye. Agar first-hop router RP A ke paas register kare aur last-hop router RP B ki taraf join kare, to dono kabhi nahi milte, aur receiver ko kuch nahi dikhta chahe har link theek ho. Is module ki har cheez ek hi sawal ka alag jawab hai: <i>saare routers ke paas same group-to-RP mapping kaise pahunche?</i></p>

<h3>RP seekhne ke chaar tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Mapping kaise failti hai</th><th>Kis ke liye achha</th></tr>
<tr><td><b>Static RP</b></td><td>Aap har router par <code>ip pim rp-address</code> type karte ho</td><td>Chhote networks, simple, koi moving part nahi</td></tr>
<tr><td><b>Auto-RP</b></td><td>Candidate RPs announce karte hain, mapping agent decide karke result flood karta hai (Cisco se aaya)</td><td>Existing Cisco networks, dynamic</td></tr>
<tr><td><b>BSR</b></td><td>Elected bootstrap router candidate RPs ko collect karke RP-set flood karta hai (open standard)</td><td>Mixed vendors, dynamic</td></tr>
<tr><td><b>Anycast RP</b></td><td>Do ya zyada RPs ek address share karte hain; MSDP unke beech source information share karta hai</td><td>RP redundancy aur load sharing, aam taur par static RP ke saath</td></tr>
</table>
<p>Dhyan do ki anycast RP pehle teen ka competitor nahi hai. Yeh alag problem (redundancy) solve karta hai aur aam taur par static RP configuration ke upar baithta hai. Is module ke labs mein aap chaaron banaoge.</p>

<h3>Sabse pehle kahan dekhna hai</h3>
<p>Cisco IOS XE router par jawab dikhane wala command <code>show ip pim rp mapping</code> hai. Yeh static RP wale router ka output hai:</p>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 10.255.255.100 (?)</span></pre>
<p>Yeh group range aur uska RP list karta hai. Baad mein Auto-RP aur BSR ke saath aapko extra lines dikhengi jo batati hain ki <i>is router ko kisne bataya</i> ("Info source") aur kaise.</p>

<div class="eg"><p><b>Worked example.</b> Sahyadri University apni live classes Pune ke studio se stream karti hai. Network mein 12 routers hain. Static RP ke saath engineer har router par ek line type karta hai, kul 12 lines. Agar RP loopback address badle, to woh 12 lines badalni padengi. BSR ke saath engineer candidate RPs par do lines aur candidate BSRs par do lines type karta hai, baaki sab khud seekh lete hain. Static samajhna sabse aasaan hai; dynamic methods typing bachate hain aur network badhne par human error kam karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> RP ko sirf kuch routers par configure karna, aam taur par RP khud aur first-hop router par. Tab last-hop router ke paas RP nahi hota aur receiver ko kuch nahi milta. <code>RP 0.0.0.0</code> wali <code>(*, G)</code> entry classic sign hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> RP data path par hamesha nahi rehta. Shortest-path tree par switchover ke baad traffic uske through na bhi jaye. Isliye failed RP <i>naye</i> trees banne se rokta hai, lekin existing <code>(S,G)</code> flows state expire hone tak chal sakte hain.</p></div>

<div class="scn"><h4>Woh stream jo kabhi nahi aayi</h4><p>Deccan Broadcast ne 239.10.1.1 par naya channel launch kiya. Head-end engineer ne har jagah PIM on kiya aur jin routers tak woh pahunch paya unpar <code>ip pim rp-address 2.2.2.2</code> configure kiya, lekin Delhi edge router chhoot gaya. Delhi viewers ke set-top boxes ne group join kiya aur edge router ne <code>(*, 239.10.1.1), RP 0.0.0.0</code> dikhaya. Kuch nahi aaya. Usne edge router par wahi RP line jodi aur stream kuch seconds mein aa gayi.</p><p><b>Seekh:</b> sabse pehle receiver ke sabse paas wale router par <code>show ip pim rp mapping</code> check karo; usme wahi RP hona chahiye jo baaki sab mein hai.</p></div>

<div class="iv"><p class="q">"Rendezvous point kya hota hai aur PIM sparse mode ko iski zaroorat kyun padti hai?"</p><p>Strong answer: sparse mode trees sirf wahin banata hai jahan receivers maangte hain. RP shared trees ka common root hai: receivers <code>(*,G)</code> joins uski taraf bhejte hain aur first-hop routers sources ko uske paas register karte hain, taaki receivers aur sources bina flooding ke ek dusre ko dhoondh sakein. Batao ki har router ko ek group ke liye ek hi RP pata hona chahiye, aur RP seekhne ke chaar tareeke naam se bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RP PIM sparse mode ka milne ka point hai: receivers uski taraf join karte hain, sources uske paas register karte hain.</li>
<li>Saare routers ko group ko same RP se map karna chahiye; disagreement ka matlab delivery nahi.</li>
<li>Chaar methods: static, Auto-RP, BSR aur anycast RP (aakhri redundancy ke baare mein hai).</li>
<li><code>show ip pim rp mapping</code> pehla command hai jo chalana hai.</li>
<li>(*,G) entry mein <code>RP 0.0.0.0</code> ka matlab router ke paas us group ka RP nahi hai.</li>
</ul></div>
`}};export{e as default};