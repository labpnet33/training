var e={id:`states-election`,h:{en:`HSRP states and the Active/Standby election`,hi:`HSRP states aur Active/Standby election`},body:{en:`
<p>Picture a cricket team choosing a captain and a vice-captain. First every player walks onto the field (the interface comes up). They listen to find out if a captain already exists. If nobody is captain, the players who want the job speak up and compare their records; the best record becomes captain, the second best becomes vice-captain, and everyone else just plays. If the captain is carried off injured, the vice-captain takes the armband immediately and a new vice-captain is picked. HSRP works the same way.</p>

<h3>The six HSRP states</h3>
<dl class="terms">
<dt>Initial (shown as Init)</dt><dd>HSRP is configured but not running: the interface is down, or the group has just been configured.</dd>
<dt>Learn</dt><dd>The router does not know the virtual IP yet (it was not configured locally) and has not heard a hello from the Active router. It waits to learn the VIP.</dd>
<dt>Listen</dt><dd>The router knows the VIP and is listening to hellos. It is neither Active nor Standby. Extra routers in a group of three or more stay here, and they do not send periodic hellos.</dd>
<dt>Speak</dt><dd>The router sends hellos and takes part in the election for Active or Standby. A new group stays in Speak for one hold time (10 s by default) while it listens for better candidates.</dd>
<dt>Standby</dt><dd>Next in line. It monitors the Active router's hellos and takes over if they stop. Exactly one per group.</dd>
<dt>Active</dt><dd>Forwards packets sent to the virtual MAC and answers ARP for the VIP. Exactly one per group.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="HSRP state progression">
<rect x="10" y="40" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="13">Init</text>
<rect x="115" y="40" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="160" y="67" text-anchor="middle" class="svg-ink" font-size="13">Learn</text>
<rect x="220" y="40" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="67" text-anchor="middle" class="svg-ink" font-size="13">Listen</text>
<rect x="325" y="40" width="90" height="44" rx="8" fill="#fde68a"/><text x="370" y="67" text-anchor="middle" class="svg-ink" font-size="13">Speak</text>
<rect x="430" y="40" width="90" height="44" rx="8" fill="#bae6fd"/><text x="475" y="67" text-anchor="middle" class="svg-ink" font-size="13">Standby</text>
<rect x="535" y="40" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="67" text-anchor="middle" class="svg-ink" font-size="13">Active</text>
<line x1="100" y1="62" x2="115" y2="62" stroke="#64748b" stroke-width="2"/><line x1="205" y1="62" x2="220" y2="62" stroke="#64748b" stroke-width="2"/><line x1="310" y1="62" x2="325" y2="62" stroke="#64748b" stroke-width="2"/><line x1="415" y1="62" x2="430" y2="62" stroke="#64748b" stroke-width="2"/><line x1="520" y1="62" x2="535" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="265" y="110" text-anchor="middle" class="svg-muted" font-size="12">3rd router waits here</text>
<text x="370" y="110" text-anchor="middle" class="svg-muted" font-size="12">election, sends hellos</text>
<text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="12">hold time expires: Standby to Active</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Only Speak, Standby and Active send periodic hellos</text>
</svg><p class="cap">A router normally moves left to right; a failure of the Active router moves the Standby one step right.</p></div>

<h3>The election rules</h3>
<ol>
<li><b>Highest priority wins.</b> Range 0 to 255, default <b>100</b>.</li>
<li><b>Tie: highest interface IP address wins.</b> The real address on the HSRP interface, not the VIP.</li>
</ol>
<p>The winner becomes Active, the runner-up becomes Standby, everybody else goes to Listen. The single most important detail: <b>the election only runs when there is no Active router</b> (or when a router with preempt performs a coup, chapter 6). A better router that boots later does not take over a healthy Active router on its own.</p>

<h3>Timers that drive it</h3>
<p>By default the Active and Standby send a hello every <b>3 seconds</b>. If a router hears nothing from the Active for the <b>hold time</b> of <b>10 seconds</b> (just over three hellos), it considers the Active dead. The Standby then goes Active and a new Standby is elected from the Listen routers, if any.</p>

<div class="eg"><p><b>Worked example.</b> In the lab, R1 is 192.168.10.2 and R2 is 192.168.10.3.</p>
<ul>
<li>Both at default priority 100, both booted at the same moment: tie on priority, so the higher IP wins. <b>R2</b> becomes Active. That is why the lab sets R1 to priority 110.</li>
<li>R1 at 110, R2 at 100, both booted together: <b>R1</b> Active, R2 Standby.</li>
<li>R2 (100) boots first and is alone for a minute, then R1 (110, no preempt) comes up: R2 is already Active, no election runs, R1 becomes <b>Standby</b>.</li>
<li>Add R3 at priority 90: it ends in <b>Listen</b>. If R1 dies, R2 becomes Active and R3 moves up to Standby.</li>
</ul></div>

<h3>Watching the election</h3>
<pre class="code"><span class="c">! lab 1, task 1 on R1</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 ip 192.168.10.1
R1(config-if)# standby 10 priority 110</pre>
<pre class="out">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Speak -&gt; Standby
<span class="hl">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Standby -&gt; Active</span>

R2# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   100   Standby 192.168.10.2    local           192.168.10.1</span></pre>
<p>Read the brief line column by column: interface, group, <b>Pri</b> (current priority), <b>P</b> (preempt flag), the local state, who is Active, who is Standby (<code>local</code> means "this router"), and the VIP.</p>

<div class="warn"><p><b>Common mistake.</b> Expecting a higher priority to take effect immediately. If R2 is already Active and you raise R1 to 150 without preempt, <code>show standby brief</code> on R1 still says Standby. Nothing is broken; the election simply has not run. Chapter 6 explains preempt.</p></div>

<div class="exam"><p><b>Exam trap.</b> The tie-breaker is the <b>highest</b> IP address, not the lowest (STP prefers the lowest bridge ID, which is why people mix them up). Default priority is 100, not 0 or 1. And there is only <b>one</b> Standby; a third router is in Listen, not "Standby 2".</p></div>

<div class="scn"><h4>The wrong router kept winning</h4><p>A logistics company in Chennai wanted DIST1 as the gateway for VLAN 40, but DIST2 was Active after every maintenance. Both had priority 100; DIST1 was 10.40.0.2 and DIST2 was 10.40.0.3. On a simultaneous boot the higher IP, DIST2, always won the tie. The engineer set <code>standby 40 priority 110</code> and preempt on DIST1, and the gateway became predictable.</p><p><b>Lesson:</b> never leave the election to the IP tie-breaker; set priorities on purpose.</p></div>

<div class="iv"><p class="q">"How is the HSRP Active router elected, and what are the states?"</p><p>Strong answer: highest priority wins (0-255, default 100), and a tie goes to the highest interface IP. Winner is Active, runner-up Standby, others Listen. States are Initial, Learn, Listen, Speak, Standby and Active. Stress that the election happens only when there is no Active router unless preempt is configured, and give the timers: hello 3 s, hold 10 s.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Initial, Learn, Listen, Speak, Standby, Active.</li>
<li>One Active and one Standby per group; extra routers wait in Listen.</li>
<li>Highest priority wins (default 100); tie goes to the highest interface IP.</li>
<li>No election while a healthy Active exists, unless preempt is used.</li>
<li>Default hello 3 s, hold 10 s.</li>
</ul></div>
`,hi:`
<p>Ek cricket team socho jo captain aur vice-captain chun rahi hai. Pehle har player field par aata hai (interface up hota hai). Woh sunte hain ki koi captain pehle se hai ya nahi. Agar koi captain nahi hai, to jo players yeh kaam chahte hain woh bolte hain aur apne records compare karte hain; sabse accha record captain banta hai, doosra sabse accha vice-captain, aur baaki sab bas khelte hain. Agar captain chot lagne se bahar jaata hai, vice-captain turant armband le leta hai aur naya vice-captain chuna jaata hai. HSRP bilkul aise hi kaam karta hai.</p>

<h3>HSRP ki chhe states</h3>
<dl class="terms">
<dt>Initial (Init dikhta hai)</dt><dd>HSRP configured hai lekin chal nahi raha: interface down hai, ya group abhi abhi configure hua hai.</dd>
<dt>Learn</dt><dd>Router ko abhi virtual IP nahi pata (locally configure nahi hua) aur usne Active router ka hello nahi suna. Woh VIP seekhne ka wait karta hai.</dd>
<dt>Listen</dt><dd>Router ko VIP pata hai aur woh hellos sun raha hai. Woh na Active hai na Standby. Teen ya zyada routers ke group mein extra routers yahan rehte hain, aur periodic hellos nahi bhejte.</dd>
<dt>Speak</dt><dd>Router hellos bhejta hai aur Active ya Standby ke election mein hissa leta hai. Naya group ek hold time (default 10 s) Speak mein rehta hai jabki woh better candidates ke liye sunta hai.</dd>
<dt>Standby</dt><dd>Agla number. Yeh Active router ke hellos monitor karta hai aur ruk jaayein to kaam sambhal leta hai. Har group mein bilkul ek.</dd>
<dt>Active</dt><dd>Virtual MAC par bheje gaye packets forward karta hai aur VIP ke ARP ka jawab deta hai. Har group mein bilkul ek.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="HSRP state progression">
<rect x="10" y="40" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="13">Init</text>
<rect x="115" y="40" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="160" y="67" text-anchor="middle" class="svg-ink" font-size="13">Learn</text>
<rect x="220" y="40" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="67" text-anchor="middle" class="svg-ink" font-size="13">Listen</text>
<rect x="325" y="40" width="90" height="44" rx="8" fill="#fde68a"/><text x="370" y="67" text-anchor="middle" class="svg-ink" font-size="13">Speak</text>
<rect x="430" y="40" width="90" height="44" rx="8" fill="#bae6fd"/><text x="475" y="67" text-anchor="middle" class="svg-ink" font-size="13">Standby</text>
<rect x="535" y="40" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="67" text-anchor="middle" class="svg-ink" font-size="13">Active</text>
<line x1="100" y1="62" x2="115" y2="62" stroke="#64748b" stroke-width="2"/><line x1="205" y1="62" x2="220" y2="62" stroke="#64748b" stroke-width="2"/><line x1="310" y1="62" x2="325" y2="62" stroke="#64748b" stroke-width="2"/><line x1="415" y1="62" x2="430" y2="62" stroke="#64748b" stroke-width="2"/><line x1="520" y1="62" x2="535" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="265" y="110" text-anchor="middle" class="svg-muted" font-size="12">teesra router yahan rukta hai</text>
<text x="370" y="110" text-anchor="middle" class="svg-muted" font-size="12">election, hellos bhejta hai</text>
<text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="12">hold time khatam: Standby se Active</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Sirf Speak, Standby aur Active periodic hellos bhejte hain</text>
</svg><p class="cap">Router normally left se right chalta hai; Active router fail ho to Standby ek step right jaata hai.</p></div>

<h3>Election ke rules</h3>
<ol>
<li><b>Sabse zyada priority jeetti hai.</b> Range 0 se 255, default <b>100</b>.</li>
<li><b>Tie: sabse bada interface IP address jeetta hai.</b> HSRP interface ka asli address, VIP nahi.</li>
</ol>
<p>Jeetne wala Active banta hai, doosra number Standby, baaki sab Listen mein jaate hain. Sabse zaroori detail: <b>election tabhi chalta hai jab koi Active router na ho</b> (ya jab preempt wala router coup kare, chapter 6). Baad mein boot hone wala better router healthy Active router ko khud se nahi hatata.</p>

<h3>Isse chalane wale timers</h3>
<p>Default mein Active aur Standby har <b>3 second</b> hello bhejte hain. Agar kisi router ko <b>10 second</b> ke <b>hold time</b> tak (teen hellos se thoda zyada) Active se kuch sunai na de, to woh Active ko mara hua maanta hai. Tab Standby Active ban jaata hai aur Listen routers mein se, agar koi hai, naya Standby elect hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab mein R1 192.168.10.2 hai aur R2 192.168.10.3.</p>
<ul>
<li>Dono default priority 100 par, dono ek hi pal boot: priority par tie, isliye bada IP jeetta hai. <b>R2</b> Active banta hai. Isiliye lab R1 ko priority 110 deta hai.</li>
<li>R1 110 par, R2 100 par, dono saath boot: <b>R1</b> Active, R2 Standby.</li>
<li>R2 (100) pehle boot hota hai aur ek minute akela rehta hai, phir R1 (110, bina preempt) up aata hai: R2 pehle se Active hai, koi election nahi chalta, R1 <b>Standby</b> banta hai.</li>
<li>R3 ko priority 90 par jodo: woh <b>Listen</b> mein rehta hai. Agar R1 mare, R2 Active banta hai aur R3 upar aakar Standby banta hai.</li>
</ul></div>

<h3>Election dekhna</h3>
<pre class="code"><span class="c">! lab 1, R1 par task 1</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 ip 192.168.10.1
R1(config-if)# standby 10 priority 110</pre>
<pre class="out">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Speak -&gt; Standby
<span class="hl">%HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Standby -&gt; Active</span>

R2# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   100   Standby 192.168.10.2    local           192.168.10.1</span></pre>
<p>Brief line ko column dar column padho: interface, group, <b>Pri</b> (current priority), <b>P</b> (preempt flag), local state, Active kaun hai, Standby kaun hai (<code>local</code> matlab "yahi router"), aur VIP.</p>

<div class="warn"><p><b>Common galti.</b> Yeh expect karna ki zyada priority turant asar karegi. Agar R2 pehle se Active hai aur aap bina preempt ke R1 ko 150 kar do, to R1 par <code>show standby brief</code> abhi bhi Standby bolta hai. Kuch toota nahi hai; bas election chala hi nahi. Chapter 6 preempt samjhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tie-breaker <b>sabse bada</b> IP address hai, sabse chhota nahi (STP mein sabse chhota bridge ID jeetta hai, isiliye log dono ko mix kar dete hain). Default priority 100 hai, 0 ya 1 nahi. Aur Standby sirf <b>ek</b> hota hai; teesra router Listen mein hai, "Standby 2" nahi.</p></div>

<div class="scn"><h4>Galat router jeetta rehta tha</h4><p>Chennai ki ek logistics company VLAN 40 ke liye DIST1 ko gateway chahti thi, lekin har maintenance ke baad DIST2 Active hota tha. Dono ki priority 100 thi; DIST1 10.40.0.2 tha aur DIST2 10.40.0.3. Ek saath boot par bada IP, DIST2, hamesha tie jeet jaata tha. Engineer ne DIST1 par <code>standby 40 priority 110</code> aur preempt set kiya, aur gateway predictable ho gaya.</p><p><b>Seekh:</b> election ko kabhi IP tie-breaker par mat chhodo; priorities soch samajh kar set karo.</p></div>

<div class="iv"><p class="q">"HSRP Active router kaise elect hota hai, aur states kaunsi hain?"</p><p>Strong answer: sabse zyada priority jeetti hai (0-255, default 100), aur tie sabse bade interface IP ko jaata hai. Jeetne wala Active, doosra Standby, baaki Listen. States hain Initial, Learn, Listen, Speak, Standby aur Active. Zor do ki election tabhi hota hai jab koi Active router na ho, jab tak preempt configured na ho, aur timers batao: hello 3 s, hold 10 s.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Initial, Learn, Listen, Speak, Standby, Active.</li>
<li>Har group mein ek Active aur ek Standby; extra routers Listen mein wait karte hain.</li>
<li>Sabse zyada priority jeetti hai (default 100); tie sabse bade interface IP ko jaata hai.</li>
<li>Healthy Active ke rehte koi election nahi, jab tak preempt use na ho.</li>
<li>Default hello 3 s, hold 10 s.</li>
</ul></div>
`}};export{e as default};