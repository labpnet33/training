var e={id:`san-extension-dr`,h:{en:`SAN extension, disaster recovery, SAN analytics and high availability`,hi:`SAN extension, disaster recovery, SAN analytics aur high availability`},body:{en:`
<p>A SAN that survives a failed switch is good. A SAN that survives a failed building is what regulators and boards ask for. This chapter covers how to extend a SAN between sites, how to choose synchronous or asynchronous replication, and how to keep the design observable and highly available.</p>

<h3>The case: Meridian Bank</h3>
<div class="eg"><p><b>Customer.</b> Meridian Bank, a regional bank. Primary data center (DC1) and a recovery site (DC2) 80 km away over leased dark fibre with a DWDM system; a third site (DC3) 900 km away reached over a 1 Gbps IP WAN. Core banking on two arrays, internet banking and ATM switch on a third, plus 300 TB of file data.</p><p><b>Requirements.</b> Regulator: recovery point objective (RPO) of zero for core banking, recovery time objective (RTO) under 30 minutes. Other systems: RPO 15 minutes. A third copy outside the earthquake zone. No application change.</p><p><b>Constraints.</b> Write latency to core banking must stay under 5 ms; WAN to DC3 is only 1 Gbps and shared; budget allows two DWDM wavelengths and two FCIP-capable modules per fabric.</p></div>

<h3>Synchronous or asynchronous: the physics decides</h3>
<p>Light travels about 5 microseconds per kilometre in fibre, so a round trip costs about 10 microseconds per kilometre, or 1 ms per 100 km. <b>Synchronous replication</b> acknowledges the host write only after the remote array confirms, giving RPO zero but adding at least one round trip, usually two for a native FC write without acceleration (command then XFER_RDY, then data). <b>Asynchronous replication</b> acknowledges locally and ships changes later, so distance does not slow the host, but you accept an RPO equal to the replication lag.</p>
<div class="eg"><p><b>Worked example.</b> DC1 to DC2 at 80 km: round trip is 0.8 ms. Two round trips add about 1.6 ms to each write, so a 1 ms local write becomes about 2.6 ms plus array overhead: inside the 5 ms limit. DC1 to DC3 at 900 km: 9 ms per round trip, so synchronous would add 18 ms and fail the requirement; use asynchronous.</p></div>
<table class="cmp"><tr><th>Mode</th><th>RPO</th><th>Host impact</th><th>Typical distance</th><th>Use at Meridian</th></tr>
<tr><td>Synchronous</td><td>0</td><td>Adds RTT to every write</td><td>Up to about 100 to 150 km</td><td>DC1 to DC2, core banking</td></tr>
<tr><td>Asynchronous</td><td>Seconds to minutes</td><td>None on write</td><td>Unlimited</td><td>DC1 to DC3, all systems</td></tr>
<tr><td>Snapshot or backup copy</td><td>Hours</td><td>Low</td><td>Unlimited</td><td>File data, ransomware recovery</td></tr>
</table>

<h3>Transport options</h3>
<ul>
<li><b>Dark fibre or DWDM/CWDM carrying native FC.</b> Lowest latency, no protocol conversion. Needs enough <b>buffer-to-buffer credits</b> to keep the link full: about 16 credits per kilometre at 32G with full-size frames, more with small frames. MDS supports extended BB credits on suitable ports with the right licence. Use port channels over separate wavelengths and separate paths.</li>
<li><b>FCIP.</b> FC frames tunnelled in TCP/IP over an IP WAN. Cheaper and reaches any distance. Latency and loss of the IP path directly affect throughput; MDS offers write acceleration, compression and tape acceleration on the FCIP interface. It also gives you a separate failure domain from the fibre.</li>
<li><b>FC over long-haul carrier services or dedicated IP circuits.</b> Used where only carrier services exist.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Three sites with DWDM and FCIP">
<rect x="20" y="30" width="150" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC1 primary</text>
<rect x="40" y="70" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric A</text>
<rect x="40" y="114" width="110" height="26" rx="6" fill="#fde68a" stroke="#64748b"/><text x="95" y="132" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric B</text>
<rect x="40" y="148" width="110" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="95" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R1</text>
<rect x="260" y="30" width="150" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC2 recovery</text>
<rect x="280" y="70" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="335" y="92" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric A</text>
<rect x="280" y="114" width="110" height="26" rx="6" fill="#fde68a" stroke="#64748b"/><text x="335" y="132" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric B</text>
<rect x="280" y="148" width="110" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="335" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R2</text>
<rect x="480" y="30" width="140" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC3 far site</text>
<rect x="500" y="70" width="100" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="12">FCIP module</text>
<rect x="500" y="148" width="100" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="550" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R3</text>
<line x1="150" y1="87" x2="280" y2="87" stroke="#16a34a" stroke-width="4"/><line x1="150" y1="127" x2="280" y2="127" stroke="#d97706" stroke-width="4"/>
<text x="215" y="80" text-anchor="middle" class="svg-ink" font-size="11">DWDM 80 km sync</text>
<line x1="410" y1="87" x2="500" y2="87" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="455" y="80" text-anchor="middle" class="svg-ink" font-size="11">FCIP async</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="11">Green = fabric A, amber = fabric B, orange = FCIP, purple = arrays. Solid = native FC, dashed = IP</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Sync RPO 0 to DC2; async RPO under 15 min to DC3</text>
</svg><p class="cap">Two wavelengths carry the A and B fabrics to DC2; an FCIP tunnel feeds the far site.</p></div>

<pre class="code"><span class="c">! FCIP tunnel on DC1 (illustrative addresses)</span>
feature fcip
fcip profile 10
  ip address 192.0.2.1
interface fcip10
  use-profile 10
  peer-info ipaddr 198.51.100.1
  write-accelerator
  ip-compression mode1
  no shutdown</pre>
<pre class="out">dc1# show interface fcip10 brief
Interface  Vsan  Admin  Status  Oper   Profile  Port-channel
fcip10     70    auto   <span class="hl">up</span>   TE     10       --</pre>

<h3>Analytics and high availability design</h3>
<p><b>SAN analytics</b> on MDS 9000 (with SAN Insights in Nexus Dashboard Fabric Controller) collects per-flow metrics: read and write completion times, IOPS, throughput and error counts per initiator-target-LUN flow. Use it before and after changes to find slow-draining devices, overloaded array ports and flows crossing the wrong ISL. Add <b>port-monitor</b> policies for credit starvation, link resets and utilisation so alerts fire before users notice.</p>
<p><b>High availability checklist:</b> dual supervisors and redundant fabric modules in directors; power supplies on separate feeds; ISSU with a tested upgrade path; port channels spread across line cards; multipathing with ALUA-aware policy on hosts; separate DWDM paths for A and B; replication consistency groups so dependent volumes fail over together; a documented, rehearsed failover runbook.</p>

<h3>Chosen design for Meridian</h3>
<p>DC1 to DC2: two DWDM wavelengths, one per fabric, 4 x 32G SAN port channels with extended BB credits, synchronous replication for core banking volumes. DC1 to DC3: FCIP in a dedicated VSAN with compression and QoS, asynchronous replication with a 15 minute lag alarm. Analytics enabled on both sites; port-monitor on every ISL.</p>

<div class="warn"><p><b>Common mistake.</b> Treating replication as backup. Replication copies corruption and deletions too. Keep snapshots or backups with immutability alongside it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Synchronous replication is limited by latency, not bandwidth. Asynchronous replication needs bandwidth equal to the peak change rate, not the volume size.</p></div>

<div class="scn"><h4>The DR test that failed</h4><p>During Meridian's first rehearsal, the database came up at DC3 but its log volume was 40 minutes older than the data volume. The replication groups had not been placed in one consistency group, and the shared WAN had been saturated by a bulk file copy, so lag climbed unnoticed. The fix: one consistency group per application, FCIP QoS to protect replication, an alarm on lag, and a quarterly failover test.</p><p><b>Lesson:</b> disaster recovery is a tested process. Consistency groups and monitoring matter as much as bandwidth.</p></div>

<div class="iv"><p class="q">"The customer asks for zero data loss between two sites 400 km apart. What do you say?"</p><p>Strong answer: at 400 km the round trip is about 4 ms, and native FC writes need two round trips, so synchronous replication would add around 8 ms per write. Explain the trade-off, propose a nearby synchronous site plus a far asynchronous copy, or an application-level approach, and let the business choose the RPO.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>About 10 microseconds of round trip per km decides sync versus async.</li>
<li>DWDM carries native FC with extended BB credits; FCIP tunnels FC over IP for any distance.</li>
<li>Use consistency groups, lag alarms and regular DR tests.</li>
<li>SAN analytics and port-monitor reveal slow drain and hot flows early.</li>
<li>HA means redundant supervisors, power, paths, fabrics and a rehearsed runbook.</li>
</ul></div>
`,hi:`
<p>Jo SAN ek switch fail hone par bach jaaye woh achha hai. Jo SAN poori building fail hone par bach jaaye, woh regulators aur boards maangte hain. Yeh chapter batata hai ki sites ke beech SAN kaise extend karte hain, synchronous ya asynchronous replication kaise chunte hain, aur design ko observable aur highly available kaise rakhte hain.</p>

<h3>Case: Meridian Bank</h3>
<div class="eg"><p><b>Customer.</b> Meridian Bank, ek regional bank. Primary data center (DC1) aur 80 km door recovery site (DC2), leased dark fibre aur DWDM system ke saath; teesra site (DC3) 900 km door, 1 Gbps IP WAN se. Core banking do arrays par, internet banking aur ATM switch teesre par, plus 300 TB file data.</p><p><b>Requirements.</b> Regulator: core banking ke liye recovery point objective (RPO) zero, recovery time objective (RTO) 30 minute se kam. Baaki systems: RPO 15 minute. Earthquake zone se bahar teesri copy. Application mein koi change nahi.</p><p><b>Constraints.</b> Core banking ki write latency 5 ms se kam rehni chahiye; DC3 ka WAN sirf 1 Gbps aur shared hai; budget mein do DWDM wavelengths aur har fabric ke liye do FCIP-capable modules hain.</p></div>

<h3>Synchronous ya asynchronous: physics tay karti hai</h3>
<p>Fibre mein light lagbhag 5 microsecond per kilometre chalti hai, isliye round trip lagbhag 10 microsecond per kilometre, yaani 100 km par 1 ms. <b>Synchronous replication</b> host write tab acknowledge karti hai jab remote array confirm kare, isse RPO zero milta hai par kam se kam ek round trip jodta hai, acceleration ke bina native FC write mein aam taur par do (command phir XFER_RDY, phir data). <b>Asynchronous replication</b> locally acknowledge karti hai aur changes baad mein bhejti hai, isliye distance host ko slow nahi karta, par RPO replication lag ke barabar maanna padta hai.</p>
<div class="eg"><p><b>Worked example.</b> DC1 se DC2, 80 km: round trip 0.8 ms. Do round trips har write mein lagbhag 1.6 ms jodte hain, isliye 1 ms ka local write lagbhag 2.6 ms plus array overhead ho jaata hai: 5 ms limit ke andar. DC1 se DC3, 900 km: round trip 9 ms, isliye synchronous 18 ms jodta aur requirement fail karta; asynchronous use karo.</p></div>
<table class="cmp"><tr><th>Mode</th><th>RPO</th><th>Host impact</th><th>Typical distance</th><th>Meridian mein use</th></tr>
<tr><td>Synchronous</td><td>0</td><td>Har write mein RTT jodta hai</td><td>Lagbhag 100 se 150 km tak</td><td>DC1 se DC2, core banking</td></tr>
<tr><td>Asynchronous</td><td>Seconds se minutes</td><td>Write par koi nahi</td><td>Unlimited</td><td>DC1 se DC3, sab systems</td></tr>
<tr><td>Snapshot ya backup copy</td><td>Ghante</td><td>Kam</td><td>Unlimited</td><td>File data, ransomware recovery</td></tr>
</table>

<h3>Transport options</h3>
<ul>
<li><b>Dark fibre ya DWDM/CWDM par native FC.</b> Sabse kam latency, protocol conversion nahi. Link ko full rakhne ke liye kaafi <b>buffer-to-buffer credits</b> chahiye: 32G par full-size frames ke saath lagbhag 16 credits per kilometre, chhote frames mein zyada. MDS suitable ports par sahi licence ke saath extended BB credits support karta hai. Alag wavelengths aur alag paths par port channels use karo.</li>
<li><b>FCIP.</b> FC frames TCP/IP mein tunnel hoke IP WAN par. Sasta aur kisi bhi distance tak. IP path ki latency aur loss seedha throughput ko asar karte hain; MDS FCIP interface par write acceleration, compression aur tape acceleration deta hai. Yeh fibre se alag failure domain bhi deta hai.</li>
<li><b>Long-haul carrier services ya dedicated IP circuits par FC.</b> Jahan sirf carrier services hon wahan use hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="DWDM aur FCIP ke saath teen sites">
<rect x="20" y="30" width="150" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC1 primary</text>
<rect x="40" y="70" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="95" y="92" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric A</text>
<rect x="40" y="114" width="110" height="26" rx="6" fill="#fde68a" stroke="#64748b"/><text x="95" y="132" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric B</text>
<rect x="40" y="148" width="110" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="95" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R1</text>
<rect x="260" y="30" width="150" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC2 recovery</text>
<rect x="280" y="70" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="335" y="92" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric A</text>
<rect x="280" y="114" width="110" height="26" rx="6" fill="#fde68a" stroke="#64748b"/><text x="335" y="132" text-anchor="middle" class="svg-ink" font-size="12">MDS fabric B</text>
<rect x="280" y="148" width="110" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="335" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R2</text>
<rect x="480" y="30" width="140" height="150" rx="10" fill="#f8fafc" stroke="#64748b"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">DC3 far site</text>
<rect x="500" y="70" width="100" height="34" rx="6" fill="#fed7aa" stroke="#64748b"/><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="12">FCIP module</text>
<rect x="500" y="148" width="100" height="26" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="550" y="166" text-anchor="middle" class="svg-ink" font-size="12">Array R3</text>
<line x1="150" y1="87" x2="280" y2="87" stroke="#16a34a" stroke-width="4"/><line x1="150" y1="127" x2="280" y2="127" stroke="#d97706" stroke-width="4"/>
<text x="215" y="80" text-anchor="middle" class="svg-ink" font-size="11">DWDM 80 km sync</text>
<line x1="410" y1="87" x2="500" y2="87" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="455" y="80" text-anchor="middle" class="svg-ink" font-size="11">FCIP async</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="11">Hara = fabric A, amber = fabric B, orange = FCIP, purple = arrays. Solid = native FC, dashed = IP</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">DC2 tak sync RPO 0; DC3 tak async RPO 15 min se kam</text>
</svg><p class="cap">Do wavelengths A aur B fabrics ko DC2 tak le jaati hain; FCIP tunnel far site ko feed karta hai.</p></div>

<pre class="code"><span class="c">! DC1 par FCIP tunnel (illustrative addresses)</span>
feature fcip
fcip profile 10
  ip address 192.0.2.1
interface fcip10
  use-profile 10
  peer-info ipaddr 198.51.100.1
  write-accelerator
  ip-compression mode1
  no shutdown</pre>
<pre class="out">dc1# show interface fcip10 brief
Interface  Vsan  Admin  Status  Oper   Profile  Port-channel
fcip10     70    auto   <span class="hl">up</span>   TE     10       --</pre>

<h3>Analytics aur high availability design</h3>
<p>MDS 9000 par <b>SAN analytics</b> (Nexus Dashboard Fabric Controller ke SAN Insights ke saath) per-flow metrics collect karta hai: har initiator-target-LUN flow ke read aur write completion times, IOPS, throughput aur error counts. Changes se pehle aur baad use karo taaki slow-draining devices, overloaded array ports aur galat ISL se guzarte flows pakde jaayein. Credit starvation, link resets aur utilisation ke liye <b>port-monitor</b> policies jodo taaki users ko pata chalne se pehle alert fire ho.</p>
<p><b>High availability checklist:</b> directors mein dual supervisors aur redundant fabric modules; alag feeds par power supplies; tested upgrade path ke saath ISSU; line cards mein phaile port channels; hosts par ALUA-aware policy wala multipathing; A aur B ke liye alag DWDM paths; replication consistency groups taaki dependent volumes saath failover hon; documented, rehearsed failover runbook.</p>

<h3>Meridian ke liye chosen design</h3>
<p>DC1 se DC2: do DWDM wavelengths, har fabric ke liye ek, extended BB credits ke saath 4 x 32G SAN port channels, core banking volumes ke liye synchronous replication. DC1 se DC3: dedicated VSAN mein FCIP, compression aur QoS ke saath, 15 minute lag alarm ke saath asynchronous replication. Dono sites par analytics enabled; har ISL par port-monitor.</p>

<div class="warn"><p><b>Common mistake.</b> Replication ko backup samajhna. Replication corruption aur deletions ko bhi copy kar deti hai. Uske saath immutable snapshots ya backups rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Synchronous replication latency se limited hoti hai, bandwidth se nahi. Asynchronous replication ko peak change rate ke barabar bandwidth chahiye, volume size ke barabar nahi.</p></div>

<div class="scn"><h4>DR test jo fail hua</h4><p>Meridian ki pehli rehearsal mein database DC3 par up hua par uska log volume data volume se 40 minute purana tha. Replication groups ek consistency group mein nahi rakhe gaye the, aur bulk file copy ne shared WAN saturate kar diya tha, isliye lag bina nazar mein aaye badhta gaya. Fix: har application ke liye ek consistency group, replication ko bachane ke liye FCIP QoS, lag par alarm, aur quarterly failover test.</p><p><b>Lesson:</b> disaster recovery ek tested process hai. Consistency groups aur monitoring bandwidth jitne hi zaroori hain.</p></div>

<div class="iv"><p class="q">"Customer do sites ke beech 400 km par zero data loss maangta hai. Aap kya kahoge?"</p><p>Strong answer: 400 km par round trip lagbhag 4 ms hai, aur native FC writes ko do round trips chahiye, isliye synchronous replication har write mein lagbhag 8 ms jodegi. Trade-off samjhao, paas ka synchronous site plus door ki asynchronous copy ya application-level approach suggest karo, aur RPO business ko chunne do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lagbhag 10 microsecond round trip per km sync versus async tay karta hai.</li>
<li>DWDM extended BB credits ke saath native FC carry karta hai; FCIP FC ko IP par kisi bhi distance tak tunnel karta hai.</li>
<li>Consistency groups, lag alarms aur regular DR tests use karo.</li>
<li>SAN analytics aur port-monitor slow drain aur hot flows ko jaldi dikhate hain.</li>
<li>HA matlab redundant supervisors, power, paths, fabrics aur rehearsed runbook.</li>
</ul></div>
`}};export{e as default};