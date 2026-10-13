var e={id:`actions-logging`,h:{en:`Actions, logging and the evidence you leave behind`,hi:`Actions, logging aur woh saboot jo aap chhodte ho`},body:{en:`
<p>Every rule ends in an <b>action</b>, and every decision should leave <b>evidence</b>. An action without a log is a guess later. Think of a shop CCTV: the door lock (action) keeps people out, the camera (log) lets you explain afterwards who tried.</p>
<h3>The actions</h3>
<table class="cmp"><tr><th>Action</th><th>What the firewall does</th></tr><tr><td><code>allow</code></td><td>permits the traffic and creates a session</td></tr><tr><td><code>deny</code></td><td>blocks the traffic using the default deny behaviour of the application (for most applications a silent drop, for some a reset)</td></tr><tr><td><code>drop</code></td><td>silently discards; no reset is sent, optionally an ICMP unreachable for the client</td></tr><tr><td><code>reset-client</code></td><td>discards and sends a TCP reset to the client side</td></tr><tr><td><code>reset-server</code></td><td>sends a TCP reset to the server side</td></tr><tr><td><code>reset-both</code></td><td>sends a reset to both sides</td></tr></table>
<p>A <code>drop</code> keeps an attacker guessing but makes a legitimate user wait for a timeout. A reset ends a legitimate connection quickly, which is friendlier for internal users, but tells an outside scanner that a firewall is there. Choose by audience: <code>drop</code> or <code>deny</code> towards the internet, reset towards the inside.</p>
<h3>What is logged and when</h3>
<ul><li><b>log-end yes</b> (default for rules you create): one log entry when the session ends or is denied. Includes bytes, duration and the end reason.</li><li><b>log-start yes</b>: an additional entry when the session starts. Use it only for troubleshooting or long-lived sessions; it doubles the log volume.</li><li><b>Log forwarding</b>: a log forwarding profile sends the entries to syslog, email or Panorama.</li><li><b>Predefined rules</b> do not log by default. Override them to log if you need to see what falls through.</li></ul>
<p>This is the traffic log after the ping and web browsing from the lab. Read it as one line pair per session: application, zones, source, rule, action, destination, and the end reason.</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:58:03 web-browsing    trust           64251     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out

2026/10/02 03:58:03 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span>
                                                aged-out</pre>
<p>When an action is deny, the end reason in the log is the key detail. In the rule-order ticket above you saw <code>policy-deny</code> for the blocked SSH attempt and <code>aged-out</code> for sessions that ended by timeout. Another quick indicator is the global drop counter:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<p>The counter <code>flow_policy_deny</code> counts sessions denied by policy. The <b>delta</b> option shows only what changed since the last time you ran it, which is why you run it once to set a baseline and again after the test.</p>
<h3>Deny rules deserve logs</h3>
<p>A common best practice is a final explicit rule "Deny-All-Log" from <code>any</code> to <code>any</code>, application <code>any</code>, action deny, with logging on, placed below all allows. Because the predefined rules do not log, this rule is how the SOC sees what was blocked. Keep in mind that a final explicit deny also catches intrazone traffic, which is normally allowed; limit it to an <code>interzone</code> rule type if you do not want that.</p>
<div class="note"><p><b>Reference only (not run in the simulator).</b> The simulator lets you set <code>log-start</code> and <code>log-end</code> on a rule but it does not implement log forwarding profiles. In real PAN-OS you attach one with <code>set rulebase security rules Allow-Out log-setting &lt;profile-name&gt;</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Turning on <code>log-start</code> on every rule. It floods the log and the management plane. Use it temporarily.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which rules log by default? Rules you create log at session <b>end</b>. The two predefined rules do <b>not</b> log. Traffic denied by <code>interzone-default</code> therefore leaves no traffic-log entry, only a global counter.</p></div>
<div class="scn"><h4>The block nobody could see</h4><p>Users reported that a new SaaS tool did not load. The traffic log had nothing for it. The traffic was falling to <code>interzone-default</code>, which does not log. A temporary rule "Catch-Log" at the bottom, deny with logging, made the next attempt visible with the real application name. The engineer then added that application to the right rule and kept the catch rule for ongoing visibility.</p><p><b>Lesson:</b> if a block leaves no log, add a logging catch rule and look again.</p></div>
<div class="iv"><p class="q">"What is the difference between deny and drop?"</p><p>Both stop the traffic. Deny applies the default deny action defined for the identified application (usually a silent discard, sometimes a reset). Drop always discards silently without sending a reset. Reset-client, reset-server and reset-both send TCP resets. I would mention logging at session end and that predefined rules do not log by default.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Actions: allow, deny, drop and the three reset options.</li><li>Your rules log at session end by default; predefined rules do not log.</li><li><code>show log traffic</code> shows rule, action and end reason.</li><li><code>flow_policy_deny</code> counts policy denials.</li></ul></div>
`,hi:`
<p>Har rule ek <b>action</b> par khatam hoti hai, aur har decision <b>saboot</b> chhodna chahiye. Log ke bina action baad mein andaza ban jaata hai. Dukaan ka CCTV socho: darwaze ka taala (action) logon ko bahar rakhta hai, camera (log) baad mein bata deta hai ki kisne koshish ki.</p>
<h3>Actions</h3>
<table class="cmp"><tr><th>Action</th><th>Firewall kya karta hai</th></tr><tr><td><code>allow</code></td><td>traffic permit karta hai aur session banata hai</td></tr><tr><td><code>deny</code></td><td>application ke default deny behaviour se traffic block karta hai (zyadatar applications ke liye silent drop, kuch ke liye reset)</td></tr><tr><td><code>drop</code></td><td>chupchaap discard; reset nahi bheja jaata, optional client ko ICMP unreachable</td></tr><tr><td><code>reset-client</code></td><td>discard karta hai aur client side ko TCP reset bhejta hai</td></tr><tr><td><code>reset-server</code></td><td>server side ko TCP reset bhejta hai</td></tr><tr><td><code>reset-both</code></td><td>dono sides ko reset bhejta hai</td></tr></table>
<p><code>drop</code> attacker ko andhere mein rakhta hai lekin legitimate user ko timeout ka intezaar karata hai. Reset legitimate connection jaldi khatam karta hai, jo internal users ke liye behtar hai, lekin bahar ke scanner ko batata hai ki firewall hai. Audience ke hisaab se chuno: internet ki taraf <code>drop</code> ya <code>deny</code>, andar ki taraf reset.</p>
<h3>Kya aur kab log hota hai</h3>
<ul><li><b>log-end yes</b> (aapki banayi rules ka default): session khatam ya deny hone par ek log entry. Isme bytes, duration aur end reason hota hai.</li><li><b>log-start yes</b>: session shuru hone par ek aur entry. Sirf troubleshooting ya lambe sessions ke liye use karo; log volume double ho jaata hai.</li><li><b>Log forwarding</b>: log forwarding profile entries ko syslog, email ya Panorama bhejta hai.</li><li><b>Predefined rules</b> default se log nahi karti. Jo kuch neeche gir jaata hai woh dekhna ho to unhe log karne ke liye override karo.</li></ul>
<p>Yeh lab ke ping aur web browsing ke baad ka traffic log hai. Ise har session ki line-jodi ki tarah padho: application, zones, source, rule, action, destination, aur end reason.</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:58:03 web-browsing    trust           64251     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out

2026/10/02 03:58:03 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span>
                                                aged-out</pre>
<p>Action deny ho to log mein end reason sabse zaroori detail hai. Upar rule-order ticket mein aapne blocked SSH attempt ke liye <code>policy-deny</code> dekha aur timeout se khatam hue sessions ke liye <code>aged-out</code>. Ek aur tez indicator global drop counter hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<p>Counter <code>flow_policy_deny</code> policy se deny hue sessions ginta hai. <b>delta</b> option sirf wahi dikhata hai jo pichhli baar chalane ke baad badla, isliye ek baar baseline ke liye chalate hain aur test ke baad dobara.</p>
<h3>Deny rules ko log chahiye</h3>
<p>Ek aam best practice hai aakhri explicit rule "Deny-All-Log": <code>any</code> se <code>any</code>, application <code>any</code>, action deny, logging on, saare allows ke neeche. Predefined rules log nahi karti, isliye SOC yahi rule se dekhta hai ki kya block hua. Yaad rakho ki aakhri explicit deny intrazone traffic ko bhi pakadta hai jo normally allowed hota hai; agar yeh nahi chahiye to use <code>interzone</code> rule type tak seemit karo.</p>
<div class="note"><p><b>Sirf reference (simulator mein run nahi).</b> Simulator rule par <code>log-start</code> aur <code>log-end</code> set karne deta hai lekin log forwarding profiles implement nahi karta. Asli PAN-OS mein aap <code>set rulebase security rules Allow-Out log-setting &lt;profile-name&gt;</code> se ek lagate ho.</p></div>
<div class="warn"><p><b>Common mistake.</b> Har rule par <code>log-start</code> on kar dena. Isse log aur management plane par baadh aa jaati hai. Ise temporarily use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsi rules default se log karti hain? Aapki banayi rules session <b>end</b> par log karti hain. Do predefined rules log <b>nahi</b> karti. Isliye <code>interzone-default</code> se deny hua traffic traffic-log mein entry nahi chhodta, sirf global counter badhta hai.</p></div>
<div class="scn"><h4>Woh block jo kisi ko dikha nahi</h4><p>Users ne bataya ki ek naya SaaS tool load nahi ho raha. Traffic log mein uska kuch nahi tha. Traffic <code>interzone-default</code> par gir raha tha, jo log nahi karti. Neeche ek temporary rule "Catch-Log", deny with logging, ne agli koshish asli application naam ke saath dikha di. Engineer ne woh application sahi rule mein jodi aur chal rahi visibility ke liye catch rule rakhi.</p><p><b>Lesson:</b> block ka log na ho to logging wali catch rule lagao aur dobara dekho.</p></div>
<div class="iv"><p class="q">"deny aur drop mein kya difference hai?"</p><p>Dono traffic rokte hain. Deny pehchane hue application ke liye defined default deny action lagu karta hai (aam taur par silent discard, kabhi reset). Drop hamesha chupchaap discard karta hai, reset nahi bhejta. Reset-client, reset-server aur reset-both TCP reset bhejte hain. Main session end par logging aur yeh bhi bataunga ki predefined rules default se log nahi karti.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Actions: allow, deny, drop aur teen reset options.</li><li>Aapki rules default se session end par log karti hain; predefined rules log nahi karti.</li><li><code>show log traffic</code> rule, action aur end reason dikhata hai.</li><li><code>flow_policy_deny</code> policy denials ginta hai.</li></ul></div>
`}};export{e as default};