var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when logs and traps do not arrive`,hi:`Troubleshooting workflow: jab logs aur traps nahi pahunchte`},body:{en:`
<p>When a letter does not arrive, you check four things in order: did the sender write the right address, did they actually post it, did the post office deliver it, and is anyone checking the letterbox? Monitoring data follows the same path: <b>device configuration</b>, <b>source and reachability</b>, <b>the path</b> (ACLs and firewalls) and <b>the collector</b>. This chapter gives you a repeatable workflow and walks through the lab "Send logs and traps to the NMS" step by step.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four-step monitoring troubleshooting workflow">
<rect x="5" y="40" width="145" height="70" rx="8" fill="#bae6fd"/><text x="77" y="66" text-anchor="middle" class="svg-ink" font-size="13">1. Device config</text><text x="77" y="86" text-anchor="middle" class="svg-muted" font-size="12">host, level, traps</text>
<rect x="165" y="40" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="237" y="66" text-anchor="middle" class="svg-ink" font-size="13">2. Source, reach</text><text x="237" y="86" text-anchor="middle" class="svg-muted" font-size="12">ping, source intf</text>
<rect x="325" y="40" width="145" height="70" rx="8" fill="#fde68a"/><text x="397" y="66" text-anchor="middle" class="svg-ink" font-size="13">3. The path</text><text x="397" y="86" text-anchor="middle" class="svg-muted" font-size="12">ACL, firewall ports</text>
<rect x="485" y="40" width="150" height="70" rx="8" fill="#fed7aa"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4. Collector</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">received? filtered?</text>
<line x1="150" y1="75" x2="165" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="325" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Work left to right; the counters on the device tell you whether it even tried to send.</text>
</svg><p class="cap">Follow the data from the device to the collector; stop at the first step that fails.</p></div>

<ol>
<li><b>Device configuration.</b> Is the destination configured, is the level high enough, are the right traps enabled? Use <code>show running-config | include logging|snmp-server</code>, <code>show logging</code>, <code>show snmp host</code> and <code>show snmp</code>.</li>
<li><b>Source and reachability.</b> Which source address does the device use, and can it reach the collector from that address? Ping the collector; check routes on both sides.</li>
<li><b>The path.</b> Do ACLs or firewalls permit UDP 514 (syslog), UDP 161 (polls) and UDP 162 (traps) in the right direction?</li>
<li><b>The collector.</b> Did it receive anything, from which address, and is it filtering by source or community?</li>
</ol>

<h3>Reading the device counters</h3>
<pre class="out">R2# show logging
    Trap logging: level informational, 6 message lines logged
        <span class="hl">Logging to 192.168.50.100  (udp port 514, audit disabled,</span>
              link up),
              6 message lines logged,</pre>
<p>If "message lines logged" increases but the collector shows nothing, the problem is in the path or the collector. If the host line is missing, it is configuration. For SNMP, <code>show snmp</code> counters tell a similar story: <b>Unknown community name</b> rising means the manager is using the wrong community; <b>Trap PDUs</b> output staying at 0 means traps are not being generated.</p>

<h3>Lab walkthrough</h3>
<p><b>Task 1: syslog from R1 and R2.</b> Configure <code>logging host 192.168.50.100</code> and <code>logging trap informational</code> on both, then type <code>end</code> to create a %SYS-5-CONFIG_I message. On the NMS, <code>show syslog</code> must list 192.168.50.1 and 10.0.12.2. If R2's messages are missing, check that R2 can ping 192.168.50.100 (its default route points to R1).</p>
<p><b>Task 2: read-only polling from the NMS only.</b> Create <code>access-list 20 permit host 192.168.50.100</code>, then <code>snmp-server community NP-RO RO 20</code> and <code>snmp-server location Rack-A3</code>. Test from both hosts:</p>
<pre class="out">NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
<span class="hl">SNMPv2-MIB::sysLocation.0 = STRING: Rack-A3</span>
PC1&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
Timeout: No Response from 192.168.50.1.</pre>
<p>A timeout from PC1 is the correct result. A timeout from the NMS means a typo in the community (it is case-sensitive), a wrong ACL number, or an ACL that permits the wrong host.</p>
<p><b>Task 3: traps from R2's Loopback0.</b> The classic mistake is enabling only some trap types. <code>snmp-server enable traps config</code> on its own enables configuration-change traps only; link traps need <code>snmp-server enable traps snmp linkdown linkup</code> (or plain <code>snmp-server enable traps snmp</code>, which also includes coldstart, warmstart and authentication). Then add <code>snmp-server host 192.168.50.100 version 2c NP-TRAP</code> and <code>snmp-server trap-source Loopback0</code>. Without the trap-source command the traps arrive from 10.0.12.2, and an NMS that knows R2 as 172.16.2.1 may discard them as unknown.</p>
<p><b>Task 4: simulate a failure.</b> Shut down Loopback1 and bring it back up. The NMS should show:</p>
<pre class="out">NMS&gt; show traps
SNMP trap receiver (UDP 162): 5 traps received
Sep 29 18:05:16  from 172.16.2.1      v2c  NP-TRAP     configChange  commandSource=1
<span class="hl">Sep 29 18:05:19  from 172.16.2.1      v2c  NP-TRAP     linkDown      ifIndex=6 ifDescr=Loopback1 ifOperStatus=2</span>
Sep 29 18:05:19  from 172.16.2.1      v2c  NP-TRAP     configChange  commandSource=1
Sep 29 18:05:22  from 172.16.2.1      v2c  NP-TRAP     linkUp        ifIndex=6 ifDescr=Loopback1 ifOperStatus=1</pre>
<p>If you see only configChange traps, go back to task 3: link traps are not enabled. <b>Task 5</b> asks which port the traps used: <b>UDP 162</b>, shown in the first line of the output.</p>

