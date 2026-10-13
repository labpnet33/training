var e=e=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Walk the path">
<rect x="8" y="35" width="108" height="60" rx="8" fill="#bae6fd"/><text x="62" y="60" text-anchor="middle" class="svg-ink" font-size="13">1 Router</text><text x="62" y="78" text-anchor="middle" class="svg-muted" font-size="11">host, level</text>
<rect x="136" y="35" width="108" height="60" rx="8" fill="#e2e8f0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="13">2 Network</text><text x="190" y="78" text-anchor="middle" class="svg-muted" font-size="11">ping</text>
<rect x="264" y="35" width="108" height="60" rx="8" fill="#fed7aa"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="13">3 Firewall</text><text x="318" y="78" text-anchor="middle" class="svg-muted" font-size="11">ufw, BLOCK</text>
<rect x="392" y="35" width="108" height="60" rx="8" fill="#ddd6fe"/><text x="446" y="60" text-anchor="middle" class="svg-ink" font-size="13">4 Service</text><text x="446" y="78" text-anchor="middle" class="svg-muted" font-size="11">ss -uln</text>
<rect x="520" y="35" width="108" height="60" rx="8" fill="#bbf7d0"/><text x="574" y="60" text-anchor="middle" class="svg-ink" font-size="13">5 Rules, file</text><text x="574" y="78" text-anchor="middle" class="svg-muted" font-size="11">path, disk</text>
<line x1="116" y1="65" x2="136" y2="65" stroke="#64748b" stroke-width="2"/><line x1="244" y1="65" x2="264" y2="65" stroke="#64748b" stroke-width="2"/><line x1="372" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="520" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ systemctl is-active rsyslog
netadmin@syslog01:~$ ss -uln | grep 514
netadmin@syslog01:~$ tail -1 /var/log/remote/10.99.0.1.log</pre>
<pre class="out">active
udp   UNCONN 0      0             0.0.0.0:514        0.0.0.0:*
Sep 28 22:40:47 10.99.0.1 120: *Sep 28 22:40:47.551: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</pre>`,n=`<pre class="code">PUN-CORE-R1# send log 5 "NK-2412 test A"
netadmin@syslog01:~$ sudo ufw status verbose
netadmin@syslog01:~$ sudo tail -3 /var/log/ufw.log</pre>
<pre class="out">Status: active
Logging: on (low)
Default: <span class="hl">deny (incoming)</span>, allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere

Sep 29 09:00:30 syslog01 kernel: <span class="hl">[UFW BLOCK]</span> IN=eth0 SRC=10.99.0.1 DST=10.99.0.30 PROTO=UDP <span class="hl">DPT=514</span></pre>`,r=`<pre class="code">netadmin@syslog01:~$ sudo ufw allow from 10.99.0.0/24 to any port 514 proto udp
netadmin@syslog01:~$ sudo ufw status numbered
PUN-CORE-R1# send log 5 "NK-2412 test B"
netadmin@syslog01:~$ tail -n 1 /var/log/remote/10.99.0.1.log</pre>
<pre class="out">Rule added

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] <span class="hl">514/udp                    ALLOW IN    10.99.0.0/24</span>

