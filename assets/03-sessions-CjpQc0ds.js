var e={id:`sessions`,h:{en:`Per-vendor session behaviour: prompts, paging and enable`,hi:`Har vendor ka session behaviour: prompts, paging aur enable`},body:{en:`
<p><b>The idea of this chapter:</b> before your first command runs, netmiko has already done a small checklist for you. It found the prompt, switched paging off, widened the line and, where needed, entered privileged mode. That checklist is different for every vendor, and knowing it explains most strange first-connection errors.</p>

<h3>Analogy: checking in at a hotel</h3>
<p>Every hotel has a front desk, but the routine differs: one wants a passport, another a booking number, a third hands you a key card and a map. The <b>session preparation</b> is the check-in. Your script only starts "living in the room" (running show commands) after it is done.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Connection steps before the first command">
<rect x="5" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="60" y="52" text-anchor="middle" class="svg-ink" font-size="12">SSH login</text><text x="60" y="68" text-anchor="middle" class="svg-muted" font-size="10">user + password</text>
<rect x="135" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="12">find prompt</text><text x="190" y="68" text-anchor="middle" class="svg-muted" font-size="10">base_prompt</text>
<rect x="265" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">paging off</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="10">+ line width</text>
<rect x="395" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="12">enable</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="10">if the box has it</text>
<rect x="525" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="12">your commands</text><text x="580" y="68" text-anchor="middle" class="svg-muted" font-size="10">send_command</text>
<line x1="115" y1="55" x2="135" y2="55" stroke="#64748b" stroke-width="2"/><line x1="245" y1="55" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><line x1="375" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="525" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The first four boxes happen inside ConnectHandler(). Only the last one is your code.</p></div>

<h3>What netmiko sends, platform by platform</h3>
<table class="cmp"><tr><th>device_type</th><th>Prompt</th><th>Paging and width commands</th><th>Enable</th></tr>
<tr><td><code>cisco_ios</code></td><td><code>PUN-CORE-R1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>yes, uses <code>secret</code></td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>N1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>role decides; network-admin lands in <code>#</code></td></tr>
<tr><td><code>arista_eos</code></td><td><code>E1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>yes, uses <code>secret</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>netops@J1&gt;</code></td><td><code>set cli screen-width 511</code>, <code>set cli complete-on-space off</code>, <code>set cli screen-length 0</code></td><td>none (a no-op)</td></tr>
<tr><td><code>cisco_asa</code></td><td><code>ASA1#</code></td><td><code>terminal pager 0</code>, <code>terminal width 511</code></td><td>yes, logs in then runs <code>enable</code></td></tr>
<tr><td><code>fortinet</code></td><td><code>FGT1 #</code></td><td>switches console output to "standard" (no paging)</td><td>none</td></tr>
<tr><td><code>paloalto_panos</code></td><td><code>admin@PA1&gt;</code></td><td><code>set cli scripting-mode on</code>, <code>set cli terminal width 500</code>, <code>set cli pager off</code></td><td>none</td></tr></table>

<h3>Seeing it with your own eyes: session_log</h3>
<p>The <code>session_log</code> argument writes everything netmiko sent and received into a file. Lab 1 task 3 asks you to read the log of J1 that <code>probe.py</code> already created:</p>
<pre class="out">AUTO01$ cat logs/J1.log
--- NK-OS 2.0-nk built 2026-09-01 by Network Kings
netops@J1&gt;
netops@J1&gt;
netops@J1&gt; set cli screen-width 511
Screen width set to 511
netops@J1&gt; set cli complete-on-space off
Disabling complete-on-space
<span class="hl">netops@J1&gt; set cli screen-length 0</span>
Screen length set to 0
netops@J1&gt;
netops@J1&gt;
netops@J1&gt;
netops@J1&gt; exit</pre>
<p>The highlighted line is the answer to the lab question: netmiko itself told Junos to stop paging. The same file for the IOS router shows <code>terminal width 511</code> and <code>terminal length 0</code>, and the EOS file shows the two replies <code>Width set to 511 characters</code> and <code>Pagination disabled.</code>.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab terminals never stop at a <code>--More--</code> prompt, so you cannot reproduce that failure here. On a real device a raw SSH channel stops after one screen of output until a key is pressed; netmiko's preparation exists to prevent it. The lab's FortiOS and PAN-OS simulators also answer <code>Unknown command</code> or a parse error to some of the preparation lines (you can see them in their session logs); real devices accept them and the scripts are unchanged.</p></div>

<h3>Prompts and base_prompt</h3>
<p>netmiko learns the prompt once and then waits for it after every command. That is how <code>send_command</code> knows the output has ended.</p>
<pre class="out">AUTO01$ python3 ch3.py
cisco_ios       prompt='PUN-CORE-R1#'   base_prompt='PUN-CORE-R1'
cisco_nxos      prompt='N1#'            base_prompt='N1'
arista_eos      prompt='E1#'            base_prompt='E1'
<span class="hl">juniper_junos   prompt='netops@J1&gt;'     base_prompt='netops@J1'</span>
cisco_asa       prompt='ASA1#'          base_prompt='ASA1'
fortinet        prompt='FGT1 #'         base_prompt='FGT1 '
paloalto_panos  prompt='admin@PA1&gt;'     base_prompt='admin@PA1'</pre>
<p>Junos and PAN-OS put the user name in the prompt, FortiOS keeps a trailing space, and the last character (<code>#</code>, <code>&gt;</code>) tells you the mode. Never rename a device inside a script that is already connected: netmiko keeps the old <code>base_prompt</code> and would wait for a prompt that no longer exists.</p>

<h3>Enable mode on the vendors that have it</h3>
<pre class="code">e = ConnectHandler(device_type="arista_eos", host="10.99.0.21", username="netops",
                   password="NK@2026", secret="NK@2026")
print(e.find_prompt(), e.check_enable_mode())
e.exit_enable_mode()                  <span class="c"># drop to user mode</span>
print(e.find_prompt(), e.check_enable_mode())
e.enable()                            <span class="c"># uses the secret</span>
print(e.find_prompt(), e.check_enable_mode())</pre>
<pre class="out">E1# True
<span class="hl">E1&gt; False</span>
E1# True</pre>
<p>On Junos, FortiOS and PAN-OS <code>enable()</code> does nothing and <code>check_enable_mode()</code> reports <code>True</code>, so one inventory loop can call <code>enable()</code> safely on every platform.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving out <code>secret</code> on IOS or ASA and wondering why config commands are refused. Hard-coding <code>#</code> as the prompt on Junos (it is <code>&gt;</code> until you enter config mode). Calling a device-specific paging command yourself after netmiko already did it. Writing your own SSH loop with a raw channel and forgetting that paging exists.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos has two prompts: <code>user@host&gt;</code> for operational mode and <code>user@host#</code> for configuration mode. Mixing them up with an <code>expect_string</code> is the classic ReadTimeout (chapter 4).</p></div>

<div class="scn"><h4>The config that stopped at line 24</h4><p>An engineer wrote a quick backup with a bare SSH channel. Every router's backup ended after exactly one screen, with the words <code>--More--</code> as the last line of the file, and nobody read the files for weeks. The fix was one line, <code>terminal length 0</code>, which netmiko sends for you.</p><p><b>Lesson:</b> a short or truncated backup is a bug; check that session preparation ran and keep the session log while you test.</p></div>

<div class="iv"><p class="q">"What does netmiko do between connecting and running my first command?"</p><p>It finds and stores the prompt, disables paging and sets a wide terminal using the platform's own commands, and enters enable mode where the platform has one. After that, <code>send_command</code> sends the command and reads until the stored prompt returns. I verify it with <code>session_log</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ConnectHandler prepares the session: prompt, paging off, width, enable.</li>
<li>The commands differ: <code>terminal length 0</code> versus <code>set cli screen-length 0</code> versus <code>set cli pager off</code>.</li>
<li><code>find_prompt()</code> and <code>base_prompt</code> show what netmiko waits for; the last character tells the mode.</li>
<li><code>enable()</code> is safe on every platform; it is a no-op on Junos, FortiOS and PAN-OS.</li>
<li><code>session_log</code> is the fastest way to see what really happened.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> aapki pehli command chalne se pehle netmiko aapke liye ek chhoti checklist poori kar chuka hota hai. Usne prompt dhoondha, paging band ki, line chauri ki aur zaroorat par privileged mode mein gaya. Yeh checklist har vendor ke liye alag hai, aur ise jaanna zyadatar ajeeb pehle-connection errors samjha deta hai.</p>

<h3>Analogy: hotel mein check-in</h3>
<p>Har hotel mein front desk hota hai, par routine alag: koi passport maangta hai, koi booking number, teesra key card aur map pakda deta hai. <b>Session preparation</b> check-in hai. Aapki script kamre mein "rehna" (show commands chalana) tabhi shuru karti hai jab yeh ho chuka ho.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Connection steps before the first command">
<rect x="5" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="60" y="52" text-anchor="middle" class="svg-ink" font-size="12">SSH login</text><text x="60" y="68" text-anchor="middle" class="svg-muted" font-size="10">user + password</text>
<rect x="135" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="12">prompt dhoondho</text><text x="190" y="68" text-anchor="middle" class="svg-muted" font-size="10">base_prompt</text>
<rect x="265" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">paging band</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="10">+ line width</text>
<rect x="395" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="12">enable</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="10">jahan box mein ho</text>
<rect x="525" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="12">aapki commands</text><text x="580" y="68" text-anchor="middle" class="svg-muted" font-size="10">send_command</text>
<line x1="115" y1="55" x2="135" y2="55" stroke="#64748b" stroke-width="2"/><line x1="245" y1="55" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><line x1="375" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="525" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle chaar boxes ConnectHandler() ke andar hote hain. Sirf aakhri box aapka code hai.</p></div>

<h3>netmiko platform ke hisaab se kya bhejta hai</h3>
<table class="cmp"><tr><th>device_type</th><th>Prompt</th><th>Paging aur width commands</th><th>Enable</th></tr>
<tr><td><code>cisco_ios</code></td><td><code>PUN-CORE-R1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>haan, <code>secret</code> use karta hai</td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>N1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>role tay karta hai; network-admin seedha <code>#</code> mein</td></tr>
<tr><td><code>arista_eos</code></td><td><code>E1#</code></td><td><code>terminal width 511</code>, <code>terminal length 0</code></td><td>haan, <code>secret</code> use karta hai</td></tr>
<tr><td><code>juniper_junos</code></td><td><code>netops@J1&gt;</code></td><td><code>set cli screen-width 511</code>, <code>set cli complete-on-space off</code>, <code>set cli screen-length 0</code></td><td>nahi (no-op)</td></tr>
<tr><td><code>cisco_asa</code></td><td><code>ASA1#</code></td><td><code>terminal pager 0</code>, <code>terminal width 511</code></td><td>haan, login ke baad <code>enable</code> chalata hai</td></tr>
<tr><td><code>fortinet</code></td><td><code>FGT1 #</code></td><td>console output ko "standard" (bina paging) par karta hai</td><td>nahi</td></tr>
<tr><td><code>paloalto_panos</code></td><td><code>admin@PA1&gt;</code></td><td><code>set cli scripting-mode on</code>, <code>set cli terminal width 500</code>, <code>set cli pager off</code></td><td>nahi</td></tr></table>

<h3>Apni aankhon se dekho: session_log</h3>
<p><code>session_log</code> argument netmiko ne jo bheja aur paaya sab ek file mein likhta hai. Lab 1 task 3 kehta hai J1 ka woh log padho jo <code>probe.py</code> pehle hi bana chuki hai:</p>
<pre class="out">AUTO01$ cat logs/J1.log
--- NK-OS 2.0-nk built 2026-09-01 by Network Kings
netops@J1&gt;
netops@J1&gt;
netops@J1&gt; set cli screen-width 511
Screen width set to 511
netops@J1&gt; set cli complete-on-space off
Disabling complete-on-space
<span class="hl">netops@J1&gt; set cli screen-length 0</span>
Screen length set to 0
netops@J1&gt;
netops@J1&gt;
netops@J1&gt;
netops@J1&gt; exit</pre>
<p>Highlight wali line lab ke sawaal ka jawab hai: netmiko ne khud Junos ko paging band karne ko kaha. IOS router ki wahi file mein <code>terminal width 511</code> aur <code>terminal length 0</code> dikhte hain, aur EOS file mein do jawab <code>Width set to 511 characters</code> aur <code>Pagination disabled.</code>.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab terminals kabhi <code>--More--</code> prompt par nahi rukte, isliye yeh failure yahan reproduce nahi hota. Asli device par raw SSH channel ek screen ke output ke baad tab tak ruk jaata hai jab tak key na dabe; netmiko ki preparation isi ko rokne ke liye hai. Lab ke FortiOS aur PAN-OS simulators preparation ki kuch lines par <code>Unknown command</code> ya parse error dete hain (unke session logs mein dikhta hai); asli devices unhe accept karte hain aur scripts wahi rehti hain.</p></div>

<h3>Prompts aur base_prompt</h3>
<p>netmiko prompt ek baar seekhta hai aur har command ke baad usi ka intezaar karta hai. Isi se <code>send_command</code> ko pata chalta hai ki output khatam hua.</p>
<pre class="out">AUTO01$ python3 ch3.py
cisco_ios       prompt='PUN-CORE-R1#'   base_prompt='PUN-CORE-R1'
cisco_nxos      prompt='N1#'            base_prompt='N1'
arista_eos      prompt='E1#'            base_prompt='E1'
<span class="hl">juniper_junos   prompt='netops@J1&gt;'     base_prompt='netops@J1'</span>
cisco_asa       prompt='ASA1#'          base_prompt='ASA1'
fortinet        prompt='FGT1 #'         base_prompt='FGT1 '
paloalto_panos  prompt='admin@PA1&gt;'     base_prompt='admin@PA1'</pre>
<p>Junos aur PAN-OS prompt mein user naam rakhte hain, FortiOS aakhir mein space rakhta hai, aur aakhri character (<code>#</code>, <code>&gt;</code>) mode batata hai. Jo script pehle se connected hai usme device ka naam kabhi mat badlo: netmiko purana <code>base_prompt</code> rakhta hai aur aise prompt ka intezaar karega jo ab hai hi nahi.</p>

<h3>Jin vendors mein enable hai unme enable mode</h3>
<pre class="code">e = ConnectHandler(device_type="arista_eos", host="10.99.0.21", username="netops",
                   password="NK@2026", secret="NK@2026")
print(e.find_prompt(), e.check_enable_mode())
e.exit_enable_mode()                  <span class="c"># user mode mein jao</span>
print(e.find_prompt(), e.check_enable_mode())
e.enable()                            <span class="c"># secret use karta hai</span>
print(e.find_prompt(), e.check_enable_mode())</pre>
<pre class="out">E1# True
<span class="hl">E1&gt; False</span>
E1# True</pre>
<p>Junos, FortiOS aur PAN-OS par <code>enable()</code> kuch nahi karta aur <code>check_enable_mode()</code> <code>True</code> batata hai, isliye ek inventory loop har platform par <code>enable()</code> safely bula sakta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> IOS ya ASA par <code>secret</code> chhod dena aur sochna ki config commands refuse kyun ho rahi hain. Junos par prompt ke roop mein <code>#</code> hard-code karna (config mode mein jaane tak woh <code>&gt;</code> hota hai). Netmiko ke kar dene ke baad khud device-specific paging command bhejna. Raw channel se apna SSH loop likhna aur bhool jaana ki paging hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos ke do prompts hain: operational mode ke liye <code>user@host&gt;</code> aur configuration mode ke liye <code>user@host#</code>. Inhe <code>expect_string</code> mein ulta-seedha karna classic ReadTimeout hai (chapter 4).</p></div>

<div class="scn"><h4>Config jo line 24 par ruk gayi</h4><p>Ek engineer ne bare SSH channel se quick backup likha. Har router ka backup theek ek screen ke baad khatam hota tha, aur file ki aakhri line <code>--More--</code> thi, aur hafton tak kisi ne files padhi nahi. Fix ek line thi, <code>terminal length 0</code>, jo netmiko aapke liye bhejta hai.</p><p><b>Lesson:</b> chhota ya kata hua backup bug hai; check karo ki session preparation chali, aur test ke dauran session log rakho.</p></div>

<div class="iv"><p class="q">"Connect karne aur meri pehli command chalane ke beech netmiko kya karta hai?"</p><p>Woh prompt dhoondhkar store karta hai, platform ki apni commands se paging band karta hai aur terminal chauda karta hai, aur jahan platform mein enable hai wahan enable mode mein jaata hai. Uske baad <code>send_command</code> command bhejta hai aur stored prompt wapas aane tak padhta hai. Main <code>session_log</code> se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ConnectHandler session taiyaar karta hai: prompt, paging off, width, enable.</li>
<li>Commands alag hain: <code>terminal length 0</code> versus <code>set cli screen-length 0</code> versus <code>set cli pager off</code>.</li>
<li><code>find_prompt()</code> aur <code>base_prompt</code> dikhate hain netmiko kis ka intezaar karta hai; aakhri character mode batata hai.</li>
<li><code>enable()</code> har platform par safe hai; Junos, FortiOS, PAN-OS par no-op hai.</li>
<li><code>session_log</code> dekhne ka sabse tez tareeka hai ki asal mein kya hua.</li>
</ul></div>
`}};export{e as default};