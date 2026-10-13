var e={id:`assurance-analytics`,h:{en:`Assurance and AI analytics: turning telemetry into answers`,hi:`Assurance aur AI analytics: telemetry se jawab`},body:{en:`
<p>When you feel unwell, a doctor does not guess. They take your temperature, pulse and blood pressure, compare them with what is normal for you, and then decide. <b>Assurance</b> does that for a network. Every controller, AP and client reports vital signs; the platform scores them, remembers what is normal, and raises an <b>issue</b> when something drifts. In Catalyst Center this is the <b>Assurance</b> area. Everything in this chapter is concept only, except the data sources, which you can read yourself on the controller.</p>

<h3>What gets measured</h3>
<dl class="terms">
<dt>Client health</dt><dd>A score per client, shown as a number from 1 to 10 (higher is better), built from onboarding (did association, authentication and DHCP succeed, and how long they took), connectivity (RSSI, SNR, data rate, retries) and roaming. Clients with no data are shown as inactive.</dd>
<dt>AP health</dt><dd>Radio utilisation, channel interference, noise, client count, CPU and memory, and whether the AP is joined to a controller.</dd>
<dt>Controller (WLC) health</dt><dd>CPU, memory, AP join counts, licence state, and interface errors.</dd>
<dt>Network services</dt><dd>Reachability and response time of DHCP, DNS and AAA, as seen by clients.</dd>
</dl>
<p>Exact thresholds depend on the release and can be tuned. Do not memorise numbers; learn the idea that every score is explained by a breakdown, so you can see <i>why</i> a client is poor.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Assurance data flow">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Clients</text>
<rect x="20" y="80" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="13">APs</text>
<rect x="20" y="140" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (9800)</text>
<rect x="230" y="60" width="170" height="90" rx="8" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">Assurance engine</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">score, baseline, correlate</text>
<rect x="490" y="30" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="13">Health scores</text>
<rect x="490" y="90" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">Issues</text>
<rect x="490" y="150" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="175" text-anchor="middle" class="svg-ink" font-size="13">Trends</text>
<line x1="140" y1="40" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="100" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="140" y1="160" x2="230" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="95" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="120" x2="490" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="185" y="210" text-anchor="middle" class="svg-muted" font-size="12">telemetry, syslog, SNMP</text>
</svg><p class="cap">Devices send telemetry; the engine scores, baselines and correlates; you see health, issues and trends.</p></div>

<h3>AI analytics: baselines and anomalies</h3>
<p>Fixed thresholds ("alert at 80 percent utilisation") miss two things: a lecture hall that is normally at 90 percent, and a quiet office that is suddenly at 40 percent. <b>AI Network Analytics</b> learns the normal pattern for each site, building and time of day (the <b>baseline</b>) and flags deviations. It can group symptoms into one issue ("40 clients failed 802.1X in building 2 since 09:10, all through the same RADIUS server") instead of 40 alarms. It also suggests the next action. Some analytics run in the cloud service, so the appliance needs an internet path or a configured proxy for those features.</p>
<p>Related features worth naming in an interview:</p>
<ul>
<li><b>Client 360 and Device 360</b>: one page for a client or AP showing its history, onboarding events and issues.</li>
<li><b>Intelligent Capture</b>: the AP captures packets for a client and sends them for analysis, so you can see the 802.11 exchange without walking to the site.</li>
<li><b>Sensors and synthetic tests</b>: a dedicated sensor, or an AP in sensor role, tests onboarding, DNS, DHCP and application reachability on a schedule.</li>
<li><b>AI-enhanced RRM</b>: cloud analysis suggests channel and power plans from long-term data (RRM itself is covered in the RF modules).</li>
</ul>

<h3>Where the data comes from: read it yourself</h3>
<p>Assurance is not magic. It consumes the same facts you can read on the controller, delivered by model-driven telemetry, syslog, SNMP and the controller's operational data. The daily CLI is still the best way to confirm what a dashboard says. In the lab you can read the radio and cloud state like this:</p>
<pre class="out">WLC1# show ap dot11 24ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">1</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>If a dashboard says "AP2 interference high on channel 6", this table tells you what AP2 is using. The same habit applies to <code>show ntp status</code>, <code>show nmsp cloud-services summary</code> (chapter 7) and the controller logs under <b>Troubleshooting &gt; Logs</b> in the web UI. Real assurance dashboards, scores and AI analytics are concept only in the lab; the controller outputs are the data source you can practise on.</p>

<div class="eg"><p><b>Worked example.</b> Monday 09:00, 60 clients in building 2 show onboarding health of 3 (poor). The dashboard groups them under one issue: authentication timeouts, same AAA server. You open the client 360 for one affected phone and see the failed step is EAP exchange, not association. You check <code>show</code> commands on the controller for the AAA group state and find the server marked dead after a firewall change. You fix the firewall; the baseline returns to normal within 15 minutes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Trusting a green health score without checking what it measures. A client can score well on RF yet fail application access because of DNS. Always read the breakdown and the services score.</p></div>

<div class="exam"><p><b>Exam trap.</b> Assurance does not change the network by itself. It observes, scores, correlates and suggests. Configuration changes come from provisioning or from you. Also, a baseline is learned per site and time, it is not a fixed threshold.</p></div>

<div class="scn"><h4>Fix by baseline, not by guess</h4><p>A university received complaints of "slow Wi-Fi in the library after 18:00". The old alarms were silent because utilisation stayed under the fixed threshold. The analytics baseline showed the library normally dropped to 20 percent after 18:00 but was now at 55 percent with many retries, caused by a new vending-machine IoT device on the same channel. The team moved the IoT SSID to another band and the library returned to baseline.</p><p><b>Lesson:</b> deviation from normal finds problems that a fixed threshold misses.</p></div>

<div class="iv"><p class="q">"How does assurance help you troubleshoot wireless?"</p><p>It scores clients, APs and controllers, shows why a score is low, groups symptoms into issues and compares with a baseline. Add that you still verify on the controller with show commands and logs, because the dashboard is only as good as the data it receives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assurance scores clients, APs, controllers and services and explains the score.</li>
<li>AI analytics learns baselines and groups symptoms into issues.</li>
<li>Client 360, Intelligent Capture and sensors help you see a problem remotely.</li>
<li>The data comes from telemetry, syslog and SNMP; you can read the same facts on the 9800.</li>
<li>Assurance observes; it does not change configuration by itself. Dashboards are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Jab aap bimar mehsoos karte ho, doctor andaza nahi lagata. Woh temperature, pulse aur blood pressure naapta hai, use aapke normal se compare karta hai, tab decide karta hai. <b>Assurance</b> network ke liye yahi karta hai. Har controller, AP aur client vital signs report karta hai; platform unhe score deta hai, yaad rakhta hai ki normal kya hai, aur kuch drift hone par <b>issue</b> raise karta hai. Catalyst Center mein yeh <b>Assurance</b> area hai. Is chapter ki har cheez sirf concept hai, siwaye data sources ke, jinhe aap controller par khud padh sakte ho.</p>

<h3>Kya naapa jaata hai</h3>
<dl class="terms">
<dt>Client health</dt><dd>Har client ka score, 1 se 10 tak number (zyada matlab behtar), jo onboarding (association, authentication aur DHCP succeed hue ya nahi aur kitna time laga), connectivity (RSSI, SNR, data rate, retries) aur roaming se banta hai. Jin clients ka data nahi hota woh inactive dikhte hain.</dd>
<dt>AP health</dt><dd>Radio utilisation, channel interference, noise, client count, CPU aur memory, aur AP controller se joined hai ya nahi.</dd>
<dt>Controller (WLC) health</dt><dd>CPU, memory, AP join counts, licence state aur interface errors.</dd>
<dt>Network services</dt><dd>DHCP, DNS aur AAA ki reachability aur response time, jaisa clients ko dikhta hai.</dd>
</dl>
<p>Exact thresholds release par depend karte hain aur tune ho sakte hain. Numbers yaad mat karo; idea seekho ki har score ka breakdown hota hai, taaki aap dekh sako client poor <i>kyun</i> hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Assurance data flow">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Clients</text>
<rect x="20" y="80" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="105" text-anchor="middle" class="svg-ink" font-size="13">APs</text>
<rect x="20" y="140" width="120" height="40" rx="8" fill="#bae6fd"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (9800)</text>
<rect x="230" y="60" width="170" height="90" rx="8" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">Assurance engine</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">score, baseline, correlate</text>
<rect x="490" y="30" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="55" text-anchor="middle" class="svg-ink" font-size="13">Health scores</text>
<rect x="490" y="90" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">Issues</text>
<rect x="490" y="150" width="130" height="40" rx="8" fill="#fde68a"/><text x="555" y="175" text-anchor="middle" class="svg-ink" font-size="13">Trends</text>
<line x1="140" y1="40" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="140" y1="100" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="140" y1="160" x2="230" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="95" x2="490" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="120" x2="490" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="185" y="210" text-anchor="middle" class="svg-muted" font-size="12">telemetry, syslog, SNMP</text>
</svg><p class="cap">Devices telemetry bhejte hain; engine score, baseline aur correlate karta hai; aapko health, issues aur trends dikhte hain.</p></div>

<h3>AI analytics: baselines aur anomalies</h3>
<p>Fixed thresholds ("80 percent utilisation par alert") do cheezein miss karte hain: ek lecture hall jo normally 90 percent par rehta hai, aur ek shaant office jo achanak 40 percent par aa gaya. <b>AI Network Analytics</b> har site, building aur time of day ka normal pattern seekhta hai (<b>baseline</b>) aur deviations flag karta hai. Woh symptoms ko ek issue mein group kar sakta hai ("building 2 mein 09:10 se 40 clients 802.1X mein fail, sab ek hi RADIUS server se") 40 alarms ki jagah. Woh agla action bhi suggest karta hai. Kuch analytics cloud service mein chalte hain, isliye appliance ko un features ke liye internet path ya configured proxy chahiye.</p>
<p>Interview mein naam lene layak related features:</p>
<ul>
<li><b>Client 360 aur Device 360</b>: client ya AP ka ek page jisme history, onboarding events aur issues hote hain.</li>
<li><b>Intelligent Capture</b>: AP client ke packets capture karke analysis ke liye bhejta hai, taaki site par gaye bina 802.11 exchange dekh sako.</li>
<li><b>Sensors aur synthetic tests</b>: dedicated sensor, ya sensor role mein AP, schedule par onboarding, DNS, DHCP aur application reachability test karta hai.</li>
<li><b>AI-enhanced RRM</b>: cloud analysis lambe data se channel aur power plans suggest karta hai (RRM khud RF modules mein cover hai).</li>
</ul>

<h3>Data kahan se aata hai: khud padho</h3>
<p>Assurance jadu nahi hai. Woh wahi facts consume karta hai jo aap controller par padh sakte ho, model-driven telemetry, syslog, SNMP aur controller ke operational data se aate hue. Roz ka CLI abhi bhi confirm karne ka sabse achha tareeka hai ki dashboard kya keh raha hai. Lab mein aap radio aur cloud state aise padh sakte ho:</p>
<pre class="out">WLC1# show ap dot11 24ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">1</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>
<p>Agar dashboard kehta hai "AP2 channel 6 par interference high", to yeh table batati hai AP2 kya use kar raha hai. Yahi aadat <code>show ntp status</code>, <code>show nmsp cloud-services summary</code> (chapter 7) aur web UI mein <b>Troubleshooting &gt; Logs</b> ke controller logs par lagti hai. Asli assurance dashboards, scores aur AI analytics lab mein sirf concept hain; controller outputs woh data source hain jis par aap practise kar sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Monday 09:00, building 2 ke 60 clients ka onboarding health 3 (poor) hai. Dashboard unhe ek issue ke neeche group karta hai: authentication timeouts, same AAA server. Aap ek affected phone ka client 360 kholte ho aur dekhte ho ki failed step EAP exchange hai, association nahi. Aap controller par AAA group state ke show commands dekhte ho aur firewall change ke baad server dead mark mila. Firewall fix karte ho; baseline 15 minute mein normal ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Health score green dekhkar bharosa karna bina yeh dekhe ki woh kya naapta hai. Client RF mein achha score kar sakta hai lekin DNS ki wajah se application access fail ho sakta hai. Hamesha breakdown aur services score padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Assurance khud network nahi badalta. Woh observe, score, correlate aur suggest karta hai. Configuration changes provisioning se ya aapse aate hain. Aur baseline per site aur time seekha jaata hai, fixed threshold nahi.</p></div>

<div class="scn"><h4>Guess nahi, baseline se fix</h4><p>Ek university ko "library mein 18:00 ke baad slow Wi-Fi" ki shikayatein mili. Purane alarms chup rahe kyunki utilisation fixed threshold ke neeche tha. Analytics baseline ne dikhaya ki library normally 18:00 ke baad 20 percent par aati hai lekin ab 55 percent par thi aur bahut retries the, jiski wajah same channel par naya vending-machine IoT device tha. Team ne IoT SSID ko doosre band par move kiya aur library baseline par wapas aa gayi.</p><p><b>Lesson:</b> normal se deviation woh problems pakadta hai jo fixed threshold miss karta hai.</p></div>

<div class="iv"><p class="q">"Assurance wireless troubleshooting mein kaise madad karta hai?"</p><p>Woh clients, APs aur controllers ko score karta hai, dikhata hai score low kyun hai, symptoms ko issues mein group karta hai aur baseline se compare karta hai. Jodo ki aap phir bhi controller par show commands aur logs se verify karte ho, kyunki dashboard utna hi achha hai jitna data use milta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assurance clients, APs, controllers aur services ko score karta hai aur score samjhata hai.</li>
<li>AI analytics baselines seekhta hai aur symptoms ko issues mein group karta hai.</li>
<li>Client 360, Intelligent Capture aur sensors problem ko remotely dekhne mein madad karte hain.</li>
<li>Data telemetry, syslog aur SNMP se aata hai; wahi facts aap 9800 par padh sakte ho.</li>
<li>Assurance observe karta hai; configuration khud nahi badalta. Dashboards lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};