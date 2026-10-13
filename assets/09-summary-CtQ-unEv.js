var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now explain and build Palo Alto security policy from first principles. This chapter collects the checklist, the vocabulary and the facts that appear again and again in exams and interviews.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain zones, the ingress and egress zone, and the two predefined rules.</li><li>Write a rule by zone, address, application and service, and commit it.</li><li>Explain App-ID and why <code>application-default</code> is a best practice.</li><li>Find a shadowed rule with <code>test security-policy-match</code> and fix it with <code>move</code>.</li><li>Choose between allow, deny, drop and the reset actions.</li><li>Read <code>show session all</code>, <code>show session id</code>, <code>show log traffic</code> and the drop counters.</li><li>Use address objects, groups, service objects and a logging cleanup rule.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Zone</dt><dd>Named group of interfaces; rules go between zones.</dd><dt>App-ID</dt><dd>Application identification from the traffic, independent of port.</dd><dt>application-default</dt><dd>Application only on its standard ports.</dd><dt>interzone-default</dt><dd>Predefined deny between different zones; no log.</dd><dt>intrazone-default</dt><dd>Predefined allow inside one zone; no log.</dd><dt>Shadowed rule</dt><dd>A rule that can never match because an earlier rule catches its traffic.</dd><dt>Session</dt><dd>State entry created on the first allowed packet.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr><tr><td>Evaluation order</td><td>top to bottom, first match wins</td></tr><tr><td>No matching rule between zones</td><td><code>interzone-default</code> (deny)</td></tr><tr><td>Same-zone traffic, no rule</td><td><code>intrazone-default</code> (allow)</td></tr><tr><td>Default logging</td><td>your rules: at session end; predefined: none</td></tr><tr><td>Web on TCP 8080 with application-default</td><td>no match (not the default port of web-browsing)</td></tr><tr><td>Which command proves the decision?</td><td><code>test security-policy-match</code></td></tr><tr><td>Policy denial counter</td><td><code>flow_policy_deny</code></td></tr></table>
<h3>Command cheat-sheet</h3>
<pre class="code"># create a rule
set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
# reorder
move rulebase security rules Admin-SSH before Block-SSH
# objects
set address-group ADMIN-SET static [ ADMIN-PC JUMP-SRV ]
set service tcp-8081 protocol tcp port 8081
# apply
commit
# verify (operational mode)
test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
show running security-policy
show session all
show log traffic
show counter global filter delta yes severity drop</pre>
<div class="note"><p><b>Where to practise next.</b> The labs of this module (outbound policy with App-ID, and the admin exception that never matches) are in the simulator. After them continue with the NAT module to see how pre-NAT addresses meet post-NAT zones, and with the security profiles module for the content-inspection part of a rule.</p></div>
<div class="scn"><h4>Interview on a whiteboard</h4><p>A candidate was asked to draw a rule that lets the LAN browse and use DNS, but not SSH, and to say what happens to everything else. He drew the rule with zones, the applications web-browsing, ssl and dns with application-default, mentioned the default deny and the logging cleanup rule, and described the test command he would use to prove it before the change window.</p><p><b>Lesson:</b> explain the decision, the evidence and the order, not only the syntax.</p></div>
<div class="iv"><p class="q">"Summarise in one minute how a Palo Alto firewall decides to allow a connection."</p><p>On the first packet it finds the ingress zone, does a route lookup for the egress zone, then reads the security rulebase from the top. The first rule whose zones, addresses, application and service match decides. If none match, the predefined interzone or intrazone default applies. An allowed session is stored and later packets follow it. Logs and counters record the result.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Policy = zones + addresses + application + service + action, first match wins.</li><li>Default deny between zones, default allow inside a zone.</li><li><code>application-default</code> pins applications to standard ports.</li><li>Prove every decision with the test command, the session and the log.</li></ul></div>
`,hi:`
<p>Ab aap Palo Alto security policy ko shuru se samjha aur bana sakte ho. Yeh chapter checklist, vocabulary aur woh facts ikattha karta hai jo exams aur interviews mein baar-baar aate hain.</p>
<h3>Can-do checklist</h3>
<ul><li>Zones, ingress aur egress zone, aur do predefined rules samjha sako.</li><li>Zone, address, application aur service se rule likh sako aur commit kar sako.</li><li>App-ID aur <code>application-default</code> best practice kyun hai samjha sako.</li><li><code>test security-policy-match</code> se shadowed rule dhoondo aur <code>move</code> se fix karo.</li><li>allow, deny, drop aur reset actions mein se chuno.</li><li><code>show session all</code>, <code>show session id</code>, <code>show log traffic</code> aur drop counters padh sako.</li><li>Address objects, groups, service objects aur logging cleanup rule use kar sako.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Zone</dt><dd>Interfaces ka naam wala group; rules zones ke beech jaati hain.</dd><dt>App-ID</dt><dd>Traffic se application pehchaan, port se alag.</dd><dt>application-default</dt><dd>Application sirf apne standard ports par.</dd><dt>interzone-default</dt><dd>Alag zones ke beech predefined deny; log nahi.</dd><dt>intrazone-default</dt><dd>Ek zone ke andar predefined allow; log nahi.</dd><dt>Shadowed rule</dt><dd>Aisi rule jo kabhi match nahi hoti kyunki pehle ki rule uska traffic pakad leti hai.</dd><dt>Session</dt><dd>Pehle allowed packet par bani state entry.</dd></dl>
<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr><tr><td>Evaluation order</td><td>upar se neeche, pehli match jeetti hai</td></tr><tr><td>No matching rule between zones</td><td><code>interzone-default</code> (deny)</td></tr><tr><td>Same-zone traffic, no rule</td><td><code>intrazone-default</code> (allow)</td></tr><tr><td>Default logging</td><td>aapki rules: session end par; predefined: nahi</td></tr><tr><td>Web on TCP 8080 with application-default</td><td>match nahi (web-browsing ka default port nahi)</td></tr><tr><td>Which command proves the decision?</td><td><code>test security-policy-match</code></td></tr><tr><td>Policy denial counter</td><td><code>flow_policy_deny</code></td></tr></table>
<h3>Command cheat-sheet</h3>
<pre class="code"># create a rule
set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
# reorder
move rulebase security rules Admin-SSH before Block-SSH
# objects
set address-group ADMIN-SET static [ ADMIN-PC JUMP-SRV ]
set service tcp-8081 protocol tcp port 8081
# apply
commit
# verify (operational mode)
test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
show running security-policy
show session all
show log traffic
show counter global filter delta yes severity drop</pre>
<div class="note"><p><b>Agla practice kahan.</b> Is module ke labs (App-ID ke saath outbound policy, aur woh admin exception jo kabhi match nahi hui) simulator mein hain. Unke baad NAT module par jao jahan pre-NAT addresses post-NAT zones se milte hain, aur security profiles module par jo rule ke content-inspection hisse ke liye hai.</p></div>
<div class="scn"><h4>Whiteboard par interview</h4><p>Ek candidate se kaha gaya ki aisi rule draw karo jo LAN ko browse aur DNS karne de, SSH nahi, aur batao baaki sab ka kya hoga. Usne zones, applications web-browsing, ssl aur dns application-default ke saath wali rule draw ki, default deny aur logging cleanup rule ka zikr kiya, aur woh test command bataya jo change window se pehle saabit karne ke liye use karega.</p><p><b>Lesson:</b> sirf syntax nahi, decision, saboot aur order samjhao.</p></div>
<div class="iv"><p class="q">"Ek minute mein batao ki Palo Alto firewall connection allow karne ka decision kaise leta hai."</p><p>Pehle packet par yeh ingress zone dhoondta hai, egress zone ke liye route lookup karta hai, phir security rulebase upar se padhta hai. Jis pehli rule ke zones, addresses, application aur service match karein woh decide karti hai. Koi match na ho to predefined interzone ya intrazone default lagu hota hai. Allowed session store hota hai aur baad ke packets use follow karte hain. Logs aur counters result record karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Policy = zones + addresses + application + service + action, pehli match jeetti hai.</li><li>Zones ke beech default deny, zone ke andar default allow.</li><li><code>application-default</code> applications ko standard ports par pin karta hai.</li><li>Har decision ko test command, session aur log se saabit karo.</li></ul></div>
`}};export{e as default};