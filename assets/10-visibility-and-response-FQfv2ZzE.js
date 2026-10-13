var e={id:`visibility`,h:{en:`Visibility and response: logs, NetFlow, SIEM and the incident response lifecycle`,hi:`Visibility aur response: logs, NetFlow, SIEM aur incident response lifecycle`},body:{en:`
<p>A shopping mall with cameras that record to tapes nobody watches is not safe; it is just well documented. Security becomes real when somebody looks at the recordings, notices the person trying every car door, and sends a guard. In networks the cameras are logs, flow records and endpoint telemetry; the control room is the SOC; and the guard's playbook is the incident response process. SCOR domain 6 and the integration part of SNCF test exactly this.</p>

<h3>Source 1: logs (syslog)</h3>
<p>Every firewall, router, switch, server and security tool writes <b>logs</b>. Network devices use <b>syslog</b> with eight severity levels: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. Lower number means more severe. On the ASA each message has an ID: <b>106023</b> is a packet denied by an access-group, <b>302013/302014</b> are TCP connections built and torn down, <b>113004/113005</b> are AAA successes and failures. Logs need correct time (<b>NTP</b>) on every device, or events from different systems cannot be put in order.</p>

<pre class="code"><span class="c">! Send ASA logs with timestamps to the SIEM collector</span>
logging enable
logging timestamp
logging trap informational
logging host inside 10.1.99.30</pre>

<pre class="out">Sep 30 2026 10:42:17: <span class="hl">%ASA-4-106023: Deny tcp src outside:198.51.100.23/44120 dst dmz:10.1.50.10/22 by access-group "OUTSIDE_IN" [0x0, 0x0]</span>
Sep 30 2026 10:42:18: %ASA-6-302013: Built inbound TCP connection 18842 for outside:198.51.100.7/51000 (198.51.100.7/51000) to dmz:10.1.50.10/443 (203.0.113.10/443)
Sep 30 2026 10:42:25: %ASA-6-302014: Teardown TCP connection 18842 for outside:198.51.100.7/51000 to dmz:10.1.50.10/443 duration 0:00:07 bytes 48213 TCP FINs</pre>
<p>The first line is a blocked SSH attempt from the internet to the DMZ web server, severity 4. The next two show a normal HTTPS session: built, then torn down after 7 seconds and 48 KB. Notice that the ASA prints both the real address 10.1.50.10 and the mapped address 203.0.113.10.</p>

<h3>Source 2: NetFlow and IPFIX</h3>
<p><b>NetFlow</b> (and its standard form <b>IPFIX</b>) records metadata about every conversation instead of the full packets: source and destination IP and port, protocol, bytes, packets, start and end time, the interface. A router or firewall (the <b>exporter</b>) sends these records to a <b>collector</b>. Flow data is small, covers the whole network and is perfect for questions such as "who talked to this IP last week?", "which host suddenly uploaded 4 GB at 3 a.m.?" or "which workstation is scanning the subnet?". Cisco Secure Network Analytics builds behaviour baselines on top of flows. Flows show <i>that</i> something happened, not <i>what</i> was inside; for content you need a <b>packet capture</b>.</p>

<h3>Source 3: endpoint and cloud telemetry</h3>
<p>EDR agents report processes, file hashes, network connections and user activity from each host. Cloud platforms produce audit logs of every API call. DNS security logs every lookup. Together with firewall logs and flows these make up the full picture.</p>

<h3>SIEM, SOAR and XDR</h3>
<p>A <b>SIEM</b> collects all these sources, <b>parses and normalises</b> them into common fields (source IP, user, action), <b>correlates</b> events across tools and time, raises <b>alerts</b>, and <b>retains</b> data for investigation and compliance. <b>SOAR</b> automates the response steps with playbooks. <b>XDR</b> takes detections from endpoint, network, email, identity and cloud, groups them into incidents and offers one-click response actions. In this track the Splunk and XDR consoles are simulated so you can practise searching and containing.</p>

<pre class="out">index=netfw sourcetype="cisco:asa" message_id=106023 earliest=-24h
| stats count by src_ip, dest_port | sort - count | head 3

src_ip           dest_port    count
<span class="hl">198.51.100.23    22           1840</span>
198.51.100.23    3389         1612
203.0.113.77     23           412</pre>
<p>One search turns thousands of deny lines into an answer: 198.51.100.23 is scanning SSH and RDP on the DMZ. Because the firewall already blocks it, this is information, not an incident, unless an <i>allowed</i> connection from the same source appears.</p>

<h3>Alert quality</h3>
<table class="cmp"><tr><th></th><th>Attack really happened</th><th>No attack</th></tr>
<tr><td><b>Alert raised</b></td><td>True positive</td><td>False positive (noise)</td></tr>
<tr><td><b>No alert</b></td><td>False negative (the dangerous one)</td><td>True negative</td></tr>
</table>
<p>Too many false positives cause <b>alert fatigue</b>, and analysts start ignoring alerts. Tuning is a permanent job. SOC teams measure <b>MTTD</b> (mean time to detect) and <b>MTTR</b> (mean time to respond or recover).</p>

<h3>The incident response lifecycle (NIST SP 800-61)</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NIST incident response lifecycle">
<rect x="10" y="70" width="130" height="56" rx="10" fill="#bae6fd"/><text x="75" y="94" text-anchor="middle" class="svg-ink" font-size="13">1 Preparation</text><text x="75" y="112" text-anchor="middle" class="svg-muted" font-size="12">tools, plans, logs</text>
<rect x="170" y="70" width="140" height="56" rx="10" fill="#fde68a"/><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="13">2 Detection</text><text x="240" y="112" text-anchor="middle" class="svg-muted" font-size="12">and analysis</text>
<rect x="340" y="70" width="150" height="56" rx="10" fill="#fed7aa"/><text x="415" y="90" text-anchor="middle" class="svg-ink" font-size="13">3 Containment,</text><text x="415" y="108" text-anchor="middle" class="svg-ink" font-size="13">eradication, recovery</text>
<rect x="520" y="70" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="575" y="94" text-anchor="middle" class="svg-ink" font-size="13">4 Post-</text><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="13">incident</text>
<line x1="140" y1="98" x2="170" y2="98" stroke="#64748b" stroke-width="2"/><line x1="310" y1="98" x2="340" y2="98" stroke="#64748b" stroke-width="2"/><line x1="490" y1="98" x2="520" y2="98" stroke="#64748b" stroke-width="2"/>
<path d="M415 70 C 415 30, 240 30, 240 70" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="328" y="28" text-anchor="middle" class="svg-muted" font-size="12">loop back as new evidence appears</text>
<path d="M575 126 C 575 180, 75 180, 75 126" fill="none" stroke="#64748b" stroke-width="1.5"/><text x="328" y="194" text-anchor="middle" class="svg-accent" font-size="12">lessons learned improve preparation</text>
</svg><p class="cap">The four-phase lifecycle from NIST SP 800-61 Rev. 2, still the model most SOC runbooks and exams use.</p></div>
<ol>
<li><b>Preparation</b>: an IR plan, contacts, tools, logging in place, backups tested, playbooks written.</li>
<li><b>Detection and analysis</b>: an alert arrives; confirm it, decide severity, scope which hosts and users are affected, preserve evidence.</li>
<li><b>Containment, eradication and recovery</b>: isolate the host or block the domain (short-term containment), remove the cause (malware, attacker accounts, the vulnerability), restore from clean sources and monitor closely.</li>
<li><b>Post-incident activity</b>: a blameless review; what worked, what failed, which control or detection to add.</li>
</ol>
<p>NIST published <b>Rev. 3</b> in 2025, which maps incident response onto the six Cybersecurity Framework 2.0 functions (Govern, Identify, Protect, Detect, Respond, Recover) instead of a separate cycle. The ideas are the same; know both names.</p>

<div class="eg"><p><b>Worked example.</b> At 10:05 the DNS security service blocks host 10.1.10.77 from resolving cdn-stats.example (C2 category). Detection 10:05, SOC triage 10:12 (true positive), EDR isolation 10:15, containment complete. MTTD 0 minutes for the block, MTTR 10 minutes to isolation. Eradication: reimage the host, reset the user's password. Post-incident: why did the email filter miss the lure?</p></div>

<div class="warn"><p><b>Common mistakes.</b> Devices with wrong clocks. Logging only denies, so allowed malicious connections leave no trace. Wiping an infected machine before collecting evidence. Containing so aggressively that the business stops when a smaller action would do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Syslog 0 is the most severe, 7 is debugging; <code>logging trap informational</code> sends levels 0 to 6. NetFlow = metadata, not payload. False negative is worse than false positive. Containment comes before eradication.</p></div>

<div class="scn"><h4>The 3 a.m. upload</h4><p>No alert fired, but a weekly flow review showed a finance workstation sending 4 GB to an unknown cloud storage address between 3 and 4 a.m. The endpoint had no malware alert. Investigation found a legitimate but unapproved backup tool installed by the user, copying payroll files to a personal account. The files were deleted with the provider's help, the tool was blocked by application control, and a SIEM rule now alerts on large outbound transfers outside office hours.</p><p><b>Lesson:</b> flows reveal what other tools miss; not every incident is malware, and data loss is still an incident.</p></div>

<div class="iv"><p class="q">"Walk me through the incident response lifecycle."</p><p>Strong answer: name the four NIST SP 800-61 phases (preparation; detection and analysis; containment, eradication and recovery; post-incident activity) and give one concrete action for each, for example logging and playbooks, triaging an alert, isolating a host with EDR, and a lessons-learned review. Mention evidence preservation and that Rev. 3 aligns IR with CSF 2.0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs, NetFlow/IPFIX, packet captures and endpoint telemetry are the four eyes of the SOC.</li>
<li>Syslog severities 0 (emergencies) to 7 (debugging); NTP makes logs comparable.</li>
<li>SIEM collects, normalises, correlates and alerts; SOAR automates; XDR groups detections into incidents.</li>
<li>False negatives are dangerous; false positives cause alert fatigue.</li>
<li>NIST IR lifecycle: preparation, detection and analysis, containment-eradication-recovery, post-incident.</li>
</ul></div>
`,hi:`
<p>Ek shopping mall jiske cameras aisi tapes par record karte hain jinhe koi nahi dekhta, safe nahi hai; bas achhi tarah documented hai. Security tab real hoti hai jab koi recordings dekhta hai, har gaadi ka darwaza try karne wale insaan ko notice karta hai, aur guard bhejta hai. Networks mein cameras logs, flow records aur endpoint telemetry hain; control room SOC hai; aur guard ki playbook incident response process hai. SCOR domain 6 aur SNCF ka integration hissa bilkul yahi test karte hain.</p>

<h3>Source 1: logs (syslog)</h3>
<p>Har firewall, router, switch, server aur security tool <b>logs</b> likhta hai. Network devices aath severity levels ke saath <b>syslog</b> use karte hain: 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. Kam number matlab zyada severe. ASA par har message ka ek ID hota hai: <b>106023</b> access-group se denied packet hai, <b>302013/302014</b> TCP connections ka build aur teardown hain, <b>113004/113005</b> AAA success aur failure hain. Logs ko har device par sahi time (<b>NTP</b>) chahiye, warna alag systems ke events ko order mein nahi rakha ja sakta.</p>

<pre class="code"><span class="c">! ASA logs timestamps ke saath SIEM collector ko bhejo</span>
logging enable
logging timestamp
logging trap informational
logging host inside 10.1.99.30</pre>

<pre class="out">Sep 30 2026 10:42:17: <span class="hl">%ASA-4-106023: Deny tcp src outside:198.51.100.23/44120 dst dmz:10.1.50.10/22 by access-group "OUTSIDE_IN" [0x0, 0x0]</span>
Sep 30 2026 10:42:18: %ASA-6-302013: Built inbound TCP connection 18842 for outside:198.51.100.7/51000 (198.51.100.7/51000) to dmz:10.1.50.10/443 (203.0.113.10/443)
Sep 30 2026 10:42:25: %ASA-6-302014: Teardown TCP connection 18842 for outside:198.51.100.7/51000 to dmz:10.1.50.10/443 duration 0:00:07 bytes 48213 TCP FINs</pre>
<p>Pehli line internet se DMZ web server par blocked SSH attempt hai, severity 4. Agli do ek normal HTTPS session dikhati hain: build hua, phir 7 seconds aur 48 KB ke baad teardown. Dhyan do ki ASA real address 10.1.50.10 aur mapped address 203.0.113.10 dono print karta hai.</p>

<h3>Source 2: NetFlow aur IPFIX</h3>
<p><b>NetFlow</b> (aur uska standard form <b>IPFIX</b>) poore packets ki jagah har baatcheet ka metadata record karta hai: source aur destination IP aur port, protocol, bytes, packets, start aur end time, interface. Router ya firewall (<b>exporter</b>) yeh records <b>collector</b> ko bhejta hai. Flow data chhota hai, poore network ko cover karta hai aur aise sawaalon ke liye perfect hai jaise "pichhle hafte is IP se kaun baat kar raha tha?", "kis host ne achanak raat 3 baje 4 GB upload kiya?" ya "kaunsa workstation subnet scan kar raha hai?". Cisco Secure Network Analytics flows ke upar behaviour baselines banata hai. Flows dikhate hain <i>ki</i> kuch hua, yeh nahi ki andar <i>kya</i> tha; content ke liye aapko <b>packet capture</b> chahiye.</p>

<h3>Source 3: endpoint aur cloud telemetry</h3>
<p>EDR agents har host se processes, file hashes, network connections aur user activity report karte hain. Cloud platforms har API call ke audit logs banate hain. DNS security har lookup log karti hai. Firewall logs aur flows ke saath yeh poori picture banate hain.</p>

<h3>SIEM, SOAR aur XDR</h3>
<p><b>SIEM</b> in saare sources ko collect karta hai, unhe common fields (source IP, user, action) mein <b>parse aur normalise</b> karta hai, tools aur time ke across events ko <b>correlate</b> karta hai, <b>alerts</b> uthata hai, aur investigation aur compliance ke liye data <b>retain</b> karta hai. <b>SOAR</b> playbooks se response steps automate karta hai. <b>XDR</b> endpoint, network, email, identity aur cloud se detections leta hai, unhe incidents mein group karta hai aur one-click response actions deta hai. Is track mein Splunk aur XDR consoles simulated hain taaki aap searching aur containing practise kar sako.</p>

<pre class="out">index=netfw sourcetype="cisco:asa" message_id=106023 earliest=-24h
| stats count by src_ip, dest_port | sort - count | head 3

src_ip           dest_port    count
<span class="hl">198.51.100.23    22           1840</span>
198.51.100.23    3389         1612
203.0.113.77     23           412</pre>
<p>Ek search hazaaron deny lines ko jawab mein badal deti hai: 198.51.100.23 DMZ par SSH aur RDP scan kar raha hai. Kyunki firewall use pehle se block karta hai, yeh information hai, incident nahi, jab tak usi source se koi <i>allowed</i> connection na dikhe.</p>

<h3>Alert quality</h3>
<table class="cmp"><tr><th></th><th>Attack sach mein hua</th><th>Koi attack nahi</th></tr>
<tr><td><b>Alert utha</b></td><td>True positive</td><td>False positive (noise)</td></tr>
<tr><td><b>Koi alert nahi</b></td><td>False negative (khatarnak wala)</td><td>True negative</td></tr>
</table>
<p>Bahut zyada false positives <b>alert fatigue</b> paida karte hain, aur analysts alerts ignore karne lagte hain. Tuning ek permanent kaam hai. SOC teams <b>MTTD</b> (mean time to detect) aur <b>MTTR</b> (mean time to respond ya recover) naapti hain.</p>

<h3>Incident response lifecycle (NIST SP 800-61)</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NIST incident response lifecycle">
<rect x="10" y="70" width="130" height="56" rx="10" fill="#bae6fd"/><text x="75" y="94" text-anchor="middle" class="svg-ink" font-size="13">1 Preparation</text><text x="75" y="112" text-anchor="middle" class="svg-muted" font-size="12">tools, plans, logs</text>
<rect x="170" y="70" width="140" height="56" rx="10" fill="#fde68a"/><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="13">2 Detection</text><text x="240" y="112" text-anchor="middle" class="svg-muted" font-size="12">aur analysis</text>
<rect x="340" y="70" width="150" height="56" rx="10" fill="#fed7aa"/><text x="415" y="90" text-anchor="middle" class="svg-ink" font-size="13">3 Containment,</text><text x="415" y="108" text-anchor="middle" class="svg-ink" font-size="13">eradication, recovery</text>
<rect x="520" y="70" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="575" y="94" text-anchor="middle" class="svg-ink" font-size="13">4 Post-</text><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="13">incident</text>
<line x1="140" y1="98" x2="170" y2="98" stroke="#64748b" stroke-width="2"/><line x1="310" y1="98" x2="340" y2="98" stroke="#64748b" stroke-width="2"/><line x1="490" y1="98" x2="520" y2="98" stroke="#64748b" stroke-width="2"/>
<path d="M415 70 C 415 30, 240 30, 240 70" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="328" y="28" text-anchor="middle" class="svg-muted" font-size="12">naya evidence aane par wapas loop</text>
<path d="M575 126 C 575 180, 75 180, 75 126" fill="none" stroke="#64748b" stroke-width="1.5"/><text x="328" y="194" text-anchor="middle" class="svg-accent" font-size="12">lessons learned preparation ko behtar banate hain</text>
</svg><p class="cap">NIST SP 800-61 Rev. 2 ka four-phase lifecycle, jo zyada tar SOC runbooks aur exams abhi bhi use karte hain.</p></div>
<ol>
<li><b>Preparation</b>: IR plan, contacts, tools, logging taiyaar, backups tested, playbooks likhe hue.</li>
<li><b>Detection aur analysis</b>: alert aata hai; use confirm karo, severity decide karo, scope nikalo ki kaunse hosts aur users affected hain, evidence preserve karo.</li>
<li><b>Containment, eradication aur recovery</b>: host isolate karo ya domain block karo (short-term containment), wajah hatao (malware, attacker accounts, vulnerability), clean sources se restore karo aur dhyan se monitor karo.</li>
<li><b>Post-incident activity</b>: blameless review; kya chala, kya fail hua, kaunsa control ya detection jodna hai.</li>
</ol>
<p>NIST ne 2025 mein <b>Rev. 3</b> publish kiya, jo incident response ko alag cycle ki jagah Cybersecurity Framework 2.0 ke chhe functions (Govern, Identify, Protect, Detect, Respond, Recover) par map karta hai. Ideas wahi hain; dono naam jaano.</p>

<div class="eg"><p><b>Worked example.</b> 10:05 par DNS security service host 10.1.10.77 ko cdn-stats.example (C2 category) resolve karne se block karti hai. Detection 10:05, SOC triage 10:12 (true positive), EDR isolation 10:15, containment poora. Block ke liye MTTD 0 minute, isolation tak MTTR 10 minute. Eradication: host reimage karo, user ka password reset karo. Post-incident: email filter ne lure kyun miss kiya?</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Galat clocks wale devices. Sirf denies log karna, jisse allowed malicious connections ka koi nishaan nahi rehta. Evidence collect karne se pehle infected machine wipe kar dena. Itna aggressive containment ki business ruk jaaye jabki chhota action kaafi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Syslog 0 sabse severe hai, 7 debugging hai; <code>logging trap informational</code> levels 0 se 6 bhejta hai. NetFlow = metadata, payload nahi. False negative false positive se bura hai. Containment eradication se pehle aata hai.</p></div>

<div class="scn"><h4>Raat 3 baje ka upload</h4><p>Koi alert fire nahi hua, lekin weekly flow review mein dikha ki ek finance workstation raat 3 se 4 baje ke beech ek unknown cloud storage address par 4 GB bhej raha tha. Endpoint par koi malware alert nahi tha. Investigation mein ek legitimate lekin unapproved backup tool mila jo user ne install kiya tha, jo payroll files ek personal account par copy kar raha tha. Provider ki madad se files delete ki gayi, tool ko application control se block kiya gaya, aur ab ek SIEM rule office hours ke bahar bade outbound transfers par alert karta hai.</p><p><b>Seekh:</b> flows woh dikhate hain jo doosre tools miss karte hain; har incident malware nahi hota, aur data loss bhi incident hai.</p></div>

<div class="iv"><p class="q">"Incident response lifecycle samjhao."</p><p>Strong answer: chaar NIST SP 800-61 phases ka naam lo (preparation; detection and analysis; containment, eradication and recovery; post-incident activity) aur har ek ke liye ek concrete action do, jaise logging aur playbooks, alert triage karna, EDR se host isolate karna, aur lessons-learned review. Evidence preservation mention karo aur yeh ki Rev. 3 IR ko CSF 2.0 ke saath align karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs, NetFlow/IPFIX, packet captures aur endpoint telemetry SOC ki chaar aankhen hain.</li>
<li>Syslog severities 0 (emergencies) se 7 (debugging); NTP logs ko comparable banata hai.</li>
<li>SIEM collect, normalise, correlate aur alert karta hai; SOAR automate karta hai; XDR detections ko incidents mein group karta hai.</li>
<li>False negatives khatarnak hain; false positives alert fatigue paida karte hain.</li>
<li>NIST IR lifecycle: preparation, detection aur analysis, containment-eradication-recovery, post-incident.</li>
</ul></div>
`}};export{e as default};