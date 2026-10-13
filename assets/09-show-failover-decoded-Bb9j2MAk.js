var e={id:`show-failover`,h:{en:`show failover decoded, line by line`,hi:`show failover ko line by line samajhna`},body:{en:`
<p>A doctor reading a blood report does not read every number with the same attention. They know where to look first: the few values that tell them whether the patient is healthy, then the details. <code>show failover</code> is the blood report of an ASA pair. It is long, but five lines answer ninety percent of the questions. This chapter walks through a healthy output from ASA1 in lab 1 and tells you what each part means and when it matters.</p>

<h3>The full output</h3>
<pre class="out">NK-ASA# show failover
<span class="hl">Failover On</span>
Failover unit Primary
<span class="hl">Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</span>
Reconnect timeout 0:00:00
Unit Poll frequency 1 seconds, holdtime 15 seconds
Interface Poll frequency 5 seconds, holdtime 25 seconds
Interface Policy 1
Monitored Interfaces 2 of 1285 maximum
MAC Address Move Notification Interval not set
Version: Ours 9.20(2), Mate 9.20(2)
Serial Number: Ours 9A5NK0001AB, Mate 9A5NK0002CD
Last Failover at: 10:02:17 UTC Sep 30 2026
	<span class="hl">This host: Primary - Active</span>
		Active time: 312 (sec)
		slot 0: ASAv hw/sw rev (/9.20(2)) status (Up Sys)
		  Interface outside (203.0.113.2): Normal (Monitored)
		  Interface inside (10.0.1.1): Normal (Monitored)
	<span class="hl">Other host: Secondary - Standby Ready</span>
		Active time: 0 (sec)
		slot 0: ASAv hw/sw rev (/9.20(2)) status (Up Sys)
		  Interface outside (203.0.113.3): Normal (Monitored)
		  Interface inside (10.0.1.2): Normal (Monitored)

Stateful Failover Logical Update Statistics
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span>
	Stateful Obj    xmit       xerr       rcv        rerr
	General         42         0          42         0
	sys cmd         42         0          42         0
	up time         0          0          0          0
	RPC services    0          0          0          0
	TCP conn        14         0          0          0
	UDP conn        6          0          0          0
	ARP tbl         3          0          0          0
	Xlate_Timeout   0          0          0          0
	IPv6 ND tbl     0          0          0          0
	VPN IKEv1 SA    0          0          0          0
	VPN IKEv2 SA    0          0          0          0
	Route Session   0          0          0          0
	User-Identity   0          0          0          0

	Logical Update Queue Information
			Cur	Max	Total
	Recv Q:		0	5	42
	Xmit Q:		0	11	42</pre>

<h3>Block 1: is failover configured and talking?</h3>
<dl class="terms">
<dt>Failover On</dt><dd>The <code>failover</code> command is enabled. <b>Failover Off</b> means the unit behaves as a standalone firewall; nothing else in the output matters until you fix that.</dd>
<dt>Failover unit Primary</dt><dd>The fixed role from <code>failover lan unit</code>. It says nothing about who is active.</dd>
<dt>Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</dt><dd>The failover link, its physical port and its state. <b>(down)</b> or <b>not Configured</b> is the first thing to check when the mate is not detected.</dd>
<dt>Unit Poll / Interface Poll / Interface Policy</dt><dd>The timers and threshold from chapter 7. Defaults 1/15, 5/25 and 1; different values mean someone tuned them, which is worth knowing during an incident.</dd>
<dt>Monitored Interfaces 2 of 1285 maximum</dt><dd>How many data interfaces take part in interface monitoring (outside and inside in the lab).</dd>
<dt>Version: Ours ..., Mate ...</dt><dd>Both software versions. They must match, except during a supported upgrade. <b>Mate Unknown</b> means no mate is detected.</dd>
<dt>Last Failover at</dt><dd>When the last state change happened. A recent time you did not expect means an unplanned failover: go to <code>show failover history</code>.</dd>
</dl>

<h3>Block 2: this host and the other host</h3>
<p>This is the heart of the output. Read the two lines <b>This host</b> and <b>Other host</b> first. Each has the form <code>&lt;role&gt; - &lt;state&gt;</code>:</p>
<table class="cmp"><tr><th>You see</th><th>It means</th></tr>
<tr><td>Primary - Active / Secondary - Standby Ready</td><td>Healthy pair, normal roles</td></tr>
<tr><td>Secondary - Active / Primary - Standby Ready</td><td>Healthy pair after a failover; no preemption, so it stays like this</td></tr>
<tr><td>Other host: Secondary - Not Detected</td><td>No hellos from the mate: cabling, interface, subnet, key, role or compatibility (chapter 12)</td></tr>
<tr><td>Other host: Primary - Failed</td><td>The mate is seen but marked failed, for example Interface check</td></tr>
<tr><td>This host: ... - Cold Standby / Sync Config / Bulk Sync</td><td>The standby is still joining; wait a moment</td></tr></table>
<p>Under each host, the <b>Active time</b> is the total time that unit has been active, and each monitored interface is listed with the address that unit uses and its health (chapter 7's states). On the active unit, this host lists active addresses and the other host standby addresses.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where to look in show failover">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Failover On? LAN interface (up)?</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. This host / Other host: role - state</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">3. Interface lines: Normal (Monitored)? Waiting? No Link?</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">4. Stateful link (up)? xmit rising, xerr and rerr zero?</text>
</svg><p class="cap">Reading order for show failover: link, states, interfaces, state replication.</p></div>

<h3>Block 3: stateful failover statistics</h3>
<dl class="terms">
<dt>Link : STATELINK GigabitEthernet0/4 (up)</dt><dd>The state link. <b>Link : Unconfigured.</b> means the pair is stateless; <b>(down)</b> means state updates are not flowing.</dd>
<dt>xmit / rcv</dt><dd>Objects sent and received. On the active unit the conn rows increase in <b>xmit</b>; on the standby they increase in <b>rcv</b>.</dd>
<dt>xerr / rerr</dt><dd>Transmit and receive errors. They should stay at zero; growing values point to a congested or faulty state link.</dd>
<dt>Recv Q / Xmit Q</dt><dd>Queues for state updates. A Cur value that stays high means the state link cannot keep up.</dd>
</dl>

<h3>Companion commands</h3>
<table class="cmp"><tr><th>Command</th><th>Use it for</th></tr>
<tr><td><code>show failover state</code></td><td>Both units' state and <b>Last Failure Reason</b> with time; configuration sync state</td></tr>
<tr><td><code>show failover history</code></td><td>Every state transition with reason: the story of an incident</td></tr>
<tr><td><code>show failover interface</code></td><td>Failover and state link addressing: System, My and Other IP address</td></tr>
<tr><td><code>show monitor-interface</code></td><td>Just the monitored interfaces of both units</td></tr>
<tr><td><code>show running-config failover</code></td><td>The failover configuration (the key shows as *****)</td></tr>
<tr><td><code>failover exec mate show ...</code></td><td>Run a show command on the other unit</td></tr></table>
<pre class="out">NK-ASA# show failover interface
        interface FOLINK GigabitEthernet0/5
                System IP Address: 192.168.255.1 255.255.255.252
                <span class="hl">My IP Address    : 192.168.255.1</span>
                Other IP Address : 192.168.255.2
        interface STATELINK GigabitEthernet0/4
                System IP Address: 192.168.254.1 255.255.255.252
                My IP Address    : 192.168.254.1
                Other IP Address : 192.168.254.2</pre>

<div class="eg"><p><b>Worked example.</b> On a pair you have never seen, <code>show failover | include host|Link|Last</code> returns: <code>Last Failover at: 03:12:40 UTC Sep 28 2026</code>, <code>This host: Secondary - Active</code>, <code>Other host: Primary - Standby Ready</code>, <code>Link : STATELINK GigabitEthernet0/4 (up)</code>. Reading: the pair is healthy and stateful, but a failover happened two days ago at 03:12 and nobody failed back. Next step: <code>show failover history</code> to find the reason, then decide on a controlled failback.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading only "This host" and concluding the pair is fine. "This host: Primary - Active" with "Other host: Secondary - Not Detected" is a single firewall with no protection.</p></div>
<div class="exam"><p><b>Exam trap.</b> In <code>show failover</code>, "Failover unit Primary" is the role and the "This host" line holds the state. And "Link : Unconfigured." in the stateful section means no state link, so failover would be stateless.</p></div>

<div class="scn"><h4>The audit that found a lonely firewall</h4><p>During a security audit an engineer collected <code>show failover</code> from forty sites with a script that only checked for "Failover On". All passed. A second script also parsed the "Other host" line and found three sites reporting <code>Not Detected</code>: at two, the secondary's power cable had been moved during office works; at one, a firmware upgrade had left the secondary on a different version. The fixes took an afternoon, and the check was added to the daily report.</p><p><b>Lesson:</b> "Failover On" is not "failover working"; always check the mate's state.</p></div>

<div class="iv"><p class="q">"You run show failover. Which lines do you look at first?"</p><p>Strong answer: first "Failover On" and the failover LAN interface state; then the This host and Other host lines to see role and state of each unit (Active, Standby Ready, Failed, Not Detected); then the interface lines under each host for Normal (Monitored) versus Waiting, No Link or Failed; finally the stateful section to confirm the state link is up and that xmit or rcv are increasing without errors. Then use show failover state for the last failure reason and show failover history for the timeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First check Failover On and the failover LAN interface (up).</li>
<li>This host and Other host lines show role - state for both units.</li>
<li>Interface lines show addresses in use and monitoring health.</li>
<li>Stateful section: link up, xmit/rcv rising, xerr/rerr zero; "Unconfigured" means stateless.</li>
<li>Companions: show failover state, history, interface; show monitor-interface; failover exec mate.</li>
</ul></div>
`,hi:`
<p>Blood report padhne wala doctor har number ko ek jaisi attention se nahi padhta. Use pata hai pehle kahan dekhna hai: woh kuch values jo batati hain ki patient healthy hai ya nahi, phir details. <code>show failover</code> ASA pair ki blood report hai. Yeh lamba hai, lekin paanch lines nabbe percent sawaalon ka jawab deti hain. Yeh chapter lab 1 ke ASA1 ke ek healthy output se guzarta hai aur batata hai ki har hissa kya matlab rakhta hai aur kab matter karta hai.</p>

<h3>Poora output</h3>
<pre class="out">NK-ASA# show failover
<span class="hl">Failover On</span>
Failover unit Primary
<span class="hl">Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</span>
Reconnect timeout 0:00:00
Unit Poll frequency 1 seconds, holdtime 15 seconds
Interface Poll frequency 5 seconds, holdtime 25 seconds
Interface Policy 1
Monitored Interfaces 2 of 1285 maximum
MAC Address Move Notification Interval not set
Version: Ours 9.20(2), Mate 9.20(2)
Serial Number: Ours 9A5NK0001AB, Mate 9A5NK0002CD
Last Failover at: 10:02:17 UTC Sep 30 2026
	<span class="hl">This host: Primary - Active</span>
		Active time: 312 (sec)
		slot 0: ASAv hw/sw rev (/9.20(2)) status (Up Sys)
		  Interface outside (203.0.113.2): Normal (Monitored)
		  Interface inside (10.0.1.1): Normal (Monitored)
	<span class="hl">Other host: Secondary - Standby Ready</span>
		Active time: 0 (sec)
		slot 0: ASAv hw/sw rev (/9.20(2)) status (Up Sys)
		  Interface outside (203.0.113.3): Normal (Monitored)
		  Interface inside (10.0.1.2): Normal (Monitored)

Stateful Failover Logical Update Statistics
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span>
	Stateful Obj    xmit       xerr       rcv        rerr
	General         42         0          42         0
	sys cmd         42         0          42         0
	up time         0          0          0          0
	RPC services    0          0          0          0
	TCP conn        14         0          0          0
	UDP conn        6          0          0          0
	ARP tbl         3          0          0          0
	Xlate_Timeout   0          0          0          0
	IPv6 ND tbl     0          0          0          0
	VPN IKEv1 SA    0          0          0          0
	VPN IKEv2 SA    0          0          0          0
	Route Session   0          0          0          0
	User-Identity   0          0          0          0

	Logical Update Queue Information
			Cur	Max	Total
	Recv Q:		0	5	42
	Xmit Q:		0	11	42</pre>

<h3>Block 1: kya failover configured hai aur baat kar raha hai?</h3>
<dl class="terms">
<dt>Failover On</dt><dd><code>failover</code> command enabled hai. <b>Failover Off</b> ka matlab unit standalone firewall ki tarah behave karta hai; jab tak woh theek na ho, output ka baaki kuch matter nahi karta.</dd>
<dt>Failover unit Primary</dt><dd><code>failover lan unit</code> se aaya fixed role. Yeh kuch nahi batata ki active kaun hai.</dd>
<dt>Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</dt><dd>Failover link, uska physical port aur uski state. Mate detect na ho to sabse pehle <b>(down)</b> ya <b>not Configured</b> check karo.</dd>
<dt>Unit Poll / Interface Poll / Interface Policy</dt><dd>Chapter 7 ke timers aur threshold. Defaults 1/15, 5/25 aur 1; alag values ka matlab kisi ne tune kiya hai, jo incident ke dauraan jaanna kaam ka hai.</dd>
<dt>Monitored Interfaces 2 of 1285 maximum</dt><dd>Kitne data interfaces interface monitoring mein hissa lete hain (lab mein outside aur inside).</dd>
<dt>Version: Ours ..., Mate ...</dt><dd>Dono software versions. Match hone chahiye, supported upgrade ke alawa. <b>Mate Unknown</b> ka matlab koi mate detect nahi hua.</dd>
<dt>Last Failover at</dt><dd>Aakhri state change kab hua. Haal ka koi samay jo aapne expect nahi kiya matlab unplanned failover: <code>show failover history</code> par jao.</dd>
</dl>

<h3>Block 2: this host aur other host</h3>
<p>Yeh output ka dil hai. Pehle do lines padho, <b>This host</b> aur <b>Other host</b>. Har ek ka form hai <code>&lt;role&gt; - &lt;state&gt;</code>:</p>
<table class="cmp"><tr><th>Aapko dikhe</th><th>Matlab</th></tr>
<tr><td>Primary - Active / Secondary - Standby Ready</td><td>Healthy pair, normal roles</td></tr>
<tr><td>Secondary - Active / Primary - Standby Ready</td><td>Failover ke baad healthy pair; preemption nahi, isliye aisa hi rehta hai</td></tr>
<tr><td>Other host: Secondary - Not Detected</td><td>Mate se koi hellos nahi: cabling, interface, subnet, key, role ya compatibility (chapter 12)</td></tr>
<tr><td>Other host: Primary - Failed</td><td>Mate dikhta hai lekin failed mark hai, jaise Interface check</td></tr>
<tr><td>This host: ... - Cold Standby / Sync Config / Bulk Sync</td><td>Standby abhi jud raha hai; thoda ruko</td></tr></table>
<p>Har host ke neeche <b>Active time</b> woh total samay hai jitna woh unit active raha, aur har monitored interface us address ke saath list hota hai jo woh unit use karta hai aur uski health (chapter 7 ki states). Active unit par this host active addresses aur other host standby addresses list karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where to look in show failover">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Failover On? LAN interface (up)?</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. This host / Other host: role - state</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">3. Interface lines: Normal (Monitored)? Waiting? No Link?</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">4. Stateful link (up)? xmit badh raha, xerr aur rerr zero?</text>
</svg><p class="cap">show failover padhne ka order: link, states, interfaces, state replication.</p></div>

<h3>Block 3: stateful failover statistics</h3>
<dl class="terms">
<dt>Link : STATELINK GigabitEthernet0/4 (up)</dt><dd>State link. <b>Link : Unconfigured.</b> ka matlab pair stateless hai; <b>(down)</b> ka matlab state updates nahi ja rahe.</dd>
<dt>xmit / rcv</dt><dd>Bheje aur mile objects. Active unit par conn rows <b>xmit</b> mein badhti hain; standby par <b>rcv</b> mein.</dd>
<dt>xerr / rerr</dt><dd>Transmit aur receive errors. Zero rehne chahiye; badhti values congested ya kharab state link ki taraf ishara karti hain.</dd>
<dt>Recv Q / Xmit Q</dt><dd>State updates ki queues. Agar Cur value upar hi rahe to state link saath nahi de pa raha.</dd>
</dl>

<h3>Saathi commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kis kaam ke liye</th></tr>
<tr><td><code>show failover state</code></td><td>Dono units ki state aur samay ke saath <b>Last Failure Reason</b>; configuration sync state</td></tr>
<tr><td><code>show failover history</code></td><td>Reason ke saath har state transition: incident ki kahani</td></tr>
<tr><td><code>show failover interface</code></td><td>Failover aur state link addressing: System, My aur Other IP address</td></tr>
<tr><td><code>show monitor-interface</code></td><td>Sirf dono units ke monitored interfaces</td></tr>
<tr><td><code>show running-config failover</code></td><td>Failover configuration (key ***** dikhti hai)</td></tr>
<tr><td><code>failover exec mate show ...</code></td><td>Doosre unit par show command chalao</td></tr></table>
<pre class="out">NK-ASA# show failover interface
        interface FOLINK GigabitEthernet0/5
                System IP Address: 192.168.255.1 255.255.255.252
                <span class="hl">My IP Address    : 192.168.255.1</span>
                Other IP Address : 192.168.255.2
        interface STATELINK GigabitEthernet0/4
                System IP Address: 192.168.254.1 255.255.255.252
                My IP Address    : 192.168.254.1
                Other IP Address : 192.168.254.2</pre>

<div class="eg"><p><b>Worked example.</b> Ek pair jise aapne kabhi nahi dekha, us par <code>show failover | include host|Link|Last</code> deta hai: <code>Last Failover at: 03:12:40 UTC Sep 28 2026</code>, <code>This host: Secondary - Active</code>, <code>Other host: Primary - Standby Ready</code>, <code>Link : STATELINK GigabitEthernet0/4 (up)</code>. Matlab: pair healthy aur stateful hai, lekin do din pehle 03:12 par failover hua aur kisi ne fail back nahi kiya. Agla step: reason jaanne ke liye <code>show failover history</code>, phir controlled failback ka faisla.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf "This host" padhkar maan lena ki pair theek hai. "This host: Primary - Active" ke saath "Other host: Secondary - Not Detected" ek single firewall hai jiski koi protection nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show failover</code> mein "Failover unit Primary" role hai aur state "This host" line mein hoti hai. Aur stateful section mein "Link : Unconfigured." ka matlab koi state link nahi, isliye failover stateless hoga.</p></div>

<div class="scn"><h4>Audit jisne ek akela firewall pakda</h4><p>Security audit ke dauraan ek engineer ne ek script se chaalees sites ka <code>show failover</code> collect kiya jo sirf "Failover On" check karti thi. Sab pass hue. Doosri script ne "Other host" line bhi parse ki aur teen sites mili jo <code>Not Detected</code> report kar rahi thi: do par office ke kaam mein secondary ki power cable hil gayi thi; ek par firmware upgrade ne secondary ko alag version par chhod diya tha. Fixes mein ek dopahar lagi, aur check daily report mein jod diya gaya.</p><p><b>Seekh:</b> "Failover On" ka matlab "failover kaam kar raha hai" nahi; hamesha mate ki state check karo.</p></div>

<div class="iv"><p class="q">"Aap show failover chalate ho. Sabse pehle kaunsi lines dekhte ho?"</p><p>Strong answer: pehle "Failover On" aur failover LAN interface ki state; phir This host aur Other host lines taaki har unit ka role aur state dikhe (Active, Standby Ready, Failed, Not Detected); phir har host ke neeche interface lines, Normal (Monitored) vs Waiting, No Link ya Failed; aakhir mein stateful section taaki confirm ho ki state link up hai aur xmit ya rcv bina errors ke badh rahe hain. Phir last failure reason ke liye show failover state aur timeline ke liye show failover history.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle Failover On aur failover LAN interface (up) check karo.</li>
<li>This host aur Other host lines dono units ka role - state dikhati hain.</li>
<li>Interface lines use ho rahe addresses aur monitoring health dikhati hain.</li>
<li>Stateful section: link up, xmit/rcv badhte hue, xerr/rerr zero; "Unconfigured" matlab stateless.</li>
<li>Saathi: show failover state, history, interface; show monitor-interface; failover exec mate.</li>
</ul></div>
`}};export{e as default};