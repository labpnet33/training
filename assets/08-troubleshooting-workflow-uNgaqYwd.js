var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: ticket INC-51877 from start to finish`,hi:`Troubleshooting workflow: ticket INC-51877 shuru se aakhir tak`},body:{en:`

<p><b>Put the tools together.</b> The earlier chapters taught the tools one at a time. A real ticket needs them in a sequence. This chapter gives you the sequence and then walks one complete ticket, using the same ticket as the simulator lab for this module.</p>

<h3>Analogy: the doctor's routine</h3>
<p>A doctor does not order every test. She listens to the complaint, takes vital signs, orders one targeted test, treats, and checks that the treatment worked. Your routine: complaint, counters, test commands, fix, session, log.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Troubleshooting routine"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Define the flow</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">source, destination, port, user symptom</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Counters (delta)</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">baseline, reproduce, read the drop name</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Test commands</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">which security and NAT rule decide?</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Fix one thing, commit</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">smallest change that removes the cause</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Verify</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">new connection works; session shows rule and NAT</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Confirm and record</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">traffic log entry; write the ticket note</text></svg><p class="cap">The six-step routine.</p></div>

<h3>The ticket</h3>
<p><b>INC-51877, priority P2, Pune.</b> "Our DMZ web server WEB cannot resolve names. Its DNS server 8.8.8.8 is unreachable, but it can ping 8.8.8.8." The start state: rule <code>DMZ-Out</code> allows only ping from dmz to untrust, and <code>SNAT-Out</code> translates dmz traffic.</p>

<h3>Step 1: define the flow</h3>
<p>DNS to 8.8.8.8 over TCP port 53, from 10.0.2.10 in dmz to untrust. The ping works, so routing and the link are fine. That already shrinks the problem to policy or NAT.</p>

<h3>Step 2: counters</h3>
<p>Set the baseline, try the DNS connection from WEB, read the delta (you saw this in the counters chapter).</p>
<pre class="out">WEB&gt; curl 8.8.8.8:53
curl: (28) Failed to connect to 8.8.8.8 port 53 after 2001 ms: Timeout was reached

PA1&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
Total counters shown: 1</pre>
<p>The firewall dropped it by policy.</p>

<h3>Step 3: test commands</h3>
<pre class="out">PA1&gt; test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span>

PA1&gt; test nat-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
SNAT-Out; index: 1 {
        ...
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
}</pre>
<p>Security has no rule for DNS from the DMZ, and NAT is fine. The cause is proven: <code>DMZ-Out</code> allows only ping.</p>

<h3>Step 4: fix one thing</h3>
<p>Add the application dns to the existing rule, instead of opening the port to everything:</p>
<pre class="code">configure
set rulebase security rules DMZ-Out application dns
commit</pre>
<pre class="out">Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>The rule now lists <code>[ ping dns ]</code> with service application-default. We used the application, not a port, which keeps the rule tight (the service stays application-default).</p>

<h3>Step 5: verify with a new connection</h3>
<p>Connect again from WEB (the DNS answer comes back through the simulated internet server), then read the session for the rule and NAT rule:</p>
<pre class="out">PA1&gt; show session all filter source 10.0.2.10
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
9361         dns            ACTIVE  FLOW NS    10.0.2.10[57160]/dmz/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[53]/untrust  (8.8.8.8[53])

PA1&gt; show session id 9361
...
	application                          : dns
	<span class="hl">rule                                 : DMZ-Out</span>
	address/port translation             : source
	<span class="hl">nat-rule                             : SNAT-Out(vsys1)</span></pre>
<p>The answer to the lab question "which NAT rule translated it?" is <code>SNAT-Out</code>.</p>

<h3>Step 6: confirm and record</h3>
<p>The traffic log shows the entry with the rule name, then you write the note: "DMZ-Out allowed ping only; DNS fell to interzone-default (flow_policy_deny). Added application dns; verified session 9361 via SNAT-Out." That note is as valuable as the fix.</p>

