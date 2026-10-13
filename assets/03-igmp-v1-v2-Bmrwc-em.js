var e={id:`igmp-v1-v2`,h:{en:`IGMPv1 and IGMPv2: reports, queries, leave and the querier`,hi:`IGMPv1 aur IGMPv2: reports, queries, leave aur querier`},body:{en:`
<p>IGMP is a small question-and-answer protocol on one LAN. The router asks "who wants what?", the hosts answer "I want group G", and the router keeps a table. Nothing leaves the LAN: every IGMP packet has TTL 1. Think of a class teacher doing a roll call. The teacher (the <b>querier</b>) asks every few minutes "who is still in the class?", students answer, and anyone who stops answering is marked absent.</p>

<h3>The cast of messages</h3>
<table class="cmp"><tr><th>Message</th><th>Sent by</th><th>Sent to</th><th>Meaning</th></tr>
<tr><td><b>General query</b></td><td>Querier router</td><td>224.0.0.1 (all hosts)</td><td>"Which groups are you members of?"</td></tr>
<tr><td><b>Membership report</b></td><td>Host</td><td>The group address itself (v2)</td><td>"I am a member of G"</td></tr>
<tr><td><b>Leave group</b></td><td>Host (v2 only)</td><td>224.0.0.2 (all routers)</td><td>"I no longer want G"</td></tr>
<tr><td><b>Group-specific query</b></td><td>Querier</td><td>The group address</td><td>"Is anyone still in G?" (after a leave)</td></tr>
</table>
<p>An IGMPv2 message is only 8 bytes: type (0x11 query, 0x16 v2 report, 0x17 leave), maximum response time in tenths of a second, a checksum and the group address (0.0.0.0 in a general query).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IGMPv2 conversation">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">Router (querier)</text><text x="300" y="20" text-anchor="middle" class="svg-ink" font-size="13">Host A</text><text x="540" y="20" text-anchor="middle" class="svg-ink" font-size="13">Host B</text>
<line x1="80" y1="30" x2="80" y2="250" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="30" x2="300" y2="250" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="30" x2="540" y2="250" stroke="#64748b" stroke-width="1.5"/>
<line x1="80" y1="55" x2="300" y2="62" stroke="#0ea5e9" stroke-width="2"/><line x1="80" y1="55" x2="540" y2="70" stroke="#0ea5e9" stroke-width="2"/>
<text x="190" y="48" text-anchor="middle" class="svg-accent" font-size="11">General query to 224.0.0.1</text>
<line x1="300" y1="110" x2="80" y2="118" stroke="#22c55e" stroke-width="2"/><text x="190" y="104" text-anchor="middle" class="svg-accent" font-size="11">Report for G (A answers first)</text>
<text x="540" y="104" text-anchor="middle" class="svg-muted" font-size="11">B hears A, stays quiet</text>
<text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="11">(report suppression)</text>
<line x1="300" y1="170" x2="80" y2="178" stroke="#f97316" stroke-width="2"/><text x="190" y="164" text-anchor="middle" class="svg-accent" font-size="11">Leave G to 224.0.0.2</text>
<line x1="80" y1="195" x2="540" y2="205" stroke="#0ea5e9" stroke-width="2"/><text x="360" y="190" text-anchor="middle" class="svg-accent" font-size="11">Group-specific query for G</text>
<line x1="540" y1="225" x2="80" y2="232" stroke="#22c55e" stroke-width="2"/><text x="360" y="244" text-anchor="middle" class="svg-accent" font-size="11">B reports: G stays</text>
</svg><p class="cap">Time flows downward. One report per group per interval is enough for the router, so a second host stays silent.</p></div>

<h3>Joining: do hosts wait for a query?</h3>
<p>No. When an application starts listening, the host sends an <b>unsolicited report</b> immediately, so the stream can start within a second or two. The periodic query is only the refresh: it confirms the member is still there.</p>

<h3>Report suppression</h3>
<p>When a query arrives, each host starts a random timer between 0 and the <b>maximum response time</b> (10 seconds by default). The first host to answer sends its report to the group address. Other members of that group hear it, cancel their own timers and stay silent. The router needs to know that at least one member exists, not how many. This explains something you will see in the lab output: with two students joined to the same group, <code>show ip igmp groups</code> shows only <b>one</b> in the Last Reporter column. That is normal.</p>

<h3>Leaving: v1 versus v2</h3>
<ul>
<li><b>IGMPv1</b> has no leave message. When the last member simply stops, the router notices only when the membership timer expires, which takes minutes. The stream keeps flowing to an empty LAN for that time. In v1 the querier is the PIM designated router.</li>
<li><b>IGMPv2</b> adds the leave message and the group-specific query. When a host leaves, the router sends group-specific queries (last member query count 2, one second apart by default). If nobody answers, the group is removed within roughly 2 to 3 seconds. v2 also changes the querier election to the <b>lowest IP address</b>.</li>
</ul>
<p>Version 2 is the default on IOS XE interfaces. Most operating systems also speak v3 now, and when a router speaks only v2, the host falls back to v2 reports. You will see the details in chapter 4.</p>

<h3>The membership timers</h3>
<table class="cmp"><tr><th>Timer</th><th>Default (IOS XE)</th><th>What it controls</th></tr>
<tr><td>Query interval</td><td>60 s</td><td>How often the querier sends a general query</td></tr>
<tr><td>Max response time</td><td>10 s</td><td>Window in which hosts answer</td></tr>
<tr><td>Robustness</td><td>2</td><td>How many losses the protocol tolerates</td></tr>
<tr><td>Group membership interval</td><td>robustness x interval + max response</td><td>When a silent group is removed</td></tr>
<tr><td>Querier timeout</td><td>2 x query interval (120 s)</td><td>When another router takes over a dead querier</td></tr>
<tr><td>Last member query</td><td>count 2, interval 1 s</td><td>Speed of leave processing</td></tr>
</table>
<p>The interval commands exist (<code>ip igmp query-interval</code>, <code>ip igmp query-max-response-time</code>, <code>ip igmp last-member-query-count</code>), but the defaults are right for almost every network. Lowering the query interval makes membership refresh faster at the price of more control traffic.</p>

<h3>The querier election</h3>
<p>A LAN may have several routers. If all of them sent queries, hosts would answer several times for nothing. So routers elect <b>one querier per LAN</b>: when a router starts IGMP on an interface it assumes it is the querier and sends a query. If it hears a query from a router with a <b>lower</b> source IP address, it stops querying. The router with the lowest address wins. The others keep a timer (the querier timeout); if they stop hearing queries for that long, the lowest remaining address takes over.</p>
<div class="eg"><p><b>Worked example.</b> R1 has 10.30.1.3 and R2 has 10.30.1.2 on the same LAN. Both start sending queries. R1 hears R2's query from 10.30.1.2, which is lower, so R1 becomes a non-querier. R2 is the querier. If R2 is shut down, R1 waits 120 seconds, hears nothing and becomes the querier.</p></div>

<h3>Querier and PIM DR are different jobs</h3>
<p>The IGMP querier (lowest IP) <b>asks the questions</b>. The PIM designated router (highest priority, then highest IP) <b>forwards the stream onto the LAN</b> and sends PIM joins upstream. They can be two different routers, and that is fine: both hear the hosts' reports because reports go to the group address. You will prove this in the querier lab.</p>

<h3>Verification on IOS XE</h3>
<pre class="out">R2#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.30.1.2/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 2</span>
  Current IGMP router version is 2
  IGMP query interval is 60 seconds
  IGMP querier timeout is 120 seconds
  IGMP max query response time is 10 seconds
  Last member query count is 2
  Multicast designated router (DR) is 10.30.1.3
  <span class="hl">IGMP querying router is 10.30.1.2 (this system)</span>

R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.30.1.1       GigabitEthernet0/0       00:00:12  00:02:48  10.30.1.50</pre>
<p>Read it in order: the version, the querying router (is it who you expected?), the DR (a different router is normal), then the group table with its <b>Last Reporter</b> and a <b>Expires</b> counter that is reset by every report.</p>

<div class="warn"><p><b>Common mistakes.</b> Expecting the DR to be the querier. Expecting every host in the Last Reporter column. Renumbering a router and forgetting it can change the querier. Mixing IGMPv1 hosts on a v2 interface: the router downgrades its behaviour for that group, and leave becomes slow.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGMP querier = lowest IP. PIM DR = highest priority then highest IP. Reports in v2 go to the group address, leaves go to 224.0.0.2, queries go to 224.0.0.1. IGMP has no authentication and runs only on the local link (TTL 1).</p></div>

<div class="scn"><h4>The stream that stayed on after the room emptied</h4><p>A training room used old thin clients with an IGMPv1 stack. After class the video kept flowing into the room's VLAN for three minutes. The team first suspected the source. A look at the interface showed version 1 hosts, so leave messages were never sent and the router waited for the membership timer. They upgraded the client software to v2 and the stream now stops within seconds.</p><p><b>Lesson:</b> slow leave points to old IGMP versions or a snooping switch that holds ports too long.</p></div>

<div class="iv"><p class="q">"Two routers are on a LAN. Which one is the IGMP querier, and what happens if it fails?"</p><p>Strong answer: the router with the lowest IP address on that subnet. The others stay silent but run a querier-timeout timer, 2 x query interval by default. If no query is heard in that time, the lowest remaining address becomes the querier. Add that it is independent of the PIM DR, which is chosen by priority then highest address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>General queries go to 224.0.0.1; v2 reports go to the group; v2 leaves go to 224.0.0.2.</li>
<li>Hosts send an unsolicited report immediately, so joins are fast; queries only refresh.</li>
<li>Report suppression means the router sees one reporter per group.</li>
<li>v1 has no leave (slow); v2 adds leave and group-specific query.</li>
<li>Querier = lowest IP; DR = highest priority then highest IP; they can differ.</li>
</ul></div>
`,hi:`
<p>IGMP ek chhota question-and-answer protocol hai jo ek LAN par chalta hai. Router poochta hai "kisko kya chahiye?", hosts jawab dete hain "mujhe group G chahiye", aur router ek table rakhta hai. LAN se bahar kuch nahi jaata: har IGMP packet ka TTL 1 hota hai. Class teacher ke roll call ki tarah socho. Teacher (<b>querier</b>) har kuch minute mein poochta hai "class mein abhi kaun hai?", students jawab dete hain, aur jo jawab dena band kar de use absent mark kar diya jaata hai.</p>

<h3>Messages ki list</h3>
<table class="cmp"><tr><th>Message</th><th>Kaun bhejta hai</th><th>Kisko</th><th>Matlab</th></tr>
<tr><td><b>General query</b></td><td>Querier router</td><td>224.0.0.1 (all hosts)</td><td>"Tum kin groups ke member ho?"</td></tr>
<tr><td><b>Membership report</b></td><td>Host</td><td>Khud group address (v2)</td><td>"Main G ka member hoon"</td></tr>
<tr><td><b>Leave group</b></td><td>Host (sirf v2)</td><td>224.0.0.2 (all routers)</td><td>"Mujhe ab G nahi chahiye"</td></tr>
<tr><td><b>Group-specific query</b></td><td>Querier</td><td>Group address</td><td>"G mein abhi koi hai?" (leave ke baad)</td></tr>
</table>
<p>IGMPv2 message sirf 8 bytes ka hota hai: type (0x11 query, 0x16 v2 report, 0x17 leave), maximum response time dasvein hisse second mein, checksum aur group address (general query mein 0.0.0.0).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IGMPv2 conversation">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">Router (querier)</text><text x="300" y="20" text-anchor="middle" class="svg-ink" font-size="13">Host A</text><text x="540" y="20" text-anchor="middle" class="svg-ink" font-size="13">Host B</text>
<line x1="80" y1="30" x2="80" y2="250" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="30" x2="300" y2="250" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="30" x2="540" y2="250" stroke="#64748b" stroke-width="1.5"/>
<line x1="80" y1="55" x2="300" y2="62" stroke="#0ea5e9" stroke-width="2"/><line x1="80" y1="55" x2="540" y2="70" stroke="#0ea5e9" stroke-width="2"/>
<text x="190" y="48" text-anchor="middle" class="svg-accent" font-size="11">General query 224.0.0.1 par</text>
<line x1="300" y1="110" x2="80" y2="118" stroke="#22c55e" stroke-width="2"/><text x="190" y="104" text-anchor="middle" class="svg-accent" font-size="11">G ka report (A pehle jawab deta)</text>
<text x="540" y="104" text-anchor="middle" class="svg-muted" font-size="11">B, A ko sunta hai, chup rehta</text>
<text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="11">(report suppression)</text>
<line x1="300" y1="170" x2="80" y2="178" stroke="#f97316" stroke-width="2"/><text x="190" y="164" text-anchor="middle" class="svg-accent" font-size="11">Leave G, 224.0.0.2 par</text>
<line x1="80" y1="195" x2="540" y2="205" stroke="#0ea5e9" stroke-width="2"/><text x="360" y="190" text-anchor="middle" class="svg-accent" font-size="11">G ki group-specific query</text>
<line x1="540" y1="225" x2="80" y2="232" stroke="#22c55e" stroke-width="2"/><text x="360" y="244" text-anchor="middle" class="svg-accent" font-size="11">B report karta hai: G rahega</text>
</svg><p class="cap">Time neeche ki taraf behta hai. Router ke liye har group ka ek report per interval kaafi hai, isliye doosra host chup rehta hai.</p></div>

<h3>Join karte waqt: kya hosts query ka wait karte hain?</h3>
<p>Nahi. Jab application sunna shuru karti hai, host turant ek <b>unsolicited report</b> bhejta hai, taaki stream ek-do second mein shuru ho sake. Periodic query sirf refresh hai: woh confirm karti hai ki member abhi bhi hai.</p>

<h3>Report suppression</h3>
<p>Query aane par har host 0 se <b>maximum response time</b> (default 10 second) ke beech ek random timer shuru karta hai. Jo host pehle jawab deta hai woh report group address par bhejta hai. Us group ke baaki members use sunte hain, apne timers cancel kar dete hain aur chup rehte hain. Router ko bas yeh jaanna hai ki kam se kam ek member hai, kitne hain yeh nahi. Isse woh cheez samajh aati hai jo aap lab output mein dekhoge: ek hi group par do students joined hone par bhi <code>show ip igmp groups</code> Last Reporter column mein sirf <b>ek</b> dikhata hai. Yeh normal hai.</p>

<h3>Leave karna: v1 vs v2</h3>
<ul>
<li><b>IGMPv1</b> mein leave message nahi hota. Jab aakhri member bas rukta hai, router tab jaanta hai jab membership timer expire ho, jismein minutes lagte hain. Utni der stream khali LAN par bahti rehti hai. v1 mein querier PIM designated router hota hai.</li>
<li><b>IGMPv2</b> leave message aur group-specific query add karta hai. Host jab leave karta hai, router group-specific queries bhejta hai (last member query count 2, default mein ek second ke gap par). Koi jawab na de to group lagbhag 2 se 3 second mein hat jaata hai. v2 querier election ko <b>lowest IP address</b> par bhi badal deta hai.</li>
</ul>
<p>IOS XE interfaces par default version 2 hai. Zyadatar operating systems ab v3 bhi bolte hain, aur jab router sirf v2 bolta hai to host v2 reports par fall back karta hai. Details chapter 4 mein hain.</p>

<h3>Membership timers</h3>
<table class="cmp"><tr><th>Timer</th><th>Default (IOS XE)</th><th>Kya control karta hai</th></tr>
<tr><td>Query interval</td><td>60 s</td><td>Querier kitni baar general query bhejta hai</td></tr>
<tr><td>Max response time</td><td>10 s</td><td>Woh window jismein hosts jawab dete hain</td></tr>
<tr><td>Robustness</td><td>2</td><td>Protocol kitne losses tolerate karta hai</td></tr>
<tr><td>Group membership interval</td><td>robustness x interval + max response</td><td>Chup group kab hataya jaata hai</td></tr>
<tr><td>Querier timeout</td><td>2 x query interval (120 s)</td><td>Mare hue querier ko doosra router kab sambhalta hai</td></tr>
<tr><td>Last member query</td><td>count 2, interval 1 s</td><td>Leave processing ki speed</td></tr>
</table>
<p>Interval ke commands maujood hain (<code>ip igmp query-interval</code>, <code>ip igmp query-max-response-time</code>, <code>ip igmp last-member-query-count</code>), par defaults lagbhag har network ke liye sahi hain. Query interval kam karne se membership refresh tez hota hai, kimat hai zyada control traffic.</p>

<h3>Querier election</h3>
<p>Ek LAN par kai routers ho sakte hain. Agar sab queries bhejte, to hosts bekaar mein kai baar jawab dete. Isliye routers <b>har LAN par ek querier</b> chunte hain: jab router interface par IGMP shuru karta hai to maan leta hai ki woh querier hai aur query bhejta hai. Agar use <b>chhote</b> source IP wale router ki query sunai de, to woh querying band kar deta hai. Sabse chhote address wala router jeetta hai. Baaki ek timer (querier timeout) rakhte hain; agar itni der tak queries na sunein, to bache hue routers mein sabse chhota address take over kar leta hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek hi LAN par R1 ka 10.30.1.3 aur R2 ka 10.30.1.2 hai. Dono queries bhejna shuru karte hain. R1 ko R2 ki query 10.30.1.2 se sunai deti hai jo chhota hai, isliye R1 non-querier ban jaata hai. R2 querier hai. Agar R2 shut ho jaaye, to R1 120 second wait karta hai, kuch nahi sunta aur querier ban jaata hai.</p></div>

<h3>Querier aur PIM DR alag kaam hain</h3>
<p>IGMP querier (lowest IP) <b>sawaal poochta hai</b>. PIM designated router (highest priority, phir highest IP) <b>stream ko LAN par forward karta hai</b> aur upstream PIM joins bhejta hai. Yeh do alag routers ho sakte hain, aur yeh theek hai: dono hosts ke reports sunte hain kyunki reports group address par jaate hain. Querier lab mein aap yeh khud prove karoge.</p>

<h3>IOS XE par verification</h3>
<pre class="out">R2#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.30.1.2/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 2</span>
  Current IGMP router version is 2
  IGMP query interval is 60 seconds
  IGMP querier timeout is 120 seconds
  IGMP max query response time is 10 seconds
  Last member query count is 2
  Multicast designated router (DR) is 10.30.1.3
  <span class="hl">IGMP querying router is 10.30.1.2 (this system)</span>

R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.30.1.1       GigabitEthernet0/0       00:00:12  00:02:48  10.30.1.50</pre>
<p>Order mein padho: version, querying router (kya woh wahi hai jo aapne socha tha?), DR (alag router hona normal hai), phir group table jismein <b>Last Reporter</b> aur <b>Expires</b> counter hota hai jo har report par reset hota hai.</p>

<div class="warn"><p><b>Common mistakes.</b> DR se querier hone ki ummeed rakhna. Last Reporter column mein har host ki ummeed rakhna. Router ko renumber karke bhool jaana ki isse querier badal sakta hai. IGMPv1 hosts ko v2 interface par mix karna: router us group ke liye behaviour downgrade karta hai, aur leave slow ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGMP querier = lowest IP. PIM DR = highest priority phir highest IP. v2 mein reports group address par jaate hain, leaves 224.0.0.2 par, queries 224.0.0.1 par. IGMP mein authentication nahi hota aur yeh sirf local link par chalta hai (TTL 1).</p></div>

<div class="scn"><h4>Kamra khali hone ke baad bhi chalti rahi stream</h4><p>Ek training room mein IGMPv1 stack wale purane thin clients the. Class ke baad video teen minute tak room ke VLAN mein behti rahi. Team ne pehle source par shak kiya. Interface dekha to v1 hosts mile, isliye leave messages kabhi bheje hi nahi gaye aur router membership timer ka wait karta raha. Unhone client software v2 par upgrade kiya aur ab stream kuch seconds mein ruk jaati hai.</p><p><b>Lesson:</b> slow leave purane IGMP versions ya aise snooping switch ki taraf ishara karta hai jo ports ko zyada der pakadta hai.</p></div>

<div class="iv"><p class="q">"Ek LAN par do routers hain. IGMP querier kaun hoga, aur fail hone par kya hoga?"</p><p>Strong answer: us subnet par sabse chhote IP address wala router. Baaki chup rehte hain par querier-timeout timer chalate hain, default mein 2 x query interval. Itni der tak query na sunai de to bache hue routers mein sabse chhota address querier ban jaata hai. Yeh bhi jodo ki yeh PIM DR se alag hai, jo priority phir highest address se chuna jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>General queries 224.0.0.1 par jaati hain; v2 reports group par; v2 leaves 224.0.0.2 par.</li>
<li>Hosts turant unsolicited report bhejte hain, isliye join fast hai; queries sirf refresh hain.</li>
<li>Report suppression se router ko har group ka ek reporter dikhta hai.</li>
<li>v1 mein leave nahi (slow); v2 leave aur group-specific query add karta hai.</li>
<li>Querier = lowest IP; DR = highest priority phir highest IP; dono alag ho sakte hain.</li>
</ul></div>
`}};export{e as default};