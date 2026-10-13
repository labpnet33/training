var e={id:`troubleshooting`,h:{en:`Troubleshooting failover: a workflow that always finds the fault`,hi:`Failover troubleshooting: ek workflow jo hamesha fault dhoondh leta hai`},body:{en:`
<p>Think of two security guards who share a gate and talk over a walkie-talkie. If one guard never answers, you do not start by retraining them. You check the obvious things in order: are both radios switched on, are they on the same channel, is the battery dead, do they speak the same language? A failover pair is the same. Nearly every failover problem is solved by asking five questions in a fixed order, on <b>both</b> units, and reading the answer in <code>show failover</code>.</p>

<h3>The five-question workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Failover troubleshooting workflow">
<rect x="20" y="20" width="110" height="70" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. On?</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="12">mate detected?</text>
<rect x="145" y="20" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="200" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. Links?</text><text x="200" y="68" text-anchor="middle" class="svg-muted" font-size="12">FOLINK, STATELINK</text>
<rect x="270" y="20" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Match?</text><text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="12">key, role, version</text>
<rect x="395" y="20" width="110" height="70" rx="8" fill="#fde68a"/><text x="450" y="48" text-anchor="middle" class="svg-ink" font-size="13">4. Healthy?</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="12">monitored ifs</text>
<rect x="520" y="20" width="100" height="70" rx="8" fill="#fed7aa"/><text x="570" y="48" text-anchor="middle" class="svg-ink" font-size="13">5. Why?</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="12">state, history</text>
<line x1="130" y1="55" x2="145" y2="55" stroke="#64748b" stroke-width="2"/><line x1="255" y1="55" x2="270" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover</text>
<text x="200" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover interface</text>
<text x="325" y="125" text-anchor="middle" class="svg-muted" font-size="12">console, show version</text>
<text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">show monitor-interface</text>
<text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover state</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Run every step on BOTH units: the fault is usually on the one nobody looked at</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Fix one thing, then re-check from step 1</text>
</svg><p class="cap">Five questions, always in the same order, always on both units.</p></div>
<ol>
<li><b>Is failover on and is the mate detected?</b> <code>show failover</code>: the first line must be <code>Failover On</code>, and the <code>Other host</code> line must show a state, not <i>Not Detected</i>.</li>
<li><b>Are the failover and state links up?</b> Look for <code>Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</code> and <code>Link : STATELINK GigabitEthernet0/4 (up)</code>. <code>show failover interface</code> shows the IP addresses each unit uses on those links.</li>
<li><b>Do the units match?</b> Same key, one primary and one secondary, same model, software, licence and firewall mode. Key problems appear on the console; mode problems as <code>%ASA-1-105044</code>.</li>
<li><b>Are the monitored interfaces healthy on both units?</b> <code>show monitor-interface</code>: every data interface should be <i>Normal (Monitored)</i>. <i>Waiting</i> means a missing standby address; <i>No Link</i> means a cable or switch port.</li>
<li><b>Why did it fail over, or why is it in this state?</b> <code>show failover state</code> gives the Last Failure Reason; <code>show failover history</code> gives every transition with a time and reason.</li>
</ol>

<h3>Walking the ticket lab: the secondary that never joins</h3>
<p>In lab 3 (INC-8812) a contractor configured ASA2 and the pair never formed. Step 1 on ASA1 confirms the symptom:</p>
<pre class="out">NK-ASA# show failover | include LAN|host
Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)
	This host: Primary - Active
	<span class="hl">Other host: Secondary - Not Detected</span></pre>
<p>ASA1's link is up, so look at the other side. Step 2 on ASA2:</p>
<pre class="out">ciscoasa# show failover | include LAN
<span class="hl">Failover LAN Interface: FOLINK GigabitEthernet0/3 (down)</span>
ciscoasa# show running-config failover
failover
failover lan unit secondary
<span class="hl">failover lan interface FOLINK GigabitEthernet0/3</span>
failover key *****
failover link STATELINK GigabitEthernet0/4
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2</pre>
<p>Fault 1: the failover LAN link points at Gi0/3, which has nothing cabled to it. The ASA will not let you change the failover LAN interface while failover is enabled, so disable it first, then move the link and enable the correct port:</p>
<pre class="code"><span class="c">! on ASA2</span>
configure terminal
no failover
failover lan interface FOLINK GigabitEthernet0/5
interface GigabitEthernet0/5
 no shutdown
exit</pre>
<p>Now hellos cross the wire, but the pair still does not form. Step 3: the console of either unit prints:</p>
<pre class="out"><span class="hl">Failover message decryption failure. Please make sure both units have the same failover shared key and crypto license or system is not out of memory</span></pre>
<p>Fault 2: the key. The design says <code>NKfo2026</code>; the contractor typed <code>nkfo2026</code>. Keys are case-sensitive and hidden as <code>*****</code>, so you cannot compare them by reading the configuration. Simply re-enter the correct key and turn failover back on:</p>
<pre class="code">failover key NKfo2026
failover</pre>
<p>ASA2 logs <i>Detected an Active mate</i>, receives the configuration and becomes Standby Ready. Verify: <code>show failover</code> shows the state link up, and <code>show ip</code> on ASA2 shows the current inside address 10.0.1.2.</p>

<h3>Symptom table: the other classic faults</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Most likely cause</th><th>Check and fix</th></tr>
<tr><td>Other host: Not Detected</td><td>Wrong or shut failover interface, VLAN mismatch on a switch in between, different subnet, key mismatch, both units same role</td><td>Walk steps 1–3 on both units</td></tr>
<tr><td>Interface Normal (Waiting)</td><td>No standby IP on that interface</td><td>Add <code>standby</code> to the <code>ip address</code> command</td></tr>
<tr><td>Sessions drop on failover</td><td>No state link, state link down, or HTTP not replicated</td><td>Add a state link; enable HTTP replication if needed</td></tr>
<tr><td>Both units Active (split brain)</td><td>Failover and state links failed together</td><td>Restore the link; separate the paths; use a redundant or port-channel failover link where supported</td></tr>
<tr><td>Standby shows Failed</td><td>A monitored interface is down on the standby</td><td>Fix it now: a failed standby cannot take over</td></tr>
<tr><td>Frequent unexplained failovers</td><td>Very aggressive timers on a busy unit, a flapping or unimportant monitored interface, slow switch ports</td><td>Relax <code>failover polltime</code>, <code>no monitor-interface</code> the lab network, enable PortFast on switch ports facing the ASAs</td></tr>
<tr><td>Standby configuration out of step</td><td>Someone changed the standby directly</td><td><code>write standby</code> on the active unit</td></tr>
</table>

<div class="eg"><p><b>Worked example: timing an unexplained failover.</b> <code>show failover history</code> shows <i>Active → Failed, Interface check</i> at 14:03:12, and the switch log shows Gi0/1 went down at 14:02:47 and up at 14:03:18. The gap of 25 seconds matches the default interface holdtime (poll 5 s, hold 25 s) and proves the switch port triggered it. A port that returns after 31 seconds has spent its time in spanning-tree listening and learning (15 s + 15 s), which is why PortFast on ASA-facing ports matters.</p></div>

<p>For live analysis the <code>debug fover</code> family (for example <code>debug fover fail</code>) prints failover decisions as they happen. Use it briefly, in a lab or a maintenance window, and turn it off with <code>undebug all</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Troubleshooting only the unit you are logged in to. Adding a nameif to the failover interface to "make it work". Changing configuration on the standby, then being surprised that the next sync overwrites it. Reloading both units at once "to reset the pair", which causes a full outage.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Not Detected" with the failover interface <i>up</i> on both sides points to a key, subnet or role mismatch, not cabling. A standby in <i>Failed</i> state means the pair has <b>no</b> protection right now, even though traffic is still flowing.</p></div>

<div class="scn"><h4>The data-centre move that broke the heartbeat</h4><p>After moving both ASAs to a new row, the network team patched the failover link through an access switch. The pair came up split: each unit claimed Active and users saw duplicate-address warnings for 10.0.1.1. The engineer ran step 2 on both units: FOLINK was up, but no hellos arrived. The access switch port for ASA2 had been left in VLAN 1 while ASA1's port was in the failover VLAN 999. Moving the port to VLAN 999 let the units negotiate; the secondary became Standby Ready within seconds.</p><p><b>Lesson:</b> "up" only means the cable is alive; the failover link must also be in the same Layer 2 domain end to end.</p></div>

<div class="iv"><p class="q">"Your ASA pair shows 'Other host: Not Detected'. How do you troubleshoot?"</p><p>Strong answer: work on both units. Confirm <code>Failover On</code>, then the failover LAN interface status and the port it uses, any switch VLAN in between, the identical <code>failover interface ip</code> subnet, one primary and one secondary, and the shared key (look for the decryption-failure message). Then compatibility: model, version, licence, mode. Mention that the failover interface has no nameif and that failover must be disabled to change the LAN interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five questions in order: on, links, match, healthy, why — on both units.</li>
<li>Not Detected with links down is cabling or interface; with links up it is key, subnet or role.</li>
<li>Change the failover LAN interface only after <code>no failover</code>.</li>
<li>Waiting means no standby address; Failed on the standby means no protection.</li>
<li><code>show failover state</code> and <code>show failover history</code> explain every switchover.</li>
</ul></div>
`,hi:`
<p>Do security guards socho jo ek gate share karte hain aur walkie-talkie par baat karte hain. Agar ek guard kabhi jawab na de, to aap unhe dobara training dena shuru nahi karte. Aap obvious cheezein order mein check karte ho: dono radios on hain, same channel par hain, battery khatam to nahi, dono ek hi bhasha bolte hain? Failover pair bhi aisa hi hai. Lagbhag har failover problem paanch sawaal ek fixed order mein, <b>dono</b> units par poochh kar aur <code>show failover</code> mein jawab padh kar solve hota hai.</p>

<h3>Paanch sawaalon wala workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Failover troubleshooting workflow">
<rect x="20" y="20" width="110" height="70" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. On?</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="12">mate detect hua?</text>
<rect x="145" y="20" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="200" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. Links?</text><text x="200" y="68" text-anchor="middle" class="svg-muted" font-size="12">FOLINK, STATELINK</text>
<rect x="270" y="20" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Match?</text><text x="325" y="68" text-anchor="middle" class="svg-muted" font-size="12">key, role, version</text>
<rect x="395" y="20" width="110" height="70" rx="8" fill="#fde68a"/><text x="450" y="48" text-anchor="middle" class="svg-ink" font-size="13">4. Healthy?</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="12">monitored ifs</text>
<rect x="520" y="20" width="100" height="70" rx="8" fill="#fed7aa"/><text x="570" y="48" text-anchor="middle" class="svg-ink" font-size="13">5. Kyun?</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="12">state, history</text>
<line x1="130" y1="55" x2="145" y2="55" stroke="#64748b" stroke-width="2"/><line x1="255" y1="55" x2="270" y2="55" stroke="#64748b" stroke-width="2"/><line x1="380" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover</text>
<text x="200" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover interface</text>
<text x="325" y="125" text-anchor="middle" class="svg-muted" font-size="12">console, show version</text>
<text x="450" y="125" text-anchor="middle" class="svg-muted" font-size="12">show monitor-interface</text>
<text x="570" y="125" text-anchor="middle" class="svg-muted" font-size="12">show failover state</text>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="13">Har step DONO units par chalao: fault aksar us unit par hota hai jise kisi ne dekha nahi</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Ek cheez theek karo, phir step 1 se dobara check karo</text>
</svg><p class="cap">Paanch sawaal, hamesha same order mein, hamesha dono units par.</p></div>
<ol>
<li><b>Failover on hai aur mate detect hua?</b> <code>show failover</code>: pehli line <code>Failover On</code> honi chahiye, aur <code>Other host</code> line ek state dikhaye, <i>Not Detected</i> nahi.</li>
<li><b>Failover aur state links up hain?</b> <code>Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)</code> aur <code>Link : STATELINK GigabitEthernet0/4 (up)</code> dhoondo. <code>show failover interface</code> dikhata hai ki har unit un links par kaunse IP addresses use karta hai.</li>
<li><b>Units match karte hain?</b> Same key, ek primary aur ek secondary, same model, software, licence aur firewall mode. Key problems console par dikhte hain; mode problems <code>%ASA-1-105044</code> ke roop mein.</li>
<li><b>Dono units par monitored interfaces healthy hain?</b> <code>show monitor-interface</code>: har data interface <i>Normal (Monitored)</i> hona chahiye. <i>Waiting</i> matlab standby address missing; <i>No Link</i> matlab cable ya switch port.</li>
<li><b>Failover kyun hua, ya yeh is state mein kyun hai?</b> <code>show failover state</code> Last Failure Reason deta hai; <code>show failover history</code> har transition time aur reason ke saath deta hai.</li>
</ol>

<h3>Ticket lab walk: woh secondary jo kabhi nahi judta</h3>
<p>Lab 3 (INC-8812) mein ek contractor ne ASA2 configure kiya aur pair kabhi nahi bana. ASA1 par step 1 symptom confirm karta hai:</p>
<pre class="out">NK-ASA# show failover | include LAN|host
Failover LAN Interface: FOLINK GigabitEthernet0/5 (up)
	This host: Primary - Active
	<span class="hl">Other host: Secondary - Not Detected</span></pre>
<p>ASA1 ka link up hai, to doosri taraf dekho. ASA2 par step 2:</p>
<pre class="out">ciscoasa# show failover | include LAN
<span class="hl">Failover LAN Interface: FOLINK GigabitEthernet0/3 (down)</span>
ciscoasa# show running-config failover
failover
failover lan unit secondary
<span class="hl">failover lan interface FOLINK GigabitEthernet0/3</span>
failover key *****
failover link STATELINK GigabitEthernet0/4
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2</pre>
<p>Fault 1: failover LAN link Gi0/3 ki taraf point karta hai, jahan kuch cabled nahi hai. Failover enabled rehte ASA failover LAN interface badalne nahi deta, isliye pehle use disable karo, phir link move karo aur sahi port enable karo:</p>
<pre class="code"><span class="c">! ASA2 par</span>
configure terminal
no failover
failover lan interface FOLINK GigabitEthernet0/5
interface GigabitEthernet0/5
 no shutdown
exit</pre>
<p>Ab hellos wire par jaate hain, lekin pair phir bhi nahi banta. Step 3: kisi bhi unit ka console print karta hai:</p>
<pre class="out"><span class="hl">Failover message decryption failure. Please make sure both units have the same failover shared key and crypto license or system is not out of memory</span></pre>
<p>Fault 2: key. Design kehta hai <code>NKfo2026</code>; contractor ne <code>nkfo2026</code> type kiya. Keys case-sensitive hain aur <code>*****</code> ki tarah chhupi hoti hain, isliye configuration padh kar compare nahi kar sakte. Bas sahi key dobara daalo aur failover wapas on karo:</p>
<pre class="code">failover key NKfo2026
failover</pre>
<p>ASA2 <i>Detected an Active mate</i> log karta hai, configuration receive karta hai aur Standby Ready banta hai. Verify: <code>show failover</code> state link up dikhata hai, aur ASA2 par <code>show ip</code> current inside address 10.0.1.2 dikhata hai.</p>

<h3>Symptom table: baaki classic faults</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Sabse sambhav cause</th><th>Check aur fix</th></tr>
<tr><td>Other host: Not Detected</td><td>Galat ya shut failover interface, beech ke switch par VLAN mismatch, alag subnet, key mismatch, dono units same role</td><td>Dono units par steps 1–3 chalao</td></tr>
<tr><td>Interface Normal (Waiting)</td><td>Us interface par standby IP nahi</td><td><code>ip address</code> command mein <code>standby</code> jodo</td></tr>
<tr><td>Failover par sessions toot-te hain</td><td>State link nahi, state link down, ya HTTP replicate nahi hota</td><td>State link jodo; zaroorat ho to HTTP replication enable karo</td></tr>
<tr><td>Dono units Active (split brain)</td><td>Failover aur state links ek saath fail hue</td><td>Link restore karo; paths alag karo; jahan supported ho redundant ya port-channel failover link use karo</td></tr>
<tr><td>Standby Failed dikhata hai</td><td>Standby par koi monitored interface down hai</td><td>Abhi theek karo: failed standby take over nahi kar sakta</td></tr>
<tr><td>Baar-baar bina wajah failovers</td><td>Busy unit par bahut aggressive timers, flap karta ya kam zaroori monitored interface, slow switch ports</td><td><code>failover polltime</code> dheela karo, lab network par <code>no monitor-interface</code>, ASAs ki taraf ke switch ports par PortFast enable karo</td></tr>
<tr><td>Standby configuration peeche reh gayi</td><td>Kisi ne seedhe standby badla</td><td>Active unit par <code>write standby</code></td></tr>
</table>

<div class="eg"><p><b>Worked example: bina wajah failover ki timing.</b> <code>show failover history</code> 14:03:12 par <i>Active → Failed, Interface check</i> dikhata hai, aur switch log dikhata hai ki Gi0/1 14:02:47 par down aur 14:03:18 par up hua. 25 second ka gap default interface holdtime (poll 5 s, hold 25 s) se match karta hai aur saabit karta hai ki switch port ne trigger kiya. Jo port 31 second baad lautta hai usne apna time spanning-tree listening aur learning (15 s + 15 s) mein bitaya, isliye ASA ki taraf ke ports par PortFast zaroori hai.</p></div>

<p>Live analysis ke liye <code>debug fover</code> family (jaise <code>debug fover fail</code>) failover decisions hote hi print karti hai. Ise thodi der ke liye, lab ya maintenance window mein use karo, aur <code>undebug all</code> se band karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sirf us unit ko troubleshoot karna jis par aap logged in ho. Failover interface par "chalane ke liye" nameif jodna. Standby par configuration badalna, phir hairan hona ki agla sync use overwrite kar deta hai. "Pair reset karne" ke liye dono units ek saath reload karna, jisse poora outage hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dono taraf failover interface <i>up</i> ke saath "Not Detected" key, subnet ya role mismatch ki taraf ishaara karta hai, cabling ki taraf nahi. <i>Failed</i> state wala standby matlab pair ke paas abhi <b>koi</b> protection nahi hai, bhale hi traffic chal raha ho.</p></div>

<div class="scn"><h4>Data-centre move jisne heartbeat tod diya</h4><p>Dono ASAs ko nayi row mein shift karne ke baad network team ne failover link ek access switch ke through patch kiya. Pair split ho kar aaya: har unit Active hone ka daava karta tha aur users ko 10.0.1.1 ke liye duplicate-address warnings dikhi. Engineer ne dono units par step 2 chalaya: FOLINK up tha, lekin koi hellos nahi aa rahe the. ASA2 ka access switch port VLAN 1 mein chhoda gaya tha jabki ASA1 ka port failover VLAN 999 mein tha. Port ko VLAN 999 mein daalte hi units negotiate kar paaye; secondary kuch seconds mein Standby Ready ban gaya.</p><p><b>Seekh:</b> "up" ka matlab sirf itna hai ki cable zinda hai; failover link ko end to end same Layer 2 domain mein bhi hona chahiye.</p></div>

<div class="iv"><p class="q">"Aapka ASA pair 'Other host: Not Detected' dikhata hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: dono units par kaam karo. <code>Failover On</code> confirm karo, phir failover LAN interface ka status aur woh kaunsa port use karta hai, beech mein koi switch VLAN, identical <code>failover interface ip</code> subnet, ek primary aur ek secondary, aur shared key (decryption-failure message dhoondo). Phir compatibility: model, version, licence, mode. Batao ki failover interface ka koi nameif nahi hota aur LAN interface badalne ke liye failover disable karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawaal order mein: on, links, match, healthy, kyun — dono units par.</li>
<li>Links down ke saath Not Detected matlab cabling ya interface; links up ke saath matlab key, subnet ya role.</li>
<li>Failover LAN interface sirf <code>no failover</code> ke baad badlo.</li>
<li>Waiting matlab standby address nahi; standby par Failed matlab koi protection nahi.</li>
<li><code>show failover state</code> aur <code>show failover history</code> har switchover samjhate hain.</li>
</ul></div>
`}};export{e as default};