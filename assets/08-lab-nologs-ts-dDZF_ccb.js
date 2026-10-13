var e={id:`lab-nologs-ts`,h:{en:`Lab fa-nologs-ts: registered and connected, but no traffic logs`,hi:`Lab fa-nologs-ts: registered aur connected, par traffic logs nahi`},body:{en:`
<p>A doctor with a patient who "feels unwell" does not start with the strongest medicine. She asks, measures, rules out the common causes one by one and writes down each finding. This lab trains the same habit on a logging fault. The ticket says: HQ-FGT and MDU-FGT are registered and the connection is up, yet analysts find no traffic logs of the last hours. There are two separate causes, one on each FortiGate, and fixing one does not fix the other.</p>

<h3>Goal and approach</h3>
<p>Find each cause, correct it and prove the fix with new web traffic. Work in the order of the log path: connection, registration, ADOM, policy gate, filter gate, and only then Log View. The first three are quick to rule out and tell you where to look next.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Checklist order along the log path">
<rect x="10" y="40" width="96" height="62" rx="8" fill="#e2e8f0"/><text x="58" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Connection</text><text x="58" y="86" text-anchor="middle" class="svg-muted" font-size="11">conn up?</text>
<rect x="116" y="40" width="96" height="62" rx="8" fill="#e2e8f0"/><text x="164" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Registered</text><text x="164" y="86" text-anchor="middle" class="svg-muted" font-size="11">ADOM?</text>
<rect x="222" y="40" width="96" height="62" rx="8" fill="#fde68a"/><text x="270" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="270" y="86" text-anchor="middle" class="svg-muted" font-size="11">logtraffic</text>
<rect x="328" y="40" width="96" height="62" rx="8" fill="#fde68a"/><text x="376" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Filter</text><text x="376" y="86" text-anchor="middle" class="svg-muted" font-size="11">severity</text>
<rect x="434" y="40" width="96" height="62" rx="8" fill="#bae6fd"/><text x="482" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Counters</text><text x="482" y="86" text-anchor="middle" class="svg-muted" font-size="11">sent / stored</text>
<rect x="540" y="40" width="90" height="62" rx="8" fill="#bbf7d0"/><text x="585" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Log View</text><text x="585" y="86" text-anchor="middle" class="svg-muted" font-size="11">filters</text>
</svg><p class="cap">Grey: rule out quickly. Yellow: the two FortiGate gates. Blue and green: prove the fix.</p></div>

<h3>Step 1: rule out connection and registration</h3>
<p>On HQ-FGT run the connectivity test and the miglogd status. On FAZ-1 read the device list and the log counters. In this lab all of them look healthy:</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Registration: registered
Connection: Allow
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0
FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      0        0      0      0         -
MDU-FGT         FGVMEV1JOS6TJ000    root      0        0      0      0         -</pre>
<p><b>What this tells you:</b> the pipe is fine. Both devices are registered (ADOM root, mode off), nothing is rejected by a quota, and the FortiGate itself has sent nothing. When "sent" is zero, the fault is upstream of the network: the logs were never created or never forwarded.</p>

<h3>Step 2: HQ-FGT, the policy gate</h3>
<p>Read the firewall policy. You are looking for one line. Do not rely on a short <code>show</code> alone; a missing logtraffic line would mean the default <code>utm</code>, but here the line is present and explicit.</p>
<pre class="out">HQ-FGT # show firewall policy
    edit 1
        set name "LAN-TO-WAN"
        set action accept
        set service "ALL"
        <span class="hl">set logtraffic disable</span>
        set nat enable</pre>
<p><b>Hint:</b> inside <code>config firewall policy</code>, <code>edit 1</code>, change logtraffic so every session is logged, close with <code>end</code>, then open web sessions from PC-HQ. Prove it on FAZ-1 with the log counters or with Log View for HQ-FGT. Do not stop at "the command was accepted".</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      <span class="hl">4</span>        0      1      0         2026-10-12 20:45:16</pre>
<p>A small surprise: an Event count of 1 also appears. The policy edit itself created a synthetic event log ("Attribute configured") on the FortiGate. It is harmless and confirms that logs flow.</p>

<h3>Step 3: MDU-FGT, the filter gate</h3>
<p>MDU-FGT has the policy right, so the logs are created but stopped before leaving. Read the full configuration of the filter; the task reminds you that traffic logs have the level notice.</p>
<pre class="out">MDU-FGT # show full-configuration log fortianalyzer filter
config log fortianalyzer filter
    <span class="hl">set severity warning</span>
    set forward-traffic enable
    ...</pre>
<p><b>Reasoning:</b> warning is more severe than notice, so a notice-level traffic log does not reach the bar. Use the ordering from chapter 5 to decide which value lets traffic through; the task text states the value to set (information) and you should be able to explain why notice would also work for traffic but not for event logs. Then open web sessions from PC-MDU and prove it with the counters.</p>
<p><b>Stronger evidence:</b> before your fix, compare "generated" and "sent" in <code>diagnose log kernel-stats</code> on the FortiGate. A gap means logs existed but a filter held them back.</p>

<h3>Wrong turns in this lab</h3>
<ul>
<li>Fixing only HQ-FGT and declaring victory. Always re-check every device named in the ticket.</li>
<li>Changing the policy but testing before generating traffic; old sessions are not logged retroactively.</li>
<li>Reaching for the FortiAnalyzer quota or ADOM when the sent counter on the FortiGate is already zero.</li>
<li>Setting <code>forward-traffic</code> or severity "to see everything" and then forgetting to put the filter back to a sensible value.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> After both fixes the counters on FAZ-1 read HQ-FGT traffic 4, event 1 and MDU-FGT traffic 4, event 0. The extra event on HQ-FGT comes from the policy edit. Use such small differences as evidence: they show which device started sending after which change.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using Log View as the first tool. Log View only answers "what is stored"; counters on both sides answer "where did it stop".</p></div>

<div class="exam"><p><b>Exam traps.</b> Two independent causes can exist in one ticket. A registered and connected device can still produce no logs. The log filter is applied on the FortiGate.</p></div>

<div class="scn"><h4>The performance test that was never undone</h4><p>During a throughput test, an engineer set <code>logtraffic disable</code> on the main policy of a branch FortiGate to reduce load, and raised the FortiAnalyzer filter severity to warning on another. Both stayed after the test. A week later the incident team found no traffic logs from either branch. The checklist order in this lab found the policy on one device and the filter on the other in under ten minutes.</p><p><b>Lesson:</b> keep a list of temporary changes and revert them; when a ticket names two devices, expect two answers.</p></div>

<div class="iv"><p class="q">"Logs from two FortiGates are missing but both show connected. How do you proceed?"</p><p>I check the sent counters on each FortiGate, then the policy logtraffic value and the log filter, because connected only proves the pipe. I fix and test one cause at a time with new traffic, and I verify on the FortiAnalyzer counters, not only on the FortiGate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work along the log path: connection, registration, policy, filter, counters, Log View.</li>
<li>Sent = 0 on the FortiGate means the fault is on the FortiGate side.</li>
<li>HQ-FGT: the policy gate (logtraffic). MDU-FGT: the filter gate (severity).</li>
<li>Prove each fix with new traffic and with counters on FAZ-1.</li>
<li>A ticket with two devices can have two different causes.</li>
</ul></div>
`,hi:`
<p>Jo doctor kehta hai "patient ko theek nahi lag raha", wo sabse tez dawai se shuru nahi karti. Wo poochhti hai, napti hai, aam wajahon ko ek-ek karke hatati hai aur har finding likhti hai. Ye lab logging fault par wahi aadat sikhata hai. Ticket kehta hai: HQ-FGT aur MDU-FGT registered hain aur connection up hai, phir bhi analysts ko pichhle ghanton ke traffic logs nahi milte. Do alag wajahen hain, har FortiGate par ek, aur ek fix karne se doosri fix nahi hoti.</p>

<h3>Goal aur approach</h3>
<p>Har wajah dhoondho, theek karo aur naye web traffic se fix saabit karo. Log path ke order mein kaam karo: connection, registration, ADOM, policy gate, filter gate, aur tab Log View. Pehle teen jaldi rule out ho jate hain aur batate hain agla kahan dekhna hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Log path ke saath checklist ka order">
<rect x="10" y="40" width="96" height="62" rx="8" fill="#e2e8f0"/><text x="58" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Connection</text><text x="58" y="86" text-anchor="middle" class="svg-muted" font-size="11">conn up?</text>
<rect x="116" y="40" width="96" height="62" rx="8" fill="#e2e8f0"/><text x="164" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Registered</text><text x="164" y="86" text-anchor="middle" class="svg-muted" font-size="11">ADOM?</text>
<rect x="222" y="40" width="96" height="62" rx="8" fill="#fde68a"/><text x="270" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="270" y="86" text-anchor="middle" class="svg-muted" font-size="11">logtraffic</text>
<rect x="328" y="40" width="96" height="62" rx="8" fill="#fde68a"/><text x="376" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Filter</text><text x="376" y="86" text-anchor="middle" class="svg-muted" font-size="11">severity</text>
<rect x="434" y="40" width="96" height="62" rx="8" fill="#bae6fd"/><text x="482" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Counters</text><text x="482" y="86" text-anchor="middle" class="svg-muted" font-size="11">sent / stored</text>
<rect x="540" y="40" width="90" height="62" rx="8" fill="#bbf7d0"/><text x="585" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Log View</text><text x="585" y="86" text-anchor="middle" class="svg-muted" font-size="11">filters</text>
</svg><p class="cap">Grey: jaldi rule out karo. Yellow: FortiGate ke do gates. Blue aur green: fix saabit karo.</p></div>

<h3>Step 1: connection aur registration rule out karo</h3>
<p>HQ-FGT par connectivity test aur miglogd status chalao. FAZ-1 par device list aur log counters padho. Is lab mein sab healthy dikhte hain:</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Registration: registered
Connection: Allow
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0
FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      0        0      0      0         -
MDU-FGT         FGVMEV1JOS6TJ000    root      0        0      0      0         -</pre>
<p><b>Isse kya pata chala:</b> pipe theek hai. Dono devices registered hain (ADOM root, mode off), koi quota se reject nahi hua, aur FortiGate ne khud kuch bheja hi nahi. "sent" zero ho to fault network se pehle hai: logs bane hi nahi ya forward hi nahi hue.</p>

<h3>Step 2: HQ-FGT, policy gate</h3>
<p>Firewall policy padho. Aap ek line dhoondh rahe ho. Sirf chhote <code>show</code> par bharosa mat karo; logtraffic line na ho to matlab default <code>utm</code>, par yahan line maujood aur explicit hai.</p>
<pre class="out">HQ-FGT # show firewall policy
    edit 1
        set name "LAN-TO-WAN"
        set action accept
        set service "ALL"
        <span class="hl">set logtraffic disable</span>
        set nat enable</pre>
<p><b>Hint:</b> <code>config firewall policy</code> ke andar <code>edit 1</code>, logtraffic aise badlo ki har session log ho, <code>end</code> se band karo, phir PC-HQ se web sessions kholo. FAZ-1 par log counters ya HQ-FGT ke Log View se saabit karo. "Command accept ho gayi" par ruk mat jao.</p>
<pre class="out">FAZ-1 # diagnose log device
HQ-FGT          FGVMEV1RGF38I000    root      <span class="hl">4</span>        0      1      0         2026-10-12 20:45:16</pre>
<p>Ek chhoti hairani: Event count 1 bhi aa gaya. Policy edit ne khud FortiGate par ek synthetic event log ("Attribute configured") banaya. Ye harmless hai aur confirm karta hai ki logs flow ho rahe hain.</p>

<h3>Step 3: MDU-FGT, filter gate</h3>
<p>MDU-FGT ki policy theek hai, isliye logs bante hain par nikalne se pehle rok liye jate hain. Filter ki full configuration padho; task yaad dilata hai ki traffic logs ka level notice hai.</p>
<pre class="out">MDU-FGT # show full-configuration log fortianalyzer filter
config log fortianalyzer filter
    <span class="hl">set severity warning</span>
    set forward-traffic enable
    ...</pre>
<p><b>Reasoning:</b> warning notice se zyada severe hai, isliye notice-level traffic log bar tak nahi pahunchta. Chapter 5 ka ordering use karke tay karo ki kaun si value traffic ko guzarne deti hai; task text set karne ki value (information) batata hai aur aapko samjha sakna chahiye ki notice traffic ke liye bhi chalta par event logs ke liye nahi. Phir PC-MDU se web sessions kholo aur counters se saabit karo.</p>
<p><b>Mazboot evidence:</b> fix se pehle FortiGate par <code>diagnose log kernel-stats</code> mein "generated" aur "sent" compare karo. Gap ka matlab logs the par filter ne rok liye.</p>

<h3>Is lab ke galat mod</h3>
<ul>
<li>Sirf HQ-FGT fix karke jeet maan lena. Ticket mein jitne devices ke naam hain, sab dobara check karo.</li>
<li>Policy badalna par traffic generate kiye bina test karna; purane sessions retroactively log nahi hote.</li>
<li>FortiGate par sent counter pehle se zero ho tab bhi FortiAnalyzer ka quota ya ADOM dekhna.</li>
<li>"Sab dikhe" ke liye <code>forward-traffic</code> ya severity badalna aur filter ko sahi value par wapas rakhna bhool jana.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Dono fixes ke baad FAZ-1 ke counters HQ-FGT traffic 4, event 1 aur MDU-FGT traffic 4, event 0 padhte hain. HQ-FGT ka extra event policy edit se aata hai. Aise chhote farq evidence ki tarah use karo: ye dikhate hain ki kaun sa device kis change ke baad bhejna shuru hua.</p></div>

<div class="warn"><p><b>Common mistake.</b> Log View ko pehla tool banana. Log View sirf "kya stored hai" ka jawab deta hai; dono taraf ke counters "kahan ruka" ka jawab dete hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ek ticket mein do independent wajahen ho sakti hain. Registered aur connected device bhi logs na bana sakta hai. Log filter FortiGate par lagta hai.</p></div>

<div class="scn"><h4>Performance test jo undo nahi hua</h4><p>Throughput test ke dauran ek engineer ne load kam karne ke liye branch FortiGate ki main policy par <code>logtraffic disable</code> kiya, aur doosre par FortiAnalyzer filter severity warning kar di. Test ke baad dono rahe. Ek hafta baad incident team ko dono branches ke traffic logs nahi mile. Is lab ke checklist order ne dus minute mein ek device par policy aur doosre par filter dhoondh liya.</p><p><b>Lesson:</b> temporary changes ki list rakho aur unhe revert karo; ticket mein do devices ke naam hon to do jawab expect karo.</p></div>

<div class="iv"><p class="q">"Do FortiGates ke logs missing hain par dono connected dikhte hain. Aap kaise aage badhte ho?"</p><p>Main har FortiGate par sent counters dekhta hoon, phir policy logtraffic value aur log filter, kyunki connected sirf pipe saabit karta hai. Ek-ek wajah ko naye traffic ke saath fix aur test karta hoon, aur verify FortiAnalyzer counters par karta hoon, sirf FortiGate par nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log path ke saath kaam karo: connection, registration, policy, filter, counters, Log View.</li>
<li>FortiGate par Sent = 0 ka matlab fault FortiGate ki taraf hai.</li>
<li>HQ-FGT: policy gate (logtraffic). MDU-FGT: filter gate (severity).</li>
<li>Har fix ko naye traffic aur FAZ-1 ke counters se saabit karo.</li>
<li>Do devices wale ticket ki do alag wajahen ho sakti hain.</li>
</ul></div>
`}};export{e as default};