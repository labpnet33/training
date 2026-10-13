var e={id:`health`,h:{en:`Health monitoring: unit hellos, interface monitoring and thresholds`,hi:`Health monitoring: unit hellos, interface monitoring aur thresholds`},body:{en:`
<p>A lifeguard watches two things. First, is my colleague on the other tower still there? If they stop waving for a while, I take over their section. Second, can my colleague actually see the water? If their view is blocked by a boat, they are alive but useless for that section, and the one with the clear view should take over. An ASA pair monitors the same two things: <b>unit health</b> (is my mate alive?) and <b>interface health</b> (can the active unit still reach the networks it protects?).</p>

<h3>Unit monitoring: hellos on the failover link</h3>
<p>Each unit sends a <b>hello</b> over the failover link every <b>unit poll time</b> (default 1 second). If a unit hears nothing for the <b>unit holdtime</b> (default 15 seconds), it concludes that its mate has failed. The logic is careful, because a broken failover cable must not cause a failover:</p>
<ol>
<li>After a few missed hellos on the failover link, the unit sends test messages on <b>all</b> interfaces, including the data interfaces.</li>
<li>If the mate answers on any data interface, the mate is alive and only the failover link is broken: <b>no failover</b>, the failover link is marked failed.</li>
<li>If the mate answers nowhere and the holdtime expires, the mate is declared failed. A standby then becomes active and logs <code>%ASA-1-105005 (Secondary) Lost Failover communications with mate on interface FOLINK.</code> and <code>%ASA-1-104001 (Secondary) Switching to ACTIVE - HELLO not heard from mate.</code></li>
</ol>
<p>Tune the timers with:</p>
<pre class="code"><span class="c">! default: poll 1 s, holdtime 15 s</span>
failover polltime unit 1 holdtime 15
<span class="c">! sub-second detection: poll 200 ms, holdtime 1 s</span>
failover polltime unit msec 200 holdtime 1</pre>
<p>Rules: the unit poll time is 1 to 15 seconds or 200 to 999 milliseconds; the holdtime is 1 to 45 seconds (or 800 to 999 ms) and must be at least <b>three times</b> the poll time. The ASA rejects a holdtime shorter than that.</p>

<h3>Interface monitoring: hellos on the data interfaces</h3>
<p>The units also exchange hellos on every <b>monitored</b> data interface, from the active address to the standby address and back. This is why standby addresses matter. Defaults: <b>interface poll 5 seconds, interface holdtime 25 seconds</b>.</p>
<pre class="code"><span class="c">! faster interface failure detection: poll 1 s, holdtime 5 s</span>
failover polltime interface 1 holdtime 5</pre>
<p>The interface holdtime is 5 to 75 seconds and must be at least five times the poll time. When a unit has not heard hellos on an interface for half the holdtime, it starts <b>testing</b> that interface (log <code>105008 Testing interface inside</code>) with four checks, stopping as soon as one proves the interface works:</p>
<ol>
<li><b>Link up/down</b>: is the physical link up at all? If the link is down the interface fails straight away.</li>
<li><b>Network activity</b>: were any packets received in the last few seconds?</li>
<li><b>ARP</b>: send ARP requests to the most recently learned hosts; any reply means the interface works.</li>
<li><b>Broadcast ping</b>: ping the broadcast address; any reply means the interface works.</li>
</ol>
<p>If every test fails, the interface is marked <b>Failed</b> (<code>105009 Testing on interface inside Failed.</code>).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Interface monitoring">
<rect x="40" y="30" width="150" height="50" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">ASA1 Active</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<rect x="40" y="150" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="13">ASA2 Standby</text><text x="115" y="190" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.2</text>
<rect x="270" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="315" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="190" y1="55" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="190" y1="175" x2="270" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="235" y="70" class="svg-accent" font-size="12">hello every 5 s</text>
<rect x="410" y="40" width="210" height="150" rx="10" fill="#fde68a"/>
<text x="515" y="64" text-anchor="middle" class="svg-ink" font-size="13">No hello for 12.5 s</text>
<text x="515" y="88" text-anchor="middle" class="svg-muted" font-size="12">1 link up/down</text>
<text x="515" y="108" text-anchor="middle" class="svg-muted" font-size="12">2 network activity</text>
<text x="515" y="128" text-anchor="middle" class="svg-muted" font-size="12">3 ARP test</text>
<text x="515" y="148" text-anchor="middle" class="svg-muted" font-size="12">4 broadcast ping</text>
<text x="515" y="175" text-anchor="middle" class="svg-accent" font-size="12">all fail: interface Failed</text>
</svg><p class="cap">Interface hellos travel between active and standby addresses; half a holdtime of silence starts the four tests.</p></div>

<h3>Which interfaces are monitored</h3>
<p>By default the ASA monitors its <b>physical data interfaces</b> that have a <code>nameif</code>. Logical interfaces such as subinterfaces are not monitored unless you add them. The failover and state links are never in the list, because they are not data interfaces. You change the list with:</p>
<pre class="code">monitor-interface dmz
no monitor-interface lab-net</pre>
<p><code>show monitor-interface</code> shows the result for both units:</p>
<pre class="out">NK-ASA# show monitor-interface
This host: Primary - Active
	<span class="hl">Interface outside (203.0.113.2): Normal (Monitored)</span>
	<span class="hl">Interface inside (10.0.1.1): Normal (Monitored)</span>
Other host: Secondary - Standby Ready
	Interface outside (203.0.113.3): Normal (Monitored)
	Interface inside (10.0.1.2): Normal (Monitored)</pre>
<p>In lab 4, task 1, the answer is <b>2</b>: outside and inside. <code>show failover</code> confirms it with <code>Monitored Interfaces 2 of 1285 maximum</code>.</p>

<table class="cmp"><tr><th>Interface state</th><th>Meaning</th></tr>
<tr><td>Normal (Monitored)</td><td>Healthy and monitored</td></tr>
<tr><td>Normal (Waiting)</td><td>Up, but the units have not exchanged hellos on it yet, typically because there is <b>no standby address</b></td></tr>
<tr><td>Normal (Not-Monitored)</td><td>Healthy but excluded with <code>no monitor-interface</code></td></tr>
<tr><td>Testing</td><td>Hellos missed for half the holdtime; tests running</td></tr>
<tr><td>No Link</td><td>The physical link is down (cable, neighbour port)</td></tr>
<tr><td>Link Down</td><td>The interface is administratively shut down</td></tr>
<tr><td>Failed</td><td>Link up but all tests failed</td></tr></table>

<h3>The interface policy: how many failures trigger a failover</h3>
<p><code>failover interface-policy</code> sets the threshold: a number (default <b>1</b>) or a percentage of monitored interfaces. When the active unit has at least that many failed interfaces <b>and</b> the standby is healthier (fewer failed interfaces), the pair fails over. If both units have the same failure (for example SW-IN itself is down), there is no point in failing over, and nothing happens.</p>

<div class="eg"><p><b>Worked example.</b> An ASA monitors outside, inside, dmz and guest. Policy 1: losing only guest on the active unit triggers a failover. Policy 2: losing guest alone does nothing; losing guest and dmz triggers a failover. <code>failover interface-policy 50%</code>: 2 of 4 interfaces must fail. With defaults (poll 5 s, hold 25 s) a silent failure (link up, nothing answering) takes up to 25 seconds to detect; a pulled cable is detected much faster by the link up/down test.</p></div>

<div class="warn"><p><b>Common mistake.</b> Tuning unit timers to 200 ms / 1 s on a busy firewall without testing. A short CPU spike or a burst of state updates can delay hellos, and the pair fails over for no real reason, which is itself an outage. Tune gradually and watch <code>show failover history</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults to memorise: unit poll 1 s / hold 15 s; interface poll 5 s / hold 25 s; interface policy 1. Unit holdtime must be at least 3× the poll time, interface holdtime at least 5×. "Normal (Waiting)" points to a missing standby address.</p></div>

<div class="scn"><h4>The guest Wi-Fi that failed over the data centre edge</h4><p>A campus ASA had a guest interface to a cheap access switch that rebooted every night for updates. Each reboot made the interface No Link on the active unit only (the standby's guest port was on another switch), and with policy 1 the pair failed over every night at 03:00. The engineer read <code>show failover history</code> (Interface check at 03:00 every day), then ran <code>no monitor-interface guest</code> because guest Wi-Fi was not worth a failover of the corporate edge.</p><p><b>Lesson:</b> monitor the interfaces whose loss really justifies a switchover, and set the policy deliberately.</p></div>

<div class="iv"><p class="q">"How does an ASA decide that its failover peer or an interface has failed?"</p><p>Strong answer: unit health uses hellos on the failover link every poll time (1 s default); if they stop, the unit tests all interfaces and only declares the peer failed if it answers nowhere within the holdtime (15 s default), so a broken failover link alone does not cause failover. Interface health uses hellos between active and standby addresses on each monitored interface (5 s / 25 s); after half the holdtime the unit runs link, network activity, ARP and broadcast ping tests. The interface policy (default 1) decides how many failed interfaces trigger failover, and only if the standby is healthier.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unit hellos: poll 1 s, hold 15 s by default; hold at least 3× poll; sub-second possible with msec.</li>
<li>A failover link failure alone does not cause failover if the mate answers on a data interface.</li>
<li>Interface hellos: poll 5 s, hold 25 s; tests are link, network activity, ARP, broadcast ping.</li>
<li>Physical data interfaces are monitored by default; adjust with <code>monitor-interface</code>.</li>
<li>Interface policy default 1; failover only if the standby is healthier than the active unit.</li>
</ul></div>
`,hi:`
<p>Ek lifeguard do cheezein dekhta hai. Pehli, kya doosre tower par mera colleague abhi bhi hai? Agar woh kuch der haath hilana band kar de, main uska section le leta hoon. Doosri, kya mera colleague sach mein paani dekh sakta hai? Agar uska view kisi boat se block hai, to woh zinda hai par us section ke liye bekaar hai, aur jiska view saaf hai use take over karna chahiye. ASA pair bhi yahi do cheezein monitor karta hai: <b>unit health</b> (kya mera mate zinda hai?) aur <b>interface health</b> (kya active unit abhi bhi un networks tak pahunch sakta hai jinhe woh protect karta hai?).</p>

<h3>Unit monitoring: failover link par hellos</h3>
<p>Har unit har <b>unit poll time</b> (default 1 second) par failover link par ek <b>hello</b> bhejta hai. Agar unit <b>unit holdtime</b> (default 15 second) tak kuch na sune, to woh maan leta hai ki uska mate fail ho gaya. Logic dhyaan se bana hai, kyunki tooti failover cable se failover nahi hona chahiye:</p>
<ol>
<li>Failover link par kuch hellos miss hone ke baad unit <b>saare</b> interfaces par test messages bhejta hai, data interfaces samet.</li>
<li>Agar mate kisi bhi data interface par jawab de, to mate zinda hai aur sirf failover link toota hai: <b>koi failover nahi</b>, failover link failed mark hota hai.</li>
<li>Agar mate kahin jawab na de aur holdtime khatam ho jaaye, to mate failed declare hota hai. Tab standby active banta hai aur log karta hai <code>%ASA-1-105005 (Secondary) Lost Failover communications with mate on interface FOLINK.</code> aur <code>%ASA-1-104001 (Secondary) Switching to ACTIVE - HELLO not heard from mate.</code></li>
</ol>
<p>Timers aise tune karo:</p>
<pre class="code"><span class="c">! default: poll 1 s, holdtime 15 s</span>
failover polltime unit 1 holdtime 15
<span class="c">! second se kam detection: poll 200 ms, holdtime 1 s</span>
failover polltime unit msec 200 holdtime 1</pre>
<p>Rules: unit poll time 1 se 15 second ya 200 se 999 millisecond hai; holdtime 1 se 45 second (ya 800 se 999 ms) hai aur poll time ka kam se kam <b>teen guna</b> hona chahiye. ASA isse chhota holdtime reject karta hai.</p>

<h3>Interface monitoring: data interfaces par hellos</h3>
<p>Units har <b>monitored</b> data interface par bhi hellos exchange karte hain, active address se standby address tak aur wapas. Isiliye standby addresses zaroori hain. Defaults: <b>interface poll 5 second, interface holdtime 25 second</b>.</p>
<pre class="code"><span class="c">! interface failure ka tez detection: poll 1 s, holdtime 5 s</span>
failover polltime interface 1 holdtime 5</pre>
<p>Interface holdtime 5 se 75 second hai aur poll time ka kam se kam paanch guna hona chahiye. Jab kisi unit ne kisi interface par aadhe holdtime tak hellos nahi sune, woh us interface ki <b>testing</b> shuru karta hai (log <code>105008 Testing interface inside</code>) chaar checks ke saath, aur jaise hi koi ek saabit kare ki interface chal raha hai, ruk jaata hai:</p>
<ol>
<li><b>Link up/down</b>: kya physical link up hai bhi? Agar link down hai to interface turant fail hota hai.</li>
<li><b>Network activity</b>: kya pichhle kuch seconds mein koi packet receive hua?</li>
<li><b>ARP</b>: sabse haal mein seekhe hosts ko ARP requests bhejo; koi bhi reply matlab interface chal raha hai.</li>
<li><b>Broadcast ping</b>: broadcast address ko ping karo; koi bhi reply matlab interface chal raha hai.</li>
</ol>
<p>Agar har test fail ho, to interface <b>Failed</b> mark hota hai (<code>105009 Testing on interface inside Failed.</code>).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Interface monitoring">
<rect x="40" y="30" width="150" height="50" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">ASA1 Active</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<rect x="40" y="150" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="13">ASA2 Standby</text><text x="115" y="190" text-anchor="middle" class="svg-muted" font-size="12">inside 10.0.1.2</text>
<rect x="270" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="315" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="190" y1="55" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="190" y1="175" x2="270" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="235" y="70" class="svg-accent" font-size="12">har 5 s hello</text>
<rect x="410" y="40" width="210" height="150" rx="10" fill="#fde68a"/>
<text x="515" y="64" text-anchor="middle" class="svg-ink" font-size="13">12.5 s tak koi hello nahi</text>
<text x="515" y="88" text-anchor="middle" class="svg-muted" font-size="12">1 link up/down</text>
<text x="515" y="108" text-anchor="middle" class="svg-muted" font-size="12">2 network activity</text>
<text x="515" y="128" text-anchor="middle" class="svg-muted" font-size="12">3 ARP test</text>
<text x="515" y="148" text-anchor="middle" class="svg-muted" font-size="12">4 broadcast ping</text>
<text x="515" y="175" text-anchor="middle" class="svg-accent" font-size="12">sab fail: interface Failed</text>
</svg><p class="cap">Interface hellos active aur standby addresses ke beech jaate hain; aadhe holdtime ki khamoshi chaar tests shuru karti hai.</p></div>

<h3>Kaunse interfaces monitored hote hain</h3>
<p>Default mein ASA apne un <b>physical data interfaces</b> ko monitor karta hai jinka <code>nameif</code> hai. Subinterfaces jaise logical interfaces tab tak monitored nahi hote jab tak aap unhe add na karo. Failover aur state links kabhi list mein nahi hote, kyunki woh data interfaces nahi hain. List aise badalte ho:</p>
<pre class="code">monitor-interface dmz
no monitor-interface lab-net</pre>
<p><code>show monitor-interface</code> dono units ka result dikhata hai:</p>
<pre class="out">NK-ASA# show monitor-interface
This host: Primary - Active
	<span class="hl">Interface outside (203.0.113.2): Normal (Monitored)</span>
	<span class="hl">Interface inside (10.0.1.1): Normal (Monitored)</span>
Other host: Secondary - Standby Ready
	Interface outside (203.0.113.3): Normal (Monitored)
	Interface inside (10.0.1.2): Normal (Monitored)</pre>
<p>Lab 4, task 1 mein jawab <b>2</b> hai: outside aur inside. <code>show failover</code> ise <code>Monitored Interfaces 2 of 1285 maximum</code> se confirm karta hai.</p>

<table class="cmp"><tr><th>Interface state</th><th>Matlab</th></tr>
<tr><td>Normal (Monitored)</td><td>Healthy aur monitored</td></tr>
<tr><td>Normal (Waiting)</td><td>Up hai, lekin units ne us par abhi tak hellos exchange nahi kiye, aam taur par kyunki <b>standby address nahi</b> hai</td></tr>
<tr><td>Normal (Not-Monitored)</td><td>Healthy lekin <code>no monitor-interface</code> se bahar</td></tr>
<tr><td>Testing</td><td>Aadhe holdtime tak hellos miss hue; tests chal rahe hain</td></tr>
<tr><td>No Link</td><td>Physical link down hai (cable, neighbour port)</td></tr>
<tr><td>Link Down</td><td>Interface administratively shut down hai</td></tr>
<tr><td>Failed</td><td>Link up lekin saare tests fail</td></tr></table>

<h3>Interface policy: kitne failures failover trigger karte hain</h3>
<p><code>failover interface-policy</code> threshold set karta hai: ek number (default <b>1</b>) ya monitored interfaces ka percentage. Jab active unit ke kam se kam utne failed interfaces hon <b>aur</b> standby zyada healthy ho (kam failed interfaces), to pair fail over karta hai. Agar dono units ka same failure ho (jaise SW-IN khud down hai), to failover ka koi matlab nahi, aur kuch nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Ek ASA outside, inside, dmz aur guest monitor karta hai. Policy 1: active unit par sirf guest khona failover trigger karta hai. Policy 2: sirf guest khone se kuch nahi hota; guest aur dmz dono khone se failover hota hai. <code>failover interface-policy 50%</code>: 4 mein se 2 interfaces fail hone chahiye. Defaults (poll 5 s, hold 25 s) ke saath ek silent failure (link up, koi jawab nahi) detect hone mein 25 second tak lagte hain; nikli hui cable link up/down test se kaafi jaldi detect hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy firewall par bina test kiye unit timers ko 200 ms / 1 s par tune karna. Chhota CPU spike ya state updates ka burst hellos ko delay kar sakta hai, aur pair bina asli wajah ke fail over karta hai, jo khud ek outage hai. Dheere dheere tune karo aur <code>show failover history</code> dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad karne wale defaults: unit poll 1 s / hold 15 s; interface poll 5 s / hold 25 s; interface policy 1. Unit holdtime poll time ka kam se kam 3 guna, interface holdtime kam se kam 5 guna. "Normal (Waiting)" missing standby address ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Guest Wi-Fi jisne data centre edge ko fail over kara diya</h4><p>Ek campus ASA ka guest interface ek sasta access switch tha jo updates ke liye har raat reboot hota tha. Har reboot se interface sirf active unit par No Link hota tha (standby ka guest port doosre switch par tha), aur policy 1 ke saath pair har raat 03:00 par fail over karta tha. Engineer ne <code>show failover history</code> padhi (har din 03:00 par Interface check), phir <code>no monitor-interface guest</code> chalaya kyunki guest Wi-Fi corporate edge ke failover ke layak nahi tha.</p><p><b>Seekh:</b> un interfaces ko monitor karo jinka khona sach mein switchover justify karta hai, aur policy soch samajh kar set karo.</p></div>

<div class="iv"><p class="q">"ASA kaise decide karta hai ki uska failover peer ya koi interface fail ho gaya?"</p><p>Strong answer: unit health har poll time (default 1 s) par failover link par hellos use karti hai; agar woh ruk jaayein, unit saare interfaces test karta hai aur peer ko tabhi failed declare karta hai jab woh holdtime (default 15 s) mein kahin jawab na de, isliye sirf tooti failover link se failover nahi hota. Interface health har monitored interface par active aur standby addresses ke beech hellos use karti hai (5 s / 25 s); aadhe holdtime ke baad unit link, network activity, ARP aur broadcast ping tests chalata hai. Interface policy (default 1) tay karti hai ki kitne failed interfaces failover trigger karenge, aur tabhi jab standby zyada healthy ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unit hellos: default poll 1 s, hold 15 s; hold poll ka kam se kam 3 guna; msec se second se kam possible.</li>
<li>Sirf failover link failure se failover nahi hota agar mate data interface par jawab de.</li>
<li>Interface hellos: poll 5 s, hold 25 s; tests hain link, network activity, ARP, broadcast ping.</li>
<li>Physical data interfaces default se monitored hain; <code>monitor-interface</code> se badlo.</li>
<li>Interface policy default 1; failover tabhi jab standby active se zyada healthy ho.</li>
</ul></div>
`}};export{e as default};