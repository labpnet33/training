var e={id:`sia`,h:{en:`Queries and stuck-in-active: finding the router that never answers`,hi:`Queries aur stuck-in-active: woh router dhoondhna jo kabhi jawab nahi deta`},body:{en:`
<p>A manager loses a file and emails the whole team: "Does anyone have a copy?" Each team member either answers at once ("yes, here it is" or "no, sorry"), or forwards the question to their own team first. The manager cannot close the case until <b>every</b> person replies. If one person is on leave and never answers, the manager waits, sends a reminder, waits again, and finally removes that person from the mailing list. EIGRP does exactly this when a route goes <b>active</b>. The router that complains (logs SIA) is usually the manager, not the person on leave. Your job is to follow the chain of forwarded emails to the silent person.</p>

<h3>Going active, step by step</h3>
<ol>
<li>A route loses its successor and there is <b>no feasible successor</b>. The route becomes <b>Active</b> (A in the topology table).</li>
<li>The router sends a <b>Query</b> to its neighbours and starts the <b>active timer</b> (3 minutes by default).</li>
<li>Each neighbour answers with a <b>Reply</b>: its own metric if it has another path, or infinity if not. A neighbour whose successor was the querying router may itself go active and query its own neighbours before replying.</li>
<li>When all Replies are in, the router picks the best path and the route returns to <b>Passive</b>.</li>
</ol>

<h3>The SIA mechanism</h3>
<p>Modern IOS does not simply wait three minutes. At <b>half the active timer</b> (90 seconds) the router sends an <b>SIA-Query</b> to each neighbour that has not replied. A neighbour that is still working on the answer (because it is waiting for its own neighbours) sends back an <b>SIA-Reply</b>: "I am alive, still computing." That keeps the adjacency up. The router can send up to three SIA-Queries. Only a neighbour that answers neither the Query nor the SIA-Query is reset, and the route is declared stuck in active.</p>
<pre class="out">%DUAL-3-SIA: Route 192.168.9.0/24 stuck-in-active state in IP-EIGRP(0) 10.  Cleaning up
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 10: Neighbor 10.20.2.2 (GigabitEthernet0/1) is down: stuck in active</span></pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Query chain">
<rect x="20" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">route Active</text>
<rect x="260" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="13">SP1 replied</text>
<rect x="260" y="88" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="115" text-anchor="middle" class="svg-ink" font-size="13">SP2 silent</text>
<rect x="260" y="156" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="315" y="183" text-anchor="middle" class="svg-ink" font-size="13">SP3 replied</text>
<line x1="130" y1="95" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="130" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="130" y1="115" x2="260" y2="178" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" class="svg-accent" font-size="12">Query</text>
<rect x="430" y="88" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="525" y="108" text-anchor="middle" class="svg-ink" font-size="12">lossy uplink, 30% drops</text><text x="525" y="124" text-anchor="middle" class="svg-muted" font-size="12">no Reply, no SIA-Reply</text>
<line x1="370" y1="110" x2="430" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">HUB logs the SIA; SP2's path is where the real problem lives.</p></div>

<h3>Finding the silent router</h3>
<p>While the route is still active, <code>show ip eigrp topology active</code> tells you who has not replied. A lower-case <b>r</b> means "reply outstanding"; <b>s</b> means an SIA-Query has been sent.</p>
<pre class="out">HUB#show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(10)/ID(1.1.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

A 192.168.9.0/24, 1 successors, FD is Inaccessible
    1 replies, <span class="hl">active 00:01:42</span>, query-origin: Local origin
         via 10.20.3.2 (Infinity/Infinity), Gi0/2, serno 88
    Remaining replies:
<span class="hl">         via 10.20.2.2, r, s, Gi0/1</span></pre>
<p>Now go to 10.20.2.2 (SP2) and run the same command. If SP2 shows the route active and waiting for one of <i>its</i> neighbours, keep following the chain. If SP2 is not active at all, the Query or Reply is being lost on the link: check interface errors, drops, CPU, and <code>show ip eigrp neighbors</code> for a growing Q Cnt.</p>

<div class="eg"><p><b>Worked example: timeline.</b> 10:00:00 HUB loses 192.168.9.0/24 and queries SP1, SP2 and SP3. 10:00:01 SP1 and SP3 reply (they have no other path; they reply infinity). SP2's uplink is dropping 30% of packets and its CPU is pegged by a broadcast storm on its LAN, so it never processes the Query. 10:01:30 HUB sends SIA-Query #1 to SP2; no SIA-Reply. HUB keeps trying. 10:03:00 the active timer expires without any SIA-Reply: HUB resets SP2, logs SIA and <code>stuck in active</code>, and every route learned from SP2 is withdrawn too, so SP2's own users lose the data centre although their problem was only local.</p></div>

<h3>Real fixes, in order of preference</h3>
<ol>
<li><b>Fix the cause</b>: the lossy circuit, the overloaded CPU, the unidirectional link, the congested WAN (check <code>bandwidth</code> and <code>bandwidth-percent</code> on slow links, since EIGRP paces itself to a share of the configured bandwidth).</li>
<li><b>Shrink the query domain</b>: make branches <b>stubs</b> (the hub never queries them) and <b>summarise</b> towards the core (a router that knows only the summary replies "infinity" immediately instead of propagating the Query). Chapters 8 and 9 cover both.</li>
<li><b>Tune the active timer</b> only as a last resort: <code>timers active-time 5</code> under <code>topology base</code> in named mode (or under <code>router eigrp</code> in classic). <code>timers active-time disabled</code> means never give up, which hides problems.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Troubleshooting the router that logged the SIA instead of following the chain; increasing the active timer and calling it fixed; forgetting that one SIA reset withdraws <b>all</b> routes from that neighbour, not just the active one.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default active timer is <b>3 minutes</b>; the SIA-Query is sent at half of it. A neighbour that sends an SIA-Reply is <b>not</b> reset, even if it has not yet sent the real Reply. Stub routers are never queried; summarisation stops a Query at the first router that has only the summary.</p></div>

<div class="scn"><h4>Every Monday at 09:05</h4><p>A logistics company saw hub-to-branch EIGRP resets every Monday morning. The hub's log showed SIA for different branch prefixes each week. <code>show ip eigrp topology active</code>, captured by an EEM script while it happened, pointed to one regional router that was waiting for Replies from 60 branches over 2 Mbps links saturated by Monday backups. The regional router kept sending SIA-Replies, but one branch behind it never answered. The fix: all 60 branches became <code>eigrp stub connected summary</code>, and the regional router summarised its branches to the core. The query domain shrank from 400 routers to 12, and the Monday resets stopped.</p><p><b>Lesson:</b> SIA is a symptom of a query domain that is too large or a path that is too weak; fix the design, not the timer.</p></div>

<div class="iv"><p class="q">"What is stuck-in-active and how do you troubleshoot it?"</p><p>Explain that a route with no feasible successor goes active and Queries every neighbour; if a neighbour neither replies nor answers the SIA-Query sent at half the 3-minute active timer, it is reset and the route is SIA. Say you use <code>show ip eigrp topology active</code> to find the neighbour with the <b>r</b> flag, then repeat hop by hop to the router that is actually stuck, and check links, CPU and Q Cnt there. Finish with prevention: stubs and summarisation to bound queries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>No feasible successor means Active: Queries go out and every neighbour must Reply.</li>
<li>Active timer 3 minutes; SIA-Query at 90 seconds; SIA-Reply keeps the neighbour alive.</li>
<li>The router that logs SIA is rarely the broken one; follow the <b>r</b> flags with <code>show ip eigrp topology active</code>.</li>
<li>An SIA reset drops the neighbour and every route learned from it.</li>
<li>Prevent SIA with stubs and summaries; change the active timer only as a last resort.</li>
</ul></div>
`,hi:`
<p>Ek manager ki file kho jaati hai aur woh poori team ko email karta hai: "Kisi ke paas copy hai?" Har team member ya to turant jawab deta hai ("haan, yeh rahi" ya "nahi, sorry"), ya pehle sawaal apni team ko forward karta hai. Manager case tab tak band nahi kar sakta jab tak <b>har</b> insaan reply na kare. Agar ek insaan chutti par hai aur kabhi jawab nahi deta, to manager wait karta hai, reminder bhejta hai, phir wait karta hai, aur aakhir mein us insaan ko mailing list se hata deta hai. Jab route <b>active</b> hota hai to EIGRP bilkul yahi karta hai. Jo router complain karta hai (SIA log karta hai) woh aam taur par manager hai, chutti wala insaan nahi. Aapka kaam hai forwarded emails ki chain follow karke khamosh insaan tak pahunchna.</p>

<h3>Active hona, step by step</h3>
<ol>
<li>Route apna successor kho deta hai aur <b>koi feasible successor nahi</b> hai. Route <b>Active</b> ho jaata hai (topology table mein A).</li>
<li>Router apne neighbours ko <b>Query</b> bhejta hai aur <b>active timer</b> (default 3 minute) shuru karta hai.</li>
<li>Har neighbour <b>Reply</b> deta hai: agar uske paas doosra path hai to apna metric, warna infinity. Jis neighbour ka successor query karne wala router tha, woh reply karne se pehle khud active hokar apne neighbours ko query kar sakta hai.</li>
<li>Jab saare Replies aa jaate hain, router best path chunta hai aur route wapas <b>Passive</b> ho jaata hai.</li>
</ol>

<h3>SIA mechanism</h3>
<p>Modern IOS bas teen minute wait nahi karta. <b>Active timer ke aadhe</b> (90 second) par router har us neighbour ko <b>SIA-Query</b> bhejta hai jisne reply nahi kiya. Jo neighbour ab bhi jawab par kaam kar raha hai (kyunki woh apne neighbours ka wait kar raha hai) woh <b>SIA-Reply</b> wapas bhejta hai: "Main zinda hoon, abhi compute kar raha hoon." Isse adjacency up rehti hai. Router teen SIA-Queries tak bhej sakta hai. Sirf woh neighbour reset hota hai jo na Query ka jawab de na SIA-Query ka, aur route stuck in active declare hota hai.</p>
<pre class="out">%DUAL-3-SIA: Route 192.168.9.0/24 stuck-in-active state in IP-EIGRP(0) 10.  Cleaning up
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 10: Neighbor 10.20.2.2 (GigabitEthernet0/1) is down: stuck in active</span></pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Query chain">
<rect x="20" y="80" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">route Active</text>
<rect x="260" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="13">SP1: reply aaya</text>
<rect x="260" y="88" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="115" text-anchor="middle" class="svg-ink" font-size="13">SP2 khamosh</text>
<rect x="260" y="156" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="315" y="183" text-anchor="middle" class="svg-ink" font-size="13">SP3: reply aaya</text>
<line x1="130" y1="95" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="130" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="130" y1="115" x2="260" y2="178" stroke="#64748b" stroke-width="2"/>
<text x="190" y="100" class="svg-accent" font-size="12">Query</text>
<rect x="430" y="88" width="190" height="44" rx="8" fill="#e2e8f0"/><text x="525" y="108" text-anchor="middle" class="svg-ink" font-size="12">lossy uplink, 30% drops</text><text x="525" y="124" text-anchor="middle" class="svg-muted" font-size="12">na Reply, na SIA-Reply</text>
<line x1="370" y1="110" x2="430" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">HUB SIA log karta hai; asli problem SP2 ke path par hai.</p></div>

<h3>Khamosh router dhoondhna</h3>
<p>Jab tak route active hai, <code>show ip eigrp topology active</code> batata hai kisne reply nahi kiya. Chhota <b>r</b> matlab "reply outstanding"; <b>s</b> matlab SIA-Query bheji ja chuki hai.</p>
<pre class="out">HUB#show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(10)/ID(1.1.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
       r - reply Status, s - sia Status

A 192.168.9.0/24, 1 successors, FD is Inaccessible
    1 replies, <span class="hl">active 00:01:42</span>, query-origin: Local origin
         via 10.20.3.2 (Infinity/Infinity), Gi0/2, serno 88
    Remaining replies:
<span class="hl">         via 10.20.2.2, r, s, Gi0/1</span></pre>
<p>Ab 10.20.2.2 (SP2) par jaao aur wahi command chalao. Agar SP2 par route active hai aur woh <i>apne</i> kisi neighbour ka wait kar raha hai, to chain follow karte raho. Agar SP2 active hi nahi hai, to Query ya Reply link par kho raha hai: interface errors, drops, CPU, aur <code>show ip eigrp neighbors</code> mein badhta Q Cnt check karo.</p>

<div class="eg"><p><b>Worked example: timeline.</b> 10:00:00 HUB 192.168.9.0/24 kho deta hai aur SP1, SP2 aur SP3 ko query karta hai. 10:00:01 SP1 aur SP3 reply karte hain (unke paas koi aur path nahi; woh infinity reply karte hain). SP2 ka uplink 30% packets drop kar raha hai aur uske LAN par broadcast storm se uska CPU full hai, isliye woh Query kabhi process nahi karta. 10:01:30 HUB SP2 ko SIA-Query #1 bhejta hai; koi SIA-Reply nahi. HUB koshish karta rehta hai. 10:03:00 bina kisi SIA-Reply ke active timer expire hota hai: HUB SP2 ko reset karta hai, SIA aur <code>stuck in active</code> log karta hai, aur SP2 se seekhe saare routes bhi withdraw ho jaate hain, isliye SP2 ke apne users data centre kho dete hain jabki unki problem sirf local thi.</p></div>

<h3>Asli fixes, preference ke order mein</h3>
<ol>
<li><b>Wajah theek karo</b>: lossy circuit, overloaded CPU, unidirectional link, congested WAN (slow links par <code>bandwidth</code> aur <code>bandwidth-percent</code> check karo, kyunki EIGRP configured bandwidth ke ek hisse tak khud ko pace karta hai).</li>
<li><b>Query domain chhota karo</b>: branches ko <b>stubs</b> banao (hub unhe kabhi query nahi karta) aur core ki taraf <b>summarise</b> karo (jis router ko sirf summary pata hai woh Query aage bhejne ki jagah turant "infinity" reply karta hai). Chapters 8 aur 9 dono cover karte hain.</li>
<li><b>Active timer tune karo</b> sirf aakhri upaay ke roop mein: named mode mein <code>topology base</code> ke neeche <code>timers active-time 5</code> (ya classic mein <code>router eigrp</code> ke neeche). <code>timers active-time disabled</code> ka matlab hai kabhi haar mat maano, jo problems chhupa deta hai.</li>
</ol>

<div class="warn"><p><b>Common galtiyan.</b> Chain follow karne ki jagah us router ko troubleshoot karna jisne SIA log kiya; active timer badha kar ise fixed bolna; bhool jaana ki ek SIA reset us neighbour ke <b>saare</b> routes withdraw karta hai, sirf active wala nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default active timer <b>3 minute</b> hai; SIA-Query uske aadhe par jaati hai. Jo neighbour SIA-Reply bhejta hai woh reset <b>nahi</b> hota, chahe usne asli Reply abhi tak na bheja ho. Stub routers kabhi query nahi hote; summarisation Query ko pehle us router par rok deta hai jiske paas sirf summary hai.</p></div>

<div class="scn"><h4>Har Monday 09:05 par</h4><p>Ek logistics company ko har Monday subah hub-to-branch EIGRP resets dikhte the. Hub ke log mein har hafte alag branch prefixes ke liye SIA hota tha. Problem ke waqt EEM script se capture kiye gaye <code>show ip eigrp topology active</code> ne ek regional router ki taraf ishara kiya jo Monday backups se saturated 2 Mbps links par 60 branches ke Replies ka wait kar raha tha. Regional router SIA-Replies bhejta raha, lekin uske peeche ki ek branch ne kabhi jawab nahi diya. Fix: saari 60 branches <code>eigrp stub connected summary</code> bani, aur regional router ne apni branches ko core ki taraf summarise kiya. Query domain 400 routers se 12 par aa gaya, aur Monday resets band ho gaye.</p><p><b>Seekh:</b> SIA bahut bade query domain ya bahut kamzor path ka symptom hai; design theek karo, timer nahi.</p></div>

<div class="iv"><p class="q">"Stuck-in-active kya hai aur aap ise kaise troubleshoot karte ho?"</p><p>Samjhao ki bina feasible successor wala route active hota hai aur har neighbour ko Query karta hai; agar koi neighbour na reply kare na 3-minute active timer ke aadhe par bheji gayi SIA-Query ka jawab de, to woh reset hota hai aur route SIA hota hai. Batao ki aap <code>show ip eigrp topology active</code> se <b>r</b> flag wala neighbour dhoondhte ho, phir hop by hop repeat karke us router tak jaate ho jo sach mein atka hai, aur wahan links, CPU aur Q Cnt check karte ho. Prevention ke saath khatam karo: queries ko bound karne ke liye stubs aur summarisation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feasible successor nahi matlab Active: Queries jaati hain aur har neighbour ko Reply karna padta hai.</li>
<li>Active timer 3 minute; SIA-Query 90 second par; SIA-Reply neighbour ko zinda rakhta hai.</li>
<li>Jo router SIA log karta hai woh shayad hi toota hua ho; <code>show ip eigrp topology active</code> se <b>r</b> flags follow karo.</li>
<li>SIA reset neighbour aur usse seekhe har route ko gira deta hai.</li>
<li>Stubs aur summaries se SIA roko; active timer sirf aakhri upaay ke roop mein badlo.</li>
</ul></div>
`}};export{e as default};