<h3>When the tools point somewhere else</h3>
<table class="cmp"><tr><th>What you see</th><th>Where to look next</th></tr>
<tr><td>No counter, no session, no log</td><td>Routing, link, ARP, the far end, and whether the packet reaches the firewall (ping source, show routing route)</td></tr>
<tr><td>flow_fwd_notopology</td><td>Zone and virtual router assignment of the interface</td></tr>
<tr><td>flow_host_service_deny</td><td>Interface management profile</td></tr>
<tr><td>Allowed in test, but session shows the wrong rule</td><td>An earlier rule matches first; look at rule order with show running security-policy</td></tr>
<tr><td>Session exists, no reply</td><td>NAT rule, return route, or the server</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Fixing by adding a broad any-any allow rule "to test". It hides the real cause, and temporary rules are forgotten. Make the narrowest change that your test commands justified.</p></div>
<div class="exam"><p><b>Exam trap.</b> Practical items ask you to order the steps: baseline counters, reproduce, test command, fix, retest, check session. Remember that the fix is verified with a new connection, not with the test command alone.</p></div>

<div class="scn"><h4>The ticket that closed itself</h4><p>A junior engineer followed this routine on a Friday ticket and wrote the evidence into the case: counter name, test output, one-line fix, session ID. The customer replied "thanks, closing". On Monday the same issue returned on another server, and the note made it a five-minute fix for a colleague.</p><p><b>Lesson:</b> Evidence in the ticket turns a one-time fix into a reusable procedure.</p></div>

<div class="iv"><p class="q">"Describe your troubleshooting process on a PAN-OS firewall from complaint to closure."</p><p>I define the exact flow, set a delta drop counter baseline, reproduce and read the counter. I prove the decision with test security-policy-match and test nat-policy-match, make the smallest change and commit, verify with a new connection and show session id, check the traffic log, and document the counter, rule and fix in the ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: define flow, counters, test commands, fix one thing, verify, record.</li>
<li>In INC-51877 the counter flow_policy_deny and the test result interzone-default proved the cause.</li>
<li>The fix added application dns to DMZ-Out and the session showed NAT rule SNAT-Out.</li>
<li>Verify with a new connection and session detail, not only with the test command.</li>
<li>Narrow changes beat any-any rules.</li>
</ul></div>

`,hi:`

<p><b>Tools ko jodo.</b> Pichhle chapters ne tools ek ek karke sikhaye. Asli ticket mein unhe ek sequence mein chahiye. Yeh chapter aapko sequence deta hai aur phir ek poora ticket chalkar dikhata hai, jo is module ke simulator lab ka hi ticket hai.</p>

<h3>Analogy: doctor ka routine</h3>
<p>Doctor har test order nahi karti. Woh shikayat sunti hai, vital signs leti hai, ek targeted test order karti hai, ilaaj karti hai, aur check karti hai ilaaj chala ya nahi. Aapka routine: complaint, counters, test commands, fix, session, log.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Troubleshooting routine"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Flow define karo</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">source, destination, port, user ka symptom</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Counters (delta)</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">baseline, reproduce, drop ka naam padho</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Test commands</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">kaunsi security aur NAT rule decide karti hai?</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Ek cheez fix, commit</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">sabse chhota change jo wajah hataye</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Verify</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">naya connection chale; session mein rule aur NAT dikhe</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Confirm aur record</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">traffic log entry; ticket note likho</text></svg><p class="cap">Chhe step ka routine.</p></div>

<h3>Ticket</h3>
<p><b>INC-51877, priority P2, Pune.</b> "Hamara DMZ web server WEB names resolve nahi kar pa raha. Uska DNS server 8.8.8.8 unreachable hai, lekin woh 8.8.8.8 ko ping kar pata hai." Start state: rule <code>DMZ-Out</code> dmz se untrust sirf ping allow karti hai, aur <code>SNAT-Out</code> dmz traffic translate karti hai.</p>

<h3>Step 1: flow define karo</h3>
<p>DNS 8.8.8.8 tak TCP port 53 par, 10.0.2.10 (dmz) se untrust. Ping chalti hai, isliye routing aur link theek hain. Isse problem pehle hi policy ya NAT tak simat gayi.</p>

<h3>Step 2: counters</h3>
<p>Baseline set karo, WEB se DNS connection try karo, delta padho (counters chapter mein dekha tha).</p>
<pre class="out">WEB&gt; curl 8.8.8.8:53
curl: (28) Failed to connect to 8.8.8.8 port 53 after 2001 ms: Timeout was reached

PA1&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
Total counters shown: 1</pre>
<p>Firewall ne policy se drop kiya.</p>

<h3>Step 3: test commands</h3>
<pre class="out">PA1&gt; test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span>

PA1&gt; test nat-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
SNAT-Out; index: 1 {
        ...
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
}</pre>
<p>Security mein DMZ se DNS ki rule nahi hai, aur NAT theek hai. Wajah saabit: <code>DMZ-Out</code> sirf ping allow karti hai.</p>

