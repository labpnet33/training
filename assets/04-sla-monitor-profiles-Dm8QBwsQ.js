var e={id:`sla-monitor-profiles`,h:{en:`SLA monitoring and SLA profiles`,hi:`SLA monitoring aur SLA profiles`},body:{en:`
<p>Before a driver chooses a road, he checks the traffic app. The app is the <b>measurement</b>; his own rule "I will not take a road slower than 40 minutes" is the <b>threshold</b>. SD-WAN splits the job the same way. <b>SLA monitoring</b> measures every transport all the time. An <b>SLA profile</b> is the threshold that says what is acceptable for one kind of traffic. Keeping them separate is clever: one measurement is reused by many profiles (voice is strict, backup is relaxed).</p>

<h3>How measurement works</h3>
<p>A branch sends small probe packets through each tunnel to the remote site (or to the Controller and hub) at a regular interval, for example every few seconds. From the replies it calculates:</p>
<ul>
<li><b>Latency</b>: round-trip time, sometimes shown per direction.</li>
<li><b>Jitter</b>: variation between successive probe delays.</li>
<li><b>Loss</b>: the share of probes (or of sampled data packets) with no reply, over a time window.</li>
</ul>
<p>In real Versa, SLA monitoring runs between sites over the overlay and underlay, with configurable probe intervals, and it can also use live data traffic as additional measurement. Results are shown in the Director and in Analytics, and per path with VOS CLI show commands. The course CLI shows one table per branch.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SLA probes between sites">
<rect x="20" y="75" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">probe sender</text>
<rect x="500" y="75" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="14">Remote</text><text x="560" y="125" text-anchor="middle" class="svg-muted" font-size="12">replies</text>
<line x1="140" y1="90" x2="500" y2="50" stroke="#64748b" stroke-width="2"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">MPLS tunnel probes</text>
<line x1="140" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="103" text-anchor="middle" class="svg-accent" font-size="12">Internet tunnel probes</text>
<line x1="140" y1="130" x2="500" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">LTE tunnel probes</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Each tunnel gets its own latency, jitter and loss</text>
</svg><p class="cap">One set of numbers per transport, refreshed continuously.</p></div>

<h3>Hysteresis: do not flap</h3>
<p>Measurements wobble. If a path is judged "bad" the moment one probe is late, and "good" again the next second, traffic would jump between paths and users would suffer more than from the original wobble. The cure is <b>hysteresis</b>: require the problem to persist for several samples before declaring a violation, and require recovery to persist before returning. Real Versa lets you tune probe intervals and thresholds, and there are hold timers and damping options for this purpose (exact names vary by release). The course model has no time dimension: it evaluates the circuit values you see at that moment. Remember the idea, because it explains why a real network is slower to react than a lab.</p>

<h3>The SLA profile</h3>
<p>An SLA profile is just three limits. In the lab CLI:</p>
<pre class="code"><span class="c">! SLA profile VOICE: 150 ms latency, 30 ms jitter, 1 % loss</span>
set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
set orgs org-services Acme sd-wan sla-profiles VOICE loss 1</pre>
<p>A transport <b>meets</b> the profile only if <b>all three</b> measured values are less than or equal to the limits. Equal passes. One failed metric means the whole transport does not meet the profile.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan sla-profiles
SLA profile     Latency   Jitter   Loss
VOICE           150 ms    30 ms    1 %

admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   <span class="hl">VOICE=yes</span>
MPLS       up     20 ms     2 ms     0.05 %  <span class="hl">VOICE=yes</span>
LTE        up     60 ms     15 ms    1 %     <span class="hl">VOICE=yes</span></pre>
<p>Read the table in two steps: first the measured columns, then the right-hand column that applies every defined SLA profile. A tunnel that is <code>down</code> shows <code>-</code> because there is nothing to measure.</p>

<div class="eg"><p><b>Worked example.</b> Compare three transports with VOICE (150 / 30 / 1):<br>
Internet 170 ms / 6 ms / 0.3 %: latency 170 is above 150, so NO.<br>
MPLS 20 ms / 40 ms / 0.05 %: jitter 40 is above 30, so NO even though latency is excellent.<br>
LTE 60 ms / 15 ms / 1 %: all three at or below the limits, so yes.<br>
Different applications can use different profiles, for example BACKUP with 500 ms, 100 ms and 5 %: all three transports would meet it.</p></div>

<h3>Choosing good thresholds</h3>
<ul>
<li>Start from the application need (chapter 2), not from what the circuits happen to deliver today.</li>
<li>Leave a margin: if MPLS usually shows 20 ms, a limit of 150 ms gives room for normal variation.</li>
<li>Too strict: every path fails all the time and fallback is used permanently. Too loose: bad paths still count as good and users suffer.</li>
<li>Create a few profiles (voice, video, business, bulk) instead of one per application.</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> setting latency but forgetting jitter and loss; reading <code>Meets SLA</code> as "the path is healthy" (it only means healthy <b>for that profile</b>); changing a profile to make an alarm disappear instead of fixing the circuit.</p></div>
<div class="exam"><p><b>Exam trap:</b> the SLA monitor measures transports; the SLA profile defines thresholds; neither one chooses a path. The forwarding profile does that, using both.</p></div>

<div class="scn"><h4>Flapping between MPLS and Internet</h4><p>A bank branch complains that calls drop for a second every few minutes. The logs show voice moving MPLS to Internet and back. The MPLS carrier has short micro-bursts of 160 ms. Because the evaluation had no hold time, each burst moved the call. The engineer enables a violation hold and a recovery wait, and keeps the 150 ms limit.</p><p><b>Lesson:</b> Hysteresis stops flapping. It is better than loosening the SLA.</p></div>

<div class="iv"><p class="q">"What is the difference between an SLA monitor and an SLA profile?"</p><p>The monitor measures latency, jitter and loss per transport using probes. The profile is the set of limits an application accepts. A transport meets the profile if all three measured values are within the limits. Add that hysteresis prevents flapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLA monitoring measures each tunnel; the SLA profile sets limits.</li>
<li>All three metrics must be less than or equal to the limits.</li>
<li>Hysteresis (hold and wait) prevents flapping on real networks.</li>
<li>Use <code>show orgs org Acme sd-wan sla-monitor status</code> and <code>show orgs org-services Acme sd-wan sla-profiles</code>.</li>
</ul></div>
`,hi:`
<p>Driver road chunne se pehle traffic app dekhta hai. App <b>measurement</b> hai; uska apna rule "main 40 minute se slow road nahi loonga" <b>threshold</b> hai. SD-WAN kaam ko isi tarah baant deta hai. <b>SLA monitoring</b> har transport ko hamesha measure karti hai. <b>SLA profile</b> woh threshold hai jo batata hai ki ek tarah ki traffic ke liye kya acceptable hai. Dono ko alag rakhna smart hai: ek measurement kai profiles reuse karte hain (voice strict hai, backup relaxed).</p>

<h3>Measurement kaise kaam karta hai</h3>
<p>Branch har tunnel ke through remote site (ya Controller aur hub) ko regular interval par, jaise har kuch seconds, chhote probe packets bhejta hai. Replies se woh calculate karta hai:</p>
<ul>
<li><b>Latency</b>: round-trip time, kabhi kabhi direction ke hisaab se alag dikhaya jaata hai.</li>
<li><b>Jitter</b>: lagatar probe delays ke beech variation.</li>
<li><b>Loss</b>: probes (ya sampled data packets) ka woh hissa jinka reply nahi aaya, ek time window mein.</li>
</ul>
<p>Real Versa mein SLA monitoring sites ke beech overlay aur underlay par chalti hai, configurable probe intervals ke saath, aur woh live data traffic ko bhi additional measurement ke roop mein use kar sakti hai. Results Director aur Analytics mein dikhte hain, aur path ke hisaab se VOS CLI show commands se. Course CLI har branch ke liye ek table dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Sites ke beech SLA probes">
<rect x="20" y="75" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">probe sender</text>
<rect x="500" y="75" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="14">Remote</text><text x="560" y="125" text-anchor="middle" class="svg-muted" font-size="12">replies</text>
<line x1="140" y1="90" x2="500" y2="50" stroke="#64748b" stroke-width="2"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">MPLS tunnel probes</text>
<line x1="140" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="103" text-anchor="middle" class="svg-accent" font-size="12">Internet tunnel probes</text>
<line x1="140" y1="130" x2="500" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">LTE tunnel probes</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Har tunnel ki apni latency, jitter aur loss</text>
</svg><p class="cap">Har transport ke liye numbers ka ek set, lagatar refresh hota hai.</p></div>

<h3>Hysteresis: flap mat karo</h3>
<p>Measurements hilte rehte hain. Agar ek probe late hote hi path "bad" declare ho jaye, aur agle second "good", to traffic paths ke beech kudti rahegi aur users ko original wobble se zyada takleef hogi. Ilaaj hai <b>hysteresis</b>: violation declare karne se pehle problem ko kai samples tak persist karne do, aur wapas aane se pehle recovery ko bhi persist karne do. Real Versa mein probe intervals aur thresholds tune kar sakte ho, aur is purpose ke liye hold timers aur damping options hain (exact names release ke hisaab se badalte hain). Course model mein time dimension nahi hai: woh us waqt dikhne wali circuit values ko evaluate karta hai. Idea yaad rakho, kyunki yahi batata hai ki real network lab se dheere react kyun karta hai.</p>

<h3>SLA profile</h3>
<p>SLA profile bas teen limits hai. Lab CLI mein:</p>
<pre class="code"><span class="c">! SLA profile VOICE: 150 ms latency, 30 ms jitter, 1 % loss</span>
set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
set orgs org-services Acme sd-wan sla-profiles VOICE loss 1</pre>
<p>Transport profile ko tabhi <b>meet</b> karta hai jab <b>teeno</b> measured values limits ke kam ya barabar hon. Barabar pass hota hai. Ek metric fail to poora transport profile meet nahi karta.</p>

<pre class="out">admin@Branch1-cli&gt; show orgs org-services Acme sd-wan sla-profiles
SLA profile     Latency   Jitter   Loss
VOICE           150 ms    30 ms    1 %

admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   <span class="hl">VOICE=yes</span>
MPLS       up     20 ms     2 ms     0.05 %  <span class="hl">VOICE=yes</span>
LTE        up     60 ms     15 ms    1 %     <span class="hl">VOICE=yes</span></pre>
<p>Table do steps mein padho: pehle measured columns, phir right-hand column jo har defined SLA profile apply karta hai. <code>down</code> tunnel ke liye <code>-</code> dikhta hai kyunki measure karne ko kuch nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen transports ko VOICE (150 / 30 / 1) se compare karo:<br>
Internet 170 ms / 6 ms / 0.3 %: latency 170, 150 se upar hai, to NO.<br>
MPLS 20 ms / 40 ms / 0.05 %: jitter 40, 30 se upar hai, to NO, chahe latency shandaar ho.<br>
LTE 60 ms / 15 ms / 1 %: teeno limits ke andar ya barabar hain, to yes.<br>
Alag applications alag profiles use kar sakti hain, jaise BACKUP 500 ms, 100 ms aur 5 % ke saath: teeno transports ise meet karenge.</p></div>

<h3>Achhe thresholds kaise chunein</h3>
<ul>
<li>Application need se shuru karo (chapter 2), na ki is se ki circuits aaj kya de rahe hain.</li>
<li>Margin chhodo: agar MPLS aam taur par 20 ms dikhata hai, to 150 ms ki limit normal variation ke liye jagah deti hai.</li>
<li>Bahut strict: har path hamesha fail hoga aur fallback permanent use hoga. Bahut loose: bad paths bhi good gine jayenge aur users takleef uthayenge.</li>
<li>Har application ke liye ek nahi, kuch profiles banao (voice, video, business, bulk).</li>
</ul>

<div class="warn"><p><b>Common mistakes:</b> latency set karna lekin jitter aur loss bhool jaana; <code>Meets SLA</code> ko "path healthy hai" padhna (iska matlab sirf <b>us profile ke liye</b> healthy hai); alarm hatane ke liye profile badalna jabki circuit fix karna chahiye.</p></div>
<div class="exam"><p><b>Exam trap:</b> SLA monitor transports ko measure karta hai; SLA profile thresholds define karta hai; dono mein se koi path nahi chunta. Yeh kaam forwarding profile karta hai, dono ko use karke.</p></div>

<div class="scn"><h4>MPLS aur Internet ke beech flapping</h4><p>Ek bank branch complain karta hai ki calls har kuch minute mein ek second ke liye drop hoti hain. Logs dikhate hain ki voice MPLS se Internet aur wapas ja rahi hai. MPLS carrier mein 160 ms ke chhote micro-bursts aate hain. Evaluation mein hold time nahi tha, isliye har burst call ko move kar deta tha. Engineer violation hold aur recovery wait enable karta hai, aur 150 ms limit rakhta hai.</p><p><b>Lesson:</b> Hysteresis flapping rokta hai. Yeh SLA loose karne se behtar hai.</p></div>

<div class="iv"><p class="q">"SLA monitor aur SLA profile mein kya fark hai?"</p><p>Monitor probes se har transport ki latency, jitter aur loss measure karta hai. Profile un limits ka set hai jo application accept karti hai. Transport profile meet karta hai agar teeno measured values limits ke andar hon. Yeh bhi jodo ki hysteresis flapping rokta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLA monitoring har tunnel ko measure karti hai; SLA profile limits set karta hai.</li>
<li>Teeno metrics limits ke kam ya barabar hone chahiye.</li>
<li>Real networks par hysteresis (hold aur wait) flapping rokta hai.</li>
<li>Use karo <code>show orgs org Acme sd-wan sla-monitor status</code> aur <code>show orgs org-services Acme sd-wan sla-profiles</code>.</li>
</ul></div>
`}};export{e as default};