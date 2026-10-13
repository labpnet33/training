var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now translate the LAN to the internet, publish a DMZ server and, most importantly, write security rules with the correct pre-NAT addresses and post-NAT zones. This chapter is the checklist and the cheat-sheet.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain the evaluation order of NAT and security.</li><li>Create DIPP source NAT with the interface address and prove it with the NS flag.</li><li>Publish a server with destination NAT and the right security rule.</li><li>Order NAT rules so specific rules win.</li><li>Use <code>test nat-policy-match</code>, <code>test security-policy-match</code>, <code>show session id</code> and <code>show log traffic</code>.</li><li>Describe static NAT, port translation and U-turn NAT.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Source NAT</dt><dd>Rewrites the source address (and port).</dd><dt>Destination NAT</dt><dd>Rewrites the destination address (and port).</dd><dt>DIPP</dt><dd>Dynamic IP and port: many hosts share addresses with port translation.</dd><dt>Pre-NAT / post-NAT</dt><dd>Values before and after translation.</dd><dt>Static NAT</dt><dd>Fixed one-to-one translation.</dd><dt>U-turn NAT</dt><dd>Internal client reaches an internal server by its public address.</dd></dl>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr><tr><td>DNAT rule zones for a DMZ server</td><td>from untrust to untrust</td></tr><tr><td>Security rule for the same server</td><td>from untrust to dmz, destination = public IP</td></tr><tr><td>Which NAT lets many hosts share one IP?</td><td>dynamic-ip-and-port</td></tr><tr><td>Flags</td><td>NS source, ND destination, NB both</td></tr><tr><td>NAT rules: order?</td><td>top to bottom, first match wins</td></tr><tr><td>Security uses</td><td>pre-NAT IP, post-NAT zone</td></tr></table>
<h3>Command cheat-sheet</h3>
<pre class="code"># source NAT for the LAN
set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
# publish a DMZ server
set address WEB-PUBLIC ip-netmask 203.0.113.3
set address WEB-PRIVATE ip-netmask 10.0.2.10
set rulebase nat rules WEB-DNAT from untrust to untrust source any destination WEB-PUBLIC service service-h&#116;tp destination-translation translated-address WEB-PRIVATE
set rulebase security rules WEB-IN from untrust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow
commit
# verify
test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
show session all
show session id N
show running nat-policy</pre>
<div class="note"><p><b>Where to practise.</b> The labs of this module are in the simulator: source NAT to the internet, publishing the DMZ web server, and the published server that times out. For related practice use the security policy module (zones and rule order), the Cisco ASA NAT module (the same ideas with different syntax) and the FTD module for IPS policy.</p></div>
<div class="scn"><h4>Whiteboard question</h4><p>An interviewer drew the Pune topology and asked: "A customer on the internet connects to 203.0.113.3 port 80. Tell me the zones in the NAT rule and the security rule." The candidate answered: NAT from untrust to untrust, destination 203.0.113.3, translated to 10.0.2.10; security from untrust to dmz, destination 203.0.113.3. She added the test commands she would use to prove it.</p><p><b>Lesson:</b> answer with the zones, the addresses and the proof.</p></div>
<div class="iv"><p class="q">"Give the one-line summary of NAT and security in PAN-OS."</p><p>NAT is matched with pre-NAT zones and original addresses; security is matched with the original (pre-NAT) addresses and the post-NAT destination zone; the session then stores both.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>NAT and security are separate rulebases with a fixed order.</li><li>DIPP shares addresses; static is one-to-one; destination NAT publishes.</li><li>Security: pre-NAT IP, post-NAT zone.</li><li>Prove everything with test commands, session flags and logs.</li></ul></div>
`,hi:`
<p>Ab aap LAN ko internet ke liye translate kar sakte ho, DMZ server publish kar sakte ho, aur sabse zaroori, sahi pre-NAT addresses aur post-NAT zones ke saath security rules likh sakte ho. Yeh chapter checklist aur cheat-sheet hai.</p>
<h3>Can-do checklist</h3>
<ul><li>NAT aur security ka evaluation order samjha sako.</li><li>Interface address ke saath DIPP source NAT banao aur NS flag se saabit karo.</li><li>Destination NAT aur sahi security rule se server publish karo.</li><li>NAT rules ko aise order karo ki specific rules jeetein.</li><li><code>test nat-policy-match</code>, <code>test security-policy-match</code>, <code>show session id</code> aur <code>show log traffic</code> use karo.</li><li>Static NAT, port translation aur U-turn NAT describe karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Source NAT</dt><dd>Source address (aur port) badalta hai.</dd><dt>Destination NAT</dt><dd>Destination address (aur port) badalta hai.</dd><dt>DIPP</dt><dd>Dynamic IP and port: kai hosts port translation ke saath addresses share karte hain.</dd><dt>Pre-NAT / post-NAT</dt><dd>Translation se pehle aur baad ki values.</dd><dt>Static NAT</dt><dd>Fixed ek-se-ek translation.</dd><dt>U-turn NAT</dt><dd>Internal client internal server tak uske public address se pahunchta hai.</dd></dl>
<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr><tr><td>DNAT rule zones for a DMZ server</td><td>from untrust to untrust</td></tr><tr><td>Security rule for the same server</td><td>from untrust to dmz, destination = public IP</td></tr><tr><td>Which NAT lets many hosts share one IP?</td><td>dynamic-ip-and-port</td></tr><tr><td>Flags</td><td>NS source, ND destination, NB dono</td></tr><tr><td>NAT rules: order?</td><td>upar se neeche, pehli match jeetti hai</td></tr><tr><td>Security uses</td><td>pre-NAT IP, post-NAT zone</td></tr></table>
<h3>Command cheat-sheet</h3>
<pre class="code"># source NAT for the LAN
set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
# publish a DMZ server
set address WEB-PUBLIC ip-netmask 203.0.113.3
set address WEB-PRIVATE ip-netmask 10.0.2.10
set rulebase nat rules WEB-DNAT from untrust to untrust source any destination WEB-PUBLIC service service-h&#116;tp destination-translation translated-address WEB-PRIVATE
set rulebase security rules WEB-IN from untrust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow
commit
# verify
test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
show session all
show session id N
show running nat-policy</pre>
<div class="note"><p><b>Practice kahan.</b> Is module ke labs simulator mein hain: internet ke liye source NAT, DMZ web server publish karna, aur published server jo timeout deta hai. Related practice ke liye security policy module (zones aur rule order), Cisco ASA NAT module (wahi ideas, alag syntax) aur IPS policy ke liye FTD module use karo.</p></div>
<div class="scn"><h4>Whiteboard question</h4><p>Ek interviewer ne Pune topology draw ki aur poocha: "Internet ka customer 203.0.113.3 port 80 par connect karta hai. NAT rule aur security rule ke zones batao." Candidate ne jawab diya: NAT from untrust to untrust, destination 203.0.113.3, 10.0.2.10 mein translated; security from untrust to dmz, destination 203.0.113.3. Usne woh test commands bhi bataye jo woh saabit karne ke liye use karegi.</p><p><b>Lesson:</b> zones, addresses aur proof ke saath jawab do.</p></div>
<div class="iv"><p class="q">"PAN-OS mein NAT aur security ka one-line summary do."</p><p>NAT pre-NAT zones aur original addresses se match hota hai; security original (pre-NAT) addresses aur post-NAT destination zone se; phir session dono ko store karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>NAT aur security fixed order wale alag rulebases hain.</li><li>DIPP addresses share karta hai; static ek-se-ek; destination NAT publish karta hai.</li><li>Security: pre-NAT IP, post-NAT zone.</li><li>Sab kuch test commands, session flags aur logs se saabit karo.</li></ul></div>
`}};export{e as default};