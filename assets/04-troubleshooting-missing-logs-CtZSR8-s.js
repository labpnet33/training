var e=`<svg viewBox="0 0 640 140" role="img" aria-label="Walk the syslog path in five steps">
<rect x="8" y="30" width="112" height="70" rx="8" fill="#bae6fd"/><text x="64" y="58" text-anchor="middle" class="svg-ink" font-size="13">1 Sender</text><text x="64" y="78" text-anchor="middle" class="svg-muted" font-size="11">host, level</text>
<rect x="134" y="30" width="112" height="70" rx="8" fill="#e2e8f0"/><text x="190" y="58" text-anchor="middle" class="svg-ink" font-size="13">2 Network</text><text x="190" y="78" text-anchor="middle" class="svg-muted" font-size="11">ping, source</text>
<rect x="260" y="30" width="112" height="70" rx="8" fill="#fed7aa"/><text x="316" y="58" text-anchor="middle" class="svg-ink" font-size="13">3 Firewall</text><text x="316" y="78" text-anchor="middle" class="svg-muted" font-size="11">ufw, UDP 514</text>
<rect x="386" y="30" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="442" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 Listener</text><text x="442" y="78" text-anchor="middle" class="svg-muted" font-size="11">ss -uln</text>
<rect x="512" y="30" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="572" y="58" text-anchor="middle" class="svg-ink" font-size="13">5 Rules, disk</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="11">file, space</text>
<line x1="120" y1="65" x2="134" y2="65" stroke="#64748b" stroke-width="2"/><line x1="246" y1="65" x2="260" y2="65" stroke="#64748b" stroke-width="2"/><line x1="372" y1="65" x2="386" y2="65" stroke="#64748b" stroke-width="2"/><line x1="498" y1="65" x2="512" y2="65" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`troubleshooting-missing-logs`,h:{en:`Troubleshooting: the logs stopped arriving`,hi:`Troubleshooting: logs aana band ho gaye`},body:{en:`
<h3>The silent failure</h3>
<p>Syslog never complains. If a message is lost, no alarm rings, so a missing log can mean "nothing happened" or "the path is broken". A good engineer never guesses. They send a message on purpose and follow it, hop by hop, until it disappears. The place it disappears is the fault.</p>

<h3>Step 0: make a test message</h3>
<p>On the router, create an event with a known text and a known severity. The command <code>send log</code> writes a user message into the log system as if it were an event.</p>
<pre class="code">KCH-EDGE-R2# send log 5 "NK-TEST-1 syslog path check"</pre>
<pre class="out">Oct  7 10:41:03.118: %SYS-5-USERLOG_NOTICE: Message from tty0(user id: ): NK-TEST-1 syslog path check</pre>
<p>Now you have a needle to search for. The same idea works with a harmless interface bounce on a spare port, but a test message is safer.</p>

<div class="dia">`+e+`<p class="cap">Walk left to right. Fix the first broken step, then test again.</p></div>

<h3>Step 1: the sender (read show logging)</h3>
<pre class="code">KCH-EDGE-R2# show logging | include Trap|Logging to|message lines|Source</pre>
<pre class="out">    Trap logging: level <span class="hl">errors</span>, 12 message lines logged
        Logging to <span class="hl">10.1.50.101</span>  (udp port 514, audit disabled,
              0 message lines logged,
        Logging Source-Interface:       VRF Name:
        Loopback0</pre>
<p>Check three facts. Is the destination right? Here it is 10.1.50.101, but the collector is 10.1.50.100: a typing mistake. Is the trap level high enough? A level of errors (3) blocks our severity 5 test and all up/down messages. Is the host counter moving? Zero message lines under the host says the router sent nothing there. Fix both:</p>
<pre class="code">KCH-EDGE-R2(config)# no logging host 10.1.50.101
KCH-EDGE-R2(config)# logging host 10.1.50.100
KCH-EDGE-R2(config)# logging trap informational</pre>

<h3>Step 2: the network</h3>
<p>Can the router reach the collector, using the same source address the logs use? Test with the source set to the loopback:</p>
<pre class="code">KCH-EDGE-R2# ping 10.1.50.100 source Loopback0</pre>
<pre class="out">Sending 5, 100-byte ICMP Echos to 10.1.50.100, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5)</pre>
<p>This matters twice. The reply must find its way back to 10.255.0.2, and a firewall on the server may be written to allow only a certain source range. Ping working does not prove UDP 514 works, because a firewall can allow ICMP and drop UDP.</p>

