var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Severity ladder">
<rect x="20" y="10" width="600" height="22" fill="#fecaca"/><text x="30" y="26" class="svg-ink" font-size="12">0 emergency   1 alert   2 critical   (system unusable, act now)</text>
<rect x="20" y="36" width="600" height="22" fill="#fed7aa"/><text x="30" y="52" class="svg-ink" font-size="12">3 error   4 warning   (something is wrong or about to be)</text>
<rect x="20" y="62" width="600" height="22" fill="#fde68a"/><text x="30" y="78" class="svg-ink" font-size="12">5 notice   (normal but important: link up/down, config change)</text>
<rect x="20" y="88" width="600" height="22" fill="#bbf7d0"/><text x="30" y="104" class="svg-ink" font-size="12">6 informational   (routine information)</text>
<rect x="20" y="114" width="600" height="22" fill="#bae6fd"/><text x="30" y="130" class="svg-ink" font-size="12">7 debug   (very detailed, very noisy)</text>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="12">smaller number = more serious; a threshold of N sends 0 to N</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ cat /etc/rsyslog.d/50-default.conf</pre>
<pre class="out">#  Default rules for rsyslog.
#
#			For more information see rsyslog.conf(5) and /etc/rsyslog.conf

#
# First some standard log files.  Log by facility.
#
<span class="hl">auth,authpriv.*			/var/log/auth.log</span>
<span class="hl">*.*;auth,authpriv.none		-/var/log/syslog</span>
kern.*				-/var/log/kern.log
mail.*				-/var/log/mail.log

#
# Emergencies are sent to everybody logged in.
#
*.emerg				:omusrmsg:*</pre>`,n=`<pre class="out">%LINEPROTO-<span class="hl">5</span>-UPDOWN: Line protocol on Interface Loopback9, changed state to up
LINEPROTO = the IOS feature that logged it
5         = severity (notifications)
UPDOWN    = mnemonic: what happened</pre>`,r={id:`facility-severity`,h:{en:`Facility and severity: how a message is classified`,hi:`Facility aur severity: message ka classification`},body:{en:`
<p>A busy server writes thousands of lines an hour. To sort them, syslog attaches two labels to every message: a <b>facility</b> (who produced it) and a <b>severity</b> (how serious it is). Together they decide where the message is written and whether it is sent to a server.</p>

<h3>Severity: eight levels, 0 to 7</h3>
<p>Severity answers "how bad is it?". The number is counter-intuitive: <b>smaller means more serious</b>. Memorise the ladder; it appears in every syslog exam and every router configuration.</p>
`+e(`Eight severities. A threshold of N means "level N and everything more serious (smaller number)".`)+`
<table class="cmp"><tr><th>Number</th><th>Name</th><th>Typical example</th></tr>
<tr><td>0</td><td>emergencies</td><td>Kernel panic, system unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Act immediately, for example a hardware failure</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition</td></tr>
<tr><td>3</td><td>errors</td><td>An operation failed</td></tr>
<tr><td>4</td><td>warnings</td><td>Something may go wrong soon</td></tr>
<tr><td>5</td><td>notifications</td><td>Link up/down, configuration change</td></tr>
<tr><td>6</td><td>informational</td><td>Normal information</td></tr>
<tr><td>7</td><td>debugging</td><td>Detailed debug output</td></tr></table>
<p>A handy memory trick: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily gives emergencies, alerts, critical, errors, warnings, notifications, informational, debugging.</p>

<h3>Reading a Cisco message</h3>
<p>Cisco IOS puts the severity inside the message text, between two dashes. You captured this line from BLR-EDGE-R2 in the lab:</p>
`+n+`
<p>The 5 is the severity. An interface going up or down is a notification, level 5. If a router is configured to send only warnings and worse (level 4 and below), it will <b>not</b> send this line to the server. That single fact causes many "missing log" tickets.</p>

<h3>Facility: who produced it</h3>
<p>A <b>facility</b> is a category that traditionally named the kind of program: <code>kern</code> (kernel), <code>auth</code> and <code>authpriv</code> (logins and security), <code>mail</code>, <code>cron</code>, <code>daemon</code>, <code>syslog</code> (the logger itself), and eight free ones, <code>local0</code> to <code>local7</code>. Network devices have no "kernel" or "mail", so they use the <code>local</code> facilities. Cisco IOS defaults to <b>local7</b>, which lets you route all router messages to a separate file on the server.</p>
<p>The two labels are packed into one number called the <b>PRI</b>, the value in angle brackets at the start of the packet on the wire: <code>PRI = facility x 8 + severity</code>. For local7 (facility 23) at severity 5 the value is 23 x 8 + 5 = 189. You rarely compute it, but knowing it exists helps when reading a packet capture.</p>

