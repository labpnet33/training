var e={id:`why-eem`,h:{en:`Why EEM: automation that lives inside the router`,hi:`EEM kyun: router ke andar rehne wala automation`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain what the Cisco <b>Embedded Event Manager (EEM)</b> is, how its event detectors and policy engine fit together, and when on-box automation is the right tool. You will write applets that react to syslog messages, timers, typed commands, tracked objects, interface counters and SNMP values; you will chain CLI, syslog, wait, set, if and regexp actions in the correct order; and you will make applets safe with AAA settings, run-time limits and rate limits. Finally you will verify and troubleshoot applets with <code>show event manager</code> and <code>debug event manager</code>, and solve exam-style "construct the applet" drills. This covers CCNP ENCOR 350-401 v1.2 objective <b>6.6: construct an EEM applet to automate configuration, troubleshooting, or data collection</b>.</p>

<p><b>Prerequisites.</b> You should know the IOS CLI modes (user EXEC, privileged EXEC, global configuration), syslog severity levels 0 to 7, interface states, and static and floating static routes. A little regular-expression knowledge helps, and we teach what you need. The earlier automation modules (Python and JSON, YANG with NETCONF and RESTCONF) showed off-box automation from a server; this module shows the on-box alternative. IP SLA and object tracking are taught in depth in the assurance module; here we only use them as EEM triggers.</p>

<h3>An analogy: the night guard with an instruction card</h3>
<p>Picture a night security guard in an office building. Nobody expects the guard to be an engineer. Instead the manager leaves a laminated card: <i>"If the fire alarm on floor 2 rings, open the emergency exit, then phone the fire brigade, then write the time in the logbook."</i> The guard does not think or improvise; the trigger happens, the steps run in order, every time, even at 3 a.m. when the manager is asleep.</p>
<p>An <b>EEM applet</b> is that card. The <b>event</b> is the alarm (a log message, a timer, a command someone types). The <b>actions</b> are the numbered steps (run a CLI command, write a syslog, wait, send a mail). And the guard is the router itself, so the card works even when nobody can reach the router from outside.</p>

<h3>Off-box versus on-box automation</h3>
<p>Most automation you meet in ENCOR runs <b>off-box</b>: a Python script or an orchestration tool on a server connects to devices with SSH, NETCONF or RESTCONF. That is powerful for mass changes, but it has one weakness: the server must reach the device. When the WAN link of a branch fails, the server cannot reach the branch router at the exact moment you want to act.</p>
<p><b>EEM runs on-box</b>, inside IOS and IOS XE. It is part of the operating system, needs no extra licence on current IOS XE, and reacts within seconds to what the router itself sees. It is ideal for local, event-driven jobs: enable a backup interface, capture <code>show</code> outputs at the moment a problem starts, add a custom log line, or block a risky command.</p>

<table class="cmp"><tr><th>Question</th><th>Off-box (Python, NETCONF)</th><th>On-box (EEM)</th></tr>
<tr><td>Where does the logic run?</td><td>A server or laptop</td><td>Inside the router or switch</td></tr>
<tr><td>Needs management reachability?</td><td>Yes</td><td>No</td></tr>
<tr><td>Best for</td><td>Bulk change, inventory, compliance</td><td>Local reaction, evidence capture</td></tr>
<tr><td>Reaction time</td><td>Polling interval of the tool</td><td>Near real time</td></tr></table>

<h3>The lab story</h3>
<p>The Kochi branch router <b>BRANCH</b> has a primary circuit on <code>GigabitEthernet0/0</code> (10.0.1.2/30) and a pay-per-use backup circuit on <code>GigabitEthernet0/1</code> (10.0.2.2/30). To save money the backup is kept <code>shutdown</code>. A floating static default route via 10.0.2.1 with distance 20 is already configured. The LAN is 192.168.60.0/24 with <b>PC1</b> at .10, and the head-office server <b>SRV</b> sits at 203.0.113.10 behind <b>ISP</b>. Your job: when Gi0/0 goes down at night, the router must bring Gi0/1 up by itself.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab topology">
<rect x="20" y="85" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="70" y="106" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="70" y="122" text-anchor="middle" class="svg-muted" font-size="12">192.168.60.10</text>
<rect x="190" y="80" width="130" height="54" rx="8" fill="#bae6fd"/><text x="255" y="104" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text><text x="255" y="122" text-anchor="middle" class="svg-accent" font-size="12">EEM applets</text>
<rect x="420" y="80" width="100" height="54" rx="8" fill="#e2e8f0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="14">ISP</text>
<rect x="540" y="160" width="90" height="44" rx="8" fill="#fde68a"/><text x="585" y="181" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="585" y="197" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="120" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="320" y1="92" x2="420" y2="92" stroke="#64748b" stroke-width="3"/><text x="370" y="84" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 primary</text>
<line x1="320" y1="124" x2="420" y2="124" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="370" y="146" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 backup (shut)</text>
<line x1="500" y1="134" x2="560" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="255" y="30" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.2/30 and 10.0.2.2/30</text>
</svg><p class="cap">The Kochi branch: EEM on BRANCH watches Gi0/0 and enables the shut backup Gi0/1.</p></div>

<h3>Your first applet</h3>
<p>Before the real job, write the smallest useful applet: a heartbeat that proves EEM is alive.</p>
<pre class="code">BRANCH(config)# event manager applet HEARTBEAT
BRANCH(config-applet)# event timer watchdog time 60
BRANCH(config-applet)# action 1.0 syslog msg "Kochi branch router alive"
BRANCH(config-applet)# end
<span class="c">! one event line, one or more numbered action lines</span></pre>
<p>A minute later the log shows:</p>
<pre class="out">BRANCH#
<span class="hl">*Sep 30 02:01:07.114: %HA_EM-6-LOG: HEARTBEAT: Kochi branch router alive</span></pre>
<p>Notice the format: the facility <code>HA_EM</code>, severity 6 (informational, the default for the syslog action), the mnemonic <code>LOG</code>, then the <b>applet name</b>, then your text.</p>

<div class="eg"><p><b>Worked example.</b> A watchdog of 60 seconds fires 60 x 24 = 1,440 times a day. On a syslog server that stores 90 days, that is about 129,600 lines per router. For 200 branches it is almost 26 million lines of "I am alive". In production you would use a longer interval (for example 300 seconds, 288 lines a day) or rely on SNMP and telemetry; in the lab, 60 seconds lets you see results quickly.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using EEM to replace proper design. If a routing protocol, a floating static route or HSRP with tracking already solves the failover, use them; they are tested and understood by everyone. EEM is for the gaps, such as the shut pay-per-use interface in this lab that no protocol will ever turn on.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint verb is <b>construct</b>. Expect questions that show an applet with one wrong line (missing <code>enable</code>, wrong timer type, labels in the wrong order) or ask you to pick the lines that achieve a goal. Knowing syntax exactly matters more here than in most topics.</p></div>

<div class="scn"><h4>The branch that stayed down until morning</h4><p>A retail chain kept an LTE backup interface shut on every store router because each megabyte was billed. One night the fibre to a store was cut at 1:40 a.m. The floating static route was ready, but the interface it needed was administratively down, so the store's card machines were offline until the first engineer arrived at 9 a.m. and typed <code>no shutdown</code>. The team added a syslog-triggered applet that enables the LTE interface when the fibre's line protocol goes down, plus a second applet that shuts it again when the fibre returns.</p><p><b>Lesson:</b> when a human step is part of failover, the failover will be as slow as the human. EEM removes that step.</p></div>

<div class="iv"><p class="q">"What is EEM and when would you use it instead of a Python script on a server?"</p><p>Strong answer: EEM is an event-driven automation engine built into IOS and IOS XE. An applet ties one event (syslog pattern, timer, CLI, track, SNMP, interface counter) to ordered actions. I use it when the reaction must happen locally and fast, even when the device is unreachable from the network, for example enabling a backup link or capturing evidence at the moment of a CPU spike. For bulk configuration across many devices I prefer off-box tools.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EEM is on-box, event-driven automation inside IOS and IOS XE; it works when the network to your servers does not.</li>
<li>An applet = one event (the trigger) + numbered actions (the steps).</li>
<li>The syslog action produces <code>%HA_EM-6-LOG: APPLETNAME: text</code> by default.</li>
<li>Use EEM for gaps that protocols cannot fill; do not replace good design with scripts.</li>
<li>Objective 6.6 asks you to construct applets, so exact syntax matters.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Cisco <b>Embedded Event Manager (EEM)</b> kya hai, iske event detectors aur policy engine kaise saath kaam karte hain, aur on-box automation kab sahi tool hai. Aap aise applets likhoge jo syslog messages, timers, type kiye commands, tracked objects, interface counters aur SNMP values par react karein; CLI, syslog, wait, set, if aur regexp actions ko sahi order mein jodoge; aur AAA settings, run-time limits aur rate limits se applets ko safe banaoge. Aakhir mein aap <code>show event manager</code> aur <code>debug event manager</code> se applets verify aur troubleshoot karoge, aur exam-style "construct the applet" drills solve karoge. Yeh CCNP ENCOR 350-401 v1.2 ka objective <b>6.6: construct an EEM applet to automate configuration, troubleshooting, or data collection</b> cover karta hai.</p>

<p><b>Prerequisites.</b> Aapko IOS CLI modes (user EXEC, privileged EXEC, global configuration), syslog severity levels 0 se 7, interface states, aur static aur floating static routes aane chahiye. Thoda regular-expression ka gyaan madad karta hai, aur jo chahiye woh hum sikhayenge. Pehle ke automation modules (Python aur JSON, YANG ke saath NETCONF aur RESTCONF) ne server se off-box automation dikhaya; yeh module on-box alternative dikhata hai. IP SLA aur object tracking assurance module mein detail mein sikhaye jaate hain; yahan hum unhe sirf EEM triggers ki tarah use karte hain.</p>

<h3>Ek analogy: instruction card wala night guard</h3>
<p>Ek office building ke night security guard ko socho. Koi guard se engineer hone ki umeed nahi karta. Iski jagah manager ek laminated card chhod jaata hai: <i>"Agar floor 2 ka fire alarm baje, to emergency exit kholo, phir fire brigade ko phone karo, phir logbook mein time likho."</i> Guard sochta nahi, improvise nahi karta; trigger hota hai, steps order mein chalte hain, har baar, raat 3 baje bhi jab manager so raha ho.</p>
<p><b>EEM applet</b> wahi card hai. <b>Event</b> alarm hai (ek log message, ek timer, koi command jo koi type kare). <b>Actions</b> numbered steps hain (CLI command chalao, syslog likho, ruko, mail bhejo). Aur guard khud router hai, isliye card tab bhi kaam karta hai jab bahar se koi router tak pahunch na paaye.</p>

<h3>Off-box versus on-box automation</h3>
<p>ENCOR mein jo zyada tar automation aap dekhte ho woh <b>off-box</b> chalta hai: server par Python script ya orchestration tool SSH, NETCONF ya RESTCONF se devices se connect karta hai. Bulk changes ke liye yeh powerful hai, par iski ek kamzori hai: server ko device tak pahunchna padta hai. Jab branch ka WAN link fail hota hai, theek usi pal server branch router tak nahi pahunch paata jab aap action lena chahte ho.</p>
<p><b>EEM on-box chalta hai</b>, IOS aur IOS XE ke andar. Yeh operating system ka hissa hai, current IOS XE par extra licence nahi maangta, aur router jo khud dekhta hai us par seconds mein react karta hai. Local, event-driven kaamon ke liye yeh perfect hai: backup interface enable karna, problem shuru hote hi <code>show</code> outputs capture karna, custom log line jodna, ya risky command block karna.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Off-box (Python, NETCONF)</th><th>On-box (EEM)</th></tr>
<tr><td>Logic kahan chalta hai?</td><td>Server ya laptop par</td><td>Router ya switch ke andar</td></tr>
<tr><td>Management reachability chahiye?</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Kiske liye best</td><td>Bulk change, inventory, compliance</td><td>Local reaction, saboot capture</td></tr>
<tr><td>Reaction time</td><td>Tool ka polling interval</td><td>Lagbhag real time</td></tr></table>

<h3>Lab ki kahani</h3>
<p>Kochi branch router <b>BRANCH</b> ka primary circuit <code>GigabitEthernet0/0</code> (10.0.1.2/30) par hai aur pay-per-use backup circuit <code>GigabitEthernet0/1</code> (10.0.2.2/30) par. Paise bachane ke liye backup ko <code>shutdown</code> rakha jaata hai. 10.0.2.1 via distance 20 wala floating static default route pehle se configured hai. LAN 192.168.60.0/24 hai jisme <b>PC1</b> .10 par hai, aur head-office server <b>SRV</b> 203.0.113.10 par <b>ISP</b> ke peeche hai. Aapka kaam: raat ko Gi0/0 down ho to router ko Gi0/1 khud up karna hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab topology">
<rect x="20" y="85" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="70" y="106" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="70" y="122" text-anchor="middle" class="svg-muted" font-size="12">192.168.60.10</text>
<rect x="190" y="80" width="130" height="54" rx="8" fill="#bae6fd"/><text x="255" y="104" text-anchor="middle" class="svg-ink" font-size="14">BRANCH</text><text x="255" y="122" text-anchor="middle" class="svg-accent" font-size="12">EEM applets</text>
<rect x="420" y="80" width="100" height="54" rx="8" fill="#e2e8f0"/><text x="470" y="112" text-anchor="middle" class="svg-ink" font-size="14">ISP</text>
<rect x="540" y="160" width="90" height="44" rx="8" fill="#fde68a"/><text x="585" y="181" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="585" y="197" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="120" y1="107" x2="190" y2="107" stroke="#64748b" stroke-width="2"/><text x="155" y="98" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="320" y1="92" x2="420" y2="92" stroke="#64748b" stroke-width="3"/><text x="370" y="84" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0 primary</text>
<line x1="320" y1="124" x2="420" y2="124" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="370" y="146" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 backup (shut)</text>
<line x1="500" y1="134" x2="560" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="255" y="30" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.2/30 aur 10.0.2.2/30</text>
</svg><p class="cap">Kochi branch: BRANCH par EEM Gi0/0 ko dekhta hai aur shut backup Gi0/1 ko enable karta hai.</p></div>

<h3>Aapka pehla applet</h3>
<p>Asli kaam se pehle sabse chhota useful applet likho: ek heartbeat jo saabit kare ki EEM zinda hai.</p>
<pre class="code">BRANCH(config)# event manager applet HEARTBEAT
BRANCH(config-applet)# event timer watchdog time 60
BRANCH(config-applet)# action 1.0 syslog msg "Kochi branch router alive"
BRANCH(config-applet)# end
<span class="c">! ek event line, ek ya zyada numbered action lines</span></pre>
<p>Ek minute baad log yeh dikhata hai:</p>
<pre class="out">BRANCH#
<span class="hl">*Sep 30 02:01:07.114: %HA_EM-6-LOG: HEARTBEAT: Kochi branch router alive</span></pre>
<p>Format dekho: facility <code>HA_EM</code>, severity 6 (informational, syslog action ka default), mnemonic <code>LOG</code>, phir <b>applet ka naam</b>, phir aapka text.</p>

<div class="eg"><p><b>Worked example.</b> 60 second ka watchdog din mein 60 x 24 = 1,440 baar fire hota hai. 90 din store karne wale syslog server par yeh har router ke lagbhag 129,600 lines hain. 200 branches ke liye lagbhag 26 million lines "main zinda hoon" ki. Production mein aap lamba interval use karoge (jaise 300 second, din mein 288 lines) ya SNMP aur telemetry par bharosa karoge; lab mein 60 second se results jaldi dikhte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Achhe design ki jagah EEM use karna. Agar routing protocol, floating static route ya tracking ke saath HSRP pehle se failover solve karte hain, to unhe use karo; woh tested hain aur sab unhe samajhte hain. EEM gaps ke liye hai, jaise is lab ka shut pay-per-use interface jise koi protocol kabhi on nahi karega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint ka verb <b>construct</b> hai. Aise questions expect karo jo ek galat line wala applet dikhayein (<code>enable</code> missing, galat timer type, galat order mein labels) ya goal poora karne wali lines chunne ko kahein. Yahan exact syntax jaanna zyada tar topics se zyada zaroori hai.</p></div>

<div class="scn"><h4>Woh branch jo subah tak down rahi</h4><p>Ek retail chain har store router par LTE backup interface shut rakhti thi kyunki har megabyte ka bill aata tha. Ek raat 1:40 baje ek store ka fibre kat gaya. Floating static route tayyar tha, par jis interface ki use zaroorat thi woh administratively down tha, isliye store ki card machines subah 9 baje tak offline rahin jab pehla engineer aaya aur <code>no shutdown</code> type kiya. Team ne ek syslog-triggered applet joda jo fibre ka line protocol down hone par LTE interface enable karta hai, plus doosra applet jo fibre wapas aane par use phir shut karta hai.</p><p><b>Seekh:</b> jab failover mein insaan ka step shamil ho, to failover utna hi slow hoga jitna insaan. EEM woh step hata deta hai.</p></div>

<div class="iv"><p class="q">"EEM kya hai aur server par Python script ki jagah aap ise kab use karoge?"</p><p>Strong answer: EEM IOS aur IOS XE mein built-in event-driven automation engine hai. Ek applet ek event (syslog pattern, timer, CLI, track, SNMP, interface counter) ko ordered actions se jodta hai. Main ise tab use karta hoon jab reaction locally aur tezi se hona chahiye, tab bhi jab device network se unreachable ho, jaise backup link enable karna ya CPU spike ke pal par saboot capture karna. Bahut saare devices par bulk configuration ke liye main off-box tools prefer karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EEM IOS aur IOS XE ke andar on-box, event-driven automation hai; yeh tab bhi kaam karta hai jab aapke servers tak network nahi hota.</li>
<li>Applet = ek event (trigger) + numbered actions (steps).</li>
<li>Syslog action default mein <code>%HA_EM-6-LOG: APPLETNAME: text</code> banata hai.</li>
<li>EEM un gaps ke liye use karo jo protocols nahi bhar sakte; achhe design ko scripts se replace mat karo.</li>
<li>Objective 6.6 aapse applets construct karwata hai, isliye exact syntax matter karta hai.</li>
</ul></div>
`}};export{e as default};