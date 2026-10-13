var e={id:`rule-logging`,h:{en:`Logging settings on rules: a preview of the logging module`,hi:`Rules par logging settings: logging module ka preview`},body:{en:`
<p><b>Analogy.</b> A security guard at a gate may or may not write each visitor in the register. A rule that does not log is a guard who lets people in without writing anything. When something goes wrong later, there is no record. The logging module of this track covers the whole log path; here we look only at what a <i>rule</i> contributes.</p>

<h3>What a rule controls</h3>
<p>Every security rule decides two things about logging:</p>
<table class="tbl"><tr><th>Setting</th><th>Meaning</th><th>Lab default</th></tr>
<tr><td><code>log-end</code></td><td>Write a traffic log when the session ends</td><td>yes</td></tr>
<tr><td><code>log-setting &lt;profile&gt;</code></td><td>Name of a log forwarding profile that sends matching logs to Panorama or syslog</td><td>none</td></tr>
</table>
<p>A traffic log is written on the firewall for each completed test session; denied sessions log when denied. But a log reaches Panorama only if all of these are true: the matched rule names a log forwarding profile, the rule logs, the profile has a match list whose filter matches that log and sends to Panorama, and the firewall is connected to the active Panorama with a collector. If any link is missing, the log waits on the firewall as "waiting to be forwarded".</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Log path overview">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Rule matches</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="12">log-end yes</text>
<rect x="150" y="30" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="215" y="52" text-anchor="middle" class="svg-ink" font-size="12">log-setting</text><text x="215" y="68" text-anchor="middle" class="svg-muted" font-size="12">profile + filter</text>
<rect x="310" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="375" y="52" text-anchor="middle" class="svg-ink" font-size="12">Firewall to</text><text x="375" y="68" text-anchor="middle" class="svg-muted" font-size="12">Panorama link</text>
<rect x="470" y="30" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="12">Collector stores it</text><text x="550" y="68" text-anchor="middle" class="svg-muted" font-size="12">visible on Panorama</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b"/><line x1="280" y1="55" x2="310" y2="55" stroke="#64748b"/><line x1="440" y1="55" x2="470" y2="55" stroke="#64748b"/>
</svg><p class="cap">The rule is the first link of the chain, and often the one forgotten.</p></div>

<h3>Where logging belongs in a hierarchy</h3>
<p>Log forwarding profiles are pushed with the device group. A profile defined in Shared is visible to every group, so central rules in Shared can name it. Most designs use the same logging profile on the final deny post-rule, because denied traffic is what investigators ask about first. A rule that allows busy traffic such as DNS may log less or use a narrower filter to control volume.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator): a rule that names a profile</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES post-rulebase security rules Deny-Rest-Log from any to any source any destination any application any service any action deny log-setting FWD-ALL log-end yes</pre>
<p>If you build such a rule, the profile named in <code>log-setting</code> must exist in a scope the rule's group can see, and its definition is covered in the logging module.</p>

<div class="eg"><p><b>Worked example.</b> After a block rule is pushed, a manager asks for proof that users hit it. The firewall shows a traffic log for each denied session, but Panorama shows nothing. The rule had no log-setting profile, so the logs stayed on the firewall. Adding a profile to the rule fixed it for new sessions; history before the change was not forwarded by that rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming "the firewall logs" means "Panorama has it"; setting log-end to no on a deny rule you want to audit; naming a profile that exists only in a child group from a Shared rule (same visibility rule as objects).</p></div>
<div class="exam"><p><b>Exam trap.</b> Logging is a chain: rule logs, profile references, filter matches, connection, collector. A rule with no log-setting profile writes logs locally but does not forward them.</p></div>

<div class="scn"><h4>Blocked, but nobody could prove it</h4><p>During an audit a company wanted evidence that its ban on a file-sharing application worked. The block rule existed on all firewalls but forwarded nothing, so central log search returned zero hits and auditors assumed the rule never matched. Adding a log forwarding profile to the rule in Shared produced logs from the next day onwards.</p><p><b>Lesson:</b> a control without a log is a control you cannot prove.</p></div>

<div class="iv"><p class="q">"What on a security rule decides whether its logs reach Panorama?"</p><p>The log-end setting and the log forwarding profile named on the rule. The profile's match list and filter must match the log and send to Panorama, and the firewall must be connected to the active Panorama with a collector available. I check the rule first because it is the most commonly forgotten link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule contributes log-end and a log-setting profile to the log path.</li>
<li>Without a profile on the rule, logs stay on the firewall.</li>
<li>Profiles are pushed with the device group and obey the same visibility rules as objects.</li>
<li>Always log denies you will want to prove; control volume on busy allows.</li>
<li>The full path is covered in the logging module.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Gate par security guard har visitor ko register mein likhta bhi hai ya nahi bhi. Jo rule log nahi karti wo aisa guard hai jo bina kuch likhe logon ko andar jaane deta hai. Baad mein kuch galat ho to koi record nahi. Is track ka logging module poora log path cover karta hai; yahan hum sirf dekhte hain ki ek <i>rule</i> kya contribute karti hai.</p>

<h3>Rule kya control karti hai</h3>
<p>Har security rule logging ke baare mein do cheezein decide karti hai:</p>
<table class="tbl"><tr><th>Setting</th><th>Matlab</th><th>Lab default</th></tr>
<tr><td><code>log-end</code></td><td>Session khatam hone par traffic log likho</td><td>yes</td></tr>
<tr><td><code>log-setting &lt;profile&gt;</code></td><td>Log forwarding profile ka naam jo matching logs Panorama ya syslog ko bhejta hai</td><td>none</td></tr>
</table>
<p>Har completed test session ke liye firewall par traffic log likha jata hai; denied sessions deny hone par log hote hain. Lekin log Panorama tak tabhi pahunchta hai jab ye sab sach hon: matched rule log forwarding profile ka naam le, rule log kare, profile ki match list ka filter us log se match kare aur Panorama ko bheje, aur firewall active Panorama se connected ho aur collector ho. Koi bhi kadi missing ho to log firewall par "waiting to be forwarded" rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Log path overview">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="12">Rule match</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="12">log-end yes</text>
<rect x="150" y="30" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="215" y="52" text-anchor="middle" class="svg-ink" font-size="12">log-setting</text><text x="215" y="68" text-anchor="middle" class="svg-muted" font-size="12">profile + filter</text>
<rect x="310" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="375" y="52" text-anchor="middle" class="svg-ink" font-size="12">Firewall se</text><text x="375" y="68" text-anchor="middle" class="svg-muted" font-size="12">Panorama link</text>
<rect x="470" y="30" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="12">Collector store karta</text><text x="550" y="68" text-anchor="middle" class="svg-muted" font-size="12">Panorama par dikhta</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b"/><line x1="280" y1="55" x2="310" y2="55" stroke="#64748b"/><line x1="440" y1="55" x2="470" y2="55" stroke="#64748b"/>
</svg><p class="cap">Rule chain ki pehli kadi hai, aur aksar wahi bhooli jati hai.</p></div>

<h3>Hierarchy mein logging kahan belong karti hai</h3>
<p>Log forwarding profiles device group ke saath push hote hain. Shared mein define profile har group ko dikhta hai, isliye Shared ki central rules use naam se le sakti hain. Zyadatar designs final deny post-rule par wahi logging profile use karte hain, kyunki investigators sabse pehle denied traffic ke baare mein puchte hain. Busy traffic allow karne wali rule (jaise DNS) volume control ke liye kam log kar sakti hai ya narrow filter use kar sakti hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator): profile ka naam lene wali rule</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES post-rulebase security rules Deny-Rest-Log from any to any source any destination any application any service any action deny log-setting FWD-ALL log-end yes</pre>
<p>Aisi rule banao to <code>log-setting</code> mein diya profile us scope mein hona chahiye jo rule ka group dekh sake, aur uski definition logging module mein hai.</p>

<div class="eg"><p><b>Worked example.</b> Block rule push hone ke baad manager proof maangta hai ki users ne use hit kiya. Firewall har denied session ka traffic log dikhata hai, par Panorama kuch nahi dikhata. Rule mein log-setting profile nahi tha, isliye logs firewall par hi rahe. Rule mein profile jodne se naye sessions ke liye fix hua; change se pehle ki history us rule se forward nahi hui.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Firewall log karta hai" ka matlab "Panorama ke paas hai" samajhna; jis deny rule ko audit karna hai us par log-end no set karna; Shared rule se aisa profile naam lena jo sirf child group mein hai (objects wali visibility rule).</p></div>
<div class="exam"><p><b>Exam trap.</b> Logging ek chain hai: rule log kare, profile reference ho, filter match kare, connection ho, collector ho. Log-setting profile ke bina rule logs local likhti hai par forward nahi karti.</p></div>

<div class="scn"><h4>Block tha, par koi prove nahi kar paya</h4><p>Audit ke dauran ek company ko evidence chahiye tha ki file-sharing application ka uska ban kaam karta hai. Block rule sab firewalls par thi par kuch forward nahi karti thi, isliye central log search zero hits deta tha aur auditors ne maan liya ki rule kabhi match hi nahi hui. Shared ki rule mein log forwarding profile jodne se agle din se logs aane lage.</p><p><b>Lesson:</b> jis control ka log nahi, use aap prove nahi kar sakte.</p></div>

<div class="iv"><p class="q">"Security rule par kya decide karta hai ki uske logs Panorama tak pahunchenge?"</p><p>Rule par log-end setting aur log forwarding profile ka naam. Profile ki match list aur filter log se match karke Panorama ko bhejein, aur firewall active Panorama se connected ho aur collector available ho. Main rule pehle check karta hoon kyunki wahi sabse zyada bhooli jane wali kadi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule log path mein log-end aur log-setting profile contribute karti hai.</li>
<li>Rule par profile ke bina logs firewall par rehte hain.</li>
<li>Profiles device group ke saath push hote hain aur objects jaisi visibility rules follow karte hain.</li>
<li>Jin denies ko prove karna ho unhe hamesha log karo; busy allows par volume control karo.</li>
<li>Poora path logging module mein cover hai.</li>
</ul></div>
`}};export{e as default};