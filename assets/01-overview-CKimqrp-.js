var e={id:`overview`,h:{en:`System services: what keeps a network observable and recoverable`,hi:`System services: jo network ko observable aur recoverable rakhti hain`},body:{en:`
<p><b>What you will learn in this module.</b> A router that forwards packets is only half a job. The other half is being able to <b>see</b> what it is doing, <b>trust</b> its clock, <b>be told</b> when something fails, <b>reach</b> it safely, and <b>recover</b> it after a mistake. You will learn syslog, trace options, NTP, SNMP, management services (SSH, telnet, NETCONF, J-Web) and the rescue configuration. These are the system services and monitoring objectives of JNCIA-Junos (JN0-106).</p>
<p><b>Prerequisites.</b> The CLI module (candidate, commit, rollback) and the Initial setup module (users, interfaces, SSH). You should be able to configure an interface address and ping a neighbour.</p>

<h3>Analogy: the building's control room</h3>
<p>A large office building has a control room. A <b>logbook</b> records every event (syslog). A <b>master clock</b> keeps every wall clock the same (NTP). A <b>monitoring panel</b> polls the lifts and the lights and flashes an alarm when something fails (SNMP). A <b>key cabinet</b> decides who may enter which room (management services). And a <b>safe</b> contains the original plans so the building can be restored (rescue configuration). A router needs the same five things.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Services around the router">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="14">Junos device</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="11">R1</text>
<rect x="20" y="15" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="12">syslog server (UDP 514)</text>
<rect x="245" y="10" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="12">NTP server (UDP 123)</text>
<rect x="470" y="15" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">NMS: SNMP 161 / 162</text>
<rect x="20" y="160" width="150" height="46" rx="8" fill="#fed7aa"/><text x="95" y="187" text-anchor="middle" class="svg-ink" font-size="12">Engineer: SSH, J-Web</text>
<rect x="470" y="160" width="150" height="46" rx="8" fill="#e2e8f0"/><text x="545" y="187" text-anchor="middle" class="svg-ink" font-size="12">Rescue config on disk</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="50" x2="250" y2="95"/><line x1="320" y1="56" x2="320" y2="80"/><line x1="470" y1="50" x2="390" y2="95"/><line x1="170" y1="170" x2="250" y2="130"/><line x1="470" y1="170" x2="390" y2="130"/></g>
</svg><p class="cap">Five services surround every production router.</p></div>

<h3>Chapter map</h3>
<ul>
<li><b>Chapter 2</b>: syslog, facilities, severities, files and remote hosts.</li>
<li><b>Chapter 3</b>: NTP and time zones, and how to prove synchronisation.</li>
<li><b>Chapter 4</b>: trace options, <code>show log</code> and <code>monitor</code>.</li>
<li><b>Chapter 5</b>: SNMP communities, allow-lists, traps and the NOC lab.</li>
<li><b>Chapter 6</b>: management services and J-Web.</li>
<li><b>Chapter 7</b>: the rescue configuration and the lab where a ticket goes wrong.</li>
<li><b>Chapter 8</b>: troubleshooting workflow. <b>Chapter 9</b>: exam checklist.</li>
</ul>

<h3>Lab cast</h3>
<p>The labs use real NK sites. In Chennai, <b>NK-CHN-EDGE</b> (10.70.1.1/24) works with an operations server <b>NK-OPS</b> (10.70.1.50) that runs NTP and syslog. In Delhi, <b>NK-DEL-EDGE</b> links the office LAN 10.90.1.0/24 to the data centre LAN 10.90.2.0/24 via R2 at 10.90.12.0/30. In Mumbai, <b>NK-MUM-EDGE</b> serves the NOC server <b>NK-NMS</b> (10.80.1.20), a guest LAN 10.80.2.0/24 and a lab LAN 10.80.3.0/24.</p>

<div class="eg"><p><b>Worked example.</b> Without these services a link flap at 02:14 leaves no trace, the router clock is 7 minutes wrong so nothing lines up with other devices, the NOC finds out from angry customers, and a bad change locks everyone out until a site visit. With them: the flap is in the log and on the syslog server, timestamps match, the NMS raised a trap within seconds, and a rescue configuration restores the box in two minutes.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating monitoring as optional until the first outage. By then there is no history to learn from. Configure logging, NTP and SNMP on day one, in the same template as the interfaces.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the ports: syslog UDP 514, NTP UDP 123, SNMP polling UDP 161 and traps UDP 162, SSH TCP 22, telnet TCP 23, NETCONF over SSH TCP 830, HTTPS TCP 443.</p></div>

<div class="scn"><h4>The outage nobody could reconstruct</h4><p>A bank's core router rebooted at night. The logs existed only on the router's own disk, which was wiped by the same failure. The router clock was also 11 minutes off, so even the logs of neighbouring devices could not be lined up. The post-incident report said "cause unknown". The team afterwards added a remote syslog host, two NTP servers and an SNMP trap target to the standard template.</p><p><b>Lesson:</b> logs on the failing device are not enough, and logs without synchronised clocks are hard to use.</p></div>

<div class="iv"><p class="q">"Which system services do you configure on every new router and why?"</p><p>Syslog to a remote server for history, NTP so timestamps agree, SNMP (or streaming telemetry) so the NMS can poll and receive traps, SSH with named users for management, and a saved rescue configuration for recovery. I would also restrict who can reach each service.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog records events, NTP aligns clocks, SNMP monitors, management services give access, rescue config recovers.</li>
<li>Remember ports: 514, 123, 161/162, 22, 830, 443.</li>
<li>Remote logging protects history when the router fails.</li>
<li>Time must be correct before logs and certificates make sense.</li>
<li>Configure these services in the day-one template, not after an outage.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Jo router sirf packets forward karta hai woh aadha kaam hai. Doosra aadha hai yeh <b>dekh</b> sakna ki woh kya kar raha hai, uski clock par <b>bharosa</b> karna, kuch fail hone par <b>bataya</b> jaana, use safely <b>reach</b> karna, aur galti ke baad use <b>recover</b> karna. Aap syslog, trace options, NTP, SNMP, management services (SSH, telnet, NETCONF, J-Web) aur rescue configuration seekhoge. Yeh JNCIA-Junos (JN0-106) ke system services aur monitoring objectives hain.</p>
<p><b>Prerequisites.</b> CLI module (candidate, commit, rollback) aur Initial setup module (users, interfaces, SSH). Aap interface address configure karke neighbour ko ping kar paane chahiye.</p>

<h3>Analogy: building ka control room</h3>
<p>Bade office building mein control room hota hai. Ek <b>logbook</b> har event record karti hai (syslog). Ek <b>master clock</b> har deewar ghadi ko same rakhti hai (NTP). Ek <b>monitoring panel</b> lifts aur lights ko poll karta hai aur kuch fail hone par alarm bajata hai (SNMP). Ek <b>key cabinet</b> tay karta hai kaun kis kamre mein ja sakta hai (management services). Aur ek <b>safe</b> mein original plans rakhe hote hain taaki building restore ho sake (rescue configuration). Router ko bhi yehi paanch cheezein chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Router ke aas-paas services">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="14">Junos device</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="11">R1</text>
<rect x="20" y="15" width="150" height="46" rx="8" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="12">syslog server (UDP 514)</text>
<rect x="245" y="10" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="12">NTP server (UDP 123)</text>
<rect x="470" y="15" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">NMS: SNMP 161 / 162</text>
<rect x="20" y="160" width="150" height="46" rx="8" fill="#fed7aa"/><text x="95" y="187" text-anchor="middle" class="svg-ink" font-size="12">Engineer: SSH, J-Web</text>
<rect x="470" y="160" width="150" height="46" rx="8" fill="#e2e8f0"/><text x="545" y="187" text-anchor="middle" class="svg-ink" font-size="12">Disk par rescue config</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="50" x2="250" y2="95"/><line x1="320" y1="56" x2="320" y2="80"/><line x1="470" y1="50" x2="390" y2="95"/><line x1="170" y1="170" x2="250" y2="130"/><line x1="470" y1="170" x2="390" y2="130"/></g>
</svg><p class="cap">Har production router ke aas-paas paanch services hoti hain.</p></div>

<h3>Chapter map</h3>
<ul>
<li><b>Chapter 2</b>: syslog, facilities, severities, files aur remote hosts.</li>
<li><b>Chapter 3</b>: NTP aur time zones, aur synchronisation saabit kaise karein.</li>
<li><b>Chapter 4</b>: trace options, <code>show log</code> aur <code>monitor</code>.</li>
<li><b>Chapter 5</b>: SNMP communities, allow-lists, traps aur NOC lab.</li>
<li><b>Chapter 6</b>: management services aur J-Web.</li>
<li><b>Chapter 7</b>: rescue configuration aur woh lab jahan ticket galat nikalta hai.</li>
<li><b>Chapter 8</b>: troubleshooting workflow. <b>Chapter 9</b>: exam checklist.</li>
</ul>

<h3>Lab cast</h3>
<p>Labs real NK sites use karte hain. Chennai mein <b>NK-CHN-EDGE</b> (10.70.1.1/24) operations server <b>NK-OPS</b> (10.70.1.50) ke saath kaam karta hai jo NTP aur syslog chalata hai. Delhi mein <b>NK-DEL-EDGE</b> office LAN 10.90.1.0/24 ko data centre LAN 10.90.2.0/24 se R2 ke through 10.90.12.0/30 par jodta hai. Mumbai mein <b>NK-MUM-EDGE</b> NOC server <b>NK-NMS</b> (10.80.1.20), guest LAN 10.80.2.0/24 aur lab LAN 10.80.3.0/24 ko serve karta hai.</p>

<div class="eg"><p><b>Worked example.</b> In services ke bina 02:14 par link flap ka koi nishan nahi chhodta, router ki clock 7 minute galat hoti hai isliye kuch match nahi hota, NOC ko naraz customers se pata chalta hai, aur kharab change sabko lock out kar deta hai jab tak site visit na ho. Services ke saath: flap log mein aur syslog server par hai, timestamps match karte hain, NMS ne seconds mein trap raise kiya, aur rescue configuration box ko do minute mein restore kar deti hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Monitoring ko pehle outage tak optional maanna. Tab tak seekhne ke liye koi history nahi hoti. Logging, NTP aur SNMP day one par configure karo, interfaces ke saath wahi template mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ports yaad rakho: syslog UDP 514, NTP UDP 123, SNMP polling UDP 161 aur traps UDP 162, SSH TCP 22, telnet TCP 23, NETCONF over SSH TCP 830, HTTPS TCP 443.</p></div>

<div class="scn"><h4>Woh outage jo koi reconstruct nahi kar paya</h4><p>Ek bank ka core router raat ko reboot hua. Logs sirf router ki apni disk par the, jo usi failure mein mit gayi. Router ki clock bhi 11 minute galat thi, isliye padosi devices ke logs bhi match nahi ho sakte the. Post-incident report mein likha gaya "cause unknown". Baad mein team ne standard template mein remote syslog host, do NTP servers aur ek SNMP trap target jod diye.</p><p><b>Lesson:</b> failing device par rakhe logs kaafi nahi, aur synchronised clocks ke bina logs use karna mushkil hai.</p></div>

<div class="iv"><p class="q">"Har naye router par kaunsi system services configure karte ho aur kyun?"</p><p>History ke liye remote server par syslog, timestamps match karne ke liye NTP, NMS ke poll aur traps ke liye SNMP (ya streaming telemetry), named users ke saath SSH management ke liye, aur recovery ke liye saved rescue configuration. Main yeh bhi restrict karta hoon ki har service tak kaun pahunch sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog events record karta hai, NTP clocks align karta hai, SNMP monitor karta hai, management services access deti hain, rescue config recover karti hai.</li>
<li>Ports yaad rakho: 514, 123, 161/162, 22, 830, 443.</li>
<li>Remote logging router fail hone par bhi history bachati hai.</li>
<li>Logs aur certificates ka matlab tabhi hai jab time sahi ho.</li>
<li>In services ko day-one template mein configure karo, outage ke baad nahi.</li>
</ul></div>
`}};export{e as default};