var e={id:`architectures`,h:{en:`WLAN architectures: autonomous, split-MAC, cloud, FlexConnect and EWC`,hi:`WLAN architectures: autonomous, split-MAC, cloud, FlexConnect aur EWC`},body:{en:`
<p>Picture three ways to run a chain of coffee shops. In the first, every shop manager sets prices and menus alone. In the second, head office writes every rule and each shop simply serves customers following those rules, phoning head office constantly. In the third, head office manages every shop through an online dashboard, but the coffee is still made and served locally. Wi-Fi has the same three models, plus a few hybrids. In ccna-wireless you met them briefly; here we look at them through the eyes of the engineer who must deploy and configure them.</p>

<h3>1. Autonomous APs</h3>
<p>An <b>autonomous AP</b> is a complete, self-contained device. It holds its own configuration: SSIDs, security keys, VLAN mapping, channel and power. You manage it through its own CLI or web page. The switch port facing it is usually a <b>trunk</b>, because the AP bridges each SSID to its own VLAN and sends the frames already tagged. Each AP needs its own management IP address.</p>
<p>Autonomous APs are fine for a small shop with two APs. At scale they hurt: every change is repeated per AP, channel planning is manual, and roaming between APs is slow because each AP authenticates clients independently.</p>

<h3>2. Controller-based: lightweight APs and split-MAC</h3>
<p>A <b>lightweight AP</b> (LAP) cannot work alone. At boot it looks for a <b>wireless LAN controller</b>, joins it, and downloads everything. The 802.11 MAC functions are split between the two, hence the name <b>split-MAC</b>:</p>
<table class="cmp"><tr><th>Stays on the AP (real time)</th><th>Moves to the WLC (management)</th></tr>
<tr><td>Beacons and probe responses</td><td>Authentication and association decisions</td></tr>
<tr><td>ACKs and retransmissions</td><td>Security policy, 802.1X and RADIUS</td></tr>
<tr><td>Frame queueing and prioritisation</td><td>Roaming and the client database</td></tr>
<tr><td>Encryption/decryption of 802.11 frames</td><td>RF management (RRM): channels and power</td></tr>
<tr><td>MAC layer handling on the radio</td><td>QoS policy, WLAN-to-VLAN mapping</td></tr>
</table>
<p>AP and WLC talk over <b>CAPWAP</b> (next chapter). In <b>local mode</b>, the default, every client frame travels through the CAPWAP data tunnel to the WLC, which puts it onto the WLAN's VLAN. This is called <b>central switching</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three WLAN architectures">
<rect x="10" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">Autonomous</text>
<rect x="40" y="60" width="140" height="36" rx="6" fill="#fed7aa"/><text x="110" y="83" text-anchor="middle" class="svg-ink" font-size="12">AP: full config</text>
<rect x="40" y="130" width="140" height="36" rx="6" fill="#bae6fd"/><text x="110" y="153" text-anchor="middle" class="svg-ink" font-size="12">switch: trunk</text>
<line x1="110" y1="96" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><text x="110" y="200" text-anchor="middle" class="svg-muted" font-size="12">managed one by one</text>
<rect x="220" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">Split-MAC + WLC</text>
<rect x="250" y="60" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">WLC: policy</text>
<rect x="250" y="130" width="140" height="36" rx="6" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="12">LAP: real time</text>
<line x1="320" y1="96" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">one config for all APs</text>
<rect x="430" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="14">Cloud-managed</text>
<rect x="460" y="60" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="530" y="83" text-anchor="middle" class="svg-ink" font-size="12">cloud dashboard</text>
<rect x="460" y="130" width="140" height="36" rx="6" fill="#fed7aa"/><text x="530" y="153" text-anchor="middle" class="svg-ink" font-size="12">AP: data local</text>
<line x1="530" y1="96" x2="530" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/><text x="530" y="118" text-anchor="middle" class="svg-accent" font-size="12">mgmt only</text><text x="530" y="200" text-anchor="middle" class="svg-muted" font-size="12">user data stays on site</text>
</svg><p class="cap">Where configuration lives and where user data flows in the three main architectures.</p></div>

<h3>3. Cloud-managed</h3>
<p>In a <b>cloud-managed</b> design (Cisco Meraki is the classic example) the APs build a management tunnel over the internet to a dashboard run by the vendor. Configuration, monitoring and firmware come from the cloud. <b>User data does not</b>: client traffic is bridged locally onto the site's switch. If the internet link fails, clients keep working with the last configuration; you just cannot change anything until the link returns.</p>

<h3>4. Where the controller lives: deployment models</h3>
<dl class="terms">
<dt>Centralized (unified)</dt><dd>A hardware or virtual WLC in the data center or campus core. APs everywhere tunnel to it. Best for large campuses.</dd>
<dt>Cloud-hosted controller</dt><dd>A virtual WLC running in a public or private cloud instead of a hardware box. Same behaviour as centralized.</dd>
<dt>Distributed / embedded on a switch</dt><dd>The controller runs inside an access or distribution switch (for example Catalyst 9300 with an embedded controller). Good for small to mid sites.</dd>
<dt>Embedded Wireless Controller (EWC)</dt><dd>The controller software runs on one of the APs itself. That AP serves clients <i>and</i> controls the other APs in the site. No separate appliance; ideal for a branch or small business of up to about 100 APs.</dd>
<dt>FlexConnect</dt><dd>An AP mode for branches across a WAN. The AP still joins a central WLC, but can <b>switch client traffic locally</b> onto branch VLANs and keep serving clients if the WAN fails (standalone mode).</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A retailer has a head office with 300 APs and 60 stores with 3 APs each. Head office: two WLCs in the data center, APs in local mode, central switching. Stores: the same WLCs manage the store APs in <b>FlexConnect</b> mode, so a till in store 17 printing to a local receipt printer never sends traffic over the 10 Mbps WAN, and if the WAN goes down the store's staff WLAN keeps working. A new 5-AP pop-up store with no WAN link at all could simply use an <b>EWC</b> on one of its APs.</p></div>

<h3>Cisco controller platforms you will hear about</h3>
<p>Older and still common controllers run <b>AireOS</b> (for example the 3504, 5520, 8540). Their GUI, with the WLANs, Controller, Wireless and Security menus, is what the CCNA exam usually shows, and it is what our lab simulates. Newer <b>Catalyst 9800</b> controllers run IOS XE and build a WLAN from a WLAN profile, a policy profile (VLAN, QoS) and tags that attach them to APs. The ideas are identical: SSID, security, VLAN mapping, AP join. Only the screens differ.</p>

<div class="warn"><p><b>Common mistake.</b> Plugging an autonomous AP image into a network with a WLC and expecting it to join. Autonomous and lightweight are different software images. An autonomous AP never runs CAPWAP discovery; it must be converted to the lightweight (CAPWAP) image first.</p></div>

<div class="exam"><p><b>Exam trap.</b> In split-MAC, <b>encryption of 802.11 frames</b>, beacons and ACKs stay on the AP; <b>authentication, association, roaming and RRM</b> are on the WLC. Cloud-managed APs send <b>management</b> to the cloud but keep <b>data</b> local. FlexConnect = branch + local switching + survives WAN loss. EWC = controller on an AP.</p></div>

<div class="scn"><h4>The branch that went silent</h4><p>A bank's 40 branches used local-mode APs that tunnelled all traffic to a WLC at head office. When a fibre cut took down the MPLS core for two hours, every branch lost Wi-Fi, even though the branch printers and servers were on the same floor as the laptops. The engineer's review showed each AP in local mode and every WLAN centrally switched. The fix was a redesign: branch APs moved to FlexConnect with local switching for the staff WLAN, and their switch ports changed to trunks. At the next WAN outage, branch Wi-Fi kept working locally.</p><p><b>Lesson:</b> the architecture and AP mode must match the site. Central switching suits the campus; branches need FlexConnect or an embedded controller.</p></div>

<div class="iv"><p class="q">"Explain split-MAC. Which functions stay on the AP and which move to the controller?"</p><p>Strong answer: split-MAC divides the 802.11 MAC layer. Time-critical tasks that must happen within microseconds stay on the AP: beacons, probe responses, ACKs, retransmissions, encryption and queueing. Management tasks move to the WLC: authentication, association, roaming, security policy, RRM, QoS policy and mapping WLANs to VLANs. Add that the two communicate over CAPWAP, and that in local mode client data is also tunnelled to the WLC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Autonomous APs are configured one by one and usually sit on trunk ports.</li>
<li>Split-MAC: real-time radio work on the lightweight AP, management and policy on the WLC, linked by CAPWAP.</li>
<li>Cloud-managed: management in the cloud, user data switched locally.</li>
<li>Controllers can be centralized, cloud-hosted, embedded in a switch, or embedded on an AP (EWC).</li>
<li>FlexConnect is the branch mode: local switching and survival when the WAN is down.</li>
</ul></div>
`,hi:`
<p>Coffee shops ki chain chalane ke teen tareeke socho. Pehle mein har shop manager akele prices aur menu set karta hai. Doosre mein head office har rule likhta hai aur har shop bas un rules ke hisaab se customers ko serve karti hai, head office ko baar baar phone karte hue. Teesre mein head office har shop ko online dashboard se manage karta hai, lekin coffee phir bhi local hi banti aur serve hoti hai. Wi-Fi ke bhi yahi teen models hain, plus kuch hybrids. ccna-wireless mein aap inse thoda mile the; yahan hum inhe us engineer ki nazar se dekhenge jise inhe deploy aur configure karna hai.</p>

<h3>1. Autonomous APs</h3>
<p><b>Autonomous AP</b> ek complete, self-contained device hai. Woh apni configuration khud rakhta hai: SSIDs, security keys, VLAN mapping, channel aur power. Aap use uske apne CLI ya web page se manage karte ho. Uski taraf wala switch port aam taur par <b>trunk</b> hota hai, kyunki AP har SSID ko uske apne VLAN par bridge karta hai aur frames pehle se tagged bhejta hai. Har AP ko apna management IP address chahiye.</p>
<p>Do APs wali chhoti dukaan ke liye autonomous APs theek hain. Scale par yeh dard dete hain: har change har AP par dohrana padta hai, channel planning manual hoti hai, aur APs ke beech roaming slow hoti hai kyunki har AP clients ko alag se authenticate karta hai.</p>

<h3>2. Controller-based: lightweight APs aur split-MAC</h3>
<p><b>Lightweight AP</b> (LAP) akele kaam nahi kar sakta. Boot par woh <b>wireless LAN controller</b> dhoondhta hai, use join karta hai, aur sab kuch download karta hai. 802.11 MAC functions dono ke beech baat diye jaate hain, isliye naam <b>split-MAC</b>:</p>
<table class="cmp"><tr><th>AP par rehta hai (real time)</th><th>WLC par jaata hai (management)</th></tr>
<tr><td>Beacons aur probe responses</td><td>Authentication aur association ke faisle</td></tr>
<tr><td>ACKs aur retransmissions</td><td>Security policy, 802.1X aur RADIUS</td></tr>
<tr><td>Frame queueing aur prioritisation</td><td>Roaming aur client database</td></tr>
<tr><td>802.11 frames ka encryption/decryption</td><td>RF management (RRM): channels aur power</td></tr>
<tr><td>Radio par MAC layer handling</td><td>QoS policy, WLAN-to-VLAN mapping</td></tr>
</table>
<p>AP aur WLC <b>CAPWAP</b> par baat karte hain (agla chapter). <b>Local mode</b> mein, jo default hai, har client frame CAPWAP data tunnel se WLC tak jaata hai, jo use WLAN ke VLAN par daal deta hai. Ise <b>central switching</b> kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen WLAN architectures">
<rect x="10" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">Autonomous</text>
<rect x="40" y="60" width="140" height="36" rx="6" fill="#fed7aa"/><text x="110" y="83" text-anchor="middle" class="svg-ink" font-size="12">AP: poora config</text>
<rect x="40" y="130" width="140" height="36" rx="6" fill="#bae6fd"/><text x="110" y="153" text-anchor="middle" class="svg-ink" font-size="12">switch: trunk</text>
<line x1="110" y1="96" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><text x="110" y="200" text-anchor="middle" class="svg-muted" font-size="12">ek ek karke manage</text>
<rect x="220" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">Split-MAC + WLC</text>
<rect x="250" y="60" width="140" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">WLC: policy</text>
<rect x="250" y="130" width="140" height="36" rx="6" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="12">LAP: real time</text>
<line x1="320" y1="96" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">saare APs ka ek config</text>
<rect x="430" y="10" width="200" height="210" rx="10" fill="#e2e8f0"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="14">Cloud-managed</text>
<rect x="460" y="60" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="530" y="83" text-anchor="middle" class="svg-ink" font-size="12">cloud dashboard</text>
<rect x="460" y="130" width="140" height="36" rx="6" fill="#fed7aa"/><text x="530" y="153" text-anchor="middle" class="svg-ink" font-size="12">AP: data local</text>
<line x1="530" y1="96" x2="530" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/><text x="530" y="118" text-anchor="middle" class="svg-accent" font-size="12">sirf mgmt</text><text x="530" y="200" text-anchor="middle" class="svg-muted" font-size="12">user data site par rehta hai</text>
</svg><p class="cap">Teen main architectures mein configuration kahan rehti hai aur user data kahan flow karta hai.</p></div>

<h3>3. Cloud-managed</h3>
<p><b>Cloud-managed</b> design mein (Cisco Meraki classic example hai) APs internet par vendor ke chalaye dashboard tak ek management tunnel banate hain. Configuration, monitoring aur firmware cloud se aate hain. <b>User data nahi</b>: client traffic site ke switch par locally bridge hota hai. Agar internet link fail ho jaaye, clients last configuration ke saath kaam karte rehte hain; bas link wapas aane tak aap kuch badal nahi sakte.</p>

<h3>4. Controller kahan rehta hai: deployment models</h3>
<dl class="terms">
<dt>Centralized (unified)</dt><dd>Data center ya campus core mein hardware ya virtual WLC. Har jagah ke APs usse tunnel karte hain. Bade campuses ke liye best.</dd>
<dt>Cloud-hosted controller</dt><dd>Hardware box ki jagah public ya private cloud mein chalta virtual WLC. Behaviour centralized jaisa hi.</dd>
<dt>Distributed / switch par embedded</dt><dd>Controller ek access ya distribution switch ke andar chalta hai (jaise embedded controller wala Catalyst 9300). Chhoti se medium sites ke liye accha.</dd>
<dt>Embedded Wireless Controller (EWC)</dt><dd>Controller software khud ek AP par chalta hai. Woh AP clients ko serve bhi karta hai <i>aur</i> site ke baaki APs ko control bhi. Alag appliance nahi; lagbhag 100 APs tak ki branch ya small business ke liye ideal.</dd>
<dt>FlexConnect</dt><dd>WAN ke paar branches ke liye ek AP mode. AP phir bhi central WLC join karta hai, lekin client traffic ko branch VLANs par <b>locally switch</b> kar sakta hai aur WAN fail hone par bhi clients ko serve karta rehta hai (standalone mode).</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek retailer ka head office 300 APs ke saath hai aur 60 stores hain jinmein 3-3 APs hain. Head office: data center mein do WLCs, APs local mode mein, central switching. Stores: wahi WLCs store APs ko <b>FlexConnect</b> mode mein manage karte hain, taaki store 17 ka till local receipt printer par print kare to traffic kabhi 10 Mbps WAN par na jaaye, aur WAN down ho to store ka staff WLAN chalta rahe. Bina kisi WAN link wala naya 5-AP pop-up store apne ek AP par seedha <b>EWC</b> use kar sakta hai.</p></div>

<h3>Cisco controller platforms jinke baare mein aap sunoge</h3>
<p>Purane aur abhi bhi common controllers <b>AireOS</b> chalate hain (jaise 3504, 5520, 8540). Unka GUI, WLANs, Controller, Wireless aur Security menus ke saath, wahi hai jo CCNA exam aam taur par dikhata hai, aur wahi hamara lab simulate karta hai. Naye <b>Catalyst 9800</b> controllers IOS XE chalate hain aur WLAN ko ek WLAN profile, ek policy profile (VLAN, QoS) aur tags se banate hain jo unhe APs se jodte hain. Ideas bilkul same hain: SSID, security, VLAN mapping, AP join. Sirf screens alag hain.</p>

<div class="warn"><p><b>Common galti.</b> WLC wale network mein autonomous AP image laga dena aur umeed karna ki woh join karega. Autonomous aur lightweight alag software images hain. Autonomous AP kabhi CAPWAP discovery nahi chalata; use pehle lightweight (CAPWAP) image mein convert karna padta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Split-MAC mein <b>802.11 frames ka encryption</b>, beacons aur ACKs AP par rehte hain; <b>authentication, association, roaming aur RRM</b> WLC par hote hain. Cloud-managed APs <b>management</b> cloud ko bhejte hain par <b>data</b> local rakhte hain. FlexConnect = branch + local switching + WAN loss jhel leta hai. EWC = AP par controller.</p></div>

<div class="scn"><h4>Woh branch jo chup ho gayi</h4><p>Ek bank ki 40 branches local-mode APs use karti thi jo saara traffic head office ke WLC tak tunnel karte the. Jab ek fibre cut ne do ghante ke liye MPLS core gira diya, har branch ka Wi-Fi chala gaya, jabki branch ke printers aur servers laptops wale floor par hi the. Engineer ke review mein dikha ki har AP local mode mein tha aur har WLAN centrally switched tha. Fix ek redesign tha: branch APs staff WLAN ke liye local switching ke saath FlexConnect par gaye, aur unke switch ports trunks mein badle. Agle WAN outage mein branch Wi-Fi locally chalta raha.</p><p><b>Seekh:</b> architecture aur AP mode site ke hisaab se hone chahiye. Central switching campus ke liye theek hai; branches ko FlexConnect ya embedded controller chahiye.</p></div>

<div class="iv"><p class="q">"Split-MAC samjhao. Kaunse functions AP par rehte hain aur kaunse controller par jaate hain?"</p><p>Strong answer: split-MAC 802.11 MAC layer ko divide karta hai. Time-critical kaam jo microseconds mein hone chahiye AP par rehte hain: beacons, probe responses, ACKs, retransmissions, encryption aur queueing. Management kaam WLC par jaate hain: authentication, association, roaming, security policy, RRM, QoS policy aur WLANs ko VLANs se map karna. Yeh bhi jodo ki dono CAPWAP par baat karte hain, aur local mode mein client data bhi WLC tak tunnel hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Autonomous APs ek ek karke configure hote hain aur aam taur par trunk ports par hote hain.</li>
<li>Split-MAC: real-time radio kaam lightweight AP par, management aur policy WLC par, CAPWAP se jude hue.</li>
<li>Cloud-managed: management cloud mein, user data locally switch hota hai.</li>
<li>Controllers centralized, cloud-hosted, switch mein embedded, ya AP par embedded (EWC) ho sakte hain.</li>
<li>FlexConnect branch mode hai: local switching aur WAN down hone par bhi survival.</li>
</ul></div>
`}};export{e as default};