<h3>Step 3: the server firewall</h3>
<p>Now move to the Linux collector SYSLOG01 (10.1.50.30, user netadmin). In the contract lab a ufw rule set blocks the traffic. The firewall log shows exactly what it dropped:</p>
<pre class="code">netadmin@syslog01:~$ sudo ufw status verbose
netadmin@syslog01:~$ sudo tail -2 /var/log/ufw.log</pre>
<pre class="out">Status: active
Logging: on (low)
Default: <span class="hl">deny (incoming)</span>, allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere

Oct  7 10:41:03 syslog01 kernel: <span class="hl">[UFW BLOCK]</span> IN=eth0 SRC=10.255.0.2 DST=10.1.50.30 PROTO=UDP <span class="hl">DPT=514</span></pre>
<p>"UFW BLOCK ... DPT=514" is the smoking gun: the packet arrived and was refused. Note the source is 10.255.0.2, the router's loopback, not its LAN address. A rule written for the wrong network would still fail. Allow the loopback range of the routers:</p>
<pre class="code">netadmin@syslog01:~$ sudo ufw allow from 10.255.0.0/24 to any port 514 proto udp
netadmin@syslog01:~$ sudo ufw status numbered</pre>
<pre class="out">Rule added

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] <span class="hl">514/udp                    ALLOW IN    10.255.0.0/24</span></pre>
<p>Keep the rule narrow: only the router range, only UDP 514. "Allow everything" would fix the symptom and create a security hole.</p>

<h3>Step 4: the listener</h3>
<p>A server can have a perfect firewall and still not listen. Ask the operating system which sockets are open (<code>-u</code> UDP, <code>-l</code> listening, <code>-n</code> numbers):</p>
<pre class="code">netadmin@syslog01:~$ ss -uln | grep 514
netadmin@syslog01:~$ systemctl is-active rsyslog</pre>
<pre class="out">udp   UNCONN 0      0             0.0.0.0:<span class="hl">514</span>        0.0.0.0:*
active</pre>
<p>If nothing prints for 514, rsyslog is not listening: the input lines are missing or the service stopped. A minimal receiver needs <code>module(load="imudp")</code> and <code>input(type="imudp" port="514")</code> in a file under <code>/etc/rsyslog.d/</code>. Validate with <code>sudo rsyslogd -N1</code>, then <code>sudo systemctl restart rsyslog</code>.</p>