<div class="eg"><p><b>Worked example: isolate in three commands.</b> Ticket: "no traps from R2 since yesterday". (1) <code>show snmp host</code> on R2 shows the host, so configuration exists. (2) <code>show snmp</code> shows Trap PDUs increasing, so R2 is sending. (3) On the NMS, <code>show traps</code> is empty. The fault is between them: a new firewall rule blocking UDP 162. Three commands, and you know which team to call.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Checking the collector first and assuming the device is fine. Forgetting that <code>logging trap</code> is the syslog level, not SNMP. Enabling one trap type and expecting all. Testing SNMP from a host that the ACL does not permit and concluding SNMP is broken. Ignoring the source address the device actually uses.</p></div>

<div class="exam"><p><b>Exam trap.</b> Wrong community string or blocked source = <b>timeout</b>, not an error. Traps are <b>UDP 162</b> to the manager, polls are <b>UDP 161</b> to the agent, syslog is <b>UDP 514</b>. Missing link-down events in syslog often means the <b>level</b> is set too severe (for example warnings).</p></div>

<div class="scn"><h4>The silent branch</h4><p>After a firewall migration, the NOC noticed no syslog from twelve branch routers. Their dashboards still showed them up, because ICMP was allowed. The engineer checked one router: <code>show logging</code> showed the host configured and message counts rising. A packet capture on the NMS switch port (via SPAN) showed no UDP 514 arriving. The new firewall policy allowed ICMP and SNMP but had no rule for syslog. After the rule was added, the missing messages from before were gone forever, but new ones flowed.</p><p><b>Lesson:</b> device counters plus a capture at the collector pinpoint path problems quickly; and UDP syslog has no retransmission, so gaps are permanent.</p></div>

<div class="iv"><p class="q">"Your NMS stopped receiving SNMP traps from a router. How do you troubleshoot?"</p><p>Strong answer: follow the data. On the router, confirm traps are enabled for the right types and a trap host is configured with the right version and community; check <code>show snmp</code> for trap PDUs being sent and the trap source interface. Confirm reachability from that source to the NMS. Check ACLs and firewalls for UDP 162. Finally, check the NMS receiver and whether it filters by source or community. Mention informs if delivery must be confirmed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: device config, source and reachability, path, collector.</li>
<li>Device counters (<code>show logging</code>, <code>show snmp</code>) show whether the device is sending.</li>
<li>Trap types must be enabled individually; <code>enable traps config</code> alone gives no link traps.</li>
<li>Use a stable trap/logging source (loopback) so the NMS recognises the device.</li>
<li>UDP-based syslog and traps can be lost silently; informs and TCP/TLS syslog add reliability.</li>
</ul></div>
`,hi:`
<p>Jab letter nahi pahunchta, to aap order mein chaar cheezein check karte ho: kya bhejne wale ne sahi address likha, kya usne sach mein post kiya, kya post office ne deliver kiya, aur kya koi letterbox check kar raha hai? Monitoring data bhi yahi raasta leta hai: <b>device configuration</b>, <b>source aur reachability</b>, <b>path</b> (ACLs aur firewalls) aur <b>collector</b>. Yeh chapter aapko ek repeatable workflow deta hai aur lab "Send logs and traps to the NMS" ko step by step chalata hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chaar step wala monitoring troubleshooting workflow">
<rect x="5" y="40" width="145" height="70" rx="8" fill="#bae6fd"/><text x="77" y="66" text-anchor="middle" class="svg-ink" font-size="13">1. Device config</text><text x="77" y="86" text-anchor="middle" class="svg-muted" font-size="12">host, level, traps</text>
<rect x="165" y="40" width="145" height="70" rx="8" fill="#bbf7d0"/><text x="237" y="66" text-anchor="middle" class="svg-ink" font-size="13">2. Source, reach</text><text x="237" y="86" text-anchor="middle" class="svg-muted" font-size="12">ping, source intf</text>
<rect x="325" y="40" width="145" height="70" rx="8" fill="#fde68a"/><text x="397" y="66" text-anchor="middle" class="svg-ink" font-size="13">3. Path</text><text x="397" y="86" text-anchor="middle" class="svg-muted" font-size="12">ACL, firewall ports</text>
<rect x="485" y="40" width="150" height="70" rx="8" fill="#fed7aa"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">4. Collector</text><text x="560" y="86" text-anchor="middle" class="svg-muted" font-size="12">mila? filter hua?</text>
<line x1="150" y1="75" x2="165" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="325" y2="75" stroke="#64748b" stroke-width="2"/><line x1="470" y1="75" x2="485" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Baayein se daayein kaam karo; device ke counters batate hain ki usne bhejne ki koshish ki bhi ya nahi.</text>
</svg><p class="cap">Data ko device se collector tak follow karo; jo pehla step fail ho wahin ruko.</p></div>

