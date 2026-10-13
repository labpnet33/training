var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have followed one idea from start to end: measure the transports, define what is good enough, list the transports in order of preference, and attach that list to the right application with a rule. The chapter below collects everything you need on the day of a lab, an interview or an exam.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module summary pipeline">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="65" y="73" text-anchor="middle" class="svg-muted" font-size="12">identified</text>
<rect x="140" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="55" text-anchor="middle" class="svg-ink" font-size="13">Policy rule</text><text x="195" y="73" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="270" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="325" y="73" text-anchor="middle" class="svg-muted" font-size="12">profile</text>
<rect x="400" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="55" text-anchor="middle" class="svg-ink" font-size="13">SLA profile</text><text x="455" y="73" text-anchor="middle" class="svg-muted" font-size="12">vs measured</text>
<rect x="530" y="30" width="100" height="60" rx="8" fill="#bae6fd"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="13">Transport</text><text x="580" y="73" text-anchor="middle" class="svg-muted" font-size="12">MPLS/Inet/LTE</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">No rule match: ECMP over all up tunnels</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">None meets SLA: fallback allow = best path, drop = dropped</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">QoS protects packets on the chosen path; DIA and firewall are separate decisions</text>
</svg><p class="cap">Application, rule, forwarding profile, SLA, transport.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can state the latency, jitter and loss needs of voice, video, ERP, web and backup.</li>
<li>I can explain why DPI and custom applications are used instead of ports, and why a wrong match is silent.</li>
<li>I can read <code>sla-monitor status</code> and say which transports meet which profile.</li>
<li>I can create an SLA profile, a forwarding profile and a rule in the correct order.</li>
<li>I can predict the steering result by hand for any set of numbers.</li>
<li>I can explain first match, rule order and the ECMP default.</li>
<li>I can explain brownout versus blackout and fix a breach without weakening the SLA.</li>
<li>I can troubleshoot a rule that never matches with a positive and a negative test.</li>
<li>I can describe QoS, DSCP, shaping and policing, DIA and basic security at foundation level.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SLA profile</dt><dd>Latency, jitter and loss limits for a class of traffic.</dd>
<dt>SLA monitor</dt><dd>Probe-based measurement of each transport.</dd>
<dt>Forwarding profile</dt><dd>SLA reference, ordered transport list and fallback.</dd>
<dt>Policy / rule</dt><dd>Ordered container of match-and-action entries; first match wins.</dd>
<dt>Fallback allow / drop</dt><dd>Use the best available path, or drop, when nothing meets the SLA.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: default load balancing over all up tunnels.</dd>
<dt>Brownout / blackout</dt><dd>Degraded but up, or completely down.</dd>
<dt>Hysteresis</dt><dd>Hold and recovery time that prevents path flapping.</dd>
<dt>DSCP / EF</dt><dd>IP QoS marking; EF (46) is voice.</dd>
<dt>DIA</dt><dd>Direct internet access: local breakout of Internet-bound traffic.</dd>
<dt>NGFW / zone</dt><dd>Application-aware firewall; zones group interfaces by trust.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Course VOICE SLA</td><td>150 ms latency, 30 ms jitter, 1 % loss</td></tr>
<tr><td>Meets SLA means</td><td>all three metrics less than or equal to the limits</td></tr>
<tr><td>Default circuits (lat/jit/loss)</td><td>Internet 30/6/0.3; MPLS 20/2/0.05; LTE 60/15/1</td></tr>
<tr><td>Decision rule</td><td>first transport in the list that is up and meets the SLA</td></tr>
<tr><td>No SLA met</td><td>allow = best latency candidate; drop = dropped</td></tr>
<tr><td>No rule matches</td><td>ECMP across every tunnel that is up</td></tr>
<tr><td>Transport not in list</td><td>never considered by that profile</td></tr>
<tr><td>Undefined forwarding profile</td><td>traffic dropped</td></tr>
<tr><td>Voice QoS</td><td>DSCP EF 46, strict priority queue</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! configuration (organization Acme)</span>
set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
set orgs org-services Acme sd-wan sla-profiles VOICE loss 1
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet,LTE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP
commit</pre>
<pre class="out">show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan path-selection application voice
show orgs org-services Acme sd-wan sla-profiles
show orgs org-services Acme sd-wan forwarding-profiles
show orgs org-services Acme sd-wan policies</pre>

