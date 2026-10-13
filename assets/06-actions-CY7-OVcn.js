var e={id:`actions`,h:{en:`Actions: cli, syslog, mail, puts, wait, info and reload`,hi:`Actions: cli, syslog, mail, puts, wait, info aur reload`},body:{en:`
<p>When you hire a temporary worker, you give them a badge that opens only the front door. To reach the server room they must first go to security and get a higher-level badge, then walk through each door in order. If you forget to tell them about security, they stand in the lobby with a checklist they cannot complete. EEM's CLI action is that temporary worker: it starts with the lowest access and must climb through the modes step by step.</p>

<h3>action cli command</h3>
<p>When an applet uses <code>cli command</code>, EEM opens a private, hidden terminal session on the router. That session starts in <b>user EXEC</b> mode, exactly like a fresh login at the <code>&gt;</code> prompt. Each following <code>cli</code> action in the same run continues in the same session, so the mode is remembered from line to line.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CLI session modes">
<rect x="10" y="60" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">user EXEC</text><text x="65" y="97" text-anchor="middle" class="svg-muted" font-size="12">&gt;</text>
<rect x="170" y="60" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="80" text-anchor="middle" class="svg-ink" font-size="13">priv EXEC</text><text x="225" y="97" text-anchor="middle" class="svg-muted" font-size="12">#</text>
<rect x="330" y="60" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="395" y="80" text-anchor="middle" class="svg-ink" font-size="13">global config</text><text x="395" y="97" text-anchor="middle" class="svg-muted" font-size="12">(config)#</text>
<rect x="510" y="60" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="13">interface</text><text x="570" y="97" text-anchor="middle" class="svg-muted" font-size="12">(config-if)#</text>
<line x1="120" y1="83" x2="170" y2="83" stroke="#64748b" stroke-width="2"/><text x="145" y="50" text-anchor="middle" class="svg-accent" font-size="12">2.0 enable</text>
<line x1="280" y1="83" x2="330" y2="83" stroke="#64748b" stroke-width="2"/><text x="305" y="130" text-anchor="middle" class="svg-accent" font-size="12">3.0 conf t</text>
<line x1="460" y1="83" x2="510" y2="83" stroke="#64748b" stroke-width="2"/><text x="485" y="50" text-anchor="middle" class="svg-accent" font-size="12">4.0 interface</text>
<text x="570" y="140" text-anchor="middle" class="svg-muted" font-size="12">5.0 no shut, 6.0 end</text>
</svg><p class="cap">The hidden EEM session climbs the modes one action at a time, just as a person would.</p></div>

<p>Here is the complete lab applet:</p>
<pre class="code">event manager applet UPLINK-DOWN
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 action 2.0 cli command "enable"
 action 3.0 cli command "configure terminal"
 action 4.0 cli command "interface GigabitEthernet0/1"
 action 5.0 cli command "no shutdown"
 action 6.0 cli command "end"</pre>
<p>After every <code>cli</code> action, the output of that command is stored in the built-in variable <b>_cli_result</b>, so a later action can log it, mail it or test it.</p>

<h4>Commands that ask questions</h4>
<p>Some commands prompt, for example <code>copy running-config flash:nightly.cfg</code> asks "Destination filename [nightly.cfg]?". The session would wait for the normal prompt forever. Two solutions: tell EEM which prompt to expect with <code>pattern</code> and answer it in the next action, or silence file prompts globally with <code>file prompt quiet</code>.</p>
<pre class="code"> action 7.0 cli command "copy running-config flash:nightly.cfg" pattern "nightly.cfg"
 action 7.1 cli command ""
<span class="c">! the empty command sends Enter to accept the default filename</span></pre>

<h3>action syslog</h3>
<pre class="code">action 1.0 syslog [priority LEVEL] msg "TEXT" [facility NAME]</pre>
<p>The default priority is informational (6). The digit in the message follows the level: emergencies 0, alerts 1, critical 2, errors 3, warnings 4, notifications 5, informational 6, debugging 7. So the lab's critical message appears as <code>%HA_EM-2-LOG</code>, which a NOC can alert on.</p>

<div class="eg"><p><b>Worked example.</b> The lab run on BRANCH, in time order:</p>
<pre class="out">*Sep 30 02:14:06.221: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down
<span class="hl">*Sep 30 02:14:06.305: %HA_EM-2-LOG: UPLINK-DOWN: Primary circuit down - enabling backup Gi0/1</span>
*Sep 30 02:14:06.690: %SYS-5-CONFIG_I: Configured from console by  on vty0 (EEM:UPLINK-DOWN)
*Sep 30 02:14:08.412: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
<span class="hl">*Sep 30 02:14:09.412: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</span></pre>
<p>About 3 seconds from failure to backup up. Because Gi0/0 is down, the primary default route disappears and the floating static route via 10.0.2.1 (distance 20) is installed; PC1 reaches 203.0.113.10 again. Notice the <code>(EEM:UPLINK-DOWN)</code> tag: configuration made by an applet is logged with the applet's name.</p></div>

<h3>Other everyday actions</h3>
<dl class="terms">
<dt>mail</dt><dd><code>action 8.0 mail server "192.0.2.25" to "noc@branch.example" from "kochi@branch.example" subject "WAN failover" body "$_cli_result"</code>. The router must reach the SMTP server, often over the path that just failed, so treat mail as best effort and keep a syslog action too.</dd>
<dt>puts</dt><dd>Prints text to the terminal that started the policy, useful with <code>event manager run</code> and synchronous CLI applets.</dd>
<dt>wait</dt><dd><code>action 5.5 wait 10</code> pauses for 10 seconds, for example to let an interface come up before you test it.</dd>
<dt>info type</dt><dd>Fetches system information into a variable, for example <code>action 1.0 info type routername</code> fills _info_routername, handy in mail subjects.</dd>
<dt>reload</dt><dd><code>action 9.0 reload</code> restarts the router. It is almost never the right answer: an applet that reloads on a condition that survives the reload creates a reboot loop.</dd>
</dl>

<div class="warn"><p><b>Common mistake.</b> Starting with <code>configure terminal</code> and no <code>enable</code>. The session is still in user EXEC, the command fails with "Invalid input", and every following config line fails too. Nothing is logged unless you check <code>debug event manager action cli</code> or the _cli_result variable.</p></div>

<div class="exam"><p><b>Exam trap.</b> The syslog action default is severity 6, not 5. <code>priority critical</code> gives <code>%HA_EM-2-LOG</code>. And an applet does not save its changes: if you need them to survive a reload, add <code>write memory</code>, but think twice before an automatic change becomes permanent.</p></div>

<div class="scn"><h4>The backup that stayed shut</h4><p>A bank in Kolkata copied an EEM applet from a blog post. It started with <code>action 1.0 cli command "conf t"</code>. In the lab it seemed fine because the engineer ran the applet while logged in and assumed success from the syslog line. During a real outage the syslog message appeared, but the backup never came up. <code>debug event manager action cli</code> showed the session prompt as <code>BRANCH&gt;</code> and the error "% Invalid input detected". Adding <code>enable</code> as the first CLI action fixed it.</p><p><b>Lesson:</b> a syslog action only proves the applet ran, not that its CLI actions worked.</p></div>

<div class="iv"><p class="q">"Why does almost every EEM applet start its CLI actions with enable?"</p><p>Strong answer: the <code>cli command</code> action opens a hidden terminal session that starts in user EXEC, like a new login. Configuration and most show commands need privileged EXEC, so the first action is <code>enable</code>, then <code>configure terminal</code>, then the commands, then <code>end</code>. Mention that each command's output is stored in _cli_result and that prompting commands need the <code>pattern</code> keyword or <code>file prompt quiet</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI actions share one hidden session per run that starts in user EXEC: enable, configure terminal, commands, end.</li>
<li>Each CLI action's output lands in _cli_result.</li>
<li>Use <code>pattern</code> (or <code>file prompt quiet</code>) for commands that ask questions.</li>
<li>syslog default priority is informational (6); critical shows as <code>%HA_EM-2-LOG</code>.</li>
<li>mail is best effort, wait pauses, info fetches system data, reload is dangerous.</li>
</ul></div>
`,hi:`
<p>Jab aap temporary worker rakhte ho, to use aisa badge dete ho jo sirf front door kholta hai. Server room tak pahunchne ke liye use pehle security ke paas jaakar higher-level badge lena padta hai, phir har darwaze se order mein guzarna padta hai. Agar aap use security ke baare mein batana bhool gaye, to woh lobby mein ek aisi checklist ke saath khada rahega jo poori nahi ho sakti. EEM ka CLI action wahi temporary worker hai: yeh sabse kam access se shuru hota hai aur use modes mein step by step chadhna padta hai.</p>

<h3>action cli command</h3>
<p>Jab applet <code>cli command</code> use karta hai, EEM router par ek private, chhupa hua terminal session kholta hai. Woh session <b>user EXEC</b> mode mein shuru hota hai, bilkul <code>&gt;</code> prompt par naye login jaisa. Usi run ke agle <code>cli</code> actions usi session mein chalte hain, isliye mode line se line yaad rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CLI session modes">
<rect x="10" y="60" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">user EXEC</text><text x="65" y="97" text-anchor="middle" class="svg-muted" font-size="12">&gt;</text>
<rect x="170" y="60" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="80" text-anchor="middle" class="svg-ink" font-size="13">priv EXEC</text><text x="225" y="97" text-anchor="middle" class="svg-muted" font-size="12">#</text>
<rect x="330" y="60" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="395" y="80" text-anchor="middle" class="svg-ink" font-size="13">global config</text><text x="395" y="97" text-anchor="middle" class="svg-muted" font-size="12">(config)#</text>
<rect x="510" y="60" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="13">interface</text><text x="570" y="97" text-anchor="middle" class="svg-muted" font-size="12">(config-if)#</text>
<line x1="120" y1="83" x2="170" y2="83" stroke="#64748b" stroke-width="2"/><text x="145" y="50" text-anchor="middle" class="svg-accent" font-size="12">2.0 enable</text>
<line x1="280" y1="83" x2="330" y2="83" stroke="#64748b" stroke-width="2"/><text x="305" y="130" text-anchor="middle" class="svg-accent" font-size="12">3.0 conf t</text>
<line x1="460" y1="83" x2="510" y2="83" stroke="#64748b" stroke-width="2"/><text x="485" y="50" text-anchor="middle" class="svg-accent" font-size="12">4.0 interface</text>
<text x="570" y="140" text-anchor="middle" class="svg-muted" font-size="12">5.0 no shut, 6.0 end</text>
</svg><p class="cap">Chhupa EEM session ek ek action karke modes chadhta hai, bilkul ek insaan ki tarah.</p></div>

<p>Yeh raha poora lab applet:</p>
<pre class="code">event manager applet UPLINK-DOWN
 event syslog pattern "LINEPROTO-5-UPDOWN.*GigabitEthernet0/0, changed state to down"
 action 1.0 syslog priority critical msg "Primary circuit down - enabling backup Gi0/1"
 action 2.0 cli command "enable"
 action 3.0 cli command "configure terminal"
 action 4.0 cli command "interface GigabitEthernet0/1"
 action 5.0 cli command "no shutdown"
 action 6.0 cli command "end"</pre>
<p>Har <code>cli</code> action ke baad us command ka output built-in variable <b>_cli_result</b> mein store hota hai, taaki baad ka action use log, mail ya test kar sake.</p>

<h4>Sawaal poochhne wale commands</h4>
<p>Kuch commands prompt karte hain, jaise <code>copy running-config flash:nightly.cfg</code> poochhta hai "Destination filename [nightly.cfg]?". Session normal prompt ka hamesha intezaar karta rahega. Do solutions: <code>pattern</code> se EEM ko batao ki kaunsa prompt expect karna hai aur agle action mein jawab do, ya <code>file prompt quiet</code> se file prompts globally band karo.</p>
<pre class="code"> action 7.0 cli command "copy running-config flash:nightly.cfg" pattern "nightly.cfg"
 action 7.1 cli command ""
<span class="c">! khaali command default filename accept karne ke liye Enter bhejta hai</span></pre>

<h3>action syslog</h3>
<pre class="code">action 1.0 syslog [priority LEVEL] msg "TEXT" [facility NAME]</pre>
<p>Default priority informational (6) hai. Message ka digit level follow karta hai: emergencies 0, alerts 1, critical 2, errors 3, warnings 4, notifications 5, informational 6, debugging 7. Isliye lab ka critical message <code>%HA_EM-2-LOG</code> ki tarah dikhta hai, jis par NOC alert laga sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> BRANCH par lab run, time order mein:</p>
<pre class="out">*Sep 30 02:14:06.221: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to down
<span class="hl">*Sep 30 02:14:06.305: %HA_EM-2-LOG: UPLINK-DOWN: Primary circuit down - enabling backup Gi0/1</span>
*Sep 30 02:14:06.690: %SYS-5-CONFIG_I: Configured from console by  on vty0 (EEM:UPLINK-DOWN)
*Sep 30 02:14:08.412: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
<span class="hl">*Sep 30 02:14:09.412: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</span></pre>
<p>Failure se backup up hone tak lagbhag 3 second. Gi0/0 down hai, isliye primary default route gayab hota hai aur 10.0.2.1 via floating static route (distance 20) install hota hai; PC1 phir se 203.0.113.10 tak pahunchta hai. <code>(EEM:UPLINK-DOWN)</code> tag dekho: applet ki banayi configuration applet ke naam ke saath log hoti hai.</p></div>

<h3>Roz ke doosre actions</h3>
<dl class="terms">
<dt>mail</dt><dd><code>action 8.0 mail server "192.0.2.25" to "noc@branch.example" from "kochi@branch.example" subject "WAN failover" body "$_cli_result"</code>. Router ko SMTP server tak pahunchna padta hai, aksar usi path se jo abhi fail hua, isliye mail ko best effort maano aur saath mein syslog action bhi rakho.</dd>
<dt>puts</dt><dd>Policy start karne wale terminal par text print karta hai, <code>event manager run</code> aur synchronous CLI applets ke saath useful.</dd>
<dt>wait</dt><dd><code>action 5.5 wait 10</code> 10 second rukta hai, jaise test karne se pehle interface ko up hone dena.</dd>
<dt>info type</dt><dd>System information variable mein laata hai, jaise <code>action 1.0 info type routername</code> _info_routername bharta hai, mail subjects mein kaam ka.</dd>
<dt>reload</dt><dd><code>action 9.0 reload</code> router restart karta hai. Yeh lagbhag kabhi sahi jawab nahi hota: jo applet aisi condition par reload kare jo reload ke baad bhi rahe, woh reboot loop banata hai.</dd>
</dl>

<div class="warn"><p><b>Common galti.</b> Bina <code>enable</code> ke <code>configure terminal</code> se shuru karna. Session abhi bhi user EXEC mein hai, command "Invalid input" ke saath fail hota hai, aur uske baad ki har config line bhi fail hoti hai. Jab tak aap <code>debug event manager action cli</code> ya _cli_result variable check na karo, kuch log nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Syslog action ka default severity 6 hai, 5 nahi. <code>priority critical</code> se <code>%HA_EM-2-LOG</code> milta hai. Aur applet apne changes save nahi karta: agar unhe reload ke baad bhi chahiye to <code>write memory</code> jodo, par automatic change ko permanent banane se pehle do baar socho.</p></div>

<div class="scn"><h4>Woh backup jo shut hi raha</h4><p>Kolkata ke ek bank ne blog post se EEM applet copy kiya. Woh <code>action 1.0 cli command "conf t"</code> se shuru hota tha. Lab mein theek laga kyunki engineer ne logged in rehte hue applet chalaya aur syslog line se success maan liya. Asli outage mein syslog message aaya, par backup kabhi up nahi hua. <code>debug event manager action cli</code> ne session prompt <code>BRANCH&gt;</code> aur error "% Invalid input detected" dikhaya. Pehle CLI action ki tarah <code>enable</code> jodne se theek ho gaya.</p><p><b>Seekh:</b> syslog action sirf yeh saabit karta hai ki applet chala, yeh nahi ki uske CLI actions kaam kiye.</p></div>

<div class="iv"><p class="q">"Lagbhag har EEM applet apne CLI actions enable se kyun shuru karta hai?"</p><p>Strong answer: <code>cli command</code> action ek chhupa terminal session kholta hai jo naye login ki tarah user EXEC mein shuru hota hai. Configuration aur zyada tar show commands ko privileged EXEC chahiye, isliye pehla action <code>enable</code>, phir <code>configure terminal</code>, phir commands, phir <code>end</code>. Yeh bhi bolo ki har command ka output _cli_result mein store hota hai aur prompt karne wale commands ko <code>pattern</code> keyword ya <code>file prompt quiet</code> chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI actions har run mein ek chhupa session share karte hain jo user EXEC mein shuru hota hai: enable, configure terminal, commands, end.</li>
<li>Har CLI action ka output _cli_result mein aata hai.</li>
<li>Sawaal poochhne wale commands ke liye <code>pattern</code> (ya <code>file prompt quiet</code>) use karo.</li>
<li>Syslog ki default priority informational (6) hai; critical <code>%HA_EM-2-LOG</code> ki tarah dikhta hai.</li>
<li>mail best effort hai, wait rukta hai, info system data laata hai, reload khatarnak hai.</li>
</ul></div>
`}};export{e as default};