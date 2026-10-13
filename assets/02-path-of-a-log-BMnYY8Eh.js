var e={id:`path-of-a-log`,h:{en:`The path of a log from session to Panorama`,hi:`Session se Panorama tak log ka safar`},body:{en:`
<p>Imagine a courier parcel. Someone writes the label (the firewall creates a log), a sorting rule decides which van takes it (the forwarding profile), the van needs a road (the connection to Panorama), and a warehouse must have a shelf for it (the collector). If any one of these four is missing, the parcel does not arrive, and the sender usually sees no error. That is exactly why log forwarding problems are quiet and why you need a mental map of the path.</p>

<h3>The five stages</h3>
<div class="dia"><svg viewBox="0 0 680 210" role="img" aria-label="Path of a log">
<rect x="10" y="60" width="110" height="70" rx="8" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. Session</text><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="11">matches a rule</text>
<rect x="150" y="60" width="110" height="70" rx="8" fill="#fde68a"/><text x="205" y="90" text-anchor="middle" class="svg-ink" font-size="12">2. Rule logs</text><text x="205" y="108" text-anchor="middle" class="svg-ink" font-size="11">log at end</text>
<rect x="290" y="60" width="110" height="70" rx="8" fill="#fed7aa"/><text x="345" y="90" text-anchor="middle" class="svg-ink" font-size="12">3. Profile</text><text x="345" y="108" text-anchor="middle" class="svg-ink" font-size="11">match list + filter</text>
<rect x="430" y="60" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="485" y="90" text-anchor="middle" class="svg-ink" font-size="12">4. Connection</text><text x="485" y="108" text-anchor="middle" class="svg-ink" font-size="11">firewall to Panorama</text>
<rect x="570" y="60" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="620" y="90" text-anchor="middle" class="svg-ink" font-size="12">5. Collector</text><text x="620" y="108" text-anchor="middle" class="svg-ink" font-size="11">stores the log</text>
<path d="M120 95H150M260 95H290M400 95H430M540 95H570" stroke="#475569" stroke-width="2" fill="none"/>
<text x="340" y="175" text-anchor="middle" class="svg-ink" font-size="12">If any box fails, the log waits on the firewall</text>
</svg><p class="cap">Five checks in a row. A log reaches Panorama only when every one passes.</p></div>

<ol>
<li><b>Session.</b> A user opens a web page. The firewall matches the session to a security rule and decides allow or deny.</li>
<li><b>The rule must log.</b> The rule has to write a log for that session. By default a rule logs at session end. A denied session is logged when it is denied.</li>
<li><b>The profile must select it.</b> The rule must name a log forwarding profile, and that profile must have a match list whose filter matches this log and whose destination includes Panorama.</li>
<li><b>The connection must be up.</b> The firewall must be connected to the active Panorama. This is the same management connection from the earlier modules.</li>
<li><b>A collector must exist.</b> Panorama stores the log on a log collector for the firewall's collector group. By default each firewall uses the local collector of Panorama.</li>
</ol>

<h3>What happens when a stage fails</h3>
<p>If stages 1 to 3 do not select the log, nothing is forwarded: you will see logs on the firewall but none on Panorama. If stage 4 or 5 fails after the log was selected, the log is kept on the firewall and shows up as <b>waiting to be forwarded</b>. When the path returns, it is delivered. In the lab you see this with the firewall command:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0</pre>
<p>Three counters tell the story. <b>Created</b> counts logs the firewall wrote. <b>Forwarded</b> counts the ones sent on. <b>Waiting</b> counts the ones held back because the path was not ready. If created is zero, no logs were written at all: look at the rule. If created grows but forwarded does not and waiting is zero, the profile did not select the logs. If waiting grows, the path is the problem.</p>

<div class="warn"><p><b>Honest boundary.</b> The simulator models the counters and the logic above. It does not model real TCP 3978 traffic, encryption or certificates. In real networks, check the documentation for your PAN-OS version for ports and requirements.</p></div>

<div class="scn"><h4>Created, forwarded, waiting</h4><p>An engineer sees Panorama empty for Chennai. On the Chennai firewall: created 40, forwarded 0, waiting 0. The firewall wrote logs, nothing was held back, so the log never entered the forwarding path: the rule had no forwarding profile. Had waiting been 40, the engineer would have looked at the Panorama connection instead.</p><p><b>Lesson:</b> the three counters split the five stages into two groups in one command.</p></div>

<div class="iv"><p class="q">"A firewall writes logs but Panorama shows none. How do you start?"</p><p>I run the logging status on the firewall and read created, forwarded and waiting. Waiting means a path problem (connection or collector); no waiting and no forwarding means the rule or profile is not selecting the logs. Then I check the rule's log setting, the profile and the connection in that order.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five stages: session, rule logging, profile selection, connection, collector.</li>
<li>Failures are quiet: no error reaches the user.</li>
<li>Waiting to be forwarded means the log is safe on the firewall and the path is the problem.</li>
<li>Created, forwarded and waiting counters locate the failing stage quickly.</li>
</ul></div>
`,hi:`
<p>Courier parcel socho. Koi label likhta hai (firewall log banata hai), ek sorting rule decide karta hai kaunsi van le jayegi (forwarding profile), van ko sadak chahiye (Panorama se connection), aur warehouse mein shelf honi chahiye (collector). Chaaron mein se ek bhi gayab ho to parcel nahi pahunchta, aur bhejne wale ko aksar koi error nahi dikhta. Isi liye log forwarding ki problems chupchaap hoti hain aur aapko path ka mental map chahiye.</p>

<h3>Paanch stages</h3>
<div class="dia"><svg viewBox="0 0 680 210" role="img" aria-label="Path of a log">
<rect x="10" y="60" width="110" height="70" rx="8" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. Session</text><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="11">rule se match</text>
<rect x="150" y="60" width="110" height="70" rx="8" fill="#fde68a"/><text x="205" y="90" text-anchor="middle" class="svg-ink" font-size="12">2. Rule log karta</text><text x="205" y="108" text-anchor="middle" class="svg-ink" font-size="11">log at end</text>
<rect x="290" y="60" width="110" height="70" rx="8" fill="#fed7aa"/><text x="345" y="90" text-anchor="middle" class="svg-ink" font-size="12">3. Profile</text><text x="345" y="108" text-anchor="middle" class="svg-ink" font-size="11">match list + filter</text>
<rect x="430" y="60" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="485" y="90" text-anchor="middle" class="svg-ink" font-size="12">4. Connection</text><text x="485" y="108" text-anchor="middle" class="svg-ink" font-size="11">firewall se Panorama</text>
<rect x="570" y="60" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="620" y="90" text-anchor="middle" class="svg-ink" font-size="12">5. Collector</text><text x="620" y="108" text-anchor="middle" class="svg-ink" font-size="11">log store karta</text>
<path d="M120 95H150M260 95H290M400 95H430M540 95H570" stroke="#475569" stroke-width="2" fill="none"/>
<text x="340" y="175" text-anchor="middle" class="svg-ink" font-size="12">Koi box fail ho to log firewall par wait karta hai</text>
</svg><p class="cap">Lagataar paanch checks. Log Panorama tak tabhi pahunchta hai jab har ek pass ho.</p></div>

<ol>
<li><b>Session.</b> User web page kholta hai. Firewall session ko ek security rule se match karta hai aur allow ya deny decide karta hai.</li>
<li><b>Rule ko log karna chahiye.</b> Rule us session ka log likhe. Default mein rule session end par log karta hai. Denied session deny hote hi log hota hai.</li>
<li><b>Profile ko select karna chahiye.</b> Rule ek log forwarding profile ka naam le, aur us profile mein match list ho jiska filter is log se match kare aur jiske destination mein Panorama ho.</li>
<li><b>Connection up ho.</b> Firewall active Panorama se connected ho. Ye wahi management connection hai jo pichhle modules mein dekha.</li>
<li><b>Collector ho.</b> Panorama log ko firewall ke collector group ke log collector par store karta hai. Default mein har firewall Panorama ka local collector use karta hai.</li>
</ol>

<h3>Stage fail ho to kya hota hai</h3>
<p>Agar stage 1 se 3 log ko select nahi karte, kuch forward nahi hota: firewall par logs dikhenge lekin Panorama par nahi. Agar log select hone ke baad stage 4 ya 5 fail ho, log firewall par rakha rehta hai aur <b>waiting to be forwarded</b> dikhta hai. Path wapas aate hi deliver ho jata hai. Lab mein ye firewall command se dikhta hai:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0</pre>
<p>Teen counters poori kahani batate hain. <b>Created</b> firewall ke likhe logs ginta hai. <b>Forwarded</b> aage bheje gaye logs. <b>Waiting</b> wo jo path ready na hone se roke gaye. Created zero hai to koi log likha hi nahi: rule dekho. Created badh raha hai lekin forwarded nahi aur waiting zero hai, to profile ne logs select nahi kiye. Waiting badh raha hai to path problem hai.</p>

<div class="warn"><p><b>Honest boundary.</b> Simulator counters aur upar ka logic model karta hai. Real TCP 3978 traffic, encryption ya certificates model nahi karta. Real networks mein ports aur requirements ke liye apne PAN-OS version ki documentation check karo.</p></div>

<div class="scn"><h4>Created, forwarded, waiting</h4><p>Engineer ko Chennai ke liye Panorama khaali dikhta hai. Chennai firewall par: created 40, forwarded 0, waiting 0. Firewall ne logs likhe, kuch roka nahi gaya, matlab log forwarding path mein dakhil hi nahi hua: rule par forwarding profile nahi tha. Waiting 40 hota to engineer Panorama connection dekhta.</p><p><b>Lesson:</b> teen counters ek command mein paanch stages ko do groups mein baant dete hain.</p></div>

<div class="iv"><p class="q">"Firewall logs likhta hai lekin Panorama par koi nahi dikhta. Kahan se shuru karoge?"</p><p>Firewall par logging status chalata hoon aur created, forwarded, waiting padhta hoon. Waiting ka matlab path problem (connection ya collector); waiting nahi aur forwarding bhi nahi to rule ya profile logs select nahi kar raha. Phir isi order mein rule ka log setting, profile aur connection check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch stages: session, rule logging, profile selection, connection, collector.</li>
<li>Failures chupchaap hote hain: user tak koi error nahi aata.</li>
<li>Waiting to be forwarded ka matlab log firewall par safe hai aur path problem hai.</li>
<li>Created, forwarded aur waiting counters failing stage jaldi dhoondhte hain.</li>
</ul></div>
`}};export{e as default};