var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a FortiGate that dropped everything and you finish it able to build, order, log, test and troubleshoot a rule base. This last chapter pulls the module together so you can revise in fifteen minutes before an exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">Match</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">6 attributes (AND)</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">address, service, time</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">top-down, first match</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Implicit deny</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">policy 0</text>
<rect x="90" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="160" y="142" text-anchor="middle" class="svg-muted" font-size="11">logs, hits, sessions</text>
<rect x="250" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Lookup</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">iprope lookup</text>
<rect x="410" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="480" y="142" text-anchor="middle" class="svg-muted" font-size="11">least privilege</text>
</svg><p class="cap">Seven ideas. If you can explain each one in your own words, you are ready.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the six match attributes of a policy and say which one comes from routing.</li>
<li>Create address, address group, custom service and service group objects in the CLI.</li>
<li>Build a complete accept policy with NAT and logging, and explain why the default action is deny.</li>
<li>Explain top-down, first-match evaluation and why ID is not order; reorder with <code>move</code>.</li>
<li>Explain the implicit deny, policy 0, and enable its logging.</li>
<li>Spot a shadowed policy from hit counters and fix it by narrowing and reordering.</li>
<li>Run <code>diagnose firewall iprope lookup</code> correctly (ingress interface last) and read the result.</li>
<li>Read a traffic log line and a verbose session entry, including <code>policy_id</code>.</li>
<li>Apply least privilege, naming, comments and disable-then-delete.</li>
<li>Follow the six-step troubleshooting workflow aloud.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Policy</dt><dd>A rule matching ingress and egress interface, source, destination, service and schedule, with an action.</dd>
<dt>Implicit deny</dt><dd>The hidden last rule that drops anything not allowed; shown as policy id 0.</dd>
<dt>Shadowing</dt><dd>A policy that is never reached because an earlier one matches the same traffic.</dd>
<dt>Address object</dt><dd>A named subnet, range, FQDN or country used as source or destination.</dd>
<dt>Service object</dt><dd>A named protocol plus destination port range, for example HTTPS = TCP 443.</dd>
<dt>Schedule</dt><dd>A time window (always, recurring, one-time) when a policy is active.</dd>
<dt>Session</dt><dd>The record created when a policy accepts the first packet; later packets follow it.</dd>
<dt>Hit count</dt><dd>How many sessions a policy has decided, with first and last use.</dd>
<dt>Policy lookup</dt><dd>A test that tells which policy a described packet would match, without sending it.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Evaluation order</td><td>Top to bottom in list order; first match wins</td></tr>
<tr><td>Default action of a new policy</td><td>deny</td></tr>
<tr><td>What drops unmatched traffic</td><td>implicit deny, policy id 0</td></tr>
<tr><td>Logs for implicit deny</td><td><code>config log setting</code>, <code>set fwpolicy-implicit-log enable</code></td></tr>
<tr><td>logtraffic values</td><td>disable, utm (default), all</td></tr>
<tr><td>Where the egress interface comes from</td><td>The routing table, before the policy lookup</td></tr>
<tr><td>Which interface the lookup tool wants</td><td>The ingress interface, last argument</td></tr>
<tr><td>Disabled policy</td><td>Skipped as if absent</td></tr>
<tr><td>Policy change affects</td><td>New sessions (existing ones depend on session-dirty settings)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">config firewall address
    edit LAN_NET
        set subnet 10.0.1.0 255.255.255.0
config firewall service group
    edit WEB-DNS-PING
        set member HTTP HTTPS DNS PING
config firewall policy
    edit 0
        set name ... set srcintf ... set dstintf ...
        set srcaddr ... set dstaddr ... set action accept
        set schedule always set service ... set nat enable
        set logtraffic all
    move 3 before 1
show firewall policy            <span class="c">! configuration</span>
get firewall policy 1           <span class="c">! all effective values</span>
diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
diagnose firewall iprope show 100004 1
get system session list
diagnose sys session list
execute log filter category 0
execute log display
config log setting
    set fwpolicy-implicit-log enable</pre>

<h3>Practice in the labs</h3>
<p>Practise in the two labs of this module: <b>LAN to internet with address and service objects</b> (build objects, one policy, prove SSH stays blocked) and <b>A deny policy shadows everything</b> (read counters, narrow the deny, add an exception above it). Then move on to <code>nse4-nat</code>, where the same policies gain source NAT, IP pools and virtual IPs.</p>

<div class="eg"><p><b>Worked example for revision.</b> Say out loud: "Traffic from 10.0.1.10 to 8.8.8.8 TCP 80 arrives on port2. Routing picks port1. FortiGate walks the list: policy 3 does not match (source is MKT_PC), policy 1 does not match (destination is SOCIAL_SITE), policy 2 matches all six attributes, so it accepts, creates a session and applies NAT." If you can narrate that, you understand the module.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> Do not confuse the policy ID with the order. Do not forget <code>action accept</code>. Do not expect the implicit deny in the log without enabling it. Do not widen a policy to fix a symptom.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Five wording traps: "first match, not best match"; "list order, not ID"; "ingress interface in the lookup"; "utm is the default log level, not all"; "policy 0 is not editable".</p></div>

