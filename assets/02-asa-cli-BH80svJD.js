var e={id:`cli`,h:{en:`The ASA CLI for IOS people`,hi:`IOS walon ke liye ASA CLI`},body:{en:`
<p>If you have configured a Cisco router, the ASA prompt will feel familiar within seconds, and then surprise you within minutes. Think of it like driving a car from another country: the steering wheel and pedals are where you expect, but the indicator stalk is on the other side. This chapter lists the differences that trip people up, so your hands learn them before the labs.</p>

<h3>The three prompts</h3>
<pre class="code">ciscoasa&gt; enable
Password:                       <span class="c">! blank by default on many releases: just press Enter</span>
ciscoasa# configure terminal
ciscoasa(config)#</pre>
<p>User EXEC (<code>&gt;</code>), privileged EXEC (<code>#</code>) and global configuration (<code>(config)#</code>) work like IOS. On many releases the enable password is empty until you set one; newer releases ask you to set it the first time you type <code>enable</code>. Either way, setting a strong enable password is one of your first jobs (chapter 4).</p>

<h3>Differences that matter every day</h3>
<table class="cmp"><tr><th>Task</th><th>Router (IOS)</th><th>ASA</th></tr>
<tr><td>Run show in config mode</td><td><code>do show ip route</code></td><td><code>show route</code> (no <code>do</code> needed)</td></tr>
<tr><td>Routing table</td><td><code>show ip route</code></td><td><code>show route</code></td></tr>
<tr><td>Interface summary</td><td><code>show ip interface brief</code></td><td><code>show interface ip brief</code>, <code>show nameif</code></td></tr>
<tr><td>Static route</td><td><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code></td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td></tr>
<tr><td>Masks in ACLs and OSPF</td><td>wildcard (0.0.0.255)</td><td>subnet mask (255.255.255.0)</td></tr>
<tr><td>NAT table</td><td><code>show ip nat translations</code></td><td><code>show xlate</code>, <code>show nat</code></td></tr>
<tr><td>Save</td><td><code>copy run start</code></td><td><code>write memory</code> (or <code>copy running-config startup-config</code>)</td></tr>
<tr><td>No paging</td><td><code>terminal length 0</code></td><td><code>terminal pager 0</code></td></tr>
<tr><td>Interfaces after boot</td><td>often enabled</td><td>shut down until <code>no shutdown</code> (outside a factory-default config)</td></tr>
</table>

<h3>Why "no ip" appears less often</h3>
<p>On IOS, most layer 3 commands start with <code>ip</code>. On the ASA, many do not: <code>route</code>, <code>nat</code>, <code>ssh</code>, <code>access-list</code> without the <code>ip</code> prefix. The interface address is still <code>ip address</code>, which is where people get confused. When in doubt, type the first word and <code>?</code>; the ASA help system is as good as the IOS one.</p>

<h3>Reading and cleaning the configuration</h3>
<ul>
<li><code>show running-config</code> hides default values. <code>show running-config all</code> shows everything, including defaults such as timeouts.</li>
<li>You can show one section: <code>show running-config interface GigabitEthernet0/1</code>, <code>show running-config nat</code>, <code>show running-config route</code>.</li>
<li><code>clear configure &lt;feature&gt;</code> removes a whole feature at once, for example <code>clear configure route</code>. Powerful and dangerous: there is no confirmation.</li>
<li>Output filters work as on IOS: <code>| include</code>, <code>| exclude</code>, <code>| begin</code>, plus <code>| grep</code> on the ASA.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Names versus ports">
<rect x="20" y="20" width="170" height="130" rx="10" fill="#e2e8f0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Router thinks in ports</text>
<text x="105" y="75" text-anchor="middle" class="svg-muted" font-size="12">ip route ... Gi0/0</text>
<text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">ip nat inside on Gi0/1</text>
<text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">ip access-group on Gi0/0</text>
<rect x="240" y="60" width="150" height="50" rx="10" fill="#fed7aa"/><text x="315" y="90" text-anchor="middle" class="svg-ink" font-size="14">nameif = the key</text>
<rect x="440" y="20" width="180" height="130" rx="10" fill="#bae6fd"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">ASA thinks in names</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">route outside ...</text>
<text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">nat (inside,outside)</text>
<text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">ssh ... inside</text>
<line x1="190" y1="85" x2="240" y2="85" stroke="#64748b"/><line x1="390" y1="85" x2="440" y2="85" stroke="#64748b"/>
</svg><p class="cap">The biggest mental shift: after you set nameif, almost every ASA command uses the interface name.</p></div>

<h3>Useful everyday commands</h3>
<pre class="code"><span class="c">! identify the box and software</span>
show version
<span class="c">! interface names and levels</span>
show nameif
<span class="c">! ping from a specific interface</span>
ping inside 10.0.1.10
<span class="c">! stop paging while you capture output</span>
terminal pager 0
<span class="c">! save</span>
write memory</pre>
<pre class="out">NK-ASA# write memory
Building configuration...
Cryptochecksum: 5c1f2a8e 7d3b9c10 44e1a6f2 0b9d7e53
<span class="hl">[OK]</span></pre>

<div class="eg"><p><b>Worked example.</b> You are in <code>(config-if)#</code> on Gi0/1 and want to check whether the name is already used. On IOS you would type <code>do show ...</code>; on the ASA simply type <code>show nameif</code>. It works from any configuration sub-mode and you stay where you are.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing wildcard masks out of habit (<code>0.0.0.255</code>) in an ASA object or OSPF network statement: the ASA expects a subnet mask and will reject it or build something you did not mean. Forgetting <code>write memory</code>, then losing the whole day's work at the next reload. Using <code>clear configure</code> on a production box to "tidy up".</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip interface brief</code> is an IOS command. On the ASA the equivalent is <code>show interface ip brief</code> (the words are in a different order), and <code>show nameif</code> shows names and security levels, which the brief output does not.</p></div>

<div class="scn"><h4>The configuration that vanished on Monday</h4><p>A junior engineer built a complete DMZ on a new ASA on Friday, tested it and went home. Over the weekend the site had a planned power shutdown. On Monday the ASA booted with the old configuration and the DMZ was gone. <code>show startup-config</code> confirmed that nothing had been saved. The team rebuilt from the engineer's notes and added a rule to their change checklist: last step, <code>write memory</code>, then compare <code>show running-config</code> and <code>show startup-config</code>.</p><p><b>Lesson:</b> on the ASA, just as on IOS, the running configuration lives in RAM until you save it.</p></div>

<div class="iv"><p class="q">"You are an IOS engineer. What changes when you log in to an ASA?"</p><p>Strong answer: list concrete differences. Show commands run directly in configuration mode; routes name the egress interface (<code>route outside ...</code>); ACLs and OSPF use subnet masks, not wildcards; <code>show route</code>, <code>show interface ip brief</code>, <code>show xlate</code> replace the IOS forms; <code>write memory</code> saves. Then add the concept difference: everything references the <code>nameif</code>, and traffic is controlled by security levels and ACLs, not just routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same three prompts as IOS; show commands work in any configuration mode without <code>do</code>.</li>
<li>Routes include the interface name; ACLs and OSPF use subnet masks.</li>
<li>Key commands: <code>show route</code>, <code>show interface ip brief</code>, <code>show nameif</code>, <code>show xlate</code>, <code>write memory</code>.</li>
<li><code>show running-config all</code> shows defaults; <code>clear configure</code> deletes a whole feature.</li>
<li>After nameif, the name is what every other command uses.</li>
</ul></div>
`,hi:`
<p>Agar aapne Cisco router configure kiya hai, to ASA prompt kuch seconds mein familiar lagega, aur phir kuch minutes mein aapko surprise karega. Ise dusre desh ki car chalane jaisa socho: steering aur pedals wahin hain jahan aap expect karte ho, lekin indicator ki lever doosri side par hai. Yeh chapter woh differences list karta hai jinmein log phaste hain, taaki labs se pehle aapke haath unhe seekh lein.</p>

<h3>Teen prompts</h3>
<pre class="code">ciscoasa&gt; enable
Password:                       <span class="c">! kai releases par default blank: bas Enter dabao</span>
ciscoasa# configure terminal
ciscoasa(config)#</pre>
<p>User EXEC (<code>&gt;</code>), privileged EXEC (<code>#</code>) aur global configuration (<code>(config)#</code>) IOS ki tarah kaam karte hain. Kai releases par enable password tab tak khaali rehta hai jab tak aap set na karo; naye releases pehli baar <code>enable</code> type karne par aapse set karne ko kehte hain. Dono case mein, strong enable password set karna aapke pehle kaamon mein se ek hai (chapter 4).</p>

<h3>Differences jo roz matter karte hain</h3>
<table class="cmp"><tr><th>Kaam</th><th>Router (IOS)</th><th>ASA</th></tr>
<tr><td>Config mode mein show chalana</td><td><code>do show ip route</code></td><td><code>show route</code> (<code>do</code> ki zaroorat nahi)</td></tr>
<tr><td>Routing table</td><td><code>show ip route</code></td><td><code>show route</code></td></tr>
<tr><td>Interface summary</td><td><code>show ip interface brief</code></td><td><code>show interface ip brief</code>, <code>show nameif</code></td></tr>
<tr><td>Static route</td><td><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code></td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td></tr>
<tr><td>ACLs aur OSPF mein masks</td><td>wildcard (0.0.0.255)</td><td>subnet mask (255.255.255.0)</td></tr>
<tr><td>NAT table</td><td><code>show ip nat translations</code></td><td><code>show xlate</code>, <code>show nat</code></td></tr>
<tr><td>Save</td><td><code>copy run start</code></td><td><code>write memory</code> (ya <code>copy running-config startup-config</code>)</td></tr>
<tr><td>Paging band</td><td><code>terminal length 0</code></td><td><code>terminal pager 0</code></td></tr>
<tr><td>Boot ke baad interfaces</td><td>aksar enabled</td><td><code>no shutdown</code> tak shut down (factory-default config ke alawa)</td></tr>
</table>

<h3>"ip" kam kyun dikhta hai</h3>
<p>IOS par zyada tar layer 3 commands <code>ip</code> se shuru hote hain. ASA par bahut saare nahi hote: <code>route</code>, <code>nat</code>, <code>ssh</code>, <code>access-list</code> bina <code>ip</code> prefix ke. Interface address abhi bhi <code>ip address</code> hai, aur yahin log confuse hote hain. Doubt ho to pehla word type karo aur <code>?</code> dabao; ASA ka help system IOS jitna hi achha hai.</p>

<h3>Configuration padhna aur saaf karna</h3>
<ul>
<li><code>show running-config</code> default values chhupata hai. <code>show running-config all</code> sab dikhata hai, defaults jaise timeouts bhi.</li>
<li>Aap ek section dikha sakte ho: <code>show running-config interface GigabitEthernet0/1</code>, <code>show running-config nat</code>, <code>show running-config route</code>.</li>
<li><code>clear configure &lt;feature&gt;</code> ek poora feature ek saath hata deta hai, jaise <code>clear configure route</code>. Powerful aur khatarnaak: koi confirmation nahi aata.</li>
<li>Output filters IOS ki tarah kaam karte hain: <code>| include</code>, <code>| exclude</code>, <code>| begin</code>, aur ASA par <code>| grep</code> bhi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Naam banaam ports">
<rect x="20" y="20" width="170" height="130" rx="10" fill="#e2e8f0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Router ports mein sochta hai</text>
<text x="105" y="75" text-anchor="middle" class="svg-muted" font-size="12">ip route ... Gi0/0</text>
<text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">ip nat inside on Gi0/1</text>
<text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">ip access-group on Gi0/0</text>
<rect x="240" y="60" width="150" height="50" rx="10" fill="#fed7aa"/><text x="315" y="90" text-anchor="middle" class="svg-ink" font-size="14">nameif = chaabi</text>
<rect x="440" y="20" width="180" height="130" rx="10" fill="#bae6fd"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">ASA naamon mein sochta hai</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">route outside ...</text>
<text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">nat (inside,outside)</text>
<text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">ssh ... inside</text>
<line x1="190" y1="85" x2="240" y2="85" stroke="#64748b"/><line x1="390" y1="85" x2="440" y2="85" stroke="#64748b"/>
</svg><p class="cap">Sabse bada mental shift: nameif set karne ke baad, ASA ki lagbhag har command interface ka naam use karti hai.</p></div>

<h3>Roz ke useful commands</h3>
<pre class="code"><span class="c">! box aur software pehchano</span>
show version
<span class="c">! interface names aur levels</span>
show nameif
<span class="c">! ek specific interface se ping</span>
ping inside 10.0.1.10
<span class="c">! output capture karte waqt paging band karo</span>
terminal pager 0
<span class="c">! save</span>
write memory</pre>
<pre class="out">NK-ASA# write memory
Building configuration...
Cryptochecksum: 5c1f2a8e 7d3b9c10 44e1a6f2 0b9d7e53
<span class="hl">[OK]</span></pre>

<div class="eg"><p><b>Worked example.</b> Aap Gi0/1 par <code>(config-if)#</code> mein ho aur check karna chahte ho ki naam pehle se use ho raha hai ya nahi. IOS par aap <code>do show ...</code> type karte; ASA par simply <code>show nameif</code> type karo. Yeh kisi bhi configuration sub-mode se kaam karta hai aur aap wahin rehte ho jahan the.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Aadat se ASA object ya OSPF network statement mein wildcard masks (<code>0.0.0.255</code>) type karna: ASA subnet mask expect karta hai aur ise reject karega ya kuch aisa banayega jo aapka matlab nahi tha. <code>write memory</code> bhool jaana, aur agle reload par poore din ka kaam kho dena. Production box par "saaf-safai" ke liye <code>clear configure</code> use karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip interface brief</code> IOS command hai. ASA par iska equivalent <code>show interface ip brief</code> hai (words ka order alag hai), aur <code>show nameif</code> names aur security levels dikhata hai, jo brief output nahi dikhata.</p></div>

<div class="scn"><h4>Woh configuration jo Monday ko gayab ho gayi</h4><p>Ek junior engineer ne Friday ko naye ASA par poora DMZ banaya, test kiya aur ghar chala gaya. Weekend mein site par planned power shutdown hua. Monday ko ASA purani configuration ke saath boot hua aur DMZ gayab tha. <code>show startup-config</code> ne confirm kiya ki kuch bhi save nahi hua tha. Team ne engineer ke notes se dobara banaya aur apni change checklist mein ek rule joda: aakhri step, <code>write memory</code>, phir <code>show running-config</code> aur <code>show startup-config</code> compare karo.</p><p><b>Seekh:</b> ASA par, IOS ki tarah hi, running configuration save karne tak RAM mein rehti hai.</p></div>

<div class="iv"><p class="q">"Aap IOS engineer ho. ASA par login karne par kya badalta hai?"</p><p>Strong answer: concrete differences list karo. Show commands seedha configuration mode mein chalte hain; routes egress interface ka naam lete hain (<code>route outside ...</code>); ACLs aur OSPF subnet masks use karte hain, wildcards nahi; <code>show route</code>, <code>show interface ip brief</code>, <code>show xlate</code> IOS forms ki jagah lete hain; <code>write memory</code> save karta hai. Phir concept difference jodo: sab kuch <code>nameif</code> ko refer karta hai, aur traffic security levels aur ACLs se control hota hai, sirf routes se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS jaise hi teen prompts; show commands kisi bhi configuration mode mein bina <code>do</code> ke chalte hain.</li>
<li>Routes mein interface ka naam hota hai; ACLs aur OSPF subnet masks use karte hain.</li>
<li>Key commands: <code>show route</code>, <code>show interface ip brief</code>, <code>show nameif</code>, <code>show xlate</code>, <code>write memory</code>.</li>
<li><code>show running-config all</code> defaults dikhata hai; <code>clear configure</code> poora feature delete karta hai.</li>
<li>nameif ke baad, naam hi woh cheez hai jo har doosri command use karti hai.</li>
</ul></div>
`}};export{e as default};