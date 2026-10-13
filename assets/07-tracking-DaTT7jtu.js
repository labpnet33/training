var e={id:`tracking`,h:{en:`Interface and object tracking with decrement`,hi:`Decrement ke saath interface aur object tracking`},body:{en:`
<p>A taxi dispatcher sends every booking to the driver on duty. One evening that driver's car has a flat tyre. He is still sitting at the stand, phone switched on, happily accepting bookings he cannot drive to. A good dispatcher asks not only "is the driver answering?" but also "can he actually go anywhere?" Tracking is how an FHRP router asks itself that second question.</p>

<h3>The gap HSRP leaves on its own</h3>
<p>HSRP hellos travel only on the LAN. If R1's uplink <b>Gi0/1</b> to CORE fails, R1 is still alive on Gi0/0, still sends hellos, and stays <b>Active</b>. Hosts keep sending traffic to the virtual MAC on R1. What happens next depends on the routing:</p>
<ul>
<li>With no other route, R1 drops the traffic: a <b>black hole</b> even though R2 has a perfect uplink.</li>
<li>In the module's lab, OSPF also runs on the LAN, so R1 learns the way via R2 and sends every packet back across the LAN to R2. It works, but each packet crosses the LAN twice (a <b>hairpin</b>) and R1 becomes a pointless extra hop.</li>
</ul>
<p>Either way, R2 should be the gateway while R1's uplink is down. <b>Tracking</b> lets R1 lower its own HSRP priority when something it depends on fails, so that R2 (with preempt) takes over.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tracking lowers R1 priority when its uplink fails">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="60" y="110" width="200" height="60" rx="8" fill="#fed7aa"/><text x="160" y="132" text-anchor="middle" class="svg-ink" font-size="14">R1 priority 110 - 20</text><text x="160" y="152" text-anchor="middle" class="svg-muted" font-size="12">now 90: Standby</text>
<rect x="380" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="480" y="132" text-anchor="middle" class="svg-ink" font-size="14">R2 priority 100</text><text x="480" y="152" text-anchor="middle" class="svg-muted" font-size="12">preempt: Active</text>
<line x1="200" y1="110" x2="280" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="200" y="80" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 down</text>
<line x1="440" y1="110" x2="360" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="200" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="13">SW1 / users</text>
<line x1="160" y1="170" x2="280" y2="200" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="360" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">R1's uplink fails, tracking subtracts 20, R1 drops below R2, and R2 preempts.</p></div>

<h3>Step 1: a track object</h3>
<p>Modern IOS separates <b>what to watch</b> (a track object) from <b>what to do</b> (the HSRP decrement). A track object has a number and is either Up or Down.</p>
<pre class="code"><span class="c">! watch the uplink's line protocol</span>
R1(config)# track 1 interface GigabitEthernet0/1 line-protocol
<span class="c">! other examples: routing state of the interface, or a route in the table</span>
R1(config)# track 2 interface GigabitEthernet0/1 ip routing
R1(config)# track 3 ip route 203.0.113.0 255.255.255.0 reachability</pre>
<p>Object 3 is the most honest check: it goes Down when the route to the server farm disappears, whatever the reason. At CCNP level you can also track an <b>IP SLA</b> probe that pings a far-away address.</p>

<h3>Step 2: tie it to HSRP with a decrement</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 track 1 decrement 20
<span class="c">! R2 must be able to take over: preempt on R2</span>
R2(config-if)# standby 10 preempt</pre>
<p>The older syntax <code>standby 10 track GigabitEthernet0/1 20</code> tracks an interface directly; if you leave out the number, the default decrement is <b>10</b>.</p>

<h3>The arithmetic that must work</h3>
<div class="eg"><p><b>Worked example.</b> R1 configured 110, R2 100.</p>
<ul>
<li>Decrement 20: uplink down, R1 = 110 - 20 = <b>90</b>. R2 (100) is now higher and, with preempt, sends a Coup. R2 Active. Uplink back: R1 returns to 110, and with <b>its</b> preempt takes the role back.</li>
<li>Decrement 10 (the default): R1 = 100, equal to R2. You are now relying on the tie-breaker and preempt behaviour instead of a clear decision. Avoid landing on a tie.</li>
<li>Decrement 5: R1 = 105, still higher than R2. <b>Nothing happens</b>; the traffic keeps going to R1.</li>
<li>Two tracked uplinks at 20 each on R1: one failure gives 90 (R2 wins), both give 70.</li>
</ul>
<p>Rule: <b>configured priority - decrement must be lower than the peer's priority</b>.</p></div>

<h3>Verification</h3>
<pre class="out">%TRACK-6-STATE: 1 interface Gi0/1 line-protocol Up -&gt; Down

R1# show track 1
Track 1
  Interface GigabitEthernet0/1 line-protocol
<span class="hl">  Line protocol is Down</span>
    1 change, last change 00:00:14
  Tracked by:
    HSRP GigabitEthernet0/0 10

R1# show standby GigabitEthernet0/0
GigabitEthernet0/0 - Group 10
<span class="hl">  State is Standby</span>
  Virtual IP address is 192.168.10.1
  Preemption enabled
  Active router is 192.168.10.3, priority 100 (expires in 8.992 sec)
  Standby router is local
<span class="hl">  Priority 90 (configured 110)</span>
<span class="hl">    Track object 1 state Down decrement 20</span></pre>
<p><b>Priority 90 (configured 110)</b> is the line that proves tracking is working: the current value differs from the configured one by exactly the decrement.</p>

<div class="warn"><p><b>Common mistake.</b> Configuring tracking on R1 but forgetting <b>preempt on R2</b>. R1's priority drops to 90, <code>show standby</code> shows it, and yet R1 remains Active because R2 is not allowed to take over. Tracking without preempt on the peer does nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tracking <b>does not</b> make the Active router resign by itself; it only lowers its priority. The Standby needs preempt to act on it. The default decrement is 10. And an FHRP with no tracking has no idea about uplinks at all.</p></div>

<div class="scn"><h4>The gateway that pointed at a dead ISP</h4><p>A media company in Mumbai had two edge routers, each with its own ISP, sharing VIP 198.51.100.1 via HSRP. When ISP-A had an outage, users on R1 (Active) lost internet completely, while R2's ISP-B was fine. R1 had only a static default route to ISP-A and no route via R2. The engineer added <code>track 1 ip route 0.0.0.0 0.0.0.0 reachability</code> tied to the default route learned from ISP-A, a decrement of 30, and preempt on R2. The next ISP-A outage moved the gateway in a few seconds.</p><p><b>Lesson:</b> track the thing users actually need, not just "is my interface up".</p></div>

<div class="iv"><p class="q">"How do you make HSRP fail over when the Active router loses its WAN link, not its LAN link?"</p><p>Strong answer: create a track object on the uplink (line protocol, or better, the reachability of an important route or an IP SLA probe), then <code>standby N track X decrement D</code> on the Active router, choosing D so that configured priority minus D falls below the Standby's priority. Enable preempt on the Standby so it takes over, and on the original Active so it takes the role back after recovery. Verify with <code>show track</code> and the "Priority 90 (configured 110)" line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP hellos only see the LAN; an Active router with a dead uplink stays Active.</li>
<li>A track object watches an interface, a route or an IP SLA; HSRP subtracts a decrement when it goes Down.</li>
<li>Configured priority minus decrement must fall below the peer's priority.</li>
<li>The peer needs preempt to take over; the original router needs preempt to take it back.</li>
<li>Verify with <code>show track</code> and "Priority X (configured Y)" in <code>show standby</code>.</li>
</ul></div>
`,hi:`
<p>Ek taxi dispatcher har booking duty wale driver ko bhejta hai. Ek shaam us driver ki gaadi ka tyre flat ho jaata hai. Woh abhi bhi stand par baitha hai, phone on hai, khushi khushi bookings accept kar raha hai jahan woh jaa hi nahi sakta. Accha dispatcher sirf "kya driver jawab de raha hai?" nahi poochta, balki "kya woh sach mein kahin jaa sakta hai?" bhi poochta hai. Tracking woh tarika hai jisse FHRP router khud se yeh doosra sawaal poochta hai.</p>

<h3>Woh gap jo HSRP akele chhod deta hai</h3>
<p>HSRP hellos sirf LAN par chalte hain. Agar R1 ka CORE ki taraf uplink <b>Gi0/1</b> fail ho jaaye, to R1 Gi0/0 par ab bhi zinda hai, ab bhi hellos bhejta hai, aur <b>Active</b> rehta hai. Hosts R1 par virtual MAC ko traffic bhejte rehte hain. Aage kya hota hai yeh routing par depend karta hai:</p>
<ul>
<li>Koi doosra route na ho to R1 traffic drop karta hai: ek <b>black hole</b>, chahe R2 ka uplink bilkul theek ho.</li>
<li>Module ke lab mein OSPF LAN par bhi chalta hai, isliye R1 R2 ke through raasta seekh leta hai aur har packet ko LAN par wapas R2 ko bhejta hai. Kaam chalta hai, lekin har packet LAN do baar cross karta hai (<b>hairpin</b>) aur R1 ek bekaar extra hop ban jaata hai.</li>
</ul>
<p>Dono haalat mein, jab tak R1 ka uplink down hai, R2 ko gateway hona chahiye. <b>Tracking</b> R1 ko apni HSRP priority kam karne deta hai jab koi cheez jis par woh depend karta hai fail ho, taaki R2 (preempt ke saath) kaam sambhal le.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Uplink fail hone par tracking R1 ki priority kam karta hai">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">CORE</text>
<rect x="60" y="110" width="200" height="60" rx="8" fill="#fed7aa"/><text x="160" y="132" text-anchor="middle" class="svg-ink" font-size="14">R1 priority 110 - 20</text><text x="160" y="152" text-anchor="middle" class="svg-muted" font-size="12">ab 90: Standby</text>
<rect x="380" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="480" y="132" text-anchor="middle" class="svg-ink" font-size="14">R2 priority 100</text><text x="480" y="152" text-anchor="middle" class="svg-muted" font-size="12">preempt: Active</text>
<line x1="200" y1="110" x2="280" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="200" y="80" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 down</text>
<line x1="440" y1="110" x2="360" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="200" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="13">SW1 / users</text>
<line x1="160" y1="170" x2="280" y2="200" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="360" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">R1 ka uplink fail hota hai, tracking 20 ghataata hai, R1 R2 se neeche jaata hai, aur R2 preempt karta hai.</p></div>

<h3>Step 1: track object</h3>
<p>Modern IOS <b>kya dekhna hai</b> (track object) ko <b>kya karna hai</b> (HSRP decrement) se alag rakhta hai. Track object ka ek number hota hai aur woh ya Up hota hai ya Down.</p>
<pre class="code"><span class="c">! uplink ka line protocol dekho</span>
R1(config)# track 1 interface GigabitEthernet0/1 line-protocol
<span class="c">! aur examples: interface ki routing state, ya table mein ek route</span>
R1(config)# track 2 interface GigabitEthernet0/1 ip routing
R1(config)# track 3 ip route 203.0.113.0 255.255.255.0 reachability</pre>
<p>Object 3 sabse imaandaar check hai: server farm ka route gaayab hote hi yeh Down hota hai, wajah chahe kuch bhi ho. CCNP level par aap ek <b>IP SLA</b> probe bhi track kar sakte ho jo door ke address ko ping karta hai.</p>

<h3>Step 2: decrement ke saath HSRP se jodo</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 track 1 decrement 20
<span class="c">! R2 kaam sambhal sake: R2 par preempt</span>
R2(config-if)# standby 10 preempt</pre>
<p>Purana syntax <code>standby 10 track GigabitEthernet0/1 20</code> interface ko seedha track karta hai; agar aap number chhod do, default decrement <b>10</b> hai.</p>

<h3>Arithmetic jo kaam karna chahiye</h3>
<div class="eg"><p><b>Worked example.</b> R1 configured 110, R2 100.</p>
<ul>
<li>Decrement 20: uplink down, R1 = 110 - 20 = <b>90</b>. R2 (100) ab upar hai aur preempt ke saath Coup bhejta hai. R2 Active. Uplink wapas: R1 110 par lautta hai, aur <b>apne</b> preempt se role wapas le leta hai.</li>
<li>Decrement 10 (default): R1 = 100, R2 ke barabar. Ab aap saaf decision ki jagah tie-breaker aur preempt behaviour par bharosa kar rahe ho. Tie par utarne se bacho.</li>
<li>Decrement 5: R1 = 105, ab bhi R2 se upar. <b>Kuch nahi hota</b>; traffic R1 par hi jaata rehta hai.</li>
<li>R1 par do tracked uplinks, har ek 20: ek failure se 90 (R2 jeetta hai), dono se 70.</li>
</ul>
<p>Rule: <b>configured priority - decrement peer ki priority se kam hona chahiye</b>.</p></div>

<h3>Verification</h3>
<pre class="out">%TRACK-6-STATE: 1 interface Gi0/1 line-protocol Up -&gt; Down

R1# show track 1
Track 1
  Interface GigabitEthernet0/1 line-protocol
<span class="hl">  Line protocol is Down</span>
    1 change, last change 00:00:14
  Tracked by:
    HSRP GigabitEthernet0/0 10

R1# show standby GigabitEthernet0/0
GigabitEthernet0/0 - Group 10
<span class="hl">  State is Standby</span>
  Virtual IP address is 192.168.10.1
  Preemption enabled
  Active router is 192.168.10.3, priority 100 (expires in 8.992 sec)
  Standby router is local
<span class="hl">  Priority 90 (configured 110)</span>
<span class="hl">    Track object 1 state Down decrement 20</span></pre>
<p><b>Priority 90 (configured 110)</b> woh line hai jo sabit karti hai ki tracking kaam kar raha hai: current value configured se bilkul decrement jitni alag hai.</p>

<div class="warn"><p><b>Common galti.</b> R1 par tracking configure karna lekin <b>R2 par preempt</b> bhool jaana. R1 ki priority 90 ho jaati hai, <code>show standby</code> yeh dikhata hai, phir bhi R1 Active rehta hai kyunki R2 ko takeover ki ijaazat nahi hai. Peer par preempt ke bina tracking kuch nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tracking Active router ko khud resign <b>nahi</b> karwata; yeh sirf uski priority kam karta hai. Us par action lene ke liye Standby ko preempt chahiye. Default decrement 10 hai. Aur bina tracking ke FHRP ko uplinks ka koi idea hi nahi hota.</p></div>

<div class="scn"><h4>Gateway jo mare hue ISP ki taraf point kar raha tha</h4><p>Mumbai ki ek media company ke do edge routers the, har ek ka apna ISP, jo HSRP se VIP 198.51.100.1 share karte the. Jab ISP-A mein outage hua, R1 (Active) ke users ka internet poori tarah chala gaya, jabki R2 ka ISP-B theek tha. R1 ke paas sirf ISP-A ki taraf static default route tha aur R2 ke through koi route nahi. Engineer ne ISP-A se seekhe default route se juda <code>track 1 ip route 0.0.0.0 0.0.0.0 reachability</code>, 30 ka decrement, aur R2 par preempt joda. Agle ISP-A outage mein gateway kuch seconds mein shift ho gaya.</p><p><b>Seekh:</b> woh cheez track karo jo users ko asal mein chahiye, sirf "kya mera interface up hai" nahi.</p></div>

<div class="iv"><p class="q">"Jab Active router apna WAN link khoye, LAN link nahi, tab HSRP ko fail over kaise karwaoge?"</p><p>Strong answer: uplink par track object banao (line protocol, ya behtar, kisi zaroori route ki reachability ya IP SLA probe), phir Active router par <code>standby N track X decrement D</code>, D aisa chuno ki configured priority minus D Standby ki priority se neeche jaaye. Standby par preempt enable karo taaki woh kaam sambhale, aur original Active par bhi taaki recovery ke baad role wapas le. <code>show track</code> aur "Priority 90 (configured 110)" line se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP hellos sirf LAN dekhte hain; mare hue uplink wala Active router Active hi rehta hai.</li>
<li>Track object interface, route ya IP SLA dekhta hai; Down hone par HSRP decrement ghataata hai.</li>
<li>Configured priority minus decrement peer ki priority se neeche aana chahiye.</li>
<li>Takeover ke liye peer ko preempt chahiye; wapas lene ke liye original router ko preempt chahiye.</li>
<li><code>show track</code> aur <code>show standby</code> mein "Priority X (configured Y)" se verify karo.</li>
</ul></div>
`}};export{e as default};