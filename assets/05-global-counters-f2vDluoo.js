var e={id:`global-counters`,h:{en:`Global counters: the firewall tells you why it dropped`,hi:`Global counters: firewall batata hai kyun drop kiya`},body:{en:`

<p><b>The firewall keeps a diary of every drop.</b> Each time the data plane discards a packet, it increments a <b>global counter</b> with a name that says why. Reading the counter that moved is often faster than any other method, and it works even when the traffic log is empty.</p>

<h3>Analogy: the rejected-at-the-gate tally</h3>
<p>A stadium gate keeps a tally: "no ticket: 4, wrong gate: 2, banned item: 1". You do not need to watch every person. You look at which tally moved after the complaint. Global counters are the tally, and the counter name is the reason.</p>

<h3>The commands</h3>
<ul>
<li><code>show counter global</code> shows every non-zero counter since boot.</li>
<li><code>show counter global filter severity drop</code> shows only counters whose severity is <code>drop</code>.</li>
<li><code>show counter global filter delta yes severity drop</code> shows only the <b>change since the last time you ran a delta command</b>. This is the one you use in tickets.</li>
</ul>
<p>The delta method has three steps. Run it once to set the baseline. Reproduce the problem. Run it again. Only what changed in between is shown.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Delta method"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">1. Baseline</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">run the delta command once</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">2. Reproduce</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">user or test retries the flow</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">3. Read delta</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">run it again; read the counter</text></svg><p class="cap">The delta method: baseline, reproduce, read.</p></div>

<h3>Worked example: the DNS ticket</h3>
<p>On the lab firewall the DMZ server WEB cannot reach DNS at 8.8.8.8 on TCP port 53. First run the delta command (baseline, empty). On WEB the connection times out:</p>
<pre class="out">WEB&gt; curl 8.8.8.8:53
curl: (28) Failed to connect to 8.8.8.8 port 53 after 2001 ms: Timeout was reached</pre>
<p>Now read the delta again:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop

Global counters:
Elapsed time since last sampling: 0.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<p>One counter moved: <code>flow_policy_deny</code>, described as "Session setup: denied by policy". The firewall dropped the first packet because the security policy denied it. The next stage of the work is obvious: find which rule decided, with the test command from the previous chapter.</p>
<p>The unfiltered command shows other counters as well, such as informational ones:</p>
<pre class="out">PA1&gt; show counter global

Global counters:
Elapsed time since last sampling: 0.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
session_allocated                      1         0     info      session   resource  Sessions allocated
flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy
-----------------------------------------------------------------------------------------------
Total counters shown: 2
-----------------------------------------------------------------------------------------------</pre>
<p><code>session_allocated</code> has severity <b>info</b>, not <b>drop</b>, which is why the drop filter hides it. It counts sessions created since boot.</p>

<h3>Counters worth knowing</h3>
<table class="cmp"><tr><th>Counter</th><th>Meaning</th><th>Typical fix</th></tr>
<tr><td>flow_policy_deny</td><td>Session setup denied by security policy</td><td>Find the rule with test security-policy-match; add or reorder a rule</td></tr>
<tr><td>flow_fwd_notopology</td><td>Packet arrived on an interface that has no zone</td><td>Put the interface in a zone (and a virtual router)</td></tr>
<tr><td>flow_host_service_deny</td><td>Traffic to the firewall itself is denied by the management profile</td><td>Enable ping, SSH or the needed service in the interface management profile</td></tr>
<tr><td>session_allocated</td><td>Informational: sessions created</td><td>Used to confirm that traffic is creating sessions</td></tr>
</table>
<p>The simulator implements these four. A real PAN-OS has hundreds of counters; each line has a <code>description</code> column, so read it instead of memorising names. The counter families to recognise are <b>flow</b> (data plane decisions), <b>session</b> and <b>appid</b>.</p>

<div class="eg"><p><b>Worked example.</b> Pinging the firewall interface from a PC fails, and the delta shows flow_host_service_deny rising. The security policy is irrelevant here, because traffic to the firewall itself is controlled by the interface management profile. The engineer enables ping in the profile of that interface and the ping works.</p></div>

<h3>Counters tell you what, not who</h3>
<p>A counter does not say which user or which IP was dropped. That is why you combine it with a controlled test. Reproduce from one source, read the delta, and you know that this flow caused it. On a busy firewall other users also raise counters, so repeat the test if the number rises by more than you expect.</p>

<div class="warn"><p><b>Common mistake.</b> Reading the cumulative counter and concluding "it is dropping a lot". Totals since boot include old events. Use delta yes so that you see only what your test caused.</p></div>
<div class="exam"><p><b>Exam trap.</b> The two names to know cold: flow_policy_deny (security policy dropped the session) and flow_fwd_notopology (no zone on the interface). flow_host_service_deny relates to the management profile on the interface, not to a security rule.</p></div>

<div class="scn"><h4>Everything looked fine except one counter</h4><p>Users in a new VLAN could not get out. The security rules were right and the NAT test passed. The delta counters showed flow_fwd_notopology rising on every attempt. The new sub-interface had been created and addressed but never assigned to a zone. Adding it to the trust zone and committing fixed it in two minutes.</p><p><b>Lesson:</b> When the policy looks right but traffic still dies, the counter name points to the stage that is wrong. Read it before you start editing rules.</p></div>

<div class="iv"><p class="q">"How do you find out whether the firewall is dropping a specific flow and why?"</p><p>I run show counter global filter delta yes severity drop to set a baseline, reproduce the flow, and run it again. The counter that increased names the reason, for example flow_policy_deny for a policy denial. Then I use the test commands and session details to find the exact rule. I use delta because totals since boot are noisy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Global counters name the reason for each drop; severity drop is what you filter on.</li>
<li>Use the delta method: baseline, reproduce, read.</li>
<li>flow_policy_deny means security policy denied the session setup.</li>
<li>flow_fwd_notopology means the interface has no zone; flow_host_service_deny means the management profile.</li>
<li>Counters do not name users; reproduce from a known source.</li>
</ul></div>

`,hi:`

<p><b>Firewall har drop ki diary rakhta hai.</b> Jab bhi data plane koi packet discard karta hai, woh ek <b>global counter</b> badhata hai jiska naam batata hai kyun. Jo counter hila use padhna aksar sabse tez tareeka hai, aur yeh tab bhi kaam karta hai jab traffic log khaali ho.</p>

<h3>Analogy: gate par reject hue logon ki tally</h3>
<p>Stadium gate tally rakhta hai: "ticket nahi: 4, galat gate: 2, banned item: 1". Har insaan ko dekhne ki zaroorat nahi. Shikayat ke baad dekho kaunsi tally hili. Global counters wahi tally hain, aur counter ka naam wajah hai.</p>

<h3>Commands</h3>
<ul>
<li><code>show counter global</code> boot ke baad ke har non-zero counter dikhata hai.</li>
<li><code>show counter global filter severity drop</code> sirf wahi counters dikhata hai jinki severity <code>drop</code> hai.</li>
<li><code>show counter global filter delta yes severity drop</code> sirf <b>pichhli baar delta command chalane ke baad ka badlav</b> dikhata hai. Ticket mein yahi use hota hai.</li>
</ul>
<p>Delta method ke teen steps hain. Ek baar chalao, baseline set hoti hai. Problem reproduce karo. Dobara chalao. Beech mein jo badla sirf wahi dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Delta method"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">1. Baseline</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">delta command ek baar</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">2. Reproduce</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">user ya test flow dobara</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">3. Delta padho</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">dobara chalao; counter padho</text></svg><p class="cap">Delta method: baseline, reproduce, read.</p></div>

<h3>Worked example: DNS ticket</h3>
<p>Lab firewall par DMZ server WEB 8.8.8.8 ke DNS TCP port 53 tak nahi pahunch pa raha. Pehle delta command chalao (baseline, khaali). WEB par connection time out hota hai:</p>
<pre class="out">WEB&gt; curl 8.8.8.8:53
curl: (28) Failed to connect to 8.8.8.8 port 53 after 2001 ms: Timeout was reached</pre>
<p>Ab delta dobara padho:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop

Global counters:
Elapsed time since last sampling: 0.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
<span class="hl">flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</span>
-----------------------------------------------------------------------------------------------
Total counters shown: 1
-----------------------------------------------------------------------------------------------</pre>
<p>Ek counter hila: <code>flow_policy_deny</code>, jiska description hai "Session setup: denied by policy". Firewall ne pehla packet isliye drop kiya kyunki security policy ne deny kiya. Agla kaam saaf hai: pichhle chapter ke test command se pata karo kaunsi rule ne decide kiya.</p>
<p>Unfiltered command doosre counters bhi dikhata hai, jaise informational wale:</p>
<pre class="out">PA1&gt; show counter global

Global counters:
Elapsed time since last sampling: 0.000 seconds

name                                   value     rate  severity  category  aspect    description
-----------------------------------------------------------------------------------------------
session_allocated                      1         0     info      session   resource  Sessions allocated
flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy
-----------------------------------------------------------------------------------------------
Total counters shown: 2
-----------------------------------------------------------------------------------------------</pre>
<p><code>session_allocated</code> ki severity <b>info</b> hai, <b>drop</b> nahi, isliye drop filter use chhupa deta hai. Yeh boot ke baad bane sessions ginta hai.</p>

<h3>Kaam ke counters</h3>
<table class="cmp"><tr><th>Counter</th><th>Matlab</th><th>Aam fix</th></tr>
<tr><td>flow_policy_deny</td><td>Security policy ne session setup deny kiya</td><td>test security-policy-match se rule dhoondo; rule add ya reorder karo</td></tr>
<tr><td>flow_fwd_notopology</td><td>Packet aise interface par aaya jiska zone nahi</td><td>Interface ko zone (aur virtual router) mein daalo</td></tr>
<tr><td>flow_host_service_deny</td><td>Firewall tak ka traffic management profile ne deny kiya</td><td>Interface management profile mein ping, SSH ya zaroori service enable karo</td></tr>
<tr><td>session_allocated</td><td>Informational: bane hue sessions</td><td>Confirm karne ke liye ki traffic session bana raha hai</td></tr>
</table>
<p>Simulator yeh chaar implement karta hai. Real PAN-OS mein sau-hazaar counters hote hain; har line mein <code>description</code> column hota hai, naam ratne ke bajaye use padho. Pehchanne ke liye families hain <b>flow</b> (data plane decisions), <b>session</b> aur <b>appid</b>.</p>

<div class="eg"><p><b>Worked example.</b> PC se firewall interface ko ping fail hoti hai, aur delta mein flow_host_service_deny badhta dikhta hai. Yahan security policy irrelevant hai, kyunki firewall tak ka traffic interface management profile control karta hai. Engineer us interface ke profile mein ping enable karta hai aur ping chal jaati hai.</p></div>

<h3>Counters batate hain kya, kaun nahi</h3>
<p>Counter nahi batata kaunsa user ya IP drop hua. Isliye ise controlled test ke saath milate hain. Ek source se reproduce karo, delta padho, aur pata chal jaata hai ki isi flow ne badhaya. Busy firewall par doosre users bhi counters badhate hain, isliye number umeed se zyada badhe to test dohrao.</p>

<div class="warn"><p><b>Common mistake.</b> Cumulative counter padhkar nateeja nikalna "bahut drop ho raha hai". Boot ke baad ke totals mein purane events bhi hote hain. delta yes use karo taaki sirf aapke test ka asar dikhe.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do naam ratt lo: flow_policy_deny (security policy ne session drop kiya) aur flow_fwd_notopology (interface par zone nahi). flow_host_service_deny interface ke management profile se juda hai, security rule se nahi.</p></div>

<div class="scn"><h4>Ek counter ke alawa sab theek tha</h4><p>Naye VLAN ke users bahar nahi ja pa rahe the. Security rules sahi thi aur NAT test pass hua. Delta counters mein har attempt par flow_fwd_notopology badh raha tha. Naya sub-interface bana aur address mila tha lekin zone mein daala hi nahi gaya tha. Use trust zone mein daalkar commit karne se do minute mein fix ho gaya.</p><p><b>Lesson:</b> Policy sahi lage phir bhi traffic mare to counter ka naam batata hai kaunsa stage galat hai. Rules edit karne se pehle use padho.</p></div>

<div class="iv"><p class="q">"Kaise pata karte ho ki firewall kisi specific flow ko drop kar raha hai aur kyun?"</p><p>show counter global filter delta yes severity drop se baseline set karta hoon, flow reproduce karta hoon, aur dobara chalata hoon. Jo counter badha woh wajah batata hai, jaise policy denial ke liye flow_policy_deny. Phir exact rule ke liye test commands aur session details use karta hoon. Delta isliye kyunki boot ke baad ke totals noisy hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Global counters har drop ki wajah ka naam dete hain; severity drop se filter karo.</li>
<li>Delta method use karo: baseline, reproduce, read.</li>
<li>flow_policy_deny matlab security policy ne session setup deny kiya.</li>
<li>flow_fwd_notopology matlab interface par zone nahi; flow_host_service_deny matlab management profile.</li>
<li>Counters users ke naam nahi dete; known source se reproduce karo.</li>
</ul></div>

`}};export{e as default};