var e={id:`investigation-practice`,h:{en:`Investigation practice: from symptom to log to policy to fix`,hi:`Investigation practice: symptom se log, policy aur fix tak`},body:{en:`
<p>A doctor does not start with surgery. She listens to the symptom, orders one test, reads the result, forms a diagnosis, treats, and checks that the patient recovered. A log investigation has the same rhythm. The skill is not knowing every command; it is knowing the order in which to ask questions so that you never search blindly.</p>

<h3>The five steps</h3>
<ol>
<li><b>Symptom.</b> Write the complaint in one sentence with who, what, where and when. "Madurai user 10.20.0.10 cannot use a file-sharing client since morning."</li>
<li><b>Log.</b> Translate the sentence into a search (chapter 3). Choose the log type that holds the answer: a verdict is in a UTM log, a policy decision in a traffic log, a change in an event log.</li>
<li><b>Policy.</b> The log tells you <code>policyid</code> and, for UTM logs, the profile list (<code>applist</code>). Open that policy on the FortiGate named in <code>devname</code>.</li>
<li><b>Fix or explain.</b> Decide whether the behaviour is a fault or the intended rule. A blocked P2P application on a company network is usually working as designed.</li>
<li><b>Verify.</b> Repeat the action and search again. A fix that you did not verify is only a hope.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Investigation steps">
<rect x="6" y="35" width="108" height="56" rx="8" fill="#e2e8f0"/><text x="60" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text>
<rect x="132" y="35" width="108" height="56" rx="8" fill="#bae6fd"/><text x="186" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Log</text>
<rect x="258" y="35" width="108" height="56" rx="8" fill="#ddd6fe"/><text x="312" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text>
<rect x="384" y="35" width="108" height="56" rx="8" fill="#fde68a"/><text x="438" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 Fix</text>
<rect x="510" y="35" width="124" height="56" rx="8" fill="#bbf7d0"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="114" y1="63" x2="132" y2="63" stroke="#64748b" stroke-width="2"/><line x1="240" y1="63" x2="258" y2="63" stroke="#64748b" stroke-width="2"/><line x1="366" y1="63" x2="384" y2="63" stroke="#64748b" stroke-width="2"/><line x1="492" y1="63" x2="510" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">no log found? go back one step and check the chain of chapter 5</text>
</svg><p class="cap">Five steps; never skip the last one.</p></div>

<h3>Case 1: a blocked application</h3>
<p>Step 2 gave us the UTM log with <code>policyid=1</code> and <code>applist="APP-BLOCK"</code> on MDU-FGT. For step 3 we open that policy on MDU-FGT:</p>
<pre class="out">MDU-FGT # show full-configuration firewall policy 1
    edit 1
        set name "LAN-TO-WAN"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        <span class="hl">set application-list "APP-BLOCK"</span>
        set logtraffic all</pre>
<p>The policy applies the list APP-BLOCK, which blocks the P2P category. The user is not facing a fault; the network is doing what the security team configured. The answer to the helpdesk is "blocked by policy, request an exception through the change process if there is a business reason".</p>

<h3>Case 2: no log at all</h3>
<p>Now the symptom is "I browse from Trichy, but I cannot find my session". The first search returns zero. You do not guess; you step back to the chain. The device table tells you quickly whether anything ever arrived:</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0      2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">0        0      0</span>      0      -</pre>
<p>TRY-FGT has delivered no logs of any type. The connection and registration are fine (this is the lab you will do next), so the next question is whether the policy writes traffic logs, which is a <code>logtraffic</code> question. Each answer narrows the problem to one link.</p>

<h3>Saved searches and FortiView</h3>
<p>In the real product you can save a filter and reopen it, and the FortiView pages summarise top sources, top applications and top threats without a search at all. The simulator does not model saved searches or FortiView; the command <code>execute fazui logview</code> is the one entry point. For your own team, write the most useful searches into a runbook (a short page of commands) so that any engineer can repeat them. That is the portable version of a saved search.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "HQ users report the intranet is slow." Step 1: who, HQ LAN 10.10.0.0/24, to SRV-WEB 192.0.2.80. Step 2: <code>traffic srcip=10.10.0.* dstip=192.0.2.80 limit 5</code> shows five accepted sessions on policy 1, all within the same second: the firewall accepts them, so it is not the policy. Step 4: the answer is that the firewall path is healthy and the server or the link needs a look. Without steps 2 and 3 the team would have spent the afternoon changing firewall rules.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing a policy before reading the log; fixing the wrong FortiGate because devname was not read; reading only the newest log of a long story; closing the ticket without repeating the user's action.</p></div>

<div class="exam"><p><b>Exam traps.</b> The verdict of a profile lives in the UTM log, the rule that decided in the traffic log through policyid. FortiView and saved searches exist in the real product but are theory here. A symptom with "no logs" is investigated down the chain, not by adding more filters.</p></div>

<div class="scn"><h4>Blocked, but not broken</h4><p>A Madurai manager escalated that the firewall "broke" the store's file-sharing client. The analyst found the UTM log with application BitTorrent, action block, policy 1, list APP-BLOCK, and sent the screenshot of the log and the policy to the manager. The ticket closed in ten minutes without any configuration change.</p><p><b>Lesson:</b> a log that proves intended behaviour is a complete fix.</p></div>

<div class="iv"><p class="q">"Walk me through how you investigate a user complaint with logs."</p><p>I restate the symptom with who, what, where and when, choose the log type, search by source IP, read devname, policyid and the verdict, open the policy on that FortiGate, decide fault or intended behaviour, fix if needed and then repeat the action to verify in a new search.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow five steps: symptom, log, policy, fix, verify.</li>
<li>The log gives devname and policyid; the policy shows the profile and the logging setting.</li>
<li>Many blocks are intended behaviour, and the log is the proof.</li>
<li>A zero result means walk the logging chain, not add filters.</li>
<li>FortiView and saved searches are theory here; keep a runbook of commands.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karta. Wo symptom sunta hai, ek test likhta hai, result padhta hai, diagnosis banata hai, treat karta hai, aur check karta hai ki patient theek hua. Log investigation ka rhythm bhi yahi hai. Skill har command jaanna nahi hai; skill sawaal poochne ka sahi order jaanna hai taaki aap kabhi andhera search na karo.</p>

<h3>Paanch steps</h3>
<ol>
<li><b>Symptom.</b> Complaint ko ek sentence mein likho: kaun, kya, kahan, kab. "Madurai user 10.20.0.10 subah se file-sharing client use nahi kar pa raha."</li>
<li><b>Log.</b> Sentence ko search mein badlo (chapter 3). Wo log type chuno jisme jawab hai: verdict UTM log mein, policy decision traffic log mein, change event log mein.</li>
<li><b>Policy.</b> Log aapko <code>policyid</code> deta hai aur UTM logs mein profile list (<code>applist</code>). <code>devname</code> mein jo FortiGate hai, uspar wo policy kholo.</li>
<li><b>Fix ya explain.</b> Decide karo ki behaviour fault hai ya intended rule. Company network par blocked P2P application aksar design ke hisaab se kaam kar rahi hoti hai.</li>
<li><b>Verify.</b> Action dobara karo aur phir search karo. Jo fix verify nahi kiya wo sirf ummeed hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Investigation steps">
<rect x="6" y="35" width="108" height="56" rx="8" fill="#e2e8f0"/><text x="60" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text>
<rect x="132" y="35" width="108" height="56" rx="8" fill="#bae6fd"/><text x="186" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Log</text>
<rect x="258" y="35" width="108" height="56" rx="8" fill="#ddd6fe"/><text x="312" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text>
<rect x="384" y="35" width="108" height="56" rx="8" fill="#fde68a"/><text x="438" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 Fix</text>
<rect x="510" y="35" width="124" height="56" rx="8" fill="#bbf7d0"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="114" y1="63" x2="132" y2="63" stroke="#64748b" stroke-width="2"/><line x1="240" y1="63" x2="258" y2="63" stroke="#64748b" stroke-width="2"/><line x1="366" y1="63" x2="384" y2="63" stroke="#64748b" stroke-width="2"/><line x1="492" y1="63" x2="510" y2="63" stroke="#64748b" stroke-width="2"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">log nahi mila? ek step peeche jao aur chapter 5 ki chain check karo</text>
</svg><p class="cap">Paanch steps; aakhri step kabhi skip mat karo.</p></div>

<h3>Case 1: blocked application</h3>
<p>Step 2 ne MDU-FGT par <code>policyid=1</code> aur <code>applist="APP-BLOCK"</code> wala UTM log diya. Step 3 ke liye wo policy MDU-FGT par kholte hain:</p>
<pre class="out">MDU-FGT # show full-configuration firewall policy 1
    edit 1
        set name "LAN-TO-WAN"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        <span class="hl">set application-list "APP-BLOCK"</span>
        set logtraffic all</pre>
<p>Policy list APP-BLOCK lagati hai, jo P2P category block karti hai. User ko fault nahi mila; network wahi kar raha hai jo security team ne configure kiya. Helpdesk ko jawab hai "policy se blocked, business reason ho to change process se exception maango".</p>

<h3>Case 2: koi log hi nahi</h3>
<p>Ab symptom hai "Trichy se browse karta hoon, par mera session nahi mil raha". Pehla search zero deta hai. Aap guess nahi karte; chain par wapas jaate ho. Device table jaldi bata deti hai ki kabhi kuch aaya ya nahi:</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0      2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      <span class="hl">0        0      0</span>      0      -</pre>
<p>TRY-FGT ne kisi bhi type ka log deliver nahi kiya. Connection aur registration theek hain (yahi lab aap agla karoge), to agla sawaal ye hai ki policy traffic logs likhti hai ya nahi, jo <code>logtraffic</code> ka sawaal hai. Har jawab problem ko ek link tak narrow karta hai.</p>

<h3>Saved searches aur FortiView</h3>
<p>Real product mein filter save karke dobara khol sakte ho, aur FortiView pages bina search ke top sources, top applications aur top threats ka summary dete hain. Simulator saved searches ya FortiView model nahi karta; command <code>execute fazui logview</code> hi ek entry point hai. Apni team ke liye sabse useful searches ko runbook (commands ka chhota page) mein likho taaki koi bhi engineer unhe repeat kar sake. Wahi saved search ka portable version hai.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "HQ users kehte hain intranet slow hai." Step 1: kaun, HQ LAN 10.10.0.0/24, SRV-WEB 192.0.2.80 tak. Step 2: <code>traffic srcip=10.10.0.* dstip=192.0.2.80 limit 5</code> policy 1 par paanch accepted sessions dikhata hai, sab ek hi second mein: firewall unhe accept kar raha hai, to policy ka masla nahi. Step 4: jawab hai ki firewall path healthy hai aur server ya link dekhna chahiye. Step 2 aur 3 ke bina team poori dopahar firewall rules badalti rehti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Log padhne se pehle policy badalna; devname na padhne se galat FortiGate fix karna; lambi kahani ka sirf newest log padhna; user ka action dobara kiye bina ticket close karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Profile ka verdict UTM log mein hota hai, jis rule ne decide kiya wo traffic log mein policyid se. FortiView aur saved searches real product mein hain par yahan theory hain. "No logs" wale symptom ko chain mein neeche investigate karte hain, aur filters badhakar nahi.</p></div>

<div class="scn"><h4>Blocked, par broken nahi</h4><p>Madurai ke manager ne escalate kiya ki firewall ne store ka file-sharing client "tod diya". Analyst ko application BitTorrent, action block, policy 1, list APP-BLOCK wala UTM log mila, aur usne log aur policy ka screenshot manager ko bhej diya. Ticket bina kisi configuration change ke dus minute mein close ho gaya.</p><p><b>Lesson:</b> jo log intended behaviour prove kare wahi complete fix hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao user complaint ko logs se kaise investigate karte ho."</p><p>Main symptom ko kaun, kya, kahan, kab ke saath dobara likhta hoon, log type chunta hoon, source IP se search karta hoon, devname, policyid aur verdict padhta hoon, us FortiGate par policy kholta hoon, fault ya intended behaviour decide karta hoon, zaroorat ho to fix karta hoon aur phir action dobara karke naye search se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch steps follow karo: symptom, log, policy, fix, verify.</li>
<li>Log devname aur policyid deta hai; policy profile aur logging setting dikhati hai.</li>
<li>Bahut se blocks intended behaviour hote hain, aur log uska proof hai.</li>
<li>Zero result ka matlab logging chain chalo, filters mat badhao.</li>
<li>FortiView aur saved searches yahan theory hain; commands ka runbook rakho.</li>
</ul></div>
`}};export{e as default};