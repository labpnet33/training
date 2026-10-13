var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have now seen the whole FGCP story: why clusters exist, the modes, the heartbeat and monitoring design, the election, the synchronisation, the build, the test and the troubleshooting. This last chapter is your revision sheet. Read it the evening before the exam or an interview, and use it as a checklist of things you should be able to explain without notes.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain what FGCP is and how it differs from FGSP and VRRP.</li>
<li>I can compare active-passive and active-active, including what active-active load balances by default.</li>
<li>I can list what must match between cluster members and what must differ.</li>
<li>I can describe heartbeat interfaces, the timers and why two links are the minimum.</li>
<li>I can explain monitored interfaces and remote link monitoring.</li>
<li>I can state the primary election order, with and without override, and the 300 second age margin.</li>
<li>I can say what is synchronised, what is not, and what session pickup adds.</li>
<li>I can write the HA configuration for both units from memory.</li>
<li>I can plan and run a failover test and read the verification commands.</li>
<li>I can troubleshoot an unjoined unit, split brain, flapping and out-of-sync clusters.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGCP</dt><dd>FortiGate Clustering Protocol, the Fortinet HA clustering protocol.</dd>
<dt>Primary / secondary</dt><dd>The unit that forwards and owns configuration, and the member that stands ready or shares inspection work.</dd>
<dt>Heartbeat (hbdev)</dt><dd>Dedicated Layer 2 links carrying keep-alives, configuration sync and session sync.</dd>
<dt>Monitored interface</dt><dd>A data interface whose link state affects primary election.</dd>
<dt>Override</dt><dd>Setting that moves device priority ahead of HA age in the election.</dd>
<dt>Session pickup</dt><dd>Optional synchronisation of the session table so connections survive failover.</dd>
<dt>Split brain</dt><dd>Both units act as primary because the heartbeat is down.</dd>
<dt>Group ID</dt><dd>Number embedded in the virtual MAC; must differ between clusters on one Layer 2 network.</dd>
<dt>Virtual MAC</dt><dd>Cluster-owned MAC address that stays the same across failover.</dd>
<dt>Reserved management interface</dt><dd>Per-unit management port outside forwarding and configuration sync.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Election order: connected monitored interfaces, HA age (beyond the margin), device priority, serial number. With override enabled, priority comes before age.</li>
<li>Default device priority is 128; the higher value wins.</li>
<li>The primary is the source of truth; configuration flows primary to secondary.</li>
<li>Host name and HA priority are not synchronised.</li>
<li>In active-active, UTM sessions are load balanced by default; TCP, UDP and ICMP stay on the primary unless enabled.</li>
<li>SSL VPN sessions and proxy-based inspection state are not synchronised by session pickup.</li>
<li>Heartbeat loss and monitored interface failure are separate failover triggers.</li>
<li>Same model and same firmware are needed on every member.</li>
</ul>

<h3>Command cheat-sheet (reference, not run in the simulator)</h3>
<pre class="code"><span class="c"># status and sync</span>
get system ha status
diagnose sys ha status
diagnose sys ha checksum cluster
diagnose sys ha checksum show
diagnose sys ha history read

<span class="c"># management and testing</span>
execute ha manage
diagnose sys ha reset-uptime

<span class="c"># settings you must be able to read</span>
config system ha
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set hbdev "port3" 50 "port4" 50
    set priority 200
    set override disable
    set monitor "port1" "port2"
    set session-pickup enable
end</pre>

<h3>Where to practise next</h3>
<p>There is no FGCP lab yet, so strengthen the surrounding skills where labs exist: interfaces and admin access in <b>nse4-setup</b>, objects and policy order in <b>nse4-policy</b>, and the sniffer and debug flow in <b>nse4-diag</b>. To compare the ideas, read <b>sec-asa-ha</b>, which covers failover pairs on another platform. The VPN modules, <b>nse4-ipsec</b> and <b>nse4-sslvpn</b>, show how a cluster interacts with tunnels and remote users.</p>

<div class="eg"><p><b>Worked example for revision.</b> Priorities 150 and 100, override disabled, ages 20 minutes and 2 minutes, both with all monitored interfaces up. Which is primary? The unit with 20 minutes: age differs by more than 300 seconds and comes before priority. If override were enabled, the priority 150 unit would win. Work through such cases until the order is automatic.</p></div>

