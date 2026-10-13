var e={id:`sla-app-route`,h:{en:`SLA classes and app-route policy: preferred color, backup, strict and fallback`,hi:`SLA classes aur app-route policy: preferred color, backup, strict aur fallback`},body:{en:`
<p>Now we join the two halves: the <b>measurements</b> from the previous chapter and the <b>decision</b>. The decision has two ingredients. The <b>SLA class</b> says what "good enough" means in numbers. The <b>app-route policy</b> says which applications need which SLA class, which colors you prefer, and what to do when nothing is good enough.</p>

<h3>Analogy: booking a flight</h3>
<p>You tell a travel agent: "I must reach Mumbai in under 3 hours, and I prefer the airline I have miles with. If that airline cannot do it, any airline that can is fine. If nobody can, ... either do not book at all (strict) or give me the fastest available (fallback to best)". That is exactly an app-route policy: an SLA, a preferred color, and a rule for the worst case.</p>

<h3>The SLA class</h3>
<p>An SLA class is a named set of upper limits. Any of the three may be left out.</p>
<pre class="code"><span class="c">! on VSMART</span>
policy
 sla-class VOICE
  loss 1
  latency 150
  jitter 30
 sla-class BILLING
  loss 2
  latency 250
 sla-class BULK
  loss 5
  latency 500
  fallback-best-tunnel
   criteria latency</pre>
<ul>
<li><b>loss</b> is a percentage, <b>latency</b> and <b>jitter</b> are milliseconds.</li>
<li>A tunnel <b>meets</b> the class only if <b>every</b> configured limit is satisfied by its averaged measurement.</li>
<li>On every edge there is also a built-in class <code>__all_tunnels__</code> (index 0) that all tunnels satisfy.</li>
<li>The number of SLA classes per policy is limited, so define a few meaningful classes (voice, transactional, bulk) rather than one per application.</li>
</ul>

<h3>The app-route policy</h3>
<pre class="code">policy
 app-route-policy AAR-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action
     count VOICE-AAR
     sla-class VOICE preferred-color mpls
   sequence 20
    match
     app-list BILLING-APPS
    action
     sla-class BILLING preferred-color mpls
     backup-sla-preferred-color biz-internet
   sequence 30
    match
     app-list BACKUP-APPS
    action
     sla-class BULK preferred-color biz-internet
apply-policy
 site-list PUNE
  app-route-policy AAR-PUNE</pre>
<p>Notice the vocabulary. <code>preferred-color</code> lists the colors you like for this traffic. <code>backup-sla-preferred-color</code> (shown in Manager as <b>Backup SLA Preferred Color</b>) is the color to use when <b>no tunnel</b> meets the SLA. <code>strict</code> (after the sla-class name) means "drop rather than use a path that fails the SLA". <b>Fallback best tunnel</b> is defined inside the SLA class and tells the edge to pick the tunnel closest to the SLA, judged on the criteria you choose (latency, loss or jitter), instead of load-balancing over everything. A <b>variance</b> value (set in Manager) makes tunnels within a small range of the best one count as equal, which avoids flapping between near-identical paths.</p>

<h3>How a tunnel is chosen: the ladder</h3>
<ol>
<li>The edge lists all tunnels that OMP gave it towards the destination.</li>
<li>It keeps those that <b>meet the SLA class</b> of the matching sequence.</li>
<li>Among them, tunnels whose color is in <code>preferred-color</code> are used, load-balanced if there are several. If none of the preferred colors qualifies, other colors that meet the SLA are used.</li>
<li>If <b>no tunnel meets the SLA</b>, the edge uses <code>backup-sla-preferred-color</code> if you configured one.</li>
<li>If that does not apply: with <code>strict</code> the traffic is <b>dropped</b>; with fallback best tunnel the best available tunnel is used; with neither, the traffic is <b>load-balanced across all available tunnels</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Decision ladder for an app-route policy">
<rect x="170" y="10" width="300" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Tunnels to destination (from OMP)</text>
<rect x="170" y="62" width="300" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">Meet the SLA class?</text>
<rect x="20" y="118" width="280" height="42" rx="8" fill="#bbf7d0"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="12">Yes: preferred color first,</text><text x="160" y="151" text-anchor="middle" class="svg-ink" font-size="12">else any color that meets it</text>
<rect x="340" y="118" width="280" height="42" rx="8" fill="#fed7aa"/><text x="480" y="136" text-anchor="middle" class="svg-ink" font-size="12">None meets it: backup-sla-preferred-color</text><text x="480" y="151" text-anchor="middle" class="svg-ink" font-size="12">if configured</text>
<rect x="340" y="176" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="196" text-anchor="middle" class="svg-ink" font-size="12">strict:</text><text x="405" y="212" text-anchor="middle" class="svg-ink" font-size="12">drop</text>
<rect x="485" y="176" width="135" height="50" rx="8" fill="#fde68a"/><text x="552" y="196" text-anchor="middle" class="svg-ink" font-size="12">best tunnel or</text><text x="552" y="212" text-anchor="middle" class="svg-ink" font-size="12">load-balance all</text>
<line x1="320" y1="48" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="160" y2="118" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="480" y2="118" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="405" y2="176" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="552" y2="176" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The ladder runs for every matching flow. Strict and fallback only matter when nothing meets the SLA.</p></div>

<div class="eg"><p><b>Worked example.</b> Voice from Pune: SLA VOICE, preferred color mpls. Today MPLS shows loss 0, latency 38 ms, jitter 3 ms and biz-internet shows loss 0, latency 55 ms, jitter 9 ms. Both meet VOICE, so voice uses MPLS (the preferred color) only. At 11 am biz-internet degrades to latency 190 ms: it fails, MPLS still qualifies, nothing changes for voice. Later MPLS has a fault: loss 3%. Now MPLS fails; biz-internet is back to 60 ms and meets VOICE, so voice moves to <b>biz-internet</b> within one measurement window. When MPLS recovers, voice returns to it.</p></div>

<h3>Seeing the result</h3>
<pre class="out">E-BR1# show sdwan app-route sla-class
app-route sla-class __all_tunnels__
 index 0
 loss 100
 latency 1000
 jitter 1000
app-route sla-class VOICE
 index 1
 <span class="hl">loss 1</span>
 <span class="hl">latency 150</span>
 <span class="hl">jitter 30</span>
app-route sla-class BILLING
 index 2
 loss 2
 latency 250
 jitter 1000</pre>
<p>These indexes are the numbers you see in <code>sla-class-index</code> of <code>show sdwan app-route stats</code>. If a tunnel's list is <code>0,2,3</code> and VOICE is index 1, that tunnel <b>fails voice</b>.</p>

<h3>One more tool: app-probe-class</h3>
<p>BFD hellos are marked DSCP 48 by default, so they travel in a high-priority queue and can look healthier than the voice queue really is. An optional <b>app-probe-class</b> inside an SLA class makes the edge send probes marked with the application's forwarding class and DSCP, so the measurement experiences the same queue as the traffic.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting an SLA tighter than the transport can ever meet (for example latency 20 ms over a 4G link), so no tunnel passes and traffic falls to the worst-case rule. (2) Using <code>strict</code> for ordinary business traffic and causing outages when both links have a brief bad spell. (3) Listing one color in preferred-color but forgetting that colors that meet the SLA are used if the preferred one fails; that is intended behaviour, not a bug.</p></div>

<div class="exam"><p><b>Exam trap.</b> App-route policy does not require an SLA to be <i>met</i> to forward: without strict, traffic still flows when nothing meets it. Only <b>strict</b> drops. Another trap: <code>preferred-color</code> is a preference <i>among tunnels that already meet the SLA</i>; a preferred color that fails the SLA is not used just because it is preferred.</p></div>

<div class="scn"><h4>Payment terminals and the "strict" debate</h4><p>Bharat Retail's card terminals in Pune time out when latency exceeds 400 ms, and a half-completed payment produces support calls. The first design used sla-class POS with no strict, so during a double brownout the terminals still used a bad path. Security and operations agreed to use <code>strict</code> on this one application only, because a fast failure that the terminal retries on a clean path later is better than a slow success that double-charges. All other applications kept non-strict behaviour.</p><p><b>Lesson:</b> strict is a deliberate trade of availability for quality. Use it only for traffic that is worse than useless on a bad path.</p></div>

<div class="iv"><p class="q">"What is the difference between preferred-color, backup-sla-preferred-color and strict?"</p><p>preferred-color picks which colors to favour among tunnels that meet the SLA. backup-sla-preferred-color names the color to use when no tunnel meets the SLA. strict drops the traffic if no tunnel meets the SLA. Without strict or fallback best tunnel, traffic is load-balanced over all tunnels when nothing qualifies. Adding an example with voice and billing makes the answer memorable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SLA class holds loss (percent), latency (ms) and jitter (ms) limits; all configured limits must be met.</li>
<li>An app-route policy maps applications to an SLA class and adds preferred-color, backup-sla-preferred-color and strict.</li>
<li>The ladder: tunnels meeting the SLA (preferred color first), then the backup color, then strict drop, best tunnel or load-balance.</li>
<li>Fallback best tunnel and variance live in the SLA class and stop flapping between near-equal paths.</li>
<li>Apply with <code>apply-policy site-list ... app-route-policy ...</code>; there is no direction.</li>
</ul></div>
`,hi:`
<p>Ab hum do hisse jodte hain: pichhle chapter ke <b>measurements</b> aur <b>decision</b>. Decision ke do ingredients hain. <b>SLA class</b> batati hai ki "kaafi accha" ka matlab numbers mein kya hai. <b>App-route policy</b> batati hai ki kaunsi application ko kaunsi SLA class chahiye, aap kaunse colors prefer karte ho, aur jab kuch bhi kaafi accha na ho to kya karna hai.</p>

<h3>Analogy: flight book karna</h3>
<p>Aap travel agent ko kehte ho: "Mujhe Mumbai 3 ghante ke andar pahunchna hai, aur main us airline ko prefer karta hoon jiske miles mere paas hain. Agar woh airline na kar paaye to jo bhi kar sake chalega. Agar koi bhi nahi kar sakta, ... to ya book hi mat karo (strict) ya jo sabse tez mile woh de do (fallback to best)". Yahi app-route policy hai: ek SLA, ek preferred color, aur worst case ka rule.</p>

<h3>SLA class</h3>
<p>SLA class upper limits ka naam wala set hai. Teen mein se koi bhi chhoda ja sakta hai.</p>
<pre class="code"><span class="c">! on VSMART</span>
policy
 sla-class VOICE
  loss 1
  latency 150
  jitter 30
 sla-class BILLING
  loss 2
  latency 250
 sla-class BULK
  loss 5
  latency 500
  fallback-best-tunnel
   criteria latency</pre>
<ul>
<li><b>loss</b> percentage hai, <b>latency</b> aur <b>jitter</b> milliseconds hain.</li>
<li>Tunnel class ko tabhi <b>meet</b> karta hai jab uske averaged measurement se <b>har</b> configured limit satisfy ho.</li>
<li>Har edge par ek built-in class <code>__all_tunnels__</code> (index 0) bhi hoti hai jise saare tunnels satisfy karte hain.</li>
<li>Ek policy mein SLA classes ki ginti limited hoti hai, isliye har application ke liye ek class banane ki jagah kuch meaningful classes (voice, transactional, bulk) banao.</li>
</ul>

<h3>App-route policy</h3>
<pre class="code">policy
 app-route-policy AAR-PUNE
  vpn-list CORP
   sequence 10
    match
     app-list VOICE-APPS
    action
     count VOICE-AAR
     sla-class VOICE preferred-color mpls
   sequence 20
    match
     app-list BILLING-APPS
    action
     sla-class BILLING preferred-color mpls
     backup-sla-preferred-color biz-internet
   sequence 30
    match
     app-list BACKUP-APPS
    action
     sla-class BULK preferred-color biz-internet
apply-policy
 site-list PUNE
  app-route-policy AAR-PUNE</pre>
<p>Vocabulary dhyan se dekho. <code>preferred-color</code> woh colors list karta hai jo aap is traffic ke liye pasand karte ho. <code>backup-sla-preferred-color</code> (Manager mein <b>Backup SLA Preferred Color</b>) woh color hai jo tab use hota hai jab <b>koi tunnel</b> SLA meet na kare. <code>strict</code> (sla-class naam ke baad) ka matlab "SLA fail karne wale path se behtar hai drop kar do". <b>Fallback best tunnel</b> SLA class ke andar define hota hai aur edge ko batata hai ki sab par load-balance karne ke bajaye SLA ke sabse kareeb wala tunnel chun le, aapke chune hue criteria (latency, loss ya jitter) ke hisaab se. <b>Variance</b> value (Manager mein set hoti hai) best tunnel ke chhote range ke andar wale tunnels ko barabar maanti hai, jisse lagbhag identical paths ke beech flapping nahi hoti.</p>

<h3>Tunnel kaise chuna jaata hai: ladder</h3>
<ol>
<li>Edge un sab tunnels ki list banata hai jo OMP ne destination tak diye hain.</li>
<li>Woh sirf unhe rakhta hai jo matching sequence ki <b>SLA class meet</b> karte hain.</li>
<li>Unmein se jin tunnels ka color <code>preferred-color</code> mein hai woh use hote hain, kai hon to load-balance. Agar koi bhi preferred color qualify na kare to doosre colors jo SLA meet karte hain woh use hote hain.</li>
<li>Agar <b>koi tunnel SLA meet nahi karta</b>, to edge <code>backup-sla-preferred-color</code> use karta hai agar aapne configure kiya ho.</li>
<li>Agar woh bhi lagu na ho: <code>strict</code> ke saath traffic <b>drop</b> hota hai; fallback best tunnel ke saath best available tunnel use hota hai; dono na ho to traffic <b>saare available tunnels par load-balance</b> hota hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="App-route policy ka decision ladder">
<rect x="170" y="10" width="300" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Destination tak tunnels (OMP se)</text>
<rect x="170" y="62" width="300" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">SLA class meet karte hain?</text>
<rect x="20" y="118" width="280" height="42" rx="8" fill="#bbf7d0"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="12">Haan: pehle preferred color,</text><text x="160" y="151" text-anchor="middle" class="svg-ink" font-size="12">warna jo bhi color meet kare</text>
<rect x="340" y="118" width="280" height="42" rx="8" fill="#fed7aa"/><text x="480" y="136" text-anchor="middle" class="svg-ink" font-size="12">Koi meet nahi karta: backup-sla-preferred-color</text><text x="480" y="151" text-anchor="middle" class="svg-ink" font-size="12">agar configured ho</text>
<rect x="340" y="176" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="196" text-anchor="middle" class="svg-ink" font-size="12">strict:</text><text x="405" y="212" text-anchor="middle" class="svg-ink" font-size="12">drop</text>
<rect x="485" y="176" width="135" height="50" rx="8" fill="#fde68a"/><text x="552" y="196" text-anchor="middle" class="svg-ink" font-size="12">best tunnel ya</text><text x="552" y="212" text-anchor="middle" class="svg-ink" font-size="12">sab par load-balance</text>
<line x1="320" y1="48" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="160" y2="118" stroke="#64748b" stroke-width="2"/><line x1="320" y1="100" x2="480" y2="118" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="405" y2="176" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="552" y2="176" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ladder har matching flow ke liye chalti hai. Strict aur fallback tabhi matter karte hain jab kuch bhi SLA meet na kare.</p></div>

<div class="eg"><p><b>Worked example.</b> Pune se voice: SLA VOICE, preferred color mpls. Aaj MPLS par loss 0, latency 38 ms, jitter 3 ms hai aur biz-internet par loss 0, latency 55 ms, jitter 9 ms. Dono VOICE meet karte hain, isliye voice sirf MPLS (preferred color) use karti hai. 11 baje biz-internet latency 190 ms tak degrade hota hai: woh fail hota hai, MPLS abhi bhi qualify karta hai, voice ke liye kuch nahi badalta. Baad mein MPLS par fault aata hai: loss 3%. Ab MPLS fail hota hai; biz-internet wapas 60 ms par hai aur VOICE meet karta hai, isliye voice ek measurement window ke andar <b>biz-internet</b> par chali jaati hai. MPLS recover hone par voice wapas usi par aa jaati hai.</p></div>

<h3>Result dekhna</h3>
<pre class="out">E-BR1# show sdwan app-route sla-class
app-route sla-class __all_tunnels__
 index 0
 loss 100
 latency 1000
 jitter 1000
app-route sla-class VOICE
 index 1
 <span class="hl">loss 1</span>
 <span class="hl">latency 150</span>
 <span class="hl">jitter 30</span>
app-route sla-class BILLING
 index 2
 loss 2
 latency 250
 jitter 1000</pre>
<p>Yeh indexes wahi numbers hain jo <code>show sdwan app-route stats</code> ke <code>sla-class-index</code> mein dikhte hain. Agar kisi tunnel ki list <code>0,2,3</code> hai aur VOICE index 1 hai, to woh tunnel <b>voice fail</b> karta hai.</p>

<h3>Ek aur tool: app-probe-class</h3>
<p>BFD hellos default mein DSCP 48 se mark hote hain, isliye woh high-priority queue mein chalte hain aur voice queue ki asli halat se zyada healthy dikh sakte hain. SLA class ke andar optional <b>app-probe-class</b> edge ko application ke forwarding class aur DSCP se mark kiye hue probes bhejne deta hai, taaki measurement ko wahi queue mile jo traffic ko milti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) SLA ko itna tight rakhna jitna transport kabhi meet nahi kar sakta (jaise 4G link par latency 20 ms), isliye koi tunnel pass nahi hota aur traffic worst-case rule par chala jaata hai. (2) Normal business traffic par <code>strict</code> lagana aur jab dono links par thodi der kharab spell aaye to outage ho jaana. (3) Sirf ek color preferred-color mein likhna aur yeh bhool jaana ki agar woh fail ho to SLA meet karne wale colors use hote hain; yeh intended behaviour hai, bug nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> App-route policy ko forward karne ke liye SLA <i>met</i> hona zaroori nahi hai: strict ke bina, kuch bhi meet na kare tab bhi traffic chalta hai. Sirf <b>strict</b> drop karta hai. Ek aur trap: <code>preferred-color</code> un tunnels ke beech preference hai jo pehle se SLA meet karte hain; jo preferred color SLA fail kare woh sirf preferred hone ki wajah se use nahi hota.</p></div>

<div class="scn"><h4>Payment terminals aur "strict" ki behes</h4><p>Bharat Retail ke Pune ke card terminals tab time out hote hain jab latency 400 ms se upar jaati hai, aur adhoori payment support calls banati hai. Pehle design mein sla-class POS bina strict ke tha, isliye double brownout mein terminals ne phir bhi kharab path use kiya. Security aur operations ne sirf is ek application par <code>strict</code> use karne par sahmati di, kyunki tez failure jo terminal baad mein saaf path par retry kare, dheemi success se behtar hai jo double-charge kare. Baaki sab applications ne non-strict behaviour rakha.</p><p><b>Lesson:</b> strict availability ko quality ke badle jaanbujh kar dena hai. Ise sirf us traffic ke liye use karo jo kharab path par bekaar se bhi bura hai.</p></div>

<div class="iv"><p class="q">"preferred-color, backup-sla-preferred-color aur strict mein kya difference hai?"</p><p>preferred-color un tunnels ke beech favour kiye jaane wale colors chunta hai jo SLA meet karte hain. backup-sla-preferred-color woh color batata hai jo tab use hota hai jab koi tunnel SLA meet na kare. strict traffic drop karta hai agar koi tunnel SLA meet na kare. strict ya fallback best tunnel ke bina, kuch bhi qualify na kare to traffic saare tunnels par load-balance hota hai. Voice aur billing ka example jodne se jawab yaad rehne layak ban jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLA class mein loss (percent), latency (ms) aur jitter (ms) limits hoti hain; saari configured limits meet honi chahiye.</li>
<li>App-route policy applications ko SLA class se map karti hai aur preferred-color, backup-sla-preferred-color aur strict jodti hai.</li>
<li>Ladder: SLA meet karne wale tunnels (pehle preferred color), phir backup color, phir strict drop, best tunnel ya load-balance.</li>
<li>Fallback best tunnel aur variance SLA class mein hote hain aur lagbhag barabar paths ke beech flapping rokte hain.</li>
<li><code>apply-policy site-list ... app-route-policy ...</code> se apply karo; koi direction nahi hoti.</li>
</ul></div>
`}};export{e as default};