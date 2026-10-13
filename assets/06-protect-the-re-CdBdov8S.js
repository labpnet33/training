var e={id:`protect-re`,h:{en:`Protecting the Routing Engine: the lo0 filter walkthrough`,hi:`Routing Engine ko bachana: lo0 filter walkthrough`},body:{en:`
<p>This chapter walks through the first lab step by step. The goal is a loopback filter that lets the NOC log in with SSH, lets everyone ping the router, keeps OSPF alive, and drops everything else, all applied safely.</p>

<h3>Analogy: the server-room door</h3>
<p>The building has many doors, but only one door leads to the server room. Rather than guard every building door against server-room visitors, you put a lock on the server-room door itself. The loopback filter is that lock. Whoever comes from wherever, they must pass the lock.</p>

<h3>The topology</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Nagpur lab topology">
<rect x="20" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.12</text>
<rect x="260" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="64" text-anchor="middle" class="svg-ink" font-size="14">R1-NAGPUR</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo0 192.0.2.11</text>
<rect x="150" y="190" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="210" y="215" text-anchor="middle" class="svg-ink" font-size="14">NOC</text><text x="210" y="235" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.10</text>
<rect x="400" y="190" width="120" height="60" rx="8" fill="#fde68a"/><text x="460" y="215" text-anchor="middle" class="svg-ink" font-size="14">USER</text><text x="460" y="235" text-anchor="middle" class="svg-muted" font-size="11">10.20.20.50</text>
<line x1="130" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><text x="195" y="60" text-anchor="middle" class="svg-muted" font-size="11">10.0.12.0/30 OSPF</text>
<line x1="290" y1="100" x2="230" y2="190" stroke="#64748b" stroke-width="2"/><text x="215" y="150" text-anchor="end" class="svg-muted" font-size="11">10.10.10.1/24</text>
<line x1="360" y1="100" x2="440" y2="190" stroke="#64748b" stroke-width="2"/><text x="420" y="145" class="svg-muted" font-size="11">10.20.20.1/24</text>
</svg><p class="cap">R1 runs OSPF with R2. The NOC subnet is 10.10.10.0/24. Users are on 10.20.20.0/24.</p></div>
<p>Requirements: only NOC may SSH to R1. Users and routers may still ping it. The OSPF adjacency with R2 must survive. Everything else is dropped and counted in <code>re-denied</code>.</p>

<h3>Step 1: plan the terms in the right order</h3>
<table class="cmp"><tr><th>#</th><th>Term</th><th>Match</th><th>Action</th></tr>
<tr><td>1</td><td>SSH-NOC</td><td>source 10.10.10.0/24, tcp, destination-port ssh</td><td>accept</td></tr>
<tr><td>2</td><td>ICMP</td><td>protocol icmp</td><td>accept</td></tr>
<tr><td>3</td><td>OSPF</td><td>protocol ospf</td><td>accept</td></tr>
<tr><td>4</td><td>DENY</td><td>everything else</td><td>count re-denied, discard</td></tr></table>

<h3>Step 2: build the filter</h3>
<pre class="code">lab@R1-NAGPUR&gt; configure
lab@R1-NAGPUR# edit firewall family inet filter PROTECT-RE
lab@R1-NAGPUR# set term SSH-NOC from source-address 10.10.10.0/24
lab@R1-NAGPUR# set term SSH-NOC from protocol tcp
lab@R1-NAGPUR# set term SSH-NOC from destination-port ssh
lab@R1-NAGPUR# set term SSH-NOC then accept
lab@R1-NAGPUR# set term ICMP from protocol icmp
lab@R1-NAGPUR# set term ICMP then accept
lab@R1-NAGPUR# set term OSPF from protocol ospf
lab@R1-NAGPUR# set term OSPF then accept
lab@R1-NAGPUR# set term DENY then count re-denied
lab@R1-NAGPUR# set term DENY then discard
lab@R1-NAGPUR# top</pre>
<p>The SSH term is first and specific. DENY is last and general. Because DENY has no <code>from</code>, it matches everything the earlier terms did not, and it counts what it drops. You can see the logic with <code>show firewall family inet filter PROTECT-RE</code>.</p>

<h3>Step 3: apply safely</h3>
<pre class="code">lab@R1-NAGPUR# set interfaces lo0 unit 0 family inet filter input PROTECT-RE
lab@R1-NAGPUR# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

lab@R1-NAGPUR# run show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.0.12.2        ge-0/0/0.0             Full            192.0.2.12       128    35

lab@R1-NAGPUR# commit and-quit
commit complete
Exiting configuration mode</pre>
<p>The sequence is important: apply with the timer, test, and confirm only after the tests pass. If OSPF had dropped, or your own session had stopped responding, you would have waited five minutes (or run <code>rollback 1</code>) and the router would return to the old configuration.</p>

<h3>Step 4: test who gets in</h3>
<pre class="out">NOC&gt; ssh -l lab 192.0.2.11
Password:                           <i>reached the login prompt: allowed</i>

USER&gt; ssh -l lab 10.20.20.1
ssh: connect to host 10.20.20.1 port 22: Connection timed out
<span class="hl">                                    <i>blocked: even a LAN address of R1 is protected</i></span>

R2&gt; ssh lab@192.0.2.11
ssh: connect to host 192.0.2.11 port 22: Connection timed out

R2&gt; ping 192.0.2.11 count 3
64 bytes from 192.0.2.11: icmp_seq=0 ttl=64 time=0.8 ms
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Three results to understand. The NOC reaches the password prompt, so term SSH-NOC works. The user times out even when targeting 10.20.20.1, because the lo0 filter protects <b>every</b> address of R1. R2 times out for SSH because its source address is not in 10.10.10.0/24, yet its ping works, because ICMP is accepted for everyone. SSH itself is still enabled under <code>system services ssh</code>; we only filter who can reach it.</p>

<h3>Step 5: read the counters</h3>
<pre class="out">lab@R1-NAGPUR&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
<span class="hl">re-denied                                            180                    3</span></pre>
<p>Three blocked SSH attempts (the USER attempts and the R2 attempt, which appear as SYN retries) produced a non-zero <code>re-denied</code>. Without the explicit DENY term, the implicit discard would still drop them, but you would see no numbers.</p>

<h3>What would have gone wrong</h3>
<ul>
<li><b>No OSPF term:</b> hellos from R2 are dropped; after the dead interval (40 seconds by default on broadcast links) the adjacency falls and R2's routes vanish.</li>
<li><b>No ICMP term:</b> monitoring tools that ping the router report it down.</li>
<li><b>SSH term after DENY:</b> nobody can log in, including the NOC.</li>
<li><b>No commit confirmed:</b> a mistake in the NOC term locks the administrator out and needs console access.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Writing the SSH term with a wide source, such as <code>0.0.0.0/0</code>, or forgetting the source entirely. Then every host can reach SSH. Always check by testing from a denied host, not only from the allowed one.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lo0 filter is evaluated for traffic to the router; it can break routing protocols, which need their own accept terms (OSPF protocol 89, BGP TCP 179). Also note that SSH to the router's other interface addresses is subject to the same filter.</p></div>

<div class="scn"><h4>The 40-second outage</h4><p>A team applied a lo0 filter during a change window without commit confirmed. It allowed SSH and ping but nobody had listed OSPF. The CLI session stayed up (SSH was allowed), so the engineer believed all was fine. Forty seconds later OSPF neighbours timed out, the branch lost its routes and monitoring turned red. The engineer ran <code>rollback 1</code>, committed, and routing recovered. The fix added a term for OSPF and BGP before the final deny. The team now requires <code>show ospf neighbor</code> output in the change record.</p><p><b>Lesson:</b> a lo0 filter must account for every protocol the router needs, not only management.</p></div>

<div class="iv"><p class="q">"You are asked to restrict SSH access to a router. How do you do it without causing an outage?"</p><p>Strong answer: build a lo0 input filter with terms in order: SSH from the management subnet, ICMP, routing protocols (OSPF, BGP, BFD as needed), then a final count-and-discard. Apply it with commit confirmed, verify protocols are still up, test SSH from an allowed and a denied host, check the counter, then confirm the commit. Mention that SSH itself stays enabled; the filter only limits who can reach it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order the lo0 filter: SSH from NOC, ICMP, routing protocols, then count and discard.</li>
<li>Apply with commit confirmed and check OSPF before confirming.</li>
<li>The lo0 filter protects every address of the router, including LAN addresses.</li>
<li>Test from allowed and denied sources and read the re-denied counter.</li>
<li>Forgetting a routing protocol term kills adjacencies after the dead interval.</li>
</ul></div>
`,hi:`
<p>Yeh chapter pehli lab ko step by step chalata hai. Goal hai loopback filter jo NOC ko SSH se login karne de, sabko router ping karne de, OSPF zinda rakhe, aur baaki sab drop kare, sab safely apply hokar.</p>

<h3>Analogy: server-room ka darwaza</h3>
<p>Building mein kai darwaze hain, lekin sirf ek darwaza server room tak jaata hai. Building ke har darwaze par server-room ke visitors se guard lagane ki jagah, aap server-room ke darwaze par hi taala lagate ho. Loopback filter wahi taala hai. Jo bhi kahin se aaye, use taale se guzarna hoga.</p>

<h3>Topology</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Nagpur lab topology">
<rect x="20" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="68" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="11">192.0.2.12</text>
<rect x="260" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="325" y="64" text-anchor="middle" class="svg-ink" font-size="14">R1-NAGPUR</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="11">lo0 192.0.2.11</text>
<rect x="150" y="190" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="210" y="215" text-anchor="middle" class="svg-ink" font-size="14">NOC</text><text x="210" y="235" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.10</text>
<rect x="400" y="190" width="120" height="60" rx="8" fill="#fde68a"/><text x="460" y="215" text-anchor="middle" class="svg-ink" font-size="14">USER</text><text x="460" y="235" text-anchor="middle" class="svg-muted" font-size="11">10.20.20.50</text>
<line x1="130" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><text x="195" y="60" text-anchor="middle" class="svg-muted" font-size="11">10.0.12.0/30 OSPF</text>
<line x1="290" y1="100" x2="230" y2="190" stroke="#64748b" stroke-width="2"/><text x="215" y="150" text-anchor="end" class="svg-muted" font-size="11">10.10.10.1/24</text>
<line x1="360" y1="100" x2="440" y2="190" stroke="#64748b" stroke-width="2"/><text x="420" y="145" class="svg-muted" font-size="11">10.20.20.1/24</text>
</svg><p class="cap">R1 R2 ke saath OSPF chalata hai. NOC subnet 10.10.10.0/24 hai. Users 10.20.20.0/24 par hain.</p></div>
<p>Requirements: sirf NOC R1 ko SSH kar sake. Users aur routers ab bhi ping kar sakein. R2 ke saath OSPF adjacency bachi rahe. Baaki sab drop ho aur <code>re-denied</code> mein count ho.</p>

<h3>Step 1: terms sahi order mein plan karo</h3>
<table class="cmp"><tr><th>#</th><th>Term</th><th>Match</th><th>Action</th></tr>
<tr><td>1</td><td>SSH-NOC</td><td>source 10.10.10.0/24, tcp, destination-port ssh</td><td>accept</td></tr>
<tr><td>2</td><td>ICMP</td><td>protocol icmp</td><td>accept</td></tr>
<tr><td>3</td><td>OSPF</td><td>protocol ospf</td><td>accept</td></tr>
<tr><td>4</td><td>DENY</td><td>baaki sab</td><td>count re-denied, discard</td></tr></table>

<h3>Step 2: filter banao</h3>
<pre class="code">lab@R1-NAGPUR&gt; configure
lab@R1-NAGPUR# edit firewall family inet filter PROTECT-RE
lab@R1-NAGPUR# set term SSH-NOC from source-address 10.10.10.0/24
lab@R1-NAGPUR# set term SSH-NOC from protocol tcp
lab@R1-NAGPUR# set term SSH-NOC from destination-port ssh
lab@R1-NAGPUR# set term SSH-NOC then accept
lab@R1-NAGPUR# set term ICMP from protocol icmp
lab@R1-NAGPUR# set term ICMP then accept
lab@R1-NAGPUR# set term OSPF from protocol ospf
lab@R1-NAGPUR# set term OSPF then accept
lab@R1-NAGPUR# set term DENY then count re-denied
lab@R1-NAGPUR# set term DENY then discard
lab@R1-NAGPUR# top</pre>
<p>SSH term pehle aur specific hai. DENY aakhir mein aur general hai. DENY mein <code>from</code> nahi, isliye woh sab match karta hai jo pehle ke terms ne nahi kiya, aur jo drop karta hai use count karta hai. Logic aap <code>show firewall family inet filter PROTECT-RE</code> se dekh sakte ho.</p>

<h3>Step 3: safely apply karo</h3>
<pre class="code">lab@R1-NAGPUR# set interfaces lo0 unit 0 family inet filter input PROTECT-RE
lab@R1-NAGPUR# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

lab@R1-NAGPUR# run show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.0.12.2        ge-0/0/0.0             Full            192.0.2.12       128    35

lab@R1-NAGPUR# commit and-quit
commit complete
Exiting configuration mode</pre>
<p>Sequence important hai: timer ke saath apply karo, test karo, aur tests pass hone ke baad hi confirm karo. Agar OSPF gir jaata, ya aapka session respond karna band kar deta, to aap paanch minute wait karte (ya <code>rollback 1</code> chalate) aur router purani configuration par laut jaata.</p>

<h3>Step 4: test karo kaun andar aata hai</h3>
<pre class="out">NOC&gt; ssh -l lab 192.0.2.11
Password:                           <i>login prompt tak pahunche: allowed</i>

USER&gt; ssh -l lab 10.20.20.1
ssh: connect to host 10.20.20.1 port 22: Connection timed out
<span class="hl">                                    <i>blocked: R1 ka LAN address bhi protected hai</i></span>

R2&gt; ssh lab@192.0.2.11
ssh: connect to host 192.0.2.11 port 22: Connection timed out

R2&gt; ping 192.0.2.11 count 3
64 bytes from 192.0.2.11: icmp_seq=0 ttl=64 time=0.8 ms
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Teen results samajhne hain. NOC password prompt tak pahunchta hai, isliye term SSH-NOC kaam karta hai. User 10.20.20.1 ko target karke bhi time out hota hai, kyunki lo0 filter R1 ke <b>har</b> address ko bachata hai. R2 SSH ke liye time out hota hai kyunki uska source address 10.10.10.0/24 mein nahi, lekin uska ping chalta hai, kyunki ICMP sabke liye accepted hai. SSH khud <code>system services ssh</code> ke neeche abhi enabled hai; hum sirf yeh filter karte hain ki kaun use reach kare.</p>

<h3>Step 5: counters padho</h3>
<pre class="out">lab@R1-NAGPUR&gt; show firewall filter PROTECT-RE

Filter: PROTECT-RE
Counters:
Name                                                Bytes              Packets
<span class="hl">re-denied                                            180                    3</span></pre>
<p>Teen blocked SSH attempts (USER ke attempts aur R2 ka attempt, jo SYN retries ke roop mein dikhte hain) ne non-zero <code>re-denied</code> banaya. Explicit DENY term ke bina bhi implicit discard unhe drop karta, lekin numbers nahi dikhte.</p>

<h3>Kya galat ho sakta tha</h3>
<ul>
<li><b>OSPF term nahi:</b> R2 ke hellos drop hote hain; dead interval (broadcast links par default 40 seconds) ke baad adjacency gir jaati hai aur R2 ke routes gayab ho jaate hain.</li>
<li><b>ICMP term nahi:</b> router ko ping karne wale monitoring tools use down batate hain.</li>
<li><b>SSH term DENY ke baad:</b> koi login nahi kar sakta, NOC bhi nahi.</li>
<li><b>commit confirmed nahi:</b> NOC term mein galti administrator ko lock-out kar deti hai aur console access chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> SSH term ko wide source ke saath likhna, jaise <code>0.0.0.0/0</code>, ya source bilkul bhool jaana. Phir har host SSH tak pahunch sakta hai. Hamesha denied host se test karke check karo, sirf allowed host se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> lo0 filter router ko jaane wale traffic ke liye evaluate hota hai; yeh routing protocols tod sakta hai, jinhe apne accept terms chahiye (OSPF protocol 89, BGP TCP 179). Yeh bhi note karo ki router ke doosre interface addresses par SSH par wahi filter lagta hai.</p></div>

<div class="scn"><h4>40 second ka outage</h4><p>Ek team ne change window mein commit confirmed ke bina lo0 filter apply kiya. Usne SSH aur ping allow kiye lekin kisi ne OSPF list nahi kiya. CLI session chalti rahi (SSH allowed tha), isliye engineer ko laga sab theek hai. Chalis seconds baad OSPF neighbours time out hue, branch ke routes chale gaye aur monitoring laal ho gayi. Engineer ne <code>rollback 1</code> chalaya, commit kiya, aur routing recover hui. Fix mein final deny se pehle OSPF aur BGP ka term joda gaya. Ab team change record mein <code>show ospf neighbor</code> ka output maangti hai.</p><p><b>Lesson:</b> lo0 filter ko router ke liye zaroori har protocol ka hisaab rakhna padta hai, sirf management ka nahi.</p></div>

<div class="iv"><p class="q">"Aapse router par SSH access restrict karne ko kaha gaya. Outage ke bina kaise karoge?"</p><p>Strong answer: lo0 input filter banao jiske terms is order mein hon: management subnet se SSH, ICMP, routing protocols (zaroorat ke hisaab se OSPF, BGP, BFD), phir aakhir mein count-and-discard. Commit confirmed se apply karo, verify karo ki protocols up hain, allowed aur denied host se SSH test karo, counter check karo, phir commit confirm karo. Bolo ki SSH khud enabled rehta hai; filter sirf yeh limit karta hai ki kaun use reach kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>lo0 filter ka order: NOC se SSH, ICMP, routing protocols, phir count aur discard.</li>
<li>commit confirmed se apply karo aur confirm karne se pehle OSPF check karo.</li>
<li>lo0 filter router ke har address ko bachata hai, LAN addresses bhi.</li>
<li>Allowed aur denied sources se test karo aur re-denied counter padho.</li>
<li>Routing protocol term bhoolne se dead interval ke baad adjacencies gir jaati hain.</li>
</ul></div>
`}};export{e as default};