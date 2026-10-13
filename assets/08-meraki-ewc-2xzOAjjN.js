var e={id:`meraki-ewc`,h:{en:`Meraki and the Embedded Wireless Controller: choosing a model (concept)`,hi:`Meraki aur Embedded Wireless Controller: model chunna (concept)`},body:{en:`
<p>Think of three ways to run a small chain of cafes. You can hire a central manager who phones every cafe (a <b>controller-managed</b> network with a big controller), you can use a cloud booking app where every cafe tablet logs in to one website (a <b>cloud-managed</b> network, Meraki), or you can make one cafe's tablet the boss of the others (an <b>embedded</b> controller). All three serve coffee. They differ in where the brain lives, what you pay for, and who must maintain it. This chapter is <b>concept only</b>; there is no Meraki dashboard and no Embedded Wireless Controller in the lab, and the lab never claims otherwise.</p>

<h3>Meraki: cloud-managed wireless</h3>
<p><b>Cisco Meraki</b> access points (MR family) are managed from the Meraki cloud dashboard in a browser. Key ideas:</p>
<ul>
<li><b>No controller to buy or patch.</b> The AP holds its own configuration and does its own forwarding; the cloud is the <b>management plane</b>.</li>
<li><b>Out-of-band management.</b> User traffic goes from the AP straight onto the local network. Only management and monitoring data go to the cloud, so a cloud outage does not stop clients that are already connected, although you cannot change configuration until the AP reaches the cloud again.</li>
<li><b>Automatic RF and simple policy.</b> Channels and power are set automatically, and templates copy a network configuration to many sites.</li>
<li><b>Licensing per device</b> with a dashboard API (a REST API protected by an API key) for scripting.</li>
<li><b>Fewer knobs.</b> It is simple on purpose; deep tuning like the 9800's tag model is not there.</li>
</ul>
<p>Some newer Catalyst access points can run in either Catalyst mode (managed by a 9800) or Meraki mode (managed by the Meraki dashboard), and the Meraki dashboard can also monitor selected Catalyst devices. Check the current product documentation for which models and features apply, because this changes between releases.</p>

<h3>Embedded Wireless Controller (EWC)</h3>
<p>The <b>Embedded Wireless Controller</b> runs the Catalyst 9800 software inside an access point or a Catalyst switch, so a small site needs no separate controller hardware.</p>
<ul>
<li><b>EWC on an access point</b>: one supported Catalyst 9100-series AP acts as the active controller; the other APs join it as subordinate APs. Scale is small (on the order of 100 APs and 1000 clients); check the data sheet. A standby AP can take over if the active one fails.</li>
<li><b>EWC on a Catalyst 9000 switch</b>: the switch hosts the controller function for APs on that switch or stack, commonly in an SD-Access fabric-in-a-box or a small branch.</li>
</ul>
<p>The management experience is the 9800's: the same profile, policy and tag model, a web UI and CLI. A day-0 setup wizard gets a small site running quickly. Not every 9800 feature is available on EWC and some deployment limits apply (for example around switching modes), so always verify against the feature matrix before promising something to a customer.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Three management models">
<rect x="10" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="14">Controller-managed</text>
<rect x="45" y="55" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="13">9800 + Catalyst Center</text>
<rect x="30" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="55" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="130" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="155" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="85" y1="95" x2="55" y2="170" stroke="#64748b" stroke-width="2"/><line x1="125" y1="95" x2="155" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Cloud-managed</text>
<rect x="260" y="55" width="120" height="40" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Meraki dashboard</text>
<rect x="245" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="270" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="345" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="370" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="300" y1="95" x2="270" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="340" y1="95" x2="370" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="440" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="14">Embedded (EWC)</text>
<rect x="475" y="55" width="120" height="40" rx="8" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">Active AP = WLC</text>
<rect x="455" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="480" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="565" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="590" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="510" y1="95" x2="480" y2="170" stroke="#64748b" stroke-width="2"/><line x1="560" y1="95" x2="590" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="250" text-anchor="middle" class="svg-muted" font-size="12">dashed = management only</text>
</svg><p class="cap">Where the brain lives: in an appliance, in the cloud, or inside one of the APs.</p></div>

<h3>Choosing between them</h3>
<table class="cmp"><tr><th>Question</th><th>Controller (9800 + Catalyst Center)</th><th>Meraki</th><th>EWC</th></tr>
<tr><td>Best size</td><td>Campus, hundreds to thousands of APs</td><td>Any size, many small sites</td><td>Small site, tens of APs</td></tr>
<tr><td>Management</td><td>Controller plus Catalyst Center</td><td>Cloud dashboard</td><td>Same model as 9800</td></tr>
<tr><td>Depth of control</td><td>Highest (tags, RF, fabric)</td><td>Simple, fewer knobs</td><td>Close to the 9800 for small scale</td></tr>
<tr><td>Extra hardware</td><td>Controller (appliance or virtual)</td><td>None, cloud</td><td>None</td></tr>
<tr><td>Needs the cloud</td><td>Optional (assurance, Spaces)</td><td>Yes, for management</td><td>No</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> A retailer with 300 stores of 2 to 4 APs each and a three-person IT team chooses Meraki: no controller to maintain at each store, templates push one SSID design to all stores, and the team monitors from one dashboard. A hospital campus with 1,200 APs, strict segmentation and SD-Access chooses 9800 controllers with Catalyst Center. A 25-AP school branch with no IT staff on site might use EWC on an AP and nothing else.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating Meraki or EWC as "cheaper 9800s" with every feature. They are different operating models. Verify the feature you need (for example FlexConnect-like local switching, advanced QoS or fabric) against current documentation before you design.</p></div>

<div class="exam"><p><b>Exam trap.</b> In Meraki the cloud is a management plane, not a data path. Data does not pass through the cloud. In EWC the controller is a software function inside a Catalyst AP or switch, not a different product line.</p></div>

<div class="scn"><h4>The branch that lost management, not Wi-Fi</h4><p>A branch internet link failed for six hours. Meraki APs kept serving the staff already connected and the local network worked, but the IT team could not push a change until the link returned. A second branch with an EWC kept full local management during the outage, but its guest portal that needed the internet failed.</p><p><b>Lesson:</b> know which plane depends on the cloud before you promise availability.</p></div>

<div class="iv"><p class="q">"When would you recommend Meraki over a 9800 with Catalyst Center?"</p><p>Many small, similar sites, a small IT team, a need for fast cloud-based management and few advanced features. Choose the 9800 for large campuses, deep RF and policy control, SD-Access or on-premises control requirements. Say clearly you know them as concepts and compared them using design criteria.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Meraki: cloud management plane, local data, simple operations, licence per device.</li>
<li>EWC: 9800 software inside an AP or Catalyst switch, for small sites.</li>
<li>9800 plus Catalyst Center: the deepest control, for large campuses and fabric.</li>
<li>Verify feature availability against current documentation.</li>
<li>All three are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Cafes ki ek chhoti chain chalane ke teen tareeke socho. Aap ek central manager rakh sakte ho jo har cafe ko phone karta hai (bade controller wala <b>controller-managed</b> network), ya cloud booking app jahan har cafe ka tablet ek website mein login karta hai (<b>cloud-managed</b> network, Meraki), ya ek cafe ke tablet ko baaki cafes ka boss bana do (<b>embedded</b> controller). Teeno coffee serve karte hain. Farq yeh hai ki dimaag kahan hai, kya paisa lagta hai, aur use kaun maintain karta hai. Yeh chapter <b>sirf concept</b> hai; lab mein koi Meraki dashboard ya Embedded Wireless Controller nahi hai, aur lab kabhi aisa claim nahi karta.</p>

<h3>Meraki: cloud-managed wireless</h3>
<p><b>Cisco Meraki</b> access points (MR family) browser mein Meraki cloud dashboard se manage hote hain. Key ideas:</p>
<ul>
<li><b>Controller khareedna ya patch karna nahi.</b> AP apni configuration rakhta hai aur apna forwarding khud karta hai; cloud <b>management plane</b> hai.</li>
<li><b>Out-of-band management.</b> User traffic AP se seedha local network par jaata hai. Sirf management aur monitoring data cloud tak jaata hai, isliye cloud outage un clients ko nahi rokta jo pehle se connected hain, lekin AP ke cloud tak wapas pahunchne tak aap configuration nahi badal sakte.</li>
<li><b>Automatic RF aur simple policy.</b> Channels aur power automatic set hote hain, aur templates network configuration ko kai sites par copy karte hain.</li>
<li><b>Licensing per device</b>, aur scripting ke liye dashboard API (API key se protected REST API).</li>
<li><b>Kam knobs.</b> Yeh jaan-boojhkar simple hai; 9800 ke tag model jaisi deep tuning nahi hai.</li>
</ul>
<p>Kuch naye Catalyst access points Catalyst mode (9800 se managed) ya Meraki mode (Meraki dashboard se managed) dono mein chal sakte hain, aur Meraki dashboard chuninda Catalyst devices ko monitor bhi kar sakta hai. Kaun se models aur features lagu hain yeh current product documentation mein dekho, kyunki yeh releases ke saath badalta hai.</p>

<h3>Embedded Wireless Controller (EWC)</h3>
<p><b>Embedded Wireless Controller</b> Catalyst 9800 software ko access point ya Catalyst switch ke andar chalata hai, isliye chhoti site ko alag controller hardware nahi chahiye.</p>
<ul>
<li><b>AP par EWC</b>: ek supported Catalyst 9100-series AP active controller banta hai; baaki APs subordinate APs ki tarah usse join karte hain. Scale chhota hai (lagbhag 100 APs aur 1000 clients ke order mein); data sheet check karo. Standby AP active ke fail hone par sambhal sakta hai.</li>
<li><b>Catalyst 9000 switch par EWC</b>: switch us switch ya stack ke APs ke liye controller function host karta hai, aam taur par SD-Access fabric-in-a-box ya chhote branch mein.</li>
</ul>
<p>Management experience 9800 ka hai: wahi profile, policy aur tag model, web UI aur CLI. Day-0 setup wizard chhoti site ko jaldi chalu kar deta hai. 9800 ka har feature EWC par nahi hota aur kuch deployment limits lagti hain (jaise switching modes ke aas-paas), isliye customer se kuch promise karne se pehle feature matrix se verify karo.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Teen management models">
<rect x="10" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="14">Controller-managed</text>
<rect x="45" y="55" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="13">9800 + Catalyst Center</text>
<rect x="30" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="55" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="130" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="155" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="85" y1="95" x2="55" y2="170" stroke="#64748b" stroke-width="2"/><line x1="125" y1="95" x2="155" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Cloud-managed</text>
<rect x="260" y="55" width="120" height="40" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Meraki dashboard</text>
<rect x="245" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="270" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="345" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="370" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="300" y1="95" x2="270" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="340" y1="95" x2="370" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<rect x="440" y="10" width="190" height="250" rx="10" fill="#e2e8f0"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="14">Embedded (EWC)</text>
<rect x="475" y="55" width="120" height="40" rx="8" fill="#bae6fd"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">Active AP = WLC</text>
<rect x="455" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="480" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text><rect x="565" y="170" width="50" height="34" rx="6" fill="#bbf7d0"/><text x="590" y="192" text-anchor="middle" class="svg-ink" font-size="12">AP</text>
<line x1="510" y1="95" x2="480" y2="170" stroke="#64748b" stroke-width="2"/><line x1="560" y1="95" x2="590" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="250" text-anchor="middle" class="svg-muted" font-size="12">dashed = sirf management</text>
</svg><p class="cap">Dimaag kahan hai: appliance mein, cloud mein, ya kisi ek AP ke andar.</p></div>

<h3>Inme se chunna</h3>
<table class="cmp"><tr><th>Sawal</th><th>Controller (9800 + Catalyst Center)</th><th>Meraki</th><th>EWC</th></tr>
<tr><td>Best size</td><td>Campus, sainkdon se hazaron APs</td><td>Koi bhi size, kai chhoti sites</td><td>Chhoti site, das-bees APs</td></tr>
<tr><td>Management</td><td>Controller plus Catalyst Center</td><td>Cloud dashboard</td><td>9800 jaisa model</td></tr>
<tr><td>Control ki depth</td><td>Sabse zyada (tags, RF, fabric)</td><td>Simple, kam knobs</td><td>Chhote scale par 9800 ke kareeb</td></tr>
<tr><td>Extra hardware</td><td>Controller (appliance ya virtual)</td><td>Koi nahi, cloud</td><td>Koi nahi</td></tr>
<tr><td>Cloud chahiye</td><td>Optional (assurance, Spaces)</td><td>Haan, management ke liye</td><td>Nahi</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> 300 stores wala retailer, har store mein 2 se 4 APs aur teen logon ki IT team, Meraki chunta hai: har store par controller maintain nahi karna, templates ek SSID design sab stores par push karte hain, aur team ek dashboard se monitor karti hai. 1,200 APs, strict segmentation aur SD-Access wala hospital campus Catalyst Center ke saath 9800 controllers chunta hai. Bina on-site IT staff ki 25-AP school branch sirf AP par EWC use kar sakti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Meraki ya EWC ko har feature wale "sasta 9800" maanna. Yeh alag operating models hain. Design se pehle jo feature chahiye (jaise FlexConnect jaisa local switching, advanced QoS ya fabric) use current documentation se verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Meraki mein cloud management plane hai, data path nahi. Data cloud se nahi guzarta. EWC mein controller Catalyst AP ya switch ke andar software function hai, alag product line nahi.</p></div>

<div class="scn"><h4>Branch ne management khoya, Wi-Fi nahi</h4><p>Ek branch ka internet link chhe ghante fail raha. Meraki APs pehle se connected staff ko serve karte rahe aur local network chala, lekin IT team link wapas aane tak koi change push nahi kar saki. Doosri branch jisme EWC tha usne outage mein poora local management rakha, lekin uska guest portal jise internet chahiye tha fail ho gaya.</p><p><b>Lesson:</b> availability ka waada karne se pehle jaano kaun sa plane cloud par depend karta hai.</p></div>

<div class="iv"><p class="q">"Aap 9800 with Catalyst Center ki jagah Meraki kab recommend karoge?"</p><p>Bahut saari chhoti, ek jaisi sites, chhoti IT team, tez cloud-based management ki zaroorat aur kam advanced features. Bade campuses, deep RF aur policy control, SD-Access ya on-premises control requirements ke liye 9800 chuno. Saaf bolo ki aap inhe concepts ke taur par jaante ho aur design criteria se compare kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Meraki: cloud management plane, local data, simple operations, licence per device.</li>
<li>EWC: AP ya Catalyst switch ke andar 9800 software, chhoti sites ke liye.</li>
<li>9800 plus Catalyst Center: sabse deep control, bade campuses aur fabric ke liye.</li>
<li>Feature availability ko current documentation se verify karo.</li>
<li>Teeno lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};