var e={id:`rule-logging-settings`,h:{en:`Rule logging settings: log at session end and the profile link`,hi:`Rule logging settings: log at session end aur profile link`},body:{en:`
<p>Every security rule is two things at once: a decision (allow or deny) and a note-taking instruction (what to write down afterwards). New engineers focus on the first and forget the second. Think of a security guard at a gate. Letting a visitor in is the decision. Writing the visitor's name in the register is the logging setting. A guard who never writes anything in the register leaves you with no history, however good the decisions were.</p>

<h3>Two settings on every rule</h3>
<table class="tbl"><tr><th>Setting</th><th>CLI name</th><th>What it controls</th></tr>
<tr><td>Log at session end</td><td>log-end</td><td>Whether a log is written when the session finishes. In the lab it is yes unless you set it to no.</td></tr>
<tr><td>Log forwarding profile</td><td>log-setting</td><td>Which profile decides where the log is sent. With no profile, the log stays on the firewall.</td></tr>
</table>
<p>A third setting exists in real PAN-OS, logging at session start, which is usually left off because it adds volume. Check the documentation for your PAN-OS version for how start and end logs differ. The simulator teaches the session-end log.</p>

<h3>Why log at the end</h3>
<p>At the end of a session the firewall knows the whole story: how long it lasted, how many bytes moved, why it closed. One end log carries all of that. A start log would only say that something began. So the usual practice is one log at the end for allowed traffic. For a denied session there is nothing to wait for, so the deny is logged immediately.</p>

<h3>The rule in the lab</h3>
<p>Rules live in a device group on Panorama and are pushed. The logging settings are simply words on the rule line. A rule that logs and forwards looks like this in the lab:</p>
<pre class="code">set device-group NK-BRANCHES pre-rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow log-setting LFP</pre>
<p>Turning the end log off on the same rule would add <code>log-end no</code>. Switching it back on uses <code>log-end yes</code>. The rule itself still allows traffic either way. This is the trap: a rule with <code>log-end no</code> works perfectly for users, so nobody complains, and the logs silently stop.</p>

<h3>A reference for which rules to log</h3>
<ul>
<li><b>Allow rules for user traffic:</b> log at end and forward, so you can answer "who accessed what".</li>
<li><b>Explicit deny rules:</b> always log, since denies are the interesting events.</li>
<li><b>Noisy infrastructure rules</b> (monitoring probes, for example): decide deliberately. Either log locally only or filter them out of forwarding, to protect volume. Section 7 covers volume.</li>
<li><b>The default deny at the bottom:</b> real PAN-OS handles default rules specially; check the documentation for your PAN-OS version for their logging defaults.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Attaching a profile but setting <code>log-end no</code>; creating the profile but never naming it on the rule; editing the rule and forgetting to commit and push, so the firewall still runs the old rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> A forwarding profile on its own forwards nothing. It does its work only for rules that name it. Likewise a rule with a profile but no end log gives the profile nothing to select.</p></div>

<div class="scn"><h4>The rule nobody logged</h4><p>After a firewall migration, the new rules were copied but the logging setting was left off on the allow rule for the finance servers. Users were happy for months. During an audit nobody could show who had accessed the finance servers in that period. Policy had been right; evidence did not exist.</p><p><b>Lesson:</b> review logging settings during every policy change, not only the action.</p></div>

<div class="iv"><p class="q">"What two things on a security rule decide whether its traffic is visible on Panorama?"</p><p>First, that the rule writes a log, normally log at session end. Second, that it names a log forwarding profile so the log is sent to Panorama. Even then the profile's match list and the connection to Panorama must also work. I verify with test traffic and the logging status on the firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule decides traffic and decides what is recorded; both matter.</li>
<li>log-end controls the session-end log; log-setting names the forwarding profile.</li>
<li>A rule with log-end no works for users but produces no logs: a silent failure.</li>
<li>Changes reach the firewall only after commit and push.</li>
</ul></div>
`,hi:`
<p>Har security rule ek saath do cheezein hai: ek decision (allow ya deny) aur ek note-taking instruction (baad mein kya likhna hai). Naye engineers pehle par dhyan dete hain aur doosra bhool jate hain. Gate ka security guard socho. Visitor ko andar aane dena decision hai. Register mein visitor ka naam likhna logging setting hai. Jo guard register mein kabhi kuch nahi likhta, uske decisions chahe kitne bhi achhe hon, aapke paas history nahi hoti.</p>

<h3>Har rule par do settings</h3>
<table class="tbl"><tr><th>Setting</th><th>CLI name</th><th>Kya control karti hai</th></tr>
<tr><td>Log at session end</td><td>log-end</td><td>Session khatam hone par log likha jaye ya nahi. Lab mein ye yes hai jab tak aap no na karo.</td></tr>
<tr><td>Log forwarding profile</td><td>log-setting</td><td>Kaunsa profile decide karta hai log kahan jayega. Profile na ho to log firewall par hi rehta hai.</td></tr>
</table>
<p>Real PAN-OS mein ek teesri setting hoti hai, session start par logging, jo aam taur par off rakhi jati hai kyunki volume badhata hai. Start aur end logs ka fark apne PAN-OS version ki documentation mein check karo. Simulator session-end log sikhata hai.</p>

<h3>End par log kyun</h3>
<p>Session ke end par firewall ko poori kahani pata hoti hai: kitni der chala, kitne bytes gaye, kyun band hua. Ek end log ye sab carry karta hai. Start log sirf batata ki kuch shuru hua. Isliye allowed traffic ke liye aam practice end par ek log hai. Denied session mein intezaar karne ko kuch nahi, isliye deny turant log hota hai.</p>

<h3>Lab mein rule</h3>
<p>Rules Panorama par device group mein rehte hain aur push hote hain. Logging settings rule line ke saath likhe shabd hain. Jo rule log bhi karta hai aur forward bhi, lab mein aisa dikhta hai:</p>
<pre class="code">set device-group NK-BRANCHES pre-rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow log-setting LFP</pre>
<p>Usi rule par end log band karna <code>log-end no</code> jodta hai. Wapas on karne ke liye <code>log-end yes</code>. Dono hi haalat mein rule traffic allow karta rehta hai. Yahi trap hai: <code>log-end no</code> wala rule users ke liye perfectly chalta hai, isliye koi shikayat nahi karta, aur logs chupchaap band ho jate hain.</p>

<h3>Kin rules ko log karna hai, ek reference</h3>
<ul>
<li><b>User traffic ke allow rules:</b> end par log karo aur forward karo, taaki "kisne kya access kiya" ka jawab de sako.</li>
<li><b>Explicit deny rules:</b> hamesha log karo, kyunki denies interesting events hain.</li>
<li><b>Noisy infrastructure rules</b> (jaise monitoring probes): soch samajh kar decide karo. Ya sirf locally log karo, ya forwarding se filter karo, volume bachane ke liye. Volume section 7 mein.</li>
<li><b>Neeche ka default deny:</b> real PAN-OS default rules ko alag handle karta hai; unke logging defaults ke liye apne PAN-OS version ki documentation check karo.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Profile attach karna lekin <code>log-end no</code> rakhna; profile banana lekin rule par naam na dena; rule edit karke commit aur push bhool jana, to firewall purana rule chalata rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf forwarding profile kuch forward nahi karta. Wo sirf unhi rules ke liye kaam karta hai jo uska naam lete hain. Isi tarah profile wala rule jisme end log nahi, profile ko select karne ke liye kuch nahi deta.</p></div>

<div class="scn"><h4>Jis rule ko kisi ne log nahi kiya</h4><p>Firewall migration ke baad naye rules copy hue lekin finance servers ke allow rule par logging setting off reh gayi. Users mahino khush rahe. Audit mein koi nahi dikha paya ki us period mein finance servers ko kisne access kiya. Policy sahi thi; evidence exist hi nahi karta tha.</p><p><b>Lesson:</b> har policy change mein sirf action nahi, logging settings bhi review karo.</p></div>

<div class="iv"><p class="q">"Security rule par kaunsi do cheezein decide karti hain ki uska traffic Panorama par dikhega ya nahi?"</p><p>Pehli, rule log likhe, aam taur par session end par. Doosri, wo log forwarding profile ka naam le taaki log Panorama ko jaye. Phir bhi profile ki match list aur Panorama connection kaam karne chahiye. Main test traffic aur firewall par logging status se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule traffic bhi decide karta hai aur kya record hoga wo bhi; dono matter karte hain.</li>
<li>log-end session-end log control karta hai; log-setting forwarding profile ka naam deta hai.</li>
<li>log-end no wala rule users ke liye chalta hai lekin logs nahi deta: silent failure.</li>
<li>Changes firewall tak commit aur push ke baad hi pahunchte hain.</li>
</ul></div>
`}};export{e as default};