var e={id:`engine-debug`,h:{en:`Inside Snort: firewall-engine-debug and system support trace`,hi:`Snort ke andar: firewall-engine-debug aur system support trace`},body:{en:`
<p>Sometimes LINA says "permit" and the connection still dies. Then the decision was made inside Snort, and you need to listen to Snort think. Two commands do that on live traffic: <code>system support firewall-engine-debug</code> prints Snort's access control decisions, and <code>system support trace</code> prints the same plus the packet-level trace of each matching packet. Think of them as a microphone placed next to the security scanner at the airport: you hear the officer say "this bag matches rule 3, allowed" or "this name is on the list, stop".</p>

<h3>system support firewall-engine-debug</h3>
<p>The command asks interactive questions to build a filter. Always answer them; an unfiltered debug on a busy firewall is noisy and costs CPU.</p>
<pre class="code">&gt; system support firewall-engine-debug

Please specify an IP protocol: tcp
Please specify a client IP address: 198.51.100.10
Please specify a client port:
Please specify a server IP address: 10.0.2.10
Please specify a server port: 443
Monitoring firewall engine debug messages</pre>
<p>Now reproduce the problem. Typical output for the fixed lab:</p>
<pre class="out">198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: starting rule matching, zone 1 -&gt; 3, geo 0 -&gt; 0, vlan 0, src sgt: 0, src sgt type: unknown, dst sgt: 0, dst sgt type: unknown, svc 0, payload 0, client 0, misc 0, user 9999997, icmpType 0, icmpCode 0
<span class="hl">198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: allow rule, 'Portal-In', allow</span>
198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Policies: Network 0, Inspection 0, Detection 3
^C
Caught interrupt signal
Exiting.</pre>
<p>Read it this way: the flow is identified by client-port &gt; server-port and protocol 6 (TCP). <b>Zone 1 -&gt; 3</b> is the ingress and egress zone IDs. The user ID 9999997 means "no user identity". svc, payload and client 0 mean application identification has not finished yet. The key line is the verdict: <b>allow rule, 'Portal-In', allow</b>. Press Ctrl+C to stop.</p>

<h3>What a Snort block looks like</h3>
<pre class="out">198.51.100.20-51022 &gt; 10.0.2.10-443 6 AS=0 ID=4 GR=1-1 Firewall: starting rule matching, zone 1 -&gt; 3, geo 0 -&gt; 0, vlan 0, ...
<span class="hl">198.51.100.20-51022 &gt; 10.0.2.10-443 6 AS=0 ID=4 GR=1-1 Firewall: SI: blocklisted IP, block</span>

10.0.1.10-53310 &gt; 192.0.2.80-443 6 AS=0 ID=2 GR=1-1 Firewall: pending rule-matching, 'Block-Social', pending AppID
<span class="hl">10.0.1.10-53310 &gt; 192.0.2.80-443 6 AS=0 ID=2 GR=1-1 Firewall: block rule, 'Block-Social', drop</span></pre>
<p>The first flow was stopped by <b>Security Intelligence</b> before any access control rule was evaluated. The second shows a rule that needs an application: Snort waits ("pending AppID") until it identifies the application, then the Block rule matches. This waiting is why the first few packets of an application-based block can pass: Snort needs payload to identify the app.</p>

<h3>system support trace: the combined view</h3>
<pre class="code">&gt; system support trace

Enable firewall-engine-debug too? [n]: y
Please specify an IP protocol: tcp
Please specify a client IP address: 198.51.100.10
Please specify a client port:
Please specify a server IP address: 10.0.2.10
Please specify a server port: 443
Monitoring packet tracer and firewall debug messages</pre>
<pre class="out">198.51.100.10-40112 - 10.0.2.10-443 6 Packet: TCP, SYN, seq 1820412377
198.51.100.10-40112 - 10.0.2.10-443 6 Session: new snort session
198.51.100.10-40112 - 10.0.2.10-443 6 AppID: service unknown (0), application unknown (0)
198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: allow rule, 'Portal-In', allow
<span class="hl">198.51.100.10-40112 - 10.0.2.10-443 6 Snort id 0, NAP id 2, IPS id 0, Verdict PASS</span>
...
198.51.100.10-40112 - 10.0.2.10-443 6 AppID: service HTTPS (1122), application unknown (0)</pre>
<p>Each packet shows the Snort session, the AppID progress, the firewall decision, and the final <b>Verdict</b> (PASS, BLOCK, BLOCKLIST, FAST-FORWARD). When a later packet in the flow is blocked by the intrusion policy, this is where you see the verdict change, and then you go to the intrusion event for the signature details.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Which tool sees what">
<rect x="10" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">simulated packet</text>
<rect x="225" y="30" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">firewall-engine-debug</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">Snort rule decisions</text>
<rect x="440" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">system support trace</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">per packet + verdict</text>
<rect x="10" y="120" width="620" height="50" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Live traffic only for the two debugs; packet-tracer needs no traffic</text>
</svg><p class="cap">packet-tracer needs no real traffic. The two Snort debugs only print when real matching traffic flows.</p></div>

<div class="eg"><p><b>Worked example.</b> A partner reports that the portal loads but the login page fails. packet-tracer shows allow. You run <code>system support trace</code> filtered on the partner and 10.0.2.10 port 443. The first packets show Verdict PASS; after the login POST, a packet shows Verdict BLOCK. You open Unified Events for the same flow and find an intrusion event with Reason Intrusion Block. Now you know the layer (Snort, intrusion policy) and can investigate whether it is a true attack or a false positive.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running the debug without filters on a production device. Expecting output when no traffic is flowing (debugs only show live traffic; ask the user to reproduce). Forgetting to stop the debug with Ctrl+C. Using the public 203.0.113.3 as the server address: Snort sees the real address 10.0.2.10 after UN-NAT.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>system support firewall-engine-debug</code> shows the access control and Security Intelligence decisions made in Snort. <code>system support trace</code> adds packet-level detail and the verdict. Both require live traffic and both are run from the FTD CLI, not from the Management Center.</p></div>

<div class="scn"><h4>The block that waited for the application</h4><p>A school blocked a gaming application with an application-based Block rule, but students' first connections still succeeded briefly. The engineer ran firewall-engine-debug and saw "pending rule-matching, 'Block-Games', pending AppID" for the first packets, then "block rule, 'Block-Games', drop" once Snort identified the app. That was expected behaviour. For a destination known in advance, a URL category or network-based rule placed above it blocked on the first packet instead.</p><p><b>Lesson:</b> application rules need a few packets to decide; firewall-engine-debug shows exactly when.</p></div>

<div class="iv"><p class="q">"packet-tracer says allow, yet users are blocked. What do you run next?"</p><p>A capture with trace on real traffic, and <code>system support trace</code> with firewall-engine-debug enabled, filtered on the client and the real server address. Look for an SI blocklist line, a pending AppID that ends in a block rule, or a Verdict BLOCK from intrusion or file inspection. Then confirm the Reason and details in Unified Events.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>system support firewall-engine-debug</code> prints Snort's SI and access control decisions for live flows.</li>
<li><code>system support trace</code> adds per-packet AppID progress and the final verdict.</li>
<li>Always filter by protocol, client and server (real address); stop with Ctrl+C.</li>
<li>"pending AppID" explains why application rules let the first packets through.</li>
<li>Use the debugs when LINA permits but the connection still fails.</li>
</ul></div>
`,hi:`
<p>Kabhi kabhi LINA "permit" kehta hai aur connection phir bhi mar jaata hai. Tab decision Snort ke andar hua tha, aur aapko Snort ko sochte hue sunna padega. Do commands live traffic par yeh karte hain: <code>system support firewall-engine-debug</code> Snort ke access control decisions print karta hai, aur <code>system support trace</code> wahi plus har matching packet ka packet-level trace print karta hai. Inhe airport ke security scanner ke paas rakha microphone samjho: aap officer ko kehte sunte ho "yeh bag rule 3 se match karta hai, allowed" ya "yeh naam list mein hai, roko".</p>

<h3>system support firewall-engine-debug</h3>
<p>Command filter banane ke liye interactive sawaal poochta hai. Hamesha jawab do; busy firewall par bina filter ka debug noisy hota hai aur CPU khata hai.</p>
<pre class="code">&gt; system support firewall-engine-debug

Please specify an IP protocol: tcp
Please specify a client IP address: 198.51.100.10
Please specify a client port:
Please specify a server IP address: 10.0.2.10
Please specify a server port: 443
Monitoring firewall engine debug messages</pre>
<p>Ab problem reproduce karo. Fixed lab ke liye typical output:</p>
<pre class="out">198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: starting rule matching, zone 1 -&gt; 3, geo 0 -&gt; 0, vlan 0, src sgt: 0, src sgt type: unknown, dst sgt: 0, dst sgt type: unknown, svc 0, payload 0, client 0, misc 0, user 9999997, icmpType 0, icmpCode 0
<span class="hl">198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: allow rule, 'Portal-In', allow</span>
198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Policies: Network 0, Inspection 0, Detection 3
^C
Caught interrupt signal
Exiting.</pre>
<p>Ise aise padho: flow client-port &gt; server-port aur protocol 6 (TCP) se pehchaana jaata hai. <b>Zone 1 -&gt; 3</b> ingress aur egress zone IDs hain. User ID 9999997 ka matlab "koi user identity nahi". svc, payload aur client 0 ka matlab application identification abhi khatam nahi hui. Key line verdict hai: <b>allow rule, 'Portal-In', allow</b>. Rokne ke liye Ctrl+C dabao.</p>

<h3>Snort block kaisa dikhta hai</h3>
<pre class="out">198.51.100.20-51022 &gt; 10.0.2.10-443 6 AS=0 ID=4 GR=1-1 Firewall: starting rule matching, zone 1 -&gt; 3, geo 0 -&gt; 0, vlan 0, ...
<span class="hl">198.51.100.20-51022 &gt; 10.0.2.10-443 6 AS=0 ID=4 GR=1-1 Firewall: SI: blocklisted IP, block</span>

10.0.1.10-53310 &gt; 192.0.2.80-443 6 AS=0 ID=2 GR=1-1 Firewall: pending rule-matching, 'Block-Social', pending AppID
<span class="hl">10.0.1.10-53310 &gt; 192.0.2.80-443 6 AS=0 ID=2 GR=1-1 Firewall: block rule, 'Block-Social', drop</span></pre>
<p>Pehle flow ko <b>Security Intelligence</b> ne kisi bhi access control rule ke evaluate hone se pehle rok diya. Doosra ek aisi rule dikhata hai jise application chahiye: Snort tab tak wait karta hai ("pending AppID") jab tak application pehchaan na le, phir Block rule match hoti hai. Isi wait ki wajah se application-based block ke pehle kuch packets pass ho sakte hain: app pehchaanne ke liye Snort ko payload chahiye.</p>

<h3>system support trace: combined view</h3>
<pre class="code">&gt; system support trace

Enable firewall-engine-debug too? [n]: y
Please specify an IP protocol: tcp
Please specify a client IP address: 198.51.100.10
Please specify a client port:
Please specify a server IP address: 10.0.2.10
Please specify a server port: 443
Monitoring packet tracer and firewall debug messages</pre>
<pre class="out">198.51.100.10-40112 - 10.0.2.10-443 6 Packet: TCP, SYN, seq 1820412377
198.51.100.10-40112 - 10.0.2.10-443 6 Session: new snort session
198.51.100.10-40112 - 10.0.2.10-443 6 AppID: service unknown (0), application unknown (0)
198.51.100.10-40112 &gt; 10.0.2.10-443 6 AS=0 ID=3 GR=1-1 Firewall: allow rule, 'Portal-In', allow
<span class="hl">198.51.100.10-40112 - 10.0.2.10-443 6 Snort id 0, NAP id 2, IPS id 0, Verdict PASS</span>
...
198.51.100.10-40112 - 10.0.2.10-443 6 AppID: service HTTPS (1122), application unknown (0)</pre>
<p>Har packet Snort session, AppID progress, firewall decision aur final <b>Verdict</b> (PASS, BLOCK, BLOCKLIST, FAST-FORWARD) dikhata hai. Jab flow ka koi baad wala packet intrusion policy se block hota hai, to yahin aap verdict badalta dekhte ho, aur phir signature details ke liye intrusion event par jaate ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Kaunsa tool kya dekhta hai">
<rect x="10" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">simulated packet</text>
<rect x="225" y="30" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">firewall-engine-debug</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">Snort rule decisions</text>
<rect x="440" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">system support trace</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">har packet + verdict</text>
<rect x="10" y="120" width="620" height="50" rx="8" fill="#fde68a"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Dono debugs sirf live traffic par; packet-tracer ko traffic nahi chahiye</text>
</svg><p class="cap">packet-tracer ko real traffic nahi chahiye. Dono Snort debugs tabhi print karte hain jab real matching traffic chalta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Partner report karta hai ki portal load hota hai par login page fail hota hai. packet-tracer allow dikhata hai. Aap partner aur 10.0.2.10 port 443 par filter karke <code>system support trace</code> chalate ho. Pehle packets Verdict PASS dikhate hain; login POST ke baad ek packet Verdict BLOCK dikhata hai. Aap same flow ke liye Unified Events kholte ho aur Reason Intrusion Block wala intrusion event milta hai. Ab aapko layer pata hai (Snort, intrusion policy) aur aap investigate kar sakte ho ki yeh sach mein attack hai ya false positive.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Production device par bina filter ke debug chalana. Jab traffic chal hi nahi raha tab output ki ummeed karna (debugs sirf live traffic dikhate hain; user se reproduce karwao). Ctrl+C se debug band karna bhoolna. Server address ke roop mein public 203.0.113.3 use karna: UN-NAT ke baad Snort real address 10.0.2.10 dekhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>system support firewall-engine-debug</code> Snort mein liye gaye access control aur Security Intelligence decisions dikhata hai. <code>system support trace</code> packet-level detail aur verdict jodta hai. Dono ko live traffic chahiye aur dono FTD CLI se chalte hain, Management Center se nahi.</p></div>

<div class="scn"><h4>Woh block jo application ka intezaar karta tha</h4><p>Ek school ne application-based Block rule se ek gaming application block ki, par students ke pehle connections thodi der ke liye ab bhi succeed ho rahe the. Engineer ne firewall-engine-debug chalaya aur pehle packets ke liye "pending rule-matching, 'Block-Games', pending AppID" dekha, phir Snort ke app pehchaanne par "block rule, 'Block-Games', drop". Yeh expected behaviour tha. Pehle se pata destination ke liye, uske upar rakhi URL category ya network-based rule ne pehle packet par hi block kiya.</p><p><b>Seekh:</b> application rules ko decide karne ke liye kuch packets chahiye; firewall-engine-debug exactly dikhata hai kab.</p></div>

<div class="iv"><p class="q">"packet-tracer allow kehta hai, phir bhi users block hain. Aap aage kya chalaoge?"</p><p>Real traffic par trace ke saath capture, aur client aur real server address par filter karke firewall-engine-debug enabled ke saath <code>system support trace</code>. SI blocklist line, block rule par khatam hone wala pending AppID, ya intrusion ya file inspection se Verdict BLOCK dhoondo. Phir Unified Events mein Reason aur details confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>system support firewall-engine-debug</code> live flows ke liye Snort ke SI aur access control decisions print karta hai.</li>
<li><code>system support trace</code> har packet ka AppID progress aur final verdict jodta hai.</li>
<li>Hamesha protocol, client aur server (real address) se filter karo; Ctrl+C se roko.</li>
<li>"pending AppID" samjhata hai ki application rules pehle packets kyun jaane deti hain.</li>
<li>Jab LINA permit kare par connection phir bhi fail ho, tab debugs use karo.</li>
</ul></div>
`}};export{e as default};