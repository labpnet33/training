var e={id:`mindset-toolkit`,h:{en:`Welcome: the troubleshooting mindset and the PAN-OS toolkit`,hi:`Swagat: troubleshooting mindset aur PAN-OS toolkit`},body:{en:`

<p><b>What you will learn in this module.</b> You will learn to work a firewall ticket the way a PAN-OS engineer does: reproduce the problem, read the drop counters, prove the policy decision with the test commands, inspect the session, and confirm with the traffic log. These skills are the Monitoring and Troubleshooting part of the Palo Alto Networks NGFW Engineer blueprint, and they are what interviewers test when they say "a user cannot reach a server, what do you do?".</p>
<p><b>Prerequisites.</b> You should know zones, security rules and NAT from the earlier PAN-OS modules (pan-policy and pan-nat). You do not need any advanced feature. Everything in this module can be practised in the simulator lab for this module, so keep the lab open while you read.</p>

<h3>Analogy: the firewall is an airport security desk with a camera and a notebook</h3>
<p>Imagine a traveller says "security stopped me". A good supervisor does not guess. She asks the desk: <i>what is happening right now?</i> (the live queue, which is the <b>session table</b>). She asks: <i>how many people were turned away today and for what reason?</i> (the <b>drop counters</b>). She asks: <i>if this traveller walked up now, what would the rulebook say?</i> (the <b>test commands</b>). And she checks the notebook of past events (the <b>logs</b>). Four sources, four different questions. A PAN-OS engineer uses exactly the same four.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting toolkit"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Counters</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">is it dropping?</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Test commands</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">which rule decides?</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sessions</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">what is flowing?</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">what happened?</text></svg><p class="cap">Four sources, four questions. Use them in this order for a "cannot connect" ticket.</p></div>

<h3>The lab network you will use</h3>
<p>The simulator lab has one firewall, <code>PA1</code> (host name <code>NK-PUNE-PA</code>), with three zones and a simple internet. Learn the addresses once, because every example in this module uses them.</p>
<table class="cmp"><tr><th>Device</th><th>Zone / interface</th><th>Address</th></tr>
<tr><td>PC1 (user)</td><td>trust, ethernet1/2</td><td>10.0.1.10/24, gateway 10.0.1.1</td></tr>
<tr><td>WEB (server)</td><td>dmz, ethernet1/3</td><td>10.0.2.10/24, gateway 10.0.2.1</td></tr>
<tr><td>PA1 untrust</td><td>untrust, ethernet1/1</td><td>203.0.113.2/29, next hop 203.0.113.1 (ISP)</td></tr>
<tr><td>INET-SRV</td><td>beyond the ISP</td><td>8.8.8.8 (acts as the internet)</td></tr>
</table>
<p>Two security rules exist at the start: <code>Allow-Out</code> (trust to untrust, applications ping, dns, web-browsing and ssl) and <code>DMZ-Out</code> (dmz to untrust, application ping only). One NAT rule, <code>SNAT-Out</code>, translates trust and dmz traffic to the address of ethernet1/1.</p>

<h3>The commands in one table</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th></tr>
<tr><td>Is the firewall dropping something now?</td><td><code>show counter global filter delta yes severity drop</code></td></tr>
<tr><td>Which security rule decides?</td><td><code>test security-policy-match ...</code></td></tr>
<tr><td>Which NAT rule and translation?</td><td><code>test nat-policy-match ...</code></td></tr>
<tr><td>What is flowing right now?</td><td><code>show session all</code>, <code>show session id N</code></td></tr>
<tr><td>What happened a moment ago?</td><td><code>show log traffic</code></td></tr>
<tr><td>Is routing and the link right?</td><td><code>show routing route</code>, <code>show interface all</code>, <code>ping source ... host ...</code></td></tr>
</table>
<p>You will meet each of them with real output in the next chapters. For now look at the first one on a quiet firewall:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop

Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
<span class="hl">Total counters shown: 0</span>
-----------------------------------------------------------------------------------------------</pre>
<p>"Total counters shown: 0" means nothing was dropped since the baseline. That is the healthy answer, and it is also useful in a ticket: it tells you the firewall is <i>not</i> the one dropping the traffic.</p>

<div class="eg"><p><b>Worked example.</b> A user in Pune says "I cannot open the supplier portal". Before touching any configuration you run the delta counter command, ask the user to try again, and run it a second time. If a drop counter rises by one, the firewall is involved, and the counter name tells you which stage. If nothing rises, you look at the user PC, DNS or the far end instead. You have just saved an hour of changing rules at random.</p></div>

<h3>Rules of good troubleshooting</h3>
<ul>
<li><b>Reproduce first.</b> Test with the same source, destination and port as the user. A different test can pass for a different reason.</li>
<li><b>Change one thing at a time</b> and re-test. Commit one small change, not ten.</li>
<li><b>Follow the packet.</b> Ingress interface, zone, route, NAT, policy, app identification, egress. The next chapter draws this path.</li>
<li><b>Write it down.</b> Ticket number, what you saw, what you changed. The change log on the firewall shows who committed, but only your note shows why.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Reading the traffic log first and stopping there. A denied session that hit the predefined default rule is often not logged at all, so an empty log does not prove "no traffic". Counters and test commands see what the log misses.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam likes "which command shows what the firewall would do, without sending traffic?". The answer is the test command (test security-policy-match), not a ping and not a log search.</p></div>

<div class="scn"><h4>The empty log that fooled a team</h4><p>A branch could not reach a payment service. The engineer searched the traffic log for the source address and found nothing, so she told the user "the firewall never saw it". A colleague ran the delta drop counters during a retry and saw flow_policy_deny go up by one. The traffic had been dropped by the predefined interzone-default rule, which does not log. A new rule fixed it in five minutes.</p><p><b>Lesson:</b> No log entry is not the same as no traffic. Use counters and the test commands together with the log.</p></div>

<div class="iv"><p class="q">"A user cannot reach a server. How do you start troubleshooting on a Palo Alto firewall?"</p><p>I reproduce the failure and check the delta drop counters during the attempt. If a counter rises, I name the stage, then run test security-policy-match and test nat-policy-match with the exact zones, addresses and port. I check show session all filtered on the source address, then the session detail for rule, application and NAT rule, and finally the traffic log. Mention that I confirm routing with show routing route and ping source.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four sources answer four questions: counters (dropping?), test commands (which rule?), sessions (flowing?), logs (happened?).</li>
<li>Always set a counter baseline before you reproduce the problem.</li>
<li>"Total counters shown: 0" tells you the firewall is not dropping that traffic.</li>
<li>The lab uses PA1 with zones trust, untrust and dmz and the SNAT-Out rule.</li>
<li>Reproduce with the exact source, destination and port; change one thing at a time.</li>
</ul></div>

`,hi:`

<p><b>Is module mein aap kya seekhoge.</b> Aap firewall ticket ko waise solve karna seekhoge jaise PAN-OS engineer karta hai: problem reproduce karo, drop counters padho, test commands se policy decision saabit karo, session inspect karo, aur traffic log se confirm karo. Yeh skills Palo Alto Networks NGFW Engineer blueprint ke Monitoring and Troubleshooting hisse ki hain, aur interviewer yahi test karte hain jab poochte hain "user server tak nahi pahunch pa raha, aap kya karoge?".</p>
<p><b>Prerequisites.</b> Aapko pichhle PAN-OS modules (pan-policy aur pan-nat) se zones, security rules aur NAT pata hone chahiye. Koi advanced feature nahi chahiye. Is module ki har cheez simulator lab mein practise ho sakti hai, isliye padhte waqt lab khula rakho.</p>

<h3>Analogy: firewall ek airport security desk hai jiske paas camera aur notebook hai</h3>
<p>Socho koi traveller kehta hai "security ne mujhe roka". Achha supervisor andaza nahi lagata. Woh desk se poochti hai: <i>abhi kya ho raha hai?</i> (live queue, yaani <b>session table</b>). Woh poochti hai: <i>aaj kitne logon ko wapas bheja aur kis wajah se?</i> (<b>drop counters</b>). Woh poochti hai: <i>agar yeh traveller abhi aaye to rulebook kya kahegi?</i> (<b>test commands</b>). Aur woh purani ghatnaon ka notebook dekhti hai (<b>logs</b>). Chaar sources, chaar alag sawaal. PAN-OS engineer bilkul yahi chaar use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting toolkit"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Counters</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">drop ho raha hai?</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Test commands</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">kaunsi rule decide?</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sessions</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">kya flow ho raha?</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">kya hua tha?</text></svg><p class="cap">Chaar sources, chaar sawaal. "Cannot connect" ticket mein inhe isi order mein use karo.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Simulator lab mein ek firewall <code>PA1</code> (host name <code>NK-PUNE-PA</code>) hai, teen zones ke saath aur ek simple internet. Addresses ek baar yaad kar lo kyunki is module ka har example inhi ko use karta hai.</p>
<table class="cmp"><tr><th>Device</th><th>Zone / interface</th><th>Address</th></tr>
<tr><td>PC1 (user)</td><td>trust, ethernet1/2</td><td>10.0.1.10/24, gateway 10.0.1.1</td></tr>
<tr><td>WEB (server)</td><td>dmz, ethernet1/3</td><td>10.0.2.10/24, gateway 10.0.2.1</td></tr>
<tr><td>PA1 untrust</td><td>untrust, ethernet1/1</td><td>203.0.113.2/29, next hop 203.0.113.1 (ISP)</td></tr>
<tr><td>INET-SRV</td><td>ISP ke aage</td><td>8.8.8.8 (internet ki tarah kaam karta hai)</td></tr>
</table>
<p>Shuru mein do security rules hain: <code>Allow-Out</code> (trust se untrust, applications ping, dns, web-browsing aur ssl) aur <code>DMZ-Out</code> (dmz se untrust, sirf application ping). Ek NAT rule <code>SNAT-Out</code> trust aur dmz traffic ko ethernet1/1 ke address mein translate karta hai.</p>

<h3>Saare commands ek table mein</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th></tr>
<tr><td>Kya firewall abhi kuch drop kar raha hai?</td><td><code>show counter global filter delta yes severity drop</code></td></tr>
<tr><td>Kaunsi security rule decide karti hai?</td><td><code>test security-policy-match ...</code></td></tr>
<tr><td>Kaunsi NAT rule aur translation?</td><td><code>test nat-policy-match ...</code></td></tr>
<tr><td>Abhi kya flow ho raha hai?</td><td><code>show session all</code>, <code>show session id N</code></td></tr>
<tr><td>Thodi der pehle kya hua?</td><td><code>show log traffic</code></td></tr>
<tr><td>Routing aur link sahi hai?</td><td><code>show routing route</code>, <code>show interface all</code>, <code>ping source ... host ...</code></td></tr>
</table>
<p>Agle chapters mein aap har command ko real output ke saath dekhoge. Abhi shaant firewall par pehla command dekho:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop

Global counters:
Elapsed time since last sampling: 30.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
<span class="hl">Total counters shown: 0</span>
-----------------------------------------------------------------------------------------------</pre>
<p>"Total counters shown: 0" ka matlab baseline ke baad kuch drop nahi hua. Yeh healthy jawab hai, aur ticket mein bhi kaam ka hai: yeh batata hai ki traffic firewall <i>nahi</i> gira raha.</p>

<div class="eg"><p><b>Worked example.</b> Pune ka ek user kehta hai "supplier portal nahi khul raha". Koi configuration chhuye bina aap delta counter command chalate ho, user se dobara try karwate ho, aur command doosri baar chalate ho. Agar koi drop counter ek se badhta hai to firewall involved hai, aur counter ka naam batata hai kaunsa stage. Agar kuch nahi badhta to aap user PC, DNS ya far end dekhte ho. Aapne random rules badalne ka ek ghanta bacha liya.</p></div>

<h3>Achhe troubleshooting ke niyam</h3>
<ul>
<li><b>Pehle reproduce karo.</b> User jaisa hi source, destination aur port se test karo. Alag test kisi aur wajah se pass ho sakta hai.</li>
<li><b>Ek baar mein ek cheez badlo</b> aur dobara test karo. Ek chhota commit karo, das nahi.</li>
<li><b>Packet ka peecha karo.</b> Ingress interface, zone, route, NAT, policy, app identification, egress. Agla chapter yeh raasta banata hai.</li>
<li><b>Likh lo.</b> Ticket number, kya dekha, kya badla. Firewall ka change log batata hai kisne commit kiya, lekin kyun, yeh sirf aapka note batata hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Sirf traffic log padhkar ruk jaana. Predefined default rule se deny hua session aksar log hi nahi hota, isliye khaali log "traffic nahi tha" saabit nahi karta. Counters aur test commands woh dekhte hain jo log chhod deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai "kaunsa command bina traffic bheje batata hai ki firewall kya karega?". Jawab test command (test security-policy-match) hai, ping nahi aur log search nahi.</p></div>

<div class="scn"><h4>Khaali log jisne team ko galat raaste par daala</h4><p>Ek branch payment service tak nahi pahunch pa rahi thi. Engineer ne traffic log mein source address search kiya, kuch nahi mila, aur user se kaha "firewall ne traffic dekha hi nahi". Colleague ne retry ke dauran delta drop counters chalaye aur flow_policy_deny ek se badhta dekha. Traffic predefined interzone-default rule se drop hua tha, jo log nahi karti. Nayi rule se paanch minute mein fix ho gaya.</p><p><b>Lesson:</b> Log entry na hona matlab traffic na hona nahi hai. Counters aur test commands ko log ke saath use karo.</p></div>

<div class="iv"><p class="q">"User server tak nahi pahunch pa raha. Palo Alto firewall par troubleshooting kaise shuru karte ho?"</p><p>Main failure reproduce karta hoon aur attempt ke dauran delta drop counters dekhta hoon. Counter badhe to stage ka naam milta hai, phir exact zones, addresses aur port ke saath test security-policy-match aur test nat-policy-match chalata hoon. Source address par filter lagakar show session all dekhta hoon, phir session detail mein rule, application aur NAT rule, aur aakhir mein traffic log. Batao ki routing show routing route aur ping source se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar sources chaar sawaal ke jawab dete hain: counters (drop?), test commands (kaunsi rule?), sessions (flow?), logs (hua?).</li>
<li>Problem reproduce karne se pehle hamesha counter baseline set karo.</li>
<li>"Total counters shown: 0" batata hai ki firewall woh traffic drop nahi kar raha.</li>
<li>Lab mein PA1 hai, zones trust, untrust aur dmz, aur SNAT-Out rule.</li>
<li>Exact source, destination aur port se reproduce karo; ek baar mein ek cheez badlo.</li>
</ul></div>

`}};export{e as default};