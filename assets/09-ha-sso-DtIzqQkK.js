var e={id:`ha-sso`,h:{en:`HA SSO: one logical controller with RP and RMI (concept only)`,hi:`HA SSO: RP aur RMI ke saath ek logical controller (concept only)`},body:{en:`
<div class="note"><p><b>Concept only.</b> The simulator has no <code>redundancy</code> mode, no RP or RMI ports, no <code>show chassis</code> and no switchover. This chapter is reading material with real command forms and sample output, so you can configure and explain HA SSO at work and in the ENWLSI and ENWLSD blueprints. The output below is representative; your release may differ in detail.</p></div>

<h3>Two controllers, one identity</h3>
<p>AP failover (chapter 8) saves the <b>service</b> but not the <b>sessions</b>: APs re-join, clients re-associate, addresses may change. Many networks, especially hospitals and factories, cannot accept that. <b>High Availability Stateful Switchover (HA SSO)</b> joins two controllers into one logical unit. One is <b>Active</b>. The other is <b>Standby-Hot</b>: it continuously receives a copy of the Active unit's state and takes over in seconds when the Active fails.</p>
<p>Picture a pilot and co-pilot. Both fly the aircraft in the sense that both know the route, the altitude and the radio frequencies. Only the pilot touches the controls. If the pilot is incapacitated, the co-pilot continues without asking the passengers to leave and board again.</p>

<h3>What is synchronised</h3>
<ul>
<li><b>Configuration</b>: the Active unit's running and startup configuration is mirrored to the Standby. You configure only the Active unit.</li>
<li><b>AP SSO</b>: the CAPWAP state of every AP in Run state. After a switchover APs stay joined and do not go to discovery.</li>
<li><b>Client SSO</b>: the state of clients that have completed association and authentication. They keep their session and do <b>not</b> re-associate. Clients in the middle of authentication or web authentication at the moment of failure must start again.</li>
<li><b>Mobility identity</b>: the pair presents <b>one mobility MAC and one management IP</b> to its peers, so mobility peers and anchors see one controller and keep their tunnels.</li>
</ul>
<p>What is not copied: the Standby's console and CLI are not available for configuration; it runs as a mirror. Both controllers must be the same model with the same software image and license level.</p>

<h3>The two links: RP and RMI</h3>
<dl class="terms">
<dt>RP (redundancy port)</dt><dd>A dedicated Layer 2 link between the two controllers (a physical RP port on 9800-40, 9800-80 and 9800-L appliances; a dedicated interface and VLAN on 9800-CL virtual controllers). It carries heartbeats and state synchronisation. Keep it short, direct and isolated; the deployment guide gives a maximum round-trip time between the units.</dd>
<dt>RMI (redundancy management interface)</dt><dd>An extra IP address on the <b>wireless management VLAN</b> for each unit. It allows you to reach each unit for management (SSH, SNMP, syslog), and each unit uses it to <b>ping the default gateway</b>. The gateway check lets a unit know whether it can still reach the rest of the network.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HA SSO pair">
<rect x="30" y="40" width="200" height="90" rx="10" fill="#bbf7d0"/><text x="130" y="68" text-anchor="middle" class="svg-ink" font-size="14">Chassis 1: Active</text><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">priority 2</text><text x="130" y="110" text-anchor="middle" class="svg-ink" font-size="12">RMI 10.10.99.11</text>
<rect x="410" y="40" width="200" height="90" rx="10" fill="#fde68a"/><text x="510" y="68" text-anchor="middle" class="svg-ink" font-size="14">Chassis 2: Standby-Hot</text><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">priority 1</text><text x="510" y="110" text-anchor="middle" class="svg-ink" font-size="12">RMI 10.10.99.12</text>
<line x1="230" y1="85" x2="410" y2="85" stroke="#7c3aed" stroke-width="4"/><text x="320" y="76" text-anchor="middle" class="svg-accent" font-size="12">RP link: state sync + heartbeat</text>
<rect x="215" y="170" width="210" height="40" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Shared management IP 10.10.99.10</text>
<line x1="130" y1="130" x2="260" y2="170" stroke="#64748b"/><line x1="510" y1="130" x2="380" y2="170" stroke="#64748b"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Both RMIs also ping the gateway; APs and peers see one controller.</text>
</svg><p class="cap">An HA SSO pair: Active and Standby-Hot, RP between them, an RMI address each, one management IP and one mobility identity to the outside.</p></div>

<h3>Configuration outline</h3>
<p>These are the command forms in the Catalyst 9800 high availability guide; check the guide for your release and platform before you type them on a production controller.</p>
<pre class="code"><span class="c">! chassis 1 (becomes the preferred Active)</span>
redundancy
 mode sso
exit
chassis 1 priority 2
redun-management interface Vlan99 chassis 1 address 10.10.99.11 chassis 2 address 10.10.99.12
<span class="c">! 9800-CL only: the interface used as RP link</span>
chassis redundancy ha-interface GigabitEthernet3

<span class="c">! chassis 2: renumber first (the unit reloads), then the same redundancy settings</span>
chassis 1 renumber 2</pre>
<p>On appliances with RP ports, you also connect the RP cable and set the same RMI line on both units, then let them form a pair. The Active is chosen by priority (the higher priority value wins), then by MAC address as a tie-breaker. There is <b>no preemption</b>: when a failed unit returns it comes back as Standby.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show chassis rmi
Chassis#   Role      Mac Address      Priority  State   IP              RMI-IP
*1         Active    0050.568d.cdf4   2         Ready   169.254.99.11   10.10.99.11
 2         Standby   0050.568d.2a93   1         Ready   169.254.99.12   10.10.99.12

WLC1# show redundancy
Operating Redundancy Mode = sso
Switchovers system experienced = 0
<span class="hl">Current Software state = ACTIVE</span>
Peer Processor Information :
<span class="hl">Current Software state = STANDBY HOT</span></pre>
<p>The line to look for is <code>STANDBY HOT</code>. Anything else (for example Standby bulk-sync in progress) means the Standby is not yet ready to take over. To test the pair, schedule a window and run <code>redundancy force-switchover</code> on the Active; <code>show redundancy switchover history</code> then lists the reason (for instance "user forced"). A switchover that happens on its own shows reasons such as <b>Active lost GW</b> (the Active unit could no longer reach its gateway through the RMI) or an RP keepalive failure.</p>
<p>The RP keepalive is tunable (<code>chassis redundancy keep-alive timer</code> and <code>retries</code>) for virtual controllers where scheduling delays could cause false failures. Defaults detect a failure in well under a second on appliances.</p>

<div class="eg"><p><b>Worked example.</b> A hospital pair of 9800-80 controllers serves 600 APs and 4000 clients. A power supply fails in the Active unit. The Standby detects loss of heartbeat on the RP, becomes Active in a few seconds, and keeps all 600 APs in Run state. Users on phones and tablets notice no re-association because client SSO preserved their sessions. Only clients that were in the middle of web authentication at that exact second needed to log in again.</p></div>

<h3>Limits to remember</h3>
<ul>
<li>HA SSO protects against <b>controller</b> failure, not <b>site</b> failure: the pair sits together (the RP is short and Layer 2). For a site disaster you need a second pair or N+1 at another site (chapter 10).</li>
<li>The pair counts as <b>one controller</b> for capacity: 600 APs on the pair is still 600 APs, not 1200.</li>
<li>Both units upgrade together, and the software and licence level must match.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the RMI addresses (then no gateway check and no management to the Standby). Putting the RMI addresses in another subnet than the wireless management VLAN. Expecting to configure the Standby directly. Believing a pair doubles capacity. Running different software versions on the two units.</p></div>

<div class="exam"><p><b>Exam trap.</b> RP is the <b>state and heartbeat</b> link; RMI is the <b>management and gateway-check</b> address. They are different. Also, SSO preserves authenticated clients and APs in Run state, but not clients still authenticating, and it does not protect against loss of the whole site.</p></div>

<div class="scn"><h4>The split that did not happen</h4><p>A distribution switch uplink to the Active controller failed but the RP link between the controllers stayed healthy. Without a gateway check, both units would have believed all was well while users lost the network. Because the RMI gateway check was configured, the Active detected "lost GW", the Standby (which could still reach its gateway) took over, and service resumed within seconds. The logs showed Active lost GW as the switchover reason.</p><p><b>Lesson:</b> RP shows the units are alive to each other; RMI shows they are alive to the network. You need both.</p></div>

<div class="iv"><p class="q">"What is the difference between RP and RMI in a 9800 HA SSO pair?"</p><p>RP is the dedicated Layer 2 link for heartbeats and state synchronisation between chassis. RMI is an IP address per unit on the wireless management VLAN, used for management access to each unit and for gateway reachability checks; a unit that loses its gateway can trigger a switchover. Add that the pair shares one management IP and one mobility MAC, and that SSO keeps APs in Run state and authenticated clients associated.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA SSO makes two identical controllers one logical unit: Active and Standby-Hot.</li>
<li>AP SSO and client SSO keep APs joined and authenticated clients associated through a switchover.</li>
<li>RP = state and heartbeat link; RMI = management address plus gateway check.</li>
<li>The pair shares one management IP and mobility MAC; capacity is that of one controller.</li>
<li>No preemption; verify with show redundancy (STANDBY HOT) and show chassis rmi.</li>
<li>HA SSO is concept only in the simulator; it does not protect against site loss.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Concept only.</b> Simulator mein <code>redundancy</code> mode, RP ya RMI ports, <code>show chassis</code> aur switchover nahi hain. Yeh chapter reading material hai, asli command forms aur sample output ke saath, taaki aap kaam par aur ENWLSI aur ENWLSD blueprints mein HA SSO configure aur explain kar sakein. Neeche ka output representative hai; aapki release mein detail alag ho sakti hai.</p></div>

<h3>Do controllers, ek identity</h3>
<p>AP failover (chapter 8) <b>service</b> bachata hai lekin <b>sessions</b> nahi: APs re-join karte hain, clients re-associate karte hain, addresses badal sakte hain. Kai networks, khaas kar hospitals aur factories, ise accept nahi kar sakte. <b>High Availability Stateful Switchover (HA SSO)</b> do controllers ko ek logical unit mein jodta hai. Ek <b>Active</b> hai. Doosra <b>Standby-Hot</b> hai: woh lagatar Active unit ki state ki copy receive karta hai aur Active fail hone par seconds mein takeover karta hai.</p>
<p>Pilot aur co-pilot socho. Dono jahaz udate hain is matlab mein ki dono ko route, altitude aur radio frequencies pata hain. Control sirf pilot ke haath mein hai. Pilot incapacitated ho jaaye to co-pilot passengers se utarne aur dobara chadhne ko kehe bina aage chalata hai.</p>

<h3>Kya synchronise hota hai</h3>
<ul>
<li><b>Configuration</b>: Active unit ka running aur startup configuration Standby par mirror hota hai. Aap sirf Active unit configure karte ho.</li>
<li><b>AP SSO</b>: Run state ke har AP ki CAPWAP state. Switchover ke baad APs joined rehte hain aur discovery mein nahi jaate.</li>
<li><b>Client SSO</b>: un clients ki state jinhone association aur authentication complete kar liya. Woh apna session rakhte hain aur re-associate <b>nahi</b> karte. Failure ke waqt authentication ya web authentication ke beech wale clients ko dobara shuru karna padta hai.</li>
<li><b>Mobility identity</b>: pair apne peers ko <b>ek mobility MAC aur ek management IP</b> dikhata hai, isliye mobility peers aur anchors ek controller dekhte hain aur tunnels rakhte hain.</li>
</ul>
<p>Jo copy nahi hota: Standby ka console aur CLI configuration ke liye available nahi hota; woh mirror ki tarah chalta hai. Dono controllers same model, same software image aur same license level ke hone chahiye.</p>

<h3>Do links: RP aur RMI</h3>
<dl class="terms">
<dt>RP (redundancy port)</dt><dd>Dono controllers ke beech dedicated Layer 2 link (9800-40, 9800-80 aur 9800-L appliances par physical RP port; 9800-CL virtual controllers par dedicated interface aur VLAN). Isme heartbeats aur state synchronisation jaata hai. Ise chhota, direct aur isolated rakho; deployment guide units ke beech maximum round-trip time deta hai.</dd>
<dt>RMI (redundancy management interface)</dt><dd>Har unit ke liye <b>wireless management VLAN</b> par ek extra IP address. Isse aap har unit ko management (SSH, SNMP, syslog) ke liye reach kar sakte ho, aur har unit ise <b>default gateway ko ping</b> karne ke liye use karta hai. Gateway check unit ko batata hai ki woh abhi bhi baaki network tak pahunch sakta hai ya nahi.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HA SSO pair">
<rect x="30" y="40" width="200" height="90" rx="10" fill="#bbf7d0"/><text x="130" y="68" text-anchor="middle" class="svg-ink" font-size="14">Chassis 1: Active</text><text x="130" y="90" text-anchor="middle" class="svg-ink" font-size="12">priority 2</text><text x="130" y="110" text-anchor="middle" class="svg-ink" font-size="12">RMI 10.10.99.11</text>
<rect x="410" y="40" width="200" height="90" rx="10" fill="#fde68a"/><text x="510" y="68" text-anchor="middle" class="svg-ink" font-size="14">Chassis 2: Standby-Hot</text><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="12">priority 1</text><text x="510" y="110" text-anchor="middle" class="svg-ink" font-size="12">RMI 10.10.99.12</text>
<line x1="230" y1="85" x2="410" y2="85" stroke="#7c3aed" stroke-width="4"/><text x="320" y="76" text-anchor="middle" class="svg-accent" font-size="12">RP link: state sync + heartbeat</text>
<rect x="215" y="170" width="210" height="40" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Shared management IP 10.10.99.10</text>
<line x1="130" y1="130" x2="260" y2="170" stroke="#64748b"/><line x1="510" y1="130" x2="380" y2="170" stroke="#64748b"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Dono RMI gateway ko bhi ping karte hain; APs aur peers ek controller dekhte hain.</text>
</svg><p class="cap">HA SSO pair: Active aur Standby-Hot, beech mein RP, har ek ka RMI address, bahar ke liye ek management IP aur ek mobility identity.</p></div>

<h3>Configuration outline</h3>
<p>Yeh command forms Catalyst 9800 high availability guide ke hain; production controller par type karne se pehle apni release aur platform ke liye guide check karo.</p>
<pre class="code"><span class="c">! chassis 1 (preferred Active banega)</span>
redundancy
 mode sso
exit
chassis 1 priority 2
redun-management interface Vlan99 chassis 1 address 10.10.99.11 chassis 2 address 10.10.99.12
<span class="c">! sirf 9800-CL: RP link ke liye use hone wala interface</span>
chassis redundancy ha-interface GigabitEthernet3

<span class="c">! chassis 2: pehle renumber (unit reload hota hai), phir wahi redundancy settings</span>
chassis 1 renumber 2</pre>
<p>RP ports wale appliances par RP cable lagate ho aur dono units par wahi RMI line set karte ho, phir unhe pair banane dete ho. Active priority se chuna jaata hai (higher priority value jeetta hai), phir tie-breaker ke taur par MAC address. <b>Preemption nahi hai</b>: failed unit wapas aaye to Standby ban kar aati hai.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show chassis rmi
Chassis#   Role      Mac Address      Priority  State   IP              RMI-IP
*1         Active    0050.568d.cdf4   2         Ready   169.254.99.11   10.10.99.11
 2         Standby   0050.568d.2a93   1         Ready   169.254.99.12   10.10.99.12

WLC1# show redundancy
Operating Redundancy Mode = sso
Switchovers system experienced = 0
<span class="hl">Current Software state = ACTIVE</span>
Peer Processor Information :
<span class="hl">Current Software state = STANDBY HOT</span></pre>
<p>Dekhne wali line <code>STANDBY HOT</code> hai. Kuch aur (jaise Standby bulk-sync in progress) ka matlab Standby abhi takeover ke liye ready nahi. Pair test karne ke liye window schedule karo aur Active par <code>redundancy force-switchover</code> chalao; <code>show redundancy switchover history</code> phir reason list karta hai (jaise "user forced"). Apne aap hone wala switchover aise reasons dikhata hai jaise <b>Active lost GW</b> (Active unit RMI ke zariye apne gateway tak nahi pahunch paaya) ya RP keepalive failure.</p>
<p>RP keepalive tunable hai (<code>chassis redundancy keep-alive timer</code> aur <code>retries</code>) virtual controllers ke liye jahan scheduling delays false failures kara sakte hain. Defaults appliances par failure ko ek second se bhi kam mein detect karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital ki 9800-80 controllers ki pair 600 APs aur 4000 clients serve karti hai. Active unit ka ek power supply fail ho jaata hai. Standby RP par heartbeat ka loss detect karta hai, kuch seconds mein Active ban jaata hai, aur saare 600 APs ko Run state mein rakhta hai. Phones aur tablets ke users ko koi re-association notice nahi hota kyunki client SSO ne unke sessions bacha liye. Sirf woh clients jo usi second web authentication ke beech the unhe dobara login karna pada.</p></div>

<h3>Yaad rakhne wali limits</h3>
<ul>
<li>HA SSO <b>controller</b> failure se bachata hai, <b>site</b> failure se nahi: pair saath baithta hai (RP chhota aur Layer 2 hota hai). Site disaster ke liye doosre site par doosri pair ya N+1 chahiye (chapter 10).</li>
<li>Capacity ke liye pair <b>ek controller</b> gini jaati hai: pair par 600 APs matlab 600 APs hi hain, 1200 nahi.</li>
<li>Dono units saath upgrade hote hain, aur software aur licence level match hona chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> RMI addresses bhool jaana (tab gateway check nahi aur Standby tak management nahi). RMI addresses ko wireless management VLAN se alag subnet mein rakhna. Standby ko seedha configure karne ki ummeed. Pair se capacity double hone ka bharosa. Dono units par alag software versions chalana.</p></div>

<div class="exam"><p><b>Exam trap.</b> RP <b>state aur heartbeat</b> link hai; RMI <b>management aur gateway-check</b> address hai. Dono alag hain. Saath hi, SSO Run state ke APs aur authenticated clients bachata hai, lekin abhi authenticate ho rahe clients ko nahi, aur poori site ke loss se protect nahi karta.</p></div>

<div class="scn"><h4>Woh split jo hua nahi</h4><p>Distribution switch ka Active controller wala uplink fail hua lekin controllers ke beech RP link healthy raha. Gateway check ke bina dono units ko laga rehta ki sab theek hai jabki users network kho dete. Kyunki RMI gateway check configured tha, Active ne "lost GW" detect kiya, Standby (jo abhi bhi apne gateway tak pahunch sakta tha) ne takeover kiya, aur service seconds mein wapas aa gayi. Logs mein switchover reason Active lost GW tha.</p><p><b>Lesson:</b> RP dikhata hai ki units ek doosre ke liye zinda hain; RMI dikhata hai ki woh network ke liye zinda hain. Dono chahiye.</p></div>

<div class="iv"><p class="q">"9800 HA SSO pair mein RP aur RMI mein kya farak hai?"</p><p>RP chassis ke beech heartbeats aur state synchronisation ke liye dedicated Layer 2 link hai. RMI wireless management VLAN par har unit ka IP address hai, jo har unit tak management access aur gateway reachability checks ke liye use hota hai; jo unit gateway kho de woh switchover trigger kar sakti hai. Jodo ki pair ek management IP aur ek mobility MAC share karti hai, aur SSO APs ko Run state mein aur authenticated clients ko associated rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA SSO do identical controllers ko ek logical unit banata hai: Active aur Standby-Hot.</li>
<li>AP SSO aur client SSO switchover ke dauran APs ko joined aur authenticated clients ko associated rakhte hain.</li>
<li>RP = state aur heartbeat link; RMI = management address plus gateway check.</li>
<li>Pair ek management IP aur mobility MAC share karti hai; capacity ek controller jitni hai.</li>
<li>Preemption nahi; show redundancy (STANDBY HOT) aur show chassis rmi se verify karo.</li>
<li>HA SSO simulator mein concept only hai; yeh site loss se nahi bachata.</li>
</ul></div>
`}};export{e as default};