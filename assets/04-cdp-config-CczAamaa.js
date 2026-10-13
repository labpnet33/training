var e={id:`cdp-config`,h:{en:`Configuring CDP: global and per-interface control`,hi:`CDP configure karna: global aur per-interface control`},body:{en:`
<p>Your home has a main circuit breaker and a switch in every room. Turn off the main breaker and every room goes dark, whatever the room switches say. Leave the breaker on and you can still turn off the light in one bedroom. CDP has exactly the same two levels: a <b>global</b> switch for the whole device and a <b>per-interface</b> switch for each port.</p>

<h3>The two commands</h3>
<table class="cmp"><tr><th>Level</th><th>Turn on</th><th>Turn off</th><th>Default</th></tr>
<tr><td>Global (whole device)</td><td><code>cdp run</code></td><td><code>no cdp run</code></td><td>On</td></tr>
<tr><td>Interface</td><td><code>cdp enable</code></td><td><code>no cdp enable</code></td><td>On (on interfaces that support it)</td></tr>
</table>
<p>The global command wins. With <code>no cdp run</code>, no interface sends or receives CDP, even if <code>cdp enable</code> is still present under it. With <code>cdp run</code> active, each interface can be turned off on its own. A disabled CDP interface neither sends nor processes CDP: unlike LLDP, CDP has no separate transmit and receive controls.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Global and interface CDP control">
<rect x="230" y="15" width="180" height="46" rx="8" fill="#fde68a"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">cdp run</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">main breaker</text>
<line x1="320" y1="61" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="400" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="550" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="120" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="100" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0</text><text x="100" y="156" text-anchor="middle" class="svg-muted" font-size="12">to R1: on</text>
<rect x="190" y="120" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="250" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1</text><text x="250" y="156" text-anchor="middle" class="svg-muted" font-size="12">to SW2: on</text>
<rect x="340" y="120" width="120" height="44" rx="8" fill="#fed7aa"/><text x="400" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3</text><text x="400" y="156" text-anchor="middle" class="svg-muted" font-size="12">PC1: off</text>
<rect x="490" y="120" width="120" height="44" rx="8" fill="#fed7aa"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/4</text><text x="550" y="156" text-anchor="middle" class="svg-muted" font-size="12">PC2: off</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">no cdp enable on user ports; uplinks keep discovery</text>
</svg><p class="cap">SW1 in the CDP lab: global CDP stays on, the two user ports are switched off individually.</p></div>

<h3>Why you would turn it off</h3>
<p>Every CDP frame contains the hostname, exact model, full software version and management IP of the device. Anyone who plugs a laptop into a port and runs a free packet capture tool sees all of that within 60 seconds. With the version, an attacker can look up known vulnerabilities; with the management IP, they know where to aim. So the standard practice is:</p>
<ul>
<li><b>Keep CDP on</b> for links between network devices you own (switch to switch, switch to router, switch to access point) and towards Cisco IP phones that need it.</li>
<li><b>Turn it off per interface</b> on user-facing access ports, guest ports and ports to other organisations.</li>
<li><b>Turn it off globally</b> on devices that face untrusted networks, such as an internet edge router, when none of its links need discovery.</li>
</ul>

<h3>Lab walkthrough: CDP</h3>
<p>The CDP lab topology: R1 Gi0/0 to SW1 Gi0/0, SW1 Gi0/1 to SW2 Gi0/1, SW2 Gi0/5 to R2 Gi0/0 (the internet router), and PC1 and PC2 on SW1 Gi0/3 and Gi0/4. All devices sit in 10.50.0.0/24.</p>
<pre class="code"><span class="c">! Task 1: list neighbours on SW1</span>
SW1# show cdp neighbors
<span class="c">! Task 2: SW2's port towards R2 (Local Intrfce of the R2 row is Gi0/5)</span>
SW2# show cdp neighbors
SW2# configure terminal
SW2(config)# interface g0/5
SW2(config-if)# description TO-R2-INTERNET
SW2(config-if)# end
<span class="c">! Task 3: stop CDP only on SW1's user ports</span>
SW1(config)# interface range g0/3 - 4
SW1(config-if-range)# no cdp enable
<span class="c">! Task 4: R2 faces the internet, disable CDP on the whole router</span>
R2(config)# no cdp run
<span class="c">! Task 5: learn R1's IP from CDP detail and use it as SW1's gateway</span>
SW1# show cdp neighbors detail
SW1# configure terminal
SW1(config)# ip default-gateway 10.50.0.1
SW1(config)# end</pre>

<h3>Verifying the result</h3>
<pre class="out">SW1# show cdp interface
GigabitEthernet0/0 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds
GigabitEthernet0/1 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds
<span class="hl">! Gi0/3 and Gi0/4 are no longer listed</span>

R2# show cdp
<span class="hl">% CDP is not enabled</span>

SW1# show running-config interface g0/3
interface GigabitEthernet0/3
 <span class="hl">no cdp enable</span></pre>
<p>Right after <code>no cdp run</code> on R2, SW2 may still list R2 for up to 180 seconds, until the holdtime R2 last advertised runs out. Do not panic and do not assume the command failed: wait, or clear the table on SW2 with <code>clear cdp table</code> and check again.</p>

<div class="eg"><p><b>Worked example.</b> SW1 has 48 ports: Gi0/1 and Gi0/2 are uplinks, Gi0/48 goes to an access point, and Gi0/3 to Gi0/47 go to desks. The cleanest configuration is <code>interface range g0/3 - 47</code> then <code>no cdp enable</code>: 45 ports silenced with two commands, while both uplinks and the access point keep CDP. <code>no cdp run</code> would have been one command, but it would have blinded you on the uplinks too.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>no cdp run</code> when the task says "only on the user ports": it kills discovery towards R1 and SW2 as well. (2) Disabling CDP on a port with a Cisco IP phone: the phone may lose its voice VLAN and fall back to the data VLAN unless LLDP-MED is configured instead. (3) Forgetting that the far side keeps the old entry until the holdtime expires.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which command is global and which is per interface: <code>cdp run</code> is global configuration; <code>cdp enable</code> is interface configuration. Questions often offer <code>cdp enable</code> as a global command or <code>no cdp run</code> under an interface. Neither exists in that mode.</p></div>

<div class="scn"><h4>The pen-test finding</h4><p>An external penetration tester plugged into a meeting-room port and, in the report, listed the core switch model, its exact IOS version and the management subnet, all captured from one CDP frame. The network team pushed <code>no cdp enable</code> to every access port through a configuration template, kept CDP on uplinks and phone ports, and turned off CDP globally on the two internet routers. The re-test found no discovery frames on user ports.</p><p><b>Lesson:</b> disable discovery where you do not control the other end, not everywhere.</p></div>

<div class="iv"><p class="q">"What is the difference between no cdp run and no cdp enable, and when would you use each?"</p><p>Say that <code>no cdp run</code> is global and stops CDP on the whole device, used on an internet edge router or when a policy bans CDP. <code>no cdp enable</code> is per interface, used on user or untrusted ports while infrastructure links keep discovery. Add that global off overrides interface on, and that neighbours age the entry out after the holdtime.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cdp run</code> / <code>no cdp run</code>: global; <code>cdp enable</code> / <code>no cdp enable</code>: per interface.</li>
<li>Global off overrides everything; per-interface off silences one port in both directions.</li>
<li>Keep CDP on infrastructure links and phone ports; turn it off on user, guest and untrusted ports.</li>
<li>Verify with <code>show cdp interface</code>, <code>show cdp</code> and the running configuration.</li>
<li>Remote entries age out after the holdtime; <code>clear cdp table</code> speeds up checking.</li>
</ul></div>
`,hi:`
<p>Aapke ghar mein ek main circuit breaker hota hai aur har kamre mein ek switch. Main breaker band karo to har kamra andhera ho jaata hai, kamre ke switches kuch bhi kahein. Breaker on chhodo to aap phir bhi ek bedroom ki light band kar sakte ho. CDP ke bhi bilkul yahi do levels hain: poore device ke liye ek <b>global</b> switch aur har port ke liye ek <b>per-interface</b> switch.</p>

<h3>Do commands</h3>
<table class="cmp"><tr><th>Level</th><th>On karo</th><th>Off karo</th><th>Default</th></tr>
<tr><td>Global (poora device)</td><td><code>cdp run</code></td><td><code>no cdp run</code></td><td>On</td></tr>
<tr><td>Interface</td><td><code>cdp enable</code></td><td><code>no cdp enable</code></td><td>On (jo interfaces support karte hain un par)</td></tr>
</table>
<p>Global command jeet-ta hai. <code>no cdp run</code> ke saath koi bhi interface CDP na bhejta hai na receive karta hai, chahe uske andar <code>cdp enable</code> abhi bhi ho. <code>cdp run</code> active ho to har interface ko alag se band kiya ja sakta hai. Disabled CDP interface na CDP bhejta hai na process karta hai: LLDP ke ulat, CDP mein alag transmit aur receive controls nahi hote.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Global aur interface CDP control">
<rect x="230" y="15" width="180" height="46" rx="8" fill="#fde68a"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">cdp run</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">main breaker</text>
<line x1="320" y1="61" x2="100" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="400" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="550" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="120" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="100" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0</text><text x="100" y="156" text-anchor="middle" class="svg-muted" font-size="12">R1 tak: on</text>
<rect x="190" y="120" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="250" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/1</text><text x="250" y="156" text-anchor="middle" class="svg-muted" font-size="12">SW2 tak: on</text>
<rect x="340" y="120" width="120" height="44" rx="8" fill="#fed7aa"/><text x="400" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/3</text><text x="400" y="156" text-anchor="middle" class="svg-muted" font-size="12">PC1: off</text>
<rect x="490" y="120" width="120" height="44" rx="8" fill="#fed7aa"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Gi0/4</text><text x="550" y="156" text-anchor="middle" class="svg-muted" font-size="12">PC2: off</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">user ports par no cdp enable; uplinks par discovery chalti rehti hai</text>
</svg><p class="cap">CDP lab ka SW1: global CDP on rehta hai, do user ports alag-alag band kiye jaate hain.</p></div>

<h3>Aap ise band kyun karoge</h3>
<p>Har CDP frame mein device ka hostname, exact model, poora software version aur management IP hota hai. Jo koi bhi port mein laptop laga kar free packet capture tool chalata hai, woh 60 seconds ke andar yeh sab dekh leta hai. Version se attacker known vulnerabilities dhoondh sakta hai; management IP se use pata chal jaata hai ki kahan nishana lagana hai. Isliye standard practice yeh hai:</p>
<ul>
<li><b>CDP on rakho</b> un links par jo aapke apne network devices ke beech hain (switch se switch, switch se router, switch se access point) aur Cisco IP phones ki taraf jinhe iski zaroorat hai.</li>
<li><b>Per interface band karo</b> user-facing access ports, guest ports aur doosri organisations ki taraf wale ports par.</li>
<li><b>Globally band karo</b> un devices par jo untrusted networks ki taraf hain, jaise internet edge router, jab uske kisi link ko discovery ki zaroorat na ho.</li>
</ul>

<h3>Lab walkthrough: CDP</h3>
<p>CDP lab topology: R1 Gi0/0 se SW1 Gi0/0, SW1 Gi0/1 se SW2 Gi0/1, SW2 Gi0/5 se R2 Gi0/0 (internet router), aur PC1 aur PC2 SW1 ke Gi0/3 aur Gi0/4 par. Saare devices 10.50.0.0/24 mein hain.</p>
<pre class="code"><span class="c">! Task 1: SW1 par neighbours list karo</span>
SW1# show cdp neighbors
<span class="c">! Task 2: SW2 ka R2 wala port (R2 row ka Local Intrfce Gi0/5 hai)</span>
SW2# show cdp neighbors
SW2# configure terminal
SW2(config)# interface g0/5
SW2(config-if)# description TO-R2-INTERNET
SW2(config-if)# end
<span class="c">! Task 3: sirf SW1 ke user ports par CDP band</span>
SW1(config)# interface range g0/3 - 4
SW1(config-if-range)# no cdp enable
<span class="c">! Task 4: R2 internet ki taraf hai, poore router par CDP band</span>
R2(config)# no cdp run
<span class="c">! Task 5: CDP detail se R1 ka IP seekho aur SW1 ka gateway banao</span>
SW1# show cdp neighbors detail
SW1# configure terminal
SW1(config)# ip default-gateway 10.50.0.1
SW1(config)# end</pre>

<h3>Result verify karna</h3>
<pre class="out">SW1# show cdp interface
GigabitEthernet0/0 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds
GigabitEthernet0/1 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds
<span class="hl">! Gi0/3 aur Gi0/4 ab list nahi hote</span>

R2# show cdp
<span class="hl">% CDP is not enabled</span>

SW1# show running-config interface g0/3
interface GigabitEthernet0/3
 <span class="hl">no cdp enable</span></pre>
<p>R2 par <code>no cdp run</code> ke turant baad, SW2 R2 ko 180 seconds tak list kar sakta hai, jab tak R2 ka aakhri advertise kiya holdtime khatam nahi hota. Ghabrao mat aur yeh mat maano ki command fail hua: wait karo, ya SW2 par <code>clear cdp table</code> se table saaf karke dobara check karo.</p>

<div class="eg"><p><b>Worked example.</b> SW1 ke 48 ports hain: Gi0/1 aur Gi0/2 uplinks hain, Gi0/48 access point tak jaata hai, aur Gi0/3 se Gi0/47 desks tak. Sabse clean configuration hai <code>interface range g0/3 - 47</code> phir <code>no cdp enable</code>: do commands se 45 ports chup, jabki dono uplinks aur access point par CDP chalta rehta hai. <code>no cdp run</code> ek hi command hota, lekin woh aapko uplinks par bhi andha kar deta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Jab task kahe "sirf user ports par" tab <code>no cdp run</code> use karna: yeh R1 aur SW2 ki taraf bhi discovery khatam kar deta hai. (2) Cisco IP phone wale port par CDP band karna: phone apna voice VLAN kho sakta hai aur data VLAN par gir sakta hai, jab tak uski jagah LLDP-MED configure na ho. (3) Bhool jaana ki doosri side purani entry holdtime khatam hone tak rakhti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaunsa command global hai aur kaunsa per interface: <code>cdp run</code> global configuration hai; <code>cdp enable</code> interface configuration. Questions aksar <code>cdp enable</code> ko global command ya <code>no cdp run</code> ko interface ke andar offer karte hain. Us mode mein dono exist nahi karte.</p></div>

<div class="scn"><h4>Pen-test finding</h4><p>Ek external penetration tester ne meeting room ke port mein plug kiya aur report mein core switch ka model, uska exact IOS version aur management subnet list kiya, sab ek CDP frame se capture kiya hua. Network team ne ek configuration template se har access port par <code>no cdp enable</code> push kiya, uplinks aur phone ports par CDP on rakha, aur dono internet routers par CDP globally band kiya. Re-test mein user ports par koi discovery frame nahi mila.</p><p><b>Seekh:</b> discovery wahan band karo jahan doosre end par aapka control nahi hai, har jagah nahi.</p></div>

<div class="iv"><p class="q">"no cdp run aur no cdp enable mein kya farak hai, aur har ek kab use karoge?"</p><p>Batao ki <code>no cdp run</code> global hai aur poore device par CDP rokta hai, internet edge router par ya jab policy CDP ban kare tab use hota hai. <code>no cdp enable</code> per interface hai, user ya untrusted ports par use hota hai jabki infrastructure links par discovery chalti rehti hai. Jodo ki global off interface on ko override karta hai, aur neighbours entry ko holdtime ke baad age out karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cdp run</code> / <code>no cdp run</code>: global; <code>cdp enable</code> / <code>no cdp enable</code>: per interface.</li>
<li>Global off sab kuch override karta hai; per-interface off ek port ko dono directions mein chup karata hai.</li>
<li>Infrastructure links aur phone ports par CDP on rakho; user, guest aur untrusted ports par band karo.</li>
<li><code>show cdp interface</code>, <code>show cdp</code> aur running configuration se verify karo.</li>
<li>Remote entries holdtime ke baad age out hoti hain; <code>clear cdp table</code> checking jaldi karta hai.</li>
</ul></div>
`}};export{e as default};