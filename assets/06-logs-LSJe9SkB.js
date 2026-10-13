var e={id:`logs`,h:{en:`Logs: the traffic log and what it can and cannot prove`,hi:`Logs: traffic log kya saabit karta hai aur kya nahi`},body:{en:`

<p><b>The traffic log is the notebook.</b> Counters tell you that something was dropped, sessions tell you what is alive, and the log tells you what <i>has happened</i>: which rule allowed or denied a flow, which application it was, and how it ended. It is the evidence you attach to a ticket and the data that security teams search after an incident.</p>

<h3>Analogy: the visitor book at reception</h3>
<p>Reception writes a line for each visitor: time, name, who they met, when they left. The book does not show who is in the building right now (that is the session table) and it only has a line if the receptionist was asked to write one. PAN-OS logging has the same two properties: entries are written by <b>rules that have logging enabled</b>, and most are written when the session <b>ends</b>.</p>

<h3>Log types</h3>
<table class="cmp"><tr><th>Log</th><th>What it records</th></tr>
<tr><td>Traffic</td><td>Every logged session: rule, application, zones, addresses, action, end reason</td></tr>
<tr><td>Threat</td><td>Security profile hits: vulnerability, antivirus, spyware, URL events</td></tr>
<tr><td>Decryption</td><td>TLS and SSH decryption events and errors (see pan-decrypt)</td></tr>
<tr><td>System</td><td>Firewall events: interface changes, HA, commit results</td></tr>
<tr><td>Config</td><td>Who changed what, when, from where</td></tr>
<tr><td>User-ID</td><td>IP to user mapping events (see pan-userid)</td></tr>
</table>
<p>The lab implements the traffic log. The others are the same idea with different fields.</p>

<h3>Reading show log traffic</h3>
<p>After the DNS fix, the lab firewall logs the session. Each entry uses three lines.</p>
<pre class="out">PA1&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:43:43 dns             dmz             57160     10.0.2.10
<span class="hl">DMZ-Out         allow           untrust         53        8.8.8.8</span>
                                                aged-out</pre>
<ul>
<li><b>Time, App, From (zone), Src Port, Source</b>: when it was logged, which application, and where it came from.</li>
<li><b>Rule, Action, To (zone), Dst Port, Destination</b>: the rule that decided, allow or deny, and the destination. The rule name here is the same as the <code>rule</code> line in the session detail.</li>
<li><b>SrcUser, DstUser</b>: the mapped user names. Empty here because no User-ID mapping exists for this IP.</li>
<li><b>End Reason</b>: why the session ended. <code>aged-out</code> means the session timed out after inactivity. Other reasons seen on real firewalls include <code>tcp-fin</code>, <code>tcp-rst-from-client</code>, <code>tcp-rst-from-server</code> and <code>policy-deny</code>.</li>
</ul>
<p>The log timestamp in the lab shows the time of the session end entry. Keep in mind that on a real firewall the log entry is written when the session ends (or at the start if you enable log at session start), so a long-lived connection has no entry until it finishes.</p>

<h3>Why the log can be empty</h3>
<p>This is the most important idea in the chapter. Three common reasons for a missing entry even though traffic was dropped:</p>
<ol>
<li><b>The deciding rule does not log.</b> The predefined <code>interzone-default</code> and <code>intrazone-default</code> rules do not write traffic logs unless you override them. In the DNS ticket the first attempt was denied by interzone-default and left no log line. Only after the allow rule was added did a line appear.</li>
<li><b>Log at session end only.</b> The entry appears after the session closes.</li>
<li><b>The packet never arrived.</b> A routing or far-end problem upstream produces no log either.</li>
</ol>
<p>The remedy for the first one is a deliberate, explicit deny rule at the bottom with logging enabled, often called a <b>cleanup rule</b>. In the lab you can add logging to an existing rule with <code>set rulebase security rules Allow-Out log-end yes</code> and commit.</p>
<pre class="code">configure
set rulebase security rules Allow-Out log-end yes
commit</pre>

<div class="eg"><p><b>Worked example.</b> Security asks "did anyone from the DMZ reach the internet on port 22 last week?". The default rule denies it silently, so the log cannot answer. After the team adds a logged cleanup rule at the bottom, a denied attempt appears with the cleanup rule name, the source and the application. A week later the same question has an answer.</p></div>

<h3>Searching logs well</h3>
<p>On a real firewall the log filter uses expressions such as <code>( addr.src in 10.0.2.10 ) and ( action eq deny )</code>. Reference only: the lab shows the latest entries without a query language. The working habit is the same: filter by the exact source, destination and a short time window, then read rule, application and end reason together.</p>

<div class="warn"><p><b>Common mistake.</b> Using "no log" as proof of "no traffic". It proves only that no logging rule decided it or that the session has not ended. Use counters and sessions to confirm.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that traffic is logged at session end by default and at session start only if enabled, that the predefined default rules do not log, and that a cleanup rule with logging is the standard remedy.</p></div>

<div class="scn"><h4>The week nobody could prove anything</h4><p>After a suspected leak, the team wanted to know every blocked outbound attempt. The firewall showed only allowed traffic, because denials were made by the predefined rule which does not log. The team added a logged deny rule at the bottom. From that day every blocked attempt had a record with source, destination, application and rule name.</p><p><b>Lesson:</b> Enable logging where the decisions are made, before you need the evidence.</p></div>

<div class="iv"><p class="q">"Why might a denied connection not appear in the traffic log?"</p><p>Because the denial came from the predefined interzone-default rule, which does not log unless overridden, or because the entry is only written at session end. I would confirm with the delta global counters and the test command, and I would add an explicit logged cleanup rule so that future denials are recorded.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The traffic log shows rule, application, action and end reason for logged sessions.</li>
<li>Entries are written at session end unless log at session start is enabled.</li>
<li>Predefined default rules do not log; add a logged cleanup rule.</li>
<li>End reason aged-out means a timeout after inactivity.</li>
<li>Never treat an empty log as proof of no traffic.</li>
</ul></div>

`,hi:`

<p><b>Traffic log notebook hai.</b> Counters batate hain ki kuch drop hua, sessions batate hain kya zinda hai, aur log batata hai <i>kya ho chuka hai</i>: kaunsi rule ne flow allow ya deny kiya, kaunsi application thi, aur kaise khatam hua. Yeh woh evidence hai jo aap ticket mein lagate ho aur woh data jo security teams incident ke baad search karti hain.</p>

<h3>Analogy: reception ki visitor book</h3>
<p>Reception har visitor ki ek line likhta hai: time, naam, kisse mile, kab gaye. Book yeh nahi batati ki abhi building mein kaun hai (woh session table hai) aur line tabhi hoti hai jab receptionist se likhne ko kaha gaya ho. PAN-OS logging ki yehi do properties hain: entries woh <b>rules likhti hain jinpar logging enabled hai</b>, aur zyadatar session <b>khatam</b> hone par likhi jaati hain.</p>

<h3>Log types</h3>
<table class="cmp"><tr><th>Log</th><th>Kya record karta hai</th></tr>
<tr><td>Traffic</td><td>Har logged session: rule, application, zones, addresses, action, end reason</td></tr>
<tr><td>Threat</td><td>Security profile hits: vulnerability, antivirus, spyware, URL events</td></tr>
<tr><td>Decryption</td><td>TLS aur SSH decryption events aur errors (pan-decrypt dekho)</td></tr>
<tr><td>System</td><td>Firewall events: interface changes, HA, commit results</td></tr>
<tr><td>Config</td><td>Kisne kya, kab, kahan se badla</td></tr>
<tr><td>User-ID</td><td>IP se user mapping events (pan-userid dekho)</td></tr>
</table>
<p>Lab traffic log implement karta hai. Baaki wahi idea hain, alag fields ke saath.</p>

<h3>show log traffic padhna</h3>
<p>DNS fix ke baad lab firewall session log karta hai. Har entry teen lines leti hai.</p>
<pre class="out">PA1&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:43:43 dns             dmz             57160     10.0.2.10
<span class="hl">DMZ-Out         allow           untrust         53        8.8.8.8</span>
                                                aged-out</pre>
<ul>
<li><b>Time, App, From (zone), Src Port, Source</b>: kab log hua, kaunsi application, aur kahan se aaya.</li>
<li><b>Rule, Action, To (zone), Dst Port, Destination</b>: decide karne waali rule, allow ya deny, aur destination. Yahan rule ka naam session detail ki <code>rule</code> line jaisa hi hai.</li>
<li><b>SrcUser, DstUser</b>: mapped user names. Yahan khaali hain kyunki is IP ka koi User-ID mapping nahi.</li>
<li><b>End Reason</b>: session kyun khatam hua. <code>aged-out</code> matlab inactivity ke baad timeout. Real firewalls par aur reasons dikhte hain jaise <code>tcp-fin</code>, <code>tcp-rst-from-client</code>, <code>tcp-rst-from-server</code> aur <code>policy-deny</code>.</li>
</ul>
<p>Lab mein log ka timestamp session end entry ka time dikhata hai. Yaad rakho ki real firewall par entry session khatam hone par likhi jaati hai (ya start par, agar log at session start enable ho), isliye lambe chalne waale connection ki entry khatam hone tak nahi hoti.</p>

<h3>Log khaali kyun ho sakta hai</h3>
<p>Is chapter ka sabse zaroori idea yahi hai. Traffic drop hone ke baad bhi entry na milne ke teen aam kaaran:</p>
<ol>
<li><b>Decide karne waali rule log nahi karti.</b> Predefined <code>interzone-default</code> aur <code>intrazone-default</code> rules traffic logs nahi likhtin jab tak aap override na karo. DNS ticket mein pehla attempt interzone-default se deny hua aur koi log line nahi bani. Allow rule jodne ke baad hi line aayi.</li>
<li><b>Sirf session end par log.</b> Entry session band hone ke baad aati hai.</li>
<li><b>Packet pahuncha hi nahi.</b> Upstream routing ya far-end problem se bhi koi log nahi banta.</li>
</ol>
<p>Pehle kaaran ka ilaaj bottom par jaanbujhkar, logging ke saath explicit deny rule hai, jise aksar <b>cleanup rule</b> kehte hain. Lab mein existing rule par logging <code>set rulebase security rules Allow-Out log-end yes</code> aur commit se jod sakte ho.</p>
<pre class="code">configure
set rulebase security rules Allow-Out log-end yes
commit</pre>

<div class="eg"><p><b>Worked example.</b> Security poochti hai "pichhle hafte DMZ se kisi ne port 22 par internet tak pahunchne ki koshish ki?". Default rule chupchaap deny karti hai, isliye log jawab nahi de sakta. Team ke bottom par logged cleanup rule jodne ke baad denied attempt cleanup rule ke naam, source aur application ke saath dikhta hai. Ek hafte baad wahi sawaal ka jawab milta hai.</p></div>

<h3>Logs ko achhe se search karna</h3>
<p>Real firewall par log filter <code>( addr.src in 10.0.2.10 ) and ( action eq deny )</code> jaise expressions use karta hai. Sirf reference: lab query language ke bina latest entries dikhata hai. Kaam ki aadat wahi hai: exact source, destination aur chhoti time window se filter karo, phir rule, application aur end reason ek saath padho.</p>

<div class="warn"><p><b>Common mistake.</b> "Log nahi hai" ko "traffic nahi tha" ka saboot maan lena. Yeh sirf yeh saabit karta hai ki koi logging rule ne decide nahi kiya ya session abhi khatam nahi hua. Counters aur sessions se confirm karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki traffic by default session end par log hota hai aur session start par tabhi jab enable ho, predefined default rules log nahi karti, aur logged cleanup rule standard ilaaj hai.</p></div>

<div class="scn"><h4>Woh hafta jab koi kuch saabit nahi kar paya</h4><p>Shak-e-leak ke baad team har blocked outbound attempt jaanna chahti thi. Firewall sirf allowed traffic dikha raha tha, kyunki denials predefined rule se ho rahe the jo log nahi karti. Team ne bottom par logged deny rule jodi. Us din se har blocked attempt ka source, destination, application aur rule name ke saath record tha.</p><p><b>Lesson:</b> Logging wahan enable karo jahan decisions hote hain, evidence ki zaroorat padne se pehle.</p></div>

<div class="iv"><p class="q">"Denied connection traffic log mein kyun nahi dikh sakta?"</p><p>Kyunki denial predefined interzone-default rule se hua jo override na ho to log nahi karti, ya entry sirf session end par likhi jaati hai. Main delta global counters aur test command se confirm karta hoon, aur ek explicit logged cleanup rule jodta hoon taaki aage ke denials record hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traffic log logged sessions ke liye rule, application, action aur end reason dikhata hai.</li>
<li>Entries session end par likhi jaati hain jab tak log at session start enable na ho.</li>
<li>Predefined default rules log nahi karti; logged cleanup rule jodo.</li>
<li>End reason aged-out matlab inactivity ke baad timeout.</li>
<li>Khaali log ko kabhi no traffic ka saboot mat maano.</li>
</ul></div>

`}};export{e as default};