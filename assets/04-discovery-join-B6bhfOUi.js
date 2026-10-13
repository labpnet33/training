var e={id:`discovery-join`,h:{en:`AP discovery and join: option 43, DNS, broadcast, priming`,hi:`AP discovery aur join: option 43, DNS, broadcast, priming`},body:{en:`
<p>A new employee arrives on day one. How does she find her manager? Maybe HR wrote the manager's name in the welcome letter (DHCP option 43). Maybe she looks the name up in the company directory (DNS). Maybe she just shouts "is my manager on this floor?" (broadcast). Or maybe she worked here before and remembers (priming). A lightweight AP faces the same problem at boot: it must learn at least one controller's IP address before it can send a CAPWAP Discovery Request.</p>

<h3>Step 0: the AP gets an IP address</h3>
<p>Almost always by <b>DHCP</b>. In the lab, AP1 and AP2 sit on SW1 access ports in VLAN 10 and get leases from pool AP-POOL on R1 (10.10.10.0/24, gateway 10.10.10.1). Without an address the AP cannot do anything else, so DHCP is the first thing to check when an AP never joins.</p>

<h3>The discovery methods</h3>
<dl class="terms">
<dt>Static (AP CLI)</dt><dd>An engineer types the controller address on the AP console. On a real Cisco AP: <code>capwap ap controller ip address 10.10.99.10</code>. In the lab AP shell the command is <code>capwap ap controller ip 10.10.99.10</code>. Useful for a single AP, not for hundreds.</dd>
<dt>Primed (previously joined)</dt><dd>Once an AP has joined any WLC, it stores the addresses of that controller and its mobility group peers in NVRAM, and you can set a <b>primary, secondary and tertiary</b> controller for it: <code>config ap primary-base WLC1 AP1 10.10.99.10</code>. After a reboot the AP tries these first.</dd>
<dt>DHCP option 43</dt><dd>The DHCP server hands the controller address(es) to the AP inside the lease. This is the most common method in real networks and in our lab.</dd>
<dt>DNS</dt><dd>The AP resolves <b>CISCO-CAPWAP-CONTROLLER.<i>localdomain</i></b>, where <i>localdomain</i> is the domain name from its DHCP lease (option 15). Create an A record for that name pointing to the WLC management IP.</dd>
<dt>Local subnet broadcast</dt><dd>The AP broadcasts a Discovery Request on its own subnet. It only works if a WLC management interface is in the same VLAN, unless the router forwards it with <code>ip helper-address</code> plus <code>ip forward-protocol udp 5246</code>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="How a lightweight AP learns controller addresses">
<rect x="250" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="14">AP1 boots</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.11</text>
<rect x="20" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">static / primed (NVRAM)</text>
<rect x="450" y="20" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="12">DHCP option 43</text>
<rect x="20" y="170" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="195" text-anchor="middle" class="svg-ink" font-size="12">DNS CISCO-CAPWAP-...</text>
<rect x="450" y="170" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="12">subnet broadcast</text>
<line x1="190" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="450" y1="45" x2="390" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">all answers pooled</text><text x="320" y="186" text-anchor="middle" class="svg-accent" font-size="12">then one WLC is chosen</text>
</svg><p class="cap">The AP collects controller addresses from every method it can, sends Discovery Requests to all of them, then picks one to join.</p></div>

<h3>Building option 43 by hand</h3>
<p>For Cisco lightweight APs, option 43 is a <b>TLV</b> (type, length, value) in hex:</p>
<ul>
<li><b>Type</b> = <code>f1</code> (always).</li>
<li><b>Length</b> = 4 bytes per controller address: one WLC = <code>04</code>, two = <code>08</code>, three = <code>0c</code>.</li>
<li><b>Value</b> = each management IP in hex, octet by octet.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> WLC1 is 10.10.99.10. Convert each octet: 10 = <code>0a</code>, 10 = <code>0a</code>, 99 = <code>63</code>, 10 = <code>0a</code>. So the value is <code>0a0a630a</code>, and the full option is <code>f1 04 0a0a630a</code>, written in IOS as <code>f104.0a0a.630a</code>. If a second controller at 10.10.99.11 (hex <code>0a0a630b</code>) is added, the length becomes 8: <code>f108.0a0a.630a.0a0a.630b</code>.</p></div>

<pre class="code"><span class="c">! R1: point the APs at WLC1 (lab task 1)</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.630a</pre>

<h3>How the AP chooses a controller</h3>
<p>The AP sends Discovery Requests to every address it learned and collects the responses. Then it picks one in this order:</p>
<ol>
<li>The <b>primary</b>, then <b>secondary</b>, then <b>tertiary</b> controller configured for this AP (priming).</li>
<li>A controller configured as the <b>master controller</b>, used during initial deployments.</li>
<li>The <b>least-loaded</b> controller: the one with the most spare AP capacity.</li>
</ol>

<h3>Verifying the join</h3>
<pre class="out">AP1&gt; ip dhcp
DDORA IP 10.10.10.11/24 GW 10.10.10.1
<span class="hl">DHCP option 43: controller 10.10.99.10</span>

(WLC1) &gt;show ap summary

Number of APs.................................... 2

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
---------------  -----  -----------  -----------------  ---------------  -------  -------  ---------
<span class="hl">AP1              2      NK-AP3800    52:54:00:3a:11:01  10.10.10.11      0        Local    DHCP-43</span>
AP2              2      NK-AP3800    52:54:00:3a:12:01  10.10.10.12      0        Local    DHCP-43</pre>

<h3>When an AP will not join: the checklist</h3>
<ol>
<li><b>Power and link</b>: PoE budget on the switch, the port up, the correct access VLAN.</li>
<li><b>IP address</b>: did the AP get a lease? <code>show ip dhcp binding</code> on R1, <code>show capwap</code> on the AP.</li>
<li><b>Controller address</b>: does <code>show capwap</code> say "DHCP option 43: not received"? Is the hex correct?</li>
<li><b>Reachability</b>: can the AP subnet route to 10.10.99.10? Is the WLC's management interface in the right VLAN?</li>
<li><b>Filters</b>: UDP 5246/5247 permitted end to end?</li>
<li><b>Join rejected</b>: the WLC log (<code>show msglog</code>) may show a regulatory domain mismatch (AP built for another country), AP not in the authorization list, no licence capacity, or a certificate error because the WLC clock is wrong.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Using <code>option 43 ascii 10.10.99.10</code> for Cisco lightweight APs. The ASCII form is meant for some older and third-party devices; Cisco CAPWAP APs expect the <b>hex TLV</b> with type f1. Another classic: forgetting to update the length byte when a second controller address is added.</p></div>

<div class="exam"><p><b>Exam trap.</b> Option <b>43</b> = WLC address for APs. Option <b>150</b> = TFTP server for IP phones. Option <b>15</b> = domain name (used by DNS discovery). The DNS name is <b>CISCO-CAPWAP-CONTROLLER</b>. Broadcast discovery works only in the same subnet (or with a helper forwarding UDP 5246).</p></div>

<div class="scn"><h4>Two new ceiling APs that never came up (lab: Join the APs)</h4><p>A new WLC1 was racked with only its management address. AP1 and AP2 were powered, had lights, and even had DHCP leases in 10.10.10.0/24, but <code>show ap summary</code> on WLC1 showed zero APs. On AP1, <code>show capwap</code> reported "DHCP option 43: not received" and "CAPWAP state: DISCOVERY - no controller answered". The WLC was in VLAN 99, so broadcast discovery could never reach it, and there was no DNS record or static address. The engineer added <code>option 43 hex f104.0a0a.630a</code> to pool AP-POOL on R1. On their next DHCP retry both APs learned 10.10.99.10, joined, and showed "Join DHCP-43" on the controller.</p><p><b>Lesson:</b> an AP in a different subnet from the WLC needs a discovery method that crosses subnets: option 43, DNS, priming or static.</p></div>

<div class="iv"><p class="q">"List the ways a lightweight AP can discover a WLC. Which would you use for 500 APs across 20 floors?"</p><p>Strong answer: static configuration on the AP, priming from a previous join (primary/secondary/tertiary), DHCP option 43, DNS lookup of CISCO-CAPWAP-CONTROLLER.localdomain, and a local subnet broadcast. For 500 APs use DHCP option 43 or DNS, because they need no per-AP work; then prime primary and secondary controllers for predictable failover. Show you can build option 43: f1, length 4 per address, then the IPs in hex.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An AP first needs an IP address, then at least one controller address.</li>
<li>Discovery methods: static, primed (NVRAM, primary/secondary/tertiary), DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, subnet broadcast.</li>
<li>Option 43 hex: f1, then 04 per controller, then the IP in hex: 10.10.99.10 = f104.0a0a.630a.</li>
<li>Choice order: primed controllers, then master controller, then least loaded.</li>
<li>Join checklist: power, DHCP, controller address, routing, UDP 5246/5247, then WLC log for rejects.</li>
</ul></div>
`,hi:`
<p>Ek nayi employee pehle din aati hai. Woh apne manager ko kaise dhoondhegi? Shayad HR ne welcome letter mein manager ka naam likh diya (DHCP option 43). Shayad woh company directory mein naam dekhti hai (DNS). Shayad woh bas awaaz lagati hai "mera manager is floor par hai kya?" (broadcast). Ya shayad woh pehle yahan kaam kar chuki hai aur use yaad hai (priming). Lightweight AP boot par isi problem ka saamna karta hai: CAPWAP Discovery Request bhejne se pehle use kam se kam ek controller ka IP address seekhna padta hai.</p>

<h3>Step 0: AP ko IP address milta hai</h3>
<p>Lagbhag hamesha <b>DHCP</b> se. Lab mein AP1 aur AP2 SW1 ke VLAN 10 access ports par hain aur R1 ke pool AP-POOL se lease lete hain (10.10.10.0/24, gateway 10.10.10.1). Address ke bina AP kuch aur nahi kar sakta, isliye jab AP kabhi join na kare to DHCP pehli cheez hai jo check karni hai.</p>

<h3>Discovery methods</h3>
<dl class="terms">
<dt>Static (AP CLI)</dt><dd>Engineer AP console par controller address type karta hai. Real Cisco AP par: <code>capwap ap controller ip address 10.10.99.10</code>. Lab AP shell mein command <code>capwap ap controller ip 10.10.99.10</code> hai. Ek AP ke liye useful, sainkdon ke liye nahi.</dd>
<dt>Primed (pehle join kiya hua)</dt><dd>AP ek baar kisi WLC ko join kar le, to woh us controller aur uske mobility group peers ke addresses NVRAM mein store kar leta hai, aur aap uske liye <b>primary, secondary aur tertiary</b> controller set kar sakte ho: <code>config ap primary-base WLC1 AP1 10.10.99.10</code>. Reboot ke baad AP pehle inhe try karta hai.</dd>
<dt>DHCP option 43</dt><dd>DHCP server lease ke andar hi AP ko controller address(es) de deta hai. Real networks mein aur hamare lab mein yahi sabse common method hai.</dd>
<dt>DNS</dt><dd>AP <b>CISCO-CAPWAP-CONTROLLER.<i>localdomain</i></b> resolve karta hai, jahan <i>localdomain</i> uski DHCP lease ka domain name hai (option 15). Us naam ke liye WLC management IP ki taraf point karta A record banao.</dd>
<dt>Local subnet broadcast</dt><dd>AP apne subnet par Discovery Request broadcast karta hai. Yeh tabhi chalta hai jab WLC ka management interface same VLAN mein ho, jab tak router use <code>ip helper-address</code> plus <code>ip forward-protocol udp 5246</code> se forward na kare.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lightweight AP controller addresses kaise seekhta hai">
<rect x="250" y="90" width="140" height="50" rx="8" fill="#fed7aa"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="14">AP1 boot hota hai</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.10.10.11</text>
<rect x="20" y="20" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">static / primed (NVRAM)</text>
<rect x="450" y="20" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="12">DHCP option 43</text>
<rect x="20" y="170" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="195" text-anchor="middle" class="svg-ink" font-size="12">DNS CISCO-CAPWAP-...</text>
<rect x="450" y="170" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="195" text-anchor="middle" class="svg-ink" font-size="12">subnet broadcast</text>
<line x1="190" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="450" y1="45" x2="390" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">saare answers ikattha</text><text x="320" y="186" text-anchor="middle" class="svg-accent" font-size="12">phir ek WLC chuna jaata hai</text>
</svg><p class="cap">AP har possible method se controller addresses collect karta hai, sabko Discovery Requests bhejta hai, phir join karne ke liye ek chunta hai.</p></div>

<h3>Option 43 haath se banana</h3>
<p>Cisco lightweight APs ke liye option 43 hex mein ek <b>TLV</b> (type, length, value) hai:</p>
<ul>
<li><b>Type</b> = <code>f1</code> (hamesha).</li>
<li><b>Length</b> = har controller address ke 4 bytes: ek WLC = <code>04</code>, do = <code>08</code>, teen = <code>0c</code>.</li>
<li><b>Value</b> = har management IP hex mein, octet by octet.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> WLC1 10.10.99.10 hai. Har octet convert karo: 10 = <code>0a</code>, 10 = <code>0a</code>, 99 = <code>63</code>, 10 = <code>0a</code>. To value <code>0a0a630a</code> hai, aur poora option <code>f1 04 0a0a630a</code>, jo IOS mein <code>f104.0a0a.630a</code> likha jaata hai. Agar 10.10.99.11 (hex <code>0a0a630b</code>) par doosra controller joda jaaye, length 8 ho jaati hai: <code>f108.0a0a.630a.0a0a.630b</code>.</p></div>

<pre class="code"><span class="c">! R1: APs ko WLC1 ki taraf point karo (lab task 1)</span>
ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 option 43 hex f104.0a0a.630a</pre>

<h3>AP controller kaise chunta hai</h3>
<p>AP har seekhe hue address ko Discovery Requests bhejta hai aur responses collect karta hai. Phir is order mein ek chunta hai:</p>
<ol>
<li>Is AP ke liye configured <b>primary</b>, phir <b>secondary</b>, phir <b>tertiary</b> controller (priming).</li>
<li><b>Master controller</b> ke roop mein configured controller, initial deployments mein use hota hai.</li>
<li><b>Least-loaded</b> controller: jiske paas sabse zyada spare AP capacity ho.</li>
</ol>

<h3>Join verify karna</h3>
<pre class="out">AP1&gt; ip dhcp
DDORA IP 10.10.10.11/24 GW 10.10.10.1
<span class="hl">DHCP option 43: controller 10.10.99.10</span>

(WLC1) &gt;show ap summary

Number of APs.................................... 2

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
---------------  -----  -----------  -----------------  ---------------  -------  -------  ---------
<span class="hl">AP1              2      NK-AP3800    52:54:00:3a:11:01  10.10.10.11      0        Local    DHCP-43</span>
AP2              2      NK-AP3800    52:54:00:3a:12:01  10.10.10.12      0        Local    DHCP-43</pre>

<h3>Jab AP join na kare: checklist</h3>
<ol>
<li><b>Power aur link</b>: switch par PoE budget, port up, sahi access VLAN.</li>
<li><b>IP address</b>: kya AP ko lease mili? R1 par <code>show ip dhcp binding</code>, AP par <code>show capwap</code>.</li>
<li><b>Controller address</b>: kya <code>show capwap</code> "DHCP option 43: not received" bolta hai? Kya hex sahi hai?</li>
<li><b>Reachability</b>: kya AP subnet 10.10.99.10 tak route kar sakta hai? Kya WLC ka management interface sahi VLAN mein hai?</li>
<li><b>Filters</b>: kya UDP 5246/5247 end to end permitted hai?</li>
<li><b>Join rejected</b>: WLC log (<code>show msglog</code>) regulatory domain mismatch (AP doosre desh ke liye bana), AP authorization list mein nahi, licence capacity nahi, ya WLC ki clock galat hone se certificate error dikha sakta hai.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Cisco lightweight APs ke liye <code>option 43 ascii 10.10.99.10</code> use karna. ASCII form kuch purane aur third-party devices ke liye hai; Cisco CAPWAP APs type f1 wala <b>hex TLV</b> expect karte hain. Ek aur classic: doosra controller address jodte waqt length byte update karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Option <b>43</b> = APs ke liye WLC address. Option <b>150</b> = IP phones ke liye TFTP server. Option <b>15</b> = domain name (DNS discovery mein use hota hai). DNS naam <b>CISCO-CAPWAP-CONTROLLER</b> hai. Broadcast discovery sirf same subnet mein chalti hai (ya helper ke saath jo UDP 5246 forward kare).</p></div>

<div class="scn"><h4>Do nayi ceiling APs jo kabhi up nahi hui (lab: Join the APs)</h4><p>Naya WLC1 sirf management address ke saath rack hua. AP1 aur AP2 powered the, lights thi, aur 10.10.10.0/24 mein DHCP leases bhi thi, lekin WLC1 par <code>show ap summary</code> zero APs dikha raha tha. AP1 par <code>show capwap</code> ne "DHCP option 43: not received" aur "CAPWAP state: DISCOVERY - no controller answered" report kiya. WLC VLAN 99 mein tha, isliye broadcast discovery wahan kabhi pahunch hi nahi sakti thi, aur koi DNS record ya static address nahi tha. Engineer ne R1 ke pool AP-POOL mein <code>option 43 hex f104.0a0a.630a</code> joda. Agle DHCP retry par dono APs ne 10.10.99.10 seekha, join kiya, aur controller par "Join DHCP-43" dikhaya.</p><p><b>Seekh:</b> WLC se alag subnet wale AP ko aisa discovery method chahiye jo subnets cross kare: option 43, DNS, priming ya static.</p></div>

<div class="iv"><p class="q">"Lightweight AP WLC ko kin tareekon se discover kar sakta hai? 20 floors par 500 APs ke liye aap kaunsa use karoge?"</p><p>Strong answer: AP par static configuration, pichhle join se priming (primary/secondary/tertiary), DHCP option 43, CISCO-CAPWAP-CONTROLLER.localdomain ka DNS lookup, aur local subnet broadcast. 500 APs ke liye DHCP option 43 ya DNS use karo, kyunki inmein per-AP kaam nahi hai; phir predictable failover ke liye primary aur secondary controllers prime karo. Dikhao ki aap option 43 bana sakte ho: f1, har address ke liye length 4, phir IPs hex mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP ko pehle IP address chahiye, phir kam se kam ek controller address.</li>
<li>Discovery methods: static, primed (NVRAM, primary/secondary/tertiary), DHCP option 43, DNS CISCO-CAPWAP-CONTROLLER, subnet broadcast.</li>
<li>Option 43 hex: f1, phir har controller ke liye 04, phir IP hex mein: 10.10.99.10 = f104.0a0a.630a.</li>
<li>Choice order: primed controllers, phir master controller, phir least loaded.</li>
<li>Join checklist: power, DHCP, controller address, routing, UDP 5246/5247, phir rejects ke liye WLC log.</li>
</ul></div>
`}};export{e as default};