<h3>Step 5: rules and disk</h3>
<pre class="code">netadmin@syslog01:~$ ls -l /var/log/remote
netadmin@syslog01:~$ grep NK-TEST-1 /var/log/remote/*.log
netadmin@syslog01:~$ df -h /var/log</pre>
<pre class="out">-rw-r----- 1 syslog adm  412 Oct  7 10:44 10.255.0.2.log
/var/log/remote/10.255.0.2.log:Oct  7 10:44:12 10.255.0.2 31: *Oct  7 10:44:12.118: %SYS-5-USERLOG_NOTICE: ... NK-TEST-1 syslog path check
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        40G   12G   26G  32% /</pre>
<p>If the message arrives, you are done. If the file exists but stays old, look at the rsyslog rule that picks the file and at free disk space. A full disk silently stops writing.</p>

<div class="eg"><p><b>Worked example: Kochi has been silent since Monday.</b> Test message at the router: not on NMS. Step 1: host 10.1.50.101 (typo) and trap level errors. After fixing both, still nothing. Step 3: UFW BLOCK for UDP 514 from 10.255.0.2. One narrow allow rule, a second test message, and the line appears. Two faults, one symptom. Always re-test after each fix, because the first fix rarely reveals the second.</p></div>

<h3>A fast decision table</h3>
<table class="cmp"><tr><th>Evidence</th><th>Fault is at</th></tr>
<tr><td>Host counter zero; wrong IP in show logging</td><td>sender destination</td></tr>
<tr><td>Test severity above the trap level</td><td>sender level</td></tr>
<tr><td>UFW BLOCK ... DPT=514 in ufw.log</td><td>server firewall</td></tr>
<tr><td>Nothing on ss -uln for 514</td><td>listener</td></tr>
<tr><td>Packets arrive, file stale or missing</td><td>rules, permissions or disk</td></tr>
<tr><td>Lines arrive but out of order</td><td>time or NTP, not the path</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Stopping at the first fault. (2) Disabling the firewall to "test" and leaving it off. (3) Opening a rule for the LAN range while logs come from a loopback. (4) Trusting ping as proof for UDP. (5) Reading the router buffer and calling the problem solved, when the server never got it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order of checks is evidence-driven: sender configuration, reachability, firewall, listener, storage. Questions often show a firewall log with DPT=514 as the clue. Also remember that the source address of syslog is controlled by logging source-interface.</p></div>

<div class="scn"><h4>Two faults on a Monday morning</h4><p>Kabir Shah reported that Kochi logs stopped after a weekend change. Priya Nair sent a test message and followed it. The router was pointing at a collector address with one digit wrong, and the standard hardening script had also switched on the server firewall with default deny. She fixed the destination, saw the ufw block, added a narrow rule for the router loopback range and the line appeared. She added a standing test message to the weekly checklist.</p><p><b>Lesson:</b> follow a test message hop by hop and expect more than one fault.</p></div>

<div class="iv"><p class="q">"Logs from one branch stopped arriving. How do you troubleshoot?"</p><p>Strong answer: send a test message of known severity, then follow it. Check the sender with show logging for the host, the trap level and the counter. Check reachability from the correct source interface. On the collector, check the firewall log for blocks on UDP 514, check that rsyslog is listening with ss, then check the rule and the disk. Fix one thing, re-test, and keep going because there can be several faults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog loss is silent: send a known test message and follow it.</li>
<li>Sender checks: right host, high enough trap level, counter moving, correct source.</li>
<li>Server checks: firewall allows UDP 514 from the real source range, rsyslog listens, disk has space.</li>
<li>ufw.log with UFW BLOCK and DPT=514 proves the firewall dropped it.</li>
<li>Re-test after every fix; the first fix often hides a second fault.</li>
</ul></div>
`,hi:`
<h3>Silent failure</h3>
<p>Syslog kabhi shikayat nahi karta. Message kho jaaye to koi alarm nahi bajta, to missing log ka matlab "kuch hua hi nahi" ya "path toota hai" dono ho sakta hai. Acha engineer kabhi guess nahi karta. Woh jaan-boojh kar message bhejta hai aur use hop by hop follow karta hai jab tak woh gayab na ho jaaye. Jahan woh gayab hota hai wahi fault hai.</p>

<h3>Step 0: test message banao</h3>
<p>Router par ek jaane-pehchane text aur jaani-pehchani severity ka event banao. <code>send log</code> command ek user message ko log system mein aise likhta hai jaise woh koi event ho.</p>
<pre class="code">KCH-EDGE-R2# send log 5 "NK-TEST-1 syslog path check"</pre>
<pre class="out">Oct  7 10:41:03.118: %SYS-5-USERLOG_NOTICE: Message from tty0(user id: ): NK-TEST-1 syslog path check</pre>
<p>Ab aapke paas dhoondhne ke liye ek sui hai. Yahi idea kisi spare port ke harmless interface bounce se bhi chalta hai, lekin test message zyada safe hai.</p>

<div class="dia">`+e+`<p class="cap">Left se right chalo. Pehla toota step theek karo, phir dobara test karo.</p></div>

<h3>Step 1: sender (show logging padho)</h3>
<pre class="code">KCH-EDGE-R2# show logging | include Trap|Logging to|message lines|Source</pre>
<pre class="out">    Trap logging: level <span class="hl">errors</span>, 12 message lines logged
        Logging to <span class="hl">10.1.50.101</span>  (udp port 514, audit disabled,
              0 message lines logged,
        Logging Source-Interface:       VRF Name:
        Loopback0</pre>
<p>Teen facts check karo. Destination sahi hai? Yahan 10.1.50.101 hai, jabki collector 10.1.50.100 hai: typing mistake. Trap level kaafi upar hai? Level errors (3) hamare severity 5 test aur saare up/down messages ko rokta hai. Host counter chal raha hai? Host ke neeche zero message lines ka matlab router ne wahan kuch bheja hi nahi. Dono theek karo:</p>
<pre class="code">KCH-EDGE-R2(config)# no logging host 10.1.50.101
KCH-EDGE-R2(config)# logging host 10.1.50.100
KCH-EDGE-R2(config)# logging trap informational</pre>

<h3>Step 2: network</h3>
<p>Kya router collector tak pahunch sakta hai, usi source address se jo logs use karte hain? Source ko loopback par set karke test karo:</p>
<pre class="code">KCH-EDGE-R2# ping 10.1.50.100 source Loopback0</pre>
<pre class="out">Sending 5, 100-byte ICMP Echos to 10.1.50.100, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5)</pre>
<p>Yeh do baar matter karta hai. Reply ko 10.255.0.2 tak wapas aana hai, aur server ka firewall sirf ek khaas source range allow karne ke liye likha ho sakta hai. Ping chalna sabit nahi karta ki UDP 514 chalega, kyunki firewall ICMP allow karke UDP drop kar sakta hai.</p>

<h3>Step 3: server firewall</h3>
<p>Ab Linux collector SYSLOG01 (10.1.50.30, user netadmin) par jao. Contract lab mein ek ufw rule set traffic block karta hai. Firewall log bilkul dikhata hai ki usne kya drop kiya:</p>
<pre class="code">netadmin@syslog01:~$ sudo ufw status verbose
netadmin@syslog01:~$ sudo tail -2 /var/log/ufw.log</pre>
<pre class="out">Status: active
Logging: on (low)
Default: <span class="hl">deny (incoming)</span>, allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere

Oct  7 10:41:03 syslog01 kernel: <span class="hl">[UFW BLOCK]</span> IN=eth0 SRC=10.255.0.2 DST=10.1.50.30 PROTO=UDP <span class="hl">DPT=514</span></pre>
<p>"UFW BLOCK ... DPT=514" pakka saboot hai: packet pahuncha aur mana kar diya gaya. Dhyan do ki source 10.255.0.2 hai, router ka loopback, uska LAN address nahi. Galat network ke liye likha rule phir bhi fail hoga. Routers ki loopback range allow karo:</p>
<pre class="code">netadmin@syslog01:~$ sudo ufw allow from 10.255.0.0/24 to any port 514 proto udp
netadmin@syslog01:~$ sudo ufw status numbered</pre>
<pre class="out">Rule added

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] <span class="hl">514/udp                    ALLOW IN    10.255.0.0/24</span></pre>
<p>Rule ko narrow rakho: sirf router range, sirf UDP 514. "Sab allow karo" symptom theek karega aur security hole bana dega.</p>

<h3>Step 4: listener</h3>
<p>Server ka firewall perfect ho sakta hai aur phir bhi woh sun nahi raha ho sakta. Operating system se poochho kaun se sockets khule hain (<code>-u</code> UDP, <code>-l</code> listening, <code>-n</code> numbers):</p>
<pre class="code">netadmin@syslog01:~$ ss -uln | grep 514
netadmin@syslog01:~$ systemctl is-active rsyslog</pre>
<pre class="out">udp   UNCONN 0      0             0.0.0.0:<span class="hl">514</span>        0.0.0.0:*
active</pre>
<p>Agar 514 ke liye kuch print nahi hota, to rsyslog sun nahi raha: input lines missing hain ya service ruki hai. Minimal receiver ko <code>/etc/rsyslog.d/</code> ki file mein <code>module(load="imudp")</code> aur <code>input(type="imudp" port="514")</code> chahiye. <code>sudo rsyslogd -N1</code> se validate karo, phir <code>sudo systemctl restart rsyslog</code>.</p>

<h3>Step 5: rules aur disk</h3>
<pre class="code">netadmin@syslog01:~$ ls -l /var/log/remote
netadmin@syslog01:~$ grep NK-TEST-1 /var/log/remote/*.log
netadmin@syslog01:~$ df -h /var/log</pre>
<pre class="out">-rw-r----- 1 syslog adm  412 Oct  7 10:44 10.255.0.2.log
/var/log/remote/10.255.0.2.log:Oct  7 10:44:12 10.255.0.2 31: *Oct  7 10:44:12.118: %SYS-5-USERLOG_NOTICE: ... NK-TEST-1 syslog path check
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        40G   12G   26G  32% /</pre>
<p>Message aa gaya to kaam khatam. Agar file hai lekin purani hi rehti hai, to file chunne wale rsyslog rule aur free disk space dekho. Bhari disk chupchaap likhna band kar deti hai.</p>

<div class="eg"><p><b>Worked example: Kochi Monday se chup hai.</b> Router par test message: NMS par nahi. Step 1: host 10.1.50.101 (typo) aur trap level errors. Dono theek karne ke baad bhi kuch nahi. Step 3: 10.255.0.2 se UDP 514 ke liye UFW BLOCK. Ek narrow allow rule, doosra test message, aur line aa gayi. Do faults, ek symptom. Har fix ke baad dobara test karo, kyunki pehla fix aksar doosre ko nahi dikhata.</p></div>

<h3>Tez decision table</h3>
<table class="cmp"><tr><th>Evidence</th><th>Fault kahan hai</th></tr>
<tr><td>Host counter zero; show logging mein galat IP</td><td>sender destination</td></tr>
<tr><td>Test severity trap level se upar</td><td>sender level</td></tr>
<tr><td>ufw.log mein UFW BLOCK ... DPT=514</td><td>server firewall</td></tr>
<tr><td>ss -uln mein 514 par kuch nahi</td><td>listener</td></tr>
<tr><td>Packets aate hain, file purani ya missing</td><td>rules, permissions ya disk</td></tr>
<tr><td>Lines aati hain lekin out of order</td><td>time ya NTP, path nahi</td></tr></table>

<div class="warn"><p><b>Common galtiyan.</b> (1) Pehle fault par ruk jaana. (2) "Test" ke liye firewall band karke off hi chhod dena. (3) LAN range ke liye rule kholna jabki logs loopback se aate hain. (4) UDP ke saboot ke liye ping par bharosa. (5) Router buffer padhkar problem solved maan lena, jabki server ko mila hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Checks ka order evidence se chalta hai: sender configuration, reachability, firewall, listener, storage. Questions aksar DPT=514 wala firewall log clue ke roop mein dikhate hain. Yeh bhi yaad rakho ki syslog ka source address logging source-interface se control hota hai.</p></div>

<div class="scn"><h4>Somvar subah do faults</h4><p>Kabir Shah ne bataya ki weekend change ke baad Kochi ke logs band ho gaye. Priya Nair ne test message bheja aur use follow kiya. Router ek aise collector address par point kar raha tha jisme ek digit galat tha, aur standard hardening script ne server firewall bhi default deny ke saath on kar diya tha. Usne destination theek kiya, ufw block dekha, router loopback range ke liye narrow rule jodi aur line aa gayi. Usne weekly checklist mein ek standing test message jod diya.</p><p><b>Seekh:</b> test message ko hop by hop follow karo aur ek se zyada faults ki ummeed rakho.</p></div>

<div class="iv"><p class="q">"Ek branch ke logs aana band ho gaye. Aap troubleshoot kaise karoge?"</p><p>Strong answer: jaani-pehchani severity ka test message bhejo, phir use follow karo. Sender par show logging se host, trap level aur counter dekho. Sahi source interface se reachability check karo. Collector par UDP 514 ke blocks ke liye firewall log dekho, ss se check karo rsyslog sun raha hai, phir rule aur disk dekho. Ek cheez theek karo, dobara test karo, aur aage badho kyunki kai faults ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog loss silent hota hai: jaana-pehchana test message bhejo aur follow karo.</li>
<li>Sender checks: sahi host, kaafi ooncha trap level, counter chalta hua, sahi source.</li>
<li>Server checks: firewall asli source range se UDP 514 allow kare, rsyslog sune, disk mein jagah ho.</li>
<li>UFW BLOCK aur DPT=514 wala ufw.log sabit karta hai ki firewall ne drop kiya.</li>
<li>Har fix ke baad re-test karo; pehla fix aksar doosra fault chhupa deta hai.</li>
</ul></div>
`}};export{t as default};