<h3>How rsyslog uses the labels</h3>
<p>The default rules of Ubuntu's rsyslog use exactly these two labels. Read the file that decides where each message goes:</p>
`+t+`
<ul>
<li>Format of a rule: <code>selector  action</code>, where the selector is <code>facility.severity</code> and the action is usually a file.</li>
<li><code>auth,authpriv.*</code>: authentication facilities at any severity (the star) go to <code>auth.log</code>.</li>
<li><code>*.*;auth,authpriv.none</code>: everything, except auth messages (<code>none</code> excludes), goes to <code>syslog</code>. That is why logins are private in their own file.</li>
<li>A leading dash before a file name (<code>-/var/log/syslog</code>) means "do not force a disk write for every line", which is faster.</li>
<li><code>.emerg</code> goes to every logged-in user's terminal.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R2 is set to <code>logging trap warnings</code>. A failing optic produces <code>%LINK-3-UPDOWN</code> (severity 3) and a human shuts a port, giving <code>%LINK-5-CHANGED</code> (severity 5). With a warnings threshold, level 3 is sent (3 is below 4) and level 5 is dropped. The server sees the failure but not the manual shutdown, so the timeline in the ticket is incomplete. Raising the threshold to informational sends levels 0 to 6.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Setting the threshold to debugging "to be safe". Level 7 sends enormous volumes, can overload a small router CPU and fills the disk of the server. Informational is the usual production choice.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which level sends the most messages?" is <b>debugging (7)</b>, because a threshold includes all smaller numbers. "Which is most severe?" is <b>emergencies (0)</b>. Do not mix up the direction.</p></div>

<div class="scn"><h4>The log that was never sent</h4><p>A security analyst asked for proof of who shut down a port. The server had nothing, although the port clearly went down. The router template had <code>logging trap warnings</code>. The shutdown message is level 5, so the router never sent it. After changing the threshold to informational, the next change appeared in the log with the time and the user name.</p><p><b>Lesson:</b> when a message is missing, compare its severity number with the threshold before blaming the network.</p></div>

<div class="iv"><p class="q">"A router is set to logging trap errors. Which messages reach the server?"</p><p>Severities 0 to 3: emergencies, alerts, critical and errors. Warnings (4) and above in number are not sent. State the rule that a threshold sends its own level and every more serious (smaller) level.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every message has a facility (source) and a severity 0 to 7 (importance).</li>
<li>Smaller severity number = more serious; a threshold sends 0 up to N.</li>
<li>In %FACILITY-5-MNEMONIC the middle number is the severity.</li>
<li>Network devices use local0 to local7; Cisco defaults to local7.</li>
<li>rsyslog rules look like <code>selector  action</code>, for example <code>auth,authpriv.*  /var/log/auth.log</code>.</li>
</ul></div>
`,hi:`
<p>Busy server ek ghante mein hazaaron lines likhta hai. Unhe sort karne ke liye syslog har message par do label lagata hai: ek <b>facility</b> (kisne banaya) aur ek <b>severity</b> (kitna serious hai). Dono milkar decide karte hain ki message kahan likha jaayega aur kya server ko bheja jaayega.</p>

<h3>Severity: aath levels, 0 se 7</h3>
<p>Severity batati hai "kitna bura hai?". Number ulta lagta hai: <b>chhota matlab zyada serious</b>. Is ladder ko yaad kar lo; yeh har syslog exam aur har router configuration mein aati hai.</p>
`+e(`Aath severities. Threshold N ka matlab "level N aur usse zyada serious (chhota number) sab".`)+`
<table class="cmp"><tr><th>Number</th><th>Naam</th><th>Typical example</th></tr>
<tr><td>0</td><td>emergencies</td><td>Kernel panic, system unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Turant action, jaise hardware failure</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition</td></tr>
<tr><td>3</td><td>errors</td><td>Koi operation fail hua</td></tr>
<tr><td>4</td><td>warnings</td><td>Kuch jaldi galat ho sakta hai</td></tr>
<tr><td>5</td><td>notifications</td><td>Link up/down, configuration change</td></tr>
<tr><td>6</td><td>informational</td><td>Normal information</td></tr>
<tr><td>7</td><td>debugging</td><td>Detailed debug output</td></tr></table>
<p>Yaad rakhne ki trick: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily se emergencies, alerts, critical, errors, warnings, notifications, informational, debugging milta hai.</p>

<h3>Cisco message padhna</h3>
<p>Cisco IOS severity ko message text ke andar do dashes ke beech rakhta hai. Yeh line aapne lab mein BLR-EDGE-R2 se capture ki thi:</p>
`+n+`
<p>5 severity hai. Interface ka up ya down hona notification hai, level 5. Agar router sirf warnings aur usse buri (level 4 aur neeche) bhejne ke liye configured hai, to woh yeh line server ko <b>nahi</b> bhejega. Isi ek baat se bahut saare "missing log" tickets bante hain.</p>