<ol>
<li><b>Device configuration.</b> Kya destination configured hai, level kaafi ooncha hai, sahi traps enabled hain? <code>show running-config | include logging|snmp-server</code>, <code>show logging</code>, <code>show snmp host</code> aur <code>show snmp</code> use karo.</li>
<li><b>Source aur reachability.</b> Device kaunsa source address use karta hai, aur kya us address se collector tak pahunch sakta hai? Collector ko ping karo; dono taraf routes check karo.</li>
<li><b>Path.</b> Kya ACLs ya firewalls UDP 514 (syslog), UDP 161 (polls) aur UDP 162 (traps) ko sahi direction mein allow karte hain?</li>
<li><b>Collector.</b> Kya use kuch mila, kis address se, aur kya woh source ya community ke hisaab se filter kar raha hai?</li>
</ol>

<h3>Device counters padhna</h3>
<pre class="out">R2# show logging
    Trap logging: level informational, 6 message lines logged
        <span class="hl">Logging to 192.168.50.100  (udp port 514, audit disabled,</span>
              link up),
              6 message lines logged,</pre>
<p>Agar "message lines logged" badh raha hai lekin collector kuch nahi dikhata, to problem path ya collector mein hai. Agar host line hi missing hai, to configuration hai. SNMP ke liye <code>show snmp</code> counters bhi aisi hi kahani batate hain: <b>Unknown community name</b> badh raha hai matlab manager galat community use kar raha hai; <b>Trap PDUs</b> output 0 par ruka hai matlab traps generate hi nahi ho rahe.</p>

<h3>Lab walkthrough</h3>
<p><b>Task 1: R1 aur R2 se syslog.</b> Dono par <code>logging host 192.168.50.100</code> aur <code>logging trap informational</code> configure karo, phir %SYS-5-CONFIG_I message banane ke liye <code>end</code> type karo. NMS par <code>show syslog</code> mein 192.168.50.1 aur 10.0.12.2 dikhne chahiye. Agar R2 ke messages missing hain, check karo ki R2 192.168.50.100 ko ping kar sakta hai (uska default route R1 ki taraf hai).</p>
<p><b>Task 2: sirf NMS se read-only polling.</b> <code>access-list 20 permit host 192.168.50.100</code> banao, phir <code>snmp-server community NP-RO RO 20</code> aur <code>snmp-server location Rack-A3</code>. Dono hosts se test karo:</p>
<pre class="out">NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
<span class="hl">SNMPv2-MIB::sysLocation.0 = STRING: Rack-A3</span>
PC1&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
Timeout: No Response from 192.168.50.1.</pre>
<p>PC1 se timeout sahi result hai. NMS se timeout ka matlab community mein typo (yeh case-sensitive hai), galat ACL number, ya aisi ACL jo galat host ko permit karti hai.</p>
<p><b>Task 3: R2 ke Loopback0 se traps.</b> Classic galti sirf kuch trap types enable karna hai. <code>snmp-server enable traps config</code> akele sirf configuration-change traps enable karta hai; link traps ke liye <code>snmp-server enable traps snmp linkdown linkup</code> chahiye (ya sirf <code>snmp-server enable traps snmp</code>, jismein coldstart, warmstart aur authentication bhi shamil hain). Phir <code>snmp-server host 192.168.50.100 version 2c NP-TRAP</code> aur <code>snmp-server trap-source Loopback0</code> jodo. Trap-source command ke bina traps 10.0.12.2 se aate hain, aur jo NMS R2 ko 172.16.2.1 ke roop mein jaanta hai woh unhe unknown samajh kar discard kar sakta hai.</p>
<p><b>Task 4: failure simulate karo.</b> Loopback1 shut down karo aur wapas up karo. NMS par yeh dikhna chahiye:</p>
<pre class="out">NMS&gt; show traps
SNMP trap receiver (UDP 162): 5 traps received
Sep 29 18:05:16  from 172.16.2.1      v2c  NP-TRAP     configChange  commandSource=1
<span class="hl">Sep 29 18:05:19  from 172.16.2.1      v2c  NP-TRAP     linkDown      ifIndex=6 ifDescr=Loopback1 ifOperStatus=2</span>
Sep 29 18:05:19  from 172.16.2.1      v2c  NP-TRAP     configChange  commandSource=1
Sep 29 18:05:22  from 172.16.2.1      v2c  NP-TRAP     linkUp        ifIndex=6 ifDescr=Loopback1 ifOperStatus=1</pre>
<p>Agar sirf configChange traps dikhein, task 3 par wapas jao: link traps enabled nahi hain. <b>Task 5</b> poochta hai ki traps ne kaunsa port use kiya: <b>UDP 162</b>, jo output ki pehli line mein dikhta hai.</p>

