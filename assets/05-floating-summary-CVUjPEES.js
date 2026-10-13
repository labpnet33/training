var e={id:`floating-summary`,h:{en:`Floating, summary and host routes: static routing done well`,hi:`Floating, summary aur host routes: static routing sahi tareeke se`},body:{en:`
<p>Lab 1 gave the branch one link and one default route. Real branches usually have a second way out: a 4G/5G router, a broadband line or a second MPLS circuit. This chapter shows how static routing handles a backup path, how to keep tables short with summary routes, and when static routing stops being the right tool.</p>

<h3>An analogy: the spare key under the mat</h3>
<p>You always use your main key. The spare key under the mat is there, but you only reach for it when the main key is missing. A <b>floating static route</b> is that spare key: a real, configured route that stays out of the routing table while a better route exists, and "floats" into the table the moment the better one disappears.</p>

<h3>How a floating static route works</h3>
<p>You configure a second route to the same prefix with a <b>higher administrative distance</b> than the primary. The router installs only the lowest-AD route. The backup is remembered in the configuration but not installed. If the primary route is removed, the backup is installed automatically.</p>
<pre class="code"><span class="c">! on BR: primary default via the HQ link (AD 1)</span>
ip route 0.0.0.0 0.0.0.0 10.0.12.1
<span class="c">! backup default via an LTE router on 198.51.100.0/30 (AD 10)</span>
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Floating static route as a backup">
<rect x="20" y="75" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="14">BR</text>
<rect x="420" y="20" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">HQ link (AD 1)</text>
<rect x="420" y="134" width="180" height="46" rx="8" fill="#fde68a"/><text x="510" y="162" text-anchor="middle" class="svg-ink" font-size="13">LTE backup (AD 10)</text>
<line x1="140" y1="90" x2="420" y2="43" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="110" x2="420" y2="157" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="270" y="55" class="svg-accent" font-size="12">installed</text>
<text x="260" y="160" class="svg-muted" font-size="12">waits until primary is gone</text>
</svg><p class="cap">Only the lowest AD is installed. The dashed backup floats in when the primary route is removed.</p></div>

<pre class="out">BR#show ip route static
<span class="hl">S*    0.0.0.0/0 [1/0] via 10.0.12.1</span>

<span class="c">! the HQ link fails: Gi0/0 goes down</span>
BR#show ip route static
<span class="hl">S*    0.0.0.0/0 [10/0] via 198.51.100.1</span></pre>
<p>The same trick protects a dynamic route. If OSPF normally carries 192.168.2.0/24 (AD 110), a static route with AD 130 to the same prefix stays hidden until OSPF loses the route. The backup AD must be <b>higher than the protocol you are backing up</b>; with AD 1 it would override OSPF instead.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming a floating route reacts to every failure. A static route is removed only when its next hop becomes unreachable, usually because the local interface went down. If the HQ link stays up but something beyond it fails (for example the ISP behind HQ), the primary route stays and traffic is black-holed. Production designs add reachability tracking (on Cisco, IP SLA with object tracking) or use a dynamic protocol to detect such failures.</p></div>

<h3>Summary routes</h3>
<p>A <b>summary route</b> (also called an aggregate or supernet) covers several contiguous networks with one shorter prefix. If a branch uses 10.2.0.0/24, 10.2.1.0/24, 10.2.2.0/24 and 10.2.3.0/24, HQ can use one route instead of four:</p>
<pre class="code"><span class="c">! 10.2.0.0 to 10.2.3.255 = 10.2.0.0/22 = mask 255.255.252.0</span>
ip route 10.2.0.0 255.255.252.0 10.0.12.2</pre>

<div class="eg"><p><b>Worked example: building the summary.</b> Write the third octets in binary: 0 = 000000<b>00</b>, 1 = 000000<b>01</b>, 2 = 000000<b>10</b>, 3 = 000000<b>11</b>. The first six bits are identical, the last two vary. So 16 bits (first two octets) plus 6 bits = <b>/22</b>. The mask is 255.255.252.0 and the summary is 10.2.0.0/22. It covers exactly those four /24s and nothing else. If the branch had used 10.2.4.0/24 as well, the /22 would not cover it, and a /21 would also cover 10.2.5.0 to 10.2.7.255, networks that might live elsewhere.</p></div>
<p>Summaries shrink routing tables and hide small changes inside the range, but a summary that is too broad attracts traffic for addresses that do not exist at the destination. Longest prefix match helps: more specific routes elsewhere still win for their own addresses.</p>

<h3>Host routes</h3>
<p>A <b>host route</b> is a /32 (mask 255.255.255.255) to exactly one address. It is used to steer traffic for one server along a special path, for example sending a monitoring server's traffic over the backup link: <code>ip route 10.1.1.50 255.255.255.255 198.51.100.1</code>. Because /32 is the longest possible prefix, it beats every other route for that one address.</p>

<h3>Static or dynamic?</h3>
<table class="cmp"><tr><th>Question</th><th>Static routing</th><th>Dynamic routing</th></tr>
<tr><td>Configuration effort</td><td>Low for a few routes, grows with every network</td><td>Some setup once, then automatic</td></tr>
<tr><td>Reaction to failure</td><td>Only if the next hop becomes unreachable</td><td>Automatic reconvergence</td></tr>
<tr><td>CPU, memory, bandwidth</td><td>None</td><td>Hellos, updates, calculations</td></tr>
<tr><td>Predictability and security</td><td>Exactly what you typed; nothing advertised</td><td>Needs neighbour authentication and filtering</td></tr>
<tr><td>Best fit</td><td>Stub sites, internet edge, backups</td><td>Multiple paths, many routers, frequent change</td></tr>
</table>
<p>Most real networks mix both: OSPF or EIGRP inside, a static default at the edge, and floating statics as insurance.</p>

<div class="exam"><p><b>Exam trap.</b> "Which route is used when both links are up?" The floating route is not used and is not visible in <code>show ip route</code>; it appears in <code>show running-config</code> only. Do not choose "both, load balanced": different ADs never load-balance.</p></div>

<div class="scn"><h4>The backup that never took over</h4><p>A branch had a primary default route via the MPLS router and a floating default (AD 10) via a broadband router. During a provider outage the branch went offline for two hours. The engineer found that the MPLS router's LAN port stayed up; only the provider's core was broken. The primary static route's next hop was still reachable on the LAN, so the floating route never appeared. The fix was to track reachability of an HQ address and remove the primary route when the probe failed, so the broadband backup could float in.</p><p><b>Lesson:</b> a floating static route protects against local link failure only. Test your failover by breaking the far side, not just by pulling your own cable.</p></div>

<div class="iv"><p class="q">"What is a floating static route and how do you configure one?"</p><p>Strong answer: a static route with an administrative distance higher than the primary route to the same prefix, so it stays out of the table until the primary disappears. Give the syntax (the AD at the end of <code>ip route</code>), the rule that it must be higher than the protocol it backs up (above 110 to back up OSPF), and the limitation that it depends on the primary route actually being withdrawn.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A floating static route has a higher AD than the primary and is installed only when the primary disappears.</li>
<li>To back up a dynamic route, the floating AD must be higher than that protocol's AD.</li>
<li>Summary routes cover contiguous networks with one shorter prefix; calculate the common bits carefully.</li>
<li>A host route is a /32 and beats every other route for that one address.</li>
<li>Static suits stub sites, edges and backups; dynamic suits multi-path networks that change.</li>
</ul></div>
`,hi:`
<p>Lab 1 ne branch ko ek link aur ek default route diya. Real branches mein aam taur par bahar jaane ka doosra raasta hota hai: 4G/5G router, broadband line ya doosra MPLS circuit. Yeh chapter dikhata hai ki static routing backup path ko kaise handle karti hai, summary routes se tables chhoti kaise rakhein, aur static routing kab sahi tool nahi rehti.</p>

<h3>Ek analogy: mat ke neeche spare chaabi</h3>
<p>Aap hamesha apni main chaabi use karte ho. Mat ke neeche spare chaabi hai, lekin aap use tabhi uthaate ho jab main chaabi na mile. <b>Floating static route</b> wahi spare chaabi hai: ek real, configured route jo routing table se bahar rehta hai jab tak behtar route exist karta hai, aur jaise hi behtar route gayab hota hai, table mein "float" kar aata hai.</p>

<h3>Floating static route kaise kaam karta hai</h3>
<p>Aap same prefix ka doosra route primary se <b>zyada administrative distance</b> ke saath configure karte ho. Router sirf sabse kam AD wala route install karta hai. Backup configuration mein yaad rehta hai lekin install nahi hota. Agar primary route hat jaata hai, to backup apne aap install ho jaata hai.</p>
<pre class="code"><span class="c">! BR par: HQ link ke through primary default (AD 1)</span>
ip route 0.0.0.0 0.0.0.0 10.0.12.1
<span class="c">! 198.51.100.0/30 par LTE router ke through backup default (AD 10)</span>
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Backup ke roop mein floating static route">
<rect x="20" y="75" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="14">BR</text>
<rect x="420" y="20" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">HQ link (AD 1)</text>
<rect x="420" y="134" width="180" height="46" rx="8" fill="#fde68a"/><text x="510" y="162" text-anchor="middle" class="svg-ink" font-size="13">LTE backup (AD 10)</text>
<line x1="140" y1="90" x2="420" y2="43" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="110" x2="420" y2="157" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="270" y="55" class="svg-accent" font-size="12">installed</text>
<text x="260" y="160" class="svg-muted" font-size="12">primary jaane tak wait</text>
</svg><p class="cap">Sirf sabse kam AD install hoti hai. Dashed backup tab float karke aata hai jab primary route hat jaata hai.</p></div>

<pre class="out">BR#show ip route static
<span class="hl">S*    0.0.0.0/0 [1/0] via 10.0.12.1</span>

<span class="c">! HQ link fail: Gi0/0 down ho jaata hai</span>
BR#show ip route static
<span class="hl">S*    0.0.0.0/0 [10/0] via 198.51.100.1</span></pre>
<p>Yahi trick dynamic route ko bhi protect karti hai. Agar OSPF normally 192.168.2.0/24 carry karta hai (AD 110), to same prefix ka AD 130 wala static route tab tak chhupa rehta hai jab tak OSPF route kho na de. Backup AD <b>us protocol se zyada honi chahiye jiska aap backup le rahe ho</b>; AD 1 ke saath woh OSPF ko override kar dega.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki floating route har failure par react karta hai. Static route tabhi hatta hai jab uska next hop unreachable ho, aam taur par isliye kyunki local interface down ho gaya. Agar HQ link up rehta hai lekin uske aage kuch fail hota hai (jaise HQ ke peeche ISP), to primary route bana rehta hai aur traffic black-hole ho jaata hai. Production designs reachability tracking add karte hain (Cisco par IP SLA with object tracking) ya aise failures detect karne ke liye dynamic protocol use karte hain.</p></div>

<h3>Summary routes</h3>
<p><b>Summary route</b> (jise aggregate ya supernet bhi kehte hain) kai contiguous networks ko ek chhote prefix se cover karta hai. Agar branch 10.2.0.0/24, 10.2.1.0/24, 10.2.2.0/24 aur 10.2.3.0/24 use karti hai, to HQ chaar ki jagah ek route use kar sakta hai:</p>
<pre class="code"><span class="c">! 10.2.0.0 se 10.2.3.255 = 10.2.0.0/22 = mask 255.255.252.0</span>
ip route 10.2.0.0 255.255.252.0 10.0.12.2</pre>

<div class="eg"><p><b>Worked example: summary banana.</b> Teesre octets binary mein likho: 0 = 000000<b>00</b>, 1 = 000000<b>01</b>, 2 = 000000<b>10</b>, 3 = 000000<b>11</b>. Pehle chhe bits same hain, aakhri do badalte hain. To 16 bits (pehle do octets) plus 6 bits = <b>/22</b>. Mask 255.255.252.0 hai aur summary 10.2.0.0/22. Yeh exactly un chaar /24s ko cover karta hai aur kuch nahi. Agar branch 10.2.4.0/24 bhi use karti, to /22 use cover nahi karta, aur /21 10.2.5.0 se 10.2.7.255 bhi cover karta, aise networks jo kahin aur ho sakte hain.</p></div>
<p>Summaries routing tables chhoti karti hain aur range ke andar ke chhote changes chhupa deti hain, lekin bahut broad summary un addresses ka traffic bhi kheench leti hai jo destination par exist hi nahi karte. Longest prefix match madad karta hai: kahin aur ke zyada specific routes apne addresses ke liye abhi bhi jeette hain.</p>

<h3>Host routes</h3>
<p><b>Host route</b> exactly ek address ka /32 (mask 255.255.255.255) hai. Yeh ek server ke traffic ko special path par bhejne ke liye use hota hai, jaise monitoring server ka traffic backup link par bhejna: <code>ip route 10.1.1.50 255.255.255.255 198.51.100.1</code>. Kyunki /32 sabse lamba possible prefix hai, yeh us ek address ke liye har doosre route ko beat karta hai.</p>

<h3>Static ya dynamic?</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Static routing</th><th>Dynamic routing</th></tr>
<tr><td>Configuration effort</td><td>Kuch routes ke liye kam, har network ke saath badhta hai</td><td>Ek baar kuch setup, phir automatic</td></tr>
<tr><td>Failure par reaction</td><td>Sirf tab jab next hop unreachable ho</td><td>Automatic reconvergence</td></tr>
<tr><td>CPU, memory, bandwidth</td><td>Kuch nahi</td><td>Hellos, updates, calculations</td></tr>
<tr><td>Predictability aur security</td><td>Exactly jo aapne type kiya; kuch advertise nahi hota</td><td>Neighbour authentication aur filtering chahiye</td></tr>
<tr><td>Best fit</td><td>Stub sites, internet edge, backups</td><td>Multiple paths, bahut routers, baar baar change</td></tr>
</table>
<p>Zyada tar real networks dono mix karte hain: andar OSPF ya EIGRP, edge par static default, aur insurance ke roop mein floating statics.</p>

<div class="exam"><p><b>Exam trap.</b> "Jab dono links up hain to kaunsa route use hota hai?" Floating route use nahi hota aur <code>show ip route</code> mein dikhta bhi nahi; yeh sirf <code>show running-config</code> mein dikhta hai. "Dono, load balanced" mat chuno: alag ADs kabhi load-balance nahi karti.</p></div>

<div class="scn"><h4>Backup jo kabhi active nahi hua</h4><p>Ek branch ke paas MPLS router ke through primary default route aur broadband router ke through floating default (AD 10) tha. Provider outage ke dauraan branch do ghante offline rahi. Engineer ne dekha ki MPLS router ka LAN port up raha; sirf provider ka core toota tha. Primary static route ka next hop LAN par abhi bhi reachable tha, isliye floating route kabhi aaya hi nahi. Fix tha HQ ke ek address ki reachability track karna aur probe fail hone par primary route hataana, taaki broadband backup float karke aa sake.</p><p><b>Seekh:</b> floating static route sirf local link failure se bachata hai. Failover ko door wali side tod kar test karo, sirf apni cable kheench kar nahi.</p></div>

<div class="iv"><p class="q">"Floating static route kya hai aur use kaise configure karte ho?"</p><p>Strong answer: aisa static route jiski administrative distance same prefix ke primary route se zyada hai, isliye woh table se bahar rehta hai jab tak primary gayab na ho. Syntax batao (<code>ip route</code> ke end mein AD), yeh rule ki woh jis protocol ka backup hai usse zyada honi chahiye (OSPF ke backup ke liye 110 se upar), aur yeh limitation ki woh primary route ke sach mein withdraw hone par depend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Floating static route ki AD primary se zyada hoti hai aur woh sirf primary gayab hone par install hota hai.</li>
<li>Dynamic route ka backup lene ke liye floating AD us protocol ki AD se zyada honi chahiye.</li>
<li>Summary routes contiguous networks ko ek chhote prefix se cover karte hain; common bits dhyaan se nikaalo.</li>
<li>Host route /32 hai aur us ek address ke liye har doosre route ko beat karta hai.</li>
<li>Static stub sites, edges aur backups ke liye theek hai; dynamic badalte multi-path networks ke liye.</li>
</ul></div>
`}};export{e as default};