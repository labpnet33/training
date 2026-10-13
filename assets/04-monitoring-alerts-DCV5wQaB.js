var e={id:`monitoring-alerts`,h:{en:`Monitoring and alerts`,hi:`Monitoring aur alerts`},body:{en:`
<p>Logs answer "what happened to this connection". Monitoring answers a different question: "is the engine itself healthy right now, and will somebody tell me when it is not". Lab fp-ops-4 builds that second half: an alert that fires when an engine goes offline.</p>

<h3>Analogy: the dashboard light and the siren</h3>
<p>A car shows engine status on the dashboard. Looking at it is monitoring. A siren that wakes you at night when the car is stolen is an alert. A siren exists only if someone installed it and told it what to listen for. A firewall behaves the same: the Monitoring and alerts page shows status, but an alert is raised only when a rule says so.</p>

<h3>Engine status and its causes</h3>
<p>Every engine and node has a status on the Engines page. The status is a summary; the <b>cause text</b> is where the answer is. Read both.</p>
<table class="cmp"><tr><th>Status</th><th>Usual meaning</th><th>First thing to check</th></tr>
<tr><td><b>Online</b></td><td>Contact works, a policy is installed, the node is active.</td><td>Nothing; confirm the installed policy is the one you expect.</td></tr>
<tr><td><b>Standby</b></td><td>Healthy cluster node, waiting.</td><td>Is the partner online?</td></tr>
<tr><td><b>Offline / Locked offline</b></td><td>Node deliberately or accidentally not processing.</td><td>Node commands and locks (chapter 2).</td></tr>
<tr><td><b>No Policy Installed</b></td><td>Contact exists but no policy has been installed yet.</td><td>Press Install policy.</td></tr>
<tr><td><b>Unknown</b></td><td>The SMC has no status: timeout or no contact.</td><td>Contact path, control IP or contact address, port 8902.</td></tr>
<tr><td><b>Not monitored</b></td><td>Monitoring is off for this element.</td><td>Whether that is intended.</td></tr>
</table>
<p>For Unknown, the console explains why, for example that the Management Server cannot contact the engine at a given address, and it tells you whether that address is the control IP or a contact address. Components in the same Location use the control IP; components in another Location use a Location-specific contact address, else the default one. A wrong contact address after a NAT or interface change is a classic cause (you met this in the network and NAT modules).</p>

<pre class="out">NK-PUNE-FW   status: <span class="hl">Unknown</span>
  FW1A: Unknown - The Management Server cannot contact the engine at 203.0.113.2
        (the contact address; the control IP is 10.0.0.1) (no answer).
  FW1B: Online</pre>

<h3>Alert rules: nothing is raised without a rule</h3>
<p>An <b>alert rule</b> connects an event to a notification. In the lab the alert policy holds the rules you create. One event type is engine offline: you choose which engine (or all) and the rule watches its nodes. A node that is Offline, Locked offline or Unknown triggers it, and the active alert text names the node, the engine and the cause when one exists.</p>
<p>A second source of alerts is a <b>log level of Alert</b> on an access rule: each connection that matches that rule produces an alert entry that quotes the rule, source, destination and port. This is useful for a small number of high-value events, such as any attempt to reach an admin port from a guest network. Use it sparingly: an Alert level on a busy rule creates noise, and a team that sees noise ignores the siren.</p>
<p>The important fact: <b>with no alert rule and no Alert-level rule, nothing is raised.</b> An engine can be offline for hours and the active alerts list stays empty. Status turning red is not the same as an alert being raised.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Where alerts come from">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node goes offline</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">an event</text>
<rect x="20" y="120" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="148" text-anchor="middle" class="svg-ink" font-size="13">Rule logs at Alert</text><text x="105" y="166" text-anchor="middle" class="svg-muted" font-size="12">a connection</text>
<rect x="260" y="60" width="150" height="80" rx="8" fill="#fde68a"/><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="13">Alert rule or</text><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="13">Alert log level</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#bbf7d0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Active alerts</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="12">someone is told</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="150" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">No rule in the middle box means nothing reaches the active alerts list, however bad the event.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-4).</b> Step 1: create an alert rule for the event engine offline on NK-PUNE-FW. Step 2: Install policy so the change is part of the running design as your lab requires. Step 3: take one node offline with a node command. Step 4: open the active alerts list and read the text: node, engine and cause. Step 5: bring the node back online and confirm the alert condition has gone. If only one node of a two-node cluster is offline, the branch still works, yet the alert did its job: you learn about the lost redundancy before the second failure.</p></div>

<h3>Policy snapshots and monitoring together</h3>
<p>Monitoring also tells you which revision is installed. Each successful install stores a numbered snapshot. When you wonder whether a change reached the engine, compare the installed revision with the pending changes shown by the Install policy bar. Chapter 5 uses these snapshots for rollback.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming the SMC will "obviously" notify someone when a node dies. Without an alert rule the node is simply shown as Offline and nobody is called. Another mistake: setting Alert on a wide allow rule and flooding the list.</p></div>

<div class="exam"><p><b>Exam trap.</b> Status and alert are different things. Status is always displayed; an alert needs a rule. Unknown points to contact, not to a failed policy.</p></div>

<div class="scn"><h4>The silent failure</h4><p>At the Pune branch FW1B stayed Offline for nine days after a power event. FW1A then lost a fan and rebooted, and the branch went dark for twenty minutes. The review found that no alert rule existed; the red status was visible, but nobody opened the Engines page that week. The team added an engine-offline alert rule and a weekly look at the status page.</p><p><b>Lesson:</b> redundancy you cannot see failing is not redundancy.</p></div>

<div class="iv"><p class="q">"An engine went offline and nobody was notified. Why?"</p><p>Strong answer: status is not an alert. Check that an alert rule for the engine offline event exists and covers that engine, and decide how the alert reaches people. Add that alert-level logging on rules should be limited to rare, important events.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring shows state; alerts need a rule or an Alert-level access rule.</li>
<li>Unknown means no status or timeout: start with contact and addresses.</li>
<li>Read the cause text, not only the colour of the status.</li>
<li>The engine offline alert covers Offline, Locked offline and Unknown nodes.</li>
<li>Keep Alert level for rare events to avoid alert fatigue.</li>
</ul></div>
`,hi:`
<p>Logs batate hain "is connection ke saath kya hua". Monitoring ek alag sawal ka jawab deti hai: "engine khud abhi healthy hai ya nahi, aur jab nahi hoga to koi mujhe bataega ya nahi". Lab fp-ops-4 yeh doosra hissa banata hai: ek alert jo engine offline hone par fire ho.</p>

<h3>Analogy: dashboard light aur siren</h3>
<p>Gaadi dashboard par engine status dikhati hai. Use dekhna monitoring hai. Gaadi chori hone par raat ko jagane wala siren alert hai. Siren tabhi hota hai jab kisi ne lagaya ho aur use bataya ho ki kya sunna hai. Firewall bhi waisa hi hai: Monitoring and alerts page status dikhata hai, lekin alert tabhi raise hota hai jab koi rule kehta hai.</p>

<h3>Engine status aur uske causes</h3>
<p>Engines page par har engine aur node ka status hota hai. Status ek summary hai; asli jawab <b>cause text</b> mein hai. Dono padho.</p>
<table class="cmp"><tr><th>Status</th><th>Usual matlab</th><th>Pehle kya check karein</th></tr>
<tr><td><b>Online</b></td><td>Contact chal raha hai, policy installed hai, node active hai.</td><td>Kuch nahi; confirm karo ki installed policy wahi hai jo aap expect karte ho.</td></tr>
<tr><td><b>Standby</b></td><td>Healthy cluster node, wait kar raha hai.</td><td>Partner online hai?</td></tr>
<tr><td><b>Offline / Locked offline</b></td><td>Node jaan-boojh kar ya galti se process nahi kar raha.</td><td>Node commands aur locks (chapter 2).</td></tr>
<tr><td><b>No Policy Installed</b></td><td>Contact hai lekin abhi tak policy install nahi hui.</td><td>Install policy dabao.</td></tr>
<tr><td><b>Unknown</b></td><td>SMC ke paas status nahi: timeout ya contact nahi.</td><td>Contact path, control IP ya contact address, port 8902.</td></tr>
<tr><td><b>Not monitored</b></td><td>Is element ke liye monitoring off hai.</td><td>Yeh intended hai ya nahi.</td></tr>
</table>
<p>Unknown ke liye console wajah batata hai, jaise ki Management Server diye gaye address par engine se contact nahi kar pa raha, aur woh address control IP hai ya contact address yeh bhi batata hai. Same Location ke components control IP use karte hain; dusri Location ke components Location-specific contact address, warna default wala use karte hain. NAT ya interface change ke baad galat contact address classic cause hai (network aur NAT modules mein aap yeh mile the).</p>

<pre class="out">NK-PUNE-FW   status: <span class="hl">Unknown</span>
  FW1A: Unknown - The Management Server cannot contact the engine at 203.0.113.2
        (the contact address; the control IP is 10.0.0.1) (no answer).
  FW1B: Online</pre>

<h3>Alert rules: rule ke bina kuch raise nahi hota</h3>
<p><b>Alert rule</b> ek event ko notification se jodta hai. Lab mein alert policy un rules ko rakhti hai jo aap banate ho. Ek event type engine offline hai: aap engine chunte ho (ya sabhi) aur rule uske nodes ko dekhta hai. Offline, Locked offline ya Unknown node isse trigger karta hai, aur active alert text node, engine aur (agar ho) cause ka naam batata hai.</p>
<p>Alerts ka dusra source access rule ka <b>Alert log level</b> hai: us rule se match karne wala har connection ek alert entry banata hai jo rule, source, destination aur port quote karti hai. Yeh thode se high-value events ke liye useful hai, jaise guest network se admin port tak koi bhi koshish. Kam use karo: busy rule par Alert level noise banata hai, aur noise dekhne wali team siren ko ignore karne lagti hai.</p>
<p>Zaroori fact: <b>na alert rule, na Alert-level rule, to kuch raise nahi hota.</b> Engine ghanton offline rahe aur active alerts list khaali rahegi. Status ka laal hona aur alert raise hona ek cheez nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Alerts kahan se aate hain">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node offline hota hai</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">ek event</text>
<rect x="20" y="120" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="148" text-anchor="middle" class="svg-ink" font-size="13">Rule Alert par log</text><text x="105" y="166" text-anchor="middle" class="svg-muted" font-size="12">ek connection</text>
<rect x="260" y="60" width="150" height="80" rx="8" fill="#fde68a"/><text x="335" y="95" text-anchor="middle" class="svg-ink" font-size="13">Alert rule ya</text><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="13">Alert log level</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#bbf7d0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Active alerts</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="12">kisi ko bataya jata hai</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="150" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Beech wale box mein rule na ho to event kitna bhi bura ho, active alerts list tak kuch nahi pahunchta.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-4).</b> Step 1: NK-PUNE-FW par engine offline event ke liye alert rule banao. Step 2: Install policy karo taaki change running design ka hissa bane jaisa aapka lab maangta hai. Step 3: node command se ek node offline karo. Step 4: active alerts list kholo aur text padho: node, engine aur cause. Step 5: node ko wapas online karo aur confirm karo ki alert condition khatam ho gayi. Do-node cluster mein ek hi node offline ho to branch chalta rehta hai, phir bhi alert ne kaam kiya: doosri failure se pehle aapko redundancy ke jaane ka pata chal gaya.</p></div>

<h3>Policy snapshots aur monitoring saath mein</h3>
<p>Monitoring yeh bhi batati hai ki kaunsi revision installed hai. Har successful install ek numbered snapshot store karta hai. Jab shak ho ki change engine tak pahuncha ya nahi, installed revision ko Install policy bar mein dikhe pending changes se compare karo. Chapter 5 in snapshots ko rollback ke liye use karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Maan lena ki SMC "zaroor" kisi ko batayega jab node mar jaye. Alert rule ke bina node bas Offline dikhta hai aur kisi ko call nahi jata. Doosri galti: bade allow rule par Alert set karke list ko flood kar dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Status aur alert alag cheezein hain. Status hamesha dikhta hai; alert ko rule chahiye. Unknown contact ki taraf ishara karta hai, failed policy ki taraf nahi.</p></div>

<div class="scn"><h4>Khamosh failure</h4><p>Pune branch mein power event ke baad FW1B nau din Offline raha. Phir FW1A ka fan kharab hua aur woh reboot hua, aur branch bees minute andhera raha. Review mein pata chala ki koi alert rule tha hi nahi; laal status dikh raha tha, lekin us hafte kisi ne Engines page nahi kholi. Team ne engine-offline alert rule joda aur status page ka weekly look shuru kiya.</p><p><b>Seekh:</b> jis redundancy ka fail hona dikhta nahi, woh redundancy nahi hai.</p></div>

<div class="iv"><p class="q">"Engine offline hua aur kisi ko notify nahi hua. Kyun?"</p><p>Strong answer: status alert nahi hai. Check karo ki engine offline event ka alert rule hai aur us engine ko cover karta hai, aur decide karo ki alert logon tak kaise pahunchega. Jodo ki rules par Alert-level logging rare, important events tak limited honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring state dikhati hai; alerts ko rule ya Alert-level access rule chahiye.</li>
<li>Unknown ka matlab status nahi ya timeout: contact aur addresses se shuru karo.</li>
<li>Cause text padho, sirf status ka rang nahi.</li>
<li>Engine offline alert Offline, Locked offline aur Unknown nodes ko cover karta hai.</li>
<li>Alert level rare events ke liye rakho taaki alert fatigue na ho.</li>
</ul></div>
`}};export{e as default};