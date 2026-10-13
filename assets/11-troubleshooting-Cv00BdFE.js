var e={id:`troubleshooting`,h:{en:`Troubleshooting AAA, ACLs and CoPP`,hi:`AAA, ACLs aur CoPP ki troubleshooting`},body:{en:`
<p>A good mechanic does not replace parts at random. He asks what the driver noticed, checks the simplest things first, measures, and changes one thing at a time. Device security problems deserve the same method, because the symptoms are misleading: "the password is wrong" is often a routing problem, and "OSPF is flapping" can be a security policy. This chapter gives you a workflow and walks through the three labs.</p>

<h3>The workflow</h3>
<ol>
<li><b>Pin down the symptom.</b> Who cannot do what, from where, since when? One user or everyone? Only personal accounts, or also local ones?</li>
<li><b>Check reachability and path.</b> Can R1 reach the server (<code>ping 10.10.10.100 source GigabitEthernet0/1</code>)? Is the right VRF and source interface used?</li>
<li><b>Test AAA directly.</b> <code>test aaa group ...</code> takes the user and SSH out of the equation.</li>
<li><b>Read the counters.</b> <code>show aaa servers</code> (accepts, rejects, timeouts, UP/DEAD), <code>show ip access-lists</code> (matches), <code>show policy-map control-plane</code> (conformed, exceeded).</li>
<li><b>Debug narrowly.</b> <code>debug aaa authentication</code>, <code>debug tacacs</code>, <code>debug radius</code>, only for a short test, with <code>terminal monitor</code> on your session.</li>
<li><b>Ask the server side.</b> The AAA server's live log says whether a request arrived, from which address, and why it failed.</li>
<li><b>Fix one thing, verify end to end.</b> Log in for real, check the privilege level, check accounting.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reading AAA symptoms">
<rect x="10" y="20" width="195" height="60" rx="8" fill="#bbf7d0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="13">Reject counter grows</text><text x="107" y="64" text-anchor="middle" class="svg-muted" font-size="12">server answered: user/password/policy</text>
<rect x="222" y="20" width="195" height="60" rx="8" fill="#fde68a"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="13">Timeouts grow</text><text x="319" y="64" text-anchor="middle" class="svg-muted" font-size="12">path, key, source IP, port</text>
<rect x="434" y="20" width="195" height="60" rx="8" fill="#fed7aa"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="13">Accept, but level 1</text><text x="531" y="64" text-anchor="middle" class="svg-muted" font-size="12">exec authorization</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">Counters in show aaa servers tell you which half to debug:</text>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">the server's policy, or the conversation with the server.</text>
</svg><p class="cap">Rejects point at the server policy; timeouts point at the path between router and server.</p></div>

<h3>Walkthrough 1: Central logins with TACACS+ and a local fallback</h3>
<p>Typical failures while building this lab, and how each shows up:</p>
<ul>
<li><b>Wrong key on ISE1</b> (for example a typo in <code>NK-t4c-26</code>). The TACACS+ server cannot decrypt the body and closes the connection. <code>test aaa group tacacs+ netadmin Adm!n-26 legacy</code> fails, <code>show tacacs</code> shows socket errors, and logins silently fall back to local because it is an ERROR.</li>
<li><b>netadmin lands at level 1.</b> Authentication works but <code>aaa authorization exec default group tacacs+ local</code> is missing.</li>
<li><b>No accounting records on ISE.</b> <code>aaa accounting exec default start-stop group tacacs+</code> missing, or you tested with <code>test aaa</code> only. Accounting needs a real SSH login and logout.</li>
<li><b>"backup cannot log in"</b> while ISE is up. That is correct behaviour: ISE answers FAIL. Stop the service (<code>aaa-server stop</code>) and it works through local.</li>
</ul>
<pre class="out">R1# show aaa servers | include host|State|Response
TACACS+: id 1, priority 1, host 10.10.10.100, auth-port 49, hostname ISE1
     State: current UP, duration 842s, previous duration 0s
<span class="hl">             Response: accept 3, reject 1, challenge 0</span></pre>
<p>One reject is the backup test from task 6, exactly as expected.</p>

<h3>Walkthrough 2: Everybody is using the emergency account</h3>
<p>Symptom: since the move to RADIUS, personal logins fail and only local <code>backup</code> works. That already tells you the RADIUS group returns <b>ERROR</b>, not FAIL, otherwise backup would be rejected too. Test and read the counters:</p>
<pre class="out">R1# test aaa group radius netadmin Adm!n-26 legacy
Attempting authentication test to server-group radius using radius
<span class="hl">No authoritative response from any server.</span>

R1# show aaa servers
RADIUS: id 1, priority 1, host 10.10.10.100, auth-port 1812, acct-port 1813, hostname RAD1
<span class="hl">     State: current DEAD, duration 38s, previous duration 0s</span>
     Dead: total time 38s, count 1
<span class="hl">     Authen: request 2, timeouts 6, failover 0, retransmission 4</span>
             Response: accept 0, reject 0, challenge 0</pre>
<p>Timeouts, zero responses: the answer to lab task 1 is <b>timeout</b>. Now look at what R1 sends:</p>
<pre class="code">R1# show running-config | include radius|key
ip radius source-interface Loopback0        <span class="c">! fault 1: sends from 10.255.255.1</span>
radius server RAD1
 key NK-rad-62                              <span class="c">! fault 2: server expects NK-rad-26</span></pre>
<p>The server only has a client entry for 10.10.10.1, so requests from 10.255.255.1 are discarded; its log (<code>aaa-server show log</code> on ISE) shows the unknown client. Fix the source with <code>ip radius source-interface GigabitEthernet0/1</code>. The requests now arrive from a known client, but the shared secret is wrong, so the server still cannot validate them and drops them: still a timeout on R1, with a shared-secret error on the server. Fix the key under <code>radius server RAD1</code> with <code>key NK-rad-26</code>:</p>
<pre class="out">R1# test aaa group radius netadmin Adm!n-26 legacy
Attempting authentication test to server-group radius using radius
<span class="hl">User was successfully authenticated.</span></pre>
<p>Finally prove it end to end: SSH from PC-ADMIN as netadmin, <code>show privilege</code> shows 15, applied by <code>aaa authorization exec default group radius local</code> from the Access-Accept.</p>

<div class="note"><p>Depending on the server, a wrong RADIUS key shows up either as a silent drop (timeout on the router) or as an Access-Reject, because the password decrypts to garbage. Either way the server log names the real cause. Always check both ends.</p></div>

<h3>Walkthrough 3: Protect the router CPU with CoPP</h3>
<ul>
<li><b>OSPF to R2 drops after attaching COPP.</b> Check that OSPF is counted under CP-ROUTING, not class-default. A typo in ACL-ROUTING (for example <code>permit tcp any any eq 89</code> instead of <code>permit ospf any any</code>) sends hellos into class-default.</li>
<li><b>MGMT cannot SSH.</b> Check ACL-MGMT: source 10.99.0.0 0.0.0.255, destination any, <code>eq 22</code>. Swapping source and destination is the classic slip. Also check the VTY access-class.</li>
<li><b>Telnet from PC-USER still works.</b> Check the class order: CP-UNDESIRED must be before any class that also matches TCP, and its action must be <code>drop</code>.</li>
<li><b>Flood test shows no exceeded packets.</b> Policy not attached: <code>show running-config | section control-plane</code> should show <code>service-policy input COPP</code>.</li>
</ul>
<pre class="out">R1# show policy-map control-plane | include Class-map|packets,|exceeded
    Class-map: CP-UNDESIRED (match-all)
      4 packets, 240 bytes
    Class-map: CP-ROUTING (match-all)
<span class="hl">      212 packets, 18020 bytes</span>
    Class-map: CP-MGMT (match-all)
      96 packets, 9540 bytes
    Class-map: CP-ICMP (match-all)
      3124 packets, 799744 bytes
<span class="hl">        exceeded 2712 packets, 694272 bytes; actions:</span>
    Class-map: class-default (match-any)
      18 packets, 1512 bytes</pre>

<div class="eg"><p><b>Worked example.</b> Reading timeouts. <code>show aaa servers</code> shows request 2, timeouts 6, retransmission 4. Each request was sent once and retransmitted twice (the default of 3 tries per request for RADIUS), and every try timed out: 2 x 3 = 6. If the router had received even one Access-Reject, the reject counter would be 1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>debug radius</code> or <code>debug aaa</code> running on a busy device. Debug output goes to the CPU; turn it off with <code>undebug all</code> as soon as the test is done.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Only the local account works" means the servers are not answering (ERROR). "Nobody can log in, including local" points elsewhere: VTY access-class, transport input, SSH keys, or a list ending in the wrong method.</p></div>

<div class="scn"><h4>The loopback that moved</h4><p>After a routine change that added Loopback0 for router management, TACACS+ logins failed on 60 routers, and everyone used the break-glass account. <code>show aaa servers</code> showed timeouts only. A packet capture on the server's switch port showed requests arriving from the new loopback addresses, which were not in the ISE network device list. The team added <code>ip tacacs source-interface</code> pointing at the interface ISE knew, then updated ISE to the loopback addresses, and reverted.</p><p><b>Lesson:</b> AAA servers trust source IP addresses. Any change to source interfaces or routing can turn every login into a fallback.</p></div>

<div class="iv"><p class="q">"Users say TACACS+ logins fail. Walk me through your troubleshooting."</p><p>Scope first (one user or everyone, local works or not), then reachability from the correct source interface and VRF, <code>test aaa group</code>, <code>show aaa servers</code> to split rejects (server policy) from timeouts (path, key, source address, port), a short <code>debug tacacs</code>, and the server's live log. Fix one thing, then verify a real login, privilege level and accounting record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: symptom, reachability, <code>test aaa</code>, counters, short debug, server log, fix and verify.</li>
<li>Rejects mean the server answered; timeouts mean the path, key, port or source address is wrong.</li>
<li>"Only the emergency account works" means the AAA group returns ERROR.</li>
<li>The RADIUS lab has two faults: source-interface Loopback0 and key NK-rad-62 instead of NK-rad-26.</li>
<li>For CoPP, find which class counts the broken traffic in <code>show policy-map control-plane</code>.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts random tareeke se nahi badalta. Woh poochhta hai driver ne kya notice kiya, pehle sabse simple cheezein check karta hai, naapta hai, aur ek samay mein ek cheez badalta hai. Device security problems ko bhi yahi method chahiye, kyunki symptoms gumraah karte hain: "password galat hai" aksar routing problem hota hai, aur "OSPF flap ho raha hai" security policy ho sakti hai. Yeh chapter aapko ek workflow deta hai aur teeno labs mein se guzarta hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Symptom pakka karo.</b> Kaun kya nahi kar pa raha, kahan se, kab se? Ek user ya sab? Sirf personal accounts, ya local bhi?</li>
<li><b>Reachability aur path check karo.</b> Kya R1 server tak pahunch sakta hai (<code>ping 10.10.10.100 source GigabitEthernet0/1</code>)? Kya sahi VRF aur source interface use ho raha hai?</li>
<li><b>AAA seedha test karo.</b> <code>test aaa group ...</code> user aur SSH ko beech se hata deta hai.</li>
<li><b>Counters padho.</b> <code>show aaa servers</code> (accepts, rejects, timeouts, UP/DEAD), <code>show ip access-lists</code> (matches), <code>show policy-map control-plane</code> (conformed, exceeded).</li>
<li><b>Seemit debug karo.</b> <code>debug aaa authentication</code>, <code>debug tacacs</code>, <code>debug radius</code>, sirf chhote test ke liye, apne session par <code>terminal monitor</code> ke saath.</li>
<li><b>Server side se poochho.</b> AAA server ka live log batata hai ki request aayi ya nahi, kis address se, aur kyun fail hui.</li>
<li><b>Ek cheez fix karo, end to end verify karo.</b> Sach mein login karo, privilege level check karo, accounting check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="AAA symptoms padhna">
<rect x="10" y="20" width="195" height="60" rx="8" fill="#bbf7d0"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="13">Reject counter badhta hai</text><text x="107" y="64" text-anchor="middle" class="svg-muted" font-size="12">server ne jawab diya: user/password/policy</text>
<rect x="222" y="20" width="195" height="60" rx="8" fill="#fde68a"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="13">Timeouts badhte hain</text><text x="319" y="64" text-anchor="middle" class="svg-muted" font-size="12">path, key, source IP, port</text>
<rect x="434" y="20" width="195" height="60" rx="8" fill="#fed7aa"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="13">Accept, par level 1</text><text x="531" y="64" text-anchor="middle" class="svg-muted" font-size="12">exec authorization</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="12">show aaa servers ke counters batate hain kaunsa hissa debug karna hai:</text>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">server ki policy, ya server ke saath baatcheet.</text>
</svg><p class="cap">Rejects server policy ki taraf ishaara karte hain; timeouts router aur server ke beech ke path ki taraf.</p></div>

<h3>Walkthrough 1: TACACS+ se central login aur local fallback</h3>
<p>Yeh lab banate waqt aam failures, aur har ek kaise dikhta hai:</p>
<ul>
<li><b>ISE1 par galat key</b> (jaise <code>NK-t4c-26</code> mein typo). TACACS+ server body decrypt nahi kar pata aur connection band kar deta hai. <code>test aaa group tacacs+ netadmin Adm!n-26 legacy</code> fail hota hai, <code>show tacacs</code> socket errors dikhata hai, aur logins chupchaap local par fallback hote hain kyunki yeh ERROR hai.</li>
<li><b>netadmin level 1 par aata hai.</b> Authentication chalta hai lekin <code>aaa authorization exec default group tacacs+ local</code> missing hai.</li>
<li><b>ISE par koi accounting record nahi.</b> <code>aaa accounting exec default start-stop group tacacs+</code> missing hai, ya aapne sirf <code>test aaa</code> se test kiya. Accounting ko asli SSH login aur logout chahiye.</li>
<li><b>"backup login nahi kar pa raha"</b> jab ISE up hai. Yeh sahi behaviour hai: ISE FAIL jawab deta hai. Service band karo (<code>aaa-server stop</code>) aur woh local se chal jaata hai.</li>
</ul>
<pre class="out">R1# show aaa servers | include host|State|Response
TACACS+: id 1, priority 1, host 10.10.10.100, auth-port 49, hostname ISE1
     State: current UP, duration 842s, previous duration 0s
<span class="hl">             Response: accept 3, reject 1, challenge 0</span></pre>
<p>Ek reject task 6 ka backup test hai, bilkul ummeed ke mutabik.</p>

<h3>Walkthrough 2: Sab emergency account se login kar rahe hain</h3>
<p>Symptom: RADIUS par jaane ke baad personal logins fail hote hain aur sirf local <code>backup</code> chalta hai. Yeh pehle hi bata deta hai ki RADIUS group <b>ERROR</b> deta hai, FAIL nahi, warna backup bhi reject hota. Test karo aur counters padho:</p>
<pre class="out">R1# test aaa group radius netadmin Adm!n-26 legacy
Attempting authentication test to server-group radius using radius
<span class="hl">No authoritative response from any server.</span>

R1# show aaa servers
RADIUS: id 1, priority 1, host 10.10.10.100, auth-port 1812, acct-port 1813, hostname RAD1
<span class="hl">     State: current DEAD, duration 38s, previous duration 0s</span>
     Dead: total time 38s, count 1
<span class="hl">     Authen: request 2, timeouts 6, failover 0, retransmission 4</span>
             Response: accept 0, reject 0, challenge 0</pre>
<p>Timeouts, zero responses: lab task 1 ka jawab <b>timeout</b> hai. Ab dekho R1 kya bhejta hai:</p>
<pre class="code">R1# show running-config | include radius|key
ip radius source-interface Loopback0        <span class="c">! galti 1: 10.255.255.1 se bhejta hai</span>
radius server RAD1
 key NK-rad-62                              <span class="c">! galti 2: server NK-rad-26 expect karta hai</span></pre>
<p>Server ke paas sirf 10.10.10.1 ki client entry hai, isliye 10.255.255.1 se aayi requests discard hoti hain; uska log (ISE par <code>aaa-server show log</code>) anjaan client dikhata hai. Source ko <code>ip radius source-interface GigabitEthernet0/1</code> se theek karo. Ab requests jaane maane client se aati hain, lekin shared secret galat hai, isliye server unhe ab bhi validate nahi kar pata aur drop karta hai: R1 par ab bhi timeout, server par shared-secret error. <code>radius server RAD1</code> ke neeche <code>key NK-rad-26</code> se key theek karo:</p>
<pre class="out">R1# test aaa group radius netadmin Adm!n-26 legacy
Attempting authentication test to server-group radius using radius
<span class="hl">User was successfully authenticated.</span></pre>
<p>Aakhir mein end to end sabit karo: PC-ADMIN se netadmin ban kar SSH, <code>show privilege</code> 15 dikhata hai, jo Access-Accept se <code>aaa authorization exec default group radius local</code> ne lagu kiya.</p>

<div class="note"><p>Server par nirbhar karta hai ki galat RADIUS key chupchaap drop (router par timeout) ki tarah dikhe ya Access-Reject ki tarah, kyunki password decrypt hokar kachra ban jaata hai. Dono haalat mein server log asli wajah batata hai. Hamesha dono sire check karo.</p></div>

<h3>Walkthrough 3: CoPP se router CPU bachao</h3>
<ul>
<li><b>COPP lagane ke baad R2 ke saath OSPF girta hai.</b> Check karo ki OSPF CP-ROUTING mein count ho raha hai, class-default mein nahi. ACL-ROUTING mein typo (jaise <code>permit ospf any any</code> ki jagah <code>permit tcp any any eq 89</code>) hellos ko class-default mein bhej deta hai.</li>
<li><b>MGMT SSH nahi kar pa raha.</b> ACL-MGMT check karo: source 10.99.0.0 0.0.0.255, destination any, <code>eq 22</code>. Source aur destination ulat dena classic galti hai. VTY access-class bhi check karo.</li>
<li><b>PC-USER se Telnet ab bhi chalta hai.</b> Class order check karo: CP-UNDESIRED TCP match karne wali kisi bhi class se pehle honi chahiye, aur uska action <code>drop</code> hona chahiye.</li>
<li><b>Flood test koi exceeded packets nahi dikhata.</b> Policy lagi nahi hai: <code>show running-config | section control-plane</code> mein <code>service-policy input COPP</code> dikhna chahiye.</li>
</ul>
<pre class="out">R1# show policy-map control-plane | include Class-map|packets,|exceeded
    Class-map: CP-UNDESIRED (match-all)
      4 packets, 240 bytes
    Class-map: CP-ROUTING (match-all)
<span class="hl">      212 packets, 18020 bytes</span>
    Class-map: CP-MGMT (match-all)
      96 packets, 9540 bytes
    Class-map: CP-ICMP (match-all)
      3124 packets, 799744 bytes
<span class="hl">        exceeded 2712 packets, 694272 bytes; actions:</span>
    Class-map: class-default (match-any)
      18 packets, 1512 bytes</pre>

<div class="eg"><p><b>Worked example.</b> Timeouts padhna. <code>show aaa servers</code> dikhata hai request 2, timeouts 6, retransmission 4. Har request ek baar bheji gayi aur do baar retransmit hui (RADIUS ke liye har request par default 3 tries), aur har try time out hui: 2 x 3 = 6. Agar router ko ek bhi Access-Reject mila hota, to reject counter 1 hota.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy device par <code>debug radius</code> ya <code>debug aaa</code> chalta chhod dena. Debug output CPU par jaata hai; test khatam hote hi <code>undebug all</code> se band karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Sirf local account chalta hai" ka matlab hai servers jawab nahi de rahe (ERROR). "Koi login nahi kar pa raha, local bhi nahi" kahin aur ishaara karta hai: VTY access-class, transport input, SSH keys, ya galat method par khatam hone wali list.</p></div>

<div class="scn"><h4>Woh loopback jo khisak gaya</h4><p>Router management ke liye Loopback0 jodne wale ek routine change ke baad 60 routers par TACACS+ logins fail hue, aur sabne break-glass account use kiya. <code>show aaa servers</code> sirf timeouts dikhata tha. Server ke switch port par packet capture ne dikhaya ki requests naye loopback addresses se aa rahi thi, jo ISE ki network device list mein nahi the. Team ne ISE jin interface ko jaanta tha us par point karta <code>ip tacacs source-interface</code> joda, phir ISE ko loopback addresses par update kiya, aur wapas badla.</p><p><b>Seekh:</b> AAA servers source IP addresses par bharosa karte hain. Source interfaces ya routing ka koi bhi change har login ko fallback bana sakta hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain TACACS+ logins fail ho rahe hain. Apni troubleshooting samjhao."</p><p>Pehle scope (ek user ya sab, local chalta hai ya nahi), phir sahi source interface aur VRF se reachability, <code>test aaa group</code>, rejects (server policy) aur timeouts (path, key, source address, port) ko alag karne ke liye <code>show aaa servers</code>, chhota <code>debug tacacs</code>, aur server ka live log. Ek cheez fix karo, phir asli login, privilege level aur accounting record verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kram se kaam karo: symptom, reachability, <code>test aaa</code>, counters, chhota debug, server log, fix aur verify.</li>
<li>Rejects ka matlab server ne jawab diya; timeouts ka matlab path, key, port ya source address galat hai.</li>
<li>"Sirf emergency account chalta hai" ka matlab AAA group ERROR deta hai.</li>
<li>RADIUS lab mein do galtiyan hain: source-interface Loopback0 aur NK-rad-26 ki jagah key NK-rad-62.</li>
<li>CoPP ke liye <code>show policy-map control-plane</code> mein dekho ki toota traffic kaunsi class count kar rahi hai.</li>
</ul></div>
`}};export{e as default};