<div class="warn"><p><b>Last mistakes to avoid.</b> Confusing HA with backup. Forgetting to monitor interfaces. Using one heartbeat link. Building the cluster with the blank unit leading. Declaring victory without testing every trigger.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the whole question for the override setting and for ages: the same numbers give a different primary with override on and off.</p></div>

<div class="scn"><h4>The calm cutover</h4><p>A company replaced a single ageing firewall with a tested two-unit cluster over a weekend. The team built the cluster in the lab first, verified checksums, ran three failover tests, wrote the outage times in the runbook, and then moved the cables. On Monday a power supply failed in the real rack and nobody noticed except the monitoring system.</p><p><b>Lesson:</b> the quiet outage is the result of the preparation, not of luck.</p></div>

<div class="iv"><p class="q">"Summarise a good FortiGate HA design in one minute."</p><p>Two identical units in active-passive mode, two direct heartbeat links, monitored LAN and WAN interfaces, a reserved management interface, session pickup enabled, a unique group ID, override disabled with a planned failback, and a failover test for each trigger. I would keep configuration backups and document the observed outage time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the election order cold, with and without override.</li>
<li>Know what is synchronised and what is not.</li>
<li>Design heartbeat with two links and monitor the data interfaces.</li>
<li>Test every failover trigger and record the result.</li>
<li>Troubleshoot with the six-question workflow.</li>
</ul></div>
`,hi:`
<p>Ab aap poori FGCP kahani dekh chuke ho: clusters kyun hote hain, modes, heartbeat aur monitoring design, election, synchronisation, build, test aur troubleshooting. Yeh aakhri chapter aapki revision sheet hai. Ise exam ya interview se pehle shaam ko padho, aur checklist ki tarah use karo ki aap bina notes ke kya explain kar sakte ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main explain kar sakta hoon ki FGCP kya hai aur FGSP aur VRRP se kaise alag hai.</li>
<li>Main active-passive aur active-active compare kar sakta hoon, jisme active-active default mein kya load balance karta hai bhi shamil hai.</li>
<li>Main list kar sakta hoon ki cluster members ke beech kya match hona chahiye aur kya alag.</li>
<li>Main heartbeat interfaces, timers aur do links ke minimum hone ka karan describe kar sakta hoon.</li>
<li>Main monitored interfaces aur remote link monitoring explain kar sakta hoon.</li>
<li>Main override ke saath aur bina primary election order aur 300 second age margin bata sakta hoon.</li>
<li>Main bata sakta hoon ki kya synchronise hota hai, kya nahi, aur session pickup kya jodta hai.</li>
<li>Main dono units ki HA configuration yaad se likh sakta hoon.</li>
<li>Main failover test plan aur run kar sakta hoon aur verification commands padh sakta hoon.</li>
<li>Main unjoined unit, split brain, flapping aur out-of-sync clusters troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FGCP</dt><dd>FortiGate Clustering Protocol, Fortinet ka HA clustering protocol.</dd>
<dt>Primary / secondary</dt><dd>Jo unit forward karta hai aur configuration ka owner hai, aur jo member ready khada rehta hai ya inspection ka kaam share karta hai.</dd>
<dt>Heartbeat (hbdev)</dt><dd>Dedicated Layer 2 links jo keep-alives, configuration sync aur session sync le jaate hain.</dd>
<dt>Monitored interface</dt><dd>Aisa data interface jiski link state primary election ko affect karti hai.</dd>
<dt>Override</dt><dd>Setting jo election mein device priority ko HA age se aage kar deti hai.</dd>
<dt>Session pickup</dt><dd>Session table ka optional synchronisation taaki connections failover mein bachein.</dd>
<dt>Split brain</dt><dd>Heartbeat down hone se dono units primary ki tarah act karte hain.</dd>
<dt>Group ID</dt><dd>Virtual MAC mein embedded number; ek Layer 2 network par clusters ke beech alag hona chahiye.</dd>
<dt>Virtual MAC</dt><dd>Cluster ka apna MAC address jo failover mein wahi rehta hai.</dd>
<dt>Reserved management interface</dt><dd>Per-unit management port jo forwarding aur configuration sync se bahar hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Election order: connected monitored interfaces, HA age (margin ke paar), device priority, serial number. Override enabled ho to priority age se pehle aati hai.</li>
<li>Default device priority 128 hai; badi value jeetti hai.</li>
<li>Primary source of truth hai; configuration primary se secondary ki taraf behti hai.</li>
<li>Host name aur HA priority synchronise nahi hote.</li>
<li>Active-active mein UTM sessions default mein load balance hote hain; TCP, UDP aur ICMP primary par rehte hain jab tak enable na karo.</li>
<li>SSL VPN sessions aur proxy-based inspection state session pickup se synchronise nahi hote.</li>
<li>Heartbeat loss aur monitored interface failure alag failover triggers hain.</li>
<li>Har member par same model aur same firmware chahiye.</li>
</ul>

