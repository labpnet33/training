var e={id:`logging`,h:{en:`Logging options on rules`,hi:`Rules par logging options`},body:{en:`
<p>A rule that decides a connection but leaves no record is hard to defend and hard to debug. Every rule has a <b>logging</b> option that sets how much is recorded when the rule matches. This chapter explains the five levels, the default, how a Continue rule changes defaults for the rules below it, and what Discard and Refuse look like in the logs and to the client.</p>

<h3>Analogy: the guard's notebook</h3>
<p>The guard can write nothing, scribble on a whiteboard that is wiped at night, write in the permanent notebook, write only the important events, or write and also ring the manager. Each is a different log level, and the right choice depends on how much the entry matters and how many entries there will be.</p>

<h3>The five log levels</h3>
<table class="cmp"><tr><th>Level</th><th>What happens</th><th>Typical use</th></tr>
<tr><td><b>None</b></td><td>Nothing is recorded</td><td>Very noisy traffic you do not need</td></tr>
<tr><td><b>Transient</b></td><td>Shown in current events, not stored</td><td>Live troubleshooting without filling storage</td></tr>
<tr><td><b>Stored</b></td><td>Saved on the log server</td><td>Normal business traffic</td></tr>
<tr><td><b>Essential</b></td><td>Saved in a reduced form for high-volume rules</td><td>Busy Allow rules where full detail is not needed</td></tr>
<tr><td><b>Alert</b></td><td>Stored and also triggers an alert</td><td>Rules that should never match, such as a forbidden service</td></tr>
</table>
<p>Check the documentation for your NGFW version for the exact definition of Essential, because the amount of detail kept can vary. In this simulator the point is the difference between not recorded, shown briefly, stored and alerting.</p>

<h3>The default: Stored</h3>
<p>If a rule's logging option is left at its inherited setting and no Continue rule above it has set anything, the level is <b>Stored</b>. That is why a rule you never configured still appears in the Logs page.</p>

<h3>Continue sets defaults for the rules below</h3>
<p>A <b>Continue</b> rule does not decide the connection. When it matches, it applies its options (for example log level Transient) as defaults and matching goes on to the next rule. A rule below that leaves logging as inherited takes the Continue rule's level instead of Stored.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Continue sets the default log level">
<rect x="20" y="20" width="360" height="34" rx="6" fill="#fde68a"/><text x="30" y="42" class="svg-ink" font-size="12">1  net-staff to any  any  Continue  log Transient</text>
<rect x="20" y="62" width="360" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="84" class="svg-ink" font-size="12">2  net-staff to any  HTTPS  Allow  log inherit</text>
<rect x="20" y="104" width="360" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="126" class="svg-ink" font-size="12">3  any to any  any  Discard  log Alert</text>
<line x1="400" y1="37" x2="400" y2="79" stroke="#64748b" stroke-width="2"/><text x="415" y="62" class="svg-accent" font-size="12">default Transient</text>
<text x="415" y="84" class="svg-muted" font-size="12">rule 2 logs as Transient</text>
<text x="415" y="126" class="svg-muted" font-size="12">rule 3 sets its own: Alert</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Without rule 1, rule 2 would log as Stored</text>
</svg><p class="cap">A Continue rule passes its log level down to rules that inherit. A rule that sets its own level ignores the default.</p></div>

<h3>Discard versus Refuse: logs and client</h3>
<p>Both actions stop the connection, and both are logged with the rule that matched. The difference is what the client experiences.</p>
<table class="cmp"><tr><th></th><th>Discard</th><th>Refuse</th></tr>
<tr><td>Reply to client</td><td>None (silent)</td><td>TCP reset or unreachable message</td></tr>
<tr><td>Client sees</td><td>Long wait, then timeout</td><td>Immediate failure</td></tr>
<tr><td>Log action</td><td>Discard</td><td>Refuse</td></tr>
<tr><td>Good for</td><td>Internet-facing blocks, hides the firewall</td><td>Internal users, so apps fail fast and helpdesk calls drop</td></tr>
</table>
<p>The Log action column can show values such as Allow, Discard, Permit, Refuse and Terminate. Permit and Terminate come from other engine functions such as inspection, so a log line with Terminate is not an Access rule Allow or Discard.</p>

<div class="eg"><p><b>Worked example.</b> A Discard for Telnet from the staff LAN is set to Alert. STAFF-PC tries Telnet to 203.0.113.80. The engine drops it silently; STAFF-PC waits and times out. The Logs page shows a Discard entry with the rule number, and the alert list shows a new alert because the level is Alert. If the same rule used Refuse, STAFF-PC would see connection refused at once, and the log would say Refuse.</p></div>
<pre class="out">Time        Src          Dst            Service  Action   Rule  Level
10:42:07    10.1.1.10    203.0.113.80   Telnet   Discard  T2    Alert
10:42:31    10.1.1.10    172.16.20.20   HTTPS    Allow    2     Stored
<span class="hl">10:43:02    10.1.1.10    172.16.20.20   SSH      Refuse   3.2   Stored</span></pre>

<div class="warn"><p><b>Common mistake.</b> Setting Alert on a busy rule. Hundreds of alerts per hour teach people to ignore alerts. Use Alert for events that should be rare and meaningful. Another mistake is setting None on a block rule and then having no evidence when someone asks why traffic failed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Continue is not a "log only" action; it only sets defaults and matching goes on. Default level is Stored. Transient is shown but not stored, so it will be gone later.</p></div>

<div class="scn"><h4>Where did the drop go?</h4><p>A user's connection to a partner server failed and the helpdesk asked for the log line. The admin searched the Logs page and found nothing. The matching rule was a Discard with logging set to None, written years ago to reduce noise. The admin changed it to Stored, installed, asked the user to retry, and the entry appeared with the rule number. The team then reviewed other None rules.</p><p><b>Lesson:</b> never silence a block rule; you will want that evidence the day something breaks.</p></div>
<div class="iv"><p class="q">"What is the difference between Discard and Refuse, and which would you use on the internet side?"</p><p>Discard is silent, Refuse answers with a reset or unreachable. On the internet side use Discard so the firewall reveals less and scans take longer; for internal users Refuse gives fast failure. Both are logged with the rule number.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log levels: None, Transient, Stored, Essential, Alert.</li>
<li>Default is Stored unless a Continue rule above sets another level.</li>
<li>Continue sets defaults and matching goes on; it does not end a connection.</li>
<li>Discard is silent; Refuse tells the client. Both are logged with the rule.</li>
<li>Use Alert sparingly and never hide a block rule with None.</li>
</ul></div>
`,hi:`
<p>Jo rule connection decide kare par koi record na chhode use defend karna aur debug karna dono mushkil hai. Har rule ka ek <b>logging</b> option hota hai jo tay karta hai ki rule match hone par kitna record hoga. Yeh chapter paanch levels, default, Continue rule neeche ke rules ke defaults kaise badalta hai, aur Discard aur Refuse logs mein aur client ko kaise dikhte hain, yeh samjhata hai.</p>

<h3>Analogy: guard ki notebook</h3>
<p>Guard kuch likh na sake, ya whiteboard par scribble kare jo raat ko mita diya jata hai, ya permanent notebook mein likhe, ya sirf zaroori events likhe, ya likhe aur manager ko bhi ghanti bajaye. Har ek alag log level hai, aur sahi choice is par hai ki entry kitni important hai aur kitni entries aayengi.</p>

<h3>Paanch log levels</h3>
<table class="cmp"><tr><th>Level</th><th>Kya hota hai</th><th>Typical use</th></tr>
<tr><td><b>None</b></td><td>Kuch record nahi hota</td><td>Bahut noisy traffic jo chahiye nahi</td></tr>
<tr><td><b>Transient</b></td><td>Current events mein dikhta hai, store nahi hota</td><td>Storage bhare bina live troubleshooting</td></tr>
<tr><td><b>Stored</b></td><td>Log server par save hota hai</td><td>Normal business traffic</td></tr>
<tr><td><b>Essential</b></td><td>High-volume rules ke liye reduced form mein save hota hai</td><td>Busy Allow rules jahan poori detail nahi chahiye</td></tr>
<tr><td><b>Alert</b></td><td>Stored aur alert bhi trigger karta hai</td><td>Aise rules jo kabhi match nahi hone chahiye, jaise forbidden service</td></tr>
</table>
<p>Essential ki exact definition ke liye apne NGFW version ki documentation check karo, kyunki kitni detail rakhi jati hai woh badal sakti hai. Simulator mein point yeh hai: record nahi hua, thodi der dikha, store hua, aur alert gaya.</p>

<h3>Default: Stored</h3>
<p>Agar rule ka logging option inherited par hai aur upar ke kisi Continue rule ne kuch set nahi kiya, to level <b>Stored</b> hota hai. Isiliye jis rule ko aapne kabhi configure nahi kiya woh bhi Logs page par dikhta hai.</p>

<h3>Continue neeche ke rules ke liye defaults set karta hai</h3>
<p><b>Continue</b> rule connection ko decide nahi karta. Match hone par woh apne options (jaise log level Transient) defaults ki tarah lagata hai aur matching agle rule par jati hai. Neeche ka jo rule logging inherited chhodta hai woh Stored ki jagah Continue rule ka level leta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Continue default log level set karta hai">
<rect x="20" y="20" width="360" height="34" rx="6" fill="#fde68a"/><text x="30" y="42" class="svg-ink" font-size="12">1  net-staff to any  any  Continue  log Transient</text>
<rect x="20" y="62" width="360" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="84" class="svg-ink" font-size="12">2  net-staff to any  HTTPS  Allow  log inherit</text>
<rect x="20" y="104" width="360" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="126" class="svg-ink" font-size="12">3  any to any  any  Discard  log Alert</text>
<line x1="400" y1="37" x2="400" y2="79" stroke="#64748b" stroke-width="2"/><text x="415" y="62" class="svg-accent" font-size="12">default Transient</text>
<text x="415" y="84" class="svg-muted" font-size="12">rule 2 Transient log karta hai</text>
<text x="415" y="126" class="svg-muted" font-size="12">rule 3 apna set karta hai: Alert</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Rule 1 ke bina rule 2 Stored log karta</text>
</svg><p class="cap">Continue rule apna log level inherit karne wale rules ko deta hai. Jo rule apna level set kare woh default ignore karta hai.</p></div>

<h3>Discard vs Refuse: logs aur client</h3>
<p>Dono actions connection rokte hain, aur dono match hue rule ke saath log hote hain. Fark yeh hai ki client ko kya dikhta hai.</p>
<table class="cmp"><tr><th></th><th>Discard</th><th>Refuse</th></tr>
<tr><td>Client ko reply</td><td>Koi nahi (silent)</td><td>TCP reset ya unreachable message</td></tr>
<tr><td>Client ko dikhta hai</td><td>Lamba wait, phir timeout</td><td>Turant failure</td></tr>
<tr><td>Log action</td><td>Discard</td><td>Refuse</td></tr>
<tr><td>Kahan accha</td><td>Internet-facing blocks, firewall chhupata hai</td><td>Internal users, apps jaldi fail hote hain, helpdesk calls kam</td></tr>
</table>
<p>Log action column mein Allow, Discard, Permit, Refuse aur Terminate jaise values dikh sakte hain. Permit aur Terminate engine ke dusre functions jaise inspection se aate hain, isliye Terminate wali log line Access rule ka Allow ya Discard nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> Staff LAN se Telnet ka Discard Alert par set hai. STAFF-PC 203.0.113.80 par Telnet try karta hai. Engine silently drop karta hai; STAFF-PC wait karke timeout hota hai. Logs page par rule number ke saath Discard entry dikhti hai, aur alert list mein naya alert aata hai kyunki level Alert hai. Agar wahi rule Refuse hota to STAFF-PC ko turant connection refused dikhta, aur log mein Refuse likha hota.</p></div>
<pre class="out">Time        Src          Dst            Service  Action   Rule  Level
10:42:07    10.1.1.10    203.0.113.80   Telnet   Discard  T2    Alert
10:42:31    10.1.1.10    172.16.20.20   HTTPS    Allow    2     Stored
<span class="hl">10:43:02    10.1.1.10    172.16.20.20   SSH      Refuse   3.2   Stored</span></pre>

<div class="warn"><p><b>Common mistake.</b> Busy rule par Alert lagana. Ek ghante mein sainkdon alerts se log alerts ignore karna seekh jaate hain. Alert un events ke liye rakho jo rare aur meaningful hon. Doosri galti: block rule par None lagana aur jab koi poochhe ki traffic kyun fail hui to evidence na hona.</p></div>
<div class="exam"><p><b>Exam trap.</b> Continue "log only" action nahi hai; woh sirf defaults set karta hai aur matching aage jati hai. Default level Stored hai. Transient dikhta hai par store nahi hota, to baad mein gayab ho jayega.</p></div>

<div class="scn"><h4>Drop kahan gaya?</h4><p>Ek user ka partner server se connection fail hua aur helpdesk ne log line maangi. Admin ne Logs page search kiya aur kuch nahi mila. Matching rule Discard tha jiska logging None tha, saalon pehle noise kam karne ke liye likha gaya. Admin ne use Stored kiya, install kiya, user se retry karwaya, aur rule number ke saath entry aa gayi. Team ne baaki None rules ka review kiya.</p><p><b>Lesson:</b> block rule ko kabhi silent mat karo; jis din kuch toote us din woh evidence chahiye hoga.</p></div>
<div class="iv"><p class="q">"Discard aur Refuse mein kya fark hai, aur internet side par kaunsa use karoge?"</p><p>Discard silent hai, Refuse reset ya unreachable se jawab deta hai. Internet side par Discard use karo taaki firewall kam reveal kare aur scans slow ho; internal users ke liye Refuse fast failure deta hai. Dono rule number ke saath log hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log levels: None, Transient, Stored, Essential, Alert.</li>
<li>Default Stored hai jab tak upar ka Continue rule dusra level set na kare.</li>
<li>Continue defaults set karta hai aur matching aage jati hai; connection end nahi karta.</li>
<li>Discard silent hai; Refuse client ko batata hai. Dono rule ke saath log hote hain.</li>
<li>Alert kam use karo aur block rule ko None se kabhi mat chhupao.</li>
</ul></div>
`}};export{e as default};