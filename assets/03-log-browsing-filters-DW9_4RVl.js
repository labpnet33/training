var e={id:`log-browsing`,h:{en:`Log browsing and filters`,hi:`Log browsing aur filters`},body:{en:`
<p>When a user says "the site does not open", the engine has usually already written the answer in a log entry. Lab fp-ops-2 asks you to find why traffic is denied using the Logs page. The skill is not clicking; it is knowing which question to ask the log.</p>

<h3>Analogy: the gate register</h3>
<p>The Pune branch gate keeps a register: who came, at what time, which door rule let them in or turned them away, and the reason. If a visitor complains, the supervisor does not guess. He opens the register, filters by the visitor name and today, and reads the line. A firewall log is that register, and the most valuable column is <b>the rule that decided</b>.</p>

<h3>What a log entry tells you</h3>
<p>A typical entry has a time, the node that handled it, source, destination, service, the <b>action</b> and the <b>rule</b> that produced it. Log action values in this track are Allow, Discard, Permit, Refuse and Terminate. Deep inspection events and TLS failures are logged with a <b>situation</b> name instead of only a rule, for example the training situation EXPLOIT-TEST. When you read an entry, answer in this order: who talked to whom, on which service, what was decided, and which rule or situation decided.</p>

<h3>Log levels: what gets recorded</h3>
<p>Every rule logs at a level. Knowing the level explains why an entry exists, or why it is missing.</p>
<table class="cmp"><tr><th>Level</th><th>Effect</th></tr>
<tr><td><b>None</b></td><td>Nothing is logged for the rule.</td></tr>
<tr><td><b>Transient</b></td><td>Shown in current events but not stored. Gone when you refresh later.</td></tr>
<tr><td><b>Stored</b></td><td>Kept in the log database. This is the default when no Continue rule sets another level.</td></tr>
<tr><td><b>Essential</b></td><td>Stored, and marked as more important for review.</td></tr>
<tr><td><b>Alert</b></td><td>Stored and also raises an alert (chapter 4).</td></tr>
</table>
<p>A rule set to <i>inherit</i> uses the default set by a Continue rule above it, else Stored. A common surprise: "I cannot find the entry" often means the rule logs at None or Transient. Fix the rule's level, press Install policy, and test again.</p>

<h3>Discard versus Refuse</h3>
<p>Both stop the connection. The difference is what the sender sees.</p>
<ul>
<li><b>Discard</b> drops silently. The client waits and times out. Good for hostile or unwanted traffic, because it gives the sender no information.</li>
<li><b>Refuse</b> drops and tells the sender, with a reset or an unreachable message. The client fails at once with an error. Good inside a trusted network where fast feedback saves time.</li>
</ul>
<p>So a ticket saying "page hangs for a long time" suggests Discard or no matching rule at all; "connection refused immediately" suggests Refuse (or a closed port on the server itself). If no rule matches, the implicit discard applies at the end of the policy. Read the entry carefully to see whether a rule name is shown.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Discard compared with Refuse">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text>
<rect x="250" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="13">Engine rule</text>
<rect x="500" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text>
<line x1="140" y1="55" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="500" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="315" y="125" text-anchor="middle" class="svg-accent" font-size="13">Discard: no reply, client times out</text>
<text x="315" y="160" text-anchor="middle" class="svg-accent" font-size="13">Refuse: reset or unreachable sent back</text>
<text x="315" y="200" text-anchor="middle" class="svg-muted" font-size="12">Both are logged with the rule that decided</text>
</svg><p class="cap">The server never sees the dropped packet in either case. Only the sender experience differs.</p></div>

<h3>Filtering: the habit that saves time</h3>
<p>The Logs page lets you narrow the list. Typical filters are time range, source, destination, service, action and rule. A strong habit is to start with the narrowest true fact you have. If the user is 10.1.1.10 and the target is 172.16.20.20, filter on that source and destination. If a long list returns, add the action Discard or Refuse. If nothing returns, widen: maybe the source was NATed, maybe the traffic never reached this engine, or the rule logs at None. Remember that Access rules match the original (pre-NAT) addresses, so filter on the original address.</p>

<pre class="out">Time      Node  Src          Dst            Svc      Action    Rule
10:02:11  FW1A  10.1.1.10    172.16.20.20   HTTPS    <span class="hl">Discard</span>   <span class="hl">12 Block-DMZ-admin</span>
10:02:15  FW1A  10.1.1.10    172.16.20.20   HTTP     Allow     8 Staff-to-web
10:03:40  FW1A  10.1.1.10    172.16.20.20   SSH      Refuse    14 Deny-ssh</pre>

<div class="eg"><p><b>Worked example (fp-ops-2).</b> Anita in Staff LAN cannot open HTTPS to WEB1. Step 1: filter source 10.1.1.10, destination 172.16.20.20. Step 2: read the HTTPS entry: Discard by rule 12. Step 3: open the policy, look at rule 12 and the rules above it. Step 4: decide whether rule 12 is wrong or an Allow rule must sit above it. Step 5: edit, Install policy, test again, and check that a new log line shows Allow. The lab passes only after the install.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing a rule and testing without installing. The log keeps showing the old decision because the engine still runs the installed snapshot.</p></div>

<div class="exam"><p><b>Exam trap.</b> Discard is silent, Refuse answers the sender. Also, Transient is not stored, so absence in stored logs does not prove traffic never arrived.</p></div>

<div class="scn"><h4>The ticket with no log line</h4><p>A user reported that an internal app failed. The engineer filtered by the user IP for the last hour and found nothing. Instead of declaring "no traffic", she checked the rule that should carry the traffic: its level was None, set months ago to reduce noise. She raised it to Stored, installed, asked the user to retry, and saw a Discard from a time-range rule outside working hours.</p><p><b>Lesson:</b> a missing log line is a clue about the log level, not proof of no traffic.</p></div>

<div class="iv"><p class="q">"Users report a timeout, not an error. What do you check in the logs?"</p><p>Strong answer: a timeout is typical for Discard or an implicit discard. Filter by source and destination, find the deciding rule or the absence of one, then check the rule order and whether the policy was installed. Mention that Refuse would fail fast.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read each entry as: who, to whom, which service, what action, which rule or situation.</li>
<li>Log levels are None, Transient, Stored, Essential and Alert; the default is Stored.</li>
<li>Discard is silent; Refuse tells the sender. Both log the deciding rule.</li>
<li>Filter narrow first, then widen; use original pre-NAT addresses.</li>
<li>A missing entry may mean a low log level; fixes need Install policy.</li>
</ul></div>
`,hi:`
<p>Jab user kehta hai "site khul nahi rahi", to engine ne aam taur par jawab pehle hi log entry mein likh diya hota hai. Lab fp-ops-2 aapse Logs page se pata lagwata hai ki traffic kyun deny ho raha hai. Skill clicking nahi hai; skill yeh jaanna hai ki log se kaunsa sawal poochna hai.</p>

<h3>Analogy: gate register</h3>
<p>Pune branch ka gate ek register rakhta hai: kaun aaya, kis waqt, kis door rule ne andar jaane diya ya lauta diya, aur kya wajah thi. Visitor complain kare to supervisor andaza nahi lagata. Woh register kholta hai, visitor ke naam aur aaj ki date se filter karta hai, aur line padhta hai. Firewall log wahi register hai, aur sabse keemti column hai <b>woh rule jisne decide kiya</b>.</p>

<h3>Log entry kya batati hai</h3>
<p>Ek typical entry mein time, jis node ne handle kiya, source, destination, service, <b>action</b> aur woh <b>rule</b> hota hai jisne yeh action diya. Is track mein log action values hain Allow, Discard, Permit, Refuse aur Terminate. Deep inspection events aur TLS failures sirf rule ke saath nahi, balki ek <b>situation</b> naam ke saath log hote hain, jaise training situation EXPLOIT-TEST. Entry padhte waqt is order mein jawab do: kisne kis se baat ki, kis service par, kya decide hua, aur kis rule ya situation ne decide kiya.</p>

<h3>Log levels: kya record hota hai</h3>
<p>Har rule ek level par log karta hai. Level jaanne se samajh aata hai ki entry kyun hai, ya kyun nahi hai.</p>
<table class="cmp"><tr><th>Level</th><th>Effect</th></tr>
<tr><td><b>None</b></td><td>Rule ke liye kuch log nahi hota.</td></tr>
<tr><td><b>Transient</b></td><td>Current events mein dikhta hai lekin store nahi hota. Baad mein refresh par gayab.</td></tr>
<tr><td><b>Stored</b></td><td>Log database mein rakha jata hai. Jab koi Continue rule dusra level set na kare, yahi default hai.</td></tr>
<tr><td><b>Essential</b></td><td>Stored, aur review ke liye zyada important mark hota hai.</td></tr>
<tr><td><b>Alert</b></td><td>Stored aur saath mein alert bhi raise karta hai (chapter 4).</td></tr>
</table>
<p>Jo rule <i>inherit</i> par ho woh upar ke Continue rule ka default level use karta hai, warna Stored. Common surprise: "mujhe entry nahi mil rahi" ka matlab aksar yeh hota hai ki rule None ya Transient par log karta hai. Rule ka level theek karo, Install policy dabao, aur dobara test karo.</p>

<h3>Discard versus Refuse</h3>
<p>Dono connection rokte hain. Farak yeh hai ki sender ko kya dikhta hai.</p>
<ul>
<li><b>Discard</b> chup-chaap drop karta hai. Client wait karta hai aur timeout ho jata hai. Hostile ya unwanted traffic ke liye accha, kyunki sender ko koi information nahi milti.</li>
<li><b>Refuse</b> drop karta hai aur sender ko reset ya unreachable message se batata hai. Client turant error ke saath fail hota hai. Trusted network ke andar accha hai jahan fast feedback time bachata hai.</li>
</ul>
<p>Isliye "page bahut der tak hang rehta hai" wala ticket Discard ya kisi bhi rule ke match na hone ki taraf ishara karta hai; "connection refused turant" Refuse ki taraf (ya server ke khud ke band port ki taraf). Koi rule match na kare to policy ke end mein implicit discard lagta hai. Entry dhyan se padho ki rule ka naam dikh raha hai ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Discard aur Refuse ki tulna">
<rect x="20" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text>
<rect x="250" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="13">Engine rule</text>
<rect x="500" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text>
<line x1="140" y1="55" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="500" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="315" y="125" text-anchor="middle" class="svg-accent" font-size="13">Discard: koi reply nahi, client timeout</text>
<text x="315" y="160" text-anchor="middle" class="svg-accent" font-size="13">Refuse: reset ya unreachable wapas</text>
<text x="315" y="200" text-anchor="middle" class="svg-muted" font-size="12">Dono decide karne wale rule ke saath log hote hain</text>
</svg><p class="cap">Dono case mein server ko dropped packet kabhi nahi dikhta. Sirf sender ka experience alag hai.</p></div>

<h3>Filtering: woh habit jo time bachati hai</h3>
<p>Logs page list ko chhota karne deta hai. Typical filters hain time range, source, destination, service, action aur rule. Acchi habit hai ki sabse narrow sachchai se shuru karo. User 10.1.1.10 hai aur target 172.16.20.20, to usi source aur destination par filter karo. Lambi list aaye to action Discard ya Refuse jodo. Kuch na aaye to widen karo: shayad source NAT hua, shayad traffic is engine tak pahuncha hi nahi, ya rule None par log karta hai. Yaad rakho Access rules original (pre-NAT) addresses match karte hain, isliye original address par filter karo.</p>

<pre class="out">Time      Node  Src          Dst            Svc      Action    Rule
10:02:11  FW1A  10.1.1.10    172.16.20.20   HTTPS    <span class="hl">Discard</span>   <span class="hl">12 Block-DMZ-admin</span>
10:02:15  FW1A  10.1.1.10    172.16.20.20   HTTP     Allow     8 Staff-to-web
10:03:40  FW1A  10.1.1.10    172.16.20.20   SSH      Refuse    14 Deny-ssh</pre>

<div class="eg"><p><b>Worked example (fp-ops-2).</b> Staff LAN ki Anita WEB1 par HTTPS nahi khol pa rahi. Step 1: source 10.1.1.10, destination 172.16.20.20 se filter karo. Step 2: HTTPS entry padho: rule 12 ne Discard kiya. Step 3: policy kholo, rule 12 aur uske upar ke rules dekho. Step 4: decide karo rule 12 galat hai ya uske upar ek Allow rule chahiye. Step 5: edit karo, Install policy karo, dobara test karo, aur check karo ki nayi log line Allow dikhaye. Lab install ke baad hi pass hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Rule edit karke bina install kiye test karna. Log purana decision dikhata rehta hai kyunki engine abhi bhi installed snapshot chala raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Discard silent hai, Refuse sender ko jawab deta hai. Aur Transient store nahi hota, isliye stored logs mein entry na hone se saabit nahi hota ki traffic aaya hi nahi.</p></div>

<div class="scn"><h4>Bina log line wala ticket</h4><p>Ek user ne bataya ki internal app fail hui. Engineer ne pichle ghante ke liye user IP se filter kiya aur kuch nahi mila. "Traffic nahi aaya" bolne ke bajaye usne us rule ko dekha jo traffic carry karna chahiye tha: uska level None tha, mahino pehle noise kam karne ke liye set kiya gaya. Usne use Stored kiya, install kiya, user se retry karwaya, aur working hours ke bahar wale time-range rule ka Discard dikha.</p><p><b>Seekh:</b> log line ka na hona log level ka clue hai, traffic na hone ka saboot nahi.</p></div>

<div class="iv"><p class="q">"Users timeout bata rahe hain, error nahi. Logs mein kya check karoge?"</p><p>Strong answer: timeout Discard ya implicit discard ka typical sign hai. Source aur destination se filter karo, deciding rule ya uska na hona dhundo, phir rule order aur policy installed hai ya nahi check karo. Batao ki Refuse turant fail hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har entry ko padho: kaun, kis se, kis service par, kya action, kaunsa rule ya situation.</li>
<li>Log levels None, Transient, Stored, Essential aur Alert hain; default Stored hai.</li>
<li>Discard silent hai; Refuse sender ko batata hai. Dono deciding rule log karte hain.</li>
<li>Pehle narrow filter, phir widen; original pre-NAT addresses use karo.</li>
<li>Entry na dikhna low log level ho sakta hai; fixes ke liye Install policy chahiye.</li>
</ul></div>
`}};export{e as default};