<div class="exam"><p><b>Last traps:</b> brownout is up but failing; limits are inclusive; a commit proves syntax, not intent; fallback drop is deliberate; a rule that matches the wrong application is silent; the lab CLI is a simplified model of real Versa.</p></div>

<div class="warn"><p><b>Do not forget:</b> the course helper <code>path-selection</code> and the model's <code>request ...</code> forms do not exist exactly like this on production devices. In real Versa you work in the Director and use the VOS CLI and Analytics.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>An interviewer draws three circuits and a voice call and asks "where does it go?" The candidate asks for the SLA numbers, checks the priority list, skips down tunnels, picks the first that meets the SLA, then explains the fallback and the ECMP default for anything unmatched. She adds QoS marking and a monitoring check at the end. She gets the offer.</p><p><b>Lesson:</b> A calm, ordered method beats memorised commands.</p></div>

<div class="iv"><p class="q">"Summarise how SD-WAN policy chooses a path in thirty seconds."</p><p>The application is identified, the first matching rule gives a forwarding profile, the profile walks its transport list skipping down tunnels and takes the first that meets the SLA profile. If none does, fallback allow uses the best path and drop discards. No rule match means ECMP over all up tunnels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule, then forwarding profile, then SLA check, then transport.</li>
<li>Know the decision rule and the three outcomes: forward, ECMP, drop.</li>
<li>Fix breaches by adding good paths, not by weakening SLAs.</li>
<li>Verify with path-selection, sla-monitor, policies and forwarding-profiles.</li>
</ul></div>
`,hi:`
<p>Aapne ek idea shuru se end tak follow kiya: transports measure karo, define karo ki kya kaafi achha hai, transports ko preference ke order mein list karo, aur us list ko rule se sahi application ke saath jodo. Neeche ka chapter woh sab collect karta hai jo aapko lab, interview ya exam ke din chahiye.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module summary pipeline">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="65" y="73" text-anchor="middle" class="svg-muted" font-size="12">identified</text>
<rect x="140" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="55" text-anchor="middle" class="svg-ink" font-size="13">Policy rule</text><text x="195" y="73" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="270" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="325" y="73" text-anchor="middle" class="svg-muted" font-size="12">profile</text>
<rect x="400" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="55" text-anchor="middle" class="svg-ink" font-size="13">SLA profile</text><text x="455" y="73" text-anchor="middle" class="svg-muted" font-size="12">vs measured</text>
<rect x="530" y="30" width="100" height="60" rx="8" fill="#bae6fd"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="13">Transport</text><text x="580" y="73" text-anchor="middle" class="svg-muted" font-size="12">MPLS/Inet/LTE</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Rule match nahi: sab up tunnels par ECMP</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Koi SLA meet nahi: fallback allow = best path, drop = dropped</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">QoS chune hue path par packets ko protect karta hai; DIA aur firewall alag decisions hain</text>
</svg><p class="cap">Application, rule, forwarding profile, SLA, transport.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main voice, video, ERP, web aur backup ki latency, jitter aur loss needs bata sakta hoon.</li>
<li>Main samjha sakta hoon ki ports ki jagah DPI aur custom applications kyun use hote hain, aur galat match silent kyun hota hai.</li>
<li>Main <code>sla-monitor status</code> padh sakta hoon aur bata sakta hoon ki kaunse transports kaunsa profile meet karte hain.</li>
<li>Main SLA profile, forwarding profile aur rule sahi order mein bana sakta hoon.</li>
<li>Main kisi bhi numbers ke set ke liye steering result haath se predict kar sakta hoon.</li>
<li>Main first match, rule order aur ECMP default samjha sakta hoon.</li>
<li>Main brownout versus blackout samjha sakta hoon aur SLA weak kiye bina breach fix kar sakta hoon.</li>
<li>Main aise rule ko troubleshoot kar sakta hoon jo kabhi match nahi karta, positive aur negative test ke saath.</li>
<li>Main QoS, DSCP, shaping aur policing, DIA aur basic security foundation level par describe kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SLA profile</dt><dd>Traffic ki ek class ke liye latency, jitter aur loss limits.</dd>
<dt>SLA monitor</dt><dd>Har transport ki probe-based measurement.</dd>
<dt>Forwarding profile</dt><dd>SLA reference, ordered transport list aur fallback.</dd>
<dt>Policy / rule</dt><dd>Match-and-action entries ka ordered container; pehla match jeetta hai.</dd>
<dt>Fallback allow / drop</dt><dd>Jab kuch SLA meet na kare to best available path use karo, ya drop karo.</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: sab up tunnels par default load balancing.</dd>
<dt>Brownout / blackout</dt><dd>Degraded lekin up, ya poori tarah down.</dd>
<dt>Hysteresis</dt><dd>Hold aur recovery time jo path flapping rokta hai.</dd>
<dt>DSCP / EF</dt><dd>IP QoS marking; EF (46) voice hai.</dd>
<dt>DIA</dt><dd>Direct internet access: Internet-bound traffic ka local breakout.</dd>
<dt>NGFW / zone</dt><dd>Application-aware firewall; zones interfaces ko trust ke hisaab se group karte hain.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Course VOICE SLA</td><td>150 ms latency, 30 ms jitter, 1 % loss</td></tr>
<tr><td>Meets SLA ka matlab</td><td>teeno metrics limits ke kam ya barabar</td></tr>
<tr><td>Default circuits (lat/jit/loss)</td><td>Internet 30/6/0.3; MPLS 20/2/0.05; LTE 60/15/1</td></tr>
<tr><td>Decision rule</td><td>list ka pehla transport jo up hai aur SLA meet karta hai</td></tr>
<tr><td>Koi SLA meet nahi</td><td>allow = best latency candidate; drop = dropped</td></tr>
<tr><td>Koi rule match nahi</td><td>har up tunnel par ECMP</td></tr>
<tr><td>List mein na hone wala transport</td><td>us profile dwara kabhi consider nahi hota</td></tr>
<tr><td>Undefined forwarding profile</td><td>traffic dropped</td></tr>
<tr><td>Voice QoS</td><td>DSCP EF 46, strict priority queue</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! configuration (organization Acme)</span>
set orgs org-services Acme sd-wan sla-profiles VOICE latency 150
set orgs org-services Acme sd-wan sla-profiles VOICE jitter 30
set orgs org-services Acme sd-wan sla-profiles VOICE loss 1
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP sla-profile VOICE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP transport-priority MPLS,Internet,LTE
set orgs org-services Acme sd-wan forwarding-profiles VOICE-FP fallback allow
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme sd-wan policies CORP rules R-VOICE action forwarding-profile VOICE-FP
commit</pre>
<pre class="out">show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan path-selection application voice
show orgs org-services Acme sd-wan sla-profiles
show orgs org-services Acme sd-wan forwarding-profiles
show orgs org-services Acme sd-wan policies</pre>

