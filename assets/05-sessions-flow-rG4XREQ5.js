var e={id:`sessions-flow`,h:{en:`Rung 6: the session table, pinned sessions and debug flow`,hi:`Rung 6: session table, pinned sessions aur debug flow`},body:{en:`
<p>The earlier rungs show configuration and current decisions. The <b>session table</b> shows what actually happened to a real connection. This is where you discover that a flow is still pinned to the old link after the rule changed its mind, or that the rule you were debugging never touched the session at all.</p>
<h3>What a session records about SD-WAN</h3>
<p>FortiOS keeps one entry per connection. When a session is steered by an SD-WAN rule, the entry records <b>which member</b> and <b>which rule</b>:</p>
<ul><li><code>sdwan_mbr_seq</code>: the sequence number of the member that carries the session (the same IDs as in <code>diagnose sys sdwan member</code>).</li><li><code>sdwan_service_id</code>: the ID of the SD-WAN rule (service) that steered it.</li><li><code>dev=</code> and <code>gwy=</code>: the incoming and outgoing interface indexes and the next-hop gateway.</li><li><code>policy_id</code>: the firewall policy that permitted it.</li><li>The <code>hook=</code> lines: the NAT applied (source NAT shows the translated address).</li></ul>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM stays on the congested link"</span>
BR1-FGT # diagnose sys session filter clear
BR1-FGT # diagnose sys session filter src 10.1.1.20
BR1-FGT # diagnose sys session filter dst 203.0.113.130
BR1-FGT # diagnose sys session filter dport 443
BR1-FGT # diagnose sys session list</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
session info: proto=6 proto_state=01 duration=312 expire=3288 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty log
statistic(bytes/packets/allow_err): org=1873/14/1 reply=21904/22/1 tuples=2
orgin->sink: org pre->post, reply pre->post dev=9->5/5->9 gwy=203.0.113.1/10.1.1.20
hook=post dir=org act=snat 10.1.1.20:51514->203.0.113.130:443(203.0.113.2:51514)
hook=pre dir=reply act=dnat 203.0.113.130:443->203.0.113.2:51514(10.1.1.20:51514)
misc=0 policy_id=10 pol_uuid_idx=14 auth_info=0 chk_client_info=0 vd=0
<span class="hl">sdwan_mbr_seq=1 sdwan_service_id=2</span></pre>
<p>This session was steered by rule 2 over member 1 (port1), source-NATed to 203.0.113.2, and permitted by policy 10. If you expected member 2 and see 1, the rule decision at the <b>start</b> of the session was different from today's, or the session was matched by another rule than you think. Always compare <code>sdwan_service_id</code> with the service ID you were reading in chapter 3.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="20" width="150" height="60" rx="10" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">New TCP session</text><text x="85" y="63" text-anchor="middle" class="svg-muted" font-size="11">10:00 rule picks port1</text><rect x="240" y="20" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Session entry</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="11">sdwan_mbr_seq=1, NAT 203.0.113.2</text><rect x="480" y="20" width="150" height="60" rx="10" fill="#fde68a"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">10:05 SLA fails</text><text x="555" y="63" text-anchor="middle" class="svg-muted" font-size="11">rule now prefers port2</text><line x1="160" y1="50" x2="240" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><rect x="110" y="120" width="420" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">New sessions use port2 from now on.</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">The old session keeps its entry until it is re-evaluated, reset or ends.</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">Its public source address is the port1 address.</text></svg><p class="cap">A rule decides when a session starts. A change of mind is not automatically applied to sessions that already exist.</p></div>
<h3>Why existing sessions stay on the old member</h3>
<p>A TCP connection to a server is tied to the public address it started with. If the FortiGate silently moved it to ISP2, the server would see packets from a new address and drop them. So SD-WAN steers <b>new</b> sessions by the current decision, and an existing session normally keeps its member until it ends. Details differ by FortiOS build, hardware offload and rule type, so verify the behaviour in your version when it matters. Practical consequences:</p>
<ul><li>After you change a rule or the SLA, test with a <b>new</b> connection (new source port), not a long-lived one.</li><li>If a member goes down (interface down or health check dead and removed from the candidates), sessions that depended on it fail and the application reconnects over the new member. That reconnect is the failover users experience.</li><li>For a test, clear only the sessions that match a narrow filter. <code>diagnose sys session clear</code> clears <b>every</b> session that matches the active filter, so set the filter first and list before you clear.</li></ul>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM stays on the congested link"</span>
BR1-FGT # diagnose sys session filter clear
BR1-FGT # diagnose sys session filter src 10.1.1.20
BR1-FGT # diagnose sys session filter dport 443
BR1-FGT # diagnose sys session list
BR1-FGT # diagnose sys session clear</pre>
<h3>Debug flow: the packet's own story</h3>
<p><b>Debug flow</b> prints the decisions the kernel makes for each packet: policy route (SD-WAN rule), route lookup, policy check, NAT. It is the best single tool for rungs 3 to 6. Set a narrow filter first, otherwise the output floods and the CPU suffers.</p>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM stays on the congested link"</span>
BR1-FGT # diagnose debug reset
BR1-FGT # diagnose debug flow filter clear
BR1-FGT # diagnose debug flow filter addr 10.1.1.20
BR1-FGT # diagnose debug flow filter dport 443
BR1-FGT # diagnose debug flow show function-name enable
BR1-FGT # diagnose debug flow trace start 20
BR1-FGT # diagnose debug enable
<span class="c">! generate the traffic, read the output, then stop</span>
BR1-FGT # diagnose debug disable
BR1-FGT # diagnose debug reset</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
id=20085 trace_id=9 func=print_pkt_detail line=5870 msg="vd-root:0 received a packet(proto=6, 10.1.1.20:51514->203.0.113.130:443) tun_id=0.0.0.0 from port5. flag [S], seq 1031, ack 0, win 64240"
id=20085 trace_id=9 func=init_ip_session_common line=6040 msg="allocate a new session-0001a2b4"
id=20085 trace_id=9 func=__vf_ip_route_input_rcu line=1987 msg="<span class="hl">Match policy routing id=2130771970</span>: to 203.0.113.130 via ifindex-3"
id=20085 trace_id=9 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-203.0.113.1 via port1"
id=20085 trace_id=9 func=fw_forward_handler line=811 msg="Allowed by Policy-10: SNAT"
id=20085 trace_id=9 func=ip_session_confirm_final line=3000 msg="SNAT 10.1.1.20->203.0.113.2:51514"</pre>
<p>Read it as a story: the packet arrives on port5, a new session is created, a policy route (the SD-WAN rule) matches and sends it toward ifindex 3, the route lookup confirms port1, policy 10 allows it with source NAT. The same <code>id=</code> (the policy route ID) ties back to the proute list in chapter 3. Two other messages you will meet: <code>Denied by forward policy check (policy 0)</code> (no policy, chapter 4) and <code>reverse path check fail, drop its first packet!</code> (the return path is not where the FortiGate expects, chapter 8).</p>
<h3>The sniffer: proof outside the kernel</h3>
<p>When flow and session disagree with reality, confirm on the wire with the packet sniffer. It shows what actually left which interface.</p>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM stays on the congested link"</span>
BR1-FGT # diagnose sniffer packet any 'host 203.0.113.130 and port 443' 4 20 l</pre>
<p>Verbosity <code>4</code> shows the interface name for each packet, so you see whether it left <code>port1</code> or <code>port2</code>, and with which source address. Packets leaving the wrong interface with the wrong address point back at rung 3 or 6; no packets at all point at rung 4 or 5.</p>
<div class="warn"><p><b>Common mistake.</b> Testing a fix with a long-lived session such as an open SSH or a streaming video, then concluding the fix failed because the session stayed on the old member. Start a new connection, or clear that one session with a precise filter.</p></div>
<div class="exam"><p><b>Exam trap.</b> The fields to know are <code>sdwan_mbr_seq</code> (member) and <code>sdwan_service_id</code> (rule). The member sequence is the <b>member ID</b>, not the interface index or the policy ID.</p></div>
<div class="scn"><h4>The video call that would not move</h4><p>A branch ran a long video conference over ISP1 while ISP1 lost 6 percent of packets. The SLA marked ISP1 bad and the rule moved to ISP2, yet the call stayed bad. The session list showed <code>sdwan_mbr_seq=1</code> for the call. The conference app only reconnected when the user hung up and rejoined, and then it used member 2. The team documented that failover helps new calls first, and tuned the application to reconnect faster.</p><p><b>Lesson:</b> Sessions keep their member; failover is for new sessions and for reconnects.</p></div>
<div class="iv"><p class="q">"You changed an SD-WAN rule and nothing changed for the user. Why, and what do you do?"</p><p>The user's session may still be pinned to the old member. I list the session with a narrow filter and read <code>sdwan_mbr_seq</code> and <code>sdwan_service_id</code>, then test with a new connection or clear that one session. I confirm the result with debug flow and the sniffer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>sdwan_mbr_seq and sdwan_service_id in the session show the member and rule used.</li><li>New sessions follow the current decision; existing sessions normally keep their member.</li><li>Use narrow filters for session list and clear, and for debug flow.</li><li>Debug flow shows policy route, route, policy and NAT for one packet.</li><li>The sniffer proves which interface and source address were really used.</li></ul></div>
`,hi:`
<p>Pichhle rungs configuration aur current decisions dikhate hain. <b>Session table</b> dikhata hai ki ek real connection ke saath actually kya hua. Yahin pata chalta hai ki rule ke mind badalne ke baad bhi flow purani link par pinned hai, ya jis rule ko aap debug kar rahe the usne session ko kabhi chhua hi nahi.</p>
<h3>Session SD-WAN ke baare mein kya record karta hai</h3>
<p>FortiOS har connection ke liye ek entry rakhta hai. Jab session SD-WAN rule se steer hota hai, entry mein <b>kaun sa member</b> aur <b>kaun sa rule</b> record hota hai:</p>
<ul><li><code>sdwan_mbr_seq</code>: us member ka sequence number jo session ko carry karta hai (wahi IDs jo <code>diagnose sys sdwan member</code> mein hain).</li><li><code>sdwan_service_id</code>: us SD-WAN rule (service) ka ID jisne steer kiya.</li><li><code>dev=</code> aur <code>gwy=</code>: incoming aur outgoing interface indexes aur next-hop gateway.</li><li><code>policy_id</code>: jis firewall policy ne permit kiya.</li><li><code>hook=</code> lines: lagaya gaya NAT (source NAT translated address dikhata hai).</li></ul>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM congested link par hi rehta hai"</span>
BR1-FGT # diagnose sys session filter clear
BR1-FGT # diagnose sys session filter src 10.1.1.20
BR1-FGT # diagnose sys session filter dst 203.0.113.130
BR1-FGT # diagnose sys session filter dport 443
BR1-FGT # diagnose sys session list</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
session info: proto=6 proto_state=01 duration=312 expire=3288 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty log
statistic(bytes/packets/allow_err): org=1873/14/1 reply=21904/22/1 tuples=2
orgin->sink: org pre->post, reply pre->post dev=9->5/5->9 gwy=203.0.113.1/10.1.1.20
hook=post dir=org act=snat 10.1.1.20:51514->203.0.113.130:443(203.0.113.2:51514)
hook=pre dir=reply act=dnat 203.0.113.130:443->203.0.113.2:51514(10.1.1.20:51514)
misc=0 policy_id=10 pol_uuid_idx=14 auth_info=0 chk_client_info=0 vd=0
<span class="hl">sdwan_mbr_seq=1 sdwan_service_id=2</span></pre>
<p>Is session ko rule 2 ne member 1 (port1) par steer kiya, 203.0.113.2 par source-NAT hua, aur policy 10 ne permit kiya. Agar aap member 2 expect kar rahe the aur 1 dikhta hai, to session ke <b>shuru</b> mein rule decision aaj se alag tha, ya session ko aapki soch se kisi aur rule ne match kiya. Hamesha <code>sdwan_service_id</code> ko chapter 3 mein padhe service ID se compare karo.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="20" width="150" height="60" rx="10" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Naya TCP session</text><text x="85" y="63" text-anchor="middle" class="svg-muted" font-size="11">10:00 rule port1 chunta hai</text><rect x="240" y="20" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Session entry</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="11">sdwan_mbr_seq=1, NAT 203.0.113.2</text><rect x="480" y="20" width="150" height="60" rx="10" fill="#fde68a"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">10:05 SLA fail</text><text x="555" y="63" text-anchor="middle" class="svg-muted" font-size="11">rule ab port2 prefer karta hai</text><line x1="160" y1="50" x2="240" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><rect x="110" y="120" width="420" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Ab se naye sessions port2 use karte hain.</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Purana session apni entry tab tak rakhta hai jab tak re-evaluate, reset ya end na ho.</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">Uska public source address port1 ka address hai.</text></svg><p class="cap">Rule session ke shuru par decide karta hai. Mind badalna existing sessions par apne aap lagu nahi hota.</p></div>
<h3>Existing sessions purane member par kyun rehte hain</h3>
<p>Server se TCP connection us public address se bandhi hoti hai jisse woh shuru hui. Agar FortiGate chupke se use ISP2 par le jaaye to server naye address se packets dekhega aur drop kar dega. Isliye SD-WAN <b>naye</b> sessions ko current decision se steer karta hai, aur existing session aam taur par apna member tab tak rakhta hai jab tak woh end na ho. Details FortiOS build, hardware offload aur rule type ke hisaab se alag hote hain, isliye jab zaroori ho apne version mein behaviour verify karo. Practical nateeje:</p>
<ul><li>Rule ya SLA badalne ke baad <b>naye</b> connection (naya source port) se test karo, long-lived se nahi.</li><li>Agar member down ho jaye (interface down ya health check dead aur candidates se hata), to usper depend sessions fail hote hain aur application naye member par reconnect karti hai. Wahi reconnect users ka failover experience hai.</li><li>Test ke liye sirf narrow filter se match hone wale sessions clear karo. <code>diagnose sys session clear</code> active filter se match hone wale <b>har</b> session ko clear karta hai, isliye pehle filter lagao aur clear se pehle list karo.</li></ul>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM congested link par hi rehta hai"</span>
BR1-FGT # diagnose sys session filter clear
BR1-FGT # diagnose sys session filter src 10.1.1.20
BR1-FGT # diagnose sys session filter dport 443
BR1-FGT # diagnose sys session list
BR1-FGT # diagnose sys session clear</pre>
<h3>Debug flow: packet ki apni kahani</h3>
<p><b>Debug flow</b> har packet ke liye kernel ke decisions print karta hai: policy route (SD-WAN rule), route lookup, policy check, NAT. Rung 3 se 6 ke liye yeh sabse achha single tool hai. Pehle narrow filter lagao, warna output flood hota hai aur CPU suffer karta hai.</p>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM congested link par hi rehta hai"</span>
BR1-FGT # diagnose debug reset
BR1-FGT # diagnose debug flow filter clear
BR1-FGT # diagnose debug flow filter addr 10.1.1.20
BR1-FGT # diagnose debug flow filter dport 443
BR1-FGT # diagnose debug flow show function-name enable
BR1-FGT # diagnose debug flow trace start 20
BR1-FGT # diagnose debug enable
<span class="c">! traffic generate karo, output padho, phir stop karo</span>
BR1-FGT # diagnose debug disable
BR1-FGT # diagnose debug reset</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
id=20085 trace_id=9 func=print_pkt_detail line=5870 msg="vd-root:0 received a packet(proto=6, 10.1.1.20:51514->203.0.113.130:443) tun_id=0.0.0.0 from port5. flag [S], seq 1031, ack 0, win 64240"
id=20085 trace_id=9 func=init_ip_session_common line=6040 msg="allocate a new session-0001a2b4"
id=20085 trace_id=9 func=__vf_ip_route_input_rcu line=1987 msg="<span class="hl">Match policy routing id=2130771970</span>: to 203.0.113.130 via ifindex-3"
id=20085 trace_id=9 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-203.0.113.1 via port1"
id=20085 trace_id=9 func=fw_forward_handler line=811 msg="Allowed by Policy-10: SNAT"
id=20085 trace_id=9 func=ip_session_confirm_final line=3000 msg="SNAT 10.1.1.20->203.0.113.2:51514"</pre>
<p>Ise kahani ki tarah padho: packet port5 par aata hai, naya session banta hai, policy route (SD-WAN rule) match hota hai aur ise ifindex 3 ki taraf bhejta hai, route lookup port1 confirm karta hai, policy 10 source NAT ke saath allow karti hai. Wahi <code>id=</code> (policy route ID) chapter 3 ki proute list se judta hai. Do aur messages jo milenge: <code>Denied by forward policy check (policy 0)</code> (policy nahi, chapter 4) aur <code>reverse path check fail, drop its first packet!</code> (return path woh nahi jo FortiGate expect karta hai, chapter 8).</p>
<h3>Sniffer: kernel ke bahar ka proof</h3>
<p>Jab flow aur session reality se match na karein, packet sniffer se wire par confirm karo. Woh dikhata hai ki actually kaun si interface se kya nikla.</p>
<pre class="code"><span class="c">! Try it: lab "NOC ticket: CRM congested link par hi rehta hai"</span>
BR1-FGT # diagnose sniffer packet any 'host 203.0.113.130 and port 443' 4 20 l</pre>
<p>Verbosity <code>4</code> har packet ke saath interface naam dikhati hai, isliye aap dekhte ho ki woh <code>port1</code> se nikla ya <code>port2</code> se, aur kis source address ke saath. Galat interface se galat address par nikalte packets rung 3 ya 6 ki taraf ishara karte hain; koi packet nahi to rung 4 ya 5.</p>
<div class="warn"><p><b>Common galti.</b> Fix ko long-lived session (jaise open SSH ya streaming video) se test karna, aur fir yeh nateeja nikaalna ki fix fail ho gayi kyunki session purane member par raha. Naya connection shuru karo, ya ek precise filter se wahi session clear karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo fields aane chahiye: <code>sdwan_mbr_seq</code> (member) aur <code>sdwan_service_id</code> (rule). Member sequence <b>member ID</b> hai, interface index ya policy ID nahi.</p></div>
<div class="scn"><h4>Video call jo move nahi hui</h4><p>Ek branch ne ISP1 par lamba video conference chalaya jabki ISP1 6 percent packets kho raha tha. SLA ne ISP1 ko bad mark kiya aur rule ISP2 par chala gaya, phir bhi call kharab rahi. Session list mein call ke liye <code>sdwan_mbr_seq=1</code> tha. Conference app tabhi reconnect hui jab user ne hang up karke dobara join kiya, aur tab usne member 2 use kiya. Team ne document kiya ki failover pehle naye calls ki madad karta hai, aur application ko jaldi reconnect karne ke liye tune kiya.</p><p><b>Seekh:</b> Sessions apna member rakhte hain; failover naye sessions aur reconnects ke liye hai.</p></div>
<div class="iv"><p class="q">"Aapne SD-WAN rule badla aur user ke liye kuch nahi badla. Kyun, aur aap kya karte ho?"</p><p>User ka session abhi bhi purane member par pinned ho sakta hai. Main narrow filter se session list karta hoon aur <code>sdwan_mbr_seq</code> aur <code>sdwan_service_id</code> padhta hoon, phir naye connection se test karta hoon ya wahi ek session clear karta hoon. Result debug flow aur sniffer se confirm karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Session mein sdwan_mbr_seq aur sdwan_service_id use hue member aur rule dikhate hain.</li><li>Naye sessions current decision follow karte hain; existing sessions aam taur par apna member rakhte hain.</li><li>Session list, clear aur debug flow ke liye narrow filters use karo.</li><li>Debug flow ek packet ka policy route, route, policy aur NAT dikhata hai.</li><li>Sniffer proof deta hai ki kaun si interface aur source address sach mein use hua.</li></ul></div>
`}};export{e as default};