<h3>Command cheat-sheet (reference, simulator mein nahi chalaya)</h3>
<pre class="code"><span class="c"># status aur sync</span>
get system ha status
diagnose sys ha status
diagnose sys ha checksum cluster
diagnose sys ha checksum show
diagnose sys ha history read

<span class="c"># management aur testing</span>
execute ha manage
diagnose sys ha reset-uptime

<span class="c"># settings jo aapko padhni aani chahiye</span>
config system ha
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set hbdev "port3" 50 "port4" 50
    set priority 200
    set override disable
    set monitor "port1" "port2"
    set session-pickup enable
end</pre>

<h3>Aage practice kahan karein</h3>
<p>Abhi FGCP lab nahi hai, isliye aas-paas ke skills wahan mazboot karo jahan labs hain: interfaces aur admin access <b>nse4-setup</b> mein, objects aur policy order <b>nse4-policy</b> mein, aur sniffer aur debug flow <b>nse4-diag</b> mein. Ideas compare karne ke liye <b>sec-asa-ha</b> padho, jo doosre platform par failover pairs cover karta hai. VPN modules, <b>nse4-ipsec</b> aur <b>nse4-sslvpn</b>, dikhate hain ki cluster tunnels aur remote users ke saath kaise interact karta hai.</p>

<div class="eg"><p><b>Revision ke liye worked example.</b> Priorities 150 aur 100, override disabled, ages 20 minute aur 2 minute, dono ke saare monitored interfaces up. Primary kaun? 20 minute wala unit: age ka difference 300 seconds se zyada hai aur woh priority se pehle aata hai. Override enabled hota to priority 150 wala jeetta. Aise cases tab tak solve karo jab tak order automatic na ho jaaye.</p></div>

<div class="warn"><p><b>Aakhri mistakes jinse bachna hai.</b> HA ko backup samajhna. Interfaces monitor karna bhool jaana. Ek heartbeat link use karna. Blank unit ko lead karwa ke cluster banana. Har trigger test kiye bina jeet ghoshit kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Override setting aur ages ke liye poora question padho: same numbers override on aur off mein alag primary dete hain.</p></div>

<div class="scn"><h4>Shaant cutover</h4><p>Ek company ne weekend mein ek purane single firewall ko tested do-unit cluster se badla. Team ne pehle lab mein cluster banaya, checksums verify kiye, teen failover tests chalaye, outage times runbook mein likhe, aur phir cables move kiye. Monday ko asli rack mein power supply fail hui aur monitoring system ke alawa kisi ko pata nahi chala.</p><p><b>Lesson:</b> shaant outage taiyari ka nateeja hai, kismat ka nahi.</p></div>

<div class="iv"><p class="q">"Achhe FortiGate HA design ko ek minute mein summarise karo."</p><p>Do identical units active-passive mode mein, do direct heartbeat links, monitored LAN aur WAN interfaces, reserved management interface, session pickup enabled, unique group ID, planned failback ke saath override disabled, aur har trigger ke liye failover test. Main configuration backups rakhoonga aur observed outage time document karoonga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Election order override ke saath aur bina pakka yaad rakho.</li>
<li>Jaano kya synchronise hota hai aur kya nahi.</li>
<li>Heartbeat do links ke saath design karo aur data interfaces monitor karo.</li>
<li>Har failover trigger test karo aur result record karo.</li>
<li>Chhe-sawaal workflow se troubleshoot karo.</li>
</ul></div>
`}};export{e as default};