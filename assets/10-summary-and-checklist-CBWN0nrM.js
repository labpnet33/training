var e={id:`summary-and-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`<p><b>Analogy.</b> You now own a well-run reception desk: names for people and services, a written rule list in the right order, a tally sheet, and a guard at the gate who stops stampedes before anyone reads the list.</p>
<h3>You can now</h3>
<ul><li>create address entries, nest them in address sets, and use them in policies;</li><li>define custom applications and group them in application sets;</li><li>write a policy with source, destination, application, an action, count and log;</li><li>explain first-match order, shadowing, and fix order with <code>insert before/after</code>;</li><li>explain zone-pair, global and default policy order;</li><li>troubleshoot with <code>hit-count</code>, <code>flow session</code> and <code>match-policies</code>;</li><li>build and read screens, and explain why they act before policy;</li><li>explain what the user sees with deny versus reject;</li><li>describe schedulers as a concept.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Address book</dt><dd>Names for IP prefixes; global or zone based.</dd><dt>Address set</dt><dd>A named group of addresses and sets.</dd><dt>Application</dt><dd>A name for a protocol and port.</dd><dt>Shadowing</dt><dd>A broad policy above a specific one so the specific one never matches.</dd><dt>Screen (ids-option)</dt><dd>An attack check applied to a zone before session and policy.</dd><dt>reject</dt><dd>Block and tell the sender (reset or ICMP unreachable).</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Policy evaluation</td><td>Top to bottom, first match wins</td></tr>
<tr><td>Order of stages</td><td>Zone pair, global, default (deny-all)</td></tr>
<tr><td>Screens act</td><td>Before session lookup and policy, per ingress zone</td></tr>
<tr><td>Hit count counts</td><td>Sessions, not packets</td></tr>
<tr><td>Reorder a policy</td><td>insert ... before or after</td></tr>
<tr><td>reject for TCP sends</td><td>A reset</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show security policies
show security policies hit-count
show security policies from-zone trust to-zone dmz
show security match-policies from-zone A to-zone B source-ip X destination-ip Y protocol tcp destination-port N
show security flow session destination-prefix Y
show security screen statistics zone untrust
insert security policies from-zone A to-zone B policy P1 before policy P2</pre>
<div class="eg"><p><b>Worked example.</b> Before you close a change: describe the flow, run match-policies for it, commit, test with a real connection, confirm the session and the hit on the intended policy, and save the evidence.</p></div>
<div class="warn"><p><b>Common mistake.</b> Judging a change with an old session still alive. Clear it or test a fresh flow.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse zone-based policies (through traffic) with host-inbound-traffic (to the box).</p></div>
<div class="scn"><h4>One change, three proofs</h4><p>An engineer added a permit for a new reporting server. He showed the config diff, a match-policies result naming the new policy, and a session plus a hit count after a real test. The reviewer approved in minutes.</p><p><b>Lesson:</b> evidence beats explanation.</p></div>
<div class="iv"><p class="q">"Walk me through adding a new service safely."</p><p>Define the address and application, write the narrowest policy with count, place it above any broad deny, commit confirmed, test a real flow, verify the session and hit count, then confirm the commit.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Names in policies, narrow rules, correct order.</li><li>Prove with sessions and hit counts.</li><li>Screens first, policy second, reject for users, deny for the Internet.</li></ul></div>`,hi:`<p><b>Analogy.</b> Ab aapke paas ek achha chalne wala reception desk hai: logon aur services ke naam, sahi order mein likhi rule list, ginti ka sheet, aur gate par ek guard jo list padhne se pehle bheed ko rok deta hai.</p>
<h3>Ab aap yeh kar sakte ho</h3>
<ul><li>address entries banana, unhe address sets mein nest karna, aur policies mein use karna;</li><li>custom applications define karna aur unhe application sets mein group karna;</li><li>source, destination, application, action, count aur log ke saath policy likhna;</li><li>first-match order, shadowing explain karna, aur <code>insert before/after</code> se order theek karna;</li><li>zone-pair, global aur default policy order explain karna;</li><li><code>hit-count</code>, <code>flow session</code> aur <code>match-policies</code> se troubleshoot karna;</li><li>screens banana aur padhna, aur batana ki woh policy se pehle kyun chalti hain;</li><li>explain karna ki deny versus reject mein user kya dekhta hai;</li><li>schedulers ko concept ke roop mein describe karna.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Address book</dt><dd>IP prefixes ke naam; global ya zone based.</dd><dt>Address set</dt><dd>Addresses aur sets ka naam wala group.</dd><dt>Application</dt><dd>Protocol aur port ka naam.</dd><dt>Shadowing</dt><dd>Specific policy ke upar broad policy, jisse specific wali kabhi match nahi hoti.</dd><dt>Screen (ids-option)</dt><dd>Zone par session aur policy se pehle lagne wali attack check.</dd><dt>reject</dt><dd>Block karo aur sender ko batao (reset ya ICMP unreachable).</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Policy evaluation</td><td>Upar se neeche, pehla match jeet-ta hai</td></tr>
<tr><td>Stages ka order</td><td>Zone pair, global, default (deny-all)</td></tr>
<tr><td>Screens kab chalti hain</td><td>Session lookup aur policy se pehle, ingress zone par</td></tr>
<tr><td>Hit count kya ginta hai</td><td>Sessions, packets nahi</td></tr>
<tr><td>Policy reorder</td><td>insert ... before ya after</td></tr>
<tr><td>TCP ke liye reject kya bhejta hai</td><td>Reset</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show security policies
show security policies hit-count
show security policies from-zone trust to-zone dmz
show security match-policies from-zone A to-zone B source-ip X destination-ip Y protocol tcp destination-port N
show security flow session destination-prefix Y
show security screen statistics zone untrust
insert security policies from-zone A to-zone B policy P1 before policy P2</pre>
<div class="eg"><p><b>Worked example.</b> Change band karne se pehle: flow describe karo, uske liye match-policies chalao, commit karo, asli connection se test karo, session aur intended policy par hit confirm karo, aur evidence save karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Purane zinda session ke saath change ko judge karna. Use clear karo ya fresh flow test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zone-based policies (through traffic) ko host-inbound-traffic (box tak) se mat milao.</p></div>
<div class="scn"><h4>Ek change, teen saboot</h4><p>Ek engineer ne naye reporting server ke liye permit jodi. Usne config diff, nayi policy ka naam dikhata match-policies result, aur asli test ke baad session aur hit count dikhaye. Reviewer ne kuch minutes mein approve kar diya.</p><p><b>Lesson:</b> saboot explanation se behtar hai.</p></div>
<div class="iv"><p class="q">"Nayi service safely add karna samjhao."</p><p>Address aur application define karo, count ke saath sabse narrow policy likho, use kisi broad deny ke upar rakho, commit confirmed karo, asli flow test karo, session aur hit count verify karo, phir commit confirm karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Policies mein names, narrow rules, sahi order.</li><li>Sessions aur hit counts se saabit karo.</li><li>Pehle screens, phir policy, users ke liye reject, Internet ke liye deny.</li></ul></div>`}};export{e as default};