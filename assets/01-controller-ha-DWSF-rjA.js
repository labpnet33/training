var e={id:`controller-ha`,h:{en:`Controller high availability: SSO, N+1 and N+N`,hi:`Controller high availability: SSO, N+1 aur N+N`},body:{en:`
<p><b>What you will learn in this module.</b> This module is the WLAN high availability domain of the Cisco ENWLSD 300-425 exam. You will learn to design a wireless network that keeps working when a controller, an access point (AP), a switch, a WAN link or a back-end service fails, and to prove the design works before the customer signs it off. Every chapter starts from a realistic customer case, then walks through requirements, constraints, options, a trade-off table and the chosen design. You will also meet post-mortems of designs that looked redundant and were not.</p>
<p><b>Prerequisites.</b> You should know what a wireless LAN controller (WLC) and a CAPWAP tunnel are, the difference between local mode and FlexConnect, and the basics of VLANs, DHCP and RADIUS. The mobility, RF and survey modules of this track come before this one; we refer back to them and do not repeat them.</p>

<h3>The case: Meridian General Hospital</h3>
<p>Meridian General is a 600-bed hospital with 1,400 APs, Wi-Fi phones, infusion pumps and patient tablets. Last winter a single power supply failed in the only wireless controller. All 1,400 APs lost their CAPWAP tunnels, rebooted their radios and re-joined a controller that was not there. Nurses lost Wi-Fi calling for 40 minutes. The CIO's brief is short: <i>no clinical wireless outage for a single controller failure, and the AP and client sessions should survive if at all possible.</i></p>

<h3>Requirements and constraints</h3>
<ul>
<li>Recovery from a controller failure in seconds, not minutes; Wi-Fi voice calls should survive.</li>
<li>Two server rooms, Room A and Room B, in different buildings joined by dedicated fibre in one Layer 2 domain.</li>
<li>Budget for two controllers of the same model, not three. Software version must be controlled by the hospital's change board.</li>
<li>One management IP address for the monitoring team and the APs; no re-pointing of 1,400 APs.</li>
</ul>

<h3>The options</h3>
<p><b>Stateful Switchover (SSO)</b> pairs two identical controllers as one logical device. One is <b>active</b>, one is <b>hot standby</b>. The standby continuously receives configuration and state over a dedicated <b>redundancy port (RP)</b> link. On a Catalyst 9800 the pair also uses a <b>redundancy management interface (RMI)</b>, which gives each unit a second path for keep-alives and a gateway-reachability check. With <b>AP SSO</b> the APs keep their CAPWAP state, so they do not drop and rejoin. With <b>client SSO</b> clients that were fully authenticated stay associated. The pair shares one set of IP addresses.</p>
<p><b>N+1</b> means N active controllers share one backup controller. APs are told which controller is their primary and which is the backup. When a primary fails the APs <i>rejoin</i> the backup: CAPWAP is rebuilt, clients re-associate and re-authenticate. It is cheap but not stateful. <b>N+N</b> means every controller has a partner that can carry its load, for example two controllers each at 50 percent capacity, backing each other up. <b>Geographic (site) redundancy</b> places the standby, or a backup controller, in a different building or city for disaster recovery.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="SSO pair across two rooms">
<rect x="40" y="20" width="150" height="56" rx="10" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Active WLC</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">Room A</text>
<rect x="450" y="20" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Standby WLC</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">Room B</text>
<line x1="190" y1="48" x2="450" y2="48" stroke="#f97316" stroke-width="3"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">RP link: state sync</text>
<line x1="190" y1="66" x2="450" y2="66" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">RMI: keep-alive + gateway check</text>
<rect x="240" y="130" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">Distribution switches</text>
<line x1="115" y1="76" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><line x1="525" y1="76" x2="380" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="135" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 1</text>
<rect x="275" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 2</text>
<rect x="460" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 3</text>
<line x1="290" y1="174" x2="135" y2="206" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="320" y2="206" stroke="#64748b" stroke-width="2"/><line x1="350" y1="174" x2="505" y2="206" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="258" width="14" height="14" fill="#bae6fd"/><text x="60" y="270" class="svg-muted" font-size="12">Active</text>
<rect x="130" y="258" width="14" height="14" fill="#ddd6fe"/><text x="150" y="270" class="svg-muted" font-size="12">Standby</text>
<rect x="235" y="258" width="14" height="14" fill="#bbf7d0"/><text x="255" y="270" class="svg-muted" font-size="12">AP</text>
<rect x="305" y="258" width="14" height="14" fill="#e2e8f0"/><text x="325" y="270" class="svg-muted" font-size="12">Wired network</text>
</svg><p class="cap">An SSO pair behaves as one controller. The APs see one IP address and never notice which unit is active.</p></div>

<h3>Trade-off table</h3>
<table class="cmp"><tr><th>Option</th><th>Recovery</th><th>AP and client state</th><th>Cost</th><th>Fits Meridian?</th></tr>
<tr><td>Single controller</td><td>Manual, hours</td><td>Lost</td><td>Lowest</td><td>No, it caused the outage</td></tr>
<tr><td>N+1 (backup in Room B)</td><td>Tens of seconds to minutes (APs rejoin)</td><td>Lost, clients re-authenticate</td><td>One spare controller</td><td>Partly: voice calls drop</td></tr>
<tr><td>SSO pair</td><td>Seconds</td><td>Kept (AP SSO and client SSO)</td><td>Two controllers, one licence pool</td><td>Yes</td></tr>
<tr><td>SSO pair + remote DR controller</td><td>Seconds locally, minutes for site loss</td><td>Kept locally</td><td>Three controllers</td><td>Later phase</td></tr>
</table>

<h3>The chosen design and why</h3>
<p>Meridian gets an <b>SSO pair of the same Catalyst 9800 model</b>, one unit in each server room, running the same software version and the same hardware. The RP link runs on its own fibre pair, and the RMI interfaces sit in the management VLAN with a reachable default gateway. Both units connect their data ports to separate distribution switches. The APs know one management IP, so nothing is re-pointed. A third controller at the disaster-recovery site is added in a second phase as an N+1 style backup for a whole-site loss, because SSO covers a box failure, not a lost campus.</p>
<div class="eg"><p><b>Sizing check.</b> 1,400 APs and about 9,000 clients. A Catalyst 9800-40 supports up to 2,000 APs and 32,000 clients, so one active unit carries the whole load. The standby adds no capacity: an SSO pair has the capacity of <i>one</i> unit. If the hospital grows past 2,000 APs, the pair must move to a larger model, not to a second pair squeezed into the same design.</p></div>

<pre class="out">Meridian-WLC#show redundancy
Redundant System Information :
       Available system uptime = 3 days, 4 hours
Current Software state = ACTIVE
<span class="hl">Peer Processor Information : Standby Hot</span>
Redundancy Mode (Operational) = sso
Communications = Up</pre>

<div class="warn"><p><b>Post-mortem: the shared conduit.</b> In the first lab build, the RP fibre and the RMI path ran through the same riser. A contractor cut it. Neither unit could see the other, so each believed the other was dead and tried to be active, a split-brain with duplicate IP addresses. Fix: run the RP link and the management path over physically different routes, and keep the gateway check working so a unit that loses its gateway does not take over.</p></div>
<div class="exam"><p><b>Exam traps.</b> SSO needs identical hardware and software on both units. The standby does not add AP capacity. AP SSO keeps APs joined; N+1 does not. SSO is for a device failure; geographic redundancy is for a site failure.</p></div>

<div class="scn"><h4>Upgrade night split-brain</h4><p>During a software upgrade, the standby unit was left on the old release for a week "to be safe". After an unplanned switchover the pair ran mixed versions, SSO fell out of sync, and APs rejoined slowly. The team had to reboot the pair in a window. They now treat the pair as one device: upgrade and verify both together, and confirm <code>show redundancy</code> says Standby Hot before and after every change.</p><p><b>Lesson:</b> a hot standby is only useful if it is truly hot. Monitor the state, not just the link.</p></div>

<div class="iv"><p class="q">"When would you choose N+1 over SSO?"</p><p>Strong answer: N+1 when the budget is limited, many controllers share one spare, or the controllers are in different sites or Layer 3 domains that cannot host an RP link. Accept that APs rejoin and clients re-authenticate. Choose SSO when voice or clinical traffic needs seconds of recovery and the two units can be adjacent. Mention that SSO needs the same model and version, and that N+1 needs the backup sized for the failed controller's APs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSO pairs two identical controllers; AP SSO and client SSO preserve state, so recovery takes seconds.</li>
<li>N+1 and N+N rebuild CAPWAP on another controller; they are cheaper but not stateful.</li>
<li>An SSO pair has the capacity of one unit.</li>
<li>Keep the RP link and the management path physically diverse to avoid split-brain.</li>
<li>Geographic redundancy handles site loss; SSO handles a box failure.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh module Cisco ENWLSD 300-425 exam ka WLAN high availability domain hai. Aap aisa wireless network design karna seekhoge jo controller, access point (AP), switch, WAN link ya back-end service fail hone par bhi chalta rahe, aur customer ke sign-off se pehle yeh prove karna bhi. Har chapter ek realistic customer case se shuru hota hai, phir requirements, constraints, options, trade-off table aur chosen design aate hain. Aap un designs ke post-mortems bhi dekhoge jo redundant lagte the lekin nahi the.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki wireless LAN controller (WLC) aur CAPWAP tunnel kya hote hain, local mode aur FlexConnect mein kya farak hai, aur VLAN, DHCP aur RADIUS ki basics. Is track ke mobility, RF aur survey modules is se pehle aate hain; hum unhe repeat nahi karte, sirf refer karte hain.</p>

<h3>Case: Meridian General Hospital</h3>
<p>Meridian General 600 beds ka hospital hai jismein 1,400 APs, Wi-Fi phones, infusion pumps aur patient tablets hain. Pichhli winter mein ekmatra wireless controller ka ek power supply fail ho gaya. Saare 1,400 APs ke CAPWAP tunnels toot gaye, radios reboot hue aur woh aise controller se join karne ki koshish karte rahe jo tha hi nahi. Nurses ki Wi-Fi calling 40 minute band rahi. CIO ka brief chhota hai: <i>ek controller failure par clinical wireless outage nahi hona chahiye, aur AP aur client sessions jitna ho sake bachne chahiye.</i></p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Controller failure se recovery seconds mein, minutes mein nahi; Wi-Fi voice calls bachni chahiye.</li>
<li>Do server rooms, Room A aur Room B, alag buildings mein, dedicated fibre se ek Layer 2 domain mein jude hue.</li>
<li>Budget ek hi model ke do controllers ka hai, teen ka nahi. Software version hospital ka change board control karta hai.</li>
<li>Monitoring team aur APs ke liye ek management IP address; 1,400 APs ko dobara point nahi karna.</li>
</ul>

<h3>Options</h3>
<p><b>Stateful Switchover (SSO)</b> do identical controllers ko ek logical device bana deta hai. Ek <b>active</b> hota hai, ek <b>hot standby</b>. Standby ko dedicated <b>redundancy port (RP)</b> link par configuration aur state lagataar milti rehti hai. Catalyst 9800 par pair ek <b>redundancy management interface (RMI)</b> bhi use karta hai, jo keep-alive ka doosra path aur gateway-reachability check deta hai. <b>AP SSO</b> mein APs apna CAPWAP state rakhte hain, isliye woh drop hoke rejoin nahi karte. <b>Client SSO</b> mein jo clients poori tarah authenticate ho chuke hain woh associated rehte hain. Pair ek hi IP addresses share karta hai.</p>
<p><b>N+1</b> ka matlab hai N active controllers ek backup controller share karte hain. APs ko bataya jaata hai ki primary kaun hai aur backup kaun. Primary fail hone par APs backup se <i>rejoin</i> karte hain: CAPWAP dobara bante hain, clients re-associate aur re-authenticate karte hain. Yeh sasta hai par stateful nahi. <b>N+N</b> mein har controller ka ek partner hota hai jo uska load utha sake, jaise do controllers jo 50 percent capacity par chalte hain aur ek doosre ko backup karte hain. <b>Geographic (site) redundancy</b> standby ya backup controller ko alag building ya city mein rakhti hai, disaster recovery ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Do rooms mein SSO pair">
<rect x="40" y="20" width="150" height="56" rx="10" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Active WLC</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">Room A</text>
<rect x="450" y="20" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Standby WLC</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">Room B</text>
<line x1="190" y1="48" x2="450" y2="48" stroke="#f97316" stroke-width="3"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">RP link: state sync</text>
<line x1="190" y1="66" x2="450" y2="66" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">RMI: keep-alive + gateway check</text>
<rect x="240" y="130" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">Distribution switches</text>
<line x1="115" y1="76" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><line x1="525" y1="76" x2="380" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="135" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 1</text>
<rect x="275" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 2</text>
<rect x="460" y="206" width="90" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="228" text-anchor="middle" class="svg-ink" font-size="13">AP 3</text>
<line x1="290" y1="174" x2="135" y2="206" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="320" y2="206" stroke="#64748b" stroke-width="2"/><line x1="350" y1="174" x2="505" y2="206" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="258" width="14" height="14" fill="#bae6fd"/><text x="60" y="270" class="svg-muted" font-size="12">Active</text>
<rect x="130" y="258" width="14" height="14" fill="#ddd6fe"/><text x="150" y="270" class="svg-muted" font-size="12">Standby</text>
<rect x="235" y="258" width="14" height="14" fill="#bbf7d0"/><text x="255" y="270" class="svg-muted" font-size="12">AP</text>
<rect x="305" y="258" width="14" height="14" fill="#e2e8f0"/><text x="325" y="270" class="svg-muted" font-size="12">Wired network</text>
</svg><p class="cap">SSO pair ek hi controller ki tarah behave karta hai. APs ko ek IP address dikhta hai aur unhe pata nahi chalta ki active kaun hai.</p></div>

<h3>Trade-off table</h3>
<table class="cmp"><tr><th>Option</th><th>Recovery</th><th>AP aur client state</th><th>Cost</th><th>Meridian ke liye fit?</th></tr>
<tr><td>Single controller</td><td>Manual, ghante</td><td>Lost</td><td>Sabse kam</td><td>Nahi, isi se outage hua</td></tr>
<tr><td>N+1 (backup Room B mein)</td><td>Tens of seconds se minutes (APs rejoin)</td><td>Lost, clients re-authenticate</td><td>Ek spare controller</td><td>Aanshik: voice calls drop</td></tr>
<tr><td>SSO pair</td><td>Seconds</td><td>Bacha rehta hai (AP SSO aur client SSO)</td><td>Do controllers, ek licence pool</td><td>Haan</td></tr>
<tr><td>SSO pair + remote DR controller</td><td>Local seconds, site loss par minutes</td><td>Local bacha</td><td>Teen controllers</td><td>Baad ka phase</td></tr>
</table>

<h3>Chosen design aur kyun</h3>
<p>Meridian ko <b>ek hi Catalyst 9800 model ka SSO pair</b> milta hai, har server room mein ek unit, same software version aur same hardware ke saath. RP link apni alag fibre pair par chalta hai, aur RMI interfaces management VLAN mein hain jahan default gateway reachable hai. Dono units apne data ports alag distribution switches se jodte hain. APs ko ek management IP pata hai, isliye kuch re-point nahi karna. Teesra controller disaster-recovery site par doosre phase mein N+1 style backup ke roop mein jodte hain, kyunki SSO box failure cover karta hai, poora campus khone ko nahi.</p>
<div class="eg"><p><b>Sizing check.</b> 1,400 APs aur lagbhag 9,000 clients. Catalyst 9800-40 up to 2,000 APs aur 32,000 clients support karta hai, isliye ek active unit poora load utha leta hai. Standby capacity nahi badhata: SSO pair ki capacity <i>ek</i> unit jitni hoti hai. Agar hospital 2,000 APs se aage badhe, to pair ko bade model par le jaana padega, ek aur pair design mein thoons kar nahi.</p></div>

<pre class="out">Meridian-WLC#show redundancy
Redundant System Information :
       Available system uptime = 3 days, 4 hours
Current Software state = ACTIVE
<span class="hl">Peer Processor Information : Standby Hot</span>
Redundancy Mode (Operational) = sso
Communications = Up</pre>

<div class="warn"><p><b>Post-mortem: shared conduit.</b> Pehli lab build mein RP fibre aur RMI path ek hi riser se gaye. Ek contractor ne woh kaat diya. Dono units ek doosre ko nahi dekh paaye, har ek ne socha ki doosra mar gaya aur active banne ki koshish ki, yaani duplicate IP addresses ke saath split-brain. Fix: RP link aur management path ko physically alag routes par chalao, aur gateway check chalu rakho taaki jo unit apna gateway kho de woh takeover na kare.</p></div>
<div class="exam"><p><b>Exam traps.</b> SSO ke liye dono units par identical hardware aur software chahiye. Standby AP capacity nahi badhata. AP SSO APs ko joined rakhta hai; N+1 nahi rakhta. SSO device failure ke liye hai; geographic redundancy site failure ke liye.</p></div>

<div class="scn"><h4>Upgrade night split-brain</h4><p>Software upgrade ke time standby unit ko "safe rehne ke liye" ek hafte tak purane release par chhod diya gaya. Unplanned switchover ke baad pair mixed versions par chal raha tha, SSO sync se bahar ho gaya aur APs dheere rejoin hue. Team ko window mein pair reboot karna pada. Ab woh pair ko ek device ki tarah treat karte hain: dono ko saath upgrade aur verify karte hain, aur har change se pehle aur baad <code>show redundancy</code> mein Standby Hot confirm karte hain.</p><p><b>Seekh:</b> hot standby tabhi kaam ka hai jab woh sach mein hot ho. Sirf link nahi, state monitor karo.</p></div>

<div class="iv"><p class="q">"N+1 ko SSO par kab choose karoge?"</p><p>Strong answer: N+1 tab jab budget limited ho, kai controllers ek spare share karte hon, ya controllers alag sites ya Layer 3 domains mein hon jahan RP link nahi ban sakta. Maan lo ki APs rejoin karenge aur clients re-authenticate karenge. SSO tab choose karo jab voice ya clinical traffic ko seconds mein recovery chahiye aur dono units paas-paas rakh sakte ho. Yaad dilao ki SSO ko same model aur version chahiye, aur N+1 ka backup failed controller ke APs ke hisaab se size hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSO do identical controllers ko pair karta hai; AP SSO aur client SSO state bachate hain, isliye recovery seconds mein hoti hai.</li>
<li>N+1 aur N+N doosre controller par CAPWAP dobara banate hain; sasta hai par stateful nahi.</li>
<li>SSO pair ki capacity ek unit jitni hoti hai.</li>
<li>Split-brain se bachne ke liye RP link aur management path ko physically diverse rakho.</li>
<li>Geographic redundancy site loss handle karti hai; SSO box failure.</li>
</ul></div>
`}};export{e as default};