<div class="scn"><h4>The interview that turned on one sentence</h4><p>A candidate was asked why a rule "allow SSH to server" had no hits. She did not guess. She said, "I would run a lookup for the client IP to the server on the ingress interface, then compare hit counters of that rule and any deny above it." The interviewer later said that single sentence showed she understood first-match and evidence-based troubleshooting.</p><p><b>Lesson:</b> a method beats a guess, in interviews and in production.</p></div>

<div class="iv"><p class="q">"Summarise how a FortiGate decides to allow a connection."</p><p>It routes the first packet to find the egress interface, then walks the policy list top-down and uses the first policy whose interfaces, addresses, service and schedule all match. Accept creates a session; deny or no match (implicit deny, policy 0) drops. Then explain objects, logging, the lookup tool and least privilege in one sentence each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match on six attributes, evaluate top-down, first match wins, implicit deny last.</li>
<li>Objects and groups keep policies short and changes safe.</li>
<li>Hit counters, logs, sessions and the lookup tool provide proof.</li>
<li>Least privilege, names, comments and disable-then-delete keep rule bases healthy.</li>
<li>Next modules: <code>nse4-nat</code> for translation, then <code>nse4-auth</code> for user-based policies.</li>
</ul></div>
`,hi:`
<p>Aapne is module ki shuruat aise FortiGate se ki thi jo sab kuch drop karta tha, aur ab aap rule base ko banana, order dena, log karna, test karna aur troubleshoot karna jaante ho. Yeh aakhri chapter module ko ek jagah samet deta hai taaki exam ya interview se pehle aap pandrah minute mein revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">Match</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">6 attributes (AND)</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">Objects</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">address, service, time</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">upar se, pehla match</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">Implicit deny</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">policy 0</text>
<rect x="90" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="160" y="142" text-anchor="middle" class="svg-muted" font-size="11">logs, hits, sessions</text>
<rect x="250" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Lookup</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">iprope lookup</text>
<rect x="410" y="100" width="140" height="55" rx="10" fill="#fed7aa"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="13">Design</text><text x="480" y="142" text-anchor="middle" class="svg-muted" font-size="11">least privilege</text>
</svg><p class="cap">Saat ideas. Har ek ko apne words mein samjha sako to aap ready ho.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Policy ke chhe match attributes batao aur yeh bhi ki kaunsa routing se aata hai.</li>
<li>CLI mein address, address group, custom service aur service group objects banao.</li>
<li>NAT aur logging ke saath poori accept policy banao, aur batao ki default action deny kyun hai.</li>
<li>Top-down, first-match evaluation samjhao aur yeh ki ID order nahi hai; <code>move</code> se reorder karo.</li>
<li>Implicit deny, policy 0 samjhao, aur uski logging enable karo.</li>
<li>Hit counters se shadowed policy pehchano aur narrow aur reorder karke fix karo.</li>
<li><code>diagnose firewall iprope lookup</code> sahi chalao (ingress interface aakhir mein) aur result padho.</li>
<li>Traffic log line aur verbose session entry padho, <code>policy_id</code> samet.</li>
<li>Least privilege, naming, comments aur disable-then-delete apply karo.</li>
<li>Chhe-step troubleshooting workflow bolkar samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Policy</dt><dd>Ingress aur egress interface, source, destination, service aur schedule ko match karne wala rule, action ke saath.</dd>
<dt>Implicit deny</dt><dd>Hidden aakhri rule jo jo allowed nahi use drop karta hai; policy id 0 ke roop mein dikhta hai.</dd>
<dt>Shadowing</dt><dd>Aisi policy jiske tak kabhi pahunchte nahi kyunki pehle ki policy wahi traffic match kar leti hai.</dd>
<dt>Address object</dt><dd>Named subnet, range, FQDN ya country jo source ya destination ke roop mein use hota hai.</dd>
<dt>Service object</dt><dd>Named protocol aur destination port range, jaise HTTPS = TCP 443.</dd>
<dt>Schedule</dt><dd>Time window (always, recurring, one-time) jab policy active hoti hai.</dd>
<dt>Session</dt><dd>Policy pehle packet ko accept kare to banne wala record; baad ke packets use follow karte hain.</dd>
<dt>Hit count</dt><dd>Policy ne kitne sessions decide kiye, first aur last use ke saath.</dd>
<dt>Policy lookup</dt><dd>Ek test jo batata hai ki describe kiya gaya packet kaunsi policy match karega, use bheje bina.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Evaluation order</td><td>List order mein upar se neeche; pehla match jeetta hai</td></tr>
<tr><td>Nayi policy ka default action</td><td>deny</td></tr>
<tr><td>Unmatched traffic kaun drop karta hai</td><td>implicit deny, policy id 0</td></tr>
<tr><td>Implicit deny ke logs</td><td><code>config log setting</code>, <code>set fwpolicy-implicit-log enable</code></td></tr>
<tr><td>logtraffic values</td><td>disable, utm (default), all</td></tr>
<tr><td>Egress interface kahan se aata hai</td><td>Routing table se, policy lookup se pehle</td></tr>
<tr><td>Lookup tool kaunsa interface maangta hai</td><td>Ingress interface, aakhri argument</td></tr>
<tr><td>Disabled policy</td><td>Aise skip hoti hai jaise hai hi nahi</td></tr>
<tr><td>Policy change kispar asar karta hai</td><td>Naye sessions par (existing sessions session-dirty settings par depend karte hain)</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">config firewall address
    edit LAN_NET
        set subnet 10.0.1.0 255.255.255.0
