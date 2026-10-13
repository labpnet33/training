var e={id:`registered-but-no-logs`,h:{en:`Why a registered device produces no logs: logtraffic and the log filter`,hi:`Registered device ke logs kyun nahi aate: logtraffic aur log filter`},body:{en:`
<p>A post office can be perfectly open, the road to it clear and the clerk at the counter, yet no parcels arrive if the sender never posts them. A registered FortiGate with a green connection is the same. FAZ-1 is ready, but the FortiGate decides which events become logs at all. If a policy says "do not write traffic logs", nothing is ever sent, and the FortiAnalyzer shows empty, not an error.</p>

<h3>Two gates inside the FortiGate</h3>
<p>Before a log reaches the network, it passes two gates, in this order.</p>
<ol>
<li><b>The policy gate: <code>logtraffic</code>.</b> Each firewall policy has this setting. <code>disable</code>: this policy writes no traffic logs. <code>utm</code>: a traffic log is written only when a security profile (web filter, application control, IPS, antivirus) produced an event for the session. <code>all</code>: every session that matches the policy is logged.</li>
<li><b>The filter gate: <code>config log fortianalyzer filter</code>.</b> This decides which logs are forwarded to this FortiAnalyzer. <code>forward-traffic disable</code> stops all forwarded-traffic logs. <code>severity</code> forwards only logs at least as severe as the value.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two gates between a session and the FortiAnalyzer">
<rect x="14" y="52" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="69" y="86" text-anchor="middle" class="svg-ink" font-size="13">Session</text>
<rect x="170" y="40" width="140" height="84" rx="8" fill="#fde68a"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">Gate 1: policy</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="12">disable / utm / all</text>
<rect x="356" y="40" width="140" height="84" rx="8" fill="#bae6fd"/><text x="426" y="68" text-anchor="middle" class="svg-ink" font-size="13">Gate 2: filter</text><text x="426" y="88" text-anchor="middle" class="svg-muted" font-size="12">forward-traffic</text><text x="426" y="106" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="540" y="52" width="86" height="60" rx="8" fill="#bbf7d0"/><text x="583" y="86" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text>
<line x1="124" y1="82" x2="170" y2="82" stroke="#64748b" stroke-width="2"/><line x1="310" y1="82" x2="356" y2="82" stroke="#64748b" stroke-width="2"/><line x1="496" y1="82" x2="540" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A log must pass both gates on the FortiGate before FAZ-1 can store it.</p></div>

<h3>Severity levels</h3>
<p>Every log has a level. The filter lets a log through when its level is at least as severe as the setting. The order from most to least severe is emergency, alert, critical, error, warning, notice, information, debug. In the simulator the levels are: traffic logs <code>notice</code>, event logs <code>information</code>, UTM logs information, notice, warning or alert depending on the feature. The default filter is <code>information</code>, which lets everything through.</p>
<table class="cmp"><tr><th>Filter severity</th><th>Traffic (notice)</th><th>Event (information)</th></tr>
<tr><td>information (default)</td><td>passes</td><td>passes</td></tr>
<tr><td>notice</td><td>passes</td><td>stopped</td></tr>
<tr><td>warning</td><td>stopped</td><td>stopped</td></tr>
</table>

<h3>The default that <code>show</code> hides</h3>
<p>The default of <code>logtraffic</code> is <code>utm</code>. FortiOS <code>show</code> prints only values that differ from the default, so a policy with no logtraffic line is on <code>utm</code>. If you want to see it, use <code>show full-configuration</code>. A policy on <code>utm</code> without any security profile attached writes no traffic logs at all, which surprises people: the policy looks fine and the logs are still empty.</p>

<h3>Reading the symptom</h3>
<p>This is HQ-FGT after web sessions from PC-HQ in the lab. The device is registered and connected, yet no logs:</p>
<pre class="out">FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000  -  192.0.2.11  HQ-FGT  root  ...
        |- STATUS: <span class="hl">logging: no logs yet; conn: up</span>; logs: 0/0/0 (traffic/utm/event)
HQ-FGT # show firewall policy
    edit 1
        set name "LAN-TO-WAN"
        set action accept
        set service "ALL"
        <span class="hl">set logtraffic disable</span>
        set nat enable
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0</pre>
<p>Connection and registration are healthy. The "sent" counter on the FortiGate is zero, so the logs were never written. That points to the FortiGate, not to FAZ-1.</p>

<h3>The fix and the proof</h3>
<p>Set <code>logtraffic all</code> on the policy (inside <code>config firewall policy</code>, <code>edit 1</code>), generate new traffic, and watch the counters on FAZ-1. Logs written before the fix are gone for good; only new sessions count.</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      <span class="hl">4</span>        0      1      0         2026-10-12 20:45:16</pre>
<p>The event log appears because changing a policy on the FortiGate writes a synthetic event log ("Attribute configured"), which is a handy hint in this simulator that the logging pipe itself works.</p>

<div class="eg"><p><b>Worked example.</b> Madurai's severity filter is <code>warning</code>. Traffic logs are level notice, so they are below the bar. The same filter also stops event logs. You set <code>severity information</code> in <code>config log fortianalyzer filter</code>, open sessions from PC-MDU and see the Traffic column of MDU-FGT start to count. On the FortiGate the counters of <code>diagnose log kernel-stats</code> show "generated" higher than "sent" while a filter stops logs, which tells you the logs existed but did not leave.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Assuming "registered and connected" means "logging". (2) Setting <code>logtraffic utm</code> and expecting every session. (3) Raising the severity to reduce noise and silently losing all traffic logs. (4) Checking FAZ-1 settings when the sent counter on the FortiGate is already zero.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>logtraffic</code> values are disable, utm and all, and the default is utm. A severity filter passes logs at that level or more severe. The filter applies on the FortiGate side, before upload.</p></div>

<div class="scn"><h4>Quiet firewall, loud complaint</h4><p>An analyst at a retailer searched for a customer's session and found nothing for the whole afternoon. The device was green in the list. The engineer read the policy and saw <code>logtraffic disable</code>, set during a performance test a week earlier and never reverted. After changing it to all, new sessions appeared within seconds. The week in between had no traffic logs, and the incident report said so plainly.</p><p><b>Lesson:</b> a green device only proves the connection; always compare the FortiGate counters with the FortiAnalyzer ones.</p></div>

<div class="iv"><p class="q">"The device is registered and connected but there are no logs. What do you check?"</p><p>I work from the source: the logtraffic value on the policy, then the log filter on the FortiGate (forward-traffic and severity), then the sent counters in miglogd output. Only after that I look at the ADOM, the quota and Log View filters on the FortiAnalyzer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two gates on the FortiGate: policy logtraffic, then the FortiAnalyzer log filter.</li>
<li>logtraffic is disable, utm or all; the default utm is hidden by <code>show</code>.</li>
<li>Severity passes logs at that level or more severe; warning stops notice traffic logs.</li>
<li>A zero sent counter on the FortiGate means the fault is on the FortiGate side.</li>
<li>Fixing the setting only affects new sessions.</li>
</ul></div>
`,hi:`
<p>Post office bilkul khula ho sakta hai, raasta saaf, counter par clerk maujood, phir bhi parcels nahi aate agar sender unhe post hi nahi karta. Registered FortiGate jiska connection green hai, wahi hai. FAZ-1 ready hai, par kaun si events log banengi ye FortiGate tay karta hai. Policy kahe "traffic logs mat likho" to kuch bheja hi nahi jata, aur FortiAnalyzer khaali dikhata hai, error nahi.</p>

<h3>FortiGate ke andar do gates</h3>
<p>Log network tak pahunchne se pehle do gates se guzarta hai, isi order mein.</p>
<ol>
<li><b>Policy gate: <code>logtraffic</code>.</b> Har firewall policy mein ye setting hoti hai. <code>disable</code>: ye policy traffic logs nahi likhti. <code>utm</code>: traffic log tabhi likha jata hai jab security profile (web filter, application control, IPS, antivirus) ne session ke liye event banaya ho. <code>all</code>: policy se match karne wala har session log hota hai.</li>
<li><b>Filter gate: <code>config log fortianalyzer filter</code>.</b> Ye tay karta hai ki kaun se logs is FortiAnalyzer ko forward honge. <code>forward-traffic disable</code> saare forwarded-traffic logs rok deta hai. <code>severity</code> sirf wahi logs forward karta hai jo value ke barabar ya usse zyada severe hon.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Session aur FortiAnalyzer ke beech do gates">
<rect x="14" y="52" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="69" y="86" text-anchor="middle" class="svg-ink" font-size="13">Session</text>
<rect x="170" y="40" width="140" height="84" rx="8" fill="#fde68a"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">Gate 1: policy</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="12">disable / utm / all</text>
<rect x="356" y="40" width="140" height="84" rx="8" fill="#bae6fd"/><text x="426" y="68" text-anchor="middle" class="svg-ink" font-size="13">Gate 2: filter</text><text x="426" y="88" text-anchor="middle" class="svg-muted" font-size="12">forward-traffic</text><text x="426" y="106" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="540" y="52" width="86" height="60" rx="8" fill="#bbf7d0"/><text x="583" y="86" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text>
<line x1="124" y1="82" x2="170" y2="82" stroke="#64748b" stroke-width="2"/><line x1="310" y1="82" x2="356" y2="82" stroke="#64748b" stroke-width="2"/><line x1="496" y1="82" x2="540" y2="82" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">FAZ-1 log store kare, isse pehle log ko FortiGate ke dono gates paar karne padte hain.</p></div>

<h3>Severity levels</h3>
<p>Har log ka ek level hota hai. Filter log ko tab guzarne deta hai jab uska level setting ke barabar ya usse zyada severe ho. Zyada se kam severe ka order: emergency, alert, critical, error, warning, notice, information, debug. Simulator mein levels ye hain: traffic logs <code>notice</code>, event logs <code>information</code>, UTM logs feature ke hisaab se information, notice, warning ya alert. Default filter <code>information</code> hai, jo sab kuch guzarne deta hai.</p>
<table class="cmp"><tr><th>Filter severity</th><th>Traffic (notice)</th><th>Event (information)</th></tr>
<tr><td>information (default)</td><td>guzarta hai</td><td>guzarta hai</td></tr>
<tr><td>notice</td><td>guzarta hai</td><td>ruk jata hai</td></tr>
<tr><td>warning</td><td>ruk jata hai</td><td>ruk jata hai</td></tr>
</table>

<h3>Default jo <code>show</code> chhupata hai</h3>
<p><code>logtraffic</code> ka default <code>utm</code> hai. FortiOS ka <code>show</code> sirf wo values print karta hai jo default se alag hon, isliye jis policy mein logtraffic line nahi wo <code>utm</code> par hai. Dekhna ho to <code>show full-configuration</code> use karo. <code>utm</code> par wo policy jisme koi security profile attached nahi hai, traffic logs bilkul nahi likhti, jo logon ko chaunkata hai: policy theek dikhti hai aur logs phir bhi khaali hain.</p>

<h3>Symptom padhna</h3>
<p>Lab mein PC-HQ se web sessions ke baad ye HQ-FGT hai. Device registered aur connected hai, phir bhi logs nahi:</p>
<pre class="out">FAZ-1 # diagnose dvm device list
faz-log  678  FGVMEV1RGF38I000  -  192.0.2.11  HQ-FGT  root  ...
        |- STATUS: <span class="hl">logging: no logs yet; conn: up</span>; logs: 0/0/0 (traffic/utm/event)
HQ-FGT # show firewall policy
    edit 1
        set name "LAN-TO-WAN"
        set action accept
        set service "ALL"
        <span class="hl">set logtraffic disable</span>
        set nat enable
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 <span class="hl">sent(t/u/e)=0/0/0</span> lost=0</pre>
<p>Connection aur registration theek hain. FortiGate ka "sent" counter zero hai, yaani logs kabhi likhe hi nahi gaye. Ye FortiGate ki taraf ishara karta hai, FAZ-1 ki taraf nahi.</p>

<h3>Fix aur saboot</h3>
<p>Policy par <code>logtraffic all</code> set karo (<code>config firewall policy</code> ke andar, <code>edit 1</code>), naya traffic generate karo, aur FAZ-1 ke counters dekho. Fix se pehle jo logs likhe jaane the wo hamesha ke liye gaye; sirf naye sessions count honge.</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      <span class="hl">4</span>        0      1      0         2026-10-12 20:45:16</pre>
<p>Event log isliye aata hai kyunki FortiGate par policy badalne se ek synthetic event log ("Attribute configured") likha jata hai; is simulator mein ye ek achha hint hai ki logging pipe khud kaam karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Madurai ka severity filter <code>warning</code> hai. Traffic logs ka level notice hai, yaani bar se neeche. Wahi filter event logs ko bhi rokta hai. Aap <code>config log fortianalyzer filter</code> mein <code>severity information</code> set karte ho, PC-MDU se sessions kholte ho aur MDU-FGT ka Traffic column ginna shuru kar deta hai. FortiGate par <code>diagnose log kernel-stats</code> ke counters mein "generated" "sent" se zyada dikhta hai jab filter logs rok raha ho, jo batata hai ki logs bane the par bahar nahi gaye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Registered aur connected" ka matlab "logging" samajhna. (2) <code>logtraffic utm</code> set karke har session ki ummeed. (3) Noise kam karne ke liye severity badhana aur chupchap saare traffic logs kho dena. (4) FortiGate par sent counter pehle se zero ho tab bhi FAZ-1 settings check karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>logtraffic</code> values disable, utm aur all hain, aur default utm hai. Severity filter us level ke ya usse zyada severe logs guzarta hai. Filter FortiGate ki taraf lagta hai, upload se pehle.</p></div>

<div class="scn"><h4>Chup firewall, shor wali complaint</h4><p>Ek retailer ke analyst ne poori dopahar ek customer ka session search kiya aur kuch nahi mila. Device list mein green tha. Engineer ne policy padhi aur <code>logtraffic disable</code> dekha, jo ek hafta pehle performance test mein set hua tha aur revert nahi hua. All karne ke baad naye sessions kuch seconds mein aa gaye. Beech ke hafte ke traffic logs nahi the, aur incident report mein ye saaf likha gaya.</p><p><b>Lesson:</b> green device sirf connection ka saboot hai; FortiGate ke counters ko hamesha FortiAnalyzer ke counters se compare karo.</p></div>

<div class="iv"><p class="q">"Device registered aur connected hai par logs nahi hain. Aap kya check karte ho?"</p><p>Main source se shuru karta hoon: policy par logtraffic value, phir FortiGate par log filter (forward-traffic aur severity), phir miglogd output mein sent counters. Uske baad hi FortiAnalyzer par ADOM, quota aur Log View filters dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiGate par do gates: policy logtraffic, phir FortiAnalyzer log filter.</li>
<li>logtraffic disable, utm ya all hota hai; default utm ko <code>show</code> chhupata hai.</li>
<li>Severity us level ya usse zyada severe logs guzarta hai; warning notice traffic logs rok deta hai.</li>
<li>FortiGate par sent counter zero ho to fault FortiGate ki taraf hai.</li>
<li>Setting fix karne se sirf naye sessions par asar hota hai.</li>
</ul></div>
`}};export{e as default};