<div class="exam"><p><b>Aakhri traps:</b> brownout up hota hai lekin fail; limits inclusive hain; commit syntax prove karta hai, intent nahi; fallback drop deliberate hai; galat application match karne wala rule silent hai; lab CLI real Versa ka simplified model hai.</p></div>

<div class="warn"><p><b>Bhoolna mat:</b> course helper <code>path-selection</code> aur model ke <code>request ...</code> forms production devices par bilkul aise exist nahi karte. Real Versa mein aap Director mein kaam karte ho aur VOS CLI aur Analytics use karte ho.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Interviewer teen circuits aur ek voice call draw karta hai aur poochhta hai "yeh kahan jaati hai?" Candidate SLA numbers maangti hai, priority list check karti hai, down tunnels skip karti hai, SLA meet karne wala pehla chunti hai, phir fallback aur kisi bhi unmatched cheez ke liye ECMP default samjhati hai. Aakhir mein woh QoS marking aur monitoring check jodti hai. Use offer mil jaata hai.</p><p><b>Lesson:</b> Shaant, ordered method ratte hue commands se behtar hai.</p></div>

<div class="iv"><p class="q">"SD-WAN policy path kaise chunti hai, tees second mein summarise karo."</p><p>Application identify hoti hai, pehla matching rule forwarding profile deta hai, profile apni transport list mein chalta hai, down tunnels skip karta hai aur SLA profile meet karne wala pehla leta hai. Agar koi na kare to fallback allow best path use karta hai aur drop discard karta hai. Rule match nahi to sab up tunnels par ECMP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule, phir forwarding profile, phir SLA check, phir transport.</li>
<li>Decision rule aur teen outcomes yaad rakho: forward, ECMP, drop.</li>
<li>Breaches achhe paths add karke fix karo, SLAs weak karke nahi.</li>
<li>path-selection, sla-monitor, policies aur forwarding-profiles se verify karo.</li>
</ul></div>
`}};export{e as default};