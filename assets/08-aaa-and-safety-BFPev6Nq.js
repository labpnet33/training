var e={id:`aaa-and-safety`,h:{en:`AAA, authorization bypass and safe applets (maxrun, ratelimit)`,hi:`AAA, authorization bypass aur safe applets (maxrun, ratelimit)`},body:{en:`
<p>A building's night guard follows the instruction card, but the building also has a security desk that checks every badge at every door. If the card says "open the server room" and the guard's badge is not on the list, the door stays shut no matter what the card says. And a wise manager also writes on the card: "do this at most once per night, and if it takes longer than ten minutes, stop and call me". This chapter is about both: getting EEM through AAA, and keeping it from hurting the box.</p>

<h3>Why EEM CLI actions fail under AAA</h3>
<p>Many enterprises send every command to a TACACS+ server for <b>command authorization</b> (the device security module covers AAA in depth):</p>
<pre class="code">aaa new-model
aaa authorization commands 15 default group tacacs+ local</pre>
<p>The hidden EEM CLI session also runs through this check. By default it has <b>no username</b>, so the TACACS+ server has nobody to authorize, and every command is refused. The applet still runs, the syslog action still appears, but the CLI actions quietly fail.</p>
<pre class="out">BRANCH# debug event manager action cli
*Sep 30 02:14:06.402: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : BRANCH&gt;
*Sep 30 02:14:06.402: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : IN  : BRANCH&gt;enable
*Sep 30 02:14:06.515: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : BRANCH#
*Sep 30 02:14:06.515: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : IN  : BRANCH#configure terminal
<span class="hl">*Sep 30 02:14:06.630: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : Command authorization failed.</span></pre>

<h3>Two fixes</h3>
<table class="cmp"><tr><th></th><th>Session username</th><th>Authorization bypass</th></tr>
<tr><td>Command</td><td><code>event manager session cli username EEM-SVC</code> (global)</td><td><code>event manager applet NAME authorization bypass</code> (per applet)</td></tr>
<tr><td>How it works</td><td>EEM sessions log in as EEM-SVC; TACACS+ authorizes that account</td><td>AAA command authorization is skipped for this applet's CLI actions</td></tr>
<tr><td>Audit trail</td><td>Commands appear in TACACS+ accounting under EEM-SVC</td><td>Only local logs</td></tr>
<tr><td>Central control</td><td>Yes: the security team decides what EEM-SVC may run</td><td>No: the applet can run anything</td></tr></table>
<pre class="code">BRANCH(config)# event manager session cli username EEM-SVC
<span class="c">! or, for one applet only:</span>
BRANCH(config)# event manager applet UPLINK-DOWN authorization bypass</pre>
<p>Most security teams prefer the session username, with a TACACS+ profile that allows only the commands the applets need. Bypass is simpler for a lab or a box without central AAA policy.</p>

<h3>EEM is privileged code: protect it</h3>
<p>An applet can run any command, at any time, without anybody logged in. That is the power of EEM and also its risk. Treat applets like code: keep them in the golden configuration, review changes, and make your configuration-compliance tool flag any unexpected <code>event manager applet</code>. An unknown applet that, for example, re-creates a local user every hour is a persistence mechanism an attacker would love.</p>

<h3>Guard rails: maxrun, ratelimit and friends</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Guard rails">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">event fires</text>
<rect x="160" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="225" y="82" text-anchor="middle" class="svg-ink" font-size="13">ratelimit gate</text><text x="225" y="100" text-anchor="middle" class="svg-muted" font-size="12">once per N s</text>
<rect x="330" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="82" text-anchor="middle" class="svg-ink" font-size="13">actions run</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">maxrun timer</text>
<rect x="500" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="13">history</text><text x="565" y="100" text-anchor="middle" class="svg-muted" font-size="12">success/abort</text>
<line x1="120" y1="85" x2="160" y2="85" stroke="#64748b" stroke-width="2"/><line x1="290" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="460" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">extra triggers inside the ratelimit window are ignored</text>
</svg><p class="cap">Two built-in guard rails: a rate limit before the run and a run-time limit during it.</p></div>
<dl class="terms">
<dt>maxrun</dt><dd>The maximum run time of the policy, set on the event line: <code>event syslog pattern "…" maxrun 60</code>. The default for applets is <b>20 seconds</b>; when it expires the applet is aborted, even halfway through its actions.</dd>
<dt>ratelimit</dt><dd>After a run, further triggers are ignored for N seconds: <code>event syslog pattern "…" ratelimit 300</code>. Perfect for a flapping interface that would otherwise launch dozens of runs.</dd>
<dt>occurs / period</dt><dd>Only fire after N matches in a time window (chapter 3).</dd>
<dt>history size</dt><dd><code>event manager history size events 50</code> keeps more runs for troubleshooting.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A data-collection applet runs <code>wait 10</code>, then five show commands of about 2 seconds each, then a mail action that takes about 5 seconds. Total ≈ 10 + 10 + 5 = <b>25 seconds</b>, above the 20-second default, so the mail never leaves. Set <code>maxrun 60</code> to give a comfortable margin. If the same trigger can repeat every few seconds, add <code>ratelimit 120</code> so only one collection runs every two minutes.</p></div>

<h3>The reload action and other sharp tools</h3>
<p>Never let an applet reload a router on a condition that can still be true after the reload: the router boots, the condition is seen again, and the box reloads forever. If you truly need an automatic reload, gate it with a strict condition, a counter stored in a file or an environment variable, a ratelimit, and a syslog action that runs first so the evidence survives.</p>

<div class="warn"><p><b>Common mistake.</b> Testing an applet as an admin on a lab router without AAA, then deploying to production where TACACS+ command authorization is on. The syslog action works, so the change looks successful, but nothing configures. Always test with the same AAA policy as production.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>authorization bypass</code> is a keyword on the <code>event manager applet</code> line, not an action. <code>maxrun</code> and <code>ratelimit</code> are options on the <code>event</code> line. The default maxrun for an applet is 20 seconds.</p></div>

<div class="scn"><h4>TACACS+ rollout broke every applet</h4><p>A manufacturing company enabled TACACS+ command authorization on 300 routers in one weekend. On Monday, a plant lost its primary WAN link, and the EEM applet that should have enabled the backup logged its critical message but did nothing. <code>debug event manager action cli</code> on a lab router with the same configuration showed "Command authorization failed". The security team created an EEM-SVC account on TACACS+ allowed only for <code>interface</code>, <code>shutdown</code>, <code>no shutdown</code> and a few show commands, and <code>event manager session cli username EEM-SVC</code> was pushed to all routers.</p><p><b>Lesson:</b> when AAA changes, EEM is a user too. Plan an identity for it.</p></div>

<div class="iv"><p class="q">"An EEM applet works in the lab but its CLI actions fail in production where TACACS+ command authorization is on. Why, and how do you fix it?"</p><p>Strong answer: EEM's CLI session has no username by default, so command authorization rejects every command. Fix it globally with <code>event manager session cli username EEM-SVC</code> and a restricted TACACS+ profile, which also gives accounting, or per applet with <code>authorization bypass</code> on the applet line. I would verify with <code>debug event manager action cli</code>. Bonus: mention maxrun (default 20 seconds) and ratelimit as safety settings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EEM CLI sessions pass through AAA command authorization and have no username by default.</li>
<li>Fix: <code>event manager session cli username NAME</code> (auditable) or <code>event manager applet NAME authorization bypass</code>.</li>
<li>Applets run privileged commands unattended: review and control them like code.</li>
<li><code>maxrun</code> (default 20 s) aborts long runs; <code>ratelimit N</code> ignores triggers for N seconds after a run.</li>
<li>Avoid <code>reload</code> actions unless strictly gated; reboot loops are real.</li>
</ul></div>
`,hi:`
<p>Building ka night guard instruction card follow karta hai, par building mein security desk bhi hai jo har darwaze par har badge check karta hai. Agar card kehta hai "server room kholo" aur guard ka badge list mein nahi hai, to card kuch bhi kahe, darwaza band rehta hai. Aur samajhdaar manager card par yeh bhi likhta hai: "yeh raat mein zyada se zyada ek baar karo, aur agar das minute se zyada lage to ruk kar mujhe call karo". Yeh chapter dono ke baare mein hai: EEM ko AAA se guzarna, aur use box ko nuksaan pahunchane se rokna.</p>

<h3>AAA ke neeche EEM CLI actions kyun fail hote hain</h3>
<p>Kai enterprises har command ko <b>command authorization</b> ke liye TACACS+ server par bhejti hain (device security module AAA ko detail mein cover karta hai):</p>
<pre class="code">aaa new-model
aaa authorization commands 15 default group tacacs+ local</pre>
<p>Chhupa EEM CLI session bhi is check se guzarta hai. Default mein iska <b>koi username nahi</b> hota, isliye TACACS+ server ke paas authorize karne ke liye koi nahi hota, aur har command refuse hota hai. Applet phir bhi chalta hai, syslog action phir bhi dikhta hai, par CLI actions chupchaap fail hote hain.</p>
<pre class="out">BRANCH# debug event manager action cli
*Sep 30 02:14:06.402: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : BRANCH&gt;
*Sep 30 02:14:06.402: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : IN  : BRANCH&gt;enable
*Sep 30 02:14:06.515: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : BRANCH#
*Sep 30 02:14:06.515: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : IN  : BRANCH#configure terminal
<span class="hl">*Sep 30 02:14:06.630: %HA_EM-6-LOG: UPLINK-DOWN : DEBUG(cli_lib) : : OUT : Command authorization failed.</span></pre>

<h3>Do fixes</h3>
<table class="cmp"><tr><th></th><th>Session username</th><th>Authorization bypass</th></tr>
<tr><td>Command</td><td><code>event manager session cli username EEM-SVC</code> (global)</td><td><code>event manager applet NAME authorization bypass</code> (har applet ke liye)</td></tr>
<tr><td>Kaise kaam karta hai</td><td>EEM sessions EEM-SVC ki tarah login karte hain; TACACS+ us account ko authorize karta hai</td><td>Is applet ke CLI actions ke liye AAA command authorization skip hota hai</td></tr>
<tr><td>Audit trail</td><td>Commands TACACS+ accounting mein EEM-SVC ke naam se dikhte hain</td><td>Sirf local logs</td></tr>
<tr><td>Central control</td><td>Haan: security team decide karti hai EEM-SVC kya chala sakta hai</td><td>Nahi: applet kuch bhi chala sakta hai</td></tr></table>
<pre class="code">BRANCH(config)# event manager session cli username EEM-SVC
<span class="c">! ya, sirf ek applet ke liye:</span>
BRANCH(config)# event manager applet UPLINK-DOWN authorization bypass</pre>
<p>Zyada tar security teams session username prefer karti hain, aise TACACS+ profile ke saath jo sirf woh commands allow kare jo applets ko chahiye. Bypass lab ya bina central AAA policy wale box ke liye simple hai.</p>

<h3>EEM privileged code hai: ise bachao</h3>
<p>Applet koi bhi command, kabhi bhi, bina kisi ke logged in hue chala sakta hai. Yahi EEM ki taakat hai aur yahi uska risk. Applets ko code ki tarah treat karo: unhe golden configuration mein rakho, changes review karo, aur apne configuration-compliance tool se har unexpected <code>event manager applet</code> flag karwao. Anjaan applet jo, jaise, har ghante ek local user dobara banata hai, aisa persistence mechanism hai jo attacker ko bahut pasand aayega.</p>

<h3>Guard rails: maxrun, ratelimit aur saathi</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Guard rails">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">event fire</text>
<rect x="160" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="225" y="82" text-anchor="middle" class="svg-ink" font-size="13">ratelimit gate</text><text x="225" y="100" text-anchor="middle" class="svg-muted" font-size="12">N s mein ek baar</text>
<rect x="330" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="82" text-anchor="middle" class="svg-ink" font-size="13">actions chalte</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">maxrun timer</text>
<rect x="500" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="13">history</text><text x="565" y="100" text-anchor="middle" class="svg-muted" font-size="12">success/abort</text>
<line x1="120" y1="85" x2="160" y2="85" stroke="#64748b" stroke-width="2"/><line x1="290" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="460" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">ratelimit window ke andar extra triggers ignore hote hain</text>
</svg><p class="cap">Do built-in guard rails: run se pehle rate limit aur run ke dauraan run-time limit.</p></div>
<dl class="terms">
<dt>maxrun</dt><dd>Policy ka maximum run time, event line par set: <code>event syslog pattern "…" maxrun 60</code>. Applets ka default <b>20 second</b> hai; expire hone par applet abort ho jaata hai, actions ke beech mein bhi.</dd>
<dt>ratelimit</dt><dd>Ek run ke baad N second tak aur triggers ignore hote hain: <code>event syslog pattern "…" ratelimit 300</code>. Flap karte interface ke liye perfect jo warna darjanon runs chala deta.</dd>
<dt>occurs / period</dt><dd>Time window mein N matches ke baad hi fire (chapter 3).</dd>
<dt>history size</dt><dd><code>event manager history size events 50</code> troubleshooting ke liye zyada runs rakhta hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek data-collection applet <code>wait 10</code> chalata hai, phir lagbhag 2 second ke paanch show commands, phir mail action jo lagbhag 5 second leta hai. Total ≈ 10 + 10 + 5 = <b>25 second</b>, 20-second default se upar, isliye mail kabhi nahi jaata. Aaram ke margin ke liye <code>maxrun 60</code> set karo. Agar wahi trigger har kuch second mein repeat ho sakta hai, to <code>ratelimit 120</code> jodo taaki har do minute mein sirf ek collection chale.</p></div>

<h3>Reload action aur doosre dhaardaar tools</h3>
<p>Kabhi bhi applet ko aisi condition par router reload mat karne do jo reload ke baad bhi true ho sakti hai: router boot hota hai, condition phir dikhti hai, aur box hamesha reload hota rehta hai. Agar sach mein automatic reload chahiye, to use strict condition, file ya environment variable mein store counter, ratelimit, aur pehle chalne wale syslog action se gate karo taaki saboot bach jaaye.</p>

<div class="warn"><p><b>Common galti.</b> Bina AAA wale lab router par admin ki tarah applet test karna, phir production mein deploy karna jahan TACACS+ command authorization on hai. Syslog action kaam karta hai, isliye change successful lagta hai, par kuch configure nahi hota. Hamesha production jaisi AAA policy ke saath test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>authorization bypass</code> <code>event manager applet</code> line ka keyword hai, action nahi. <code>maxrun</code> aur <code>ratelimit</code> <code>event</code> line ke options hain. Applet ka default maxrun 20 second hai.</p></div>

<div class="scn"><h4>TACACS+ rollout ne har applet tod diya</h4><p>Ek manufacturing company ne ek weekend mein 300 routers par TACACS+ command authorization enable kiya. Monday ko ek plant ka primary WAN link gaya, aur backup enable karne wale EEM applet ne apna critical message log kiya par kuch nahi kiya. Same configuration wale lab router par <code>debug event manager action cli</code> ne "Command authorization failed" dikhaya. Security team ne TACACS+ par EEM-SVC account banaya jo sirf <code>interface</code>, <code>shutdown</code>, <code>no shutdown</code> aur kuch show commands ke liye allowed tha, aur saare routers par <code>event manager session cli username EEM-SVC</code> push kiya gaya.</p><p><b>Seekh:</b> jab AAA badle, EEM bhi ek user hai. Uske liye identity plan karo.</p></div>

<div class="iv"><p class="q">"EEM applet lab mein kaam karta hai par production mein, jahan TACACS+ command authorization on hai, uske CLI actions fail hote hain. Kyun, aur kaise fix karoge?"</p><p>Strong answer: EEM ke CLI session ka default mein koi username nahi hota, isliye command authorization har command reject karta hai. Globally <code>event manager session cli username EEM-SVC</code> aur restricted TACACS+ profile se fix karo, jo accounting bhi deta hai, ya har applet ke liye applet line par <code>authorization bypass</code> se. Main <code>debug event manager action cli</code> se verify karunga. Bonus: safety settings ki tarah maxrun (default 20 second) aur ratelimit bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EEM CLI sessions AAA command authorization se guzarte hain aur default mein unka koi username nahi hota.</li>
<li>Fix: <code>event manager session cli username NAME</code> (auditable) ya <code>event manager applet NAME authorization bypass</code>.</li>
<li>Applets bina nigrani privileged commands chalate hain: unhe code ki tarah review aur control karo.</li>
<li><code>maxrun</code> (default 20 s) lambe runs abort karta hai; <code>ratelimit N</code> run ke baad N second tak triggers ignore karta hai.</li>
<li>Strict gate ke bina <code>reload</code> actions se bacho; reboot loops sach mein hote hain.</li>
</ul></div>
`}};export{e as default};