var e={id:`show`,h:{en:`Show commands, output filters and the do command`,hi:`Show commands, output filters aur do command`},body:{en:`
<p>A doctor does not operate before looking at the X-ray. In networking, <code>show</code> commands are your X-rays: they change nothing and tell you everything. The skill is not only knowing which <code>show</code> to run, but cutting a 400-line output down to the three lines that matter. That is what output filters are for.</p>

<h3>The show commands you will use every day</h3>
<table class="cmp"><tr><th>Command</th><th>Answers the question</th></tr>
<tr><td><code>show version</code></td><td>Which IOS, which hardware, how long up, why it last rebooted, config register?</td></tr>
<tr><td><code>show running-config</code></td><td>What is configured right now?</td></tr>
<tr><td><code>show startup-config</code></td><td>What will load at the next boot?</td></tr>
<tr><td><code>show ip interface brief</code></td><td>Which interfaces are up, and with which IP addresses?</td></tr>
<tr><td><code>show interfaces [name]</code></td><td>Detailed status, MAC, speed, duplex, counters and errors</td></tr>
<tr><td><code>show interfaces description</code></td><td>What is each port labelled as?</td></tr>
<tr><td><code>show interfaces status</code></td><td>(switch) connected / notconnect, VLAN, speed and duplex per port</td></tr>
<tr><td><code>show ip route</code></td><td>(router) Which networks does it know and how does it reach them?</td></tr>
<tr><td><code>show arp</code> / <code>show mac address-table</code></td><td>Which IP maps to which MAC / which MAC is on which switch port?</td></tr>
<tr><td><code>show users</code>, <code>show history</code>, <code>show clock</code></td><td>Who is logged in, what did I type, what time does the device think it is?</td></tr>
</table>

<h3>Output filters: the pipe</h3>
<p>Add <code>|</code> (pipe) after any <code>show</code> command, followed by a filter keyword and a pattern. The pattern is a regular expression, but plain words work fine. Filters are <b>case-sensitive</b> on real IOS.</p>
<table class="cmp"><tr><th>Filter</th><th>Shows</th><th>Example</th></tr>
<tr><td><code>| include X</code></td><td>Only lines containing X</td><td><code>show run | include hostname</code></td></tr>
<tr><td><code>| exclude X</code></td><td>Every line except those containing X</td><td><code>show ip int brief | exclude unassigned</code></td></tr>
<tr><td><code>| begin X</code></td><td>Everything from the first line containing X</td><td><code>show run | begin line con</code></td></tr>
<tr><td><code>| section X</code></td><td>Each block whose top line contains X, with its indented lines</td><td><code>show run | section interface</code></td></tr>
<tr><td><code>| count X</code></td><td>How many lines match</td><td><code>show ip int brief | count up</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Output filter funnel">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#e2e8f0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">show running-config</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">400 lines</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">interfaces, lines,</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">banner, routes ...</text>
<polygon points="240,40 400,80 400,110 240,150" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">| section line</text>
<rect x="450" y="50" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="78" text-anchor="middle" class="svg-accent" font-size="12">line con 0</text><text x="535" y="96" text-anchor="middle" class="svg-accent" font-size="12"> password 7 ...</text><text x="535" y="114" text-anchor="middle" class="svg-accent" font-size="12">line vty 0 4 ...</text>
<line x1="190" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The pipe turns a long output into the few lines you need.</p></div>

<pre class="out">R1# show running-config | section line
line con 0
 exec-timeout 5 0
 password 7 02250B552B575D72
 logging synchronous
 login
line vty 0 4
 password 7 023010422B575D72
 login

R1# show ip interface brief | exclude unassigned
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span></pre>

<p>Two more tools help with long output. <code>show running-config interface GigabitEthernet0/0</code> prints only that interface. <code>terminal length 0</code> disables the <code>--More--</code> pause for your session so you can copy everything at once.</p>

<h3>Running EXEC commands from config mode: do</h3>
<p>You are in the middle of configuring an interface and want to check the result. Without <code>do</code> you would need <code>end</code>, <code>show</code>, <code>configure terminal</code>, <code>interface ...</code> again. With <code>do</code> you stay where you are:</p>
<pre class="code">LAB-SW1(config)# do show running-config | include hostname
hostname LAB-SW1
R1(config-if)# do show ip interface brief
R1(config-if)# do ping 192.168.10.2
R1(config)# do copy running-config startup-config</pre>
<p><code>do</code> works for any privileged EXEC command, including <code>ping</code> and <code>copy</code>. Help (<code>?</code>) also works after <code>do</code>. Without <code>do</code>, typing <code>show</code> in config mode gives <code>% Invalid input</code>, because <code>show</code> is not a configuration command.</p>

<div class="eg"><p><b>Worked example from lab 1.</b> After <code>hostname LAB-SW1</code> you are at <code>LAB-SW1(config)#</code>. You type <code>do show running-config | include hostname</code> and get exactly one line: <code>hostname LAB-SW1</code>. Then <code>end</code> and <code>show history</code> list every command you typed in this session, which is also how you prove to an auditor what you did.</p></div>

<h3>A verification habit</h3>
<p>Every change should be followed by a matching <code>show</code>: after <code>ip address</code>, <code>show ip interface brief</code>; after line passwords, <code>show running-config | section line</code>; after saving, <code>show startup-config | include hostname</code>. The pattern "configure, verify, save, verify" catches most mistakes within seconds.</p>

<div class="warn"><p><b>Common mistakes.</b> Using a lowercase pattern for uppercase text (<code>| include vlan</code> does not match <code>Vlan1</code> on real IOS). Filtering with <code>| include</code> when you need the whole block (<code>| section</code>). Forgetting the space rules: <code>show run | inc hostname</code> works, <code>show run |inc hostname</code> also works, but a missing pattern gives <code>% Incomplete command</code>. Typing <code>show</code> in config mode without <code>do</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>include</code>, <code>exclude</code>, <code>begin</code> and <code>section</code> are the filters most often tested. <code>section</code> keeps the indented child lines; <code>include</code> does not. <code>do</code> runs EXEC commands from any configuration mode. <code>show</code> commands never change the configuration.</p></div>

<div class="scn"><h4>Finding one password line in 3000</h4><p>During an audit, a team had to prove that all 120 switches had passwords on every VTY line. Scrolling through <code>show running-config</code> on each switch would have taken days. They ran <code>show running-config | section line vty</code> on each device (later through an automation script) and checked for <code>login local</code> and <code>transport input ssh</code>. Four switches had a second <code>line vty 5 15</code> block with no login method. Those were fixed the same afternoon.</p><p><b>Lesson:</b> filters turn "read everything" into "check exactly this". They are also the first step to automation.</p></div>

<div class="iv"><p class="q">"How do you quickly check one part of a large running configuration?"</p><p>Strong answer: use output modifiers. <code>show running-config | section line vty</code> for a block, <code>| include</code> for single lines, <code>| begin</code> to jump to a point, <code>| exclude</code> to remove noise, <code>show running-config interface X</code> for one interface. From config mode use <code>do show ...</code> so you do not have to leave the mode. Mention that patterns are regular expressions and case-sensitive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show</code> commands change nothing; learn the core set: version, running/startup-config, ip interface brief, interfaces, ip route.</li>
<li>Pipe filters: <code>include</code>, <code>exclude</code>, <code>begin</code>, <code>section</code>, <code>count</code>.</li>
<li><code>section</code> returns whole configuration blocks, including indented lines.</li>
<li><code>do</code> runs any privileged EXEC command (show, ping, copy) from configuration mode.</li>
<li>Build the habit: configure, verify, save, verify.</li>
</ul></div>
`,hi:`
<p>Doctor X-ray dekhe bina operation nahi karta. Networking mein <code>show</code> commands aapke X-rays hain: yeh kuch nahi badalti aur sab kuch batati hain. Skill sirf yeh jaanna nahi hai ki kaunsa <code>show</code> chalana hai, balki 400 line ke output ko un teen lines tak kaatna hai jo matter karti hain. Output filters isi ke liye hain.</p>

<h3>Show commands jo aap roz use karoge</h3>
<table class="cmp"><tr><th>Command</th><th>Kis sawaal ka jawab</th></tr>
<tr><td><code>show version</code></td><td>Kaunsa IOS, kaunsa hardware, kitni der se up, pichhli baar reboot kyun hua, config register?</td></tr>
<tr><td><code>show running-config</code></td><td>Abhi kya configured hai?</td></tr>
<tr><td><code>show startup-config</code></td><td>Agle boot par kya load hoga?</td></tr>
<tr><td><code>show ip interface brief</code></td><td>Kaunse interfaces up hain, aur kaunse IP addresses ke saath?</td></tr>
<tr><td><code>show interfaces [name]</code></td><td>Detailed status, MAC, speed, duplex, counters aur errors</td></tr>
<tr><td><code>show interfaces description</code></td><td>Har port ka label kya hai?</td></tr>
<tr><td><code>show interfaces status</code></td><td>(switch) har port ka connected / notconnect, VLAN, speed aur duplex</td></tr>
<tr><td><code>show ip route</code></td><td>(router) Isse kaunse networks pata hain aur unhe kaise reach karta hai?</td></tr>
<tr><td><code>show arp</code> / <code>show mac address-table</code></td><td>Kaunsa IP kis MAC se map hai / kaunsa MAC kis switch port par hai?</td></tr>
<tr><td><code>show users</code>, <code>show history</code>, <code>show clock</code></td><td>Kaun logged in hai, maine kya type kiya, device ke hisaab se kya time hai?</td></tr>
</table>

<h3>Output filters: pipe</h3>
<p>Kisi bhi <code>show</code> command ke baad <code>|</code> (pipe) lagao, phir filter keyword aur ek pattern. Pattern regular expression hai, lekin simple words bhi theek chalte hain. Real IOS par filters <b>case-sensitive</b> hote hain.</p>
<table class="cmp"><tr><th>Filter</th><th>Dikhata hai</th><th>Example</th></tr>
<tr><td><code>| include X</code></td><td>Sirf woh lines jinmein X hai</td><td><code>show run | include hostname</code></td></tr>
<tr><td><code>| exclude X</code></td><td>X wali lines ke alawa har line</td><td><code>show ip int brief | exclude unassigned</code></td></tr>
<tr><td><code>| begin X</code></td><td>X wali pehli line se aage sab kuch</td><td><code>show run | begin line con</code></td></tr>
<tr><td><code>| section X</code></td><td>Har woh block jiski top line mein X hai, uski indented lines ke saath</td><td><code>show run | section interface</code></td></tr>
<tr><td><code>| count X</code></td><td>Kitni lines match karti hain</td><td><code>show ip int brief | count up</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Output filter funnel">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#e2e8f0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="13">show running-config</text><text x="105" y="85" text-anchor="middle" class="svg-muted" font-size="12">400 lines</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">interfaces, lines,</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">banner, routes ...</text>
<polygon points="240,40 400,80 400,110 240,150" fill="#fde68a"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">| section line</text>
<rect x="450" y="50" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="78" text-anchor="middle" class="svg-accent" font-size="12">line con 0</text><text x="535" y="96" text-anchor="middle" class="svg-accent" font-size="12"> password 7 ...</text><text x="535" y="114" text-anchor="middle" class="svg-accent" font-size="12">line vty 0 4 ...</text>
<line x1="190" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pipe lambe output ko un kuch lines mein badal deta hai jo aapko chahiye.</p></div>

<pre class="out">R1# show running-config | section line
line con 0
 exec-timeout 5 0
 password 7 02250B552B575D72
 logging synchronous
 login
line vty 0 4
 password 7 023010422B575D72
 login

R1# show ip interface brief | exclude unassigned
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span></pre>

<p>Lambe output ke liye do aur tools kaam aate hain. <code>show running-config interface GigabitEthernet0/0</code> sirf us interface ko print karta hai. <code>terminal length 0</code> aapke session ke liye <code>--More--</code> pause band kar deta hai taaki aap sab ek saath copy kar sako.</p>

<h3>Config mode se EXEC commands chalana: do</h3>
<p>Aap interface configure karne ke beech mein ho aur result check karna chahte ho. <code>do</code> ke bina aapko <code>end</code>, <code>show</code>, <code>configure terminal</code>, <code>interface ...</code> dobara karna padega. <code>do</code> ke saath aap wahin rehte ho:</p>
<pre class="code">LAB-SW1(config)# do show running-config | include hostname
hostname LAB-SW1
R1(config-if)# do show ip interface brief
R1(config-if)# do ping 192.168.10.2
R1(config)# do copy running-config startup-config</pre>
<p><code>do</code> kisi bhi privileged EXEC command ke liye kaam karta hai, <code>ping</code> aur <code>copy</code> samet. <code>do</code> ke baad help (<code>?</code>) bhi chalta hai. <code>do</code> ke bina config mode mein <code>show</code> type karne par <code>% Invalid input</code> milta hai, kyunki <code>show</code> configuration command nahi hai.</p>

<div class="eg"><p><b>Lab 1 ka worked example.</b> <code>hostname LAB-SW1</code> ke baad aap <code>LAB-SW1(config)#</code> par ho. Aap <code>do show running-config | include hostname</code> type karte ho aur bilkul ek line milti hai: <code>hostname LAB-SW1</code>. Phir <code>end</code> aur <code>show history</code> is session mein type ki gayi har command list karte hain, jisse aap auditor ko bhi prove kar sakte ho ki aapne kya kiya.</p></div>

<h3>Verification ki aadat</h3>
<p>Har change ke baad matching <code>show</code> hona chahiye: <code>ip address</code> ke baad <code>show ip interface brief</code>; line passwords ke baad <code>show running-config | section line</code>; save ke baad <code>show startup-config | include hostname</code>. "Configure, verify, save, verify" ka pattern zyada tar galtiyan seconds mein pakad leta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Uppercase text ke liye lowercase pattern use karna (real IOS par <code>| include vlan</code> <code>Vlan1</code> se match nahi karta). Jab poora block chahiye tab <code>| include</code> se filter karna (<code>| section</code> use karo). Space rules bhool jaana: <code>show run | inc hostname</code> chalta hai, <code>show run |inc hostname</code> bhi chalta hai, lekin pattern missing ho to <code>% Incomplete command</code> milta hai. Config mode mein bina <code>do</code> ke <code>show</code> type karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>include</code>, <code>exclude</code>, <code>begin</code> aur <code>section</code> sabse zyada test hone wale filters hain. <code>section</code> indented child lines rakhta hai; <code>include</code> nahi. <code>do</code> kisi bhi configuration mode se EXEC commands chalata hai. <code>show</code> commands kabhi configuration nahi badalti.</p></div>

<div class="scn"><h4>3000 mein se ek password line dhoondhna</h4><p>Audit ke dauraan ek team ko prove karna tha ki saare 120 switches ki har VTY line par password hai. Har switch par <code>show running-config</code> scroll karne mein din lag jaate. Unhone har device par <code>show running-config | section line vty</code> chalaya (baad mein automation script se) aur <code>login local</code> aur <code>transport input ssh</code> check kiya. Chaar switches par ek dusra <code>line vty 5 15</code> block tha jismein koi login method nahi tha. Woh usi dopahar fix ho gaye.</p><p><b>Seekh:</b> filters "sab kuch padho" ko "bilkul yeh check karo" mein badal dete hain. Yeh automation ki taraf pehla step bhi hain.</p></div>

<div class="iv"><p class="q">"Badi running configuration ka ek hissa jaldi kaise check karte ho?"</p><p>Strong answer: output modifiers use karke. Block ke liye <code>show running-config | section line vty</code>, single lines ke liye <code>| include</code>, kisi point par jump karne ke liye <code>| begin</code>, noise hatane ke liye <code>| exclude</code>, ek interface ke liye <code>show running-config interface X</code>. Config mode se <code>do show ...</code> use karo taaki mode chhodna na pade. Yeh bolo ki patterns regular expressions hain aur case-sensitive hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show</code> commands kuch nahi badalti; core set seekho: version, running/startup-config, ip interface brief, interfaces, ip route.</li>
<li>Pipe filters: <code>include</code>, <code>exclude</code>, <code>begin</code>, <code>section</code>, <code>count</code>.</li>
<li><code>section</code> poore configuration blocks deta hai, indented lines samet.</li>
<li><code>do</code> configuration mode se koi bhi privileged EXEC command (show, ping, copy) chalata hai.</li>
<li>Aadat banao: configure, verify, save, verify.</li>
</ul></div>
`}};export{e as default};