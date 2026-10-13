var e={id:`configure`,h:{en:`Configuring an active/standby pair step by step`,hi:`Active/standby pair ko step by step configure karna`},body:{en:`
<p>Hiring a new co-pilot follows a fixed order: the captain is already flying, the new co-pilot is given only a badge and a radio frequency, then sits down, listens and copies the flight plan from the captain. You never ask the new co-pilot to write their own flight plan. ASA failover is built in the same order: first prepare the unit that already carries traffic, then give the new unit just enough to find its mate, and let replication do the rest. This chapter is the walkthrough of lab 1.</p>

<h3>The plan for lab 1</h3>
<table class="cmp"><tr><th>Item</th><th>ASA1 (primary)</th><th>ASA2 (secondary)</th></tr>
<tr><td>outside Gi0/0</td><td>203.0.113.2 (active address)</td><td>203.0.113.3 (standby address)</td></tr>
<tr><td>inside Gi0/1</td><td>10.0.1.1 (active address)</td><td>10.0.1.2 (standby address)</td></tr>
<tr><td>FOLINK Gi0/5</td><td>192.168.255.1/30</td><td>192.168.255.2/30</td></tr>
<tr><td>STATELINK Gi0/4</td><td>192.168.254.1/30</td><td>192.168.254.2/30</td></tr>
<tr><td>Key</td><td colspan="2">NKfo2026 on both</td></tr></table>

<h3>Step 1: standby addresses on the primary's data interfaces</h3>
<p>ASA1 already runs the internet edge (interfaces, default route, PAT). Re-enter each <code>ip address</code> command with the <code>standby</code> keyword. This does not interrupt traffic: the active address stays the same.</p>
<pre class="code">NK-ASA(config)# interface GigabitEthernet0/0
NK-ASA(config-if)# ip address 203.0.113.2 255.255.255.248 standby 203.0.113.3
NK-ASA(config-if)# interface GigabitEthernet0/1
NK-ASA(config-if)# ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2
NK-ASA(config-if)# exit</pre>

<h3>Step 2: failover commands on the primary</h3>
<pre class="code"><span class="c">! failover interfaces only need to be enabled: no nameif, no ip address</span>
interface GigabitEthernet0/5
 no shutdown
interface GigabitEthernet0/4
 no shutdown
<span class="c">! fixed role of this unit</span>
failover lan unit primary
<span class="c">! the failover (LAN) link and its addresses: first = primary, standby = secondary</span>
failover lan interface FOLINK GigabitEthernet0/5
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
<span class="c">! a dedicated stateful link</span>
failover link STATELINK GigabitEthernet0/4
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
<span class="c">! authenticate and encrypt failover messages</span>
failover key NKfo2026
<span class="c">! turn failover on</span>
failover</pre>
<p>Alone, the primary enters <b>Negotiation</b>, waits one unit holdtime (15 seconds by default) for a mate, hears nothing and becomes <b>Active</b> with the reason "No Active unit found". Traffic keeps flowing the whole time because the addresses never changed.</p>
<pre class="out">NK-ASA# show failover | include host
	<span class="hl">This host: Primary - Active</span>
	Other host: Secondary - Not Detected</pre>

<h3>Step 3: bootstrap the secondary</h3>
<p>On ASA2 (factory state, empty enable password) configure <b>only</b> the failover commands. They are the same as on the primary except the unit role. The <code>failover interface ip</code> lines are <b>identical</b>, because the first address always belongs to the primary.</p>
<pre class="code">ciscoasa&gt; enable
Password:
ciscoasa# configure terminal
ciscoasa(config)# interface GigabitEthernet0/5
ciscoasa(config-if)# no shutdown
ciscoasa(config-if)# interface GigabitEthernet0/4
ciscoasa(config-if)# no shutdown
ciscoasa(config-if)# exit
ciscoasa(config)# failover lan unit secondary
ciscoasa(config)# failover lan interface FOLINK GigabitEthernet0/5
ciscoasa(config)# failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
ciscoasa(config)# failover link STATELINK GigabitEthernet0/4
ciscoasa(config)# failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
ciscoasa(config)# failover key NKfo2026
ciscoasa(config)# failover</pre>
<p>Within a few seconds the secondary hears the primary's hellos and the console shows:</p>
<pre class="out">        <span class="hl">Detected an Active mate</span>
Beginning configuration replication from mate.
End configuration replication from mate.

NK-ASA#</pre>
<p>Notice the prompt: ASA2 is now called <b>NK-ASA</b>, because it received ASA1's entire running configuration, hostname included. The primary logs <code>%ASA-1-709003 (Primary) Beginning configuration replication: Sending to mate.</code> and the secondary <code>%ASA-1-709005 ... Receiving from mate.</code> followed by 709004/709006 at the end.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pair formation timeline">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="100" r="7" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA1: failover</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="12">Negotiation</text>
<circle cx="200" cy="100" r="7" fill="#bae6fd"/><text x="200" y="80" text-anchor="middle" class="svg-ink" font-size="12">+15 s</text><text x="200" y="125" text-anchor="middle" class="svg-muted" font-size="12">ASA1 Active</text>
<circle cx="330" cy="100" r="7" fill="#ddd6fe"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA2: failover</text><text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">Detected Active mate</text>
<circle cx="450" cy="100" r="7" fill="#ddd6fe"/><text x="450" y="80" text-anchor="middle" class="svg-ink" font-size="12">config sync</text><text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">Sync Config, Bulk Sync</text>
<circle cx="570" cy="100" r="7" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="12">pair formed</text><text x="570" y="125" text-anchor="middle" class="svg-accent" font-size="12">Standby Ready</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">Traffic never stops: ASA1 keeps the active addresses throughout</text>
</svg><p class="cap">Forming the pair: the primary becomes active alone, then the secondary joins, syncs and becomes Standby Ready.</p></div>

<h3>Step 4: verify and save</h3>
<pre class="out">NK-ASA# show failover | include host|Link
Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)
	<span class="hl">This host: Primary - Active</span>
	<span class="hl">Other host: Secondary - Standby Ready</span>
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span></pre>
<p>From now on, <b>configure only the active unit</b>. Every command is replicated immediately. <code>write memory</code> on the active unit is also replicated, so both units save their configuration; <code>write standby</code> forces a full configuration copy to the standby if you suspect it is out of sync.</p>
<pre class="out">NK-ASA# write memory
Building configuration...
Cryptochecksum: 3f2a9c1e 7b4d5e6f 8a9b0c1d 2e3f4a5b
[OK]</pre>

<h3>Quality-of-life commands</h3>
<ul>
<li><code>prompt hostname priority state</code>: the prompt becomes <code>NK-ASA/pri/act#</code> or <code>NK-ASA/sec/stby#</code>, so you never configure the wrong box.</li>
<li><code>failover exec mate show conn</code>: run a show command on the other unit without logging in to it. <code>failover exec standby</code> and <code>failover exec active</code> also exist.</li>
<li>If you type <code>configure terminal</code> on the standby, the ASA warns: <code>**** WARNING **** Configuration Replication is NOT performed from Standby unit to Active unit. Configurations are no longer synchronized.</code></li>
</ul>

<div class="eg"><p><b>Worked example.</b> Why does lab 1 task 4 expect the answer 10.0.1.2? ASA2 received the line <code>ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2</code>. Its role is secondary and its state is Standby Ready, so it uses the standby address. <code>show ip</code> on ASA2 lists 10.0.1.1 under System IP Addresses and <b>10.0.1.2</b> under Current IP Addresses.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the whole firewall policy on both units "to be safe". When the secondary joins, its configuration is overwritten by the active one anyway, and until then two units with the same addresses may fight on the network. Bootstrap the secondary with failover commands only.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <code>failover interface ip</code> line is the same on both units. A question that shows the secondary configured with 192.168.255.2 as the first address and .1 as standby describes a misconfiguration, not a valid pair.</p></div>

<div class="scn"><h4>The pair that erased the new policy</h4><p>An engineer added a new DMZ rule on the unit he was logged in to, then saved and went home. The next morning the rule had vanished. His session had been on the standby unit: the ASA had printed the replication warning, the change existed only on the standby, and during the night a <code>write standby</code> from a colleague's automation copied the active configuration over it. The fix was to re-enter the rule on the active unit and to add <code>prompt hostname priority state</code> to the template.</p><p><b>Lesson:</b> always check the prompt or <code>show failover</code> before configuring; changes belong on the active unit.</p></div>

<div class="iv"><p class="q">"Walk me through adding a second ASA to an existing production ASA without downtime."</p><p>Strong answer: add standby addresses to all data interfaces on the running unit, enable the failover and state interfaces, configure it as primary with the failover link, state link, addresses and key, and enable failover; it becomes active after the holdtime without changing addresses. Then on the new unit configure only the bootstrap failover commands as secondary with identical addresses and key, enable failover, and it detects the active mate, receives the configuration and becomes Standby Ready. Verify with <code>show failover</code>, save with <code>write memory</code> on the active unit, and configure only the active unit afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Primary first: standby addresses, enable Gi0/5 and Gi0/4, failover commands, <code>failover</code>.</li>
<li>Secondary: bootstrap failover commands only, with <code>failover lan unit secondary</code> and identical addresses and key.</li>
<li>The secondary prints "Detected an Active mate" and receives the full configuration, hostname included.</li>
<li>Configure and <code>write memory</code> only on the active unit; changes on the standby are not replicated.</li>
<li><code>prompt hostname priority state</code> and <code>failover exec mate</code> make daily operation safer.</li>
</ul></div>
`,hi:`
<p>Naye co-pilot ki hiring ek fixed order mein hoti hai: captain pehle se uda raha hai, naye co-pilot ko sirf ek badge aur radio frequency di jaati hai, phir woh baithta hai, sunta hai aur captain se flight plan copy karta hai. Aap naye co-pilot se kabhi apna flight plan likhne ko nahi kehte. ASA failover isi order mein banta hai: pehle us unit ko taiyaar karo jo pehle se traffic le ja raha hai, phir naye unit ko bas itna do ki woh apna mate dhoondh sake, aur baaki replication ko karne do. Yeh chapter lab 1 ka walkthrough hai.</p>

<h3>Lab 1 ka plan</h3>
<table class="cmp"><tr><th>Item</th><th>ASA1 (primary)</th><th>ASA2 (secondary)</th></tr>
<tr><td>outside Gi0/0</td><td>203.0.113.2 (active address)</td><td>203.0.113.3 (standby address)</td></tr>
<tr><td>inside Gi0/1</td><td>10.0.1.1 (active address)</td><td>10.0.1.2 (standby address)</td></tr>
<tr><td>FOLINK Gi0/5</td><td>192.168.255.1/30</td><td>192.168.255.2/30</td></tr>
<tr><td>STATELINK Gi0/4</td><td>192.168.254.1/30</td><td>192.168.254.2/30</td></tr>
<tr><td>Key</td><td colspan="2">dono par NKfo2026</td></tr></table>

<h3>Step 1: primary ke data interfaces par standby addresses</h3>
<p>ASA1 pehle se internet edge chala raha hai (interfaces, default route, PAT). Har <code>ip address</code> command ko <code>standby</code> keyword ke saath dobara daalo. Isse traffic nahi rukta: active address wahi rehta hai.</p>
<pre class="code">NK-ASA(config)# interface GigabitEthernet0/0
NK-ASA(config-if)# ip address 203.0.113.2 255.255.255.248 standby 203.0.113.3
NK-ASA(config-if)# interface GigabitEthernet0/1
NK-ASA(config-if)# ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2
NK-ASA(config-if)# exit</pre>

<h3>Step 2: primary par failover commands</h3>
<pre class="code"><span class="c">! failover interfaces ko sirf enable karna hai: na nameif, na ip address</span>
interface GigabitEthernet0/5
 no shutdown
interface GigabitEthernet0/4
 no shutdown
<span class="c">! is unit ka fixed role</span>
failover lan unit primary
<span class="c">! failover (LAN) link aur uske addresses: pehla = primary, standby = secondary</span>
failover lan interface FOLINK GigabitEthernet0/5
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
<span class="c">! dedicated stateful link</span>
failover link STATELINK GigabitEthernet0/4
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
<span class="c">! failover messages authenticate aur encrypt karo</span>
failover key NKfo2026
<span class="c">! failover on karo</span>
failover</pre>
<p>Akela primary <b>Negotiation</b> mein jaata hai, mate ke liye ek unit holdtime (default 15 second) intezaar karta hai, kuch nahi sunta aur "No Active unit found" reason ke saath <b>Active</b> ban jaata hai. Poore samay traffic chalta rehta hai kyunki addresses kabhi nahi badle.</p>
<pre class="out">NK-ASA# show failover | include host
	<span class="hl">This host: Primary - Active</span>
	Other host: Secondary - Not Detected</pre>

<h3>Step 3: secondary ko bootstrap karo</h3>
<p>ASA2 par (factory state, khaali enable password) <b>sirf</b> failover commands configure karo. Yeh primary jaise hi hain, bas unit role alag hai. <code>failover interface ip</code> lines <b>identical</b> hain, kyunki pehla address hamesha primary ka hota hai.</p>
<pre class="code">ciscoasa&gt; enable
Password:
ciscoasa# configure terminal
ciscoasa(config)# interface GigabitEthernet0/5
ciscoasa(config-if)# no shutdown
ciscoasa(config-if)# interface GigabitEthernet0/4
ciscoasa(config-if)# no shutdown
ciscoasa(config-if)# exit
ciscoasa(config)# failover lan unit secondary
ciscoasa(config)# failover lan interface FOLINK GigabitEthernet0/5
ciscoasa(config)# failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
ciscoasa(config)# failover link STATELINK GigabitEthernet0/4
ciscoasa(config)# failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
ciscoasa(config)# failover key NKfo2026
ciscoasa(config)# failover</pre>
<p>Kuch seconds mein secondary primary ke hellos sunta hai aur console dikhata hai:</p>
<pre class="out">        <span class="hl">Detected an Active mate</span>
Beginning configuration replication from mate.
End configuration replication from mate.

NK-ASA#</pre>
<p>Prompt dekho: ASA2 ab <b>NK-ASA</b> kehlata hai, kyunki use ASA1 ki poori running configuration mili, hostname ke saath. Primary <code>%ASA-1-709003 (Primary) Beginning configuration replication: Sending to mate.</code> log karta hai aur secondary <code>%ASA-1-709005 ... Receiving from mate.</code>, aur end mein 709004/709006.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pair formation timeline">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="100" r="7" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA1: failover</text><text x="70" y="125" text-anchor="middle" class="svg-muted" font-size="12">Negotiation</text>
<circle cx="200" cy="100" r="7" fill="#bae6fd"/><text x="200" y="80" text-anchor="middle" class="svg-ink" font-size="12">+15 s</text><text x="200" y="125" text-anchor="middle" class="svg-muted" font-size="12">ASA1 Active</text>
<circle cx="330" cy="100" r="7" fill="#ddd6fe"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">ASA2: failover</text><text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">Active mate mila</text>
<circle cx="450" cy="100" r="7" fill="#ddd6fe"/><text x="450" y="80" text-anchor="middle" class="svg-ink" font-size="12">config sync</text><text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">Sync Config, Bulk Sync</text>
<circle cx="570" cy="100" r="7" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="12">pair ban gaya</text><text x="570" y="125" text-anchor="middle" class="svg-accent" font-size="12">Standby Ready</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">Traffic kabhi nahi rukta: ASA1 poore samay active addresses rakhta hai</text>
</svg><p class="cap">Pair banana: primary akela active banta hai, phir secondary judta hai, sync karta hai aur Standby Ready banta hai.</p></div>

<h3>Step 4: verify aur save</h3>
<pre class="out">NK-ASA# show failover | include host|Link
Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)
	<span class="hl">This host: Primary - Active</span>
	<span class="hl">Other host: Secondary - Standby Ready</span>
	<span class="hl">Link : STATELINK GigabitEthernet0/4 (up)</span></pre>
<p>Ab se <b>sirf active unit configure karo</b>. Har command turant replicate hoti hai. Active unit par <code>write memory</code> bhi replicate hota hai, isliye dono units apni configuration save karte hain; agar shak ho ki standby out of sync hai to <code>write standby</code> standby ko poori configuration copy force karta hai.</p>
<pre class="out">NK-ASA# write memory
Building configuration...
Cryptochecksum: 3f2a9c1e 7b4d5e6f 8a9b0c1d 2e3f4a5b
[OK]</pre>

<h3>Kaam aasaan karne wali commands</h3>
<ul>
<li><code>prompt hostname priority state</code>: prompt <code>NK-ASA/pri/act#</code> ya <code>NK-ASA/sec/stby#</code> ban jaata hai, taaki aap kabhi galat box configure na karo.</li>
<li><code>failover exec mate show conn</code>: doosre unit par login kiye bina us par show command chalao. <code>failover exec standby</code> aur <code>failover exec active</code> bhi hain.</li>
<li>Agar aap standby par <code>configure terminal</code> type karo, ASA warning deta hai: <code>**** WARNING **** Configuration Replication is NOT performed from Standby unit to Active unit. Configurations are no longer synchronized.</code></li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab 1 task 4 jawab 10.0.1.2 kyun expect karta hai? ASA2 ko line <code>ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2</code> mili. Uska role secondary hai aur state Standby Ready, isliye woh standby address use karta hai. ASA2 par <code>show ip</code> System IP Addresses ke neeche 10.0.1.1 aur Current IP Addresses ke neeche <b>10.0.1.2</b> dikhata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Safe rehne ke liye" poori firewall policy dono units par configure karna. Secondary judne par uski configuration waise bhi active wali se overwrite ho jaati hai, aur tab tak same addresses wale do units network par lad sakte hain. Secondary ko sirf failover commands se bootstrap karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>failover interface ip</code> line dono units par same hoti hai. Agar question mein secondary par pehla address 192.168.255.2 aur standby .1 configure dikhe, to yeh misconfiguration hai, valid pair nahi.</p></div>

<div class="scn"><h4>Woh pair jisne nayi policy mita di</h4><p>Ek engineer ne jis unit par login tha us par naya DMZ rule joda, phir save karke ghar chala gaya. Agli subah rule gayab tha. Uska session standby unit par tha: ASA ne replication warning print ki thi, change sirf standby par tha, aur raat mein ek colleague ki automation ke <code>write standby</code> ne active configuration uske upar copy kar di. Fix tha active unit par rule dobara daalna aur template mein <code>prompt hostname priority state</code> jodna.</p><p><b>Seekh:</b> configure karne se pehle hamesha prompt ya <code>show failover</code> check karo; changes active unit par hote hain.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki ek existing production ASA mein bina downtime ke doosra ASA kaise jodoge."</p><p>Strong answer: chal rahe unit par saare data interfaces mein standby addresses jodo, failover aur state interfaces enable karo, ise failover link, state link, addresses aur key ke saath primary configure karo, aur failover enable karo; holdtime ke baad yeh bina addresses badle active ban jaata hai. Phir naye unit par identical addresses aur key ke saath secondary ki tarah sirf bootstrap failover commands configure karo, failover enable karo, aur woh active mate detect karke configuration receive karta hai aur Standby Ready banta hai. <code>show failover</code> se verify karo, active unit par <code>write memory</code> se save karo, aur uske baad sirf active unit configure karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle primary: standby addresses, Gi0/5 aur Gi0/4 enable, failover commands, <code>failover</code>.</li>
<li>Secondary: sirf bootstrap failover commands, <code>failover lan unit secondary</code> aur identical addresses aur key ke saath.</li>
<li>Secondary "Detected an Active mate" print karta hai aur poori configuration receive karta hai, hostname bhi.</li>
<li>Configure aur <code>write memory</code> sirf active unit par; standby ke changes replicate nahi hote.</li>
<li><code>prompt hostname priority state</code> aur <code>failover exec mate</code> roz ke operation ko safe banate hain.</li>
</ul></div>
`}};export{e as default};