Sep 29 09:00:34 10.99.0.1 2: *Oct  2 02:35:34.413: %SYS-5-USERLOG_NOTICE: Message from tty0(user id: ): <span class="hl">NK-2412 test B</span></pre>`,i=`<pre class="code">BLR-EDGE-R2# show logging | include Trap|Logging to</pre>
<pre class="out">    Trap logging: level <span class="hl">warnings</span>, 0 message lines logged
        Logging to <span class="hl">10.99.0.31</span>  (udp port 514, audit disabled,</pre>`,a=`<pre class="code">BLR-EDGE-R2# configure terminal
BLR-EDGE-R2(config)# no logging host 10.99.0.31
BLR-EDGE-R2(config)# logging host 10.99.0.30
BLR-EDGE-R2(config)# logging trap informational
BLR-EDGE-R2(config)# end
BLR-EDGE-R2# send log 5 "NK-2412 test C"
BLR-EDGE-R2# show logging | include Trap|Logging to</pre>
<pre class="out">    Trap logging: level informational, 2 message lines logged
        Logging to 10.99.0.30  (udp port 514, audit disabled,</pre>`,o={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when the logs stop arriving`,hi:`Troubleshooting workflow: jab logs aana band ho jaayein`},body:{en:`
<p>Ticket NK-2412: "The syslog files for both routers have not changed since last night." Last night two things changed: a firewall was switched on for SYSLOG01, and BLR-EDGE-R2 received a "standard logging template". The skill here is a method, not a command. Walk the path in the same order a message travels, and prove or rule out each link. Never guess.</p>
`+e(`Five checkpoints from the router to the file. Test one at a time, in this order.`)+`

<h3>Checkpoint 4 first, quickly: is the server healthy?</h3>
<p>Many engineers start at the server because it is the thing they control. Do a thirty-second health check, then move on to the path.</p>
`+t+`
<p>The service is active and the socket is open. The newest line in R1's file is from 22:40 yesterday, so the file is fine but nothing new arrives. The fault is on the path or at the router.</p>

<h3>Checkpoint 3: the firewall</h3>
<p>Generate a test message that you can recognise, then look at what the firewall says. <code>ufw</code> (the Ubuntu firewall, studied in the next module) writes every blocked packet into <code>/var/log/ufw.log</code>.</p>
`+n+`
<p>Read it like a detective. The default policy is <b>deny incoming</b>. Only <code>22/tcp</code> is allowed. The block line says: a UDP packet from <b>SRC=10.99.0.1</b> to <b>DST=10.99.0.30</b> on destination port <b>DPT=514</b> was dropped. The router sends, the server receives, and the firewall throws it away. Allow exactly what is needed and nothing more: UDP 514, only from the management network.</p>
`+r+`
<p>The test message B arrived. R1 is fixed. Notice what you did <i>not</i> do: you did not turn the firewall off, and you did not open 514 to the whole world. A syslog port open to everyone lets anyone fill your disk with fake messages.</p>

<h3>Checkpoint 1: the second router, a different fault</h3>
<p>BLR-EDGE-R2 is still silent, even for a level 5 test. The firewall rule is already in place and covers R2 as well, so the problem lies on R2 itself. Ask the router what it believes:</p>
`+i+`
<p>Two mistakes sit in one template. The server is <b>10.99.0.31</b>, a typo for .30, so logs go to a different, probably non-existent host. The trap level is <b>warnings</b>, so even a correct address would hide severity 5 and 6. The counter "0 message lines logged" confirms that nothing qualified. Fix both and prove it with a new test:</p>
`+a+`
<p>The counter went from 0 to 2, and the server file now holds the line <code>NK-2412 test C</code> after the router's own configuration message. Case closed, with evidence at each step.</p>

<h3>The checklist you can reuse</h3>
<ol>
<li><b>Router:</b> <code>show logging</code> lists the right host, the trap level covers the severity, counters rise.</li>
<li><b>Network:</b> the router can reach the server (<code>ping 10.99.0.30</code> from the router). A source address change can also hit access rules.</li>
<li><b>Firewall:</b> <code>sudo ufw status</code> allows UDP 514 from the sender; <code>ufw.log</code> shows <code>[UFW BLOCK] ... DPT=514</code> if it does not.</li>
<li><b>Service:</b> rsyslog is active and <code>ss -uln</code> shows 514.</li>
<li><b>Rules and files:</b> the template and file path match what you search; the disk is not full; the file is not being written under a different name.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> You have ten seconds of evidence per checkpoint. Router counter rising and server <code>ufw.log</code> silent means packets are not even being blocked: go back to the network or the source address. Router counter static means the router is not sending: go to checkpoint 1. The evidence tells you which half of the path to examine.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Disabling the firewall "just to test". It works, hides the real rule that was missing, and often stays disabled. Read <code>ufw.log</code> instead: it names the exact port and address that were dropped.</p></div>
<div class="exam"><p><b>Exam trap.</b> Two faults can exist at once. When fixing one device does not fix another, do not assume the same cause. Test each sender separately with its own marked message.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>After a security hardening weekend, logs from every router vanished. The first engineer found the firewall rule, fixed it, and closed the ticket. On Monday one branch was still silent: its router had a different template with the wrong trap level. A final end-to-end test message from every device would have found it on Saturday.</p><p><b>Lesson:</b> finish every fix with a marked test message from each affected sender.</p></div>

<div class="iv"><p class="q">"Syslog messages from a router stopped arriving. How do you troubleshoot?"</p><p>Follow the path. On the router, check the logging host, level and counters, and send a marked test message. Confirm reachability. On the server, check the firewall and its block log for UDP 514, then check that rsyslog is active and listening, then the rules and files. Fix the smallest thing, retest with a unique message, and document it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in path order: router, network, firewall, service, rules and files.</li>
<li><code>[UFW BLOCK] ... DPT=514</code> in /var/log/ufw.log proves a firewall drop.</li>
<li>Open the minimum: UDP 514 from the management network only.</li>
<li><code>show logging</code> reveals wrong host, low trap level and a zero counter.</li>
<li>Always close with a unique test message per sender.</li>
</ul></div>
`,hi:`
<p>Ticket NK-2412: "Dono routers ki syslog files kal raat se nahi badli." Kal raat do cheezein badli: SYSLOG01 par firewall on hua, aur BLR-EDGE-R2 ko ek "standard logging template" mila. Yahan skill ek method hai, command nahi. Path ko usi order mein chalo jis order mein message safar karta hai, aur har kadi ko sabit ya rule out karo. Kabhi andaza mat lagao.</p>
`+e(`Router se file tak paanch checkpoints. Ek-ek karke, isi order mein test karo.`)+`

<h3>Pehle checkpoint 4, jaldi se: kya server theek hai?</h3>
<p>Bahut se engineers server se shuru karte hain kyunki woh woh cheez hai jo unke control mein hai. Tees second ka health check karo, phir path par aage badho.</p>
`+t+`
<p>Service active hai aur socket khula hai. R1 ki file ki sabse nayi line kal raat 22:40 ki hai, yaani file theek hai par kuch naya nahi aa raha. Fault path mein ya router par hai.</p>

<h3>Checkpoint 3: firewall</h3>
<p>Ek aisa test message banao jise aap pehchan sako, phir dekho firewall kya kehta hai. <code>ufw</code> (Ubuntu firewall, jo agle module mein padhoge) har blocked packet ko <code>/var/log/ufw.log</code> mein likhta hai.</p>
`+n+`
<p>Jasoos ki tarah padho. Default policy <b>deny incoming</b> hai. Sirf <code>22/tcp</code> allowed hai. Block line kehti hai: <b>SRC=10.99.0.1</b> se <b>DST=10.99.0.30</b> ko destination port <b>DPT=514</b> par aaya UDP packet drop hua. Router bhejta hai, server receive karta hai, aur firewall use phenk deta hai. Sirf wahi allow karo jo chahiye, aur kuch nahi: UDP 514, sirf management network se.</p>
`+r+`
<p>Test message B pahunch gaya. R1 theek ho gaya. Dhyan do ki aapne kya <i>nahi</i> kiya: firewall band nahi kiya, aur 514 ko poori duniya ke liye nahi khola. Sabke liye khula syslog port kisi ko bhi fake messages se aapki disk bharne deta hai.</p>

<h3>Checkpoint 1: doosra router, alag fault</h3>
<p>BLR-EDGE-R2 ab bhi chup hai, level 5 test par bhi. Firewall rule pehle se hai aur R2 ko bhi cover karta hai, isliye problem R2 mein hi hai. Router se poocho woh kya maanta hai:</p>
`+i+`
<p>Ek template mein do galtiyan hain. Server <b>10.99.0.31</b> hai, .30 ka typo, isliye logs kisi doosre, shayad na maujood host ko jaate hain. Trap level <b>warnings</b> hai, isliye sahi address hota tab bhi severity 5 aur 6 chhup jaate. "0 message lines logged" counter confirm karta hai ki kuch qualify hi nahi hua. Dono theek karo aur naye test se sabit karo:</p>
`+a+`
<p>Counter 0 se 2 ho gaya, aur server file mein ab router ke apne configuration message ke baad <code>NK-2412 test C</code> line hai. Case band, har step par saboot ke saath.</p>

<h3>Checklist jo aap dobara use kar sakte ho</h3>
<ol>
<li><b>Router:</b> <code>show logging</code> mein sahi host, trap level jo severity ko cover kare, aur counters badhte hue.</li>
<li><b>Network:</b> router server tak pahunch sakta hai (router se <code>ping 10.99.0.30</code>). Source address badalna access rules ko bhi hit kar sakta hai.</li>
<li><b>Firewall:</b> <code>sudo ufw status</code> sender se UDP 514 allow karta hai; agar nahi karta to <code>ufw.log</code> mein <code>[UFW BLOCK] ... DPT=514</code> dikhta hai.</li>
<li><b>Service:</b> rsyslog active hai aur <code>ss -uln</code> 514 dikhata hai.</li>
<li><b>Rules aur files:</b> template aur file path wahi hain jo aap search karte ho; disk full nahi hai; file kisi aur naam se nahi likhi ja rahi.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Har checkpoint par aapke paas das second ka saboot hai. Router counter badh raha hai aur server ka <code>ufw.log</code> chup hai, matlab packets block bhi nahi ho rahe: network ya source address par wapas jao. Router counter sthir hai, matlab router bhej hi nahi raha: checkpoint 1 par jao. Saboot batata hai path ke kaunse aadhe hisse ko dekhna hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Sirf test ke liye" firewall disable kar dena. Woh chalta hai, par asli missing rule chhupa deta hai, aur aksar disabled hi reh jaata hai. Iski jagah <code>ufw.log</code> padho: woh exact port aur address batata hai jo drop hue.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do faults ek saath ho sakte hain. Ek device theek karne se doosra theek na ho to wahi kaaran mat maano. Har sender ko apne marked message se alag test karo.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Security hardening weekend ke baad har router ke logs gayab ho gaye. Pehle engineer ne firewall rule dhoondha, theek kiya aur ticket close kiya. Monday ko ek branch ab bhi chup tha: uske router mein alag template tha jisme trap level galat tha. Har device se ek final end-to-end test message use Saturday ko hi pakad leta.</p><p><b>Lesson:</b> har fix ko har affected sender ke marked test message se khatam karo.</p></div>

<div class="iv"><p class="q">"Router se syslog messages aana band ho gaye. Kaise troubleshoot karoge?"</p><p>Path follow karo. Router par logging host, level aur counters check karo, aur marked test message bhejo. Reachability confirm karo. Server par firewall aur uska UDP 514 ka block log dekho, phir rsyslog active aur listening hai yeh dekho, phir rules aur files. Sabse chhoti cheez theek karo, unique message se retest karo, aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path order mein troubleshoot karo: router, network, firewall, service, rules aur files.</li>
<li>/var/log/ufw.log mein <code>[UFW BLOCK] ... DPT=514</code> firewall drop sabit karta hai.</li>
<li>Kam se kam kholo: UDP 514 sirf management network se.</li>
<li><code>show logging</code> galat host, kam trap level aur zero counter dikha deta hai.</li>
<li>Hamesha har sender ke unique test message se khatam karo.</li>
</ul></div>
`}};export{o as default};