<h3>Facility: kisne banaya</h3>
<p><b>Facility</b> ek category hai jo traditionally program ki kism batati thi: <code>kern</code> (kernel), <code>auth</code> aur <code>authpriv</code> (logins aur security), <code>mail</code>, <code>cron</code>, <code>daemon</code>, <code>syslog</code> (khud logger), aur aath free wali, <code>local0</code> se <code>local7</code>. Network devices mein "kernel" ya "mail" nahi hota, isliye woh <code>local</code> facilities use karte hain. Cisco IOS default mein <b>local7</b> use karta hai, jisse aap saare router messages ko server par alag file mein bhej sakte ho.</p>
<p>Dono labels ek number mein pack hote hain jise <b>PRI</b> kehte hain, jo wire par packet ke shuru mein angle brackets mein hoti hai: <code>PRI = facility x 8 + severity</code>. local7 (facility 23) severity 5 par value 23 x 8 + 5 = 189 hoti hai. Aap ise kam hi nikaalte ho, par packet capture padhte waqt iska pata hona madad karta hai.</p>

<h3>rsyslog in labels ko kaise use karta hai</h3>
<p>Ubuntu ke rsyslog ke default rules bilkul inhi do labels ko use karte hain. Woh file padho jo decide karti hai ki har message kahan jaayega:</p>
`+t+`
<ul>
<li>Rule ka format: <code>selector  action</code>, jahan selector <code>facility.severity</code> hai aur action aam taur par ek file.</li>
<li><code>auth,authpriv.*</code>: authentication facilities har severity par (star) <code>auth.log</code> mein jaati hain.</li>
<li><code>*.*;auth,authpriv.none</code>: auth messages ko chhodkar (<code>none</code> exclude karta hai) sab <code>syslog</code> mein jaata hai. Isiliye logins apni alag file mein private rehte hain.</li>
<li>File naam se pehle dash (<code>-/var/log/syslog</code>) ka matlab "har line par disk write force mat karo", jo tez hai.</li>
<li><code>.emerg</code> har logged-in user ke terminal par jaata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R2 par <code>logging trap warnings</code> hai. Kharab optic <code>%LINK-3-UPDOWN</code> (severity 3) banata hai aur koi insaan port shut karta hai to <code>%LINK-5-CHANGED</code> (severity 5) aata hai. Warnings threshold par level 3 jaata hai (3, 4 se chhota hai) aur level 5 drop ho jaata hai. Server failure dekhta hai par manual shutdown nahi, isliye ticket ki timeline adhoori rehti hai. Threshold ko informational karne se levels 0 se 6 jaate hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Surakshit rehne ke liye" threshold ko debugging karna. Level 7 bahut zyada volume bhejta hai, chhote router ka CPU overload kar sakta hai aur server ki disk bhar deta hai. Production mein aam choice informational hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa level sabse zyada messages bhejta hai?" ka jawab <b>debugging (7)</b> hai, kyunki threshold mein saare chhote numbers shamil hote hain. "Sabse severe kaunsa?" ka jawab <b>emergencies (0)</b>. Direction mat ulta karo.</p></div>

<div class="scn"><h4>Woh log jo kabhi bheja hi nahi gaya</h4><p>Ek security analyst ne saboot maanga ki port kisne shut kiya. Server par kuch nahi tha, jabki port saaf taur par down hua tha. Router template mein <code>logging trap warnings</code> tha. Shutdown message level 5 hai, isliye router ne use kabhi nahi bheja. Threshold informational karne ke baad agla change time aur user name ke saath log mein aaya.</p><p><b>Lesson:</b> message missing ho to network ko dosh dene se pehle uske severity number ko threshold se compare karo.</p></div>

<div class="iv"><p class="q">"Router par logging trap errors hai. Kaun se messages server tak pahunchte hain?"</p><p>Severities 0 se 3: emergencies, alerts, critical aur errors. Warnings (4) aur usse bade numbers nahi bheje jaate. Yeh rule bolo ki threshold apna level aur har zyada serious (chhota) level bhejta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har message ki ek facility (source) aur ek severity 0 se 7 (importance) hoti hai.</li>
<li>Chhota severity number = zyada serious; threshold 0 se N tak bhejta hai.</li>
<li>%FACILITY-5-MNEMONIC mein beech ka number severity hai.</li>
<li>Network devices local0 se local7 use karte hain; Cisco default local7.</li>
<li>rsyslog rules aise dikhte hain <code>selector  action</code>, jaise <code>auth,authpriv.*  /var/log/auth.log</code>.</li>
</ul></div>
`}};export{r as default};