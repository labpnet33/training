var e={id:`poe`,h:{en:`Power over Ethernet: PoE, PoE+, UPOE and the power budget`,hi:`Power over Ethernet: PoE, PoE+, UPOE aur power budget`},body:{en:`
<p>Imagine if the water pipe to your house also delivered electricity, so you never needed a separate socket for the geyser. That is what <b>Power over Ethernet (PoE)</b> does: the same UTP cable that carries data also carries DC power. An IP phone, a ceiling-mounted Wi-Fi access point or a security camera can be installed wherever a network cable reaches, with no electrician and no power outlet.</p>

<h3>Who gives power and who takes it</h3>
<ul>
<li><b>PSE</b> (power sourcing equipment): the device that supplies power, normally a PoE switch port. A mid-span <b>power injector</b> can also act as PSE for a single device.</li>
<li><b>PD</b> (powered device): the phone, AP, camera, badge reader or thin client that receives power.</li>
</ul>
<p>The PSE does not blindly push 48 volts into every cable. That would damage a normal laptop NIC. Instead it follows a careful sequence:</p>
<ol>
<li><b>Detection</b>: the port applies a small, safe voltage and looks for a specific resistance signature (about 25 kΩ) that only a PoE device presents.</li>
<li><b>Classification</b>: the PD announces its <b>power class</b>, telling the switch roughly how much power it needs.</li>
<li><b>Power-up</b>: the switch applies full power, about 44 to 57 V DC.</li>
<li><b>Fine negotiation</b>: many PDs then use <b>CDP</b> or <b>LLDP</b> to request an exact wattage, so the switch does not reserve more than needed.</li>
<li><b>Monitoring</b>: if the PD is unplugged or draws too much, the port removes power.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PSE powering PDs over UTP">
<rect x="30" y="60" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="115" y="92" text-anchor="middle" class="svg-ink" font-size="14">SW2 (PSE)</text><text x="115" y="112" text-anchor="middle" class="svg-muted" font-size="12">PoE budget 370 W</text>
<line x1="200" y1="75" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="430" y2="100" stroke="#64748b" stroke-width="2"/><line x1="200" y1="125" x2="430" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="315" y="85" text-anchor="middle" class="svg-accent" font-size="12">data + DC power, one UTP</text>
<rect x="430" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">IP phone, class 2</text>
<rect x="430" y="80" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi AP, class 4</text>
<rect x="430" y="140" width="180" height="40" rx="8" fill="#fde68a"/><text x="520" y="165" text-anchor="middle" class="svg-ink" font-size="13">PTZ camera, class 6</text>
</svg><p class="cap">One switch port per device supplies both the network and the power.</p></div>

<h3>The PoE standards</h3>
<table class="cmp"><tr><th>Name</th><th>Standard</th><th>Max at switch port (PSE)</th><th>Guaranteed at device (PD)</th><th>Pairs used</th></tr>
<tr><td>PoE</td><td>IEEE 802.3af (Type 1)</td><td>15.4 W</td><td>12.95 W</td><td>2</td></tr>
<tr><td>PoE+</td><td>IEEE 802.3at (Type 2)</td><td>30 W</td><td>25.5 W</td><td>2</td></tr>
<tr><td>Cisco UPOE</td><td>Cisco, pre-802.3bt</td><td>60 W</td><td>about 51 W</td><td>4</td></tr>
<tr><td>PoE++ Type 3</td><td>IEEE 802.3bt</td><td>60 W</td><td>51 W</td><td>4</td></tr>
<tr><td>PoE++ Type 4 / Cisco UPOE+</td><td>IEEE 802.3bt</td><td>90 W</td><td>71.3 W</td><td>4</td></tr>
</table>
<p>The difference between PSE and PD watts is the power lost as heat in up to 100 m of cable. Earlier, Cisco also had a proprietary "inline power" used by very old IP phones.</p>

<h3>The power budget</h3>
<p>A PoE switch has a total <b>PoE budget</b>, set by its power supplies, for example 370 W on a 24-port access switch. Every powered port takes some of that budget. When the budget is used up, the next device is <b>denied power</b> even though its port is PoE-capable. Adding a second power supply, if the model supports it, often increases the budget.</p>

<div class="eg"><p><b>Worked example.</b> SW2 has a 370 W budget. It powers 12 IP phones that each negotiate 7 W through CDP (84 W), 8 Wi-Fi 6 APs at 30 W each (240 W) and 2 cameras at 15.4 W (30.8 W). Total: 84 + 240 + 30.8 = 354.8 W, leaving 15.2 W. A new AP needing 30 W will be denied. Options: add a power supply, move the AP to another switch, or cap low-priority devices.</p></div>

<h3>Configuring and verifying PoE on Cisco</h3>
<p>PoE is on by default (<code>power inline auto</code>) on PoE-capable ports. You mostly verify, and change settings only for special cases.</p>
<pre class="code">SW2(config)# interface gi1/0/20
SW2(config-if)# power inline never                <span class="c">! never power this port (e.g. a PC)</span>
SW2(config-if)# interface gi1/0/2
SW2(config-if)# power inline auto max 30000       <span class="c">! allow up to 30 W (milliwatts)</span>
SW2(config-if)# interface gi1/0/24
SW2(config-if)# power inline static max 30000     <span class="c">! reserve 30 W in advance</span>
SW2(config-if)# end</pre>
<pre class="out">SW2# show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0      354.8        15.2
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         7.0     IP Phone 8845       2     30.0
Gi1/0/2   auto   on         30.0    Ieee PD             4     30.0
<span class="hl">Gi1/0/12  auto   power-deny 0.0     Ieee PD             4     30.0</span>
Gi1/0/20  off    off        0.0     n/a                 n/a   30.0</pre>
<p>The log also tells you why: <code>%ILPOWER-5-ILPOWER_POWER_DENY: Interface Gi1/0/12: inline power denied. Reason: insufficient power</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Plugging a PoE+ AP into an 802.3af port and wondering why some radios are disabled or it keeps rebooting. Forgetting that the PoE budget is shared by the whole switch. Using thin, cheap patch cords for 60 to 90 W, which heat up in bundles. Assuming a non-PoE switch can power a phone.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remember the pairs: 802.3af = 15.4 W, 802.3at (PoE+) = 30 W, 802.3bt = 60 W and 90 W, UPOE = 60 W, UPOE+ = 90 W. PSE supplies, PD consumes. CDP and LLDP can negotiate the exact power.</p></div>

<div class="scn"><h4>Monday morning: half the phones are dead</h4><p>After a weekend move, 10 new Wi-Fi APs were added to an access switch that already powered 30 phones. On Monday several phones on higher-numbered ports showed no display. <code>show power inline</code> showed Remaining 0.0 W and <code>power-deny</code> on those ports. The APs had been plugged in first and took the budget. The engineer installed the switch's second power supply, which raised the budget, and every phone powered up. They also documented a PoE budget check in the change checklist.</p><p><b>Lesson:</b> PoE capacity is a switch-wide budget, not a per-port guarantee.</p></div>

<div class="iv"><p class="q">"An access point powers up but keeps rebooting. The switch port is PoE. What do you check?"</p><p>Strong answer: compare what the AP needs with what the port supplies. <code>show power inline</code> for class, allocated watts and the remaining budget; check the port standard (af, at, bt/UPOE); check logs for power deny or overdrawn messages; check CDP or LLDP power negotiation; check cable length and quality. Mention the fix options: PoE+ or UPOE ports, more power supplies, or an injector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE carries DC power and data on the same UTP cable; PSE supplies, PD consumes.</li>
<li>The switch detects a PD signature before it applies power, so normal NICs are safe.</li>
<li>802.3af 15.4 W, 802.3at PoE+ 30 W, 802.3bt 60/90 W; Cisco UPOE 60 W, UPOE+ 90 W.</li>
<li>The switch has a total PoE budget; when it runs out, ports show power-deny.</li>
<li>Verify with <code>show power inline</code>; control with <code>power inline auto|never|static</code>.</li>
</ul></div>
`,hi:`
<p>Socho agar aapke ghar ka paani ka pipe bijli bhi le aata, to geyser ke liye alag socket ki zaroorat hi nahi padti. <b>Power over Ethernet (PoE)</b> yahi karta hai: jo UTP cable data le jaata hai wahi DC power bhi le jaata hai. IP phone, ceiling par laga Wi-Fi access point ya security camera wahan lag sakta hai jahan network cable pahunchti hai, bina electrician aur bina power outlet ke.</p>

<h3>Kaun power deta hai aur kaun leta hai</h3>
<ul>
<li><b>PSE</b> (power sourcing equipment): jo device power supply karta hai, aam taur par PoE switch port. Mid-span <b>power injector</b> bhi ek device ke liye PSE ban sakta hai.</li>
<li><b>PD</b> (powered device): phone, AP, camera, badge reader ya thin client jo power leta hai.</li>
</ul>
<p>PSE har cable mein aankh band karke 48 volt nahi dhakelta. Isse normal laptop NIC kharab ho jaata. Iske bajaye woh ek dhyaan se bana sequence follow karta hai:</p>
<ol>
<li><b>Detection</b>: port ek chhota, safe voltage lagata hai aur ek khaas resistance signature (lagbhag 25 kΩ) dhoondta hai jo sirf PoE device dikhata hai.</li>
<li><b>Classification</b>: PD apni <b>power class</b> batata hai, jisse switch ko andaza hota hai ki use kitni power chahiye.</li>
<li><b>Power-up</b>: switch poori power lagata hai, lagbhag 44 se 57 V DC.</li>
<li><b>Fine negotiation</b>: bahut saare PDs phir <b>CDP</b> ya <b>LLDP</b> se exact wattage maangte hain, taaki switch zaroorat se zyada reserve na kare.</li>
<li><b>Monitoring</b>: agar PD unplug ho ya bahut zyada kheeche, port power hata deta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PSE UTP par PDs ko power deta hai">
<rect x="30" y="60" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="115" y="92" text-anchor="middle" class="svg-ink" font-size="14">SW2 (PSE)</text><text x="115" y="112" text-anchor="middle" class="svg-muted" font-size="12">PoE budget 370 W</text>
<line x1="200" y1="75" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="430" y2="100" stroke="#64748b" stroke-width="2"/><line x1="200" y1="125" x2="430" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="315" y="85" text-anchor="middle" class="svg-accent" font-size="12">data + DC power, ek UTP</text>
<rect x="430" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">IP phone, class 2</text>
<rect x="430" y="80" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi AP, class 4</text>
<rect x="430" y="140" width="180" height="40" rx="8" fill="#fde68a"/><text x="520" y="165" text-anchor="middle" class="svg-ink" font-size="13">PTZ camera, class 6</text>
</svg><p class="cap">Har device ke liye ek switch port network aur power dono deta hai.</p></div>

<h3>PoE standards</h3>
<table class="cmp"><tr><th>Naam</th><th>Standard</th><th>Switch port par max (PSE)</th><th>Device par guaranteed (PD)</th><th>Pairs used</th></tr>
<tr><td>PoE</td><td>IEEE 802.3af (Type 1)</td><td>15.4 W</td><td>12.95 W</td><td>2</td></tr>
<tr><td>PoE+</td><td>IEEE 802.3at (Type 2)</td><td>30 W</td><td>25.5 W</td><td>2</td></tr>
<tr><td>Cisco UPOE</td><td>Cisco, pre-802.3bt</td><td>60 W</td><td>lagbhag 51 W</td><td>4</td></tr>
<tr><td>PoE++ Type 3</td><td>IEEE 802.3bt</td><td>60 W</td><td>51 W</td><td>4</td></tr>
<tr><td>PoE++ Type 4 / Cisco UPOE+</td><td>IEEE 802.3bt</td><td>90 W</td><td>71.3 W</td><td>4</td></tr>
</table>
<p>PSE aur PD watts ka farak woh power hai jo 100 m tak ki cable mein garmi ban kar lost hoti hai. Pehle Cisco ka ek proprietary "inline power" bhi tha jo bahut purane IP phones use karte the.</p>

<h3>Power budget</h3>
<p>PoE switch ka ek total <b>PoE budget</b> hota hai, jo uske power supplies tay karte hain, jaise 24-port access switch par 370 W. Har powered port us budget ka hissa leta hai. Jab budget khatam ho jaata hai, agle device ko <b>power deny</b> ho jaati hai, bhale hi uska port PoE-capable ho. Dusra power supply jodne se, agar model support kare, aksar budget badh jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> SW2 ka budget 370 W hai. Woh 12 IP phones ko power deta hai jo CDP se 7 W each negotiate karte hain (84 W), 8 Wi-Fi 6 APs 30 W each (240 W) aur 2 cameras 15.4 W par (30.8 W). Total: 84 + 240 + 30.8 = 354.8 W, bachte hain 15.2 W. 30 W chahne wale naye AP ko deny milega. Options: power supply jodo, AP ko dusre switch par le jao, ya kam priority devices ko cap karo.</p></div>

<h3>Cisco par PoE configure aur verify karna</h3>
<p>PoE-capable ports par PoE default mein on hota hai (<code>power inline auto</code>). Aap zyada tar verify karte ho, aur settings sirf special cases mein badalte ho.</p>
<pre class="code">SW2(config)# interface gi1/0/20
SW2(config-if)# power inline never                <span class="c">! is port ko kabhi power mat do (jaise PC)</span>
SW2(config-if)# interface gi1/0/2
SW2(config-if)# power inline auto max 30000       <span class="c">! 30 W tak allow (milliwatts)</span>
SW2(config-if)# interface gi1/0/24
SW2(config-if)# power inline static max 30000     <span class="c">! 30 W pehle se reserve</span>
SW2(config-if)# end</pre>
<pre class="out">SW2# show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
1           370.0      354.8        15.2
Interface Admin  Oper       Power   Device              Class Max
                            (Watts)
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/1   auto   on         7.0     IP Phone 8845       2     30.0
Gi1/0/2   auto   on         30.0    Ieee PD             4     30.0
<span class="hl">Gi1/0/12  auto   power-deny 0.0     Ieee PD             4     30.0</span>
Gi1/0/20  off    off        0.0     n/a                 n/a   30.0</pre>
<p>Log bhi wajah batata hai: <code>%ILPOWER-5-ILPOWER_POWER_DENY: Interface Gi1/0/12: inline power denied. Reason: insufficient power</code>.</p>

<div class="warn"><p><b>Common galtiyan.</b> PoE+ AP ko 802.3af port mein lagana aur sochna ki kuch radios disabled kyun hain ya woh baar baar reboot kyun ho raha hai. Bhool jaana ki PoE budget poore switch mein share hota hai. 60 se 90 W ke liye patli, sasti patch cords use karna, jo bundles mein garam hoti hain. Yeh maan lena ki non-PoE switch phone ko power de sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Pairs yaad rakho: 802.3af = 15.4 W, 802.3at (PoE+) = 30 W, 802.3bt = 60 W aur 90 W, UPOE = 60 W, UPOE+ = 90 W. PSE supply karta hai, PD consume karta hai. CDP aur LLDP exact power negotiate kar sakte hain.</p></div>

<div class="scn"><h4>Monday subah: aadhe phones dead</h4><p>Ek weekend move ke baad, ek access switch par 10 naye Wi-Fi APs jode gaye jo pehle se 30 phones ko power de raha tha. Monday ko oonche number wale ports ke kai phones par display nahi tha. <code>show power inline</code> mein Remaining 0.0 W aur un ports par <code>power-deny</code> dikha. APs pehle plug hue the aur budget le gaye. Engineer ne switch ka dusra power supply lagaya, jisse budget badha, aur har phone power up ho gaya. Unhone change checklist mein PoE budget check bhi document kiya.</p><p><b>Seekh:</b> PoE capacity switch-wide budget hai, per-port guarantee nahi.</p></div>

<div class="iv"><p class="q">"Access point power up hota hai lekin baar baar reboot hota hai. Switch port PoE hai. Aap kya check karoge?"</p><p>Strong answer: AP ko jo chahiye usse compare karo jo port de raha hai. Class, allocated watts aur remaining budget ke liye <code>show power inline</code>; port standard check karo (af, at, bt/UPOE); power deny ya overdrawn messages ke liye logs check karo; CDP ya LLDP power negotiation check karo; cable length aur quality check karo. Fix options batao: PoE+ ya UPOE ports, zyada power supplies, ya injector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE ek hi UTP cable par DC power aur data le jaata hai; PSE supply karta hai, PD consume karta hai.</li>
<li>Switch power lagane se pehle PD signature detect karta hai, isliye normal NICs safe hain.</li>
<li>802.3af 15.4 W, 802.3at PoE+ 30 W, 802.3bt 60/90 W; Cisco UPOE 60 W, UPOE+ 90 W.</li>
<li>Switch ka ek total PoE budget hota hai; khatam hone par ports power-deny dikhate hain.</li>
<li><code>show power inline</code> se verify karo; <code>power inline auto|never|static</code> se control karo.</li>
</ul></div>
`}};export{e as default};