<div class="eg"><p><b>Worked example: teen commands mein isolate karo.</b> Ticket: "kal se R2 se koi traps nahi". (1) R2 par <code>show snmp host</code> host dikhata hai, to configuration hai. (2) <code>show snmp</code> Trap PDUs badhte dikhata hai, to R2 bhej raha hai. (3) NMS par <code>show traps</code> khaali hai. Fault dono ke beech hai: ek naya firewall rule jo UDP 162 block kar raha hai. Teen commands, aur aapko pata hai kis team ko call karna hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Pehle collector check karna aur maan lena ki device theek hai. Bhoolna ki <code>logging trap</code> syslog level hai, SNMP nahi. Ek trap type enable karke sab ki ummeed rakhna. Aise host se SNMP test karna jise ACL permit nahi karti aur nateeja nikalna ki SNMP toota hai. Device asal mein jo source address use karta hai use ignore karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Galat community string ya blocked source = <b>timeout</b>, error nahi. Traps manager ko <b>UDP 162</b> par, polls agent ko <b>UDP 161</b> par, syslog <b>UDP 514</b>. Syslog mein link-down events missing hona aksar matlab hai ki <b>level</b> bahut serious set hai (jaise warnings).</p></div>

<div class="scn"><h4>Khamosh branch</h4><p>Firewall migration ke baad NOC ne notice kiya ki barah branch routers se koi syslog nahi aa raha. Dashboards unhe abhi bhi up dikha rahe the, kyunki ICMP allowed tha. Engineer ne ek router check kiya: <code>show logging</code> mein host configured tha aur message counts badh rahe the. NMS ke switch port par (SPAN ke through) packet capture mein koi UDP 514 aata nahi dikha. Naye firewall policy mein ICMP aur SNMP allowed the lekin syslog ke liye koi rule nahi tha. Rule jodne ke baad pehle ke missing messages hamesha ke liye chale gaye, lekin naye aane lage.</p><p><b>Seekh:</b> device counters aur collector par capture path problems jaldi pinpoint karte hain; aur UDP syslog mein retransmission nahi hota, isliye gaps permanent hote hain.</p></div>

<div class="iv"><p class="q">"Aapke NMS ko ek router se SNMP traps milna band ho gaye. Aap kaise troubleshoot karoge?"</p><p>Strong answer: data follow karo. Router par confirm karo ki sahi types ke traps enabled hain aur sahi version aur community ke saath trap host configured hai; <code>show snmp</code> mein trap PDUs bheje jaa rahe hain aur trap source interface check karo. Us source se NMS tak reachability confirm karo. ACLs aur firewalls mein UDP 162 check karo. Aakhir mein NMS receiver check karo aur dekho ki woh source ya community se filter to nahi kar raha. Agar delivery confirm karni ho to informs ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: device config, source aur reachability, path, collector.</li>
<li>Device counters (<code>show logging</code>, <code>show snmp</code>) dikhate hain ki device bhej raha hai ya nahi.</li>
<li>Trap types alag alag enable karne padte hain; akela <code>enable traps config</code> koi link traps nahi deta.</li>
<li>Stable trap/logging source (loopback) use karo taaki NMS device ko pehchaane.</li>
<li>UDP-based syslog aur traps chup chaap kho sakte hain; informs aur TCP/TLS syslog reliability jodte hain.</li>
</ul></div>
`}};export{e as default};