<h3>Step 4: ek cheez fix karo</h3>
<p>Port sabke liye kholne ke bajaye existing rule mein application dns jodo:</p>
<pre class="code">configure
set rulebase security rules DMZ-Out application dns
commit</pre>
<pre class="out">Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>Rule ab <code>[ ping dns ]</code> service application-default ke saath dikhati hai. Hamne port nahi, application use kiya, jisse rule tight rehti hai (service application-default hi rehta hai).</p>

<h3>Step 5: naye connection se verify karo</h3>
<p>WEB se phir connect karo (DNS ka jawab simulated internet server se aata hai), phir rule aur NAT rule ke liye session padho:</p>
<pre class="out">PA1&gt; show session all filter source 10.0.2.10
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
9361         dns            ACTIVE  FLOW NS    10.0.2.10[57160]/dmz/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[53]/untrust  (8.8.8.8[53])

PA1&gt; show session id 9361
...
	application                          : dns
	<span class="hl">rule                                 : DMZ-Out</span>
	address/port translation             : source
	<span class="hl">nat-rule                             : SNAT-Out(vsys1)</span></pre>
<p>Lab ke sawaal "kaunsi NAT rule ne translate kiya?" ka jawab <code>SNAT-Out</code> hai.</p>

<h3>Step 6: confirm aur record</h3>
<p>Traffic log rule ke naam ke saath entry dikhata hai, phir aap note likhte ho: "DMZ-Out sirf ping allow karti thi; DNS interzone-default par gira (flow_policy_deny). Application dns jodi; session 9361 SNAT-Out se verify kiya." Yeh note fix jitna hi keemti hai.</p>

<h3>Jab tools kahin aur ishara karein</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Aage kahan dekhna hai</th></tr>
<tr><td>Na counter, na session, na log</td><td>Routing, link, ARP, far end, aur packet firewall tak pahunchta hai ya nahi (ping source, show routing route)</td></tr>
<tr><td>flow_fwd_notopology</td><td>Interface ka zone aur virtual router assignment</td></tr>
<tr><td>flow_host_service_deny</td><td>Interface management profile</td></tr>
<tr><td>Test mein allowed, lekin session mein galat rule</td><td>Pehle ki koi rule pehle match karti hai; show running security-policy se rule order dekho</td></tr>
<tr><td>Session hai, reply nahi</td><td>NAT rule, return route, ya server</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> "Test karne ke liye" broad any-any allow rule jodkar fix karna. Yeh asli wajah chhupa deti hai, aur temporary rules bhula di jaati hain. Sabse narrow change karo jo aapke test commands ne justify kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> Practical items steps ka order poochte hain: baseline counters, reproduce, test command, fix, retest, session check. Yaad rakho fix naye connection se verify hota hai, sirf test command se nahi.</p></div>

<div class="scn"><h4>Ticket jo khud band ho gaya</h4><p>Ek junior engineer ne Friday ke ticket par yeh routine follow kiya aur evidence case mein likha: counter name, test output, ek line ka fix, session ID. Customer ne likha "thanks, closing". Monday ko wahi issue doosre server par wapas aaya, aur note ne colleague ke liye use paanch minute ka fix bana diya.</p><p><b>Lesson:</b> Ticket mein evidence ek baar ke fix ko reusable procedure bana deta hai.</p></div>

<div class="iv"><p class="q">"PAN-OS firewall par complaint se closure tak apna troubleshooting process batao."</p><p>Main exact flow define karta hoon, delta drop counter baseline set karta hoon, reproduce karke counter padhta hoon. Decision test security-policy-match aur test nat-policy-match se saabit karta hoon, sabse chhota change karke commit karta hoon, naye connection aur show session id se verify karta hoon, traffic log dekhta hoon, aur ticket mein counter, rule aur fix document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: flow define, counters, test commands, ek cheez fix, verify, record.</li>
<li>INC-51877 mein counter flow_policy_deny aur test result interzone-default ne wajah saabit ki.</li>
<li>Fix ne DMZ-Out mein application dns jodi aur session ne NAT rule SNAT-Out dikhaya.</li>
<li>Naye connection aur session detail se verify karo, sirf test command se nahi.</li>
<li>Narrow changes any-any rules se behtar hain.</li>
</ul></div>

`}};export{e as default};