config firewall service group
    edit WEB-DNS-PING
        set member HTTP HTTPS DNS PING
config firewall policy
    edit 0
        set name ... set srcintf ... set dstintf ...
        set srcaddr ... set dstaddr ... set action accept
        set schedule always set service ... set nat enable
        set logtraffic all
    move 3 before 1
show firewall policy            <span class="c">! configuration</span>
get firewall policy 1           <span class="c">! all effective values</span>
diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
diagnose firewall iprope show 100004 1
get system session list
diagnose sys session list
execute log filter category 0
execute log display
config log setting
    set fwpolicy-implicit-log enable</pre>

<h3>Labs mein practise</h3>
<p>Is module ke do labs mein practise karo: <b>Address aur service objects ke saath LAN se internet</b> (objects banao, ek policy, saabit karo ki SSH band rehta hai) aur <b>Ek deny policy sab kuch shadow karti hai</b> (counters padho, deny narrow karo, uske upar exception daalo). Phir <code>nse4-nat</code> par jao, jahan wahi policies source NAT, IP pools aur virtual IPs paati hain.</p>

<div class="eg"><p><b>Revision ke liye worked example.</b> Zor se bolo: "10.0.1.10 se 8.8.8.8 TCP 80 ka traffic port2 par aata hai. Routing port1 chunti hai. FortiGate list chalata hai: policy 3 match nahi karti (source MKT_PC hai), policy 1 match nahi karti (destination SOCIAL_SITE hai), policy 2 chhe ke chhe attributes match karti hai, isliye accept karti hai, session banati hai aur NAT lagati hai." Yeh narrate kar sako to aapne module samjha.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> Policy ID ko order mat samjho. <code>action accept</code> mat bhoolo. Implicit deny ko enable kiye bina log mein mat dhoondo. Symptom theek karne ke liye policy ko widen mat karo.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Paanch wording traps: "first match, best match nahi"; "list order, ID nahi"; "lookup mein ingress interface"; "utm default log level hai, all nahi"; "policy 0 editable nahi hai".</p></div>

<div class="scn"><h4>Woh interview jo ek vaakya par palta</h4><p>Ek candidate se poochha gaya ki "allow SSH to server" rule ke hits kyun nahi hain. Usne andaza nahi lagaya. Usne kaha, "Main client IP se server tak ingress interface par lookup chalaunga, phir us rule aur uske upar kisi bhi deny ke hit counters compare karunga." Interviewer ne baad mein kaha ki us ek vaakya ne dikhaya ki use first-match aur evidence-based troubleshooting samajh aati hai.</p><p><b>Lesson:</b> method andaze se behtar hai, interview mein bhi aur production mein bhi.</p></div>

<div class="iv"><p class="q">"Summarise karo ki FortiGate connection allow karne ka decision kaise leta hai."</p><p>Woh pehle packet ko route karke egress interface dhoondta hai, phir policy list upar se neeche chalata hai aur pehli policy use karta hai jiske interfaces, addresses, service aur schedule sab match karein. Accept session banata hai; deny ya no match (implicit deny, policy 0) drop karta hai. Phir objects, logging, lookup tool aur least privilege ko ek-ek vaakya mein samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe attributes par match, top-down evaluate, pehla match jeetta hai, aakhir mein implicit deny.</li>
<li>Objects aur groups policies chhoti aur changes safe rakhte hain.</li>
<li>Hit counters, logs, sessions aur lookup tool saboot dete hain.</li>
<li>Least privilege, names, comments aur disable-then-delete rule bases ko healthy rakhte hain.</li>
<li>Agle modules: translation ke liye <code>nse4-nat</code>, phir user-based policies ke liye <code>nse4-auth</code>.</li>
</ul></div>
`}};export{e as default};