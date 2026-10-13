var e={id:`phb`,h:{en:`Per-hop behaviours: Default, Class Selector, Assured Forwarding and Expedited Forwarding`,hi:`Per-hop behaviours: Default, Class Selector, Assured Forwarding aur Expedited Forwarding`},body:{en:`
<p>A marking is only a word on a label. It becomes a service when each router agrees what to do with that word. Think of a railway station: the ticket says "Rajdhani", "Express" or "Passenger", and the station master's rulebook says Rajdhani gets the clear track, Express gets the next slot and Passenger waits at the loop. The ticket does not move the train; the rulebook does. In DiffServ the rulebook is the <b>per-hop behavior (PHB)</b>: the externally visible forwarding treatment a router gives to packets carrying a given DSCP. The IETF standardised four PHB groups that you need for the CCNA.</p>

<h3>The four PHB groups</h3>
<dl class="terms">
<dt>Default PHB (DSCP 0)</dt><dd>Best effort. No promise of bandwidth, delay or loss. All unmarked traffic lands here, and in most MQC policies it is represented by <code>class-default</code>.</dd>
<dt>Class Selector (CS0 to CS7)</dt><dd>DSCP values <code>xxx000</code>: the last three bits are zero, so only the first three bits (the old IP Precedence) carry meaning. CS exists so DiffServ routers and older precedence-only routers can interoperate. CS1 = 8, CS2 = 16, CS3 = 24, CS4 = 32, CS5 = 40, CS6 = 48, CS7 = 56. A higher selector number is meant to receive a better or equal treatment than a lower one.</dd>
<dt>Assured Forwarding (AF)</dt><dd>Four classes with three <b>drop precedences</b> each. It promises that traffic within its contracted rate is forwarded with high probability, but it does not promise low delay. Written <b>AFxy</b>, where x is the class (1 to 4) and y the drop precedence (1 to 3).</dd>
<dt>Expedited Forwarding (EF, DSCP 46)</dt><dd>Low loss, low delay, low jitter, assured bandwidth. Implemented as a strict-priority queue whose rate is limited so it cannot starve other traffic. Used for voice bearer traffic.</dd>
</dl>

<h3>Assured Forwarding as a grid</h3>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="AF grid">
<g font-size="12">
<text x="120" y="28" text-anchor="middle" class="svg-ink">AF1 (class 1)</text><text x="260" y="28" text-anchor="middle" class="svg-ink">AF2 (class 2)</text><text x="400" y="28" text-anchor="middle" class="svg-ink">AF3 (class 3)</text><text x="540" y="28" text-anchor="middle" class="svg-ink">AF4 (class 4)</text>
<text x="20" y="68" class="svg-muted">Low drop</text><text x="20" y="118" class="svg-muted">Medium</text><text x="20" y="168" class="svg-muted">High drop</text>
</g>
<g font-size="13" text-anchor="middle">
<rect x="60" y="45" width="120" height="36" fill="#bbf7d0"/><text x="120" y="68" class="svg-ink">AF11 = 10</text>
<rect x="200" y="45" width="120" height="36" fill="#bbf7d0"/><text x="260" y="68" class="svg-ink">AF21 = 18</text>
<rect x="340" y="45" width="120" height="36" fill="#bbf7d0"/><text x="400" y="68" class="svg-ink">AF31 = 26</text>
<rect x="480" y="45" width="120" height="36" fill="#bbf7d0"/><text x="540" y="68" class="svg-ink">AF41 = 34</text>
<rect x="60" y="95" width="120" height="36" fill="#fde68a"/><text x="120" y="118" class="svg-ink">AF12 = 12</text>
<rect x="200" y="95" width="120" height="36" fill="#fde68a"/><text x="260" y="118" class="svg-ink">AF22 = 20</text>
<rect x="340" y="95" width="120" height="36" fill="#fde68a"/><text x="400" y="118" class="svg-ink">AF32 = 28</text>
<rect x="480" y="95" width="120" height="36" fill="#fde68a"/><text x="540" y="118" class="svg-ink">AF42 = 36</text>
<rect x="60" y="145" width="120" height="36" fill="#fecaca"/><text x="120" y="168" class="svg-ink">AF13 = 14</text>
<rect x="200" y="145" width="120" height="36" fill="#fecaca"/><text x="260" y="168" class="svg-ink">AF23 = 22</text>
<rect x="340" y="145" width="120" height="36" fill="#fecaca"/><text x="400" y="168" class="svg-ink">AF33 = 30</text>
<rect x="480" y="145" width="120" height="36" fill="#fecaca"/><text x="540" y="168" class="svg-ink">AF43 = 38</text>
</g>
<text x="330" y="210" text-anchor="middle" class="svg-accent" font-size="12">DSCP = 8 x class + 2 x drop precedence. Each column gets its own queue; each row is dropped first when the queue fills.</text>
</svg><p class="cap">The class number picks the queue; the drop precedence decides who is discarded first inside that queue.</p></div>
<p>Two things are easy to mix up. The <b>class</b> (column) decides which queue and bandwidth share the packet gets. The <b>drop precedence</b> (row) matters only when that queue is filling and the router uses an early-drop scheme such as WRED (next chapter): AFx3 packets are dropped sooner than AFx2, which are dropped sooner than AFx1. A higher AF class number does <i>not</i> by itself mean a higher priority; AF41 is not strictly ahead of AF11 unless the queuing policy says so.</p>
<p>Where do drop precedences come from? A policer usually assigns them. Traffic inside the contract is marked AFx1; traffic over the contract is re-marked to AFx2 or AFx3 instead of being dropped, so it is the first to go if the network gets crowded further along. Chapter 7 shows this with a three-colour policer.</p>

<h3>Expedited Forwarding and why 46</h3>
<p>EF is DSCP 46, binary <code>101110</code>. It looks like precedence 5 (<code>101</code>) to older equipment while not being the same as CS5 (<code>101000</code>, DSCP 40). The PHB goal is a service that behaves like a leased line: small queue, minimal delay, tight jitter. Two rules keep it honest:</p>
<ul>
<li>EF traffic goes to a <b>priority queue</b> that is always served first.</li>
<li>That queue is <b>policed to a rate</b> during congestion, so a misbehaving or mis-marked EF flow cannot starve everything else. The next chapter calls this the starvation guard.</li>
</ul>

<h3>Recommended markings in practice</h3>
<div class="tbl"><table>
<tr><th>Traffic</th><th>Marking</th><th>PHB</th><th>Typical treatment</th></tr>
<tr><td>Voice bearer</td><td>EF (46)</td><td>Expedited Forwarding</td><td>Priority queue, capped at about one third of the link</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>Assured Forwarding</td><td>Guaranteed bandwidth, WRED</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>Class Selector</td><td>Small guaranteed bandwidth</td></tr>
<tr><td>Network control (OSPF, EIGRP)</td><td>CS6 (48)</td><td>Class Selector</td><td>Small guaranteed bandwidth; routers mark their own control traffic</td></tr>
<tr><td>Transactional data</td><td>AF21 (18)</td><td>Assured Forwarding</td><td>Guaranteed bandwidth, WRED</td></tr>
<tr><td>Bulk data</td><td>AF11 (10)</td><td>Assured Forwarding</td><td>Limited bandwidth, early drop</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>Class Selector</td><td>Lowest priority, may be starved</td></tr>
<tr><td>Everything else</td><td>Default (0)</td><td>Default</td><td>Whatever is left</td></tr>
</table></div>
<p>These are common enterprise conventions, not laws. Different documents move signalling or broadcast video around, so on the exam use the values the question gives you, and remember the anchors: EF 46 for voice, CS3 24 for signalling, AF41 34 for video, CS6 48 for control, 0 for default.</p>

<h3>Matching PHBs in a class-map</h3>
<p>One class-map can match several DSCPs, for example all three AF1x drop precedences, so one queue serves the entire class. The simulator expands the names.</p>
<pre class="code">R1(config)# class-map match-any VOICE-EF
R1(config-cmap)# match dscp ef
R1(config)# class-map match-any AF1X
R1(config-cmap)# match dscp af11 af12 af13
R1(config)# class-map match-any SIGNAL
R1(config-cmap)# match dscp cs3
R1(config)# class-map match-any SCAV
R1(config-cmap)# match dscp cs1
R1# show class-map</pre>
<pre class="out"> Class Map match-any VOICE-EF (id 1)
   Match dscp ef (46)

 Class Map match-any AF1X (id 2)
   Match dscp af11 (10) af12 (12) af13 (14)

 Class Map match-any SIGNAL (id 3)
   Match dscp cs3 (24)

 Class Map match-any SCAV (id 4)
   Match dscp cs1 (8)

 Class Map match-any class-default (id 0)
   Match any </pre>

<div class="eg"><p><b>Worked example.</b> A branch has three bulk flows marked AF11, AF12 and AF13 by a policer, and a WRED profile on the AF1 queue with thresholds that start dropping AF13 first. The queue fills during a backup. AF13 packets (the over-contract ones) start to disappear at the lower threshold, AF12 packets later, and AF11 packets only if the queue keeps growing. TCP senders behind the dropped packets slow down, the queue drains, and the in-contract AF11 flow loses almost nothing. A single class-map (AF1X) was enough; the drop precedence worked inside the queue.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating AF as a priority ranking ("AF4 beats AF3 always"). Mixing up CS5 (40) and EF (46) because both look like precedence 5. Putting EF on non-voice traffic: a video stream marked EF eats the priority queue and, once policed, loses packets. Expecting a PHB to exist because the packet has a DSCP: the router needs a policy that acts on it.</p></div>

<div class="exam"><p><b>Exam traps.</b> The PHBs are Default, Class Selector, Assured Forwarding and Expedited Forwarding. AFxy: x is the class (1 to 4), y is the drop precedence (1 to 3); higher y is dropped first. EF is 46, low delay, low jitter, priority queue. CS values are multiples of 8. AF uses the formula 8x + 2y. DiffServ needs no per-flow state.</p></div>

<div class="scn"><h4>Two calls, one marked wrong</h4><p>In a branch, one softphone app marked its voice as AF41 while hardware phones used EF. Under congestion the hardware phones were clean but the softphone user complained of robotic audio. The softphone traffic was in the video class, which had a bandwidth guarantee but no priority queue, so it waited behind other video bursts. Setting the app (and a switch policy) to mark RTP as EF moved the softphone into the priority queue, and the audio cleared.</p><p><b>Lesson:</b> the PHB follows the marking. Same voice, different mark, different service.</p></div>

<div class="iv"><p class="q">"What is the difference between AF and EF?"</p><p>EF (DSCP 46) is for real-time traffic: strict priority queue, low latency and jitter, but capped so it cannot starve others. AF (four classes, three drop precedences) promises forwarding within a contracted rate and uses drop precedence to decide what to drop first when congested; it does not promise low delay. Give the formula 8x + 2y and an example such as AF41 = 34.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A PHB is the treatment a router gives to a DSCP; four groups: Default, CS, AF and EF.</li>
<li>CS values are multiples of 8 and map to old IP Precedence. Default is 0.</li>
<li>AFxy: x picks the class and queue, y is the drop precedence (3 is dropped first); DSCP = 8x + 2y.</li>
<li>EF 46 means a capped, strict-priority queue for voice: low delay, jitter and loss.</li>
<li>The PHB only exists where a policy acts on the marking.</li>
</ul></div>
`,hi:`
<p>Marking sirf label par likha ek shabd hai. Woh service tab banta hai jab har router us shabd ka matlab maanne par agree ho. Railway station socho: ticket par "Rajdhani", "Express" ya "Passenger" likha hai, aur station master ki rulebook kehti hai ki Rajdhani ko clear track, Express ko agla slot aur Passenger ko loop par intezaar. Ticket train nahi chalata; rulebook chalati hai. DiffServ mein rulebook <b>per-hop behavior (PHB)</b> hai: kisi DSCP wale packets ko router jo forwarding treatment deta hai. IETF ne chaar PHB groups standardise kiye jo CCNA ke liye chahiye.</p>

<h3>Chaar PHB groups</h3>
<dl class="terms">
<dt>Default PHB (DSCP 0)</dt><dd>Best effort. Bandwidth, delay ya loss ka koi vaada nahi. Saara unmarked traffic yahin aata hai, aur zyada tar MQC policies mein ise <code>class-default</code> represent karti hai.</dd>
<dt>Class Selector (CS0 se CS7)</dt><dd>DSCP values <code>xxx000</code>: aakhri teen bits zero hain, isliye sirf pehle teen bits (purana IP Precedence) matlab rakhte hain. CS isliye hai ki DiffServ routers aur purane precedence-only routers saath kaam kar saken. CS1 = 8, CS2 = 16, CS3 = 24, CS4 = 32, CS5 = 40, CS6 = 48, CS7 = 56. Bada selector number behtar ya barabar treatment pane ke liye hai.</dd>
<dt>Assured Forwarding (AF)</dt><dd>Chaar classes, har ek mein teen <b>drop precedences</b>. Vaada hai ki contracted rate ke andar ka traffic high probability se forward hoga, lekin low delay ka vaada nahi. <b>AFxy</b> likha jaata hai, jahan x class (1 se 4) aur y drop precedence (1 se 3) hai.</dd>
<dt>Expedited Forwarding (EF, DSCP 46)</dt><dd>Low loss, low delay, low jitter, assured bandwidth. Strict-priority queue ki tarah implement hota hai jiska rate limited hota hai taaki woh doosre traffic ko bhookha na rakhe. Voice bearer traffic ke liye.</dd>
</dl>

<h3>Assured Forwarding grid ki tarah</h3>
<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="AF grid">
<g font-size="12">
<text x="120" y="28" text-anchor="middle" class="svg-ink">AF1 (class 1)</text><text x="260" y="28" text-anchor="middle" class="svg-ink">AF2 (class 2)</text><text x="400" y="28" text-anchor="middle" class="svg-ink">AF3 (class 3)</text><text x="540" y="28" text-anchor="middle" class="svg-ink">AF4 (class 4)</text>
<text x="20" y="68" class="svg-muted">Low drop</text><text x="20" y="118" class="svg-muted">Medium</text><text x="20" y="168" class="svg-muted">High drop</text>
</g>
<g font-size="13" text-anchor="middle">
<rect x="60" y="45" width="120" height="36" fill="#bbf7d0"/><text x="120" y="68" class="svg-ink">AF11 = 10</text>
<rect x="200" y="45" width="120" height="36" fill="#bbf7d0"/><text x="260" y="68" class="svg-ink">AF21 = 18</text>
<rect x="340" y="45" width="120" height="36" fill="#bbf7d0"/><text x="400" y="68" class="svg-ink">AF31 = 26</text>
<rect x="480" y="45" width="120" height="36" fill="#bbf7d0"/><text x="540" y="68" class="svg-ink">AF41 = 34</text>
<rect x="60" y="95" width="120" height="36" fill="#fde68a"/><text x="120" y="118" class="svg-ink">AF12 = 12</text>
<rect x="200" y="95" width="120" height="36" fill="#fde68a"/><text x="260" y="118" class="svg-ink">AF22 = 20</text>
<rect x="340" y="95" width="120" height="36" fill="#fde68a"/><text x="400" y="118" class="svg-ink">AF32 = 28</text>
<rect x="480" y="95" width="120" height="36" fill="#fde68a"/><text x="540" y="118" class="svg-ink">AF42 = 36</text>
<rect x="60" y="145" width="120" height="36" fill="#fecaca"/><text x="120" y="168" class="svg-ink">AF13 = 14</text>
<rect x="200" y="145" width="120" height="36" fill="#fecaca"/><text x="260" y="168" class="svg-ink">AF23 = 22</text>
<rect x="340" y="145" width="120" height="36" fill="#fecaca"/><text x="400" y="168" class="svg-ink">AF33 = 30</text>
<rect x="480" y="145" width="120" height="36" fill="#fecaca"/><text x="540" y="168" class="svg-ink">AF43 = 38</text>
</g>
<text x="330" y="210" text-anchor="middle" class="svg-accent" font-size="12">DSCP = 8 x class + 2 x drop precedence. Har column ki apni queue; queue bharne par har row alag order mein drop hoti hai.</text>
</svg><p class="cap">Class number queue chunta hai; drop precedence tay karti hai ki us queue ke andar pehle kaun discard hoga.</p></div>
<p>Do cheezein aasani se mix ho jaati hain. <b>Class</b> (column) tay karti hai ki packet ko kaunsi queue aur bandwidth share milega. <b>Drop precedence</b> (row) tab matter karti hai jab woh queue bhar rahi ho aur router WRED jaisi early-drop scheme use kare (agla chapter): AFx3 packets AFx2 se pehle, aur AFx2 AFx1 se pehle drop hote hain. Bada AF class number apne aap mein bada priority <i>nahi</i> hai; AF41 strictly AF11 se aage tab hi hai jab queuing policy aisa kahe.</p>
<p>Drop precedences aati kahan se hain? Aam taur par policer assign karta hai. Contract ke andar ka traffic AFx1 mark hota hai; contract se upar ka traffic drop hone ki jagah AFx2 ya AFx3 mein re-mark hota hai, taaki aage network bhare to sabse pehle yahi jaaye. Chapter 7 three-colour policer ke saath dikhata hai.</p>

<h3>Expedited Forwarding aur 46 kyun</h3>
<p>EF DSCP 46 hai, binary <code>101110</code>. Purane equipment ko woh precedence 5 (<code>101</code>) jaisa dikhta hai, lekin CS5 (<code>101000</code>, DSCP 40) ke barabar nahi hai. PHB ka goal leased line jaisa behave karne wali service hai: chhoti queue, minimal delay, tight jitter. Do rules ise imaandaar rakhte hain:</p>
<ul>
<li>EF traffic <b>priority queue</b> mein jaata hai jo hamesha pehle serve hoti hai.</li>
<li>Woh queue congestion ke dauran ek rate par <b>police</b> hoti hai, taaki koi galat behave ya galat-mark hui EF flow baaki sab ko bhookha na rakh sake. Agla chapter ise starvation guard kehta hai.</li>
</ul>

<h3>Practice mein recommended markings</h3>
<div class="tbl"><table>
<tr><th>Traffic</th><th>Marking</th><th>PHB</th><th>Aam treatment</th></tr>
<tr><td>Voice bearer</td><td>EF (46)</td><td>Expedited Forwarding</td><td>Priority queue, link ke lagbhag ek tihai par cap</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>Assured Forwarding</td><td>Guaranteed bandwidth, WRED</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>Class Selector</td><td>Chhota guaranteed bandwidth</td></tr>
<tr><td>Network control (OSPF, EIGRP)</td><td>CS6 (48)</td><td>Class Selector</td><td>Chhota guaranteed bandwidth; routers apna control traffic khud mark karte hain</td></tr>
<tr><td>Transactional data</td><td>AF21 (18)</td><td>Assured Forwarding</td><td>Guaranteed bandwidth, WRED</td></tr>
<tr><td>Bulk data</td><td>AF11 (10)</td><td>Assured Forwarding</td><td>Limited bandwidth, early drop</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>Class Selector</td><td>Sabse kam priority, bhookha reh sakta hai</td></tr>
<tr><td>Baaki sab</td><td>Default (0)</td><td>Default</td><td>Jo bachta hai</td></tr>
</table></div>
<p>Yeh common enterprise conventions hain, kanoon nahi. Alag documents signalling ya broadcast video ko idhar-udhar karte hain, isliye exam mein sawaal jo values de wahi use karo, aur anchors yaad rakho: voice ke liye EF 46, signalling ke liye CS3 24, video ke liye AF41 34, control ke liye CS6 48, default ke liye 0.</p>

<h3>Class-map mein PHBs match karna</h3>
<p>Ek class-map kai DSCPs match kar sakta hai, jaise teeno AF1x drop precedences, taaki ek queue poori class ko serve kare. Simulator names ko expand karta hai.</p>
<pre class="code">R1(config)# class-map match-any VOICE-EF
R1(config-cmap)# match dscp ef
R1(config)# class-map match-any AF1X
R1(config-cmap)# match dscp af11 af12 af13
R1(config)# class-map match-any SIGNAL
R1(config-cmap)# match dscp cs3
R1(config)# class-map match-any SCAV
R1(config-cmap)# match dscp cs1
R1# show class-map</pre>
<pre class="out"> Class Map match-any VOICE-EF (id 1)
   Match dscp ef (46)

 Class Map match-any AF1X (id 2)
   Match dscp af11 (10) af12 (12) af13 (14)

 Class Map match-any SIGNAL (id 3)
   Match dscp cs3 (24)

 Class Map match-any SCAV (id 4)
   Match dscp cs1 (8)

 Class Map match-any class-default (id 0)
   Match any </pre>

<div class="eg"><p><b>Worked example.</b> Branch mein teen bulk flows hain jinhe policer ne AF11, AF12 aur AF13 mark kiya hai, aur AF1 queue par WRED profile hai jiske thresholds pehle AF13 ko drop karna shuru karte hain. Backup ke dauran queue bharti hai. AF13 packets (contract se upar wale) lower threshold par gayab hone lagte hain, AF12 baad mein, aur AF11 tabhi jab queue badhti rahe. Dropped packets ke peeche ke TCP senders dheeme hote hain, queue khali hoti hai, aur in-contract AF11 flow ko lagbhag kuch nahi khona padta. Ek hi class-map (AF1X) kaafi tha; drop precedence queue ke andar kaam kar gayi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> AF ko priority ranking samajhna ("AF4 hamesha AF3 se jeetta hai"). CS5 (40) aur EF (46) mix karna kyunki dono precedence 5 jaise dikhte hain. EF ko non-voice traffic par lagana: EF mark hui video stream priority queue kha jaati hai aur police hone par packets khoti hai. Maan lena ki packet par DSCP hai to PHB apne aap hoga: router ko ek policy chahiye jo us par action le.</p></div>

<div class="exam"><p><b>Exam traps.</b> PHBs hain Default, Class Selector, Assured Forwarding aur Expedited Forwarding. AFxy: x class (1 se 4), y drop precedence (1 se 3); bada y pehle drop hota hai. EF 46 hai, low delay, low jitter, priority queue. CS values 8 ke multiples hain. AF formula 8x + 2y. DiffServ ko per-flow state nahi chahiye.</p></div>

<div class="scn"><h4>Do calls, ek galat mark</h4><p>Ek branch mein ek softphone app apni voice AF41 mark kar rahi thi jabki hardware phones EF use karte the. Congestion mein hardware phones saaf the lekin softphone user ko robotic audio ki shikayat thi. Softphone traffic video class mein tha, jisme bandwidth guarantee thi lekin priority queue nahi, isliye woh doosre video bursts ke peeche wait karta tha. App (aur ek switch policy) ko RTP EF mark karne par set karne se softphone priority queue mein chala gaya, aur audio saaf ho gayi.</p><p><b>Seekh:</b> PHB marking ke saath chalta hai. Same voice, alag mark, alag service.</p></div>

<div class="iv"><p class="q">"AF aur EF mein kya farq hai?"</p><p>EF (DSCP 46) real-time traffic ke liye hai: strict priority queue, low latency aur jitter, lekin cap lagi hai taaki doosron ko bhookha na rakhe. AF (chaar classes, teen drop precedences) contracted rate ke andar forwarding ka vaada karta hai aur congestion mein pehle kya drop ho yeh drop precedence tay karti hai; low delay ka vaada nahi. Formula 8x + 2y aur AF41 = 34 jaisa example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PHB woh treatment hai jo router DSCP ko deta hai; chaar groups: Default, CS, AF aur EF.</li>
<li>CS values 8 ke multiples hain aur purane IP Precedence se map hoti hain. Default 0 hai.</li>
<li>AFxy: x class aur queue chunta hai, y drop precedence hai (3 pehle drop); DSCP = 8x + 2y.</li>
<li>EF 46 matlab voice ke liye capped, strict-priority queue: low delay, jitter aur loss.</li>
<li>PHB tabhi hota hai jab koi policy marking par action le.</li>
</ul></div>
`}};export{e as default};