var e={id:`triggers`,h:{en:`Failover triggers and events: what makes the standby take over`,hi:`Failover triggers aur events: standby kab take over karta hai`},body:{en:`
<p>A fire alarm system has clear rules. Smoke in a room triggers the alarm; a technician pressing the test button triggers it on purpose; a broken detector cable does <b>not</b> evacuate the building, it raises a fault light so someone fixes it. ASA failover has the same kind of rulebook: some events cause a switchover, some only mark something as failed, and one or two cause dangerous situations you must design against. This chapter is that rulebook, with the logs you see in labs 2 and 4.</p>

<h3>The three families of triggers</h3>
<ol>
<li><b>The active unit stops being a unit</b>: power loss, hardware fault, software crash, reload. Hellos stop on every interface, the holdtime expires and the standby takes over with reason <code>HELLO not heard from mate</code>. This is lab 2.</li>
<li><b>The active unit loses its view of the network</b>: monitored interfaces fail on the active unit, the number reaches the interface policy and the standby is healthier. The active unit marks itself Failed with reason <code>Interface check</code> and the standby takes over. This is lab 4.</li>
<li><b>An administrator asks for it</b>: <code>no failover active</code> on the active unit, or <code>failover active</code> on the standby. Used for maintenance and failback (chapter 10).</li>
</ol>
<p>Other conditions can also count as unit failures, for example a failed hardware or service module on some platforms, and, on Threat Defense, health problems such as the Snort inspection engine being down (chapter 11).</p>

<h3>The failover events table</h3>
<table class="cmp"><tr><th>Event</th><th>Does the pair fail over?</th><th>What happens</th></tr>
<tr><td>Active unit fails (power, hardware, crash)</td><td><b>Yes</b></td><td>Standby becomes active; the failed unit is shown as Failed</td></tr>
<tr><td>Failed unit recovers</td><td>No</td><td>It rejoins as Standby Ready; there is no preemption</td></tr>
<tr><td>Standby unit fails</td><td>No</td><td>Active marks its mate Failed; no protection until the standby is repaired</td></tr>
<tr><td>Failover link fails while running</td><td>No</td><td>Both units mark the failover link failed and keep their states (they still hear each other on data interfaces); failover cannot happen until the link is restored</td></tr>
<tr><td>Failover link down when the units boot</td><td>Both become active</td><td>Split brain: neither hears the other at startup; fix the link immediately</td></tr>
<tr><td>State link fails</td><td>No</td><td>State updates stop; if a failover happens later, sessions are lost</td></tr>
<tr><td>Monitored interface fails on the active unit, policy reached</td><td><b>Yes</b></td><td>Active marks itself Failed (Interface check); standby becomes active</td></tr>
<tr><td>Monitored interface fails on the standby unit</td><td>No</td><td>Standby marks itself Failed; it cannot take over until fixed</td></tr>
<tr><td>Same interface fails on both units</td><td>No</td><td>Neither unit is healthier, so a switchover would not help</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Failover decision flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Something failed</text>
<line x1="320" y1="50" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="70" width="260" height="40" rx="8" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">On the active unit?</text>
<line x1="190" y1="90" x2="100" y2="140" stroke="#64748b" stroke-width="2"/><text x="120" y="112" class="svg-muted" font-size="12">no</text>
<rect x="20" y="140" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="162" text-anchor="middle" class="svg-ink" font-size="12">no failover;</text><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">standby or link marked failed</text>
<line x1="450" y1="90" x2="530" y2="140" stroke="#64748b" stroke-width="2"/><text x="505" y="112" class="svg-muted" font-size="12">yes</text>
<rect x="440" y="140" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="162" text-anchor="middle" class="svg-ink" font-size="12">unit dead, or policy</text><text x="535" y="180" text-anchor="middle" class="svg-ink" font-size="12">reached and mate healthier?</text>
<line x1="535" y1="190" x2="535" y2="210" stroke="#64748b" stroke-width="2"/>
<rect x="410" y="210" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="520" y="235" text-anchor="middle" class="svg-accent" font-size="13">yes: standby becomes Active</text>
<line x1="440" y1="165" x2="300" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<rect x="190" y="210" width="190" height="40" rx="8" fill="#e2e8f0"/><text x="285" y="235" text-anchor="middle" class="svg-ink" font-size="12">no: stay, keep testing</text>
</svg><p class="cap">Only problems on the active unit move traffic, and only when the standby is in a better position.</p></div>

<h3>Lab 2: the active unit dies</h3>
<p>You reload ASA1 while PC1's SSH session is open. ASA2 stops hearing hellos everywhere. After the unit holdtime it logs:</p>
<pre class="out">%ASA-1-105005: (Secondary) Lost Failover communications with mate on interface FOLINK.
<span class="hl">%ASA-1-104001: (Secondary) Switching to ACTIVE - HELLO not heard from mate.</span></pre>
<p>ASA2 takes 203.0.113.2, 10.0.1.1 and the active MACs, sends gratuitous ARPs, and because the connection and xlate were replicated, <code>show clock</code> inside the SSH session still answers. <code>show failover history</code> on ASA2 shows the path through the active states:</p>
<pre class="out">NK-ASA# show failover history
==========================================================================
From State                 To State                   Reason
==========================================================================
10:14:02 UTC Sep 30 2026
<span class="hl">Standby Ready              Just Active                HELLO not heard from mate</span>

10:14:02 UTC Sep 30 2026
Just Active                Active Drain               HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Drain               Active Applying Config     HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Applying Config     Active Config Applied      HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Config Applied      Active                     HELLO not heard from mate
==========================================================================</pre>
<p>When ASA1 finishes booting it hears an active mate and walks through Cold Standby, Sync Config, Sync File System and Bulk Sync to <b>Standby Ready</b>: the answer to the last task of lab 2.</p>

<h3>Lab 4: the active unit loses its inside link</h3>
<p>You shut SW-IN Gi0/0, the port facing ASA1's inside interface. ASA1 sees inside as <code>No Link</code>, while ASA2's inside is Normal. One failed interface reaches policy 1, and the standby is healthier, so ASA1 marks itself Failed:</p>
<pre class="out">%ASA-1-104003: (Primary) Switching to FAILED.
%ASA-1-104001: (Secondary) Switching to ACTIVE - Interface check</pre>
<pre class="out">NK-ASA# show failover state

               State          Last Failure Reason      Date/Time
This host  -   Secondary
               Active         None
Other host -   Primary
               <span class="hl">Failed         Interface check          02:10:31 UTC Sep 30 2026</span>

====Configuration State===
	Sync Done
====Communication State===
	Mac set</pre>
<p>PC1 still pings 8.8.8.8, because ASA2 now owns 10.0.1.1. In the lab the switchover happens after the interface holdtime (about 25 seconds); on real hardware a link that goes physically down is usually detected faster because the link up/down test fails at once.</p>

<div class="eg"><p><b>Worked example: which unit is to blame?</b> <code>show failover state</code> shows <code>Other host - Primary / Failed / Interface check</code>. <code>show monitor-interface</code> on ASA2 shows <code>Interface inside (10.0.1.2): No Link (Monitored)</code> for the other host. Conclusion: the primary's inside path (its port, its cable, or the SW-IN port) failed. Nothing is wrong with ASA2, and nothing is wrong with the primary's hardware as such.</p></div>

<h3>Syslog IDs to know</h3>
<table class="cmp"><tr><th>ID</th><th>Meaning</th></tr>
<tr><td>104001</td><td>(unit) Switching to ACTIVE, with the reason</td></tr>
<tr><td>104002</td><td>(unit) Switching to STANDBY</td></tr>
<tr><td>104003 / 104004</td><td>(unit) Switching to FAILED / Switching to OK</td></tr>
<tr><td>105005</td><td>Lost Failover communications with mate on interface FOLINK</td></tr>
<tr><td>105008 / 105009</td><td>Testing interface ... / Testing on interface ... Passed or Failed</td></tr>
<tr><td>709003 to 709006</td><td>Configuration replication start and end, sending (active) and receiving (standby)</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Assuming a broken failover link will "just fail over". It does not: the pair stays as it is, but it has lost its ability to fail over. Alert on 105005 and on a failover link shown as down in <code>show failover</code>, and fix it like a priority incident.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failures on the <b>standby</b> never cause a switchover. And the one event that makes both units active is the failover link being down when the units start (or losing every communication path at once).</p></div>

<div class="scn"><h4>The failover link that nobody noticed</h4><p>A monitoring system only alarmed on 104001 (switch to active). For three weeks the failover cable between a pair had been damaged; both units showed the failover link as down, but they still heard each other on the data interfaces, so no alarm fired. Then the active unit's power supply failed. The standby could not learn the state in time through the broken path, customers lost sessions, and the post-incident review found 105005 messages starting three weeks earlier. The team added alerts for 105005 and for the failover link state.</p><p><b>Lesson:</b> a broken failover link is a silent loss of protection; monitor it.</p></div>

<div class="iv"><p class="q">"What triggers an ASA failover, and what does not?"</p><p>Strong answer: the active unit failing (hellos lost on all interfaces for the holdtime), monitored interface failures on the active unit reaching the interface policy while the standby is healthier, or a manual <code>no failover active</code> / <code>failover active</code>. Failures on the standby, a failover link failure while running, and a state link failure do not cause failover; they mark something failed and reduce protection. The dangerous case is the failover link down at startup, which makes both units active. Quote 104001 with its reason and 105005 as the logs you check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: active unit failure, interface failures on the active unit reaching the policy, manual commands.</li>
<li>Standby failures, failover link failure and state link failure do not cause a switchover.</li>
<li>Failover link down at startup can make both units active (split brain).</li>
<li>Lab 2 reason: <code>HELLO not heard from mate</code>; lab 4 reason: <code>Interface check</code>.</li>
<li>Watch 104001-104004, 105005, 105008/105009 and 709003-709006.</li>
</ul></div>
`,hi:`
<p>Fire alarm system ke clear rules hote hain. Kamre mein dhuaan alarm trigger karta hai; technician test button dabaye to jaan boojh kar trigger hota hai; detector ki tooti cable building ko evacuate <b>nahi</b> karati, woh fault light jalaati hai taaki koi use theek kare. ASA failover ki bhi aisi hi rulebook hai: kuch events switchover karate hain, kuch sirf kisi cheez ko failed mark karte hain, aur ek do khatarnak situations banate hain jinke khilaaf aapko design karna padta hai. Yeh chapter wahi rulebook hai, un logs ke saath jo aap labs 2 aur 4 mein dekhte ho.</p>

<h3>Triggers ki teen families</h3>
<ol>
<li><b>Active unit unit hi nahi rehta</b>: power loss, hardware fault, software crash, reload. Har interface par hellos ruk jaate hain, holdtime khatam hota hai aur standby <code>HELLO not heard from mate</code> reason ke saath take over karta hai. Yeh lab 2 hai.</li>
<li><b>Active unit network ka view kho deta hai</b>: active unit par monitored interfaces fail hote hain, number interface policy tak pahunchta hai aur standby zyada healthy hai. Active unit khud ko <code>Interface check</code> reason ke saath Failed mark karta hai aur standby take over karta hai. Yeh lab 4 hai.</li>
<li><b>Administrator maangta hai</b>: active unit par <code>no failover active</code>, ya standby par <code>failover active</code>. Maintenance aur failback ke liye use hota hai (chapter 10).</li>
</ol>
<p>Kuch aur conditions bhi unit failure gini ja sakti hain, jaise kuch platforms par fail hua hardware ya service module, aur Threat Defense par health problems jaise Snort inspection engine ka down hona (chapter 11).</p>

<h3>Failover events table</h3>
<table class="cmp"><tr><th>Event</th><th>Kya pair fail over karta hai?</th><th>Kya hota hai</th></tr>
<tr><td>Active unit fail (power, hardware, crash)</td><td><b>Haan</b></td><td>Standby active banta hai; failed unit Failed dikhta hai</td></tr>
<tr><td>Failed unit recover hota hai</td><td>Nahi</td><td>Woh Standby Ready ban kar judta hai; preemption nahi hai</td></tr>
<tr><td>Standby unit fail</td><td>Nahi</td><td>Active apne mate ko Failed mark karta hai; standby repair hone tak koi protection nahi</td></tr>
<tr><td>Chalte hue failover link fail</td><td>Nahi</td><td>Dono units failover link ko failed mark karte hain aur apni states rakhte hain (woh ab bhi data interfaces par ek doosre ko sunte hain); link restore hone tak failover nahi ho sakta</td></tr>
<tr><td>Units boot hote samay failover link down</td><td>Dono active ban jaate hain</td><td>Split brain: startup par koi doosre ko nahi sunta; link turant theek karo</td></tr>
<tr><td>State link fail</td><td>Nahi</td><td>State updates ruk jaate hain; baad mein failover hua to sessions kho jaate hain</td></tr>
<tr><td>Active unit par monitored interface fail, policy poori</td><td><b>Haan</b></td><td>Active khud ko Failed (Interface check) mark karta hai; standby active banta hai</td></tr>
<tr><td>Standby unit par monitored interface fail</td><td>Nahi</td><td>Standby khud ko Failed mark karta hai; theek hone tak take over nahi kar sakta</td></tr>
<tr><td>Dono units par same interface fail</td><td>Nahi</td><td>Koi unit zyada healthy nahi, isliye switchover se faayda nahi</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Failover decision flow">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Kuch fail hua</text>
<line x1="320" y1="50" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="70" width="260" height="40" rx="8" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Active unit par?</text>
<line x1="190" y1="90" x2="100" y2="140" stroke="#64748b" stroke-width="2"/><text x="120" y="112" class="svg-muted" font-size="12">nahi</text>
<rect x="20" y="140" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="162" text-anchor="middle" class="svg-ink" font-size="12">koi failover nahi;</text><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">standby ya link failed mark</text>
<line x1="450" y1="90" x2="530" y2="140" stroke="#64748b" stroke-width="2"/><text x="505" y="112" class="svg-muted" font-size="12">haan</text>
<rect x="440" y="140" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="162" text-anchor="middle" class="svg-ink" font-size="12">unit mara, ya policy poori</text><text x="535" y="180" text-anchor="middle" class="svg-ink" font-size="12">aur mate zyada healthy?</text>
<line x1="535" y1="190" x2="535" y2="210" stroke="#64748b" stroke-width="2"/>
<rect x="410" y="210" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="520" y="235" text-anchor="middle" class="svg-accent" font-size="13">haan: standby Active banta hai</text>
<line x1="440" y1="165" x2="300" y2="220" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<rect x="190" y="210" width="190" height="40" rx="8" fill="#e2e8f0"/><text x="285" y="235" text-anchor="middle" class="svg-ink" font-size="12">nahi: ruko, test karte raho</text>
</svg><p class="cap">Sirf active unit ki problems traffic move karti hain, aur tabhi jab standby behtar position mein ho.</p></div>

<h3>Lab 2: active unit mar jaata hai</h3>
<p>PC1 ka SSH session khula hai aur aap ASA1 reload karte ho. ASA2 ko har jagah hellos sunna band ho jaata hai. Unit holdtime ke baad woh log karta hai:</p>
<pre class="out">%ASA-1-105005: (Secondary) Lost Failover communications with mate on interface FOLINK.
<span class="hl">%ASA-1-104001: (Secondary) Switching to ACTIVE - HELLO not heard from mate.</span></pre>
<p>ASA2 203.0.113.2, 10.0.1.1 aur active MACs le leta hai, gratuitous ARPs bhejta hai, aur kyunki connection aur xlate replicate hue the, SSH session ke andar <code>show clock</code> ab bhi jawab deta hai. ASA2 par <code>show failover history</code> active states se guzarne ka raasta dikhata hai:</p>
<pre class="out">NK-ASA# show failover history
==========================================================================
From State                 To State                   Reason
==========================================================================
10:14:02 UTC Sep 30 2026
<span class="hl">Standby Ready              Just Active                HELLO not heard from mate</span>

10:14:02 UTC Sep 30 2026
Just Active                Active Drain               HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Drain               Active Applying Config     HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Applying Config     Active Config Applied      HELLO not heard from mate

10:14:02 UTC Sep 30 2026
Active Config Applied      Active                     HELLO not heard from mate
==========================================================================</pre>
<p>Jab ASA1 boot ho jaata hai, use ek active mate sunai deta hai aur woh Cold Standby, Sync Config, Sync File System aur Bulk Sync se hote hue <b>Standby Ready</b> tak jaata hai: lab 2 ke aakhri task ka jawab.</p>

<h3>Lab 4: active unit apna inside link kho deta hai</h3>
<p>Aap SW-IN Gi0/0 shut karte ho, jo port ASA1 ke inside interface ki taraf hai. ASA1 inside ko <code>No Link</code> dekhta hai, jabki ASA2 ka inside Normal hai. Ek failed interface policy 1 tak pahunchta hai, aur standby zyada healthy hai, isliye ASA1 khud ko Failed mark karta hai:</p>
<pre class="out">%ASA-1-104003: (Primary) Switching to FAILED.
%ASA-1-104001: (Secondary) Switching to ACTIVE - Interface check</pre>
<pre class="out">NK-ASA# show failover state

               State          Last Failure Reason      Date/Time
This host  -   Secondary
               Active         None
Other host -   Primary
               <span class="hl">Failed         Interface check          02:10:31 UTC Sep 30 2026</span>

====Configuration State===
	Sync Done
====Communication State===
	Mac set</pre>
<p>PC1 ab bhi 8.8.8.8 ping karta hai, kyunki ab 10.0.1.1 ASA2 ka hai. Lab mein switchover interface holdtime (lagbhag 25 second) ke baad hota hai; asli hardware par physically down hua link aam taur par jaldi detect hota hai kyunki link up/down test turant fail hota hai.</p>

<div class="eg"><p><b>Worked example: kis unit ki galti hai?</b> <code>show failover state</code> dikhata hai <code>Other host - Primary / Failed / Interface check</code>. ASA2 par <code>show monitor-interface</code> other host ke liye <code>Interface inside (10.0.1.2): No Link (Monitored)</code> dikhata hai. Nateeja: primary ka inside path (uska port, uski cable, ya SW-IN port) fail hua. ASA2 mein kuch galat nahi, aur primary ke hardware mein bhi apne aap mein kuch galat nahi.</p></div>

<h3>Yaad rakhne wale syslog IDs</h3>
<table class="cmp"><tr><th>ID</th><th>Matlab</th></tr>
<tr><td>104001</td><td>(unit) Switching to ACTIVE, reason ke saath</td></tr>
<tr><td>104002</td><td>(unit) Switching to STANDBY</td></tr>
<tr><td>104003 / 104004</td><td>(unit) Switching to FAILED / Switching to OK</td></tr>
<tr><td>105005</td><td>FOLINK interface par mate ke saath failover communication kho gaya</td></tr>
<tr><td>105008 / 105009</td><td>Testing interface ... / Testing on interface ... Passed ya Failed</td></tr>
<tr><td>709003 se 709006</td><td>Configuration replication shuru aur khatam, sending (active) aur receiving (standby)</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki tooti failover link "bas fail over kar degi". Aisa nahi hota: pair jaisa hai waisa rehta hai, lekin uski fail over karne ki kshamata chali jaati hai. 105005 aur <code>show failover</code> mein down dikhne wali failover link par alert lagao, aur ise priority incident ki tarah theek karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Standby</b> par failures kabhi switchover nahi karate. Aur akela event jo dono units ko active banata hai woh hai units start hote samay failover link ka down hona (ya ek saath har communication path kho dena).</p></div>

<div class="scn"><h4>Woh failover link jis par kisi ka dhyaan nahi gaya</h4><p>Ek monitoring system sirf 104001 (switch to active) par alarm deta tha. Teen hafte tak ek pair ke beech ki failover cable damaged thi; dono units failover link ko down dikhate the, lekin woh ab bhi data interfaces par ek doosre ko sunte the, isliye koi alarm nahi baja. Phir active unit ki power supply fail hui. Standby toote path ki wajah se samay par state nahi seekh paaya, customers ke sessions gaye, aur post-incident review mein teen hafte pehle se shuru hue 105005 messages mile. Team ne 105005 aur failover link state ke liye alerts jode.</p><p><b>Seekh:</b> tooti failover link protection ka chupchaap khona hai; use monitor karo.</p></div>

<div class="iv"><p class="q">"ASA failover kya trigger karta hai, aur kya nahi?"</p><p>Strong answer: active unit ka fail hona (holdtime tak saare interfaces par hellos kho jaana), active unit par monitored interface failures ka interface policy tak pahunchna jab standby zyada healthy ho, ya manual <code>no failover active</code> / <code>failover active</code>. Standby par failures, chalte hue failover link failure, aur state link failure failover nahi karate; woh kuch failed mark karte hain aur protection kam karte hain. Khatarnak case hai startup par failover link down, jo dono units ko active bana deta hai. Check karne wale logs ki tarah 104001 uske reason ke saath aur 105005 batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: active unit failure, active unit par interface failures ka policy tak pahunchna, manual commands.</li>
<li>Standby failures, failover link failure aur state link failure switchover nahi karate.</li>
<li>Startup par failover link down dono units ko active bana sakta hai (split brain).</li>
<li>Lab 2 reason: <code>HELLO not heard from mate</code>; lab 4 reason: <code>Interface check</code>.</li>
<li>104001-104004, 105005, 105008/105009 aur 709003-709006 dekho.</li>
</ul></div>
`}};export{e as default};