var e={id:`read-the-box`,h:{en:`Reading the box: verify and troubleshoot a first firewall`,hi:`Box ko padhna: pehle firewall ko verify aur troubleshoot karna`},body:{en:`
<p><b>Analogy: a doctor's checklist.</b> A doctor does not guess. She checks pulse, then temperature, then asks questions, always in the same order. Firewall troubleshooting works best the same way: a fixed sequence of cheap checks from the bottom of the stack to the top. You can run the whole sequence in under two minutes once it is a habit.</p>

<h3>The five-step verification flow</h3>
<ol>
<li><b>Interfaces:</b> are they up, in a zone and in a virtual router? (<code>show interface all</code>)</li>
<li><b>Routing:</b> is there a route for the destination, and which interface does it use? (<code>show routing route</code>)</li>
<li><b>Policy:</b> which rule would this flow hit? (<code>test security-policy-match ...</code>)</li>
<li><b>NAT:</b> does outbound traffic get translated? (<code>show running nat-policy</code>)</li>
<li><b>Sessions and logs:</b> did the traffic arrive, and what did the firewall do? (<code>show session all</code>, <code>show log traffic</code>)</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Verification flow">
<rect x="10" y="40" width="108" height="60" rx="8" fill="#bae6fd"/><text x="64" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 Interface</text><text x="64" y="86" text-anchor="middle" class="svg-muted" font-size="12">zone, vr</text>
<rect x="136" y="40" width="108" height="60" rx="8" fill="#bae6fd"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Route</text><text x="190" y="86" text-anchor="middle" class="svg-muted" font-size="12">egress</text>
<rect x="262" y="40" width="108" height="60" rx="8" fill="#bbf7d0"/><text x="316" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="316" y="86" text-anchor="middle" class="svg-muted" font-size="12">rule match</text>
<rect x="388" y="40" width="108" height="60" rx="8" fill="#bbf7d0"/><text x="442" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 NAT</text><text x="442" y="86" text-anchor="middle" class="svg-muted" font-size="12">translation</text>
<rect x="514" y="40" width="116" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Session, log</text><text x="572" y="86" text-anchor="middle" class="svg-muted" font-size="12">proof</text>
<line x1="118" y1="70" x2="136" y2="70" stroke="#64748b" stroke-width="2"/><line x1="244" y1="70" x2="262" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="388" y2="70" stroke="#64748b" stroke-width="2"/><line x1="496" y1="70" x2="514" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Always the same order: interface, route, policy, NAT, then session and log.</p></div>

<h3>Step 2: the routing table</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route
VIRTUAL ROUTER: default (id 1)
destination        nexthop        metric flags  interface
0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1
10.0.1.0/24        10.0.1.1       0      A C    ethernet1/2
10.0.1.1/32        0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 5</pre>
<p>(Columns shortened for the page; the simulator prints the full-width table.) Flags: <code>A</code> active, <code>C</code> connected, <code>S</code> static, <code>H</code> host. A connected route appears only when the interface has an IP and is in the virtual router. This table is why "no route" problems are easy to prove.</p>

<h3>Why the data-plane test needs a source</h3>
<pre class="out">admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
...
5 packets transmitted, 5 received, 0% packet loss</pre>
<p>A plain <code>ping host 8.8.8.8</code> leaves through the management interface. Adding <code>source</code> with a data-interface IP tests the data plane. Before the default route existed, this same command showed "5 packets transmitted, 0 received, 100% packet loss".</p>

<h3>Steps 3 to 5: policy, session and log</h3>
<p>After PC1 pings 8.8.8.8 through the firewall with a rule and source NAT in place:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])

admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
2026/10/02 03:45:26 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span></pre>
<p>The session line gives you the application (<code>ping</code>), the zones (trust to untrust), and the NAT result: the source 10.0.1.10 was translated to 203.0.113.2 (flag <code>NS</code> = source NAT). The log names the rule that allowed it. Before the rule was added, the counters showed the denials:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       5         0     drop      flow      session   Session setup: denied by policy
flow_host_service_deny                 5         0     drop      flow      mgmt      Device management session denied</pre>
<p><code>flow_policy_deny</code> means a security policy denied a session (here the five pings to 8.8.8.8 before the rule existed). <code>flow_host_service_deny</code> means traffic to the firewall's own interface was refused by the management profile (the five pings to 10.0.1.1 before the profile). Two counters, two different causes, and both are visible from the CLI.</p>

<div class="eg"><p><b>Worked example.</b> User: "The internet is down." You run: interface table (fine), routing table (default route present), test security-policy-match (interzone-default deny), conclusion: no rule allows trust to untrust. Total time: a minute, no guessing. One rule and a commit fixes it, and the session table then proves it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Debugging NAT before checking policy. Testing with the wrong zone in <code>test security-policy-match</code> (the "from" and "to" must be the real zones). Reading the traffic log without remembering that denied-by-default traffic is not logged unless you add a logging rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <code>test</code> commands evaluate the <i>configuration</i>; they do not generate traffic. A session in the session table means the firewall allowed and created it. Know the first four commands by heart.</p></div>

<div class="scn"><h4>Everything "looked right" but one thing was wrong</h4><p>After a branch migration, users could not reach a partner site. The interface and route checks were clean. test security-policy-match returned the interzone-default deny: the old rule named the zone "inside", but the new interface was in "trust". Renaming the zone in the rule fixed it. The check order found it in minutes.</p><p><b>Lesson:</b> work down the checklist before touching anything.</p></div>

<div class="iv"><p class="q">"Users cannot reach a site through the firewall. How do you troubleshoot?"</p><p>Follow the flow: confirm interfaces, zones and virtual router; confirm a route and its egress interface; use test security-policy-match to see which rule would match; check NAT if the traffic goes out; then look at the session table and traffic log for proof. Mention global counters to spot drops that never make a log entry.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed order: interface, route, policy, NAT, session and log.</li>
<li>show interface all and show routing route prove layers 1 to 3.</li>
<li>ping with source tests the data plane; plain ping uses management.</li>
<li>Session flags and the log show the rule, zones and NAT result.</li>
<li>Global counters explain drops: policy deny versus management denial.</li>
</ul></div>
`,hi:`
<p><b>Analogy: doctor ki checklist.</b> Doctor andaza nahi lagati. Woh pehle pulse, phir temperature, phir sawaal poochti hai, hamesha isi order mein. Firewall troubleshooting bhi isi tarah behtar chalti hai: stack ke neeche se upar tak sasti checks ka fixed sequence. Aadat ban jaaye to poora sequence do minute se kam mein ho jaata hai.</p>

<h3>Paanch-step verification flow</h3>
<ol>
<li><b>Interfaces:</b> kya woh up hain, zone mein hain aur virtual router mein hain? (<code>show interface all</code>)</li>
<li><b>Routing:</b> destination ka route hai, aur woh kaunsa interface use karta hai? (<code>show routing route</code>)</li>
<li><b>Policy:</b> yeh flow kaunsa rule hit karega? (<code>test security-policy-match ...</code>)</li>
<li><b>NAT:</b> outbound traffic translate ho raha hai? (<code>show running nat-policy</code>)</li>
<li><b>Sessions aur logs:</b> traffic aaya, aur firewall ne kya kiya? (<code>show session all</code>, <code>show log traffic</code>)</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Verification flow">
<rect x="10" y="40" width="108" height="60" rx="8" fill="#bae6fd"/><text x="64" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 Interface</text><text x="64" y="86" text-anchor="middle" class="svg-muted" font-size="12">zone, vr</text>
<rect x="136" y="40" width="108" height="60" rx="8" fill="#bae6fd"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Route</text><text x="190" y="86" text-anchor="middle" class="svg-muted" font-size="12">egress</text>
<rect x="262" y="40" width="108" height="60" rx="8" fill="#bbf7d0"/><text x="316" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="316" y="86" text-anchor="middle" class="svg-muted" font-size="12">rule match</text>
<rect x="388" y="40" width="108" height="60" rx="8" fill="#bbf7d0"/><text x="442" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 NAT</text><text x="442" y="86" text-anchor="middle" class="svg-muted" font-size="12">translation</text>
<rect x="514" y="40" width="116" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Session, log</text><text x="572" y="86" text-anchor="middle" class="svg-muted" font-size="12">saboot</text>
<line x1="118" y1="70" x2="136" y2="70" stroke="#64748b" stroke-width="2"/><line x1="244" y1="70" x2="262" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="388" y2="70" stroke="#64748b" stroke-width="2"/><line x1="496" y1="70" x2="514" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Hamesha wahi order: interface, route, policy, NAT, phir session aur log.</p></div>

<h3>Step 2: routing table</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route
VIRTUAL ROUTER: default (id 1)
destination        nexthop        metric flags  interface
0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1
10.0.1.0/24        10.0.1.1       0      A C    ethernet1/2
10.0.1.1/32        0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 5</pre>
<p>(Page ke liye columns chhote kiye gaye hain; simulator poori-width table print karta hai.) Flags: <code>A</code> active, <code>C</code> connected, <code>S</code> static, <code>H</code> host. Connected route tabhi aata hai jab interface par IP ho aur woh virtual router mein ho. Is table ki wajah se "no route" problems aasani se saabit hoti hain.</p>

<h3>Data-plane test ko source kyun chahiye</h3>
<pre class="out">admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
...
5 packets transmitted, 5 received, 0% packet loss</pre>
<p>Plain <code>ping host 8.8.8.8</code> management interface se nikalta hai. <code>source</code> ke saath data-interface IP dene se data plane test hota hai. Default route aane se pehle yahi command "5 packets transmitted, 0 received, 100% packet loss" dikhata tha.</p>

<h3>Steps 3 se 5: policy, session aur log</h3>
<p>Rule aur source NAT lagne ke baad jab PC1 firewall ke through 8.8.8.8 ko ping karta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])

admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
2026/10/02 03:45:26 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span></pre>
<p>Session line aapko application (<code>ping</code>), zones (trust se untrust) aur NAT result deti hai: source 10.0.1.10 translate hokar 203.0.113.2 ho gaya (flag <code>NS</code> = source NAT). Log us rule ka naam batata hai jisne allow kiya. Rule jodne se pehle counters ne denials dikhaye the:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       5         0     drop      flow      session   Session setup: denied by policy
flow_host_service_deny                 5         0     drop      flow      mgmt      Device management session denied</pre>
<p><code>flow_policy_deny</code> ka matlab security policy ne session deny kiya (yahan rule se pehle 8.8.8.8 ke paanch pings). <code>flow_host_service_deny</code> ka matlab firewall ke apne interface ka traffic management profile ne refuse kiya (profile se pehle 10.0.1.1 ke paanch pings). Do counters, do alag wajah, aur dono CLI se dikhte hain.</p>

<div class="eg"><p><b>Worked example.</b> User: "Internet down hai." Aap chalate ho: interface table (theek), routing table (default route hai), test security-policy-match (interzone-default deny), nateeja: koi rule trust se untrust allow nahi karta. Kul time: ek minute, koi andaza nahi. Ek rule aur commit fix kar deta hai, aur session table phir saabit karti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Policy check karne se pehle NAT debug karna. <code>test security-policy-match</code> mein galat zone dena ("from" aur "to" asli zones hone chahiye). Traffic log padhna bina yaad rakhe ki default se denied traffic log nahi hota jab tak aap logging wala rule na jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>test</code> commands <i>configuration</i> evaluate karte hain; woh traffic generate nahi karte. Session table mein session hone ka matlab firewall ne use allow karke banaya. Pehle chaar commands ratt lo.</p></div>

<div class="scn"><h4>Sab "sahi dikhta" tha lekin ek cheez galat thi</h4><p>Branch migration ke baad users partner site tak nahi pahunch pa rahe the. Interface aur route checks saaf the. test security-policy-match ne interzone-default deny diya: purane rule mein zone ka naam "inside" tha, jabki naya interface "trust" mein tha. Rule mein zone ka naam badalne se fix hua. Check order ne minutes mein pakad liya.</p><p><b>Lesson:</b> kuch chhoone se pehle checklist par neeche jao.</p></div>

<div class="iv"><p class="q">"Users firewall ke through ek site tak nahi pahunch pa rahe. Troubleshoot kaise karoge?"</p><p>Flow follow karo: interfaces, zones aur virtual router confirm karo; route aur uska egress interface confirm karo; test security-policy-match se dekho kaunsa rule match karega; traffic bahar ja raha ho to NAT check karo; phir saboot ke liye session table aur traffic log dekho. Global counters ka zikr karo jo aise drops dikhate hain jinki log entry kabhi nahi banti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order use karo: interface, route, policy, NAT, session aur log.</li>
<li>show interface all aur show routing route layers 1 se 3 saabit karte hain.</li>
<li>source ke saath ping data plane test karta hai; plain ping management use karta hai.</li>
<li>Session flags aur log rule, zones aur NAT result dikhate hain.</li>
<li>Global counters drops samjhate hain: policy deny versus management denial.</li>
</ul></div>
`}};export{e as default};